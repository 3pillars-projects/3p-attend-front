import { BaseCrudService } from '@/abstracts/base-crud-service';
import { LeaveType } from '@/models/features/business/leave-types/leave-type';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { catchError, map, Observable } from 'rxjs';
import { ResponseData } from '@/models/shared/response/response-data';
import { LeaveTypesLookup } from '@/models/features/business/leave-types/leave-types-lookup';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LeaveTypeWithBalance } from '@/models/features/business/leave-types/leave-type-with-balance';

@CastResponseContainer({
  $default: {
    model: () => LeaveType,
  },
  $pagination: {
    model: () => PaginatedList<LeaveType>,
    unwrap: 'data',
    shape: { 'list.*': () => LeaveType },
  },
  $categorizedLeaveTypes: {
    model: () => LeaveTypesLookup,
    unwrap: 'data',
    shape: { 'annualLeaves.*': () => BaseLookupModel, 'limitedLeaves.*': () => BaseLookupModel },
  },
  $withBalances: {
    model: () => LeaveTypeWithBalance,
    unwrap: 'data',
    shape: { '*': () => LeaveTypeWithBalance },
  },
})
@Injectable({
  providedIn: 'root',
})
export class LeaveTypeService extends BaseCrudService<LeaveType> {
  serviceName: string = 'LeaveTypeService';

  override getUrlSegment(): string {
    return this.urlService.URLS.LEAVE_TYPE;
  }

  @CastResponse(undefined, { fallback: '$categorizedLeaveTypes' })
  getCategorizedLeaveTypesLookup(): Observable<LeaveTypesLookup> {
    return this.http
      .get<
        ResponseData<LeaveTypesLookup>
      >(this.getUrlSegment() + '/LeaveTypesLookup', { withCredentials: true })
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  @CastResponse(undefined, { fallback: '$withBalances' })
  getLeaveTypesWithBalances(year?: number | null): Observable<LeaveTypeWithBalance[]> {
    const url = this.getUrlSegment() + '/WithBalances';

    const params = year != null ? { year: year.toString() } : undefined;

    return this.http
      .get<ResponseData<LeaveTypeWithBalance[]>>(url, {
        withCredentials: true,
        params,
      })
      .pipe(map((res) => res.data));
  }
}
