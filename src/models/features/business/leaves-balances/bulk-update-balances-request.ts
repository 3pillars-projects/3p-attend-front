import { AnnualLeaveBalanceModel } from './AnnualLeaveBalanceModel';
import { LimitedTimesLeaveBalanceModel } from './LimitedTimesLeaveBalanceModel';

export interface BulkUpdateBalancesRequest {
  fkUserId: number;
  annualLeaves: AnnualLeaveBalanceModel[];
  limitedTimesLeaves: LimitedTimesLeaveBalanceModel[];
}
