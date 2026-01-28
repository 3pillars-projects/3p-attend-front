import { BaseLookupModel } from '../../lookups/base-lookup-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class LimitedTimesLeaveBalanceModel {
  // Identity fields (optional for update, required for response)
  id?: number; // Balance Id (read-only, optional for update)
  leaveType?: BaseLookupModel; // Required for response, optional for update
  isEligible?: boolean;

  // Update fields
  fkLeaveTypeId?: number; // Required for update
  totalTimesAvailable?: number;
  timesUsed?: number;
  remainingTimes?: number;

  buildForm(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [this.id],
      fkLeaveTypeId: [this.fkLeaveTypeId],
      leaveType: [this.leaveType],
      totalTimesAvailable: [this.totalTimesAvailable, [Validators.required, Validators.min(0)]],
      timesUsed: [{ value: this.timesUsed, disabled: true }],
      remainingTimes: [{ value: this.remainingTimes, disabled: true }],
    });
  }
}
