import { BaseLookupModel } from '../../lookups/base-lookup-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class AnnualLeaveBalanceModel {
  // Identity fields (optional for update, required for response)
  id?: number; // Balance Id (read-only, optional for update)
  leaveType?: BaseLookupModel; // Required for response, optional for update
  isEligible?: boolean;

  // Update fields
  fkLeaveTypeId?: number; // Required for update
  year?: number; // Required for both GET and UPDATE
  totalBalance?: number;
  usedBalance?: number;
  remainingBalance?: number;
  transferredBalance?: number;

  buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [this.id],
      fkLeaveTypeId: [this.fkLeaveTypeId],
      leaveType: [this.leaveType],
      year: [this.year],
      totalBalance: [this.totalBalance, [Validators.required, Validators.min(0)]],
      usedBalance: [{ value: this.usedBalance, disabled: true }],
      remainingBalance: [{ value: this.remainingBalance, disabled: true }],
    });
  }
}
