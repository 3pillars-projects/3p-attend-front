import { Injectable } from '@angular/core';
import { BaseCrudService } from '@/abstracts/base-crud-service';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { BulkUpdateBalancesRequest } from '@/models/features/business/leaves-balances/bulk-update-balances-request';
import { CastResponse } from 'cast-response';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseData } from '@/models/shared/response/response-data';

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
}
