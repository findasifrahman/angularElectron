import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditFreqService } from './edit-freq.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { voicesetmodels } from '../../models/voicesetmodels';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-edit-freq',
  templateUrl: './edit-freq.component.html',
  styleUrls: ['./edit-freq.component.scss']
})
export class EditFreqComponent implements OnInit {
  id ;
  all
  Forms: FormGroup;
  private ipc: IpcRenderer;

  update_success_freq_custom
  get_chan_freq
  cheque_freq_result
  constructor(private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, 
    private service:EditFreqService,
    private formBuilder: FormBuilder, private _router: Router, zone:NgZone,private spinner: NgxSpinnerService,
    private models: voicesetmodels,private route: ActivatedRoute) {
      this.update_success_freq_custom = (event,data)=>{
        zone.run(() =>{
          if(data.msg){
            this.snackBar.open('Frequency updated successfully, please restart', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
            this._router.navigate(['/']);
          }else{
            this.snackBar.open('Failed to update frequency', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
          }
        })
      }
      this.get_chan_freq = (event,data)=>{
        zone.run(() =>{
          console.log("rcvd freq of channel for edit-- ",data.msg)
          this.Forms.patchValue(data.msg);
        })
      }
      this.cheque_freq_result = (event, data) => {
        zone.run(()=>{
          // its a valid frequency. you can save it...
          if(data.msg){
            this.spinner.hide()
          this.ipc.send("update_custom_freq",this.Forms.value)
          /*this.service.update(this.id, this.Forms.value).subscribe(() => {
            console.log("Update frequency successfull");
            this.snackBar.open('frequency Updated Successfully, PLease Restart', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
            this._router.navigate(['/']);
          },
            error => {
              console.log("error Update", error);
              this.snackBar.open('Update Unsuccessfull', "Remove", {
                duration: 6000, verticalPosition: 'top', panelClass: ['red-snackbar']
              });
            }
          );*/
        }else{
          this.spinner.hide()
          this.snackBar.open('Select a valid frequency', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
        }

          
        })
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('get_chan_freq',this.get_chan_freq)
          this.ipc.on('update_success_freq_custom',this.update_success_freq_custom)
          this.ipc.on('cheque_freq_result', this.cheque_freq_result)
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
      console.log("all aparama is--", this.all)
      this.ipc.send("read_chan_freq",this.id)
      /*this.service.getbyid(this.id).subscribe((data) => {
        this.Forms.patchValue(data);
      })*/
    })
  }
  ngOnDestroy(){
    console.log("inside ng on destroy")
    this.ipc.removeListener('get_chan_freq', this.get_chan_freq)
    this.ipc.removeListener('update_success_freq_custom', this.update_success_freq_custom)
    this.ipc.removeListener('cheque_freq_result', this.cheque_freq_result)

    
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
      console.log("startswith--",freq_val.startsWith("432"), freq_val )

      if(freq_val.match(/^[0-9]+$/) == null ){
        this.snackBar.open('Enter valid frequency of only number', "Remove", {
          duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
        });
        return;
      }

      if(!this.all){
          if(freq_val.startsWith("432") || freq_val.startsWith("431")  || freq_val.startsWith("424")
            || freq_val.startsWith("425") || freq_val.startsWith("426") || freq_val.startsWith("428"))
            {
              ////////////////////
              let freq_str = Number(freq_val).toString(16)
              let setfre = [0x68,0x0d,0x01,0x01,0x00,0x08, 
                Number("0x"+ freq_str.substr(6,2)), Number("0x"+ freq_str.substr(4,2)),
                Number("0x"+ freq_str.substr(2,2)), Number("0x"+ freq_str.substr(0,2)),   
                Number("0x"+ freq_str.substr(6,2)), Number("0x"+ freq_str.substr(4,2)),
                Number("0x"+ freq_str.substr(2,2)), Number("0x"+ freq_str.substr(0,2)),
                0x10 ]
              let checksum = this.checksumcalc(setfre,setfre.length).toString(16)
              let finarr = [setfre[0],setfre[1],setfre[2],setfre[3],
              Number("0x"+ checksum.substr(0,2)),Number("0x"+ checksum.substr(2,2)),
              setfre[4],setfre[5],setfre[6],setfre[7],setfre[8],setfre[9],setfre[10],setfre[11],
              setfre[12],setfre[13],setfre[14] ]
              console.log("final set freqq-", finarr)
              //this.ipc.send('stm_send_dmr',finarr);
              ////////////////////////

              this.ipc.send("checque_freq",finarr)
              this.spinner.show()
              setTimeout(function(){
                this.spinner.hide()
              }.bind(this),8000)
          }else{
            this.snackBar.open('Valid Frequency bands are 424,425,426,428,431,432', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
            return;
          }
      }else{
        if(freq_val.startsWith("432") || freq_val.startsWith("431") || freq_val.startsWith("430")  || freq_val.startsWith("429")
        || freq_val.startsWith("428") || freq_val.startsWith("426") || freq_val.startsWith("425")
        || freq_val.startsWith("424") || freq_val.startsWith("423") )
        {
          ////////////////////
          let freq_str = Number(freq_val).toString(16)
          let setfre = [0x68,0x0d,0x01,0x01,0x00,0x08, 
            Number("0x"+ freq_str.substr(6,2)), Number("0x"+ freq_str.substr(4,2)),
            Number("0x"+ freq_str.substr(2,2)), Number("0x"+ freq_str.substr(0,2)),   
            Number("0x"+ freq_str.substr(6,2)), Number("0x"+ freq_str.substr(4,2)),
            Number("0x"+ freq_str.substr(2,2)), Number("0x"+ freq_str.substr(0,2)),
            0x10 ]
              let checksum = this.checksumcalc(setfre,setfre.length).toString(16)
              let finarr = [setfre[0],setfre[1],setfre[2],setfre[3],
              Number("0x"+ checksum.substr(0,2)),Number("0x"+ checksum.substr(2,2)),
              setfre[4],setfre[5],setfre[6],setfre[7],setfre[8],setfre[9],setfre[10],setfre[11],
              setfre[12],setfre[13],setfre[14] ]
              console.log("final set freqq-", finarr)
              //this.ipc.send('stm_send_dmr',finarr);
              ////////////////////////

              this.ipc.send("checque_freq",finarr)
              this.spinner.show()
              setTimeout(function(){
                this.spinner.hide()
              }.bind(this),8000)
          }else{
            this.snackBar.open('Valid Frequency bands are 424,425,426,428,431,432', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
            return;
          }
      }
        //console.log(formValue);

    }
  }

  checksumcalc(buf,len){
    let sum = 0
    var index = 0
    while(len > 1){
       // console.log("buf index--", buf[index], buf[index] << 8 )
      sum+= 0xFFFF & (buf[index] << 8 | buf[index+1]);
      index += 2
      len -= 2
     // console.log("sum--",sum)

      //index++
    }
    if(len){
      sum += (0xff & buf[index]) << 8

    }
    while(sum >> 16){
      sum = (sum & 0xFFFF) + (sum >> 16)
    }
    return sum ^ 0xFFFF
  }


}
