import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { UrlService } from '@/services/url.service';
import { ResponseData } from '@/models/shared/response/response-data';
import { LeaveTransferEmployeesRequest } from '@/models/features/business/leave-transfer/leave-transfer-employees-request';
import { LeaveTransferEligibleEmployeesResponse } from '@/models/features/business/leave-transfer/leave-transfer-eligible-employees-response';
import { LeaveTransferActionRequest } from '@/models/features/business/leave-transfer/leave-transfer-action-request';
import { LeaveTransferActionResponse } from '@/models/features/business/leave-transfer/leave-transfer-action-response';
import { LeaveTransferAnnualLeaveTypeLookup } from '@/models/features/business/leave-transfer/leave-transfer-annual-leave-type-lookup';

@Injectable({
  providedIn: 'root',
})
export class LeaveTransferService {
  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  private getUrlSegment(): string {
    return this.urlService.URLS.LEAVE_TRANSFER;
  }

  /**
   * Get eligible employees for leave transfer based on filters
   */
  getEligibleEmployees(
    request: LeaveTransferEmployeesRequest
  ): Observable<LeaveTransferEligibleEmployeesResponse> {
    return this.http
      .post<
        ResponseData<LeaveTransferEligibleEmployeesResponse>
      >(`${this.getUrlSegment()}/employees`, request, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  /**
   * Execute leave transfer action (Renew, Transfer, or Reverse Transfer)
   */
  applyAction(request: LeaveTransferActionRequest): Observable<LeaveTransferActionResponse> {
    return this.http
      .post<
        ResponseData<LeaveTransferActionResponse>
      >(`${this.getUrlSegment()}/action`, request, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  /**
   * Get lookup of annual leave types that can be transferred
   */
  getAnnualLeaveTypesLookup(): Observable<LeaveTransferAnnualLeaveTypeLookup[]> {
    return this.http
      .get<
        ResponseData<LeaveTransferAnnualLeaveTypeLookup[]>
      >(`${this.getUrlSegment()}/annual-leave-types`, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          throw err;
        })
      );
  }
}
