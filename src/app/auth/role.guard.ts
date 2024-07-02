import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../AllComponent/login/login.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(public lService: LoginService, public router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot): boolean {
    var pageRole = route.data["expectedRole"] as Array<string>
    var rolename = this.lService.getrole();
    var loginstatus = this.lService.getUserLogStatus();
    if(!loginstatus){
      this.router.navigate(['']);
      return false;
    }
    var findr = pageRole.find(x=> x == rolename)
    if(findr){
      return true;
    }
    this.router.navigate(['']);
    return false;
  }
}
