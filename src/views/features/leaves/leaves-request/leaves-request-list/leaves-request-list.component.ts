import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MyLeavesRequestListComponent } from '../my-leaves-request-list/my-leaves-request-list.component';
import { TeamLeavesRequestListComponent } from '../team-leaves-request-list/team-leaves-request-list.component';
import { MenuItem } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@/services/auth/auth.service';

@Component({
  selector: 'app-leaves-request-list',
  standalone: true,
  imports: [
    Breadcrumb,
    CommonModule,
    RouterModule,
    TabsModule,
    TranslateModule,
    MyLeavesRequestListComponent,
    TeamLeavesRequestListComponent,
  ],
  templateUrl: './leaves-request-list.component.html',
  styleUrl: './leaves-request-list.component.scss',
})
export class LeavesRequestListComponent implements OnInit, OnDestroy {
  translateService = inject(TranslateService);
  destroy$ = new Subject<void>();
  authService = inject(AuthService);
  @ViewChild('myList') myList!: MyLeavesRequestListComponent;
  @ViewChild('teamList') teamList!: TeamLeavesRequestListComponent;

  activeTabIndex = 0;
  breadcrumbs: MenuItem[] = [];
  home = {
    label: this.translateService.instant('COMMON.HOME'),
    icon: 'pi pi-home',
    routerLink: '/home',
  };

  ngOnInit() {
    this.setHomeItem();
    this.initBreadcrumbs();

    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setHomeItem();
      this.initBreadcrumbs();
    });
  }

  private setHomeItem(): void {
    this.home = {
      label: this.translateService.instant('COMMON.HOME'),
      icon: 'pi pi-home',
      routerLink: '/home',
    };
  }

  private initBreadcrumbs(): void {
    this.breadcrumbs = this.getBreadcrumbKeys().map((item) => ({
      label: this.translateService.instant(item.labelKey),
      icon: item.icon,
      routerLink: item.routerLink,
    }));
  }

  protected getBreadcrumbKeys(): {
    labelKey: string;
    icon?: string;
    routerLink?: string;
  }[] {
    return [{ labelKey: 'COMMON.DASHBOARD' }, { labelKey: 'LEAVE_REQUEST_PAGE.LEAVE_REQUESTS' }];
  }

  onTabChange(index: number | string) {
    this.activeTabIndex = Number(index);

    if (this.activeTabIndex === 0 && this.myList) {
      this.myList.resetSearch();
    } else if (this.activeTabIndex === 1 && this.teamList) {
      this.teamList.resetSearch();
    }
  }
  canViewTeamRequests() {
    return this.authService.isHROfficer || this.authService.isDepartmentManager;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
