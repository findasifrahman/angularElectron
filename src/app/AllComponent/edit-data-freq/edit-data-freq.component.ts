import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { datafreqmodels } from '../../models/datafreqmodels';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-edit-data-freq',
  templateUrl: './edit-data-freq.component.html',
  styleUrls: ['./edit-data-freq.component.scss']
})
export class EditDataFreqComponent implements OnInit {
  id ;
  all
  Forms: FormGroup;
  private ipc: IpcRenderer;

  update_success_data_freq_custom
  get_data_chan_freq
  //cheque_freq_result
  constructor(private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, 
    private formBuilder: FormBuilder, private _router: Router, zone:NgZone,private spinner: NgxSpinnerService,
    private models: datafreqmodels,private route: ActivatedRoute) {
      this.get_data_chan_freq = (event,data)=>{
        zone.run(() =>{
          console.log("rcvd data freq of channel for edit-- ",data.msg)
          this.Forms.patchValue(data.msg);
        })
      }
      this.update_success_data_freq_custom = (event,data)=>{
        zone.run(() =>{
          if(data.msg){
            this.snackBar.open('Frequency updated successfully, please restart', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
            this._router.navigate(['/admin/alldatafreq']);
          }else{
            this.snackBar.open('Failed to update frequency', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
          }
        })
      }
      /////
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('get_data_chan_freq',this.get_data_chan_freq)
          this.ipc.on('update_success_data_freq_custom',this.update_success_data_freq_custom)
          //this.ipc.on('cheque_freq_result', this.cheque_freq_result)
        } catch (error) {
          console.log(error);
        }
      }
  }

  ngOnInit(): void {
    this.Forms = this.models.modelForms;
   /* this.service.getbyid(this.id).subscribe((data) => {
      this.Forms.patchValue(data);
    })*/
    this.route.params.subscribe(params => {

      this.id = params['id'];
      this.all = params['all'];
      console.log("all aparama is--", this.all, this.id)
      this.ipc.send("read_data_chan_freq",this.id)
      /*this.service.getbyid(this.id).subscribe((data) => {
        this.Forms.patchValue(data);
      })*/
    })
  }
  ngOnDestroy(){
    console.log("inside ng on destroy")
    this.ipc.removeListener('get_data_chan_freq', this.get_data_chan_freq)
    this.ipc.removeListener('update_success_data_freq_custom', this.update_success_data_freq_custom)
    //this.ipc.removeListener('cheque_freq_result', this.cheque_freq_result)
  }
  async FormSubmit() {
    const formValue = this.Forms.value;
    let freq_val = this.Forms.controls['frequency'].value
    if(freq_val){
      if(freq_val.length != 9 ){
        this.snackBar.open('Enter 9 digits frequency', "Remove", {
          duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
        });
        return;
      }
      //console.log("startswith--",freq_val.startsWith("432"), freq_val )

      if(freq_val.match(/^[0-9]+$/) == null ){
        this.snackBar.open('Enter valid frequency (Only number)', "Remove", {
          duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
        });
        return;
      }
      if(freq_val.startsWith("427") || freq_val.startsWith("428")  || freq_val.startsWith("429"))
      {
        this.ipc.send("chenge_data_freq",formValue)
      }
      else{
        this.snackBar.open('Valid Frequency bands are 427,428,429', "Remove", {
          duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
        });
        return;
      }

    }
  }

}
