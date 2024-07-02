import { Component, OnInit,ViewChild,Inject, NgZone } from '@angular/core';
import { GroupService } from '../add-group/group.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-list-group',
  templateUrl: './list-group.component.html',
  styleUrls: ['./list-group.component.scss']
})
export class ListGroupComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['gr_name','gr_number','members', 'buttons'];
  displayedColumnsName: string[] = ['gr_name','gr_number','members', 'buttons'];
  AllElement: MatTableDataSource<any>;

  rcv_my_id_enc_data_shipl 
  rcvrlist = []
  my_id
  rcvr_arr = []
  private ipc: IpcRenderer
  constructor(private snackBar: MatSnackBar, 
    private groupService : GroupService, public dialog: MatDialog,
    public _router: Router,zone:NgZone) {
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
          this.my_id = data.msg.my_id_obj.uid
          this.rcvrlist = data.msg.shipl
          this.rcvrlist.push({id:0,uid: data.msg.my_id_obj.uid, ship:data.msg.my_id_obj.ship,uname: null})
          console.log("rcvr list is --", this.rcvrlist)
          this.rcvrlist.map(mv=>{
            this.rcvr_arr.push(mv)
          })
          /////////////////////////
          let temp_val = []
          this.groupService.getAll().subscribe((posts) => {
            let temp_arr = posts.map((mapval,mvindex)=>{
              mapval.gr_number = mapval.gr_number.substr("1")
              if(mapval.members){
                let member_arr = mapval.members.split(",")
                let textt = ""
                console.log("member_arr", member_arr)
                member_arr.map((mv,index)=>{
                  let rr = this.rcvrlist.find(x=> x.uid == mv)
                  if(rr){
                    textt = textt + rr.ship + ","
                  }
                  if(index == member_arr.length - 1){
                    mapval.members = textt.substr(0,textt.length - 1)
                    temp_val.push(mapval)
                    if(mvindex == posts.length - 1){
                      this.AllElement = new MatTableDataSource(temp_val as any);
                      this.AllElement.paginator = this.paginator;
                
                      /*this.AllElement.filterPredicate = (data, filter: string) => {
                        if(this.searchIn == 1){
                         return !filter || data.date.includes(filter);
                        }else if(this.searchIn == 2){
                          return !filter || data.title.includes(filter);
                        }else {
                          return !filter || data.category.includes(filter);
                        }
                      }*/
                    }
                    return mapval
                  }
                })
                //console.log("member_arr", member_arr)
              }
              //return mapval
            })
            //posts["date"] = moment(posts['date']).format("YYYY-MM-DD")

      
           /* this.AllElement.filterPredicate = (data, filter: string) => 
            !filter || data.category.includes(filter);*/
            //setTimeout(() => this.AllElement.paginator = this.paginator);
            //console.log(posts);
          });
          ////////////////////////////
        })
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
        }  catch (error) {
          console.log(error);
        }
        this.ipc.on('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)

      }
    }

    ngOnDestroy(){
      this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    }
  ngOnInit(): void {
    this.ipc.send('send_my_id_enc_data_shipl',true);
  }
  searchIn = 0
  public doFilter = (value: string) => {
    this.searchIn = 2
    this.AllElement.filter = value.trim().toLocaleLowerCase();
  }
  public doFilterdate = (value: string) => {
    console.log("value-",value)
    this.searchIn = 1
    this.AllElement.filter = value.trim()
  }
  public doFiltercategory = (value: string) => {
    this.searchIn = 0
    this.AllElement.filter = value.trim()
  }

  ngAfterViewInit(): void {

  }
  onUpdate(id) {
    this._router.navigate(['/admin/editgroup', id]);
  }
  onDelete(id) {
    console.log("Inside Delete--" + id);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, you want to delete this data?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupService.delete(id).subscribe((posts) => {
          this.AllElement = new MatTableDataSource(posts as any);
          this.AllElement.paginator = this.paginator;
          console.log(posts);

          this.snackBar.open('Data deleted successfully', "Remove", {
            duration: 6000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar']
          });
        },
          error => {
            this.snackBar.open('Unsuccessfull', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['red-snackbar']
            });
          }
        )
      }//if end
    })//dialog ref
  }//Delete end

}
