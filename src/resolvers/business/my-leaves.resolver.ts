import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { LeaveService } from '@/services/features/business/leave.service';
import { Leave } from '@/models/features/business/leave/leave';
import { catchError, of } from 'rxjs';
import { PaginatedList } from '@/models/shared/response/paginated-list';

export const myLeavesResolver: ResolveFn<PaginatedList<Leave> | null> = () => {
  const leaveService = inject(LeaveService);
  return leaveService.getMyLeavesWithPaging(new PaginationParams()).pipe(
      catchError(() => {
        return of(null); // Prevent throwing to allow route activation
      })
    );;
};
