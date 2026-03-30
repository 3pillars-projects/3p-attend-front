import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '@/services/auth/auth.service';
import { AlertService } from '@/services/shared/alert.service';
import { of } from 'rxjs';
import { COOKIE_ENUM } from '@/enums/cookie-enum';
import { CookieService } from '@/services/shared/cookie.service';

export const authGuard: any = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const alertService = inject(AlertService);
  const cookieService = inject(CookieService);

  const expectedRoles = route.data?.['roles'] as string[] | undefined;
  const userDataCookie = cookieService.getCookie(COOKIE_ENUM.USER_DATA);

  // 🚫 Cookie missing? Consider session expired → force logout
  if (!userDataCookie) {
    authService.setUser(undefined); // 🔁 You must implement this in AuthService
    alertService.showErrorMessage({ messages: ['COMMON.NOT_AUTHENTICATED'] });
    return of(router.createUrlTree(['/auth/login']));
  }

  /** Function to check if user has required roles */
  const checkRoles = (user: any) => {
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }
    const userHasRole = user.roles.some((role: string) => expectedRoles.includes(role));
    if (!userHasRole) {
      return router.createUrlTree(['/403']);
    }
    return true;
  };

  return authService.getUser().pipe(
    switchMap((user) => {
      if (!user) {
        alertService.showErrorMessage({ messages: ['COMMON.NOT_AUTHORIZED'] });
        return of(router.createUrlTree(['/login']));
      }
      // User exists, so refresh token
      return authService.refreshToken().pipe(
        switchMap(() => authService.getUser()),
        map((loggedInUser) => {
          if (!loggedInUser) {
            alertService.showErrorMessage({ messages: ['COMMON.NOT_AUTHORIZED'] });
            return router.createUrlTree(['/login']);
          }
          return checkRoles(loggedInUser);
        })
      );
    })
  );
};
