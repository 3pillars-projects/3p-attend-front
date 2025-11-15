import { BaseCrudService } from '@/abstracts/base-crud-service';
import { MonthDay } from '@/models/features/setting/month-day';
import { StartDayOfMonthSetting } from '@/models/features/setting/start-day-of-month-setting';
import { ResponseData } from '@/models/shared/response/response-data';
import { Injectable } from '@angular/core';
import {
  CastResponse,
  CastResponseContainer,
  HasInterception,
  InterceptParam,
} from 'cast-response';
import { map, Observable, of, switchMap } from 'rxjs';

@CastResponseContainer({
  $default: {
    model: () => StartDayOfMonthSetting,
  },
  $get: {
    model: () => StartDayOfMonthSetting,
    unwrap: 'data',
    shape: { data: () => StartDayOfMonthSetting },
  },
})
@Injectable({
  providedIn: 'root',
})
export class StartDayOfMonthSettingService extends BaseCrudService<StartDayOfMonthSetting> {
  serviceName = 'StartDayOfMonthSettingService';

  override getUrlSegment(): string {
    return this.urlService.URLS.GENERAL_SETTINGS;
  }

  // getMonthDays(): Observable<MonthDay> {
  //   return this.http
  //     .get<ResponseData<MonthDay>>(this.getUrlSegment() + '/' + 'GetMonthDays', {
  //       withCredentials: true,
  //     })
  //     .pipe(
  //       switchMap((response: ResponseData<MonthDay>) => {
  //         return of(response.data);
  //       })
  //     );
  // }

  @CastResponse(undefined, { fallback: '$get' })
  @HasInterception
  getSelectedStartDayOfMonth(): Observable<StartDayOfMonthSetting> {
    return this.http
      .get<ResponseData<StartDayOfMonthSetting>>(
        this.getUrlSegment() + '/' + 'GetSelectedStartDayOfMonth',
        {
          withCredentials: true,
        }
      )
      .pipe(
        switchMap((response: ResponseData<StartDayOfMonthSetting>) => {
          return of(response.data);
        })
      );
  }

  @CastResponse(undefined, { fallback: '$default' })
  @HasInterception
  setStartDayOfMonth(dayNumber: number): Observable<StartDayOfMonthSetting> {
    const url = `${this.getUrlSegment()}/SetStartDayOfMonth`;
    return this.http
      .put<ResponseData<StartDayOfMonthSetting>>(url, dayNumber, { withCredentials: true })
      .pipe(map((response) => response.data));
  }
}
