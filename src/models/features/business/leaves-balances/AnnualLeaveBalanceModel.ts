import { BaseLookupModel } from '../../lookups/base-lookup-model';

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
}
