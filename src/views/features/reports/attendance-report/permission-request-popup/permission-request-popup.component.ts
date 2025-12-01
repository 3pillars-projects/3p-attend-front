import AttendanceReport from '@/models/features/attendance/attendance-report/attendance-report';
import { LimitedTimePermissionService } from '@/services/features/lookups/limited-time-permission.service';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { LimitedTimePermission } from '@/models/features/lookups/limited-time-permission/limited-time-permission';
import { CommonModule } from '@angular/common';
import { LAYOUT_DIRECTION_ENUM } from '@/enums/layout-direction-enum';
import { LanguageService } from '@/services/shared/language.service';
import { LANGUAGE_ENUM } from '@/enums/language-enum';
import { formatDateTo12Hour, formatTimeTo12Hour } from '@/utils/general-helper';

@Component({
  selector: 'app-permission-request-popup',
  templateUrl: './permission-request-popup.component.html',
  imports: [TranslatePipe, TableModule, CommonModule],
})
export class PermissionRequestPopupComponent implements OnInit {
  attendance!: AttendanceReport;
  permissions: LimitedTimePermission[] = [];
  // isLoading: boolean = false;
  limitedTimePermissionService = inject(LimitedTimePermissionService);
  declare direction: LAYOUT_DIRECTION_ENUM;
  languageService = inject(LanguageService);
  isEnglish = this.languageService.getCurrentLanguage() === LANGUAGE_ENUM.ENGLISH;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { model: AttendanceReport },
    private dialogRef: MatDialogRef<PermissionRequestPopupComponent>
  ) {
    this.direction =
      this.languageService.getCurrentLanguage() == LANGUAGE_ENUM.ENGLISH
        ? LAYOUT_DIRECTION_ENUM.LTR
        : LAYOUT_DIRECTION_ENUM.RTL;
  }

  ngOnInit(): void {
    this.attendance = this.data.model;
    console.log('Permission popup model:', this.attendance);
    this.loadPermissions();
  }

  loadPermissions(): void {
    // Collect all non-null permission IDs
    const permissionIds: number[] = [];

    if (this.attendance.attendancePermissionId != null) {
      permissionIds.push(this.attendance.attendancePermissionId);
    }
    if (this.attendance.midDayPermissionIds?.length) {
      permissionIds.push(...this.attendance.midDayPermissionIds);
    }
    if (this.attendance.leavePermissionId != null) {
      permissionIds.push(this.attendance.leavePermissionId);
    }

    // If there are no permission IDs, exit early
    if (permissionIds.length === 0) {
      console.log('No permissions found for this attendance report');
      return;
    }

    // this.isLoading = true;

    // Fetch permissions by IDs
    this.limitedTimePermissionService.getPermissionByIds(permissionIds).subscribe({
      next: (response) => {
        this.permissions = response || [];
        console.log('Loaded permissions:', this.permissions);
        // this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        // this.isLoading = false;
      },
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // Updated to use formatTimeTo12Hour from general-helper
  formatTime(timeString?: Date): string {
    if (!timeString) return '-';

    // Determine the locale string expected by the helper ('en-US' or 'ar-EG')
    // const locale = this.isEnglish ? 'en-US' : 'ar-EG';

    // Use the imported helper function
    return formatDateTo12Hour(
      timeString,
      this.languageService.getCurrentLanguage() as LANGUAGE_ENUM
    );
  }

  // Updated to calculate time and then use formatTime (which uses the helper)
  calculateEndTime(startTime?: Date | string, durationMinutes?: number): string {
    if (!startTime || !durationMinutes) return '-';
    const date = typeof startTime === 'string' ? new Date(startTime) : new Date(startTime);
    date.setMinutes(date.getMinutes() + durationMinutes);
    return this.formatTime(date);
  }

  formatDuration(minutes?: number): string {
    if (!minutes && minutes !== 0) return '-';

    if (this.isEnglish) {
      return `${minutes} Minutes`;
    } else {
      return `${minutes} دقيقة`;
    }
  }
  get employeeName() {
    return this.isEnglish ? this.attendance.fullNameEn : this.attendance.fullNameAr;
  }
  get departmentName() {
    return this.isEnglish ? this.attendance.departmentNameEn : this.attendance.departmentNameAr;
  }
}
