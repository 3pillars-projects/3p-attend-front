import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditEmployeeLeavesBalancesPopupComponent } from '@/views/features/leaves/leaves-balances/leaves-balances-popups/edit-employee-leaves-balances-popup/edit-employee-leaves-balances-popup.component';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { EditMultipleEmployeeLeavesBalancesPopupComponent } from '@/views/features/leaves/leaves-balances/leaves-balances-popups/edit-multiple-employee-leaves-balances-popup/edit-multiple-employee-leaves-balances-popup.component';
import { LeaveTypesLookup } from '@/models/features/business/leave-types/leave-types-lookup';
import { MultiSelect } from 'primeng/multiselect';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { TranslateService } from '@ngx-translate/core';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LanguageService } from '@/services/shared/language.service';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { EmployeeBalanceFilter } from '@/models/features/business/leaves-balances/employee-balance-filter';

@Component({
  selector: 'app-leaves-balances-list',
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
    Select,
    TabsModule,
    MultiSelect,
  ],
  templateUrl: './leaves-balances-list.component.html',
  styleUrl: './leaves-balances-list.component.scss',
})
export class LeavesBalancesListComponent extends BaseListComponent<
  EmployeeLeaveBalance,
  EditEmployeeLeavesBalancesPopupComponent,
  EmployeeBalanceService,
  EmployeeBalanceFilter
> {
  employeeBalanceService = inject(EmployeeBalanceService)
  override set filterModel(val: EmployeeBalanceFilter) {

  }
  override get service(): EmployeeBalanceService {
    return this.employeeBalanceService;
  }
  override openDialog(nationality: EmployeeLeaveBalance): void {

  }
  override initListComponent(): void {
    this.leavesBalance = this.activatedRoute.snapshot.data['leavesBalance'];
    console.log('================');
    console.log(this.leavesBalance);
    console.log('================');
    this.items = [{ label: 'لوحة المعلومات' }, { label: 'تحديث أرصدة الاجازات' }];
    // Updated dummy data to match your Arabic table structure
    this.attendance = [
      {
        serialNumber: 1,
        PermanentType: 'دوام كلي',
        startDate: '12/12/2024',
        endDate: '24/12/2024',
        timeRange: '10:00 - 17:00',
        maxAttendanceTime: '09:30',
        maxwithdrawalTime: '19:00',
      },
    ];
  }
  protected override getBreadcrumbKeys(): {
    labelKey: string;
    icon?: string;
    routerLink?: string;
  }[] {
    return [{ labelKey: 'LEAVE_TYPES_PAGE.LEAVE_TYPES' }];
  }
  protected override mapModelToExcelRow(model: EmployeeLeaveBalance): { [key: string]: any } {
    return {
      [this.translateService.instant('LEAVE_TYPES_PAGE.LEAVE_TYPE_NAME_AR')]: '',
      [this.translateService.instant('LEAVE_TYPES_PAGE.LEAVE_TYPE_NAME_EN')]: '',
      [this.translateService.instant('LEAVE_TYPES_PAGE.BALANCE_DAYS_COUNT')]: '',
      [this.translateService.instant('LEAVE_TYPES_PAGE.MAX_CONSECUTIVE_DAYS')]: ''
    };
  }
  date2: Date | undefined;
  attendance!: any[];
  items: MenuItem[] | undefined;
  dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  leavesBalance?: LeaveTypesLookup;


  selectedAnnualLeaves?: BaseLookupModel[] = [];
  selectedLimitedTimesLeaves?: BaseLookupModel[] = [];
  languageService: LanguageService = inject(LanguageService);
  openEmployeeDialog(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(
      EditEmployeeLeavesBalancesPopupComponent as any,
      dialogConfig
    );

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      console.log('closed');
    });
  }
  openEmployeesDialog(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(
      EditMultipleEmployeeLeavesBalancesPopupComponent as any,
      dialogConfig
    );

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      console.log('closed');
    });
  }

  getLookupLabelKey() {
    return this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
  }

  resetSelectedLeaveTypes() {
    this.selectedAnnualLeaves = [];
    this.selectedLimitedTimesLeaves = [];
  }

  getNameBasedOnLanguage(leave: BaseLookupModel) {
    return leave.getNameBasedOnLanguage(this.translateService.currentLang!);
  }

  removeAnnualLeave(annualLeave: BaseLookupModel) {
    this.selectedAnnualLeaves = this.selectedAnnualLeaves?.filter((x) => x.id !== annualLeave.id);
  }

  removeLimitedTimesLeave(limitedTimesLeave: BaseLookupModel) {
    this.selectedLimitedTimesLeaves = this.selectedLimitedTimesLeaves?.filter(
      (x) => x.id !== limitedTimesLeave.id
    );
  }

  getSelectedLeavesLabel(selectedLeaves?: BaseLookupModel[]): string {
    const count = selectedLeaves ? selectedLeaves.length : 0;

    if (count === 0) return '';

    const currentLang = this.languageService.getCurrentLanguage();
    if (currentLang === LANGUAGE_ENUM.ARABIC) {
      return count + ' أجازة مختارة';
    } else {
      return count + (count > 1 ? ' Leaves' : ' Leave') + ' selected';
    }
  }
}
