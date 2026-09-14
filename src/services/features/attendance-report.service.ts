import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer, HasInterception } from 'cast-response';
import { BaseCrudService } from '@/abstracts/base-crud-service';
import AttendanceReport from '@/models/features/attendance/attendance-report/attendance-report';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { OptionsContract } from '@/contracts/options-contract';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { genericDateOnlyConvertor, toDateOnly } from '@/utils/general-helper';
import { Observable, map, catchError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { AttendanceTimeBalance } from '@/models/features/attendance/attendance-report/attendance-time-balance';
import { ResponseData } from '@/models/shared/response/response-data';

@Injectable({
  providedIn: 'root',
})
@CastResponseContainer({
  $default: {
    model: () => AttendanceReport,
  },
  $pagination: {
    model: () => PaginatedList<AttendanceReport>,
    unwrap: 'data',
    shape: { 'list.*': () => AttendanceReport },
  },
})
export class AttendanceReportService extends BaseCrudService<AttendanceReport, number> {
  serviceName: string = 'AttendanceReportService';

  getUrlSegment(): string {
    return this.urlService.URLS.ATTENDANCE_REPORT; // make sure ATTENDANCE_REPORT is defined in your UrlService
  }
  @CastResponse(undefined, { fallback: '$pagination' })
  loadMyAttendanceReportsPaginated(
    paginationParams?: PaginationParams,
    filterOptions?: OptionsContract | undefined
  ): Observable<PaginatedList<AttendanceReport>> {
    const httpParams = new HttpParams({
      fromObject: paginationParams as unknown as never,
    });
    filterOptions = genericDateOnlyConvertor(filterOptions);
    return this.http
      .post<PaginatedListResponseData<AttendanceReport>>(
        this.getUrlSegment() + '/GetMyAttendanceReports',
        filterOptions || {},
        {
          params: httpParams,
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => ({
          list: response.data.list as AttendanceReport[],
          paginationInfo: response.data.paginationInfo,
        }))
      )
      .pipe(
        catchError((err) => {
          throw err;
        })
      );
  }
  // Payroll-cycle balance; the server defaults userId to the current user and date to today
  getTimeBalance(userId?: number, date?: Date | string): Observable<AttendanceTimeBalance> {
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('userId', userId);
    }
    if (date) {
      params = params.set('date', toDateOnly(date));
    }
    return this.http
      .get<ResponseData<AttendanceTimeBalance>>(this.getUrlSegment() + '/time-balance', {
        params,
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  @CastResponse()
  @HasInterception
  assignInquiryToUsers(inquiryId: number, userIds: number[]): Observable<AttendanceReport> {
    const url = `${this.getUrlSegment()}/${inquiryId}/assign`;
    return this.http.post<AttendanceReport>(url, { userIds }, { withCredentials: true });
  }
}
