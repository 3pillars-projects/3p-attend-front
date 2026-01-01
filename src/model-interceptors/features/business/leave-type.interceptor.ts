import { LeaveType } from '@/models/features/business/leave-type';
import { convertMonthsToYearsAndMonths, convertYearsAndMonthsToMonths } from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class LeaveTypeInterceptor implements ModelInterceptorContract<LeaveType> {
  receive(model: LeaveType): LeaveType {
    if(model.monthsOfExperienceRequired){
      const { years, months } = convertMonthsToYearsAndMonths(model.monthsOfExperienceRequired);
      model.years = years;
      model.months = months;
    }
    return model;
  }

  send(model: Partial<LeaveType>): Partial<LeaveType> {
    if(model.monthsOfExperienceRequired){
      model.monthsOfExperienceRequired = convertYearsAndMonthsToMonths(model.years!, model.months!);
    }
    return model;
  }
}
