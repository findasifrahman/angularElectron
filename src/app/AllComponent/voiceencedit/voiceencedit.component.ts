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
  selector: 'app-voiceencedit',
  templateUrl: './voiceencedit.component.html',
  styleUrls: ['./voiceencedit.component.scss']
})
export class VoiceenceditComponent implements OnInit {
  id = 1;
  Forms: FormGroup;
  voice_enc_key_update_success 
  get_curr_chan
  private ipc: IpcRenderer;
  old_voice_enc_key
  set_channel_id
  isit_7_8 = false
  constructor(private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,
    private models:encmodels,private route: ActivatedRoute, zone:NgZone) { 
      this.voice_enc_key_update_success = (event, data) => {
        zone.run(()=>{
          this.snackBar.open('Data updated successfully', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
          if( this.isit_7_8){
            this.ipc.send("set-only-encryption",true)
          }
          this.Forms.reset()
          //this._router.navigate(['/']);
        })
      }
      this.get_curr_chan = (event, data)=>{
        zone.run(()=>{
          this.old_voice_enc_key = data.voice_enc_key
          console.log("voice enc key is--", data.voice_enc_key)
          this.set_channel_id = data.msg.channel_id          
          //this.set_channel_freq = this.freqtable.find(x=> x.channel_id == parseInt(this.set_channel_id)).frequency


            if(this.set_channel_id == 7 || this.set_channel_id == 8){
             this.isit_7_8 = true
              
            }
              
           


        })
       
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('voice_enc_key_update_success', this.voice_enc_key_update_success)
          this.ipc.on('get_curr_chan',this.get_curr_chan)
        } catch (error) {
          console.log(error);
        }
      }
    }


  ngOnInit(): void {
    this.Forms = this.models.modelForms;
    /*this.service.getbyid(this.id).subscribe((data) => {
      this.Forms.patchValue(data);
    })*/
    /*this.route.params.subscribe(params => {
      //this.id = params['id'];
      this.service.getbyid(1).subscribe((data) => {
        this.Forms.patchValue(data);
      })
    })*/
    this.ipc.send('send_curr_chan',"true");
  }
  ngOnDestroy(){
    this.ipc.removeListener('get_curr_chan',this.get_curr_chan)
    this.ipc.removeListener('voice_enc_key_update_success',this.voice_enc_key_update_success)
  }
  async FormSubmit() {
    const formValue = this.Forms.value;
    let keyval = this.Forms.controls['key'].value
    //console.log(formValue);
    if(keyval.length != 8){
      this.snackBar.open('Wrong key length. Key length must be 8 digits', "Remove", {
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
      this.ipc.send("update-voice-enc",{id:this.id,key:keyval})
      //console.log("final enc key add val-",keyval)
    }
    

  }



}
