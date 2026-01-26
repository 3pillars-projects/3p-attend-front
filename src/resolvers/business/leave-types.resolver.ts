import { LeaveType } from '@/models/features/business/leave-types/leave-type';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const leaveTypesResolver: ResolveFn<PaginatedList<LeaveType>> = () => {
  const leaveTypeService = inject(LeaveTypeService);
  return leaveTypeService.loadPaginated(new PaginationParams());
};
