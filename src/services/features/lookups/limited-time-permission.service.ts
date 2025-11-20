import { BaseCrudService } from '@/abstracts/base-crud-service';
import { OptionsContract } from '@/contracts/options-contract';
import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { PaginationParams } from '@/models/shared/pagination-params';
import { ListResponseData } from '@/models/shared/response/list-response-data';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { genericDateOnlyConvertor } from '@/utils/general-helper';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer, HasInterception } from 'cast-response';
import { catchError, map, Observable } from 'rxjs';

@CastResponseContainer({
  $default: {
    model: () => LimitedTimePermission,
  },
  $pagination: {
    model: () => PaginatedList<LimitedTimePermission>,
    unwrap: 'data',
    shape: { 'list.*': () => LimitedTimePermission },
  },
})
@Injectable({
  providedIn: 'root',
})
export class LimitedTimePermissionService extends BaseCrudService<LimitedTimePermission> {
  serviceName: string = 'LimitedTimePermissionService';

  override getUrlSegment(): string {
    return this.urlService.URLS.LIMITED_TIME_PERMISSIONS;
  }

  @CastResponse(undefined, { fallback: '$pagination' })
  loadDepartmentPermissionPaginated(
    paginationParams?: PaginationParams,
    filterOptions?: OptionsContract | undefined
  ): Observable<PaginatedList<LimitedTimePermission>> {
    const httpParams = new HttpParams({
      fromObject: paginationParams as unknown as never,
    });
    filterOptions = genericDateOnlyConvertor(filterOptions);
    return this.http
      .post<PaginatedListResponseData<LimitedTimePermission>>(
        this.getUrlSegment() + '/GetDepartmentLimitedTimePermissionsWithPaging',
        filterOptions || {},
        {
          params: httpParams, // <-- query string
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => {
          return {
            list: response.data.list as LimitedTimePermission[],
            paginationInfo: response.data.paginationInfo,
          };
        })
      )
      .pipe(
        catchError((err) => {
          // Let the global ErrorHandler handle it
          throw err;
        })
      );
  }

  @CastResponse()
  @HasInterception
  acceptPermission(permissionId: number): Observable<LimitedTimePermission> {
    const url = `${this.getUrlSegment()}/${permissionId}/accept`;
    return this.http.put<LimitedTimePermission>(url, null, { withCredentials: true });
  }
  @CastResponse()
  @HasInterception
  rejectPermission(permissionId: number): Observable<LimitedTimePermission> {
    const url = `${this.getUrlSegment()}/${permissionId}/reject`;
    return this.http.put<LimitedTimePermission>(url, null, { withCredentials: true });
  }
  @CastResponse()
  @HasInterception
  requestCancel(permissionId: number): Observable<LimitedTimePermission> {
    const url = `${this.getUrlSegment()}/${permissionId}/requestCancel`;
    return this.http.put<LimitedTimePermission>(url, null, { withCredentials: true });
  }
  @CastResponse()
  @HasInterception
  approveCancel(permissionId: number): Observable<LimitedTimePermission> {
    const url = `${this.getUrlSegment()}/${permissionId}/approveCancel`;
    return this.http.put<LimitedTimePermission>(url, null, { withCredentials: true });
  }
  @CastResponse()
  @HasInterception
  rejectCancel(permissionId: number): Observable<LimitedTimePermission> {
    const url = `${this.getUrlSegment()}/${permissionId}/rejectCancel`;
    return this.http.put<LimitedTimePermission>(url, null, { withCredentials: true });
  }

  @CastResponse()
  @HasInterception
  getTimeOptions(): Observable<ListResponseData<number>> {
    const url = `${this.getUrlSegment()}/GetTimeOptions`;
    return this.http.get<ListResponseData<number>>(url, { withCredentials: true });
  }

  @CastResponse()
  @HasInterception
  getPermissionByIds(ids: number[]): Observable<LimitedTimePermission[]> {
    const url = `${this.getUrlSegment()}/GetByIds`;
    return this.http
      .post<ListResponseData<LimitedTimePermission>>(url, ids, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }
}
