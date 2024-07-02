import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddShipService } from './add-ship.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { allusermodels } from '../../models/allusermodels';
import { IpcRenderer } from 'electron';
@Component({
  selector: 'app-add-ship',
  templateUrl: './add-ship.component.html',
  styleUrls: ['./add-ship.component.scss']
})
export class AddShipComponent implements OnInit {
  private ipc: IpcRenderer;
  ship_list =[ "SMA (KV)","SDN (LT)","BNA (EH)","PTA (MO)","PTY (LU)", "DJY (MB)", "NML (MC)", "test" ]
  ship_type_list = ["base","fast_patrol_boat","first_patrol_boat_guided_missile","frigate","frigate_guided_missile","helicopter","landing_Craft_minor","minesweeper","auxiliary","cg_ship"]
  simpleSnackBarRef: any;
  Forms: FormGroup;
  selectFormControl = new FormControl('', Validators.required);
  my_id
  rcvrlist=[]

  rcv_my_id_enc_data_shipl
  constructor(zone:NgZone,private snackBar: MatSnackBar, private addshipservice: AddShipService,
    
    private formBuilder: FormBuilder,private router:Router,
    private spinner: NgxSpinnerService,private allModels:allusermodels) { 
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
          this.my_id = data.msg.my_id_obj.uid
          this.rcvrlist = data.msg.shipl
          console.log("rcvrlist", this.rcvrlist)

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


    ngOnInit() {
      this.Forms = this.allModels.modelForms;
      this.Forms.reset();
      this.ipc.send('send_my_id_enc_data_shipl',true);
    }
    ngOnDestroy(){
      this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    }

    async FormSubmit() {
      const formValue = this.Forms.value;
      console.log("formval-", formValue)
      if(this.Forms.controls['uid'].value.length != 4 ){
        this.snackBar.open('Id number is not valid', "Remove", {
          duration: 6000,
          verticalPosition: 'top',
          panelClass: ['blue-snackbar']
        });
        this.Forms.patchValue({uid : "" })
    
        return
      }
      if(this.Forms.controls['uid'].value == this.my_id){
        this.snackBar.open('You can not assign your own id as Reciever', "Remove", {
          duration: 6000,
          verticalPosition: 'top',
          panelClass: ['blue-snackbar']
        });
        this.Forms.patchValue({uid : "" })
    
        return
      }
      let  fnd_uid = 0
      if( this.rcvrlist.length > 0){
        this.rcvrlist.map((x,index)=> {
          if(x.uid == this.Forms.controls['uid'].value){
            fnd_uid = 1
          }
          
        })
      }
      console.log("aa",fnd_uid)
     setTimeout(async function(){
      if(fnd_uid == 1){
        this.snackBar.open('This id has allready been assigned', "Remove", {
          duration: 6000,
          verticalPosition: 'top',
          panelClass: ['blue-snackbar']
        });
        this.Forms.patchValue({uid : "" })
    
        return
       }
      try {
        this.spinner.show()
        setTimeout(function(){
          this.spinner.hide()
        }.bind(this),3000)
        await this.addshipservice.Add(formValue).subscribe(
          data => {
            console.log("post req successfull");
            this.snackBar.open('Added successfully', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            //this.router.navigate(["/"]);
          },
          error => {
            console.log("error post", error);
            this.snackBar.open('Unsuccessfull, duplicate username probably', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['red-snackbar']
            });
          }
        );
 
      }
      catch (err) {
      }
     }.bind(this),500)

    }

}
