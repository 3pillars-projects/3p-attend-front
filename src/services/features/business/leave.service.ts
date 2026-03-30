import { BaseCrudService } from '@/abstracts/base-crud-service';
import { LeaveFilter } from '@/models/features/business/leave/leave-filter';
import { TeamLeaveFilter } from '@/models/features/business/leave/team-leave-filter';
import { Leave } from '@/models/features/business/leave/leave';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
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

@CastResponseContainer({
  $default: {
    model: () => Leave,
  },
  $pagination: {
    model: () => PaginatedList<Leave>,
    unwrap: 'data',
    shape: { 'list.*': () => Leave },
  },
})
@Injectable({
  providedIn: 'root',
})
export class LeaveService extends BaseCrudService<Leave> {
  override serviceName: string = 'LeaveService';

  override getUrlSegment(): string {
    return this.urlService.URLS.LEAVE;
  }

  // ─── My Leaves ────────────────────────────────────────────────────────────

  @CastResponse(undefined, { fallback: '$pagination' })
  getMyLeavesWithPaging(
    paginationParams?: PaginationParams,
    filterOptions?: LeaveFilter
  ): Observable<PaginatedList<Leave>> {
    const httpParams = new HttpParams({
      fromObject: paginationParams as unknown as never,
    });

    return this.http
      .post<PaginatedListResponseData<Leave>>(
        this.getUrlSegment() + '/GetMyLeavesWithPaging',
        filterOptions ?? {},
        {
          params: httpParams,
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => ({
          list: response.data.list as Leave[],
          paginationInfo: response.data.paginationInfo,
        }))
      );
  }
  // ─── Team Leaves ──────────────────────────────────────────────────────────

  @CastResponse(undefined, { fallback: '$pagination' })
  getTeamLeavesWithPaging(
    paginationParams?: PaginationParams,
    filterOptions?: TeamLeaveFilter
  ): Observable<PaginatedListResponseData<Leave>> {
    let httpParams = new HttpParams();
    if (paginationParams) {
      Object.entries(paginationParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.post(this.getUrlSegment() + '/GetTeamLeavesWithPaging', filterOptions ?? {}, {
      params: httpParams,
      withCredentials: true,
    }) as unknown as Observable<PaginatedListResponseData<Leave>>;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  @CastResponse()
  @HasInterception
  override create(@InterceptParam() model: Leave): Observable<Leave> {
    return this.http
      .post<ResponseData<Leave>>(this.getUrlSegment() + '/create', model, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  createLeave(model: Partial<Leave>): Observable<Leave> {
    return this.create(model as Leave);
  }

  // ─── Approval Actions ─────────────────────────────────────────────────────

  approveLeave(leaveId: number): Observable<Leave> {
    return this.http
      .post<
        ResponseData<Leave>
      >(`${this.getUrlSegment()}/approve/${leaveId}`, {}, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  rejectLeave(model: { leaveId: number; rejectionNote?: string }): Observable<Leave> {
    return this.http
      .post<ResponseData<Leave>>(this.getUrlSegment() + '/reject', model, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  // ─── Employee Actions ─────────────────────────────────────────────────────

  cancelLeaveByEmployee(leaveId: number): Observable<Leave> {
    return this.http
      .post<
        ResponseData<Leave>
      >(`${this.getUrlSegment()}/employee/cancel/${leaveId}`, {}, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  cutLeaveByEmployee(leaveId: number): Observable<Leave> {
    return this.http
      .post<
        ResponseData<Leave>
      >(`${this.getUrlSegment()}/employee/cut/${leaveId}`, {}, { withCredentials: true })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          throw err;
        })
      );
  }

  // ─── Related / Child Leaves ───────────────────────────────────────────────

  @CastResponse()
  getLeavesWithParent(parentLeaveId?: number): Observable<Leave[]> {
    let httpParams = new HttpParams();
    if (parentLeaveId !== null && parentLeaveId !== undefined) {
      httpParams = httpParams.set('parentLeaveId', String(parentLeaveId));
    }
    return this.http
      .get<ResponseData<Leave[]>>(this.getUrlSegment() + '/GetLeavesWithParent', {
        params: httpParams,
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          throw err;
        })
      );
  }
}
