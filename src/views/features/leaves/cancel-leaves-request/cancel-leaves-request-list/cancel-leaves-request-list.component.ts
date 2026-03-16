import { Component, inject, ViewChild } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { CommonModule } from '@angular/common';
import { Tabs, TabsModule } from 'primeng/tabs';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MyCancelLeavesRequestListComponent } from '../my-cancel-leaves-request-list/my-cancel-leaves-request-list.component';
import { TeamCancelLeavesRequestListComponent } from '../team-cancel-leaves-request-list/team-cancel-leaves-request-list.component';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { CancelationRequest } from '@/models/features/business/leave-cancelation/cancelation-request';
import { CancelationRequestService } from '@/services/features/business/cancelation-request.service';
import { CancelationRequestFilter } from '@/models/features/business/leave-cancelation/cancelation-request-filter';

@Component({
  selector: 'app-cancel-leaves-request-list',
  standalone: true,
  imports: [
    Breadcrumb,
    CommonModule,
    TabsModule,
    TranslateModule,
    MyCancelLeavesRequestListComponent,
    TeamCancelLeavesRequestListComponent,
  ],
  templateUrl: './cancel-leaves-request-list.component.html',
  styleUrl: './cancel-leaves-request-list.component.scss',
})
export default class CancelLeavesRequestListComponent extends BaseListComponent<
  CancelationRequest,
  any,
  CancelationRequestService,
  CancelationRequestFilter
> {
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  @ViewChild('myList') myList!: MyCancelLeavesRequestListComponent;
  @ViewChild('teamList') teamList!: TeamCancelLeavesRequestListComponent;

  activeTabIndex = 0;

  onTabChange(index: number | string) {
    this.activeTabIndex = Number(index);

    if (this.activeTabIndex === 0 && this.myList) {
      this.myList.resetSearch();
    } else if (this.activeTabIndex === 1 && this.teamList) {
      this.teamList.resetSearch();
    }
  }

  private _filterModel = {};
  override get filterModel() {
    return this._filterModel;
  }
  override set filterModel(val: any) {
    this._filterModel = val;
  }
  override get service() {
    return null as any;
  }
  override initListComponent(): void {}
  override loadList() {
    return null as any;
  }
  override openDialog(model: any): void {}

  protected override mapModelToExcelRow(model: any): { [p: string]: any } {
    return {};
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
}
