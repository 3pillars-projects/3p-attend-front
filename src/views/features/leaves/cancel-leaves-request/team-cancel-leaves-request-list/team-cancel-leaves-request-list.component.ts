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
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { CancelationRequestFilter } from '@/models/features/business/leave-cancelation/cancelation-request-filter';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import {
  CANCELATION_STATUS_OPTIONS,
  CancelationStatusOption,
} from '@/models/shared/cancelation-status-option';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LEAVE_STATUS_OPTIONS, LeaveStatusOption } from '@/models/shared/leave-status-option';
import { CancelationRequestStatus } from '@/enums/cancelation-request-status-enum';
import { DepartmentService } from '@/services/features/lookups/department.service';
import { UserService } from '@/services/features/user.service';
import { ViewCancelLeaveRequestComponent } from '../cancel-leaves-request-popups/view-leave-request/view-cancel-leave-request.component';
import { LeaveStatus } from '@/enums/leave-status-enum';

@Component({
  selector: 'app-team-cancel-leaves-request-list',
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
  ],
  templateUrl: './team-cancel-leaves-request-list.component.html',
})
export class TeamCancelLeavesRequestListComponent extends BaseListComponent<
  CancelationRequest,
  ViewCancelLeaveRequestComponent,
  CancelationRequestService,
  CancelationRequestFilter
> {
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  cancelationRequestService = inject(CancelationRequestService);
  departmentService = inject(DepartmentService);
  userService = inject(UserService);

  override filterModel: CancelationRequestFilter = new CancelationRequestFilter();
  statusOptions: CancelationStatusOption[] = CANCELATION_STATUS_OPTIONS;
  leaveTypes: BaseLookupModel[] = [];
  departments: BaseLookupModel[] = [];
  users: BaseLookupModel[] = [];
  leaveStatusOptions: LeaveStatusOption[] = LEAVE_STATUS_OPTIONS;

  override get service() {
    return this.cancelationRequestService;
  }

  override initListComponent() {
    this.activatedRoute.data.subscribe((data) => {
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
    return this.cancelationRequestService
      .getEmployeesCancelationRequestsWithPaging(this.paginationParams, this.filterModel)
      .pipe(
        map((res) => ({
          list: res.data.list as CancelationRequest[],
          paginationInfo: res.data.paginationInfo,
        }))
      );
  }

  override openDialog(model: CancelationRequest) {
    this.openViewCancelLeaveRequest(model);
  }

  openViewCancelLeaveRequest(model: CancelationRequest) {
    this.openBaseDialog(ViewCancelLeaveRequestComponent as any, model, ViewModeEnum.EDIT);
  }

  protected override mapModelToExcelRow(model: CancelationRequest): { [key: string]: any } {
    const isAr = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
    return {
      [this.translateService.instant('CANCEL_LEAVE_REQUEST_PAGE.LEAVE_TYPE')]:
        model.leaveType?.getNameBasedOnLanguage(this.langService.getCurrentLanguage()) || '',
      [this.translateService.instant('CANCEL_LEAVE_REQUEST_PAGE.EMPLOYEE_NAME')]: isAr
        ? (model as any).employee?.nameAr
        : (model as any).employee?.nameEn,
      [this.translateService.instant('CANCEL_LEAVE_REQUEST_PAGE.DATE_FROM')]: model.dateFrom,
      [this.translateService.instant('CANCEL_LEAVE_REQUEST_PAGE.DATE_TO')]: model.dateTo,
      [this.translateService.instant('CANCEL_LEAVE_REQUEST_PAGE.STATUS')]: this.getStatusName(
        model.status
      ),
    };
  }

  getStatusName(status: CancelationRequestStatus): string {
    const option = this.statusOptions.find((o) => o.id === status);
    return option ? option[this.optionLabel] : '';
  }

  getLeaveStatusName(status: number): string {
    const option = this.leaveStatusOptions.find((o) => o.id === status);
    return option ? option[this.optionLabel] : '';
  }

  get optionLabel(): string {
    return this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  protected override getBreadcrumbKeys(): {
    labelKey: string;
    icon?: string;
    routerLink?: string;
  }[] {
    return [
      { labelKey: 'COMMON.DASHBOARD' },
      { labelKey: 'CANCEL_LEAVE_REQUEST_PAGE.CANCEL_LEAVE_REQUESTS' },
    ];
  }

  getStatusClass(status: CancelationRequestStatus): string {
    switch (status) {
      case CancelationRequestStatus.New:
        return 'bg-[#eff8ff] text-[#1849a9]';
      case CancelationRequestStatus.Accepted:
        return 'bg-[#ecfdf3] text-[#085d3a]';
      case CancelationRequestStatus.RejectedByEmployee:
      case CancelationRequestStatus.RejectedByHR:
        return 'bg-[#fef3f2] text-[#912018]';
      case CancelationRequestStatus.EmployeeAcceptance:
        return 'bg-[#fffaeb] text-[#93370d]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDotClass(status: CancelationRequestStatus): string {
    switch (status) {
      case CancelationRequestStatus.New:
        return 'bg-[#1849a9]';
      case CancelationRequestStatus.Accepted:
        return 'bg-[#085d3a]';
      case CancelationRequestStatus.RejectedByEmployee:
      case CancelationRequestStatus.RejectedByHR:
        return 'bg-[#912018]';
      case CancelationRequestStatus.EmployeeAcceptance:
        return 'bg-[#93370d]';
      default:
        return 'bg-gray-400';
    }
  }
  public getStatusDisplay(status: LeaveStatus): {
    bgClass: string;
    dotClass: string;
    textClass: string;
    textKey: string;
  } {
    switch (status) {
      case LeaveStatus.New:
        return {
          bgClass: 'bg-[#eff8ff]',
          dotClass: 'bg-[#1849a9]',
          textClass: 'text-[#1849a9]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_NEW',
        };
      case LeaveStatus.Accepted:
        return {
          bgClass: 'bg-[#ecfdf3]',
          dotClass: 'bg-[#085d3a]',
          textClass: 'text-[#085d3a]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_ACCEPTED',
        };
      case LeaveStatus.ManagementAcceptance:
        return {
          bgClass: 'bg-[#ecfdf3]',
          dotClass: 'bg-[#085d3a]',
          textClass: 'text-[#085d3a]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_MANAGEMENT_ACCEPTANCE',
        };
      case LeaveStatus.HRAcceptance:
        return {
          bgClass: 'bg-[#fffaeb]',
          dotClass: 'bg-[#93370d]',
          textClass: 'text-[#93370d]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_HR_ACCEPTANCE',
        };
      case LeaveStatus.Rejected:
        return {
          bgClass: 'bg-[#fef3f2]',
          dotClass: 'bg-[#912018]',
          textClass: 'text-[#912018]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_REJECTED',
        };
      case LeaveStatus.Canceled:
        return {
          bgClass: 'bg-[#f9fafb]',
          dotClass: 'bg-[#4d5761]',
          textClass: 'text-[#1f2a37]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_CANCELED',
        };
      case LeaveStatus.DoesNotNeedAcceptance:
        return {
          bgClass: 'bg-[#f9fafb]',
          dotClass: 'bg-[#4d5761]',
          textClass: 'text-[#1f2a37]',
          textKey: 'LEAVE_REQUEST_PAGE.STATUS_DOES_NOT_NEED_ACCEPTANCE',
        };
      default:
        return {
          bgClass: 'bg-gray-100',
          dotClass: 'bg-gray-400',
          textClass: 'text-gray-800',
          textKey: 'COMMON.UNKNOWN',
        };
    }
  }
}
