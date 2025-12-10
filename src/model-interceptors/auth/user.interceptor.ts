import { ModelInterceptorContract } from 'cast-response';
import { User } from '@/models/auth/user';
import { getEmployeeCodeWithLeadingZeros, toDateOnly, toDateTime } from '@/utils/general-helper';

export class UserInterceptor implements ModelInterceptorContract<User> {
  receive(model: User): User {
    model.joinDate = toDateTime(model.joinDate);
    return model;
  }

  send(model: Partial<User>): Partial<User> {
    model.nationalId = model.nationalId
      ? getEmployeeCodeWithLeadingZeros(model.nationalId)
      : model.nationalId;
    model.joinDate = toDateOnly(model.joinDate);
    delete model.city;
    delete model.region;
    delete model.department;
    delete (model as any).languageService;
    return model;
  }
}
