import { BaseLookupModel } from '../../lookups/base-lookup-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class AnnualLeaveBalanceModel {
  // Identity fields (optional for update, required for response)
  id?: number; // Balance Id (read-only, optional for update)
  leaveType?: BaseLookupModel; // Required for response, optional for update
  isEligible?: boolean;

  // Update fields
  fkLeaveTypeId?: number; // Required for update
  totalBalance?: number;
  usedBalance?: number;
  remainingBalance?: number;
  transferredBalance?: number;

  buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [this.id],
      fkLeaveTypeId: [this.fkLeaveTypeId],
      leaveType: [this.leaveType],
      totalBalance: [this.totalBalance, [Validators.required, Validators.min(0)]],
      usedBalance: [{ value: this.usedBalance, disabled: true }],
      remainingBalance: [{ value: this.remainingBalance, disabled: true }],
    });
  }
}
