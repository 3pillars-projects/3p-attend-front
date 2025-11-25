import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { Permission } from '@/models/features/lookups/permission/permission';
import {
  toDateTime,
  toDateOnly,
  timeStringToDate,
  convertKsaToUtc,
  dateToTimeString,
  convertUtcToSystemTimeZone,
} from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class LimitedTimePermissionInterceptor
  implements ModelInterceptorContract<LimitedTimePermission>
{
  receive(model: LimitedTimePermission): LimitedTimePermission {
    model.limitedTimePermissionDate = toDateTime(model.limitedTimePermissionDate);
    model.actionDate = model.actionDate ? toDateTime(model.actionDate) : null;

    // ✅ Convert backend string "HH:mm:ss" → Date for binding in p-datepicker
    if (
      model.limitedTimePermissionTimeFrom &&
      typeof model.limitedTimePermissionTimeFrom === 'string'
    ) {
      model.limitedTimePermissionTimeFrom = timeStringToDate(model.limitedTimePermissionTimeFrom);
    }

    return model;
  }

  send(model: Partial<LimitedTimePermission>): Partial<LimitedTimePermission> {
    delete model.limitedTimePermissionType;
    delete model.status;
    delete model.department;
    delete model.creationUser;
    delete (model as any)['languageService'];

    model.limitedTimePermissionDate = toDateOnly(model.limitedTimePermissionDate); //"2025-11-16"
    model.actionDate = model.actionDate ? toDateOnly(model.actionDate) : undefined;

    if (model.limitedTimePermissionTimeFrom) {
      const value = model.limitedTimePermissionTimeFrom as any;
      const timeAsDate = value instanceof Date ? value : timeStringToDate(value as string);

      model.limitedTimePermissionTimeFrom = dateToTimeString(timeAsDate) as string; //"16:42:00"
    }

    return model;
  }
}
