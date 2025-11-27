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
  Validators,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import Shift from '@/models/features/lookups/work-shifts/shift';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { filter, Observable, switchMap } from 'rxjs';
import { ShiftService } from '@/services/features/lookups/shift.service';
import { AlertService } from '@/services/shared/alert.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RequiredMarkerDirective } from '../../../../../directives/required-marker.directive';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { CustomValidators } from '@/validators/custom-validators';
import { InputNumberModule } from 'primeng/inputnumber';
import { dateToTimeString, formatDateTo12Hour, toDateOnly } from '@/utils/general-helper';
import { ConfirmationService } from '@/services/shared/confirmation.service';
import { CONFIRMATION_DIALOG_ICONS_ENUM } from '@/enums/confirmation-dialog-icons-enum';
import { ConfigService } from '@/services/config.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';

@Component({
  selector: 'app-work-shifts-list-popup',
  imports: [
    DatePickerModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    ValidationMessagesComponent,
    TranslatePipe,
    RequiredMarkerDirective,
    InputNumberModule,
  ],
  templateUrl: './work-shifts-list-popup.component.html',
  styleUrl: './work-shifts-list-popup.component.scss',
})
export class WorkShiftsListPopupComponent extends BasePopupComponent<Shift> implements OnInit {
  configService = inject(ConfigService);
  minBeforeBuffer = +this.configService.CONFIG.MIN_BEFORE_BUFFER;
  minAfterBuffer = +this.configService.CONFIG.MIN_AFTER_BUFFER;
  maxBeforeBuffer = +this.configService.CONFIG.MAX_BEFORE_BUFFER;
  maxAfterBuffer = +this.configService.CONFIG.MAX_AFTER_BUFFER;
  dayBoundaryMinutes = +this.configService.CONFIG.DAY_BOUNDARY_BEFORE_START_SHIFT_TIME_WITH;
  declare model: Shift;
  declare form: FormGroup;
  alertService = inject(AlertService);
  service = inject(ShiftService);
  fb = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  isCreateMode = false;
  matDialog = inject(MatDialog);
  editableControlsInEditMode = ['nameAr', 'nameEn', 'isDefaultShiftForm', 'shiftLogStartDate'];
  isSaveAndActivateClicked = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    super();
  }

  get nameArControl() {
    return this.form.get('nameAr') as FormControl;
  }

  get nameEnControl() {
    return this.form.get('nameEn') as FormControl;
  }

  get timeFromControl() {
    return this.form.get('timeFrom') as FormControl;
  }

  get timeToControl() {
    return this.form.get('timeTo') as FormControl;
  }

  get boundaryTimeControl() {
    return this.form.get('boundaryTime') as FormControl;
  }

  get startAttendanceBufferControl() {
    return this.form.get('startAttendanceBuffer') as FormControl;
  }

  get endAttendanceBufferControl() {
    return this.form.get('endAttendanceBuffer') as FormControl;
  }

  get startLeaveBufferControl() {
    return this.form.get('startLeaveBuffer') as FormControl;
  }

  get endLeaveBufferControl() {
    return this.form.get('endLeaveBuffer') as FormControl;
  }

  get shiftLogStartDateControl() {
    return this.form.get('shiftLogStartDate') as FormControl;
  }

  get isFlexibleShiftControl() {
    return this.form.get('isFlexibleShift') as FormControl;
  }

  listenToIsFlexibleShiftChange() {
    this.isFlexibleShiftControl.valueChanges.subscribe((isFlexibleShiftChange) => {
      if (isFlexibleShiftChange) {
        this.setLeaveBuffersToAttendanceBuffers();
        this.disableLeaveBuffers();
      } else {
        this.enableLeaveBuffers();
      }
    });
  }

  listenToAttendanceBuffersChange() {
    this.startAttendanceBufferControl.valueChanges.subscribe((val) => {
      if (this.isFlexibleShiftControl.value) {
        this.startLeaveBufferControl.setValue(val);
      }
    });

    this.endAttendanceBufferControl.valueChanges.subscribe((val) => {
      if (this.isFlexibleShiftControl.value) {
        this.endLeaveBufferControl.setValue(val);
      }
    });
  }

  setLeaveBuffersToAttendanceBuffers() {
    const startAttendanceBuffer = this.startAttendanceBufferControl.value;
    const endAttendanceBuffer = this.endAttendanceBufferControl.value;
    this.startLeaveBufferControl.setValue(startAttendanceBuffer);
    this.endLeaveBufferControl.setValue(endAttendanceBuffer);
  }

  disableLeaveBuffers() {
    this.startLeaveBufferControl.disable();
    this.endLeaveBufferControl.disable();
  }

  enableLeaveBuffers() {
    this.startLeaveBufferControl.enable();
    this.endLeaveBufferControl.enable();
  }

  get canActivateShift(): boolean {
    const rawShiftDate = this.form.get('shiftLogStartDate')?.value;
    const rawActiveShiftDate = this.model.activeShiftStartDate;

    if (!rawShiftDate) {
      return false;
    }

    const shiftDate = new Date(toDateOnly(rawShiftDate));
    const today = new Date(toDateOnly(new Date()));

    // Check if user changed the date compared to the original value from backend
    const originalShiftDate = this.model.shiftLogStartDate
      ? new Date(toDateOnly(this.model.shiftLogStartDate))
      : null;

    const isDateChanged =
      originalShiftDate !== null && shiftDate.getTime() !== originalShiftDate.getTime();

    const result =
      !this.model.isActive &&
      this.model.id != null &&
      this.model.shiftLogId != null &&
      shiftDate <= today &&
      (!rawActiveShiftDate || shiftDate > new Date(toDateOnly(rawActiveShiftDate))) &&
      // NEW: only allow if date wasn't changed in update mode
      (!isDateChanged || this.isCreateMode);

    return result;
  }

  get canSaveAndActivateShift(): boolean {
    const rawShiftDate = this.form.get('shiftLogStartDate')?.value;
    const today = new Date(toDateOnly(new Date()));

    // Basic requirements for both modes
    const basicRequirements =
      this.form.valid &&
      this.form.get('isDefaultShiftForm')?.value === true &&
      rawShiftDate &&
      this.form.get('shiftLogStartDate')?.valid;

    if (!basicRequirements) {
      return false;
    }

    const shiftDate = new Date(toDateOnly(rawShiftDate));

    // Show button only if shift date is today or before today (hide if future date)
    const isDateTodayOrBefore = shiftDate <= today;

    if (this.isCreateMode) {
      return isDateTodayOrBefore;
    }

    // For update mode, same date logic + model must not be active
    return !this.model.isActive && isDateTodayOrBefore;
  }

  saveAndActivateShift() {
    this.form.get('isActive')?.setValue(true);
    this.isSaveAndActivateClicked = true;
    this.save$.next();
  }
  override initPopup(): void {
    this.model = this.data.model;
    this.isCreateMode = this.data.viewMode == ViewModeEnum.CREATE;
  }

  override buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(), {
      validators: [
        CustomValidators.crossDateTimeValidator('timeFrom', 'timeTo', 'isCrossDayShift'),
        this.crossDateShiftEndNotPassNextDayStart(),
      ],
    });

    if (!this.isCreateMode) {
      Object.keys(this.form.controls).forEach((key) => {
        if (!this.editableControlsInEditMode.includes(key)) {
          this.form.get(key)?.disable({ emitEvent: false });
        }
      });

      if (this.model.isActive) {
        this.form.get('isDefaultShiftForm')?.disable({ emitEvent: false });
        this.form.get('shiftLogStartDate')?.disable({ emitEvent: false });
      }
    }

    // Only attach valueChanges logic if not locked
    if (!this.model.shiftLogId) {
      this.form.get('isDefaultShiftForm')?.valueChanges.subscribe((isDefault: boolean) => {
        const shiftLogStartDateControl = this.form.get('shiftLogStartDate');
        if (isDefault) {
          shiftLogStartDateControl?.setValidators([Validators.required]);
          shiftLogStartDateControl?.enable({ emitEvent: false });
        } else {
          shiftLogStartDateControl?.clearValidators();
          shiftLogStartDateControl?.setValue(null);
          shiftLogStartDateControl?.disable({ emitEvent: false });
        }
        shiftLogStartDateControl?.updateValueAndValidity();
      });
    }

    // Subscribe to shiftLogStartDate changes and set isActive
    this.form.get('shiftLogStartDate')?.valueChanges.subscribe((dateValue) => {
      if (dateValue) {
        this.form.patchValue({ isActive: false }, { emitEvent: false });
      }
    });

    this.isCrossDayShiftControl.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });

    this.listenToIsFlexibleShiftChange();
    this.listenToAttendanceBuffersChange();
  }

  crossDateShiftEndNotPassNextDayStart(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      let isCrossDayShift = !!form.get('isCrossDayShift')!.value;

      let from = form.get('timeFrom')?.value ? new Date(form.get('timeFrom')?.value) : null;
      let bufferBeforeStart = form.get('startAttendanceBuffer')?.value || 0;

      let to = form.get('timeTo')?.value ? new Date(form.get('timeTo')?.value) : null;
      let bufferAfterEnd = form.get('endLeaveBuffer')?.value || 0;

      if (!from || !to) {
        return null;
      }

      from.setSeconds(0, 0);
      to.setSeconds(0, 0);

      // Add day if needed
      if (isCrossDayShift) {
        to.setDate(to.getDate() + 1);
      }

      from.setMinutes(from.getMinutes() - bufferBeforeStart);
      to.setMinutes(to.getMinutes() + bufferAfterEnd);

      let diffMs = to.getTime() - from.getTime();

      const totalMinutes = Math.floor(diffMs / 60000); // ignore seconds
      if (totalMinutes > 24 * 60) {
        return { invalidShiftConfiguration: true };
      }

      return null;
    };
  }

  get isCrossDayShiftControl() {
    return this.form.get('isCrossDayShift') as FormControl;
  }

  override saveFail(error: any): void {
    if (this.isSaveAndActivateClicked) {
      this.isSaveAndActivateClicked = false;
      this.model.isActive = false;
      this.form.get('isActive')?.setValue(false);
    }
  }

  override beforeSave(model: Shift, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  override afterSave() {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }

  override prepareModel(model: Shift, form: FormGroup): Shift | Observable<Shift> {
    const formValue = { ...form.getRawValue() }; // Changed from form.value to form.getRawValue()

    // Only send shiftLogStartDate if isDefaultShiftForm is true
    if (!form.get('isDefaultShiftForm')?.value) {
      formValue.shiftLogStartDate = null;
    }

    return Object.assign(model, {
      ...formValue,
      timeFrom: dateToTimeString(formValue.timeFrom),
      timeTo: dateToTimeString(formValue.timeTo),
      boundaryTime: dateToTimeString(formValue.boundaryTime),
    });
  }

  activateShift(): void {
    // Early return if model or required data is missing
    if (!this.model?.id) {
      this.alertService.showErrorMessage({
        messages: ['COMMON.SERVER_INVALID_OPERATION'],
      });
      return;
    }

    const confirmMessage = this.buildConfirmationMessage();

    const confirmationData = {
      icon: CONFIRMATION_DIALOG_ICONS_ENUM.WARNING.toString(),
      messages: [confirmMessage],
    };

    this.shiftLogStartDateControl.valid &&
      this.confirmationService
        .open(confirmationData)
        .afterClosed()
        .pipe(
          filter((result) => result === DIALOG_ENUM.OK),
          switchMap(() => this.performShiftActivation())
        )
        .subscribe({
          next: () => {
            this.alertService.showSuccessMessage({
              messages: ['WORK_SHIFTS_POPUP.ACTIVATED_SUCCESSFULLY'],
            });
            this.dialogRef.close(DIALOG_ENUM.OK);
          },
          error: (error) => this.handleActivationError(error),
        });
  }

  private buildConfirmationMessage(): string {
    const formattedDate = this.formatShiftDate();
    return this.translateService.instant('WORK_SHIFTS_POPUP.ACTIVATION_CONFIRM', {
      date: formattedDate,
    });
  }

  private formatShiftDate(): string {
    if (!this.model.shiftLogStartDate) {
      return this.translateService.instant('COMMON.SERVER_INVALID_OPERATION');
    }

    return new Date(this.model.shiftLogStartDate).toLocaleDateString('en-GB');
  }

  private performShiftActivation(): Observable<any> {
    const preparedModel = this.prepareModel(this.model, this.form) as Shift;
    preparedModel.isActive = true;

    return this.service.activateShift(preparedModel, this.model.id);
  }

  private handleActivationError(error: any): void {
    this.alertService.showErrorMessage({
      messages: ['WORK_SHIFTS_POPUP.ACTIVATION_FAILED'],
    });
  }

  updateShiftMainData() {
    this.form.get('isUpdateOnly')?.setValue(true);

    if (
      this.model.isAvailableDefaultShift &&
      this.form.get('isDefaultShiftForm')?.value &&
      this.model.id != this.model.defaultShiftId &&
      !this.model.isActive
    ) {
      const confirmMessage = this.translateService.instant(
        'WORK_SHIFTS_POPUP.NEW_DEFAULT_SHIFT_TO_BE_ADDED'
      );
      const confirmationData = {
        icon: CONFIRMATION_DIALOG_ICONS_ENUM.WARNING.toString(),
        messages: [confirmMessage],
      };

      this.confirmationService
        .open(confirmationData)
        .afterClosed()
        .pipe(filter((result) => result === DIALOG_ENUM.OK))
        .subscribe((_) => this.save$.next());
    } else {
      this.save$.next();
    }
  }

  getShiftDuration() {
    if (!this.timeFromControl.value || !this.timeToControl.value) {
      return '';
    }

    let from = new Date(this.timeFromControl.value);
    let to = new Date(this.timeToControl.value);

    // 🔥 FIX: Remove seconds + milliseconds
    from.setSeconds(0, 0);
    to.setSeconds(0, 0);

    if (from > to && !this.isCrossDayShiftControl.value) {
      return '';
    }

    if (from < to && this.isCrossDayShiftControl.value) {
      return '';
    }

    // Add day if needed
    if (this.isCrossDayShiftControl.value) {
      to.setDate(to.getDate() + 1);
    }

    let diffMs = to.getTime() - from.getTime();

    const totalMinutes = Math.floor(diffMs / 60000); // ignore seconds
    if (totalMinutes < 0) {
      return '';
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')}`;
  }

  getDayBoundaryTime() {
    const dayMinutesCount = 24 * 60;
    if (!this.timeFromControl.value || !this.timeToControl.value) {
      this.boundaryTimeControl.setValue('');
      return '';
    }

    let from = new Date(this.timeFromControl.value);
    let to = new Date(this.timeToControl.value);

    if (from > to && !this.isCrossDayShiftControl.value) {
      this.boundaryTimeControl.setValue('');
      return '';
    }

    if (from < to && this.isCrossDayShiftControl.value) {
      this.boundaryTimeControl.setValue('');
      return '';
    }

    let beforeFrom = +this.startAttendanceBufferControl.value || 0;
    let afterTo = +this.endLeaveBufferControl.value || 0;

    // 🔥 FIX: Remove seconds + milliseconds
    from.setSeconds(0, 0);
    to.setSeconds(0, 0);

    // Add day if needed
    if (this.isCrossDayShiftControl.value) {
      to.setDate(to.getDate() + 1);
    }

    let diffMs = to.getTime() - from.getTime();

    const totalMinutes = Math.floor(diffMs / 60000); // ignore seconds
    const totalWithGracePeriods = totalMinutes + beforeFrom + afterTo;

    if (totalWithGracePeriods > dayMinutesCount) {
      this.boundaryTimeControl.setValue('');
      return '';
    }

    const nonShiftMinutes = dayMinutesCount - totalWithGracePeriods;
    let boundaryTime = from;

    if (nonShiftMinutes > this.dayBoundaryMinutes * 2) {
      boundaryTime.setMinutes(from.getMinutes() - this.dayBoundaryMinutes);
      this.boundaryTimeControl.setValue(boundaryTime);
      return formatDateTo12Hour(boundaryTime, this.translateService.currentLang as LANGUAGE_ENUM);
    }

    boundaryTime.setMinutes(from.getMinutes() - beforeFrom - Math.floor(nonShiftMinutes / 2));

    this.boundaryTimeControl.setValue(boundaryTime);
    return formatDateTo12Hour(boundaryTime, this.translateService.currentLang as LANGUAGE_ENUM);
  }
}
