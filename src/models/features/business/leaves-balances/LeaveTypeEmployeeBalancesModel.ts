import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';

export class EmployeeWithBalanceDetailModel {
  employee!: BaseLookupModel;
  isEligible!: boolean;

  // Annual Leave Balance Details
  totalBalance?: number;
  usedBalance?: number;
  remainingBalance?: number;
  transferredBalance?: number;

  // Limited Times Leave Balance Details
  totalTimesAvailable?: number;
  timesUsed?: number;
  remainingTimes?: number;
}

export class LeaveTypeEmployeeBalancesModel {
  leaveType!: BaseLookupModel;
  year?: number;
  isAnnualLeave!: boolean;
  userIds: number[] = [];
  employees: EmployeeWithBalanceDetailModel[] = [];
}
