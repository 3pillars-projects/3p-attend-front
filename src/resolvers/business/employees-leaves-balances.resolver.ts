import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { LeaveTypesLookup } from '@/models/features/business/leave-types/leave-types-lookup';

export const employeesLeavesBalancesResolver: ResolveFn<LeaveTypesLookup> = () => {
  const leavesBalance = inject(LeaveTypeService);
  return leavesBalance.getCategorizedLeaveTypesLookup();
};
