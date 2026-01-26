import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';

export class EmployeeLeaveBalance extends BaseCrudModel<EmployeeLeaveBalance, EmployeeBalanceService> {
  override $$__service_name__$$: string = 'EmployeeLeaveBalance';
}
