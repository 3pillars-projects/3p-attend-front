import { LeaveType } from '@/models/features/business/leave-types/leave-type';
import {
  convertMonthsToYearsAndMonths,
  convertYearsAndMonthsToMonths,
} from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class LeaveTypeInterceptor implements ModelInterceptorContract<LeaveType> {
  receive(model: LeaveType): LeaveType {
    if (model.monthsOfExperienceRequired) {
      const { years, months } = convertMonthsToYearsAndMonths(model.monthsOfExperienceRequired);
      model.years = years;
      model.months = months;
    }
    console.log(model);
    return model;
  }

  send(model: Partial<LeaveType>): Partial<LeaveType> {
    model.monthsOfExperienceRequired = convertYearsAndMonthsToMonths(model.years!, model.months!);

    delete model.years;
    delete model.months;
    return model;
  }
}
