import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import UserWorkShift from '@/models/features/lookups/work-shifts/user-work-shifts';
import { Observable } from 'rxjs';
import { AlertService } from '@/services/shared/alert.service';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { TranslatePipe } from '@ngx-translate/core';
import { RequiredMarkerDirective } from '../../../../../directives/required-marker.directive';
import { UsersWithDepartmentLookup } from '@/models/auth/users-department-lookup';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import Shift from '@/models/features/lookups/work-shifts/shift';
import { WeekDaysEnum } from '@/enums/week-days-enum';
import { weekDays } from '@/utils/general-helper';
import { WorkDaysSetting } from '@/models/features/setting/work-days-setting';
import { UserWorkShiftService } from '@/services/features/lookups/user-workshift.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';

@Component({
  selector: 'app-work-shifts-assignment-popup',
  imports: [
    FormsModule,
    Select,
    DatePickerModule,
    ReactiveFormsModule,
    RequiredMarkerDirective,
    TranslatePipe,
    ValidationMessagesComponent,
  ],
  templateUrl: './work-shifts-assignment-popup.component.html',
  styleUrl: './work-shifts-assignment-popup.component.scss',
})
export class WorkShiftsAssignmentPopupComponent
  extends BasePopupComponent<UserWorkShift>
  implements OnInit
{
  model!: UserWorkShift;
  usersProfiles: UsersWithDepartmentLookup[] = [];
  workDays: WorkDaysSetting = new WorkDaysSetting();
  filteredUsersProfiles: UsersWithDepartmentLookup[] = [];
  departments: BaseLookupModel[] = [];
  shifts: Shift[] = [];
  form!: FormGroup;
  viewMode!: ViewModeEnum;
  fb = inject(FormBuilder);
  alertService = inject(AlertService);
  langService = inject(LanguageService);
  isCreateMode = false;
  selectedWorkingDays: number[] = [];
  userWorkShiftService = inject(UserWorkShiftService);

  // Date constraints
  minEndDate: Date | null = null;
  maxStartDate: Date | null = null;

  // ✅ cache allowed weekdays for the current range (Fix 1 support + performance)
  allowedWeekDaysInRange: number[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    super();
  }

  override initPopup(): void {
    this.model = this.data.model || new UserWorkShift();
    this.usersProfiles = this.data.lookups?.usersProfiles || [];
    this.departments = this.data.lookups?.departments || [];
    this.shifts = this.data.lookups?.shifts || [];
    this.viewMode = this.data.viewMode;
    this.isCreateMode = this.viewMode === ViewModeEnum.CREATE;

    this.usersProfiles = this.sortByName(this.usersProfiles, this.optionLabel);
    this.filteredUsersProfiles = this.usersProfiles;
    this.departments = this.sortByName(this.departments, this.optionLabel);
    this.shifts = this.sortByName(this.shifts, this.optionLabel);

    if (this.isCreateMode) {
      // this.workDays = this.data.lookups?.defaultWorkDays[0]!;
      this.initializeSelectedWorkingDays();
    } else {
      this.initializeSelectedWorkingDays();
      this.preFilterEmployeesForEditMode();
    }
  }

  private initializeSelectedWorkingDays(): void {
    this.selectedWorkingDays = [];

    if (this.model.employeeWorkingDays) {
      this.selectedWorkingDays = this.model.employeeWorkingDays
        .split(',')
        .map((day) => parseInt(day.trim(), 10))
        .filter((day) => !isNaN(day));
    } else if (this.workDays) {
      const mapping: { [key: string]: WeekDaysEnum } = {
        saturday: WeekDaysEnum.SATURDAY,
        sunday: WeekDaysEnum.SUNDAY,
        monday: WeekDaysEnum.MONDAY,
        tuesday: WeekDaysEnum.TUESDAY,
        wednesday: WeekDaysEnum.WEDNESDAY,
        thursday: WeekDaysEnum.THURSDAY,
        friday: WeekDaysEnum.FRIDAY,
      };

      this.selectedWorkingDays = Object.entries(mapping)
        .filter(([key]) => (this.workDays as any)[key])
        .map(([, value]) => value);
    }

    this.selectedWorkingDays.sort((a, b) => a - b);
  }

  override buildForm(): void {
    this.form = this.fb.group({
      ...this.model.buildForm(),
      employeeWorkingDays: [this.selectedWorkingDays.join(','), [this.validateWorkingDays()]],
      departmentId: [null],
    });

    this.setDropdownValues();
    this.updateDateConstraints();

    // ✅ initialize cache once form is ready
    this.refreshAllowedWeekDays(
      (this.form.get('startDate')?.value as Date | null) ?? null,
      (this.form.get('endDate')?.value as Date | null) ?? null
    );
  }

  private preFilterEmployeesForEditMode(): void {
    if (!this.isCreateMode && this.model.fkAssignedUserId) {
      const selectedEmployee = this.usersProfiles.find((emp) => emp.id === this.model.fkAssignedUserId);
      if (selectedEmployee?.departmentId) {
        this.filteredUsersProfiles = this.usersProfiles.filter(
          (emp) => emp.departmentId === selectedEmployee.departmentId
        );
      }
    }
  }

  private setDropdownValues(): void {
    if (!this.isCreateMode) {
      if (this.model.fkShiftId) {
        this.form.get('fkShiftId')?.setValue(this.model.fkShiftId);
      }

      if (this.model.fkAssignedUserId) {
        const selectedEmployee = this.usersProfiles.find((emp) => emp.id === this.model.fkAssignedUserId);
        if (selectedEmployee) {
          this.form.get('fkAssignedUserId')?.setValue(selectedEmployee.id);

          if (selectedEmployee.departmentId) {
            this.form.get('departmentId')?.setValue(selectedEmployee.departmentId);
            this.filterEmployeesByDepartment(selectedEmployee.departmentId);
          }
        }
      }

      if (this.model.startDate) {
        const startDate =
          typeof this.model.startDate === 'string'
            ? new Date(this.model.startDate)
            : this.model.startDate;
        this.form.get('startDate')?.setValue(startDate);
      }

      if (this.model.endDate) {
        const endDate =
          typeof this.model.endDate === 'string'
            ? new Date(this.model.endDate)
            : this.model.endDate;
        this.form.get('endDate')?.setValue(endDate);
      }

      // ✅ refresh cache after setting edit-mode values
      this.refreshAllowedWeekDays(
        (this.form.get('startDate')?.value as Date | null) ?? null,
        (this.form.get('endDate')?.value as Date | null) ?? null
      );
    }
  }

  onWorkingDayChange(dayValue: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedWorkingDays.includes(dayValue)) this.selectedWorkingDays.push(dayValue);
    } else {
      this.selectedWorkingDays = this.selectedWorkingDays.filter((day) => day !== dayValue);
    }

    this.selectedWorkingDays.sort((a, b) => a - b);
    this.updateEmployeeWorkingDaysInForm();
    this.form.get('employeeWorkingDays')?.markAsTouched();
  }

  private validateWorkingDays(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const selectedDays = value.split(',').filter((day: string) => day.trim() !== '');
      return selectedDays.length === 0 ? { required: true } : null;
    };
  }

  private updateEmployeeWorkingDaysInForm(): void {
    const workingDaysString = this.selectedWorkingDays.join(',');
    this.form.get('employeeWorkingDays')?.setValue(workingDaysString);
    this.form.get('employeeWorkingDays')?.updateValueAndValidity();
  }

  onSaveClick(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });

    if (this.form.valid) {
      this.prepareModel(this.model, this.form);

      if (this.model.id) {
        this.userWorkShiftService.update(this.model).subscribe({
          next: () => this.dialogRef.close(DIALOG_ENUM.OK),
          error: (err) => this.save$.error(err),
        });
      } else {
        this.userWorkShiftService.assignUserShift(this.model).subscribe({
          next: () => this.dialogRef.close(DIALOG_ENUM.OK),
          error: (err) => this.save$.error(err),
        });
      }
    }
  }

  isWorkingDaySelected(dayValue: number): boolean {
    return this.selectedWorkingDays.includes(dayValue);
  }

  // ✅ FIX 1: now this only checks cached days (no form reads, no range calc)
  isWeekDayDisabled(dayValue: number): boolean {
    if (!this.allowedWeekDaysInRange.length) return false;
    return !this.allowedWeekDaysInRange.includes(dayValue);
  }

  // ✅ called by your (onSelect) handlers using the NEW selected date + other control
  private refreshAllowedWeekDays(startDate: Date | null, endDate: Date | null): void {
    if (!startDate || !endDate) {
      this.allowedWeekDaysInRange = [];
      return;
    }
    this.allowedWeekDaysInRange = this.getAllowedWeekDaysInRange(startDate, endDate);
  }

  private getAllowedWeekDaysInRange(startDate: Date, endDate: Date): number[] {
    const allowedDays = new Set<number>();

    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    // ✅ normalize to date-only (midnight)
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (currentDate <= end) {
      allowedDays.add(currentDate.getDay());
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return Array.from(allowedDays);
  }

  override saveFail(error: Error): void {}

  override afterSave(model: UserWorkShift, dialogRef: MatDialogRef<any, any>): void {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }

  override beforeSave(model: UserWorkShift, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  override prepareModel(
    model: UserWorkShift,
    form: FormGroup
  ): UserWorkShift | Observable<UserWorkShift> {
    const formValue = form.value;

    this.model.startDate = formValue.startDate;
    this.model.endDate = formValue.endDate;
    this.model.employeeWorkingDays = formValue.employeeWorkingDays;
    this.model.fkAssignedUserId = formValue.fkAssignedUserId;
    this.model.fkShiftId = formValue.fkShiftId;

    return this.model;
  }

  private sortByName<T extends { [key: string]: any }>(arr: T[], key: string): T[] {
    return [...arr].sort((a, b) => {
      const nameA = (a[key] || '').toString().toLowerCase();
      const nameB = (b[key] || '').toString().toLowerCase();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }

  getCurrentLanguage() {
    return this.langService.getCurrentLanguage();
  }

  get optionLabel(): string {
    return this.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  onDepartmentChange(event: any) {
    const departmentId = event.value;

    if (departmentId) {
      this.filterEmployeesByDepartment(departmentId);
    } else {
      this.filteredUsersProfiles = [...this.usersProfiles];
    }
  }

  filterEmployeesByDepartment(departmentId: number | any) {
    const actualDepartmentId =
      typeof departmentId === 'object' && departmentId?.id ? departmentId.id : departmentId;

    this.filteredUsersProfiles = this.usersProfiles.filter(
      (emp) => emp.departmentId === actualDepartmentId
    );

    if (this.form) {
      const selectedEmployeeId = this.form.get('fkAssignedUserId')?.value;

      if (selectedEmployeeId) {
        const selectedEmployee = this.usersProfiles.find((emp) => emp.id === selectedEmployeeId);

        if (selectedEmployee && selectedEmployee.departmentId !== actualDepartmentId) {
          this.form.get('fkAssignedUserId')?.setValue(null);
          this.form.get('fkAssignedUserId')?.markAsTouched();
        }
      }
    }
  }

  // ✅ FIX 1: treat selectedDate as the NEW value (don’t read startDate from form here)
  onStartDateSelect(selectedDate: Date): void {
    const newStartDate = selectedDate ?? null;

    this.minEndDate = newStartDate ? new Date(newStartDate) : null;

    const endDate = (this.form.get('endDate')?.value as Date | null) ?? null;

    // if end is before new start -> clear end
    if (newStartDate && endDate && new Date(endDate) < newStartDate) {
      this.form.get('endDate')?.setValue(null);
    }

    const effectiveEndDate =
      newStartDate && endDate && new Date(endDate) < newStartDate ? null : endDate;

    // ✅ compute allowed days using NEW start + current end (or null if cleared)
    this.refreshAllowedWeekDays(newStartDate, effectiveEndDate);

    // ✅ remove invalid selected working days using the same effective range
    this.validateAndUpdateWorkingDays_WithDates(newStartDate, effectiveEndDate);
  }

  // ✅ FIX 1: treat selectedDate as the NEW value (don’t read endDate from form here)
  onEndDateSelect(selectedDate: Date): void {
    const newEndDate = selectedDate ?? null;

    this.maxStartDate = newEndDate ? new Date(newEndDate) : null;

    const startDate = (this.form.get('startDate')?.value as Date | null) ?? null;

    // if start is after new end -> clear start
    if (newEndDate && startDate && new Date(startDate) > newEndDate) {
      this.form.get('startDate')?.setValue(null);
    }

    const effectiveStartDate =
      newEndDate && startDate && new Date(startDate) > newEndDate ? null : startDate;

    // ✅ compute allowed days using current start (or null if cleared) + NEW end
    this.refreshAllowedWeekDays(effectiveStartDate, newEndDate);

    // ✅ remove invalid selected working days using the same effective range
    this.validateAndUpdateWorkingDays_WithDates(effectiveStartDate, newEndDate);
  }

  // ✅ Fix 1 safe: don’t re-read form inside same tick; use passed dates
  private validateAndUpdateWorkingDays_WithDates(startDate: Date | null, endDate: Date | null): void {
    if (!startDate || !endDate) return;

    const allowedDays = this.getAllowedWeekDaysInRange(startDate, endDate);

    this.selectedWorkingDays = this.selectedWorkingDays.filter((day) => allowedDays.includes(day));

    this.updateEmployeeWorkingDaysInForm();
  }

  private updateDateConstraints(): void {
    const startDate = (this.form.get('startDate')?.value as Date | null) ?? null;
    const endDate = (this.form.get('endDate')?.value as Date | null) ?? null;

    this.minEndDate = startDate ? new Date(startDate) : null;
    this.maxStartDate = endDate ? new Date(endDate) : null;
  }

  get fkShiftIdControl() {
    return this.form.get('fkShiftId') as FormControl;
  }
  get startDateControl() {
    return this.form.get('startDate') as FormControl;
  }
  get endDateControl() {
    return this.form.get('endDate') as FormControl;
  }
  get fkAssignedUserIdControl() {
    return this.form.get('fkAssignedUserId') as FormControl;
  }
  get employeeWorkingDaysControl() {
    return this.form.get('employeeWorkingDays') as FormControl;
  }

  weekDays = weekDays;
}
