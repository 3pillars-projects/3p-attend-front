import { Component, inject, OnInit } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';
import { MenuItem } from '@/models/shared/menu-item';
import { TranslatePipe } from '@ngx-translate/core';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { MatDialogConfig } from '@angular/material/dialog';
import { ViewLimitedTimePermissionPopupComponent } from '../view-limited-time-permission-popup/view-limited-time-permission-popup.component';
import { AddEditLimitedTimePermissionPopupComponent } from '../add-edit-limited-time-permission-popup/add-edit-limited-time-permission-popup.component';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';
import { LimitedTimePermissionFilter } from '@/models/features/lookups/limited-time-permission/limited-time-permission-filter';
import { LanguageService } from '@/services/shared/language.service';
import { LIMITED_TIME_PERMISSION_STATUS_ENUM } from '@/enums/limited-time-permission-status-enum';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { AuthService } from '@/services/auth/auth.service';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LIMITED_TIME_PERMISSION_TABS_ENUM } from '@/enums/limited-time-permission-tabs-enum';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import * as XLSX from 'xlsx';
import { CustomValidators } from '@/validators/custom-validators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationInfo } from '@/models/shared/response/pagination-info';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { formatTimeTo12Hour } from '@/utils/general-helper';
import { LimitedTimePermissionStatusService } from '@/services/features/lookups/limited-time-permission-status.service';
import { LimitedTimePermissionTypeService } from '@/services/features/lookups/limited-time-permission-type.service';
import { UserService } from '@/services/features/user.service';

@Component({
  selector: 'app-limited-time-permission-container',
  imports: [
    CommonModule,
    FormsModule,
    Breadcrumb,
    TabsModule,
    TranslatePipe,
    Paginator,
    TableModule,
    Select,
    DatePicker,
    ReactiveFormsModule,
  ],
  templateUrl: './limited-time-permission-container.component.html',
  styleUrl: './limited-time-permission-container.component.scss',
})
export default class LimitedTimePermissionContainerComponent
  extends BaseListComponent<
    LimitedTimePermission,
    AddEditLimitedTimePermissionPopupComponent,
    LimitedTimePermissionService,
    LimitedTimePermissionFilter
  >
  implements OnInit
{
  activeTabIndex = 0;
  items: MenuItem[] | undefined;
  languageService = inject(LanguageService);
  permissionService = inject(LimitedTimePermissionService);
  permissionTypeService = inject(LimitedTimePermissionTypeService);
  permissionStatusService = inject(LimitedTimePermissionStatusService);
  userService = inject(UserService);
  limitedTimePermissionStatusEnum = LIMITED_TIME_PERMISSION_STATUS_ENUM;
  limitedTimepermissionTypes: BaseLookupModel[] = [];
  departments: BaseLookupModel[] = [];
  users: BaseLookupModel[] = [];
  limitedTimeprmissionStatuses: BaseLookupModel[] = [];
  availableTimeOptions: { label: string; value: number }[] = [];
  myPermissions?: PaginatedList<LimitedTimePermission>;
  filterModel: LimitedTimePermissionFilter = new LimitedTimePermissionFilter();
  viewMode = ViewModeEnum;
  isIncomingPermissions: boolean = false;
  authService = inject(AuthService);
  FIRST_LEVEL_APPROVAL_ID = 4;
  ACCEPTED_ID = 2;
  selectedStatusId: number | null = null;

  dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };
  attendance!: any[];

  override get service() {
    return this.permissionService;
  }
  override ngOnInit(): void {
    super.ngOnInit();

    // Initialize appliedFilterModel to ensure it's set on first load
    this.appliedFilterModel = new LimitedTimePermissionFilter();

    // Ensure paginationInfo is initialized
    if (!this.paginationInfo) {
      this.paginationInfo = new PaginationInfo();
    }
  }

  override initListComponent(): void {
    const resolverData = this.activatedRoute.snapshot.data['list'];

    this.myPermissions = resolverData;
    this.list = resolverData?.list ?? [];
    this.paginationInfo = resolverData?.paginationInfo ?? new PaginationInfo();

    this.loadLookups(); // now separate
  }

  private loadLookups(): void {
    this.permissionTypeService.getLookup().subscribe((types) => {
      this.limitedTimepermissionTypes = types || [];
    });

    this.userService.getMyDepartmentsLookup().subscribe((departments) => {
      this.departments = departments || [];
    });

    this.permissionStatusService.getLookup().subscribe((statuses) => {
      this.limitedTimeprmissionStatuses = statuses || [];

      // Add "First Level Approval (Pending Cancelation)"
      // Maps to: fkStatusId = 4 AND isCancelRequested = true
      this.limitedTimeprmissionStatuses.push({
        id: 6, // Virtual ID
        nameAr: 'موافقة أولية - بانتظار الإلغاء',
        nameEn: 'First Level Approval (Pending Cancelation)',
      } as BaseLookupModel);

      // Add "Accepted (Pending Cancelation)"
      // Maps to: fkStatusId = 2 AND isCancelRequested = true
      this.limitedTimeprmissionStatuses.push({
        id: 7, // Virtual ID
        nameAr: 'موافقة - بانتظار الإلغاء',
        nameEn: 'Accepted (Pending Cancelation)',
      } as BaseLookupModel);
    });

    this.userService.getMyDepartmentUsersLookup().subscribe((users) => {
      this.users = users || [];
    });

    this.permissionService.getTimeOptions().subscribe((timeOptions) => {
      this.availableTimeOptions = (timeOptions?.data || []).map((t: number) => ({
        label: `${t}`,
        value: t,
      }));
    });
  }

  onStatusChange(selectedId: number) {
    // 1. Keep the UI value consistent
    this.selectedStatusId = selectedId;

    // 2. Reset the cancel flag default
    this.filterModel.isCancelRequested = undefined;

    // 3. Handle Virtual IDs
    if (selectedId === 6) {
      // Virtual: First Level Approval (Pending Cancelation)
      this.filterModel.fkStatusId = this.FIRST_LEVEL_APPROVAL_ID; // Sets to 4
      this.filterModel.isCancelRequested = true;
    } else if (selectedId === 7) {
      // Virtual: Accepted (Pending Cancelation)
      this.filterModel.fkStatusId = this.ACCEPTED_ID; // Sets to 2
      this.filterModel.isCancelRequested = true;
    }
    // 4. Handle Standard IDs
    else {
      this.filterModel.fkStatusId = selectedId;

      // Explicitly set isCancelRequested to false if selecting the standard versions
      // of Accepted (2) or First Level (4) so it filters out the cancel requests.
      if (selectedId === this.ACCEPTED_ID || selectedId === this.FIRST_LEVEL_APPROVAL_ID) {
        this.filterModel.isCancelRequested = false;
      }
    }
  }

  formatTime12HourFromDate(value: Date | string | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    return this.formatTime12Hour(timeString);
  }
  formatTime12Hour(timeString: string): string {
    if (!timeString) return '';
    const locale = this.isCurrentLanguageEnglish() ? 'en-US' : 'ar-EG';
    return formatTimeTo12Hour(timeString, locale);
  }
  isCurrentLanguageEnglish() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH;
  }

  override openDialog(model: LimitedTimePermission, viewMode?: ViewModeEnum): void {
    const lookups = {
      permissionTypes: this.limitedTimepermissionTypes,
      availableTimeOptions: this.availableTimeOptions,
    };
    this.openBaseDialog(
      AddEditLimitedTimePermissionPopupComponent as any,
      model,
      viewMode!,
      lookups
    );
  }
  addOrEditModel(permission?: LimitedTimePermission) {
    const viewMode = permission ? ViewModeEnum.EDIT : ViewModeEnum.CREATE;
    permission = permission || new LimitedTimePermission();
    this.openDialog(permission, viewMode);
  }
  mapIncomingRequestsToExcelRow(model: LimitedTimePermission): { [key: string]: any } {
    return {
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_TYPE')]:
        model.getPermissionTypeName(),
      [this.translateService.instant('LIMITED_TIME_PERMISSION.EMPLOYEE_NAME')]:
        model.getCreationUserName(),
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_DATE')]:
        model.limitedTimePermissionDate,
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_DURATION')]:
        model.limitedTimePermissionDuration || '-',
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_START_TIME')]:
        this.formatTime12HourFromDate(model.limitedTimePermissionTimeFrom) || '-',

      [this.translateService.instant('LIMITED_TIME_PERMISSION.REQUEST_STATUS')]:
        model.getStatusName(),
    };
  }
  getPropertyName() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }

  loadIncomingPermissions() {
    this.service
      .loadDepartmentPermissionPaginated(this.paginationParams, { ...this.appliedFilterModel! })
      .subscribe({
        next: (response) => {
          this.list = response.list || [];

          if (response.paginationInfo) {
            this.paginationInfoMap(response);
          } else {
            // Ensure paginationInfo exists before setting totalItems
            if (!this.paginationInfo) {
              this.paginationInfo = new PaginationInfo();
            }
            this.paginationInfo.totalItems = this.list.length;
          }
        },
        error: (_) => {
          this.list = [];
          // Ensure paginationInfo exists before setting totalItems
          if (!this.paginationInfo) {
            this.paginationInfo = new PaginationInfo();
          }
          this.paginationInfo.totalItems = 0;
        },
      });
  }
  loadMyPermissions() {
    this.service.loadPaginated(this.paginationParams, { ...this.appliedFilterModel! }).subscribe({
      next: (response) => {
        this.list = response.list || [];

        if (response.paginationInfo) {
          this.paginationInfoMap(response);
        } else {
          // Ensure paginationInfo exists before setting totalItems
          if (!this.paginationInfo) {
            this.paginationInfo = new PaginationInfo();
          }
          this.paginationInfo.totalItems = this.list.length;
        }
      },
      error: (_) => {
        this.list = [];
        // Ensure paginationInfo exists before setting totalItems
        if (!this.paginationInfo) {
          this.paginationInfo = new PaginationInfo();
        }
        this.paginationInfo.totalItems = 0;
      },
    });
  }
  clickIncomingPermissionTab() {
    this.isIncomingPermissions = true;
    this.filterModel = new LimitedTimePermissionFilter();

    // Ensure paginationInfo is initialized
    if (!this.paginationInfo) {
      this.paginationInfo = new PaginationInfo();
    }

    // Only load if coming from MY_PERMISSIONS tab
    if (this.activeTabIndex === LIMITED_TIME_PERMISSION_TABS_ENUM.MY_PERMISSIONS) {
      this.loadIncomingPermissions();
    }

    this.activeTabIndex = LIMITED_TIME_PERMISSION_TABS_ENUM.INCOMING_PERMISSIONS;
  }

  clickMyPermissionTab() {
    if (this.activeTabIndex == LIMITED_TIME_PERMISSION_TABS_ENUM.INCOMING_PERMISSIONS) {
      this.resetSearch();
    }
    this.activeTabIndex = LIMITED_TIME_PERMISSION_TABS_ENUM.MY_PERMISSIONS;
  }

  departmentPermissionSearch() {
    this.appliedFilterModel = { ...this.filterModel };
    this.paginationParams.pageNumber = 1;
    this.first = 0;
    this.loadIncomingPermissions();
  }

  departmentPermissionResetSearch() {
    this.filterModel = new LimitedTimePermissionFilter();
    this.appliedFilterModel = new LimitedTimePermissionFilter();
    this.paginationParams.pageNumber = 1;
    this.paginationParams.pageSize = 10;
    this.first = 0;
    this.loadIncomingPermissions();
  }

  openDataDialog(model: LimitedTimePermission, canTakeAction?: ViewModeEnum): void {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    dialogConfig.data = { model: model, ViewMode: canTakeAction };
    const dialogRef = this.matDialog.open(
      ViewLimitedTimePermissionPopupComponent as any,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      if (result && result == DIALOG_ENUM.OK) {
        if (this.activeTabIndex === LIMITED_TIME_PERMISSION_TABS_ENUM.MY_PERMISSIONS) {
          this.loadMyPermissions();
        } else {
          this.loadIncomingPermissions();
        }
      }
    });
  }

  showIncomingPermissions() {
    return this.authService.isDepartmentManager || this.authService.isHROfficer;
  }
  showAddingPermissionButton(): boolean {
    const isManagerOfRoot =
      this.authService.isdepartmentActualManager && this.authService.isRootdepartment;
    return !isManagerOfRoot;
  }

  onIncomingPermissionPageChange(event: PaginatorState) {
    this.first = event.first!;
    this.rows = event.rows!;
    this.paginationParams.pageNumber = Math.floor(this.first / this.rows) + 1;
    this.paginationParams.pageSize = this.rows;
    this.loadIncomingPermissions();
  }

  override exportExcel(
    fileName: string = 'data.xlsx',
    isIncomingPermissions: boolean = false
  ): void {
    const allDataParams = {
      ...this.paginationParams,
      pageNumber: 1,
      pageSize: CustomValidators.defaultLengths.INT_MAX,
    };

    const fetchAll = isIncomingPermissions
      ? this.service.loadDepartmentPermissionPaginated(allDataParams, {
          ...this.appliedFilterModel!,
        })
      : this.service.loadPaginated(allDataParams, { ...this.appliedFilterModel! });

    fetchAll.subscribe({
      next: (response) => {
        const fullList = response.list || [];
        if (fullList.length === 0) {
          this.alertsService.showErrorMessage({ messages: ['COMMON.NO_DATA_TO_EXPORT'] });
          return;
        } else {
          const isRTL = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
          const transformedData = fullList.map((item) =>
            isIncomingPermissions
              ? this.mapIncomingRequestsToExcelRow(item)
              : this.mapModelToExcelRow(item)
          );
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

  protected override getBreadcrumbKeys() {
    return [{ labelKey: 'PERMISSION_PAGE.PERMISSIONS' }];
  }
  protected override mapModelToExcelRow(model: LimitedTimePermission): { [key: string]: any } {
    return {
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_TYPE')]:
        model.getPermissionTypeName(),
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_DATE')]:
        model.limitedTimePermissionDate,
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_DURATION')]:
        model.limitedTimePermissionDuration || '-',
      [this.translateService.instant('LIMITED_TIME_PERMISSION.PERMISSION_START_TIME')]:
        this.formatTime12HourFromDate(model.limitedTimePermissionTimeFrom!) || '-',

      [this.translateService.instant('LIMITED_TIME_PERMISSION.REQUEST_STATUS')]:
        model.getStatusName(),
    };
  }
}
