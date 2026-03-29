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
import { LeaveFilter } from '@/models/features/business/leave/leave-filter';
import { AddNewLeaveRequestComponent } from '../leaves-request-popups/add-new-leave-request/add-new-leave-request.component';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { LeaveStatus } from '@/enums/leave-status-enum';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LEAVE_STATUS_OPTIONS, LeaveStatusOption } from '@/models/shared/leave-status-option';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { ActivatedRoute } from '@angular/router';
import { ViewLeaveRequestComponent } from '../leaves-request-popups/view-leave-request/view-leave-request.component';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { LeaveInterceptor } from '@/model-interceptors/features/business/leave.interceptor';

@Component({
  selector: 'app-my-leaves-request-list',
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
  templateUrl: './my-leaves-request-list.component.html',
  styleUrl: './my-leaves-request-list.component.scss',
})
export class MyLeavesRequestListComponent extends BaseListComponent<
  Leave,
  AddNewLeaveRequestComponent,
  LeaveService,
  LeaveFilter
> {
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  leaveService = inject(LeaveService);
  private leaveInterceptor = new LeaveInterceptor();

  override filterModel: LeaveFilter = new LeaveFilter();
  statusOptions: LeaveStatusOption[] = LEAVE_STATUS_OPTIONS;
  leaveTypes: BaseLookupModel[] = [];
  leaveTypesService = inject(LeaveTypeService);

  LeaveStatusEnum = LeaveStatus;

  override get service() {
    return this.leaveService;
  }

  override search(isStoredProcedure: boolean = false) {
    // Apply interceptor transformations to filter model before search
    const transformedFilter = this.leaveInterceptor.send({
      ...this.filterModel,
    }) as LeaveFilter;

    this.appliedFilterModel = { ...transformedFilter };
    this.paginationParams.pageNumber = 1;
    this.first = 0;

    this.leaveService.getMyLeavesWithPaging(this.paginationParams, transformedFilter).subscribe({
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
      if (data['myLeavesList']) {
        const myLeavesData = data['myLeavesList'].data;
        this.list = myLeavesData.list;
        this.paginationInfoMap(myLeavesData);
      }
      this.leaveTypesService.getLookup().subscribe((res) => {
        this.leaveTypes = res;
      });
    });
  }

  override loadList() {
    return this.leaveService.getMyLeavesWithPaging(this.paginationParams, this.filterModel).pipe(
      map((res) => ({
        list: res.data.list as Leave[],
        paginationInfo: res.data.paginationInfo,
      }))
    );
  }

  override openDialog(model: Leave) {
    this.openBaseDialog(ViewLeaveRequestComponent as any, model, ViewModeEnum.TAKE_ACTION);
  }

  openAddNewLeaveRequestPopup(model?: Leave) {
    this.openBaseDialog(
      AddNewLeaveRequestComponent as any,
      model ?? new Leave(),
      model?.id ? ViewModeEnum.EDIT : ViewModeEnum.CREATE
    );
  }

  protected override mapModelToExcelRow(model: Leave): { [key: string]: any } {
    const isAr = this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC;
    return {
      [this.translateService.instant('LEAVE_REQUEST_PAGE.LEAVE_TYPE')]: isAr
        ? model.leaveType?.nameAr
        : model.leaveType?.nameEn,
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
