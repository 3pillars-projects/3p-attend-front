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

  override filterModel: LeaveFilter = new LeaveFilter();
  statusOptions: LeaveStatusOption[] = LEAVE_STATUS_OPTIONS;
  leaveTypes: BaseLookupModel[] = [];

  LeaveStatusEnum = LeaveStatus;

  override get service() {
    return this.leaveService;
  }

  override initListComponent() {
    this.activatedRoute.data.subscribe((data) => {
      if (data['myLeavesList']) {
        const myLeavesData = data['myLeavesList'].data;
        this.list = myLeavesData.list;
        this.paginationInfoMap(myLeavesData);
      }
      if (data['leaveTypes']) {
        this.leaveTypes = data['leaveTypes'].list;
      }
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
