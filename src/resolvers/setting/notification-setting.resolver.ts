import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { NotificationSettingService } from '@/services/features/setting/notification-setting.service';
import { NotificationSetting } from '@/models/features/setting/notification-setting';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { WorkDaysSettingService } from '@/services/features/setting/work-days-setting.service';
import { WorkDaysSetting } from '@/models/features/setting/work-days-setting';
import { StartDayOfMonthSettingService } from '@/services/features/setting/start-day-of-month-setting.service';
import { StartDayOfMonthSetting } from '@/models/features/setting/start-day-of-month-setting';

export const notificationSettingResolver: ResolveFn<
  {
    notificationSetting: NotificationSetting;
    workDays: WorkDaysSetting;
    startDayOfMonth: StartDayOfMonthSetting;
  } | null
> = () => {
  const notificationSettingService = inject(NotificationSettingService);
  const workDaysSettingService = inject(WorkDaysSettingService);
  const startDayOfMonthSettingService = inject(StartDayOfMonthSettingService);
  return forkJoin({
    notificationSetting: notificationSettingService.get(),
    workDays: workDaysSettingService.getWorkDays(),
    startDayOfMonth: startDayOfMonthSettingService.getSelectedStartDayOfMonth(),
  }).pipe(
    catchError((error) => {
      return of(null);
    })
  );
};
