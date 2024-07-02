import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { routeurls } from '../routeurls/routeurls';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(public http: HttpClient, private jwtHelper: JwtHelperService) { }

  submit(form: any) : Observable<any>  {
    let credentials = form;//JSON.stringify(form.value);
    return this.http.post(routeurls.BASE_API_URL +  routeurls.LOGIN_API_BASE_URL, credentials);
  }
  getUserLogStatus() {
    const token = localStorage.getItem('jwt');
    if(token !=null){
      console.log('get user logged in -----------');
      //console.log(this.jwtHelper.getTokenExpirationDate(token));
      //console.log(this.jwtHelper.decodeToken(token).role);
      //console.log(this.jwtHelper.decodeToken(token));

      return !this.jwtHelper.isTokenExpired(token);
    }
    else return false;
  }
  getToken() {
    return localStorage.getItem("jwt");
  }
  getUser(){
    let token = localStorage.getItem("jwt");
    return (this.jwtHelper.decodeToken(token)["user"]);
  }
  getrole() {
    let token = localStorage.getItem("jwt");
    return (this.jwtHelper.decodeToken(token)["role"]);
  }
  getrolefromtoken(token){
    return (this.jwtHelper.decodeToken(token)["role"]);
  }
  logout(){
    localStorage.removeItem('jwt');
  }
}
