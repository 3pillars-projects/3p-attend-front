import { inject, Injectable } from '@angular/core';
import { Router, Route } from '@angular/router';
import { AuthService } from '@/services/auth/auth.service';
import { RouteIdsEnum } from '@/enums/route-ids-enum';
import { MenuItem } from '@/models/shared/menu-item';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';

type MenuItemConfig = Omit<MenuItem, 'label' | 'children'> & {
  labelKey: string;
  children?: MenuItemConfig[];
};

@Injectable({
  providedIn: 'root',
})
export class SideBarLinksService {
  translateService = inject(TranslateService);
  router = inject(Router);
  authService = inject(AuthService);

  private rawMenuConfig: MenuItemConfig[] = [
    // hidden for release 1
    // {
    //   labelKey: 'MENU.DASHBOARD',
    //   iconUrl: 'assets/icons/menu-icons/home.svg',
    //   routerLink: ['/dashboard'],
    // },
    {
      labelKey: 'MENU.ATTENDANCE_REPORT',
      iconUrl: 'assets/icons/menu-icons/icon-stroke-rounded.svg',
      routerLink: ['/attendance-report'],
      routeId: RouteIdsEnum.ATTENDANCE_REPORT,
    },
    {
      labelKey: 'MENU.ATTENDANCE_REPORT_PROCESSING',
      iconUrl: 'assets/icons/menu-icons/icon-stroke-rounded.svg',
      routerLink: ['/reports-processing'],
      routeId: RouteIdsEnum.ATTENDANCE_REPORT_PROCESSING,
    },
    {
      labelKey: 'MENU.ATTENDANCE_LOGS',
      iconUrl: 'assets/icons/menu-icons/icon.svg',
      routerLink: ['/attendance-logs'],
      routeId: RouteIdsEnum.ATTENDANCE_LOGS,
    },
    {
      labelKey: 'MENU.DEPARTMENTS',
      iconUrl: 'assets/icons/menu-icons/tools.svg',
      routerLink: ['/departments'],
      routeId: RouteIdsEnum.DEPARTMENTS,
    },
    {
      labelKey: 'MENU.EMPLOYEES',
      iconUrl: 'assets/icons/menu-icons/employees.svg',
      routerLink: ['/employees'],
      routeId: RouteIdsEnum.EMPLOYEES,
    },
    // {
    //   labelKey: 'MENU.PRESENCE_INQUIRIES',
    //   iconUrl: 'assets/icons/menu-icons/icon2.svg',
    //   routerLink: ['/dashboard'],
    // },
    {
      labelKey: 'MENU.PERMISSIONS',
      iconUrl: 'assets/icons/menu-icons/permissions.svg',
      routerLink: ['/permissions'],
      routeId: RouteIdsEnum.PERMISSIONS,
    },
    {
      labelKey: 'MENU.LIMITED_TIME_PERMISSION',
      iconUrl: 'assets/icons/menu-icons/permissions.svg',
      routerLink: ['/limited-time-permission'],
    },
    {
      labelKey: 'MENU.PRESENCE_INQUIRIES',
      iconUrl: 'assets/icons/menu-icons/tools.svg',
      routerLink: ['/presence-inquiries'],
      routeId: RouteIdsEnum.PRESENCE_INQUIRIES,
    },
    // {
    //   labelKey: 'MENU.ASSIGNED_EMPLOYEES',
    //   iconUrl: 'assets/icons/menu-icons/icon3.svg',
    //   routerLink: ['/dashboard'],
    // },
    // {
    //   labelKey: 'MENU.WORK_SHIFT_TEMP',
    //   iconUrl: 'assets/icons/menu-icons/sifts-add-icon.svg',
    //   routerLink: ['/dashboard'],
    //   routeId: RouteIdsEnum.WORK_SHIFT_TEMP,
    // },
    // {
    //   labelKey: 'MENU.WORK_SHIFT_ASSIGNMENT',
    //   iconUrl: 'assets/icons/menu-icons/sifts-add-icon.svg',
    //   routerLink: ['/dashboard'],
    //   routeId: RouteIdsEnum.WORK_SHIFT_ASSIGNMENT,
    // },
    {
      labelKey: 'MENU.HOLIDAYS',
      iconUrl: 'assets/icons/menu-icons/vacations.svg',
      routerLink: ['/holidays'],
      routeId: RouteIdsEnum.HOLIDAYS,
    },
    {
      labelKey: 'MENU.VISITS',
      iconUrl: 'assets/icons/menu-icons/visits.svg',
      children: [
        {
          labelKey: 'MENU.VISIT_REQUEST',
          routerLink: ['/visit-request'],
          routeId: RouteIdsEnum.VISIT_REQUEST,
        },
        {
          labelKey: 'MENU.BLACKLIST',
          routerLink: ['/blacklist'],
          routeId: RouteIdsEnum.BLACKLIST,
        },
      ],
    },
    {
      labelKey: 'MENU.WORK_MISSIONS',
      iconUrl: 'assets/icons/menu-icons/permissions.svg',
      routerLink: ['/work-missions'],
      routeId: RouteIdsEnum.WORK_MISSION,
    },
    {
      labelKey: 'MENU.WORK_SHIFT',
      iconUrl: 'assets/icons/time-icon.svg',
      children: [
        {
          labelKey: 'MENU.WORK_SHIFT_SETTINGS',
          routerLink: ['/work-shifts'],
          routeId: RouteIdsEnum.WORK_SHIFTS,
        },
        {
          labelKey: 'MENU.WORK_SHIFT_ASSIGNMENT',
          routerLink: ['/work-shifts-assignment'],
          routeId: RouteIdsEnum.WORK_SHIFT_ASSIGNMENT,
        },
        {
          labelKey: 'MY_SHIFTS.MY_SHIFTS',
          routerLink: ['/my-shifts'],
          routeId: RouteIdsEnum.WORK_SHIFT_TEMP,
        },
      ],
    },
    {
      labelKey: 'MENU.SETTINGS',
      iconUrl: 'assets/icons/menu-icons/settings.svg',
      children: [
        {
          labelKey: 'MENU.PERMISSIONS_SETTINGS',
          routerLink: ['/permission-reasons'],
          routeId: RouteIdsEnum.PERMISSION_REASONS,
        },
        {
          labelKey: 'MENU.NOTIFICATIONS',
          routerLink: ['/notifications'],
          routeId: RouteIdsEnum.NOTIFICATIONS,
        },
        {
          labelKey: 'MENU.GENERAL_SETTINGS',
          routerLink: ['/general-settings'],
          routeId: RouteIdsEnum.GENERAL_SETTINGS,
        },
        {
          labelKey: 'MENU.NATIONALITIES',
          routerLink: ['/nationalities'],
          routeId: RouteIdsEnum.NATIONALITIES,
        },
        {
          labelKey: 'MENU.CITIES',
          routerLink: ['/cities'],
          routeId: RouteIdsEnum.CITIES,
        },
        {
          labelKey: 'MENU.REGIONS',
          routerLink: ['/regions'],
          routeId: RouteIdsEnum.REGIONS,
        },
        {
          labelKey: 'MENU.ACCESS_LOCATIONS',
          routerLink: ['/devices-location'],
          routeId: RouteIdsEnum.ACCESS_LOCATIONS,
        },
        {
          labelKey: 'MENU.DEVICES_CONFIGURATION',
          routerLink: ['/devices-configuration'],
          routeId: RouteIdsEnum.DEVICES_CONFIGURATION,
        },
      ],
    },
  ];

  getSidebarLinks(): Observable<MenuItem[]> {
    const userRoles = this.authService.getUser().value?.roles;
    const allRoutes = this.flattenRouterConfig(this.router.config);
    const labelKeys = this.extractLabelKeys(this.rawMenuConfig);

    return this.translateService.get(labelKeys).pipe(
      map((translations) => {
        const translatedMenuItems = this.buildMenuItemsWithTranslations(
          this.rawMenuConfig,
          translations
        );
        return this.filterMenuItems(translatedMenuItems, allRoutes, userRoles);
      })
    );
  }

  private flattenRouterConfig(routes: Route[]): Route[] {
    let flatRoutes: Route[] = [];

    for (const route of routes) {
      flatRoutes.push(route);
      if (route.children) {
        flatRoutes = flatRoutes.concat(this.flattenRouterConfig(route.children));
      }
    }

    return flatRoutes;
  }

  private extractLabelKeys(items: MenuItemConfig[] = []): string[] {
    const keys: string[] = [];

    for (const item of items) {
      keys.push(item.labelKey);
      if (item.children) {
        keys.push(...this.extractLabelKeys(item.children));
      }
    }

    return keys;
  }

  private buildMenuItemsWithTranslations(
    items: MenuItemConfig[],
    translations: Record<string, string>
  ): MenuItem[] {
    return items.map((item): MenuItem => {
      const menuItem: MenuItem = {
        label: translations[item.labelKey] || item.labelKey,
        routeId: item.routeId,
        routerLink: item.routerLink,
        iconUrl: item.iconUrl,
      };

      if (item.children) {
        menuItem.children = this.buildMenuItemsWithTranslations(item.children, translations);
      }

      return menuItem;
    });
  }

  private filterMenuItems(
    menuItems: MenuItem[],
    allRoutes: Route[],
    userRoles?: string[]
  ): MenuItem[] {
    const filtered: MenuItem[] = [];

    for (const item of menuItems) {
      if (item.routeId && !item.children) {
        const matchedRoute = allRoutes.find((r) => r.data?.['routeId'] === item.routeId);
        const allowedRoles = matchedRoute?.data?.['roles'] as string[] | undefined;

        const isAllowed = !allowedRoles || allowedRoles.some((role) => userRoles?.includes(role));
        if (isAllowed) {
          filtered.push(item);
        }
      } else if (!item.routeId && !item.children) {
        filtered.push(item); // public
      }

      if (item.children) {
        const allowedChildren = this.filterMenuItems(item.children, allRoutes, userRoles);
        if (allowedChildren.length > 0) {
          filtered.push({ ...item, children: allowedChildren });
        }
      }
    }

    return filtered;
  }
}
