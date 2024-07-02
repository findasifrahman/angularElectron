import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IpcRenderer } from 'electron';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private ipc: IpcRenderer;

  my_id;// = "0001"
  my_dev_name
  aes_enc_key
  connectString
  rcvrlist

  rcv_my_id_enc_data_shipl 

  usergrouplist = []
  send_to_arr = []
  constructor(zone:NgZone,private snackBar: MatSnackBar,
    public dialog: MatDialog, private router: Router )  {
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
          console.log("my id,enc,data,ship list rcvd--",data.msg)
          //data.msg = JSON.parse(data.parse)
          this.my_id = data.msg.my_id_obj.uid
          this.my_dev_name = data.msg.my_id_obj.ship
          this.connectString = data.msg.my_id_obj.connectionstate
          this.aes_enc_key = data.msg.enc_key
          /*this.rcvrlist = data.msg.shipl
          this.rcvrlist  = this.rcvrlist.map(x=> ({...x,
            status:'Offline',state: false,isactive: false}))*/

             
          this.rcvrlist = data.msg.shipl
          this.rcvrlist  = this.rcvrlist.map(x=> ({...x,
            status:'Offline',state: false}))
          this.usergrouplist = data.msg.usergroup
          //console.log("this.usergrouplist-",this.usergrouplist)
          
          this.send_to_arr = []//this.usergrouplist

          for(const x of this.rcvrlist){
            this.send_to_arr.push({user: x.ship,uid: x.uid, members: null,membar_id: null,no_of_membar: 1})
            
          }
           ///////////////////////
        
        })
      }


      ///////////////////////
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          //console.log("ipc startt")

          this.ipc.on('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
        
        }catch (error) {
          
          console.log(error);
        }  
      }
      ///////////////////////
    }

  ngOnDestroy(){
    this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    
  }
  ngOnInit(): void {
  }
  gotochat(){
    this.router.navigate(['/chat'])
  }
  gotomap(){
    this.router.navigate(['/map'])
  }
  gotovoiceset(){
    this.router.navigate(['/voiceset'])
  }
  gotodataset(){
    this.router.navigate(['/dataset'])
  }
  long_message(){
    this.router.navigate(['/longmessage'])
  }
}
