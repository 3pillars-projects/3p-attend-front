import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MatDialogConfig } from '@angular/material/dialog';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { ConfirmationService } from '@/services/shared/confirmation.service';
import { AlertService } from '@/services/shared/alert.service';
import { AttendanceLogPopupComponent } from '../attendance-log-popup/attendance-log-popup.component';
import { AttendanceService } from '@/services/features/attendance-log.service';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { InputTextModule } from 'primeng/inputtext';
import { LanguageService } from '@/services/shared/language.service';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { DepartmentService } from '@/services/features/lookups/department.service';
import { UserService } from '@/services/features/user.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { AttendanceLog } from '@/models/features/attendance/attendance-log/attendance-log';
import { AttendanceLogFilter } from '@/models/features/attendance/attendance-log/attendance-log-filter';
import { UsersWithDepartmentLookup } from '@/models/auth/users-department-lookup';
import { BooleanOptionModel } from '@/models/shared/boolean-option';
import { PROCESSING_STATUS_OPTIONS } from '@/models/shared/processing-status-option';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registerIBMPlexArabicFont } from '../../../../../public/assets/fonts/ibm-plex-font';
import { formatSwipeTime } from '@/utils/general-helper';
import { MyAttendanceLogFilter } from '@/models/features/attendance/attendance-log/my-attendance-log-filter';
import { CustomValidators } from '@/validators/custom-validators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-my-attendance-log-list',
  imports: [
    FormsModule,
    Select,
    DatePickerModule,
    FluidModule,
    TableModule,
    CommonModule,
    RouterModule,
    SplitButtonModule,
    PaginatorModule,
    TranslatePipe,
    InputTextModule,
  ],
  templateUrl: './my-attendance-log-list.component.html',
  styleUrl: './my-attendance-log-list.component.scss',
  providers: [MessageService],
})
export default class MyAttendanceLogListComponent
  extends BaseListComponent<
    AttendanceLog,
    AttendanceLogPopupComponent,
    AttendanceService,
    MyAttendanceLogFilter
  >
  implements OnInit, OnChanges
{
  @Input() isActive: boolean = false;
  @Input() creators: BaseLookupModel[] = [];
  private hasInitialized: boolean = false;

  languageService = inject(LanguageService);
  departmentService = inject(DepartmentService);
  userService = inject(UserService);
  attendanceService = inject(AttendanceService);

  actionList: MenuItem[] = [];
  channels: BaseLookupModel[] = [];

  filterModel: MyAttendanceLogFilter = new MyAttendanceLogFilter();
  processingStatusOptions: BooleanOptionModel[] = PROCESSING_STATUS_OPTIONS;

  confirmationService = inject(ConfirmationService);

  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  override get service() {
    return this.attendanceService;
  }

  get optionLabel(): string {
    const lang = this.languageService.getCurrentLanguage();
    return lang === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  override loadListSP() {
    return this.service.loadMyAttendanceLogPaginatedSP(this.paginationParams, {
      ...this.appliedFilterModel!,
    });
  }

  isCurrentLanguageEnglish() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH;
  }

  override initListComponent(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActive']) {
      const current = changes['isActive'].currentValue;
      const previous = changes['isActive'].previousValue;

      // Skip first trigger after component init
      if (!this.hasInitialized) {
        this.hasInitialized = true;
        return;
      }

      // Only load data if tab is active and this is not the initial change
      if (current === true && previous === false) {
        this.filterModel = {} as MyAttendanceLogFilter;
        this.appliedFilterModel = {} as MyAttendanceLogFilter;
        this.loadDataIfNeeded();
      }
    }
  }

  private loadDataIfNeeded(): void {
    // Load data when tab becomes active
    this.loadListSP().subscribe({
      next: (response) => this.handleLoadListSuccess(response),
      error: this.handleLoadListError,
    });
  }

  protected override getBreadcrumbKeys() {
    return [];
  }

  override openDialog(attendanceLog?: AttendanceLog): void {
    throw new Error('Method not implemented.');
  }

  onCreatorChange(creatorId: number | undefined) {
    this.filterModel.creatorId = creatorId ?? undefined;
  }

  onChannelChange(channelName: string | undefined) {
    this.filterModel.channelName = channelName ?? undefined;
  }

  formatSwipeTimeArEn(swipeTime: string | Date | undefined): { date: string; time: string } {
    if (!swipeTime) return { date: '', time: '' };
    const locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
    const { date, time } = formatSwipeTime(swipeTime.toString(), locale);
    return { date, time };
  }

  swipeTimeArEn(swipeTime: string | Date | undefined): string {
    const { date, time } = this.formatSwipeTimeArEn(swipeTime);
    return `${date} ${time}`;
  }

  getProcessingStatusClass(isProcessed: boolean): string {
    return isProcessed ? 'bg-[#ecfdf3] text-[#085d3a]' : 'bg-[#fffaeb] text-[#93370d]';
  }

  getProcessingStatusDotClass(isProcessed: boolean): string {
    return isProcessed ? 'bg-[#085d3a]' : 'bg-[#93370d]';
  }

  set swipeDateFrom(value: Date | undefined) {
    this.filterModel.swipeDateFrom = value;

    // If dateTo is before dateFrom, reset or adjust it
    if (this.filterModel.swipeDateFrom && value && this.filterModel.swipeDateFrom < value) {
      this.filterModel.swipeDateFrom = value; // or set it to value
    }
  }
  get swipeDateFrom(): Date | undefined {
    return this.filterModel.swipeDateFrom;
  }

  exportPdf(fileName: string = 'Attendance_Logs_List.pdf'): void {
    const allDataParams = {
      ...this.paginationParams,
      pageNumber: 1,
      pageSize: CustomValidators.defaultLengths.INT_MAX, // fetch all
    };

    const isRTL = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;

    this.service.loadMyAttendanceLogPaginatedSP(allDataParams, this.appliedFilterModel!).subscribe({
      next: (response) => {
        const allData = response?.list || [];

        if (!allData.length) return;

        // Transform data for PDF
        const transformedData = allData.map((model) => ({
          // hidden for release 1
          // [this.translateService.instant('ATTENDANCE_LOG_PAGE.PROCESSING_STATUS')]:
          //   this.translateService.instant('ATTENDANCE_LOG_PAGE.PROCESSING'),
          [this.translateService.instant('ATTENDANCE_LOG_PAGE.CREATOR_EN')]:
            model.creatorNameEn ?? 'System',
          [this.translateService.instant('ATTENDANCE_LOG_PAGE.CREATOR_AR')]:
            model.creatorNameAr ?? 'النظام',
          [this.translateService.instant('ATTENDANCE_LOG_PAGE.CHANNEL_NAME')]:
            this.getDeviceName(model),
          [this.translateService.instant('ATTENDANCE_LOG_PAGE.SWIPE_TIME')]: this.swipeTimeArEn(
            model.swipeTime
          ),
        }));

        const formatCell = (val: any): string | number => {
          if (val instanceof Date) {
            return val.toLocaleString();
          }
          return val != null ? val : '';
        };

        const head = [Object.keys(transformedData[0])];
        const body = transformedData.map((row) => Object.values(row).map(formatCell));

        const doc = new jsPDF({
          orientation: 'landscape',
          format: 'a4',
        });

        registerIBMPlexArabicFont(doc);

        // Calculate column width limit
        const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10 margin left/right
        const colCount = head[0].length;
        const maxColWidth = pageWidth / colCount;

        // Build columnStyles with same maxWidth for all columns
        const columnStyles: { [key: number]: any } = {};
        for (let i = 0; i < colCount; i++) {
          columnStyles[i] = { cellWidth: maxColWidth };
        }

        autoTable(doc, {
          head,
          body,
          styles: {
            font: 'IBMPlexSansArabic',
            fontStyle: 'normal',
            halign: isRTL ? 'right' : 'left',
          },
          headStyles: {
            font: 'IBMPlexSansArabic',
            fontStyle: 'normal',
            halign: isRTL ? 'right' : 'left',
          },
          margin: { right: 10, left: 10 },
          /** 👇 Limit max column width by index */
          columnStyles,
          didDrawPage: () => {
            const title = isRTL ? 'قائمة سجل الحضور والانصراف' : 'Attendance Log List';
            doc.setFont('IBMPlexSansArabic');
            doc.setFontSize(12);
            doc.text(title, isRTL ? doc.internal.pageSize.getWidth() - 20 : 10, 10, {
              align: isRTL ? 'right' : 'left',
            });
          },
        });

        doc.save(fileName);
      },
      error: (err) => {
        console.error('Failed to fetch data for PDF export:', err);
        // Optional: show error toast
      },
    });
  }

  override exportExcel(fileName: string = 'data.xlsx', isStoredProcedure: boolean = false): void {
    const allDataParams = {
      ...this.paginationParams,
      pageNumber: 1,
      pageSize: CustomValidators.defaultLengths.INT_MAX,
    };

    const fetchAll = isStoredProcedure
      ? this.service.loadMyAttendanceLogPaginatedSP(allDataParams, { ...this.appliedFilterModel! })
      : this.service.loadPaginated(allDataParams, { ...this.appliedFilterModel! });

    fetchAll.subscribe({
      next: (response) => {
        const fullList = response.list || [];
        if (fullList.length === 0) {
          this.alertsService.showErrorMessage({ messages: ['COMMON.NO_DATA_TO_EXPORT'] });
          return;
        } else {
          const isRTL = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
          const transformedData = fullList.map((item) => this.mapModelToExcelRow(item));
          const ws = XLSX.utils.json_to_sheet(transformedData);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          wb.Workbook = { Views: [{ RTL: isRTL }] };
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, fileName);
        }
      },
      error: (_) => {
        this.alertsService.showErrorMessage({ messages: ['COMMON.ERROR'] });
      },
    });
  }

  protected override mapModelToExcelRow(model: AttendanceLog): { [key: string]: any } {
    return {
      [this.translateService.instant('ATTENDANCE_LOG_PAGE.SWIPE_TIME')]: this.swipeTimeArEn(
        model.swipeTime
      ),
      [this.translateService.instant('ATTENDANCE_LOG_PAGE.CHANNEL_NAME')]:
        this.getDeviceName(model),
      [this.translateService.instant('ATTENDANCE_LOG_PAGE.CREATOR_EN')]:
        model.creatorNameEn ?? 'System',
      [this.translateService.instant('ATTENDANCE_LOG_PAGE.CREATOR_AR')]:
        model.creatorNameAr ?? 'النظام',
    };
  }

  getDeviceName(attendanceLog: AttendanceLog) {
    if (attendanceLog.channelName) {
      return attendanceLog.channelName;
    } else {
      return attendanceLog.isRawData
        ? ''
        : this.translateService.instant('ATTENDANCE_LOG_PAGE.MANUAL');
    }
  }
}
