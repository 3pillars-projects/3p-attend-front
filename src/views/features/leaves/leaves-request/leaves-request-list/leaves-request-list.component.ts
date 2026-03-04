import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Tabs, TabsModule } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewLeaveRequestComponent } from '../leaves-request-popups/view-leave-request/view-leave-request.component';
import { DIALOG_ENUM } from '@/enums/dialog-enum';
import { AddNewLeaveRequestComponent } from '../leaves-request-popups/add-new-leave-request/add-new-leave-request.component';
@Component({
  selector: 'app-leaves-request-list',
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
    TabsModule,
    DatePicker,
    Select,
  ],
  templateUrl: './leaves-request-list.component.html',
  styleUrl: './leaves-request-list.component.scss',
})
export class LeavesRequestListComponent {
  first: number = 0;
  rows: number = 10;
  date2: Date | undefined;
  attendance!: any[];
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  dialogSize = {
    width: '100%',
    maxWidth: '1024px',
  };

  matDialog = inject(MatDialog);

  ngOnInit() {
    this.items = [{ label: 'لوحة المعلومات' }, { label: 'طلبات الإجازات' }];
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
  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }
  openViewLeaveRequest(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(ViewLeaveRequestComponent as any, dialogConfig);

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      console.log('closed');
    });
  }
  openAddNewLeaveRequestPopup(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(AddNewLeaveRequestComponent as any, dialogConfig);

    return dialogRef.afterClosed().subscribe((result: DIALOG_ENUM) => {
      console.log('closed');
    });
  }
}
