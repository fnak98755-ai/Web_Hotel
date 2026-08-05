import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const permGuard = (...requiredPerms: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.parseUrl('/login');
    }

    if (auth.hasPerm(...requiredPerms)) {
      return true;
    }

    return router.parseUrl('/');
  };
};
