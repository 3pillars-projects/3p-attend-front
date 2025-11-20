import Shift from '@/models/features/lookups/work-shifts/shift';
import {
  convertKsaToUtc,
  convertUtcToSystemTimeZone,
  dateToTimeString,
  timeStringToDate,
  toDateOnly,
  toDateTime,
  toLocalTime,
} from '@/utils/general-helper';
import { ModelInterceptorContract } from 'cast-response';

export class ShiftInterceptor implements ModelInterceptorContract<Shift> {
  receive(model: Shift): Shift {
    model.shiftLogStartDate = toDateTime(model.shiftLogStartDate);
    model.activeShiftStartDate = toDateTime(model.activeShiftStartDate);
    model.isDefaultShiftForm = model.isDefaultShift;
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

  send(model: Partial<Shift>): Partial<Shift> {
    delete model.isDefaultShift;
    delete model.isDefaultShiftForm;

    if (model.activeShiftStartDate) {
      model.activeShiftStartDate = toDateOnly(model.activeShiftStartDate);
    }
    if (model.shiftLogStartDate) {
      model.shiftLogStartDate = toDateOnly(model.shiftLogStartDate);
    }

    if (model.timeFrom) {
      model.timeFrom = dateToTimeString(
        convertKsaToUtc(timeStringToDate(model.timeFrom as string))
      ) as string;
    }

    if (model.timeTo) {
      model.timeTo = dateToTimeString(
        convertKsaToUtc(timeStringToDate(model.timeTo as string))
      ) as string;
    }

    if (model.boundaryTime) {
      model.boundaryTime = dateToTimeString(
        convertKsaToUtc(timeStringToDate(model.boundaryTime as string))
      ) as string;
    }

    return model;
  }
}
