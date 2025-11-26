import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/services/auth/auth.service';
import { SideBarLinksService } from '@/services/shared/side-bar-links.service';
import { MenuItem } from '@/models/shared/menu-item';
import { LanguageService } from '@/services/shared/language.service';
import { combineLatest, Subscription, switchMap, filter } from 'rxjs';
import { SharedService } from '@/services/shared/shared.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [SidebarModule, PanelMenuModule, RouterModule, CommonModule, TranslatePipe],
  templateUrl: './side-menu.component.html',
})
export class SideMenuComponent implements OnInit {
  @ViewChild('sidebarContainer', { static: true }) sidebarContainer!: ElementRef;
  sidebarVisible = false;
  isMobile = false;
  openedSubmenus = new Set<MenuItem>();
  activeMenuItem: MenuItem | null = null;
  authService = inject(AuthService);
  sidebarLinksService = inject(SideBarLinksService);
  menuItems: MenuItem[] = [];
  languageService = inject(LanguageService);
  sharedService = inject(SharedService);
  router = inject(Router);
  private subscription = new Subscription();
  private resizeListener = () => this.checkScreenSize();

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.sidebarVisible = true;
      }
    });

    if (!this.isMobile) {
      this.sidebarVisible = true;
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);

    this.subscription.add(
      combineLatest([this.authService.getUser(), this.languageService.languageChanged$])
        .pipe(switchMap(() => this.sidebarLinksService.getSidebarLinks()))
        .subscribe((menu) => {
          this.menuItems = menu;
          this.setActiveMenuItemFromRoute();
        })
    );

    this.sharedService.sideMenuToggle$.subscribe(() => {
      this.toggleSidebar();
    });

    // Listen to route changes to update active menu item
    this.subscription.add(
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
        this.setActiveMenuItemFromRoute();
      })
    );
  }

  toggleSubmenu(item: MenuItem) {
    if (this.openedSubmenus.has(item)) {
      this.openedSubmenus.delete(item);
    } else {
      this.openedSubmenus.add(item);
    }
  }

  isSubmenuOpen(item: MenuItem): boolean {
    return this.openedSubmenus.has(item);
  }

  setActiveMenuItem(item: MenuItem) {
    this.activeMenuItem = item;
  }

  isActive(item: MenuItem): boolean {
    return this.activeMenuItem === item;
  }

  setActiveMenuItemFromRoute() {
    const currentPath = this.normalizeUrl(this.router.url);
    for (const item of this.menuItems) {
      const itemUrl = this.getItemUrl(item);
      if (itemUrl && itemUrl === currentPath) {
        this.activeMenuItem = item;
        return;
      }
      if (item.children) {
        for (const child of item.children) {
          const childUrl = this.getItemUrl(child);
          if (childUrl && childUrl === currentPath) {
            this.activeMenuItem = child;
            this.openedSubmenus.add(item); // Auto-open parent menu
            return;
          }
        }
      }
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar() {
    this.sidebarVisible = false;
  }

  logout() {
    this.authService.logout().subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    window.removeEventListener('resize', this.resizeListener);
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 767;
    this.sidebarVisible = !this.isMobile;
  }

  private normalizeUrl(url: string): string {
    // Remove query and fragment, and trailing slash (except root)
    const noQuery = url.split('#')[0].split('?')[0];
    if (noQuery.length > 1 && noQuery.endsWith('/')) {
      return noQuery.slice(0, -1);
    }
    return noQuery;
  }

  private getItemUrl(item: MenuItem): string | null {
    if (!item || !item.routerLink) return null;
    // routerLink can be string | string[]; Router will serialize consistently
    const link = Array.isArray(item.routerLink)
      ? item.routerLink
      : [item.routerLink as unknown as string];
    const serialized = this.router.serializeUrl(this.router.createUrlTree(link));
    return this.normalizeUrl(serialized);
  }
}
