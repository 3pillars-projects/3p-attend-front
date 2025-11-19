import AttendanceReport from '@/models/features/attendance/attendance-report/attendance-report';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-permission-request-popup',
  templateUrl: './permission-request-popup.component.html',
  imports: [TranslatePipe, TableModule],
})
export class PermissionRequestPopupComponent implements OnInit {
  attendance!: any;
  limitedTimePermissionService = inject(LimitedTimePermissionService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { model: AttendanceReport },
    private dialogRef: MatDialogRef<PermissionRequestPopupComponent>
  ) {}

  ngOnInit(): void {
    this.attendance = this.data.model;
    console.log('Permission popup model:', this.attendance);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
