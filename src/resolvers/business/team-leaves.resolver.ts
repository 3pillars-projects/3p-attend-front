import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { LeaveService } from '@/services/features/business/leave.service';
import { Leave } from '@/models/features/business/leave/leave';

export const teamLeavesResolver: ResolveFn<PaginatedListResponseData<Leave>> = () => {
  const leaveService = inject(LeaveService);
  return leaveService.getTeamLeavesWithPaging(new PaginationParams());
};
