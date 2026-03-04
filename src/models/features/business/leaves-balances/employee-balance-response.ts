export class EmployeeBalanceResponse {
  declare year: number;
  declare employees: EmployeeBalanceInfo[];
}

export class EmployeeBalanceInfo {
  declare Id: number;
  declare nameAr: string;
  declare nameEn: string;
  declare remainingBalancePreviousYear?: number;
  declare remainingBalanceCurrentYear?: number;
  declare transferedBalancePreviousYear?: number;
  declare transferedBalanceCurrentYear?: number;
  declare currentBalance?: number;
}
