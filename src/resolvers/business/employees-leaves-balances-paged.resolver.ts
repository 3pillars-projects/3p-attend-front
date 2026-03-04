import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const employeesLeavesBalancesPagedResolver: ResolveFn<
  PaginatedList<EmployeeLeaveBalance>
> = () => {
  const employeesLeavesBalance = inject(EmployeeBalanceService);
  return employeesLeavesBalance.loadPaginated(new PaginationParams());
};
