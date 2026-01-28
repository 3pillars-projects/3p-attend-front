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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LanguageService } from '@/services/shared/language.service';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { EmployeeLeaveBalance } from '@/models/features/business/leaves-balances/employee-leave-balance';
import { LeaveTypeService } from '@/services/features/business/leave-type.service';
import { EmployeeBalanceService } from '@/services/features/business/employee-balance.service';
import { EmployeeBalanceFilter } from '@/models/features/business/leaves-balances/employee-balance-filter';
import { DepartmentService } from '@/services/features/lookups/department.service';
import { GENDER_ENUM } from '@/enums/gender-enum';
import { RELIGION_ENUM } from '@/enums/religion-enum';

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
    TranslatePipe,
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
  departments: BaseLookupModel[] = [];
  years: number[] = [];

  departmentService = inject(DepartmentService);
  genderOptions = [
    { id: GENDER_ENUM.MALE, nameEn: 'Male', nameAr: 'ذكر' },
    { id: GENDER_ENUM.FEMALE, nameEn: 'Female', nameAr: 'أنثى' },
  ];
  religionOptions = [
    { id: RELIGION_ENUM.MUSLIM, nameAr: 'مسلم', nameEn: 'Muslim' },
    { id: RELIGION_ENUM.CHRISTIAN, nameAr: 'مسيحي', nameEn: 'Christian' },
  ];
  getGenderName(id?: number | null): string {
    if (id == null) return '';

    const gender = this.genderOptions.find((g) => g.id === id);
    return this.languageService?.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH
      ? (gender?.nameEn ?? '')
      : (gender?.nameAr ?? '');
  }

  getReligionName(id?: number | null): string {
    if (id == null) return '';

    const religion = this.religionOptions.find((r) => r.id === id);
    return this.languageService?.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH
      ? (religion?.nameEn ?? '')
      : (religion?.nameAr ?? '');
  }

  filterModel: EmployeeBalanceFilter = new EmployeeBalanceFilter();

  employeeBalanceService = inject(EmployeeBalanceService);
  override get service(): EmployeeBalanceService {
    return this.employeeBalanceService;
  }
  override openDialog(employeeLeaveBalance: EmployeeLeaveBalance): void {}
  override initListComponent(): void {
    this.filterModel.year = new Date().getFullYear();
    this.leavesBalance = this.activatedRoute.snapshot.data['leavesBalance'];
    this.years = this.activatedRoute.snapshot.data['years'];
    this.departmentService.getLookup().subscribe((res) => {
      this.departments = res;
    });
  }
  getPropertyName() {
    return this.langService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH ? 'nameEn' : 'nameAr';
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
      [this.translateService.instant('LEAVE_TYPES_PAGE.MAX_CONSECUTIVE_DAYS')]: '',
    };
  }
  dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  loadEmployeeBalancesList() {
    this.loadList().subscribe({
      next: (response) => this.handleLoadListSuccess(response),
      error: this.handleLoadListError,
    });
  }
  leavesBalance?: LeaveTypesLookup;

  selectedAnnualLeaves?: BaseLookupModel[] = [];
  selectedLimitedTimesLeaves?: BaseLookupModel[] = [];
  languageService: LanguageService = inject(LanguageService);
  openEmployeeDialog(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
      years: this.years,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(
      EditEmployeeLeavesBalancesPopupComponent as any,
      dialogConfig
    );

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      if (result === DIALOG_ENUM.OK) {
        this.loadEmployeeBalancesList();
      }
    });
  }
  openEmployeesDialog(leaveType: BaseLookupModel) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      leaveType: leaveType,
      filter: this.filterModel,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(
      EditMultipleEmployeeLeavesBalancesPopupComponent as any,
      dialogConfig
    );

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      if (result === DIALOG_ENUM.OK) {
        this.loadEmployeeBalancesList();
      }
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

  getEmployeeAnnualLeaveBalance(employee: EmployeeLeaveBalance, annualLeaveId: number) {
    const emp = employee.annualLeaves.find((x) => x.fkLeaveTypeId == annualLeaveId);
    if (!emp?.isEligible) {
      return 'not eligible';
    } else {
      return emp.remainingBalance;
    }
  }

  getEmployeeLimitedLeaveBalance(employee: EmployeeLeaveBalance, limitedLeaveId: number) {
    const emp = employee.limitedTimesLeaves.find((x) => x.fkLeaveTypeId == limitedLeaveId);
    if (!emp?.isEligible) {
      return 'not eligible';
    } else {
      return emp.remainingTimes;
    }
  }

  private yearWord(years: number): string {
    const isEn = this.languageService?.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;

    if (isEn) {
      return years === 1 ? 'year' : 'years';
    }

    // Arabic
    if (years === 1) return 'سنة';
    if (years === 2) return 'سنتين';
    if (years >= 3 && years <= 10) return 'سنين';
    return 'سنة';
  }

  private monthWord(months: number): string {
    const isEn = this.languageService?.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;

    if (isEn) {
      return months === 1 ? 'month' : 'months';
    }

    // Arabic
    if (months === 1) return 'شهر';
    if (months === 2) return 'شهرين';
    if (months >= 3 && months <= 10) return 'شهور';
    return 'شهر';
  }

  formatExperience(totalMonths?: number | null): string {
    if (!totalMonths || totalMonths <= 0) return '';

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const isEn = this.languageService?.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;
    const sep = isEn ? ' and ' : ' و ';

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${this.yearWord(years)}`);
    if (months > 0) parts.push(`${months} ${this.monthWord(months)}`);

    return parts.join(sep);
  }
  override resetSearch() {
    this.filterModel = new EmployeeBalanceFilter();
    this.appliedFilterModel = new EmployeeBalanceFilter();
    this.paginationParams.pageNumber = 1;
    this.paginationParams.pageSize = 10;
    this.first = 0;
    this.loadEmployeeBalancesList();
  }
}
