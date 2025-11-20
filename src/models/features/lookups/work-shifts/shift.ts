import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { ShiftInterceptor } from '@/model-interceptors/features/lookups/shift.interceptor';
import { ShiftService } from '@/services/features/lookups/shift.service';
import { timeStringToDate } from '@/utils/general-helper';
import { CustomValidators } from '@/validators/custom-validators';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';

const { send, receive } = new ShiftInterceptor();

@InterceptModel({ send, receive })
export default class Shift extends BaseCrudModel<Shift, ShiftService> {
  override $$__service_name__$$: string = 'ShiftService';
  declare concurrencyUpdateVersion?: Uint8Array;
  declare nameAr?: string;
  declare nameEn?: string;
  declare timeFrom?: string;
  declare timeTo?: string;
  declare boundaryTime?: string;
  declare startAttendanceBuffer?: number;
  declare endAttendanceBuffer?: number;
  declare startLeaveBuffer?: number;
  declare endLeaveBuffer?: number;
  isDefaultShift?: boolean = false;
  declare shiftLogStartDate?: Date | string;
  declare shiftLogId?: number;
  isActive?: boolean = false;
  declare shiftActivationDate?: Date | string;
  declare activeShiftStartDate?: Date | string;
  isDefaultShiftForm?: boolean = false;
  isUpdateOnly: boolean = false;
  isAvailableDefaultShift?: boolean = false;
  declare defaultShiftId?: number;
  isCrossDayShift: boolean = false;
  isFlexibleShift: boolean = false;

  buildForm() {
    const {
      nameAr,
      nameEn,
      timeFrom,
      timeTo,
      boundaryTime,
      startAttendanceBuffer,
      endAttendanceBuffer,
      startLeaveBuffer,
      endLeaveBuffer,
      isCrossDayShift,
      isDefaultShift,
      isDefaultShiftForm,
      isActive,
      shiftLogStartDate,
      isUpdateOnly,
      isFlexibleShift,
    } = this;

    return {
      nameAr: [
        nameAr,
        [
          Validators.required,
          Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
          CustomValidators.pattern('AR_NUM'),
        ],
      ],
      nameEn: [
        nameEn,
        [
          Validators.required,
          Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
          CustomValidators.pattern('ENG_NUM'),
        ],
      ],
      timeFrom: [timeFrom ? timeStringToDate(timeFrom) : null, [Validators.required]],
      timeTo: [timeTo ? timeStringToDate(timeTo) : null, [Validators.required]],
      boundaryTime: [],
      startAttendanceBuffer: [startAttendanceBuffer],
      endAttendanceBuffer: [endAttendanceBuffer],
      startLeaveBuffer: [startLeaveBuffer],
      endLeaveBuffer: [endLeaveBuffer],
      isCrossDayShift: [isCrossDayShift, []],
      isFlexibleShift: [isFlexibleShift, []],
      isDefaultShift: [isDefaultShift, []],
      isDefaultShiftForm: [isDefaultShiftForm],
      shiftLogStartDate: [shiftLogStartDate],
      isActive: [isActive],
      isUpdateOnly: [isUpdateOnly],
    };
  }
}
