import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
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
import { RequiredMarkerDirective } from '../../../../../directives/required-marker.directive';
import { atLeastOneTrue } from '@/validators/custom-validators';

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
    ValidationMessagesComponent,
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
    this.form = this.fb.group(this.model.buildForm(), {
      validators: atLeastOneTrue([
        'canApplyInPastOnly',
        'canApplyInFutureOnly',
        'canApplyInPresentOnly',
      ]),
    });
  }

  beforeSave(model: LeaveType, form: FormGroup) {
    return form.valid;
  }

  afterSave() {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }
  override saveFail(error: Error): void {}

  getControl(controlName: string) {
    return this.form.get(controlName) as FormControl;
  }

  isAnnualLeave() {
    const isAnnual = this.getControl('hasAnnualBalance').value;
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
    const annualBalance = this.getControl('annualBalance');
    const isBalanceTransferrable = this.getControl('isBalanceTransferrable');

    annualBalance.setValidators([Validators.required]);
    annualBalance.enable(); // emitEvent defaults to true
    annualBalance.updateValueAndValidity(); // important

    isBalanceTransferrable.enable();
  }

  disableAnnualBalanceRelatedControls() {
    const annualBalance = this.getControl('annualBalance');
    const isBalanceTransferrable = this.getControl('isBalanceTransferrable');

    annualBalance.patchValue(null); // emitEvent true
    annualBalance.clearValidators();
    annualBalance.setErrors(null);
    annualBalance.disable();
    annualBalance.updateValueAndValidity(); // important

    isBalanceTransferrable.patchValue(false);
    isBalanceTransferrable.disable();
  }

  enableLimitedTimesDuringServiceRelatedControls() {
    this.getControl('hasLimitedTimesDuringServicePeriod').enable();
    this.getControl('availableTimesDuringServicePeriod').enable();
  }


  disableLimitedTimesDuringServiceRelatedControls() {
    this.getControl('availableTimesDuringServicePeriod').patchValue(null);
    this.getControl('availableTimesDuringServicePeriod').disable();

    this.getControl('hasLimitedTimesDuringServicePeriod').patchValue(false);
    this.getControl('hasLimitedTimesDuringServicePeriod').disable();
  }

  hasLimitedTimeLeave() {
    const hasLimitedTime = this.getControl('hasLimitedTimesDuringServicePeriod').value;
    if (hasLimitedTime) {
      this.getControl('canApplyOnHalfDay').patchValue(false);
      this.getControl('canApplyOnHalfDay').disable();
      this.getControl('availableTimesDuringServicePeriod').enable();
    } else {
      this.getControl('canApplyOnHalfDay').enable();
      this.getControl('availableTimesDuringServicePeriod').patchValue(null);
      this.getControl('availableTimesDuringServicePeriod').disable();
    }

    return hasLimitedTime;
  }
}
