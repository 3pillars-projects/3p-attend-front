import { AnnualLeaveBalanceModel } from './AnnualLeaveBalanceModel';
import { LimitedTimesLeaveBalanceModel } from './LimitedTimesLeaveBalanceModel';

export interface BulkUpdateBalancesRequest {
  fkUserId: number;
  year?: number;
  annualLeaves: AnnualLeaveBalanceModel[];
  limitedTimesLeaves: LimitedTimesLeaveBalanceModel[];
}
