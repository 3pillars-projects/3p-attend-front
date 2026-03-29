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
import { ViewCancelLeaveRequestComponent } from '../cancel-leaves-request-popups/view-leave-request/view-cancel-leave-request.component';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { CancelationRequestInterceptor } from '@/model-interceptors/features/business/cancelation-request.interceptor';

@Component({
  selector: 'app-my-cancel-leaves-request-list',
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
  templateUrl: './my-cancel-leaves-request-list.component.html',
})
export class MyCancelLeavesRequestListComponent extends BaseListComponent<
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
  private cancelationRequestInterceptor = new CancelationRequestInterceptor();

  override filterModel: CancelationRequestFilter = new CancelationRequestFilter();
  statusOptions: CancelationStatusOption[] = CANCELATION_STATUS_OPTIONS;
  leaveTypes: BaseLookupModel[] = [];
  leaveStatusOptions: LeaveStatusOption[] = LEAVE_STATUS_OPTIONS;
  leaveTypesService = inject(LeaveTypeService);

  override get service() {
    return this.cancelationRequestService;
  }

  override search(isStoredProcedure: boolean = false) {
    // Apply interceptor transformations to filter model before search
    const transformedFilter = this.cancelationRequestInterceptor.send({
      ...this.filterModel,
    }) as CancelationRequestFilter;

    this.appliedFilterModel = { ...transformedFilter };
    this.paginationParams.pageNumber = 1;
    this.first = 0;

    this.cancelationRequestService
      .getEmployeesCancelationRequestsWithPaging(this.paginationParams, transformedFilter)
      .subscribe({
        next: (response) =>
          this.handleLoadListSuccess({
            list: response.data.list,
            paginationInfo: response.data.paginationInfo,
          }),
        error: () => this.handleLoadListError(),
      });
  }

  override initListComponent() {
    this.activatedRoute.data.subscribe((data) => {
      if (data['myCancelationRequests']) {
        const cancelationRequestsData = data['myCancelationRequests'].data;
        this.list = cancelationRequestsData.list;
        this.paginationInfoMap(cancelationRequestsData);
      }
      this.leaveTypesService.getLookup().subscribe((res) => {
        this.leaveTypes = res;
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
    this.openBaseDialog(ViewCancelLeaveRequestComponent as any, model, ViewModeEnum.VIEW);
  }

  protected override mapModelToExcelRow(model: CancelationRequest): { [key: string]: any } {
    const isAr = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
    return {
      [this.translateService.instant('CANCEL_LEAVE_REQUEST_PAGE.LEAVE_TYPE')]:
        model.leaveType?.getNameBasedOnLanguage(this.langService.getCurrentLanguage()) || '',
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
}
