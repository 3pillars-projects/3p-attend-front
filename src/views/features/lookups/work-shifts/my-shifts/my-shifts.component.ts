import { Select } from 'primeng/select';
import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { WorkDaysPopupComponent } from '../work-days-popup/work-days-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import EmployeeShift from '@/models/features/lookups/work-shifts/employee-shift';
import { ShiftService } from '@/services/features/lookups/shift.service';
import { CityFilter } from '@/models/features/lookups/city/city-filter';
import { EmployeeShiftsFilter } from '@/models/features/lookups/work-shifts/employee-shifts-filter';
import { PaginationInfo } from '@/models/shared/response/pagination-info';
import { PaginationParams } from '@/models/shared/pagination-params';
import { OptionsContract } from '@/contracts/options-contract';
import { MyShiftsService } from '@/services/features/lookups/my-shifts.service';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { CustomValidators } from '@/validators/custom-validators';
import * as XLSX from 'xlsx';
import {
  changeTimeSuffix,
  convertUtcToSystemTimeZone,
  dateToTimeString,
  formatDateTo12Hour,
  formatTimeTo12Hour,
  timeStringToDate,
  toDateOnly,
} from '@/utils/general-helper';
import { WorkDaysSetting } from '@/models/features/setting/work-days-setting';
import { Accordion, AccordionModule } from 'primeng/accordion';
@Component({
  selector: 'app-my-shifts',
  imports: [
    Breadcrumb,
    InputTextModule,
    TableModule,
    CommonModule,
    RouterModule,
    CommonModule,
    PaginatorModule,
    DatePickerModule,
    FormsModule,
    TranslatePipe,
    AccordionModule,
    Select
  ],
  templateUrl: './my-shifts.component.html',
  styleUrl: './my-shifts.component.scss',
})
export default class MyShiftsComponent extends BaseListComponent<
  EmployeeShift,
  WorkDaysPopupComponent,
  MyShiftsService,
  EmployeeShiftsFilter
> {
  // Required by BaseListComponent
  filterModel: EmployeeShiftsFilter = new EmployeeShiftsFilter();
  dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  filterOptions: EmployeeShiftsFilter = new EmployeeShiftsFilter();
  defaultWorkDays: WorkDaysSetting = new WorkDaysSetting();
  employeeShifts: EmployeeShift[] = [];
  currentShift: EmployeeShift | null = null;
  service = inject(MyShiftsService);
  languageService = inject(LanguageService);
  locale: 'en-US' | 'ar-EG' = 'en-US';

  override initListComponent(): void {
    this.locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
    this.loadInitialData();

    if (this.currentShift?.timeTo) {
      this.currentShift.timeTo = dateToTimeString(
        convertUtcToSystemTimeZone(timeStringToDate(this.currentShift.timeTo))
      ) as string;
    }
    if (this.currentShift?.timeFrom) {
      this.currentShift.timeFrom = dateToTimeString(
        convertUtcToSystemTimeZone(timeStringToDate(this.currentShift.timeFrom))
      ) as string;
    }

    this.languageService.languageChanged$.subscribe(() => {
      this.locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
      // Format multiple shifts
      this.employeeShifts?.forEach((shift) => {
        changeTimeSuffix(
          this.isCurrentLanguageEnglish.bind(this),
          shift,
          'timeFrom',
          'formattedTimeFrom'
        );
        changeTimeSuffix(
          this.isCurrentLanguageEnglish.bind(this),
          shift,
          'timeTo',
          'formattedTimeTo'
        );
      });

      // Format current shift
      if (this.currentShift) {
        changeTimeSuffix(
          this.isCurrentLanguageEnglish.bind(this),
          this.currentShift,
          'timeFrom',
          'formattedTimeFrom'
        );
        changeTimeSuffix(
          this.isCurrentLanguageEnglish.bind(this),
          this.currentShift,
          'timeTo',
          'formattedTimeTo'
        );
      }
    });
  }

  protected override getBreadcrumbKeys() {
    return [{ labelKey: 'MY_SHIFTS.MY_SHIFTS' }];
  }
  protected override mapModelToExcelRow(model: EmployeeShift): { [key: string]: any } {
    return {
      [this.translateService.instant('MY_SHIFTS.NAME_ARABIC')]: model.nameAr || '',
      [this.translateService.instant('MY_SHIFTS.NAME_ENGLISH')]: model.nameEn || '',
      [this.translateService.instant('MY_SHIFTS.START_DATE')]: model.startDate,
      [this.translateService.instant('MY_SHIFTS.END_DATE')]: model.endDate,
      [this.translateService.instant('MY_SHIFTS.TIME_FROM_TO')]:
        `${model.formattedTimeFrom} - ${model.formattedTimeTo}`,
      [this.translateService.instant('MY_SHIFTS.ATTENDANCE_BUFFER')]: model.attendanceBuffer ?? '',
      [this.translateService.instant('MY_SHIFTS.LEAVE_BUFFER')]: model.leaveBuffer ?? '',
    };
  }

  openDialog(shift: EmployeeShift): void {
    const viewMode = ViewModeEnum.EDIT;
    const lookups = {
      defaultWorkDays: [this.defaultWorkDays],
    };
    this.openBaseDialog(WorkDaysPopupComponent as any, shift, viewMode, lookups);
  }

  private loadInitialData(): void {
    const resolverData = this.activatedRoute.snapshot.data['list'];

    this.employeeShifts = resolverData.myShifts.list || [];
    this.list = this.employeeShifts; // Update base class list
    this.paginationInfo = {
      ...new PaginationInfo(),
      ...resolverData.myShifts.paginationInfo,
      totalItems: resolverData.myShifts.paginationInfo.totalItems || 0,
    };
    this.defaultWorkDays = resolverData.defaultworkDays;
    // Load current shift data
    this.currentShift = resolverData.currentShift || null;
  }

  getCurrentShiftName(): string {
    return this.langService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (this.currentShift?.nameEn as string)
      : (this.currentShift?.nameAr as string);
  }

  override search(isStoredProcedure: boolean = false): void {
    this.appliedFilterModel = { ...this.filterModel };
    this.first = 0;
    this.paginationParams.pageNumber = 1;
    this.paginationParams.pageSize = this.rows;

    // Sync filter options
    this.syncFilters();

    const filterOptions = this.convertFilterToOptions(this.filterModel);

    this.service.getMyShifts(this.paginationParams, filterOptions).subscribe({
      next: (response) => {
        this.handleSearchSuccess(response);
      },
      error: (error) => {
        this.handleLoadListError();
      },
    });
  }
  override resetSearch(isStoredProcedure: boolean = false): void {
    this.filterModel = new EmployeeShiftsFilter();
    this.appliedFilterModel = new EmployeeShiftsFilter();
    this.filterOptions = new EmployeeShiftsFilter();
    this.paginationParams.pageNumber = 1;
    this.paginationParams.pageSize = 10;
    this.first = 0;
    this.loadShifts();
  }

  // Custom reset method for template
  onResetFilters(): void {
    this.resetSearch();
  }

  // Custom search method for template
  onSearch(): void {
    this.syncFilters();
    this.search();
  }

  // Page change - override base class method
  override onPageChange(event: PaginatorState, isStoredProcedure: boolean = false): void {
    this.first = event.first!;
    this.rows = event.rows!;
    this.paginationParams.pageNumber = Math.floor(this.first / this.rows) + 1;
    this.paginationParams.pageSize = this.rows;
    this.loadShifts(this.paginationParams.pageNumber);
  }

  private loadShifts(page: number = 1): void {
    this.paginationParams.pageNumber = page;
    this.paginationParams.pageSize = this.rows;

    // Update filter dates

    const filterOptions = this.convertFilterToOptions(this.filterModel);

    this.service.getMyShifts(this.paginationParams, filterOptions).subscribe({
      next: (response) => {
        this.handleSearchSuccess(response);
      },
      error: (error) => {
        this.handleLoadListError();
      },
    });
  }

  // Handle successful responses
  private handleSearchSuccess(response: any): void {
    this.employeeShifts = response.list || [];
    this.list = this.employeeShifts;

    this.convertTimeFormatToTwelve();
    this.updatePaginationInfo(response);
  }

  convertTimeFormatToTwelve() {
    this.employeeShifts?.forEach((shift) => {
      changeTimeSuffix(
        this.isCurrentLanguageEnglish.bind(this),
        shift,
        'timeFrom',
        'formattedTimeFrom'
      );
      changeTimeSuffix(
        this.isCurrentLanguageEnglish.bind(this),
        shift,
        'timeTo',
        'formattedTimeTo'
      );
    });
  }

  private handleLoadSuccess(response: any): void {
    this.employeeShifts = response.list || [];
    this.list = this.employeeShifts;
    this.updatePaginationInfo(response);
  }

  private updatePaginationInfo(response: any): void {
    if (response.paginationInfo) {
      this.paginationInfo = {
        ...new PaginationInfo(),
        ...response.paginationInfo,
        totalItems: response.paginationInfo.totalItems || 0,
      };
    } else {
      this.paginationInfo.totalItems = this.employeeShifts.length;
    }
  }

  // Sync between template filters and model filters
  private syncFilters(): void {
    this.filterModel.nameAr = this.filterOptions.nameAr;
    this.filterModel.nameEn = this.filterOptions.nameEn;
    this.filterModel.startDate = this.filterOptions.startDate;
    this.filterModel.endDate = this.filterOptions.endDate;
  }

  // Convert filter to options contract
  private convertFilterToOptions(filter: EmployeeShiftsFilter): OptionsContract {
    const options: OptionsContract = {};

    if (filter.nameAr) options['nameAr'] = filter.nameAr;
    if (filter.nameEn) options['nameEn'] = filter.nameEn;
    if (filter.startDate) options['startDate'] = filter.startDate;
    if (filter.endDate) options['endDate'] = filter.endDate;

    return options;
  }

  // Additional utility methods
  getTotalRecords(): number {
    return this.paginationInfo?.totalItems || 0;
  }

  isCurrentLanguageEnglish(): boolean {
    return this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;
  }

  onExportExcel(): void {
    this.exportExcel('my-shifts.xlsx');
  }

  override exportExcel(fileName: string = 'my-shifts.xlsx', isStoredProcedure?: boolean): void {
    const allDataParams = {
      ...this.paginationParams,
      pageNumber: 1,
      pageSize: CustomValidators.defaultLengths.INT_MAX,
    };

    const fetchAll = this.service.getMyShifts(allDataParams, { ...this.appliedFilterModel! });

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
  get startDate() {
    return this.filterOptions.startDate as Date;
  }

  get endDate() {
    return this.filterOptions.endDate as Date;
  }
}
