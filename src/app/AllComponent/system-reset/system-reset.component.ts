
import { Component,NgZone, OnInit,CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MyidService } from '../my-id/myid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { encmodels } from '../../models/encmodels';
import { IpcRenderer } from 'electron';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-system-reset',
  templateUrl: './system-reset.component.html',
  styleUrls: ['./system-reset.component.scss']
})
export class SystemResetComponent implements OnInit {
  id = 1;
  Forms: FormGroup;
  system_reset_success
  private ipc: IpcRenderer;
  constructor(private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,public dialog: MatDialog,
    private models:encmodels,private route: ActivatedRoute, zone:NgZone) { 
      this.system_reset_success = (event, data) => {
        zone.run(()=>{
          this.snackBar.open('system reset successfull', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
          this.Forms.reset()
          //this._router.navigate(['/']);
        })
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('system_reset_success', this.system_reset_success)
        } catch (error) {
          console.log(error);
        }
      }
    }


  ngOnInit(): void {

    /*this.route.params.subscribe(params => {
      //this.id = params['id'];
      this.service.getbyid(1).subscribe((data) => {
        this.Forms.patchValue(data);
      })
    })*/
  }
  ngOnDestroy(){
    this.ipc.removeListener('system_reset_success',this.system_reset_success)
  }
  async FormSubmit() {

     /*let add =  keyval.charCodeAt(0) + keyval.charCodeAt(1) + keyval.charCodeAt(2)
      + keyval.charCodeAt(3) + keyval.charCodeAt(4) + keyval.charCodeAt(5)
      + keyval.charCodeAt(6) + keyval.charCodeAt(7) 
      add = add.toString(16)
      while(add.length != 4){
        add = "0" + add
      }*/
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '450px',
        hasBackdrop: true,
        data: "This will reset whole system. This action is irreversible. Are you Certain?"
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result){
           this.ipc.send("send_system_reset",true)
        }
      })
    
    

  }

}
