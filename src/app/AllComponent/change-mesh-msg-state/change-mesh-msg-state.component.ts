
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
  selector: 'app-change-mesh-msg-state',
  templateUrl: './change-mesh-msg-state.component.html',
  styleUrls: ['./change-mesh-msg-state.component.scss']
})
export class ChangeMeshMsgStateComponent implements OnInit {
  id
  Forms: FormGroup;
  private ipc: IpcRenderer;
  state = true

  return_mesh_msg_set
  mesh_state_set_update_success
  constructor(private router: Router,private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,
    private models:encmodels,private route: ActivatedRoute, zone:NgZone) { 
      this.return_mesh_msg_set = (event, data) => {
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
      this.mesh_state_set_update_success = (event, data) => {
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
          this.ipc.on('return_mesh_msg_set', this.return_mesh_msg_set)
       
          this.ipc.on('mesh_state_set_update_success', this.mesh_state_set_update_success)
        } catch (error) {
          console.log(error);
        }
      }
  }
  ngOnDestroy(){

    this.ipc.removeListener('mesh_state_set_update_success', this.mesh_state_set_update_success)
    this.ipc.removeListener('return_mesh_msg_set',this.return_mesh_msg_set)
    
  }
  ngOnInit(): void {
    this.ipc.send("get-current_mesh_msg_set_obj",true)
  }
  editmeshset(){
    if(this.state){
      this.ipc.send("edit_mesh_msg",{state: 1,id: this.id})
    }else{
      this.ipc.send("edit_mesh_msg",{state: 0,id: this.id})
    }
  }
  onNoClick(){
    this.router.navigate(['/'])
  }

}
