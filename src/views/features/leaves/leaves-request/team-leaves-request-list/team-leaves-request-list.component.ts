import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { Leave } from '@/models/features/business/leave/leave';
import { LeaveService } from '@/services/features/business/leave.service';
import { TeamLeaveFilter } from '@/models/features/business/leave/team-leave-filter';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LEAVE_STATUS_OPTIONS, LeaveStatusOption } from '@/models/shared/leave-status-option';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { ActivatedRoute } from '@angular/router';
import { ViewLeaveRequestComponent } from '../leaves-request-popups/view-leave-request/view-leave-request.component';
import { InputTextModule } from 'primeng/inputtext';
import { DepartmentService } from '@/services/features/lookups/department.service';
import { UserService } from '@/services/features/user.service';

@Component({
  selector: 'app-team-leaves-request-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    DatePicker,
    DatePickerModule,
    Select,
    TooltipModule,
    TranslateModule,
    TranslatePipe,
    InputTextModule,
  ],
  templateUrl: './team-leaves-request-list.component.html',
  styleUrl: './team-leaves-request-list.component.scss',
})
export class TeamLeavesRequestListComponent extends BaseListComponent<
  Leave,
  ViewLeaveRequestComponent,
  LeaveService,
  TeamLeaveFilter
> {
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  leaveService = inject(LeaveService);

  override filterModel: TeamLeaveFilter = new TeamLeaveFilter();
  statusOptions: LeaveStatusOption[] = LEAVE_STATUS_OPTIONS;
  leaveTypes: BaseLookupModel[] = [];
  departments: BaseLookupModel[] = [];
  departmentService = inject(DepartmentService);
  users: BaseLookupModel[] = [];
  userService = inject(UserService);

  LeaveStatusEnum = LeaveStatus;

  override get service() {
    return this.leaveService;
  }

  override initListComponent() {
    this.activatedRoute.data.subscribe((data) => {
      if (data['teamLeavesList']) {
        const teamLeavesData = data['teamLeavesList'].data;
        this.list = teamLeavesData.list;
        this.paginationInfoMap(teamLeavesData);
      }
      if (data['leaveTypes']) {
        this.leaveTypes = data['leaveTypes'].list;
      }
      this.departmentService.getLookup().subscribe((res) => {
        this.departments = res;
      });
      this.userService.getLookup().subscribe((res) => {
        this.users = res;
      });
    });
  }

  override loadList() {
    return this.leaveService.getTeamLeavesWithPaging(this.paginationParams, this.filterModel).pipe(
      map((res) => ({
        list: res.data.list as Leave[],
        paginationInfo: res.data.paginationInfo,
      }))
    );
  }

  override openDialog(model: Leave) {
    this.openViewLeaveRequest(model);
  }

  openViewLeaveRequest(model: Leave) {
    this.openBaseDialog(ViewLeaveRequestComponent as any, model, ViewModeEnum.VIEW);
  }

  protected override mapModelToExcelRow(model: Leave): { [key: string]: any } {
    const isAr = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
    return {
      [this.translateService.instant('LEAVE_REQUEST_PAGE.LEAVE_TYPE')]: isAr
        ? model.leaveType?.nameAr
        : model.leaveType?.nameEn,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.EMPLOYEE_NAME')]: isAr
        ? model.employee?.nameAr
        : model.employee?.nameEn,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.DATE_FROM')]: model.dateFrom,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.DATE_TO')]: model.dateTo,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.DAYS_COUNT')]: model.daysCount,
      [this.translateService.instant('LEAVE_REQUEST_PAGE.STATUS')]:
        this.statusOptions.find((s) => s.id === model.status)?.[isAr ? 'nameAr' : 'nameEn'] || '',
    };
  }

  get optionLabel(): string {
    return this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  protected override getBreadcrumbKeys(): {
    labelKey: string;
    icon?: string;
    routerLink?: string;
  }[] {
    return [{ labelKey: 'COMMON.DASHBOARD' }, { labelKey: 'LEAVE_REQUEST_PAGE.LEAVE_REQUESTS' }];
  }
}
