import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Tabs, TabsModule } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { MatDialogConfig } from '@angular/material/dialog';
import { ViewLeaveRequestComponent } from '../leaves-request-popups/view-leave-request/view-leave-request.component';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { AddNewLeaveRequestComponent } from '../leaves-request-popups/add-new-leave-request/add-new-leave-request.component';
import { Leave } from '@/models/features/business/leave/leave';
import { LeaveService } from '@/services/features/business/leave.service';
import { LeaveFilter } from '@/models/features/business/leave/leave-filter';
import { TeamLeaveFilter } from '@/models/features/business/leave/team-leave-filter';
import { PaginationParams } from '@/models/shared/pagination-params';
import { PaginatedList } from '@/models/shared/response/paginated-list';
import { PaginatedListResponseData } from '@/models/shared/response/paginated-list-response-data';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';

@Component({
  selector: 'app-leaves-request-list',
  standalone: true,
  imports: [
    Breadcrumb,
    InputTextModule,
    TableModule,
    CommonModule,
    RouterModule,
    PaginatorModule,
    DatePickerModule,
    FormsModule,
    TabsModule,
    DatePicker,
    Select,
    TranslateModule,
    TooltipModule,
  ],
  templateUrl: './leaves-request-list.component.html',
  styleUrl: './leaves-request-list.component.scss',
})
export class LeavesRequestListComponent
  extends BaseListComponent<Leave, ViewLeaveRequestComponent, LeaveService, LeaveFilter>
  implements OnInit {
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  private _filterModel: any = new LeaveFilter();
  override get filterModel(): any {
    return this.activeTabIndex === 0 ? this.myLeavesFilter : this.teamLeavesFilter;
  }

  override set filterModel(val: any) {
    if (this.activeTabIndex === 0) {
      this.myLeavesFilter = val;
    } else {
      this.teamLeavesFilter = val;
    }
  }

  override get service() {
    return this.leaveService;
  }

  // Lookups
  leaveTypes: BaseLookupModel[] = [];

  // Filters
  myLeavesFilter: LeaveFilter = new LeaveFilter();
  teamLeavesFilter: TeamLeaveFilter = new TeamLeaveFilter();
  
  statusOptions = [
    { id: LeaveStatus.New, name: 'LEAVE_REQUEST_PAGE.STATUS_NEW' },
    { id: LeaveStatus.ManagementAcceptance, name: 'LEAVE_REQUEST_PAGE.STATUS_MANAGEMENT_ACCEPTANCE' },
    { id: LeaveStatus.HRAcceptance, name: 'LEAVE_REQUEST_PAGE.STATUS_HR_ACCEPTANCE' },
    { id: LeaveStatus.Rejected, name: 'LEAVE_REQUEST_PAGE.STATUS_REJECTED' },
    { id: LeaveStatus.Canceled, name: 'LEAVE_REQUEST_PAGE.STATUS_CANCELED' },
    { id: LeaveStatus.DoesNotNeedAcceptance, name: 'LEAVE_REQUEST_PAGE.STATUS_DOES_NOT_NEED_ACCEPTANCE' },
  ];

  activeTabIndex: number = 0;

  leaveService = inject(LeaveService);
  leaveTypeService = inject(LeaveTypeService);

  get LeaveStatusEnum() {
    return LeaveStatus;
  }

  override initListComponent() {
    // Read resolved data
    this.activatedRoute.data.subscribe((data) => {
      // My Leaves (Initial data for tab 0)
      if (data['myLeavesList'] && this.activeTabIndex === 0) {
        const myLeavesData = (data['myLeavesList'] as unknown as PaginatedListResponseData<Leave>).data;
        this.list = myLeavesData.list;
        this.paginationInfoMap(myLeavesData);
      }
      // Team Leaves (Initial data for tab 1)
      if (data['teamLeavesList'] && this.activeTabIndex === 1) {
        const teamLeavesData = (data['teamLeavesList'] as unknown as PaginatedListResponseData<Leave>).data;
        this.list = teamLeavesData.list;
        this.paginationInfoMap(teamLeavesData);
      }
      // Leave Types
      if (data['leaveTypes']) {
        this.leaveTypes = data['leaveTypes'].list;
      }
    });
  }

  protected override getBreadcrumbKeys() {
    return [
      { labelKey: 'COMMON.DASHBOARD' },
      { labelKey: 'LEAVE_REQUEST_PAGE.LEAVE_REQUESTS' }
    ];
  }

  onTabChange(event: any) {
    this.activeTabIndex = parseInt(event.value, 10) || 0;
    this.resetSearch();
  }

  override loadList() {
    if (this.activeTabIndex === 0) {
      return this.leaveService
        .getMyLeavesWithPaging(this.paginationParams, this.myLeavesFilter)
        .pipe(map(res => ({ list: res.data.list as Leave[], paginationInfo: res.data.paginationInfo })));
    } else {
      return this.leaveService
        .getTeamLeavesWithPaging(this.paginationParams, this.teamLeavesFilter)
        .pipe(map(res => ({ list: res.data.list as Leave[], paginationInfo: res.data.paginationInfo })));
    }
  }

  override openDialog(model: Leave) {
    this.openViewLeaveRequest(model);
  }

  protected override mapModelToExcelRow(model: Leave): { [key: string]: any } {
    const isAr = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
    return {
      [this.translateService.instant('LEAVE_REQUEST_PAGE.LEAVE_TYPE')]: isAr ? model.leaveType?.nameAr : model.leaveType?.nameEn,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.EMPLOYEE_NAME')]: isAr ? model.employee?.nameAr : model.employee?.nameEn,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.DATE_FROM')]: model.dateFrom,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.DATE_TO')]: model.dateTo,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.DAYS_COUNT')]: model.daysCount,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.STATUS')]: this.translateService.instant(this.statusOptions.find(s => s.id === model.status)?.name || ''),
    };
  }

  openViewLeaveRequest(model: Leave) {
    this.openBaseDialog(ViewLeaveRequestComponent as any, model, ViewModeEnum.VIEW);
  }

  openAddNewLeaveRequestPopup(model?: Leave) {
    this.openBaseDialog(AddNewLeaveRequestComponent as any, model ?? new Leave(), ViewModeEnum.CREATE);
  }

  get optionLabel(): string {
    const lang = this.langService.getCurrentLanguage();
    return lang === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }
}
