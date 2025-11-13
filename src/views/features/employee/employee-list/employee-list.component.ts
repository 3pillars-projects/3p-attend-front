import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MatDialogConfig } from '@angular/material/dialog';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { ConfirmationService } from '@/services/shared/confirmation.service';
import { AlertService } from '@/services/shared/alert.service';
import { EmployeePermissionPopupComponent } from '../popups/employee-permission-popup/employee-permission-popup.component';
import { AssignShiftPopupComponent } from '../popups/assign-shift-popup/assign-shift-popup.component';
import { AddNewEmployeePopupComponent } from '../popups/add-new-employee-popup/add-new-employee-popup.component';
import { AddTaskPopupComponent } from '../popups/add-task-popup/add-task-popup.component';
import { TasksAssignedToEmployeePopupComponent } from '../popups/tasks-assigned-to-employee-popup/tasks-assigned-to-employee-popup.component';
import { AttendanceReportPopupComponent } from '../popups/attendance-report-popup/attendance-report-popup.component';
import { UserService } from '@/services/features/user.service';
import { BaseListComponent } from '@/abstracts/base-components/base-list/base-list.component';
import { User } from '@/models/auth/user';
import { UserFilter } from '@/models/auth/user-filter';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { InputTextModule } from 'primeng/inputtext';
import { ACCOUNT_STATUS_OPTIONS, AccountStatusOption } from '@/models/shared/account-status-option';
import { FINGERPRINT_EXEMPTION_OPTIONS } from '@/models/shared/fingerprint-exempt-option'; // Import your enums
import { LanguageService } from '@/services/shared/language.service';
import { ViewModeEnum } from '@/enums/view-mode-enum';
import { CityService } from '@/services/features/lookups/city.service';
import { CityLookup } from '@/models/features/lookups/city/city-lookup';
import { RegionService } from '@/services/features/lookups/region.service';
import { DepartmentService } from '@/services/features/lookups/department.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { BooleanOptionModel } from '@/models/shared/boolean-option';
import { AuthService } from '@/services/auth/auth.service';
import { Observable } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { formatDateOnly } from '@/utils/general-helper';
import { EmployeeImportModalComponent } from '../employee-import-modal/employee-import-modal.component';

@Component({
  selector: 'app-employee-list',
  imports: [
    Breadcrumb,
    FormsModule,
    Select,
    DatePickerModule,
    FluidModule,
    TableModule,
    CommonModule,
    RouterModule,
    CommonModule,
    SplitButtonModule,
    PaginatorModule,
    TranslatePipe,
    InputTextModule,
    DropdownModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
  providers: [MessageService],
})
export default class EmployeeListComponent
  extends BaseListComponent<User, AddNewEmployeePopupComponent, UserService, UserFilter>
  implements OnInit
{
  @ViewChild('employeeContainer', { static: true }) employeeContainer!: ElementRef;
  languageService = inject(LanguageService);
  cityService = inject(CityService);
  regionService = inject(RegionService);
  departmentService = inject(DepartmentService);
  authService = inject(AuthService);

  actionList: MenuItem[] = [];
  cities: CityLookup[] = [];
  regions: BaseLookupModel[] = [];
  departments: BaseLookupModel[] = [];

  userService = inject(UserService);
  filterModel: UserFilter = new UserFilter();
  accountStatusOptions: AccountStatusOption[] = ACCOUNT_STATUS_OPTIONS;
  fingerprintExemptionOptions: BooleanOptionModel[] = FINGERPRINT_EXEMPTION_OPTIONS;
  // items: MenuItem[] | undefined;
  selectedDepartment: BaseLookupModel | undefined;
  joinDate: Date | undefined;
  confirmationService = inject(ConfirmationService);
  override dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  override get service() {
    return this.userService;
  }

  get optionLabel(): string {
    const lang = this.languageService.getCurrentLanguage();
    return lang === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  get joinDateFrom(): Date | undefined {
    return this.filterModel.joinDateFrom;
  }

  set joinDateFrom(value: Date | undefined) {
    this.filterModel.joinDateFrom = value;

    // If dateTo is before dateFrom, reset or adjust it
    if (this.filterModel.joinDateTo && value && this.filterModel.joinDateTo < value) {
      this.filterModel.joinDateTo = value; // or set it to value
    }
  }

  override initListComponent(): void {
    // load lookups
    this.cityService.getCitiesLookup().subscribe((res: CityLookup[]) => {
      this.cities = res;
    });
    this.regionService.getRegionsLookup().subscribe((res: BaseLookupModel[]) => {
      this.regions = res;
    });
    this.departmentService.getLookup().subscribe((res: BaseLookupModel[]) => {
      this.departments = res;
    });
    this.initializeActionList();

    // Re-initialize action list when language changes
    this.translateService.onLangChange.subscribe(() => {
      this.initializeActionList();
    });
  }

  override openDialog(): void {
    const user = this.selectedModel || new User();
    const viewMode = this.selectedModel ? ViewModeEnum.EDIT : ViewModeEnum.CREATE;
    this.openBaseDialog(AddNewEmployeePopupComponent as any, user, viewMode, {
      cities: this.cities,
      regions: this.regions,
      departments: this.departments,
    });
  }

  override openBaseDialog(
    popupComponent: AddNewEmployeePopupComponent,
    model: User,
    viewMode: ViewModeEnum,
    lookups?: {
      [key: string]: any[];
    }
  ) {
    const clonedModel = Object.assign(Object.create(Object.getPrototypeOf(model)), model);
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = { model: clonedModel, lookups: lookups, viewMode: viewMode };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(popupComponent as any, dialogConfig);

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      this.selectedModel = undefined;
      if (result && result == DIALOG_ENUM.OK) {
        this.loadList().subscribe({
          next: (response) => this.handleLoadListSuccess(response),
          error: this.handleLoadListError,
        });
      }
    });
  }

  onDepartmentChange(deptId: number | undefined) {
    this.filterModel.fkDepartmentId = deptId;
  }

  openEmployeePermissionModal(user: User) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = { model: user };
    dialogConfig.width = '100%';
    dialogConfig.maxWidth = '1024px';
    const dialogRef = this.matDialog.open(EmployeePermissionPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      if (result && result == DIALOG_ENUM.OK) {
        this.loadList().subscribe({
          next: (response) => this.handleLoadListSuccess(response),
          error: this.handleLoadListError,
        });
      }
    });
  }

  assignShiftPopup() {
    const dialogRef = this.matDialog.open(AssignShiftPopupComponent, {
      width: '100%',
      maxWidth: '1024px',
    });

    dialogRef.afterClosed().subscribe();
  }

  assignTaskPopup() {
    const dialogRef = this.matDialog.open(AddTaskPopupComponent, {
      width: '100%',
      maxWidth: '1024px',
    });

    dialogRef.afterClosed().subscribe();
  }

  tasksAssignedToEmployee() {
    const dialogRef = this.matDialog.open(TasksAssignedToEmployeePopupComponent, {
      width: '100%',
      maxWidth: '1024px',
    });

    dialogRef.afterClosed().subscribe();
  }

  attendanceReportPopup() {
    const dialogRef = this.matDialog.open(AttendanceReportPopupComponent, {
      width: '100%',
      maxWidth: '1024px',
    });

    dialogRef.afterClosed().subscribe();
  }

  openImportModal() {
    const dialogRef = this.matDialog.open(EmployeeImportModalComponent, {
      width: '100%',
      maxWidth: '1024px',
    });

    dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      if (result && result == DIALOG_ENUM.OK) {
        this.loadList().subscribe({
          next: (response) => {
            this.handleLoadListSuccess(response);
            this.alertService.showSuccessMessage({
              messages: ['COMMON.DATA_HAS_BEEN_IMPORTED_SUCCESSFULLY'],
            });
          },
          error: this.handleLoadListError,
        });
      }
    });
  }

  openConfirmation() {
    const dialogRef = this.confirmationService.open({
      icon: 'warning',
      messages: ['COMMON.CONFIRM_DELETE'],
      confirmText: 'COMMON.OK',
      cancelText: 'COMMON.CANCEL',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == DIALOG_ENUM.OK) {
        // User confirmed
        this.alertService.showSuccessMessage({ messages: ['COMMON.DELETED_SUCCESSFULLY'] });
      } else {
        // User canceled
        this.alertService.showErrorMessage({ messages: ['COMMON.DELETION_FAILED'] });
      }
    });
  }

  setSelectedModel(model: User) {
    this.selectedModel = model;
  }

  getDepartmentName(department: BaseLookupModel): string {
    return this.languageService?.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
      ? (department?.nameEn ?? '')
      : (department?.nameAr ?? '');
  }

  protected override getBreadcrumbKeys() {
    return [{ labelKey: 'EMPLOYEES_PAGE.EMPLOYEES_LIST' }];
  }
  formatJoinDate(joinDate: Date) {
    return formatDateOnly(joinDate);
  }

  // Excel Export Implementation
  protected override mapModelToExcelRow(model: User): { [key: string]: any } {
    const formatBoolean = (value: boolean | undefined): string => {
      if (value === undefined || value === null) return '';
      return value
        ? this.translateService.instant('COMMON.YES')
        : this.translateService.instant('COMMON.NO');
    };

    return {
      [this.translateService.instant('EMPLOYEES_PAGE.NATIONAL_ID')]: model.nationalId || '',
      [this.translateService.instant('EMPLOYEES_PAGE.EMPLOYEE_NAME_ARABIC')]:
        model.fullNameAr || '',
      [this.translateService.instant('EMPLOYEES_PAGE.EMPLOYEE_NAME_ENGLISH')]:
        model.fullNameEn || '',
      [this.translateService.instant('EMPLOYEES_PAGE.DEPARTMENT')]:
        this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ARABIC
          ? model.department?.nameAr || ''
          : model.department?.nameEn || '',
      [this.translateService.instant('EMPLOYEES_PAGE.FINGERPRINT_EXEMPTION')]: formatBoolean(
        model.canLeaveWithoutFingerPrint
      ),
      [this.translateService.instant('EMPLOYEES_PAGE.JOB_TITLE_ARABIC')]: model.jobTitleAr || '',
      [this.translateService.instant('EMPLOYEES_PAGE.JOB_TITLE_ENGLISH')]: model.jobTitleEn || '',
      [this.translateService.instant('EMPLOYEES_PAGE.ACCOUNT_STATUS')]: formatBoolean(
        model.isActive
      ),
      [this.translateService.instant('EMPLOYEES_PAGE.JOIN_DATE')]: formatDateOnly(model.joinDate),
    };
  }

  private initializeActionList(): void {
    this.actionList = [
      {
        label: this.translateService.instant('EMPLOYEES_PAGE.EDIT_EMPLOYEE_DATA'),
        command: () => this.openDialog(),
      },
      // **** hidden for now ****
      // ,
      // {
      //   separator: true,
      // },
      // {
      //   label: this.translateService.instant('EMPLOYEES_PAGE.VIEW_ATTENDANCE_REPORT'),
      //   command: () => this.attendanceReportPopup(),
      // },
      // {
      //   separator: true,
      // },
      // {
      //   label: this.translateService.instant('EMPLOYEES_PAGE.ASSIGN_TASK'),
      //   command: () => this.assignTaskPopup(),
      // },
      // {
      //   separator: true,
      // },
      // {
      //   label: this.translateService.instant('EMPLOYEES_PAGE.ASSIGN_SHIFT'),
      //   command: () => this.assignShiftPopup(),
      // },
      // {
      //   separator: true,
      // },
      // {
      //   label: this.translateService.instant('EMPLOYEES_PAGE.TASKS_ASSIGNED_TO_EMPLOYEE'),
      //   command: () => this.tasksAssignedToEmployee(),
      // },

      // **** hidden for now ****

      // {
      //   separator: true,
      // },
      // {
      //   label: this.translateService.instant('EMPLOYEES_PAGE.DELETE_EMPLOYEE'),
      //   styleClass: 'p-menuitem-danger',
      //   command: () => this.openConfirmation(),
      // },
    ];
  }
}
