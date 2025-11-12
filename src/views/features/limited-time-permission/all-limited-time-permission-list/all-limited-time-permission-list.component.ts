import { Component, inject } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { MenuItem } from '@/models/shared/menu-item';
import { PaginatorState } from 'primeng/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddEditLimitedTimePermissionPopupComponent } from '../add-edit-limited-time-permission-popup/add-edit-limited-time-permission-popup.component';
import { ViewLimitedTimePermissionPopupComponent } from '../view-limited-time-permission-popup/view-limited-time-permission-popup.component';
@Component({
  selector: 'app-all-limited-time-permission-list',
  imports: [Select, DatePicker, Paginator, TableModule],
  templateUrl: './all-limited-time-permission-list.component.html',
  styleUrl: './all-limited-time-permission-list.component.scss',
})
export class AllLimitedTimePermissionListComponent {
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
    this.items = [{ label: 'لوحة المعلومات' }, { label: 'ورديات العمل المؤقتة' }];
    // Updated dummy data to match your Arabic table structure
    this.attendance = [{}];
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }
  openDialog(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(
      AddEditLimitedTimePermissionPopupComponent as any,
      dialogConfig
    );
  }
  openViewDialog(model?: any) {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      model: model,
    };
    dialogConfig.width = this.dialogSize.width;
    dialogConfig.maxWidth = this.dialogSize.maxWidth;
    const dialogRef = this.matDialog.open(
      ViewLimitedTimePermissionPopupComponent as any,
      dialogConfig
    );
  }
}
