import { ModelInterceptorContract } from 'cast-response';
import { User } from '@/models/auth/user';
import {
  convertMonthsToYearsAndMonths,
  convertYearsAndMonthsToMonths,
  getEmployeeCodeWithLeadingZeros,
  toDateOnly,
  toDateTime,
} from '@/utils/general-helper';

export class UserInterceptor implements ModelInterceptorContract<User> {
  receive(model: User): User {
    model.joinDate = toDateTime(model.joinDate);
    model.birthDate = toDateTime(model.birthDate);
    if (model.insuranceServiceMonths != null) {
      const { years, months } = convertMonthsToYearsAndMonths(model.insuranceServiceMonths);
      model.insuranceServiceYears = years;
      model.insuranceServiceMonths = months;
    }
    return model;
  }

  send(model: Partial<User>): Partial<User> {
    if (model.insuranceServiceYears != null || model.insuranceServiceMonths != null) {
      model.insuranceServiceMonths = convertYearsAndMonthsToMonths(
        model.insuranceServiceYears ?? 0,
        model.insuranceServiceMonths ?? 0
      );
    }

    model.nationalId = model.nationalId
      ? getEmployeeCodeWithLeadingZeros(model.nationalId)
      : model.nationalId;
    model.joinDate = toDateOnly(model.joinDate);
    model.birthDate = toDateOnly(model.birthDate);
    delete model.city;
    delete model.region;
    delete model.department;
    delete model.insuranceServiceYears;
    delete (model as any).languageService;
    return model;
  }
}
