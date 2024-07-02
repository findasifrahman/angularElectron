
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
  selector: 'app-bncg-encrypt',
  templateUrl: './bncg-encrypt.component.html',
  styleUrls: ['./bncg-encrypt.component.scss']
})
export class BncgEncryptComponent implements OnInit {
  id = 1;
  Forms: FormGroup;
  bncg_enc_key_update_success 
  private ipc: IpcRenderer;
  constructor(private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,
    private models:encmodels,private route: ActivatedRoute, zone:NgZone) { 
      this.bncg_enc_key_update_success = (event, data) => {
        zone.run(()=>{
          this.snackBar.open('Data updated successfully', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
          this.Forms.reset()
          //this._router.navigate(['/']);
        })
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('bncg_enc_key_update_success', this.bncg_enc_key_update_success)
        } catch (error) {
          console.log(error);
        }
      }
    }


  ngOnInit(): void {
    this.Forms = this.models.modelForms;
    this.service.getbyid(this.id).subscribe((data) => {
      this.Forms.patchValue(data);
    })
    /*this.route.params.subscribe(params => {
      //this.id = params['id'];
      this.service.getbyid(1).subscribe((data) => {
        this.Forms.patchValue(data);
      })
    })*/
  }
  ngOnDestroy(){
    this.ipc.removeListener('bncg_enc_key_update_success',this.bncg_enc_key_update_success)
  }
  async FormSubmit() {
    const formValue = this.Forms.value;
    let keyval = this.Forms.controls['key'].value
    //console.log(formValue);
    if(keyval.length != 16){
      this.snackBar.open('Wrong key length. Key length must be 16', "Remove", {
        duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
      });
      return
    }else{
     /*let add =  keyval.charCodeAt(0) + keyval.charCodeAt(1) + keyval.charCodeAt(2)
      + keyval.charCodeAt(3) + keyval.charCodeAt(4) + keyval.charCodeAt(5)
      + keyval.charCodeAt(6) + keyval.charCodeAt(7) 
      add = add.toString(16)
      while(add.length != 4){
        add = "0" + add
      }*/
      this.ipc.send("update-bncg-enc",{id:this.id,key:keyval})

    }
    

  }


}
