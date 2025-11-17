import { StartDayOfMonthSetting } from '@/models/features/setting/start-day-of-month-setting';
import { ModelInterceptorContract } from 'cast-response';

export class StartDayOfMonthSettingInterceptor
  implements ModelInterceptorContract<StartDayOfMonthSetting>
{
  send(model: Partial<StartDayOfMonthSetting>): Partial<StartDayOfMonthSetting> {
    return model;
  }

  receive(model: StartDayOfMonthSetting): StartDayOfMonthSetting {
    return model;
  }
}
