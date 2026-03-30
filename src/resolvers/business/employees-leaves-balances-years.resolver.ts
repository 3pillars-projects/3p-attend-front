import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ResponseData } from '@/models/shared/response/response-data';

export const employeesLeavesBalancesYearsResolver: ResolveFn<number[]> = () => {
  const employeesLeavesBalance = inject(EmployeeBalanceService);
  return employeesLeavesBalance.getAllYears();
};
