import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';

export const myCancelLeavesResolver: ResolveFn<PaginatedList<CancelationRequest | null>> = () => {
  const params = new PaginationParams();
  params.pageSize = 10;
  return inject(CancelationRequestService).getMyLeavesCancelationRequestsWithPaging(params);
};
