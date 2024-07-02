import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../AllComponent/login/login.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {
  constructor(private lservice:LoginService,private router:Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if(!this.lservice.getUserLogStatus()){
        this.router.navigate(['']);
        return false;
      }
      return true;
      //return this.lservice.getUserLogStatus();
  }
}
