import { Injectable } from '@angular/core';
import { BaseCrudService } from '@/abstracts/base-crud-service';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';

@Injectable({
  providedIn: 'root',
})
export class EmployeeBalanceService extends BaseCrudService<EmployeeLeaveBalance> {
  override serviceName: string = 'EmployeeBalanceService';
  override getUrlSegment(): string {
    return this.urlService.URLS.EMPLOYEE_LEAVE_BALANCE;
  }
}
