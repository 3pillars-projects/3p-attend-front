import { Leave } from '@/models/features/business/leave/leave';
import { toDateOnly, toDateTime } from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class LeaveInterceptor implements ModelInterceptorContract<Leave> {
  receive(model: Leave): Leave {
   if (model.dateTo) model.dateTo = toDateTime(model.dateTo)!;
   if (model.dateFrom) model.dateFrom = toDateTime(model.dateFrom)!;
    return model;
  }

  send(model: Partial<Leave>): Partial<Leave> {
    if (model.dateTo) model.dateTo = toDateOnly(model.dateTo);
    if (model.dateFrom) model.dateFrom = toDateOnly(model.dateFrom);
    delete model.leaveType;
    delete model.employee;
    delete model.department;
    delete model.canTakeAction;
    return model;
  }
}
