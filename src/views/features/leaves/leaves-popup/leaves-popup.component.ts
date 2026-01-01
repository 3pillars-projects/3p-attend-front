import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { AlertService } from '@/services/shared/alert.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { LanguageService } from '@/services/shared/language.service';
import { InputNumberModule } from 'primeng/inputnumber';

// Simple leave type model for now
export class LeaveType {
  id?: number;
  nameAr?: string;
  nameEn?: string;
  balanceDays?: number;
  maxConsecutiveDays?: number;
  isActive?: boolean;

  // Additional fields from the image
  canCarryOver?: boolean;
  carryOverDays?: number;
  canDeductFromBalance?: boolean;
  canDeductFromSalary?: boolean;
  requiresApproval?: boolean;
  canRequestHalfDay?: boolean;
  minDaysBeforeRequest?: number;
  maxDaysPerRequest?: number;
  isAnnualLeave?: boolean;
  isSickLeave?: boolean;
  isEmergencyLeave?: boolean;
  requiresAttachment?: boolean;
  canExceedBalance?: boolean;
  deductionPercentage?: number;

  // New fields from second image
  countHolidaysAndWeekends?: boolean;
  maxAvailableDays?: number;
  requiresDocumentAttachment?: boolean;

  buildForm() {
    return {
      nameAr: [this.nameAr || ''],
      nameEn: [this.nameEn || ''],
      balanceDays: [this.balanceDays || 0],
      maxConsecutiveDays: [this.maxConsecutiveDays || 0],
      isActive: [this.isActive !== undefined ? this.isActive : true],
      canCarryOver: [this.canCarryOver || false],
      carryOverDays: [this.carryOverDays || 0],
      canDeductFromBalance: [this.canDeductFromBalance || false],
      canDeductFromSalary: [this.canDeductFromSalary || false],
      requiresApproval: [this.requiresApproval || true],
      canRequestHalfDay: [this.canRequestHalfDay || false],
      minDaysBeforeRequest: [this.minDaysBeforeRequest || 0],
      maxDaysPerRequest: [this.maxDaysPerRequest || 0],
      isAnnualLeave: [this.isAnnualLeave || false],
      isSickLeave: [this.isSickLeave || false],
      isEmergencyLeave: [this.isEmergencyLeave || false],
      requiresAttachment: [this.requiresAttachment || false],
      canExceedBalance: [this.canExceedBalance || false],
      deductionPercentage: [this.deductionPercentage || 0],
      countHolidaysAndWeekends: [this.countHolidaysAndWeekends || false],
      maxAvailableDays: [this.maxAvailableDays || 0],
      requiresDocumentAttachment: [this.requiresDocumentAttachment || false]
    };
  }
}

@Component({
  selector: 'app-leaves-popup',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    InputNumberModule
  ],
  templateUrl: './leaves-popup.component.html',
  styleUrl: './leaves-popup.component.scss'
})
export class LeavesPopupComponent implements OnInit {
  model!: LeaveType;
  form!: FormGroup;
  isCreateMode = false;
  viewMode!: ViewModeEnum;
  alertService = inject(AlertService);
  languageService = inject(LanguageService);
  fb = inject(FormBuilder);
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<LeavesPopupComponent>);

  accountStatusOptions = [
    { id: true, nameAr: 'نشط', nameEn: 'Active' },
    { id: false, nameAr: 'غير نشط', nameEn: 'Inactive' }
  ];

  ngOnInit() {
    this.model = this.data.model || new LeaveType();
    this.viewMode = this.data.viewMode || ViewModeEnum.CREATE;
    this.isCreateMode = this.viewMode === ViewModeEnum.CREATE;
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group(this.model.buildForm());
  }

  save() {
    if (this.form.valid) {
      this.model = Object.assign(this.model, { ...this.form.value });
      this.alertService.showSuccessMessage({ messages: ['COMMON.SAVED_SUCCESSFULLY'] });
      this.dialogRef.close(this.model);
    }
  }

  close() {
    this.dialogRef.close();
  }

  get direction(): string {
    return 'rtl'; // Arabic direction
  }
}
