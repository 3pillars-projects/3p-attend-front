import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';
import { AlertService } from '@/services/shared/alert.service';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { map, Observable } from 'rxjs';
import { RequiredMarkerDirective } from '../../../../directives/required-marker.directive';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { ConfirmationService } from '@/services/shared/confirmation.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { LIMITED_TIME_PERMISSION_TYPES_ENUM } from '@/enums/limited-time-permission-types-enum';
import { LIMITED_TIME_PERMISSION_STATUS_ENUM } from '@/enums/limited-time-permission-status-enum';

@Component({
  selector: 'app-add-edit-limited-time-permission-popup',
  imports: [
    TranslatePipe,
    DatePickerModule,
    FormsModule,
    TextareaModule,
    InputTextModule,
    Select,
    InputNumber,
    CommonModule,
    ReactiveFormsModule,
    ValidationMessagesComponent,
    RequiredMarkerDirective,
  ],
  templateUrl: './add-edit-limited-time-permission-popup.component.html',
  styleUrl: './add-edit-limited-time-permission-popup.component.scss',
})
export class AddEditLimitedTimePermissionPopupComponent
  extends BasePopupComponent<LimitedTimePermission>
  implements OnInit
{
  declare model: LimitedTimePermission;
  declare form: FormGroup;

  alertService = inject(AlertService);
  service = inject(LimitedTimePermissionService);
  fb = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);

  permissionTypes: BaseLookupModel[] | undefined = [];
  employees: BaseLookupModel[] = [];
  data = inject(MAT_DIALOG_DATA);
  isCreateMode = false;
  // Manager/HR creating for an employee (fkUserId): past dates allowed, created as Accepted
  isForEmployee = false;
  // Employees can only request permissions that start in the future
  minPermissionDate: Date | null = null;
  showStatusResetNote = false;
  isSaving = false;

  // Constants for permission type IDs
  permissionTypesEnum = LIMITED_TIME_PERMISSION_TYPES_ENUM; // "اثناء الوردية" / "Mid-Shift"

  override saveFail(error: Error): void {
    // The global interceptor shows the server error; keep entered values and re-enable save
    this.isSaving = false;
  }

  override prepareModel(
    model: LimitedTimePermission,
    form: FormGroup
  ): LimitedTimePermission | Observable<LimitedTimePermission> {
    this.isSaving = true;
    this.model = Object.assign(model, { ...form.value });
    return this.model;
  }

  override initPopup() {
    this.model = this.data.model;
    this.permissionTypes = this.data.lookups.permissionTypes;
    this.isCreateMode = this.data.viewMode == ViewModeEnum.CREATE;
    this.isForEmployee = this.isCreateMode && !!this.data.lookups.employees;
    this.employees = this.data.lookups.employees ?? [];

    if (this.isCreateMode && !this.isForEmployee) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.minPermissionDate = today;
    }

    // Owner edits of an approved permission return it to New; manager/HR edits keep the status
    this.showStatusResetNote =
      !this.isCreateMode &&
      !this.data.fromIncoming &&
      (this.model.fkStatusId === LIMITED_TIME_PERMISSION_STATUS_ENUM.Accepted ||
        this.model.fkStatusId === LIMITED_TIME_PERMISSION_STATUS_ENUM.FirstAccepted);
  }

  override buildForm() {
    this.form = this.fb.group(this.model.buildForm());
    if (this.isForEmployee) {
      this.fkUserIdControl.setValidators([Validators.required]);
      this.fkUserIdControl.updateValueAndValidity();
    }
    // Subscribe to permission type changes
    this.setupPermissionTypeListener();
  }

  private setupPermissionTypeListener() {
    // Apply to the initial type too, so editing a mid-shift permission still requires the start time
    this.applyTimeFromRule(this.fkLimitedTimePermissionTypeIdControl.value);
    this.fkLimitedTimePermissionTypeIdControl.valueChanges.subscribe((typeId: number) =>
      this.applyTimeFromRule(typeId)
    );
  }

  private applyTimeFromRule(typeId: number) {
    if (typeId === this.permissionTypesEnum.MidShift) {
      // Mid-shift: start time is required
      this.limitedTimePermissionTimeFromControl.setValidators([Validators.required]);
    } else {
      // Other types: the server ignores the start time and stores null
      this.limitedTimePermissionTimeFromControl.clearValidators();
      this.limitedTimePermissionTimeFromControl.setValue(null, { emitEvent: false });
    }
    this.limitedTimePermissionTimeFromControl.updateValueAndValidity();
  }

  // Helper method to check if time picker should be shown
  shouldShowTimePicker(): boolean {
    return this.fkLimitedTimePermissionTypeIdControl?.value === this.permissionTypesEnum.MidShift;
  }

  // Override beforeSave to add confirmation for MidShift
  override beforeSave(
    model: LimitedTimePermission,
    form: FormGroup
  ): Observable<boolean> | boolean {
    // Check if form is valid first
    if (!form.valid) {
      return false;
    }

    // Check if the selected permission type is MidShift
    const selectedTypeId = this.fkLimitedTimePermissionTypeIdControl.value;
    if (selectedTypeId === this.permissionTypesEnum.MidShift) {
      // Show confirmation dialog for MidShift
      return this.showMidShiftConfirmation();
    }

    // For other types, proceed normally
    return true;
  }

  private showMidShiftConfirmation(): Observable<boolean> {
    const dialogRef = this.confirmationService.open({
      icon: 'warning',
      messages: ['COMMON.MID_SHIFT_SUBMIT_CONFIRMATION'],
      confirmText: 'COMMON.OK',
      cancelText: 'COMMON.CANCEL',
    });

    return dialogRef.afterClosed().pipe(
      map((result) => {
        // Return true if user clicked OK, false if canceled
        return result === DIALOG_ENUM.OK;
      })
    );
  }

  afterSave() {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }

  getPropertyName() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }

  get fkUserIdControl() {
    return this.form.get('fkUserId') as FormControl;
  }

  get fkLimitedTimePermissionTypeIdControl() {
    return this.form.get('fkLimitedTimePermissionTypeId') as FormControl;
  }

  get limitedTimePermissionDateControl() {
    return this.form.get('limitedTimePermissionDate') as FormControl;
  }

  get limitedTimePermissionDurationControl() {
    return this.form.get('limitedTimePermissionDuration') as FormControl;
  }

  get limitedTimePermissionTimeFromControl() {
    return this.form.get('limitedTimePermissionTimeFrom') as FormControl;
  }

  get limitedTimePermissionReasonControl() {
    return this.form.get('limitedTimePermissionReason') as FormControl;
  }
}
