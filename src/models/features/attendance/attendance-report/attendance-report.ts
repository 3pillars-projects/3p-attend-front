import { BaseCrudModel } from '@/abstracts/base-crud-model';
import { InterceptModel } from 'cast-response';
import { UserProfile } from '../../user-profile/user-profile';
import { AttendanceReportService } from '@/services/features/attendance-report.service';
import { AttendanceReportInterceptor } from '@/model-interceptors/features/attendance-report.interceptor';
import { FactoryService } from '@/services/factory-service';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { formatMinutes } from '@/utils/general-helper';
import { ATTENDANCE_STATUS_ENUM } from '@/enums/attendance-status-enum';

const { send, receive } = new AttendanceReportInterceptor();

@InterceptModel({ send, receive })
export default class AttendanceReport extends BaseCrudModel<
  AttendanceReport,
  AttendanceReportService
> {
  override $$__service_name__$$: string = 'AttendanceReportService';

  declare id: number;

  // processing day data
  declare processingDate: Date | string | null;
  declare dayOfWeekIndex: number;

  // user data
  declare userId: number;
  declare nationalId: string;
  declare fullNameEn: string;
  declare fullNameAr: string;
  declare departmentId?: number | null;
  declare departmentNameEn?: string | null;
  declare departmentNameAr?: string | null;
  declare isActive: boolean;
  declare canLeaveWithoutFingerPrint: boolean;

  // processed data
  declare holidayId?: number | null;
  declare holidayNameEn?: string | null;
  declare holidayNameAr?: string | null;

  // leave type
  declare leaveTypeId?: number | null;
  declare leaveTypeNameEn?: string | null;
  declare leaveTypeNameAr?: string | null;

  declare shiftId?: number | null;
  declare shiftNameEn?: string | null;
  declare shiftNameAr?: string | null;
  declare shiftType: number;

  declare isWeekend: boolean;

  declare earliestAllowedArrivalDateTime?: Date | string | null;
  declare latestAllowedArrivalDateTime?: Date | string | null;
  declare earliestAllowedDepartureDateTime?: Date | string | null;
  declare latestAllowedDepartureDateTime?: Date | string | null;
  declare isFlexibleShift?: boolean;

  declare missionId?: number | null;
  declare missionNameEn?: string | null;
  declare missionNameAr?: string | null;

  declare isPresenceInquirySucceed?: boolean | null;
  declare firstAttendanceFingerPrint?: Date | string | null;
  declare lastLeaveFingerPrint?: Date | string | null;

  declare attendancePermissionId?: number | null;
  declare midDayPermissionIds?: number[] | null;
  declare leavePermissionId?: number | null;

  declare attendanceStatus: number;
  declare processingStatus: number;

  declare totalOvertimeMinutes: number;
  declare totalMissingMinutes: number;

  // null for days processed before permission-restructuring was deployed
  declare inShiftExtraMinutes?: number | null;
  declare outOfShiftExtraMinutes?: number | null;
  declare unpermittedLateMinutes?: number | null;
  declare unpermittedEarlyLeaveMinutes?: number | null;
  declare penaltyMinutes?: number | null;

  declare creationDate: Date | string | null;
  declare modificationDate?: Date | string | null;
  private languageService?: LanguageService;

  constructor() {
    super();
    this.languageService = FactoryService.getService('LanguageService');
  }
  getShiftName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? this.shiftNameEn!
      : this.shiftNameAr!;
  }
  getMissionName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? this.missionNameEn!
      : this.missionNameAr!;
  }
  getHolidayName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? this.holidayNameEn!
      : this.holidayNameAr!;
  }
  getLeaveTypeName(): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? this.leaveTypeNameEn!
      : this.leaveTypeNameAr!;
  }
  formatNullableMinutes(value?: number | null): string {
    return value == null ? '-' : formatMinutes(value);
  }
  // Extra time (totalOvertimeMinutes = in-shift + out-of-shift) and missing time can both occur
  // on the same day, so each is shown as its own part instead of being netted into one value.
  getTimeDifferenceParts(): { value: string; type: 'overtime' | 'missing' | 'ignore' }[] {
    const parts: { value: string; type: 'overtime' | 'missing' | 'ignore' }[] = [];

    if (this.totalOvertimeMinutes > 0) {
      parts.push({ value: `+ ${formatMinutes(this.totalOvertimeMinutes)}`, type: 'overtime' });
    }

    if (this.totalMissingMinutes > 0) {
      // Missing time on a present fixed-shift day keeps its neutral style
      const isNeutral =
        !this.isFlexibleShift && this.attendanceStatus == ATTENDANCE_STATUS_ENUM.PRESENT;
      parts.push({
        value: `- ${formatMinutes(this.totalMissingMinutes)}`,
        type: isNeutral ? 'ignore' : 'missing',
      });
    }

    if (this.totalOvertimeMinutes === 0 && this.totalMissingMinutes === 0) {
      parts.push({ value: formatMinutes(0), type: 'ignore' });
    }

    return parts;
  }

  getTimeDifferenceValue(): string {
    return this.getTimeDifferenceParts()
      .map((part) => part.value)
      .join(' / ');
  }
}
