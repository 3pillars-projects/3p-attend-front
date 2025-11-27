import UserWorkShift from '@/models/features/lookups/work-shifts/user-work-shifts';
import { toDateOnly } from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class UserWorkShiftInterceptor implements ModelInterceptorContract<UserWorkShift> {
  receive(model: UserWorkShift): UserWorkShift {
    return model;
  }
  send(model: Partial<UserWorkShift>): Partial<UserWorkShift> {
    delete model.employeeNameAr;
    delete model.employeeNameEn;
    delete model.shiftNameAr;
    delete model.shiftNameEn;
    delete (model as any).isFlexibleShift;
    model.startDate = toDateOnly(model.startDate);
    if (model.endDate) model.endDate = toDateOnly(model.endDate);
    return model;
  }
}
