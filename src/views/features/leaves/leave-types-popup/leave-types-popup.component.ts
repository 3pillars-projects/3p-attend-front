import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { AlertService } from '@/services/shared/alert.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { LeaveType } from '@/models/features/business/leave-types/leave-type';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import {
  LeaveTypeStatusOption,
  LEAVE_TYPE_STATUS_OPTIONS,
} from '@/models/shared/leave-type-status-option';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { GENDER_ENUM } from '@/enums/gender-enum';
import { RELIGION_ENUM } from '@/enums/religion-enum';
import { RequiredMarkerDirective } from '../../../../directives/required-marker.directive';

@Component({
  selector: 'app-leave-types-popup',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    InputNumberModule,
    TranslatePipe,
    FormsModule,
    RequiredMarkerDirective,
  ],
  templateUrl: './leave-types-popup.component.html',
  styleUrl: './leave-types-popup.component.scss',
})
export class LeaveTypesPopupComponent extends BasePopupComponent<LeaveType> implements OnInit {
  model!: LeaveType;
  form!: FormGroup;
  isCreateMode = false;
  viewMode!: ViewModeEnum;
  alertService = inject(AlertService);
  fb = inject(FormBuilder);
  data = inject(MAT_DIALOG_DATA);
  leaveTypeStatusOptions: LeaveTypeStatusOption[] = LEAVE_TYPE_STATUS_OPTIONS;
  genderEnum = GENDER_ENUM;
  religionEnum = RELIGION_ENUM;

  override prepareModel(model: LeaveType, form: FormGroup): LeaveType | Observable<LeaveType> {
    this.model = Object.assign(model, { ...form.value });
    return this.model;
  }

  override initPopup() {
    this.model = this.data.model;
    this.viewMode = this.data.viewMode;
    this.isCreateMode = this.viewMode == ViewModeEnum.CREATE;
  }
  override buildForm() {
    this.form = this.fb.group(this.model.buildForm(), {});
  }

  beforeSave(model: LeaveType, form: FormGroup) {
    return form.valid;
  }

  afterSave() {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }
  override saveFail(error: Error): void {
    throw new Error('Method not implemented.');
  }

  get hasAnnualBalanceControl() {
    return this.form.get('hasAnnualBalance') as FormControl;
  }

  get annualBalanceControl() {
    return this.form.get('annualBalance') as FormControl;
  }
  get hasLimitedTimesDuringServicePeriodControl() {
    return this.form.get('hasLimitedTimesDuringServicePeriod') as FormControl;
  }
  get availableTimesDuringServicePeriodControl() {
    return this.form.get('availableTimesDuringServicePeriod') as FormControl;
  }
  get isBalanceTransferrableControl() {
    return this.form.get('isBalanceTransferrable') as FormControl;
  }
  get canApplyOnHalfDayControl() {
    return this.form.get('canApplyOnHalfDay') as FormControl;
  }

  isAnnualLeave() {
    const isAnnual = this.hasAnnualBalanceControl.value;
    if (isAnnual) {
      this.enableAnnualBalanceRelatedControls();
      this.disableLimitedTimesDuringServiceRelatedControls();
    } else {
      this.disableAnnualBalanceRelatedControls();
      this.enableLimitedTimesDuringServiceRelatedControls();
    }

    return isAnnual;
  }

  enableAnnualBalanceRelatedControls() {
    this.annualBalanceControl.enable();
    this.isBalanceTransferrableControl.enable();
    this.hasLimitedTimesDuringServicePeriodControl;
  }
  enableLimitedTimesDuringServiceRelatedControls() {
    this.hasLimitedTimesDuringServicePeriodControl.enable();
    this.availableTimesDuringServicePeriodControl.enable();
  }

  disableAnnualBalanceRelatedControls() {
    this.annualBalanceControl.patchValue(null);
    this.annualBalanceControl.disable();

    this.isBalanceTransferrableControl.patchValue(false);
    this.isBalanceTransferrableControl.disable();
  }
  disableLimitedTimesDuringServiceRelatedControls() {
    this.availableTimesDuringServicePeriodControl.patchValue(null);
    this.availableTimesDuringServicePeriodControl.disable();

    this.hasLimitedTimesDuringServicePeriodControl.patchValue(false);
    this.hasLimitedTimesDuringServicePeriodControl.disable();
  }

  hasLimitedTimeLeave() {
    const hasLimitedTime = this.hasLimitedTimesDuringServicePeriodControl.value;
    if (hasLimitedTime) {
      this.canApplyOnHalfDayControl.patchValue(false);
      this.canApplyOnHalfDayControl.disable();
    } else {
      this.canApplyOnHalfDayControl.enable();
    }

    return hasLimitedTime;
  }
}
