
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
  selector: 'app-edit-user-set',
  templateUrl: './edit-user-set.component.html',
  styleUrls: ['./edit-user-set.component.scss']
})
export class EditUserSetComponent implements OnInit {
  id
  Forms: FormGroup;
  private ipc: IpcRenderer;
  isgps = true

  return_user_set_obj
  user_set_update_success
  constructor(private router: Router,private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,
    private models:encmodels,private route: ActivatedRoute, zone:NgZone) { 
      this.return_user_set_obj = (event, data) => {
        zone.run(()=>{
          console.log("user set val is --", data.msg)
          this.id = data.msg.id
          if(data.msg.isgps == "1"){
            this.isgps = true
          }else{
            this.isgps = false
          }
        })
      }
      this.user_set_update_success = (event, data) => {
        zone.run(()=>{
          this.snackBar.open('Data updated successfully', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
          this._router.navigate(['/']);
        })
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('return_user_set_obj', this.return_user_set_obj)
       
          this.ipc.on('user_set_update_success', this.user_set_update_success)
        } catch (error) {
          console.log(error);
        }
      }
  }
  ngOnDestroy(){

    this.ipc.removeListener('user_set_update_success', this.user_set_update_success)
    this.ipc.removeListener('return_user_set_obj',this.return_user_set_obj)
    
  }
  ngOnInit(): void {
    this.ipc.send("get-current_user_set_obj",true)
  }
  edituseerset(){
    if(this.isgps){
      this.ipc.send("edit-user-set",{isgps: 1,id: this.id})
    }else{
      this.ipc.send("edit-user-set",{isgps: 0,id: this.id})
    }
  }
  onNoClick(){
    this.router.navigate(['/'])
  }

}
