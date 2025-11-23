import { ModelInterceptorContract } from 'cast-response';
import EmployeeShift from '@/models/features/lookups/work-shifts/employee-shift';
import { getShiftDuration } from '@/utils/general-helper';

export class EmployeeShiftInterceptor implements ModelInterceptorContract<EmployeeShift>{
  receive(model: EmployeeShift): EmployeeShift {
    model.shiftDuration = getShiftDuration(model.timeFrom, model.timeTo);
    return model;
  }

  send(model: Partial<EmployeeShift>): Partial<EmployeeShift> {
    return model;
  }
}
