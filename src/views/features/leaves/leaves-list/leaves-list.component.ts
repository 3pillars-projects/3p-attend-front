import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { TranslatePipe } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { MatDialog } from '@angular/material/dialog';
import { LeavesPopupComponent, LeaveType } from '../leaves-popup/leaves-popup.component';
import { ViewModeEnum } from '@/enums/view-mode-enum';

@Component({
  selector: 'app-leaves-list',
  imports: [
    Breadcrumb,
    FormsModule,
    Select,
    TableModule,
    CommonModule,
    PaginatorModule,
    TranslatePipe,
    InputTextModule,
  ],
  templateUrl: './leaves-list.component.html',
  styleUrl: './leaves-list.component.scss'
})
export class LeavesListComponent implements OnInit {
  languageService = inject(LanguageService);
  matDialog = inject(MatDialog);

  // Breadcrumb
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbs: MenuItem[] = [];

  // Filter model
  filterModel = {
    jobTitleAr: '',
    jobTitleEn: '',
    isActive: undefined
  };

  // Account status options
  accountStatusOptions = [
    { id: true, nameAr: 'نشط', nameEn: 'Active' },
    { id: false, nameAr: 'غير نشط', nameEn: 'Inactive' }
  ];

  // Static list data
  list: any[] = [];

  // Pagination
  first = 0;
  rows = 10;
  paginationInfo = {
    totalItems: 0
  };

  get optionLabel(): string {
    const lang = this.languageService.getCurrentLanguage();
    return lang === LANGUAGE_ENUM.ARABIC ? 'nameAr' : 'nameEn';
  }

  ngOnInit(): void {
    this.breadcrumbs = [
      { label: 'الرئيسية' },
      { label: 'الإجازات' }
    ];

    // Add static sample data
    this.list = [
      {
        id: 1,
        jobTitleAr: 'إجازة سنوية',
        jobTitleEn: 'Annual Leave',
        nationalId: '21',
        fullNameAr: '7',
        isActive: true
      },
      {
        id: 2,
        jobTitleAr: 'إجازة مرضية',
        jobTitleEn: 'Sick Leave',
        nationalId: '15',
        fullNameAr: '5',
        isActive: true
      },
      {
        id: 3,
        jobTitleAr: 'إجازة طارئة',
        jobTitleEn: 'Emergency Leave',
        nationalId: '5',
        fullNameAr: '3',
        isActive: true
      },
      {
        id: 4,
        jobTitleAr: 'إجازة أمومة',
        jobTitleEn: 'Maternity Leave',
        nationalId: '90',
        fullNameAr: '90',
        isActive: true
      },
      {
        id: 5,
        jobTitleAr: 'إجازة دراسية',
        jobTitleEn: 'Study Leave',
        nationalId: '10',
        fullNameAr: '10',
        isActive: false
      }
    ];

    this.paginationInfo.totalItems = this.list.length;
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  exportExcel(filename: string): void {
    console.log('Export excel:', filename);
  }

  openDialog(): void {
    const leaveType = new LeaveType();
    const dialogRef = this.matDialog.open(LeavesPopupComponent, {
      width: '100%',
      maxWidth: '1024px',
      data: {
        model: leaveType,
        viewMode: ViewModeEnum.CREATE
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Leave type saved:', result);
        // Here you can add the new leave type to the list
        // this.list.push(result);
        // this.paginationInfo.totalItems = this.list.length;
      }
    });
  }
}
