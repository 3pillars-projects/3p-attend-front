import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { AnnualLeaveBalanceModel } from './AnnualLeaveBalanceModel';
import { LimitedTimesLeaveBalanceModel } from './LimitedTimesLeaveBalanceModel';
import { InterceptModel } from 'cast-response';
import { employeeLeaveBalanceInterceptor } from '@/model-interceptors/features/business/employee-leave-balance.interceptor';

const { send, receive } = new employeeLeaveBalanceInterceptor();

@InterceptModel({ send, receive })
export class EmployeeLeaveBalance extends BaseCrudModel<
  EmployeeLeaveBalance,
  EmployeeBalanceService
> {
  override $$__service_name__$$: string = 'EmployeeLeaveBalance';
  employeeId!: number;
  fullNameAr!: string;
  fullNameEn!: string;
  fkGenderId!: number;
  religion!: number;
  monthsOfExperience!: number;
  annualLeaves: AnnualLeaveBalanceModel[] = [];
  limitedTimesLeaves: LimitedTimesLeaveBalanceModel[] = [];
}
