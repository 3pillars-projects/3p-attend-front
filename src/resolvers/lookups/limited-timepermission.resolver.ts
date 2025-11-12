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
import { catchError, forkJoin, of } from 'rxjs';

export const limitedTimePermissionResolver: ResolveFn<any | null> = () => {
  const permissionService = inject(LimitedTimePermissionService);
  const permissionTypeService = inject(LimitedTimePermissionTypeService);
  const permissionStatusService = inject(LimitedTimePermissionStatusService);
  const userService = inject(UserService);

  return forkJoin({
    myPermissions: permissionService.loadPaginated(new PaginationParams()),
    types: permissionTypeService.getLookup(),
    departments: userService.getMyDepartmentsLookup(),
    statuses: permissionStatusService.getLookup(),
    users: userService.getMyDepartmentUsersLookup(),
    timeOptions: permissionService.getTimeOptions(),
  }).pipe(
    catchError((error) => {
      console.error('Error in limitedTimePermissionResolver', error);
      return of({
        myPermissions: [],
        types: [],
        departments: [],
        statuses: [],
        users: [],
        timeOptions: { data: [] },
        list: [],
        paginationInfo: new PaginationInfo(),
      });
    })
  );
};

//   permissionTypeService.getLookup().subscribe();
//   userService.getMyDepartmentsLookup().subscribe();
//   permissionStatusService.getLookup().subscribe();
//   userService.getMyDepartmentUsersLookup().subscribe();
//   permissionService.getTimeOptions().subscribe();
