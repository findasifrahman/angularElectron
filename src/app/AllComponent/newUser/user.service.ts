import { Injectable } from '@angular/core';
import { HttpClient,HttpParams,HttpHeaders } from '@angular/common/http';
import { routeurls } from '../routeurls/routeurls';
import { Observable,of } from 'rxjs';
import { map,catchError,retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http:HttpClient) { }
  getAllRoles(): Observable<any>{
    return this.http.get<any>(routeurls.BASE_API_URL + '/api/roles').pipe(
      retry(3),
      map(res => {
        console.log(res);
        if (!res) {
          throw new Error('Value expected!');
        }
        console.log(res);
        return res;
      }),
      catchError(err => of([]))
    );
  }
  Add(formval : any): Observable<any>{
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'});
      let options = { headers: headers };
    //let header = headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    return this.http.post(routeurls.BASE_API_URL + routeurls.USER_ADD_URL,formval,options)
  }
  getAll(): Observable<any> {
    return this.http.get<any>(routeurls.BASE_API_URL + routeurls.USER_ADD_URL).pipe(
      retry(3),
      map(res => {
        console.log(res);
        if (!res) {
          throw new Error('Value expected!');
        }
        console.log(res);
        return res;
      }),
      catchError(err => of([]))
    );//.pipe(map(response => response as productmodels));//.subscribe(result => {console.log(result);});
  }

  /*getbygroup(gr:any): Observable<any> {
    console.log(gr.toString());
    return this.http.get<any>(routeurls.BASE_API_URL + routeurls.DEVICE_API_BASE_URL + "/getbygroup", { params: new HttpParams().set('group', gr.toString()) })
    .pipe(
      retry(3),
      map(res => {
        console.log(res);
        if (!res) {
          throw new Error('Value expected!');
        }
        console.log(res);
        return res;
      }),
      catchError(err => of([]))
    );//.pipe(map(response => response as productmodels));//.subscribe(result => {console.log(result);});
  }*/
  getbyid(id: any): Observable<any> {
    return this.http.get<any>(routeurls.BASE_API_URL + routeurls.USER_ADD_URL + "/getbyid", { params: new HttpParams().set('id', id) })
    .pipe(
      retry(3),
      map(res => {
        console.log(res);
        if (!res) {
          throw new Error('Value expected!');
        }
        console.log(res);
        return res;
      }),
      catchError(err => of([]))
    );
  }

  update(id: any, obj: any): Observable<any> {
    obj.Id = id;
    console.log(obj);
    return this.http.put<any>(routeurls.BASE_API_URL + routeurls.USER_ADD_URL , obj)
    .pipe(
      retry(3),
      map(res => {
        console.log(res);
        if (!res) {
          throw new Error('Value expected!');
        }
        console.log(res);
        return res;
      }),
      catchError(err => of([]))
    );
  }
  delete(id: any): Observable<any> {
    return this.http.delete<any>(routeurls.BASE_API_URL + routeurls.USER_ADD_URL , { params: new HttpParams().set('id', id) });
  }
}
