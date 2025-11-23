import { LookupBaseService } from '@/abstracts/lookup-base.service';
import { OptionsContract } from '@/contracts/options-contract';
import EmployeeShift from '@/models/features/lookups/work-shifts/employee-shift';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { SingleResponseData } from '@/models/shared/response/single-response-data';
import { genericDateOnlyConvertor } from '@/utils/general-helper';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from 'cast-response';
import { switchMap, of, map } from 'rxjs';
import { EmployeeShiftInterceptor } from '@/model-interceptors/features/lookups/employee-shift-interceptor';

@Injectable({
  providedIn: 'root',
})
@CastResponseContainer({
  $currentShift: {
    model: () => SingleResponseData<EmployeeShift>,
  },
  $myShiftsPaginated: {
    model: () => PaginatedList<EmployeeShift>,
    unwrap: 'data',
    shape: { 'list.*': () => EmployeeShift },
  },
})
export class MyShiftsService extends LookupBaseService<EmployeeShift, number> {
  override serviceName: string = 'MyShiftsService';
  override getUrlSegment(): string {
    return this.urlService.URLS.SHIFTS;
  }
  @CastResponse(undefined, { fallback: '$currentShift' })
  getMyCurrentShift() {
    return this.http
      .get<SingleResponseData<EmployeeShift>>(this.getUrlSegment() + '/' + 'GetMyCurrentShift', {
        withCredentials: true,
      })
      .pipe(
        switchMap((response: SingleResponseData<EmployeeShift>) => {
          let employeeShiftInterceptor = new EmployeeShiftInterceptor();
          return of(employeeShiftInterceptor.receive(response.data));
        })
      );
  }

  @CastResponse(undefined, { fallback: '$myShiftsPaginated' })
  getMyShifts(paginationParams?: PaginationParams, filterOptions?: OptionsContract | undefined) {
    const httpParams = new HttpParams({
      fromObject: paginationParams as unknown as never,
    });
    filterOptions = genericDateOnlyConvertor(filterOptions);

    // ADD RETURN HERE!
    return this.http
      .post<PaginatedListResponseData<EmployeeShift>>(
        this.getUrlSegment() + '/GetMyShifts',
        filterOptions || {},
        {
          params: httpParams, // <-- query string
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => {
          return {
            list: response.data.list as EmployeeShift[],
            paginationInfo: response.data.paginationInfo,
          };
        })
      );
  }
}
