import EmployeeShift from '@/models/features/lookups/work-shifts/employee-shift';
import {
  convertUtcToSystemTimeZone,
  dateToTimeString,
  formatTimeTo12Hour,
  getShiftDuration,
  timeStringToDate,
  toDateOnly,
} from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class MyShiftsInterceptor implements ModelInterceptorContract<EmployeeShift> {
  receive(model: EmployeeShift): EmployeeShift {
    model.startDate = toDateOnly(model.startDate);
    model.endDate = toDateOnly(model.endDate);
    model.shiftDuration = getShiftDuration(model.timeFrom, model.timeTo);
    model.timeFrom =
      model.timeFrom &&
      (dateToTimeString(
        convertUtcToSystemTimeZone(timeStringToDate(model.timeFrom as string))
      ) as string);
    model.timeTo =
      model.timeTo &&
      (dateToTimeString(
        convertUtcToSystemTimeZone(timeStringToDate(model.timeTo as string))
      ) as string);
    return model;
  }

  send(model: Partial<EmployeeShift>): Partial<EmployeeShift> {
    delete model.shiftDuration;
    return model;
  }
}
