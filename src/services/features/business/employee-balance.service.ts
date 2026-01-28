import { Injectable } from '@angular/core';
import { BaseCrudService } from '@/abstracts/base-crud-service';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { BulkUpdateBalancesRequest } from '@/models/features/business/leaves-balances/bulk-update-balances-request';
import { CastResponse } from 'cast-response';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ResponseData } from '@/models/shared/response/response-data';
import { LeaveTypeEmployeeBalancesModel } from '@/models/features/business/leaves-balances/LeaveTypeEmployeeBalancesModel';

@Injectable({
  providedIn: 'root',
})
export class EmployeeBalanceService extends BaseCrudService<EmployeeLeaveBalance> {
  override serviceName: string = 'EmployeeBalanceService';
  override getUrlSegment(): string {
    return this.urlService.URLS.EMPLOYEE_LEAVE_BALANCE;
  }

  @CastResponse()
  bulkUpdateUserBalances(model: BulkUpdateBalancesRequest): Observable<EmployeeLeaveBalance> {
    return this.http
      .put<
        ResponseData<EmployeeLeaveBalance>
      >(this.getUrlSegment() + '/user/bulk-update', model, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  @CastResponse()
  bulkUpdateBalancesByLeaveType(payload: any): Observable<any> {
    return this.http
      .put<
        ResponseData<any>
      >(this.getUrlSegment() + '/leave-type/bulk-update', payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  @CastResponse()
  getAllYears(): Observable<number[]> {
    return this.http
      .get<ResponseData<number[]>>(this.getUrlSegment() + '/years', { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  @CastResponse()
  getEmployeeBalancesByLeaveType(
    fkLeaveTypeId: number,
    filterParams: any
  ): Observable<LeaveTypeEmployeeBalancesModel> {
    return this.http
      .post<ResponseData<LeaveTypeEmployeeBalancesModel>>(
        this.getUrlSegment() + '/leave-type/' + fkLeaveTypeId,
        filterParams,
        {
          withCredentials: true,
        }
      )
      .pipe(map((response) => response.data));
  }
}
