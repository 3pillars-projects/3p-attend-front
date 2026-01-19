import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { GENDER_ENUM } from '@/enums/gender-enum';
import { LeaveTypeInterceptor } from '@/model-interceptors/features/business/leave-type.interceptor';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { CustomValidators } from '@/validators/custom-validators';
import { Validators } from '@angular/forms';
import { InterceptModel } from 'cast-response';
const { send, receive } = new LeaveTypeInterceptor();

@InterceptModel({ send, receive })
export class LeaveType extends BaseCrudModel<LeaveType, LeaveTypeService> {
  override $$__service_name__$$: string = 'LeaveTypeService';

  declare nameAr: string;
  declare nameEn: string;
  declare isActive: boolean;
  declare canApplyOnHalfDay: boolean;
  declare isBalanceTransferrable: boolean;
  declare needManagerApproval: boolean;
  declare needHRApproval: boolean;
  declare hasAnnualBalance: boolean;
  declare annualBalance?: number;
  declare hasLimitedTimesDuringServicePeriod: boolean;
  declare availableTimesDuringServicePeriod: number;
  declare continuousDaysLimit: number;
  declare areHolidaysAndWeekendsIncludedInLeave: boolean;
  declare canApplyInPastOnly: boolean;
  declare canApplyInFutureOnly: boolean;
  declare canApplyInPresentOnly: boolean;
  declare genderType: number; // 0 = both, 1 = male, 2 = female...
  declare monthsOfExperienceRequired: number;
  declare months: number;
  declare years: number;
  declare minAge?: number;
  declare religion?: number;
  declare requireAttachment: boolean;

  buildForm() {
    const {
      nameAr,
      nameEn,
      isActive,
      canApplyOnHalfDay,
      isBalanceTransferrable,
      needManagerApproval,
      needHRApproval,
      hasAnnualBalance,
      annualBalance,
      hasLimitedTimesDuringServicePeriod,
      availableTimesDuringServicePeriod,
      continuousDaysLimit,
      areHolidaysAndWeekendsIncludedInLeave,
      canApplyInPastOnly,
      canApplyInFutureOnly,
      canApplyInPresentOnly,
      genderType,
      months,
      years,
      minAge,
      requireAttachment,
      religion,
    } = this;

    const form = {
      nameAr: [
        nameAr,
        [Validators.required, Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)],
      ],
      nameEn: [
        nameEn,
        [Validators.required, Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)],
      ],

      isActive: [isActive ?? true, [Validators.required]],
      canApplyOnHalfDay: [canApplyOnHalfDay ?? false, [Validators.required]],
      isBalanceTransferrable: [isBalanceTransferrable ?? true, [Validators.required]],
      needManagerApproval: [needManagerApproval ?? false, [Validators.required]],
      needHRApproval: [needHRApproval ?? false, [Validators.required]],

      hasAnnualBalance: [hasAnnualBalance ?? true, [Validators.required]],
      annualBalance: [
        annualBalance,
        [
          Validators.min(CustomValidators.defaultLengths.ANNUAL_BALANCE_MIN),
          Validators.max(CustomValidators.defaultLengths.ANNUAL_BALANCE_MAX),
        ],
      ], // add conditional validators when hasAnnualBalance = true
      hasLimitedTimesDuringServicePeriod: [
        hasLimitedTimesDuringServicePeriod ?? null,
        [Validators.required],
      ],
      availableTimesDuringServicePeriod: [
        availableTimesDuringServicePeriod,
        [
          Validators.min(CustomValidators.defaultLengths.AVAILABLE_TIMES_DURING_SERVICE_PERIOD_MIN),
          Validators.max(CustomValidators.defaultLengths.AVAILABLE_TIMES_DURING_SERVICE_PERIOD_MAX),
        ],
      ], // conditional validators when hasLimitedTimesDuringServicePeriod = true

      continuousDaysLimit: [
        continuousDaysLimit,
        [
          Validators.required,
          Validators.min(CustomValidators.defaultLengths.CONTINUOUS_DAYS_LIMIT_MIN),
          Validators.max(CustomValidators.defaultLengths.CONTINUOUS_DAYS_LIMIT_MAX),
        ],
      ],
      areHolidaysAndWeekendsIncludedInLeave: [
        areHolidaysAndWeekendsIncludedInLeave ?? false,
        [Validators.required],
      ],

      canApplyInPastOnly: [canApplyInPastOnly ?? true, [Validators.required]],
      canApplyInPresentOnly: [canApplyInPresentOnly ?? true, [Validators.required]],
      canApplyInFutureOnly: [canApplyInFutureOnly ?? true, [Validators.required]],

      genderType: [genderType ?? GENDER_ENUM.BOTH /* Both */, [Validators.required]],

      minAge: [
        minAge,
        [
          Validators.min(CustomValidators.defaultLengths.MIN_AGE),
          Validators.max(CustomValidators.defaultLengths.MAX_AGE),
        ],
      ],
      months: [
        months,
        [
          Validators.min(CustomValidators.defaultLengths.MONTHS_MIN),
          Validators.max(CustomValidators.defaultLengths.MONTHS_MAX),
        ],
      ],
      years: [
        years,
        [
          Validators.min(CustomValidators.defaultLengths.YEARS_MIN),
          Validators.max(CustomValidators.defaultLengths.YEARS_MAX),
        ],
      ],
      requireAttachment: [requireAttachment ?? false, [Validators.required]],
      religion: [religion, []],
    };

    return form;
  }
}
