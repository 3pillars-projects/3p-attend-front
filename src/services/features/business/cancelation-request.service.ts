import { BaseCrudService } from '@/abstracts/base-crud-service';
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { CancelationRequestFilter } from '@/models/features/business/leave-cancelation/cancelation-request-filter';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { ResponseData } from '@/models/shared/response/response-data';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CastResponse,
  CastResponseContainer,
  HasInterception,
  InterceptParam,
} from 'cast-response';
import { catchError, map, Observable } from 'rxjs';
import { PaginatedList } from '@/models/shared/response/paginated-list';

@CastResponseContainer({
  $default: {
    model: () => CancelationRequest,
  },
  $pagination: {
    model: () => PaginatedList<CancelationRequest>,
    unwrap: 'data',
    shape: { 'list.*': () => CancelationRequest },
  },
})
@Injectable({
  providedIn: 'root',
})
export class CancelationRequestService extends BaseCrudService<CancelationRequest> {
  override serviceName: string = 'CancelationRequestService';

  override getUrlSegment(): string {
    return this.urlService.URLS.CANCELATION_REQUEST;
  }

  // ─── Manager Actions ──────────────────────────────────────────────────────

  @CastResponse()
  requestLeaveCancelationByManager(model: {
    fkLeaveId: number;
    dateFrom: string | Date;
    dateTo: string | Date;
    note?: string;
  }): Observable<CancelationRequest> {
    return this.http
      .post<ResponseData<CancelationRequest>>(this.getUrlSegment() + '/manager/create', model, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  // ─── Action Responses ─────────────────────────────────────────────────────

  @CastResponse()
  approveCancelation(cancelationRequestId: number): Observable<CancelationRequest> {
    return this.http
      .post<
        ResponseData<CancelationRequest>
      >(`${this.getUrlSegment()}/approve/${cancelationRequestId}`, {}, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  @CastResponse()
  rejectCancelation(model: {
    cancelationRequestId: number;
    rejectionNote?: string;
  }): Observable<CancelationRequest> {
    return this.http
      .post<ResponseData<CancelationRequest>>(this.getUrlSegment() + '/reject', model, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  @CastResponse(undefined, { fallback: '$pagination' })
  getPendingCancelationRequestsForEmployee(userId: number): Observable<CancelationRequest[]> {
    return this.http
      .get<ResponseData<CancelationRequest[]>>(this.getUrlSegment() + '/employee/pending', {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  @CastResponse(undefined, { fallback: '$pagination' })
  getPendingCancelationRequestsForHR(): Observable<CancelationRequest[]> {
    return this.http
      .get<ResponseData<CancelationRequest[]>>(this.getUrlSegment() + '/hr/pending', {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  // ─── Retrieval ────────────────────────────────────────────────────────────

  @CastResponse(undefined, { fallback: '$pagination' })
  getMyLeavesCancelationRequestsWithPaging(
    paginationParams?: PaginationParams,
    filterOptions?: CancelationRequestFilter
  ): Observable<PaginatedListResponseData<CancelationRequest>> {
    let httpParams = new HttpParams();
    if (paginationParams) {
      Object.entries(paginationParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.post(
      this.getUrlSegment() + '/GetMyCancelationRequestsWithPaging',
      filterOptions ?? {},
      {
        params: httpParams,
        withCredentials: true,
      }
    ) as unknown as Observable<PaginatedListResponseData<CancelationRequest>>;
  }

  @CastResponse(undefined, { fallback: '$pagination' })
  getEmployeesCancelationRequestsWithPaging(
    paginationParams?: PaginationParams,
    filterOptions?: CancelationRequestFilter
  ): Observable<PaginatedListResponseData<CancelationRequest>> {
    let httpParams = new HttpParams();
    if (paginationParams) {
      Object.entries(paginationParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.post(
      this.getUrlSegment() + '/GetTeamCancelationRequestsWithPaging',
      filterOptions ?? {},
      {
        params: httpParams,
        withCredentials: true,
      }
    ) as unknown as Observable<PaginatedListResponseData<CancelationRequest>>;
  }

  @CastResponse()
  getCancelationRequestsByLeaveId(leaveId: number): Observable<CancelationRequest[]> {
    return this.http
      .get<ResponseData<CancelationRequest[]>>(`${this.getUrlSegment()}/leave/${leaveId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }
}
