import { Injectable } from '@angular/core';
import { HttpClient,HttpParams,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { routeurls } from '../routeurls/routeurls';
@Injectable({
  providedIn: 'root'
})
export class AddShipService {

  constructor(private http:HttpClient) { }
  Add(formval : any): Observable<any>{
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'});
      let options = { headers: headers };
    //let header = headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    return this.http.post(routeurls.BASE_API_URL + routeurls.ALL_USER_API,formval,options)
  }
  getbyid(id: any): Observable<any> {
    return this.http.get<any>(routeurls.BASE_API_URL + routeurls.ALL_USER_API + "/getbyid", { params: new HttpParams().set('id', id) });
  }
  update(id: any, obj: any): Observable<any> {
    obj.Id = id;
    console.log(obj);
    return this.http.put<any>(routeurls.BASE_API_URL + routeurls.ALL_USER_API , obj);
  }
  getAll(): Observable<any> {
    return this.http.get<any>(routeurls.BASE_API_URL + routeurls.ALL_USER_API);//.pipe(map(response => response as productmodels));//.subscribe(result => {console.log(result);});
  }
  delete(id: any): Observable<any> {
    return this.http.delete<any>(routeurls.BASE_API_URL + routeurls.ALL_USER_API, { params: new HttpParams().set('id', id) });
  }
}
