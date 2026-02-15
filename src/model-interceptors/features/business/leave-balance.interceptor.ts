import { LeaveBalance } from '@/models/features/business/leaves-balances/leave-balance';
import { ModelInterceptorContract } from 'cast-response';

export class LeaveBalanceInterceptor implements ModelInterceptorContract<LeaveBalance> {
  receive(model: LeaveBalance): LeaveBalance {
    return model;
  }

  send(model: Partial<LeaveBalance>): Partial<LeaveBalance> {
    const payload = { ...model };
    delete payload.userName;
    delete payload.leaveTypeName;

    return payload;
  }
}
