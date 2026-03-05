import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { LeaveService } from '@/services/features/business/leave.service';
import { Leave } from '@/models/features/business/leave/leave';

export const myLeavesResolver: ResolveFn<PaginatedListResponseData<Leave>> = () => {
  const leaveService = inject(LeaveService);
  return leaveService.getMyLeavesWithPaging(new PaginationParams());
};
