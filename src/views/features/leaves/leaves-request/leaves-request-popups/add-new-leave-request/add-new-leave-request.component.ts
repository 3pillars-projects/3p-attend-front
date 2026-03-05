import { Component, inject, OnInit } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Leave } from '@/models/features/business/leave/leave';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { LeaveService } from '@/services/features/business/leave.service';
import { LeaveTypeWithBalance } from '@/models/features/business/leave-types/leave-type-with-balance';
import { Checkbox } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { BasePopupComponent } from '@/abstracts/base-components/base-popup/base-popup.component';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { AlertService } from '@/services/shared/alert.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-add-new-leave-request',
  standalone: true,
  imports: [Select, DatePicker, Textarea, ReactiveFormsModule, CommonModule, Checkbox, TranslateModule],
  templateUrl: './add-new-leave-request.component.html',
  styleUrl: './add-new-leave-request.component.scss',
})
export class AddNewLeaveRequestComponent extends BasePopupComponent<Leave> implements OnInit {
  fb = inject(FormBuilder);
  data = inject(MAT_DIALOG_DATA);
  leaveTypeService = inject(LeaveTypeService);
  leaveService = inject(LeaveService);
  alertService = inject(AlertService);

  model: Leave = new Leave();
  form!: FormGroup;
  viewMode!: ViewModeEnum;
  
  leaveTypes: LeaveTypeWithBalance[] = [];
  selectedLeaveType?: LeaveTypeWithBalance;

  override initPopup() {
    if (this.data && this.data.model) {
      this.model = Object.assign(new Leave(), this.data.model);
    }
    this.viewMode = this.data.viewMode || ViewModeEnum.CREATE;
    this.loadLeaveTypes();
  }

  override buildForm() {
    this.form = this.fb.group(this.model.buildForm());
    
    this.form.get('fkLeaveTypeId')?.valueChanges.subscribe((id) => {
      this.selectedLeaveType = this.leaveTypes.find((t) => t.id === id);
      if (!this.selectedLeaveType?.canApplyOnHalfDay) {
        this.form.patchValue({ isHalfDay: false });
      }
    });

    this.form.valueChanges.subscribe(() => {
        this.calculateDays();
    });
  }

  override beforeSave(model: Leave, form: FormGroup): boolean | Observable<boolean> {
    if (form.invalid) {
      form.markAllAsTouched();
    }
    return form.valid;
  }

  override prepareModel(model: Leave, form: FormGroup): Leave | Observable<Leave> {
    return Object.assign(new Leave(), { ...model, ...form.value });
  }

  override afterSave(model: Leave, dialogRef: MatDialogRef<any, any>): void {
    const successObject = { messages: ['COMMON.SAVED_SUCCESSFULLY'] };
    this.alertService.showSuccessMessage(successObject);
  }

  override saveFail(error: Error): void {
  }

  loadLeaveTypes() {
    this.leaveTypeService.getLeaveTypesWithBalances().subscribe((types) => {
      this.leaveTypes = types;
      if (this.form?.get('fkLeaveTypeId')?.value) {
        this.selectedLeaveType = this.leaveTypes.find(
          (t) => t.id === this.form.get('fkLeaveTypeId')?.value
        );
      }
    });
  }

  calculateDays() {
    const from = this.form.get('dateFrom')?.value;
    const to = this.form.get('dateTo')?.value;
    const isHalfDay = this.form.get('isHalfDay')?.value;

    if (isHalfDay) {
      this.form.get('daysCount')?.setValue(0.5, { emitEvent: false });
      if (from) {
          this.form.get('dateTo')?.setValue(from, { emitEvent: false });
      }
      return;
    }

    if (from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.form.get('daysCount')?.setValue(diffDays > 0 ? diffDays : 0, { emitEvent: false });
    }
  }
}
