import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { PaginationInfo } from '@/models/shared/response/pagination-info';
import { LimitedTimePermissionStatusService } from '@/services/features/lookups/limited-time-permission-status.service';
import { LimitedTimePermissionTypeService } from '@/services/features/lookups/limited-time-permission-type.service';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';
import { UserService } from '@/services/features/user.service';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';

export const limitedTimePermissionResolver: ResolveFn<
  PaginatedList<LimitedTimePermission> | null
> = () => {
  const permissionService = inject(LimitedTimePermissionService);

  return permissionService.loadPaginated(new PaginationParams()).pipe(
    catchError((error) => {
      console.error('Error in limitedTimePermissionResolver', error);
      return of({
        list: [],
        paginationInfo: new PaginationInfo(),
      } as PaginatedList<LimitedTimePermission>);
    })
  );
};
