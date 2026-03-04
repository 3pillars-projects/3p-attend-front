import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { LeaveTransferActionType } from '@/enums/leave-transfer-action-type';
import { LeaveTransferEligibleEmployee } from '@/models/features/business/leave-transfer/leave-transfer-eligible-employee';
import { LeaveTransferEmployeesRequest } from '@/models/features/business/leave-transfer/leave-transfer-employees-request';
import { LeaveTransferActionRequest } from '@/models/features/business/leave-transfer/leave-transfer-action-request';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ValidationMessagesComponent } from '@/views/shared/validation-messages/validation-messages.component';
import { BaseLookupModel } from '@/models/features/lookups/base-lookup-model';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { LanguageService } from '@/services/shared/language.service';
import { DepartmentService } from '@/services/features/lookups/department.service';
import { LeaveTransferService } from '@/services/features/business/leave-transfer.service';
import {
  OPERATION_TYPE_OPTIONS,
  OperationTypeOption,
} from '@/models/features/business/leave-transfer/operation-type-option';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@/services/shared/confirmation.service';
import { AlertService } from '@/services/shared/alert.service';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { LeaveTransferAnnualLeaveTypeLookup } from '@/models/features/business/leave-transfer/leave-transfer-annual-leave-type-lookup';

interface YearOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-transfer-leaves-balances',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    Select,
    BreadcrumbModule,
    InputTextModule,
    InputNumber,
    ValidationMessagesComponent,
    TranslatePipe,
  ],
  templateUrl: './transfer-leaves-balances.component.html',
  styleUrl: './transfer-leaves-balances.component.scss',
})
export default class TransferLeavesBalancesComponent {
  filterForm!: FormGroup;
  operationForm!: FormGroup;

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  operationTypeOptions: OperationTypeOption[] = OPERATION_TYPE_OPTIONS;

  yearOptions: YearOption[] = [];
  currentYear = new Date().getFullYear();
  responseYear: number = this.currentYear; // Year from API response

  // Available employees (left side)
  availableEmployees: LeaveTransferEligibleEmployee[] = [];

  // Selected employees (right side)
  selectedEmployees: LeaveTransferEligibleEmployee[] = [];
  languageService = inject(LanguageService);
  departmentService = inject(DepartmentService);
  fb = inject(FormBuilder);

  departments: BaseLookupModel[] = [];

  leaveTypes: LeaveTransferAnnualLeaveTypeLookup[] = [];
  leaveTransferService = inject(LeaveTransferService);
  // Search terms
  availableSearchTerm: string = '';
  selectedSearchTerm: string = '';

  translateService = inject(TranslateService);
  confirmationService = inject(ConfirmationService);
  alertService = inject(AlertService);

  ngOnInit() {
    this.updateBreadcrumbs();
    this.translateService.onLangChange.subscribe(() => {
      this.updateBreadcrumbs();
    });

    this.buildForms();
    this.generateYearOptions();
    this.leaveTransferService.getAnnualLeaveTypesLookup().subscribe((res) => {
      this.leaveTypes = res;
    });
    this.loadLookups();

    // Listen for changes in year to reload employees if action is RenewLeaveBalance
    this.operationForm.get('year')?.valueChanges.subscribe(() => {
      if (this.isRenewAction) {
        this.loadEligibleEmployees();
      }
    });
  }

  updateBreadcrumbs() {
    this.items = [
      {
        label: this.translateService.instant('COMMON.HOME'),
        icon: 'pi pi-home',
        routerLink: '/home',
      },
      { label: this.translateService.instant('LEAVES.TRANSFER_BALANCES.TITLE') },
    ];
  }

  loadLookups(): void {
    this.departmentService.getLookup().subscribe((res: BaseLookupModel[]) => {
      this.departments = res;
    });
  }

  previousActionType: LeaveTransferActionType | null = null;

  onReset(): void {
    this.filterForm.reset();
    this.operationForm.reset();
    this.availableEmployees = [];
    this.selectedEmployees = [];
    this.currentYear = new Date().getFullYear();
    this.responseYear = this.currentYear;
    this.availableSearchTerm = '';
    this.selectedSearchTerm = '';
    this.previousActionType = null;
  }

  private buildForms(): void {
    // Filter form for department and leave type
    this.filterForm = this.fb.group({
      departmentId: [null],
      leaveTypeId: [null, Validators.required],
    });

    // Operation form - using API field names
    this.operationForm = this.fb.group({
      actionType: [null, Validators.required],
      year: [null, Validators.required],
      transferAmount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private generateYearOptions(year?: number): void {
    // Generate years: current year ± 5 years
    for (let i = 1; i <= 5; i++) {
      if (!year) {
        year = this.currentYear;
      }
      this.yearOptions.push({
        label: year.toString(),
        value: year,
      });
      year++;
    }
  }

  loadEligibleEmployees(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const filterValues = this.filterForm.value;
    const operationValues = this.operationForm.getRawValue();

    // Determine year based on action type
    let year = this.currentYear;
    if (this.isRenewAction && operationValues.year) {
      year = operationValues.year;
    }

    const request: LeaveTransferEmployeesRequest = {
      departmentId: filterValues.departmentId || undefined,
      leaveTypeId: filterValues.leaveTypeId,
      year: year,
    };

    // Store selected year for display
    this.responseYear = year;

    this.leaveTransferService.getEligibleEmployees(request).subscribe({
      next: (response) => {
        this.availableEmployees = response.employees;
        // clear selected employees when reloading
        this.selectedEmployees = [];
      },
    });
  }

  onSubmit(): void {
    if (this.operationForm.invalid) {
      this.operationForm.markAllAsTouched();
      return;
    }

    if (this.selectedEmployees.length === 0) {
      return;
    }

    const dialogRef = this.confirmationService.open({
      icon: 'warning',
      messages: ['COMMON.CONFIRM_UPDATE_BALANCES'], // Assuming a generic confirmation message or create a new one
      confirmText: 'COMMON.YES',
      cancelText: 'COMMON.CANCEL',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == DIALOG_ENUM.OK) {
        this.submitAction();
      }
    });
  }

  submitAction(): void {
    const opValues = this.operationForm.value;
    const filterValues = this.filterForm.value;

    const request: LeaveTransferActionRequest = {
      actionType: opValues.actionType,
      leaveTypeId: filterValues.leaveTypeId,
      year: opValues.year,
      transferAmount: opValues.transferAmount || undefined,
      employees: this.selectedEmployees.map((e) => e.id),
    };

    this.leaveTransferService.applyAction(request).subscribe({
      next: (response) => {
        this.alertService.showSuccessMessage({ messages: ['COMMON.SAVED_SUCCESSFULLY'] });
        this.selectedEmployees = [];
        this.availableEmployees = [];
        this.operationForm.reset();
        this.filterForm.reset();
      },
      error: (error) => {
        // Error handling is usually done by interceptor, but if we need specific handling:
        // this.alertService.showErrorMessage({ messages: ['COMMON.ERROR'] });
      },
    });
  }

  // Move single employee from available to selected
  moveToSelected(employee: LeaveTransferEligibleEmployee): void {
    const index = this.availableEmployees.findIndex((e) => e.id === employee.id);
    if (index > -1) {
      this.availableEmployees.splice(index, 1);
      this.selectedEmployees.push(employee);
    }
  }

  // Move single employee from selected to available
  moveToAvailable(employee: LeaveTransferEligibleEmployee): void {
    const index = this.selectedEmployees.findIndex((e) => e.id === employee.id);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
      this.availableEmployees.push(employee);
    }
  }

  // Move all available employees to selected
  moveAllToSelected(): void {
    this.selectedEmployees.push(...this.availableEmployees);
    this.availableEmployees = [];
  }

  // Move all selected employees to available
  moveAllToAvailable(): void {
    this.availableEmployees.push(...this.selectedEmployees);
    this.selectedEmployees = [];
  }

  // Filter employees based on search term
  private filterEmployees(
    employees: LeaveTransferEligibleEmployee[],
    searchTerm: string
  ): LeaveTransferEligibleEmployee[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return employees;
    }
    const term = searchTerm.toLowerCase().trim();
    return employees.filter(
      (emp) => emp.nameAr.toLowerCase().includes(term) || emp.nameEn.toLowerCase().includes(term)
    );
  }

  // Get filtered available employees
  get filteredAvailableEmployees(): LeaveTransferEligibleEmployee[] {
    return this.filterEmployees(this.availableEmployees, this.availableSearchTerm);
  }

  // Get filtered selected employees
  get filteredSelectedEmployees(): LeaveTransferEligibleEmployee[] {
    return this.filterEmployees(this.selectedEmployees, this.selectedSearchTerm);
  }

  // Clear search terms
  clearAvailableSearch(): void {
    this.availableSearchTerm = '';
  }

  clearSelectedSearch(): void {
    this.selectedSearchTerm = '';
  }

  // Get counts for display
  get availableCount(): number {
    return this.availableEmployees.length;
  }

  get selectedCount(): number {
    return this.selectedEmployees.length;
  }

  onOperationTypeChange(): void {
    const actionType = this.operationForm.get('actionType')?.value;

    if (this.selectedEmployees.length > 0) {
      const dialogRef = this.confirmationService.open({
        icon: 'warning',
        messages: ['COMMON.CONFIRM_OPERATION_TYPE_CHANGE'],
        confirmText: 'COMMON.YES',
        cancelText: 'COMMON.CANCEL',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === DIALOG_ENUM.OK) {
          this.selectedEmployees = [];
          this.previousActionType = actionType;
          this.executeOperationTypeChangeLogic(actionType);
        } else {
          // Revert changes
          this.operationForm
            .get('actionType')
            ?.setValue(this.previousActionType, { emitEvent: false });
        }
      });
    } else {
      this.previousActionType = actionType;
      this.executeOperationTypeChangeLogic(actionType);
    }
  }

  private executeOperationTypeChangeLogic(actionType: any): void {
    const transferAmountControl = this.operationForm.get('transferAmount');
    const yearControl = this.operationForm.get('year');

    if (
      actionType === LeaveTransferActionType.TransferBalance ||
      actionType === LeaveTransferActionType.ReverseTransferBalance
    ) {
      yearControl?.setValue(this.currentYear);
      yearControl?.setValidators([Validators.required]);
      transferAmountControl?.setValidators([Validators.required, Validators.min(1)]);
      transferAmountControl?.enable();
    } else if (actionType === LeaveTransferActionType.RenewLeaveBalance) {
      yearControl?.setValue(null);
      yearControl?.setValidators([Validators.required]);
      transferAmountControl?.clearValidators();
      transferAmountControl?.disable();
    } else {
      // Reset if null or other
      yearControl?.setValue(null);
      yearControl?.clearValidators();
      transferAmountControl?.setValidators([Validators.required, Validators.min(1)]);
      transferAmountControl?.enable();
    }

    yearControl?.updateValueAndValidity();
    transferAmountControl?.updateValueAndValidity();

    // Check renew action loading
    if (this.isRenewAction && this.operationForm.get('year')?.value) {
      this.loadEligibleEmployees();
    }
  }

  get isRenewAction(): boolean {
    const actionType = this.operationForm.get('actionType')?.value;
    return actionType === LeaveTransferActionType.RenewLeaveBalance;
  }

  get shouldShowYearSelect(): boolean {
    const actionType = this.operationForm.get('actionType')?.value;
    return actionType === LeaveTransferActionType.RenewLeaveBalance;
  }

  get isForwardOrBackwardTransfer(): boolean {
    const actionType = this.operationForm.get('actionType')?.value;
    return (
      actionType === LeaveTransferActionType.TransferBalance ||
      actionType === LeaveTransferActionType.ReverseTransferBalance
    );
  }

  getPropertyName(): string {
    return this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH
      ? 'nameEn'
      : 'nameAr';
  }

  isCurrentLanguageEnglish(): boolean {
    return this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;
  }
}
