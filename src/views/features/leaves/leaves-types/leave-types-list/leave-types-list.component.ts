import { Component, inject, OnInit } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { TranslatePipe } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { LeaveTypesPopupComponent } from '@/views/features/leaves/leaves-types/leave-types-popup/leave-types-popup.component';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { LeaveTypeFilter } from '@/models/features/business/leave-types/leave-type-filter';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { LeaveType } from '@/models/features/business/leave-types/leave-type';
import {
  LEAVE_TYPE_STATUS_OPTIONS,
  LeaveTypeStatusOption,
} from '@/models/shared/leave-type-status-option';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-leave-types-list',
  imports: [
    Breadcrumb,
    FormsModule,
    Select,
    TableModule,
    CommonModule,
    PaginatorModule,
    TranslatePipe,
    InputTextModule,
    RouterModule,
  ],
  templateUrl: './leave-types-list.component.html',
  styleUrl: './leave-types-list.component.scss',
})
export class LeavesListComponent
  extends BaseListComponent<LeaveType, LeaveTypesPopupComponent, LeaveTypeService, LeaveTypeFilter>
  implements OnInit
{
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };
  leavetypeService = inject(LeaveTypeService);
  filterModel: LeaveTypeFilter = new LeaveTypeFilter();
  leaveTypeStatusOptions: LeaveTypeStatusOption[] = LEAVE_TYPE_STATUS_OPTIONS;

  override get service() {
    return this.leavetypeService; 
  }

  override initListComponent(): void {}

  override openDialog(model: LeaveType): void {
    const viewMode = model.id ? ViewModeEnum.EDIT : ViewModeEnum.CREATE;
    this.openBaseDialog(LeaveTypesPopupComponent as any, model, viewMode);
  }

  addOrEditModel(leavetype?: LeaveType): void {
    this.openDialog(leavetype ?? new LeaveType());
  }

  protected override getBreadcrumbKeys() {
    return [{ labelKey: 'LEAVE_TYPES_PAGE.LEAVE_TYPES' }];
  }

  protected override mapModelToExcelRow(model: LeaveType): { [key: string]: any } {
    return {
      [this.translateService.instant('LEAVE_TYPES_PAGE.LEAVE_TYPE_NAME_AR')]: model.nameAr,
      [this.translateService.instant('LEAVE_TYPES_PAGE.LEAVE_TYPE_NAME_EN')]: model.nameEn,
      [this.translateService.instant('LEAVE_TYPES_PAGE.BALANCE_DAYS_COUNT')]: model.annualBalance,
      [this.translateService.instant('LEAVE_TYPES_PAGE.MAX_CONSECUTIVE_DAYS')]:
        model.continuousDaysLimit,
      [this.translateService.instant('LEAVE_TYPES_PAGE.ACTIVATION_STATUS')]: this.formatBoolean(
        model.isActive
      ),
    };
  }
  get optionLabel(): string {
    const lang = this.langService.getCurrentLanguage();
    return lang === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  formatBoolean(value: boolean | undefined): string {
    if (value === undefined || value === null) return '';
    return value
      ? this.translateService.instant('LEAVE_TYPES_PAGE.ACTIVE')
      : this.translateService.instant('LEAVE_TYPES_PAGE.NOT_ACTIVE');
  }
}
