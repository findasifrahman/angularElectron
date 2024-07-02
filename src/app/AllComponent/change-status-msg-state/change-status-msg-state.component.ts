
import { Component,NgZone, OnInit,CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MyidService } from '../my-id/myid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { encmodels } from '../../models/encmodels';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-change-status-msg-state',
  templateUrl: './change-status-msg-state.component.html',
  styleUrls: ['./change-status-msg-state.component.scss']
})
export class ChangeStatusMsgStateComponent implements OnInit {
  id
  Forms: FormGroup;
  private ipc: IpcRenderer;
  state = true

  return_status_msg_set
  status_msg_set_update_success
  constructor(private router: Router,private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,
    private models:encmodels,private route: ActivatedRoute, zone:NgZone) { 
      this.return_status_msg_set = (event, data) => {
        zone.run(()=>{
          
          this.id = data.msg[0].id
          console.log("user set val is --", data.msg, this.id)
          if(data.msg[0].state == "1"){
            this.state = true
          }else{
            this.state = false
          }
        })
      }
      this.status_msg_set_update_success = (event, data) => {
        zone.run(()=>{
          if(data.msg){
              this.snackBar.open('Data updated successfully', "Remove", {
                duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
              });
              //this._router.navigate(['/']);
          }
        })
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('return_status_msg_set', this.return_status_msg_set)
       
          this.ipc.on('status_msg_set_update_success', this.status_msg_set_update_success)
        } catch (error) {
          console.log(error);
        }
      }
  }
  ngOnDestroy(){

    this.ipc.removeListener('status_msg_set_update_success', this.status_msg_set_update_success)
    this.ipc.removeListener('return_status_msg_set',this.return_status_msg_set)
    
  }
  ngOnInit(): void {
    this.ipc.send("get-current_status_msg_set_obj",true)
  }
  editstatusmsgset(){
    if(this.state){
      this.ipc.send("edit_status_msg_state",{state: 1,id: this.id})
    }else{
      this.ipc.send("edit_status_msg_state",{state: 0,id: this.id})
    }
  }
  onNoClick(){
    this.router.navigate(['/'])
  }

}
