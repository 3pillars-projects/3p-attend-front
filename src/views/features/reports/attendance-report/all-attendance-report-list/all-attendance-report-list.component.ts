import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import AttendanceReport from '@/models/features/attendance/attendance-report/attendance-report';
import { AttendanceReportFilter } from '@/models/features/attendance/attendance-report/attendance-report-filter';
import { AttendanceReportService } from '@/services/features/attendance-report.service';
import { LanguageService } from '@/services/shared/language.service';
import { CustomValidators } from '@/validators/custom-validators';
import * as XLSX from 'xlsx';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { DepartmentService } from '@/services/features/lookups/department.service';
import {
  ATTENDANCE_STATUS_ENUM,
  ATTENDANCE_STATUS_CONFIG,
  ATTENDANCE_STATUS_OPTIONS,
} from '@/enums/attendance-status-enum';
import { SHIFT_TYPE_ENUM } from '@/enums/shift-type-enum';
import { formatDateTo12Hour } from '@/utils/general-helper';
import { UserService } from '@/services/features/user.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { PermissionRequestPopupComponent } from '../permission-request-popup/permission-request-popup.component';
@Component({
  selector: 'app-all-attendance-report-list',
  imports: [
    InputTextModule,
    TableModule,
    CommonModule,
    RouterModule,
    CommonModule,
    PaginatorModule,
    DatePickerModule,
    FormsModule,
    Select,
    TranslatePipe,
  ],
  providers: [DatePipe],

  templateUrl: './all-attendance-report-list.component.html',
  styleUrl: './all-attendance-report-list.component.scss',
})
export class AllAttendanceReportListComponent extends BaseListComponent<
  AttendanceReport,
  any, // No dialog for now, replace if needed
  AttendanceReportService,
  AttendanceReportFilter
> {
  override dialogSize = {
    width: '100%',
    maxWidth: '800px',
  };

  dialogSize2 = {
    width: '100%',
    maxWidth: '1024px',
  };

  openDialog2(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(PermissionRequestPopupComponent as any, dialogConfig);

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      console.log('closed');
    });
  }

  attendanceReportService = inject(AttendanceReportService);
  filterModel: AttendanceReportFilter = new AttendanceReportFilter();
  languageService = inject(LanguageService);
  datePipe = inject(DatePipe);
  departments: BaseLookupModel[] = [];
  departmentService = inject(DepartmentService);
  userService = inject(UserService);
  shiftType = SHIFT_TYPE_ENUM;
  attendanceStatuses = ATTENDANCE_STATUS_OPTIONS; // import from your enum file

  override get service() {
    return this.attendanceReportService;
  }

  override initListComponent(): void {
    // this.departmentService.getLookup().subscribe((res) => {
    //   this.departments = res;
    // });
    this.userService.getMyDepartmentsLookup().subscribe((res) => {
      this.departments = res;
    });
  }

  protected override getBreadcrumbKeys() {
    return [{ labelKey: 'ATTENDANCE_REPORT_PAGE.TITLE' }];
  }

  override openDialog(model: AttendanceReport): void {
    // No dialog currently needed for Attendance Reports
  }

  protected override mapModelToExcelRow(model: AttendanceReport): { [key: string]: any } {
    return {
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.EMPLOYEE_NAME')]:
        this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH
          ? model.fullNameEn
          : model.fullNameAr,
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.NATIONAL_ID')]: model.nationalId,
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.DEPARTMENT')]:
        this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH
          ? model.departmentNameEn
          : model.departmentNameAr,
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.DATE')]: this.formatDate(
        model.processingDate
      ),

      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.SHIFT_NAME')]: model.getShiftName(),
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.SHIFT_TYPE')]:
        model.shiftType === SHIFT_TYPE_ENUM.DEFAULT
          ? this.translateService.instant('ATTENDANCE_REPORT_PAGE.DEFAULT_SHIFT')
          : this.translateService.instant('ATTENDANCE_REPORT_PAGE.SPECIAL_SHIFT'),
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.LEAVE_NAME')]: model.getHolidayName(),
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.MISSION_NAME')]:
        model.getMissionName(),
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.PERMISSIONS')]:
        this.getPermissionLabel(model)
          ? this.translateService.instant(this.getPermissionLabel(model))
          : '',
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.CHECKIN_TIME')]: this.formatTime(
        model.firstAttendanceFingerPrint ? new Date(model.firstAttendanceFingerPrint) : undefined
      ),
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.CHECKOUT_TIME')]: this.formatTime(
        model.lastLeaveFingerPrint ? new Date(model.lastLeaveFingerPrint) : undefined
      ),
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.TIME_DIFFERENCE')]:
        model.getTimeDifferenceData().value,
      [this.translateService.instant('ATTENDANCE_REPORT_PAGE.STATUS')]: model.attendanceStatus
        ? this.translateService.instant(this.getStatusConfig(model.attendanceStatus).labelKey)
        : '',
    };
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    return this.datePipe.transform(new Date(date), 'dd-MM-yyyy') ?? '-';
  }
  formatTime(date: Date | null | undefined): string {
    if (!date) return '-';
    const locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
    return formatDateTo12Hour(date, locale);
  }
  override exportExcel(fileName: string = 'AttendanceReports.xlsx'): void {
    const allDataParams = {
      ...this.paginationParams,
      pageNumber: 1,
      pageSize: CustomValidators.defaultLengths.INT_MAX,
    };

    this.service
      .loadPaginated(allDataParams, {
        ...this.appliedFilterModel!,
      })
      .subscribe({
        next: (response) => {
          const fullList = response.list || [];
          if (fullList.length === 0) {
            this.alertsService.showErrorMessage({ messages: ['COMMON.NO_DATA_TO_EXPORT'] });
            return;
          }

          const isRTL = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
          const transformedData = fullList.map((item) => this.mapModelToExcelRow(item));
          const ws = XLSX.utils.json_to_sheet(transformedData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          wb.Workbook = { Views: [{ RTL: isRTL }] };
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, fileName);
        },
        error: (_) => {
          this.alertsService.showErrorMessage({ messages: ['COMMON.ERROR'] });
        },
      });
  }
  set dateFrom(value: Date | null) {
    this.filterModel.dateFrom = value;
    if (this.filterModel.dateTo && value && this.filterModel.dateTo < value) {
      this.filterModel.dateTo = null;
    }
  }

  get dateFrom(): Date | null | undefined {
    return this.filterModel.dateFrom;
  }

  getPropertyName() {
    return this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }
  getStatusConfig(status: ATTENDANCE_STATUS_ENUM) {
    return (
      ATTENDANCE_STATUS_CONFIG[status] ?? ATTENDANCE_STATUS_CONFIG[ATTENDANCE_STATUS_ENUM.ABSENT]
    );
  }
  isCurrentLanguageEnglish() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH;
  }

  getPermissionLabel(att: AttendanceReport): string {
    let count = 0;
    if (att.attendancePermissionId) count++;
    if (att.midDayPermissionId) count++;
    if (att.leavePermissionId) count++;

    const isEnglish = this.isCurrentLanguageEnglish();
    const text = isEnglish ? 'permission' : 'إذن';

    return `${count} ${text}`;
  }

  getTimeDifference(att: AttendanceReport): string {
    const data = att.getTimeDifferenceData();

    if (!data.type) return '';

    const styles = {
      overtime: {
        text: 'text-[#085d3a]',
        border: 'border-[#abefc6]',
        bg: 'bg-[#ecfdf3]',
      },
      missing: {
        text: 'text-[#912018]',
        border: 'border-[#fecdca]',
        bg: 'bg-[#fef3f2]',
      },
      zero: {
        text: 'text-[#085d3a]',
        border: 'border-[#abefc6]',
        bg: 'bg-[#ecfdf3]',
      },
    };

    const style = styles[data.type];

    return `
    <div class="text-[16px] font-medium ${style.text} min-w-[67px] min-h-[24px]
                inline-flex justify-center items-center px-3 gap-1 rounded-full
                border ${style.border} ${style.bg} font-medium">
      ${data.value}
    </div>
  `;
  }
}
