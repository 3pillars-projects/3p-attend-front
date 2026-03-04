import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import {
  convertMonthsToYearsAndMonths,
  convertYearsAndMonthsToMonths,
} from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class employeeLeaveBalanceInterceptor
  implements ModelInterceptorContract<EmployeeLeaveBalance>
{
  receive(model: EmployeeLeaveBalance): EmployeeLeaveBalance {
    return model;
  }

  send(model: Partial<EmployeeLeaveBalance>): Partial<EmployeeLeaveBalance> {
    return model;
  }
}
