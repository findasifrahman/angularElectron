import { Component, OnInit,Input, SimpleChange, ViewChildren, QueryList } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { MatTable, MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-tablefor-admin',
  templateUrl: './tablefor-admin.component.html',
  styleUrls: ['./tablefor-admin.component.scss']
})
export class TableforAdminComponent implements OnInit {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  mydeviceList :MatTableDataSource<any>
  @Input() deviceList //:MatTableDataSource<any>
  @Input() mypaginator =  new QueryList<MatPaginator>();
  @Input() displayedColumns/*: string[] = ['uid','userId','username','activateDate','deviceName','simNo','expireDate','monthFee', 
  'address', 'backup_day','device_model','package_type'];*/
  public doFilter = (value: string) => {
   this.deviceList.filter = value.trim().toLocaleLowerCase() 
  }
  ngOnInit(){
    //this.deviceList = new MatTableDataSource( to as any);
    //this.deviceList.paginator = this.mypaginator.toArray()[0]
  }
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (const propName in changes) {
      const changedProp = changes[propName];
      const to = changedProp.currentValue;
      console.log("CHANGEDpROP--", propName, to);

      if(propName.includes("deviceList")){
        this.mydeviceList = to//new MatTableDataSource( to as any);
       this.mydeviceList.paginator = this.paginator.toArray()[0]
          console.log("travelReportClicked---")
          
      }if(propName.includes("mypaginator")){
        this.paginator = to
       // this.mydeviceList.paginator = to//to.paginator.toArray()[0]//this.paginator.toArray()[0];
      }
      
    }
  }
  constructor() { }



}
