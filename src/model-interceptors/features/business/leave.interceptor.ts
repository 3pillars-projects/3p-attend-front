import { Leave } from '@/models/features/business/leave/leave';
import { ModelInterceptorContract } from 'cast-response';

export class LeaveInterceptor implements ModelInterceptorContract<Leave> {
  receive(model: Leave): Leave {
    return model;
  }

  send(model: Partial<Leave>): Partial<Leave> {
    delete model.leaveType;
    delete model.employee;
    delete model.department;
    delete model.canTakeAction;
    return model;
  }
}
