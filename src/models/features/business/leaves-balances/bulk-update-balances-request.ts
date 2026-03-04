import { AnnualLeaveBalanceModel } from './AnnualLeaveBalanceModel';
import { LimitedTimesLeaveBalanceModel } from './LimitedTimesLeaveBalanceModel';

export class BulkUpdateBalancesRequest {
  declare fkUserId: number;
  declare year?: number;
  declare annualLeaves: AnnualLeaveBalanceModel[];
  declare limitedTimesLeaves: LimitedTimesLeaveBalanceModel[];
}
