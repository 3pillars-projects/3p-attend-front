import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { StartDayOfMonthSettingInterceptor } from '@/model-interceptors/setting/start-day-of-month.interceptor';
import { StartDayOfMonthSettingService } from '@/services/features/setting/start-day-of-month-setting.service';
import { InterceptModel } from 'cast-response';

const { send, receive } = new StartDayOfMonthSettingInterceptor();

@InterceptModel({ send, receive })
export class StartDayOfMonthSetting extends BaseCrudModel<
  StartDayOfMonthSetting,
  StartDayOfMonthSettingService
> {
  override $$__service_name__$$: string = 'StartDayOfMonthSettingService';
  declare dayOfMonth: number;

  buildForm() {
    const { dayOfMonth } = this;
    return {
      dayOfMonth: [dayOfMonth, []],
    };
  }
}
