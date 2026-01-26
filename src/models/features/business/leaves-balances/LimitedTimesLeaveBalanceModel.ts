import { BaseLookupModel } from '../../lookups/base-lookup-model';

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
}
