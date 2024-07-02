import { Component,NgZone, OnInit,CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GroupService } from './group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { groupmodels } from '../../models/groupmodels';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { IpcRenderer } from 'electron';


@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit {

  @ViewChild('select') select: MatSelect;

  private ipc: IpcRenderer;
  allSelected=false;
  selectedItem
  rcvr_arr = []

  simpleSnackBarRef: any;
  Forms: FormGroup;
  selectFormControl = new FormControl('', Validators.required);
  
  rcv_my_id_enc_data_shipl 
  rcvrlist
  my_id

  finalselectedstr =""
  finallength 
  prev_group_val

  get_group_all
  selectChanged(event){
    this.selectedItem = event
  
    this.selectedItem.map((mv,index)=>{
      if(index == this.selectedItem.length - 1){
        this.finalselectedstr = this.finalselectedstr + mv.ship
        console.log("this.selected--", this.selectedItem,this.finalselectedstr)
        this.finallength = index + 1
      }else{
        this.finalselectedstr = this.finalselectedstr + mv.ship + ","
      
      }
      
    })

  }
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }
   ////////////////////////////////////////////////////////////////
   ////////////////////////////////////////////////////////////////
 
  constructor(private snackBar: MatSnackBar, private groupservice: GroupService,
    private formBuilder: FormBuilder,private router:Router,zone:NgZone,
    private spinner: NgxSpinnerService,private allModels: groupmodels) { 
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
          this.my_id = data.msg.my_id_obj.uid
          this.rcvrlist = data.msg.shipl
          this.rcvrlist.push({id:0,uid: data.msg.my_id_obj.uid, ship:data.msg.my_id_obj.ship,uname: null})
          console.log("rcvr list is --", this.rcvrlist)
          this.rcvrlist.map(mv=>{
            if(mv.uid !== this.my_id)
                this.rcvr_arr.push(mv)
          })

        })
      }
      this.get_group_all = (event, data) => {
        this.prev_group_val = data
        console.log("prev group val--", this.prev_group_val)
        
      }
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
        }  catch (error) {
          console.log(error);
        }
        this.ipc.on('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
        this.ipc.on('get_group_all',this.get_group_all)
      }
  }

  ngOnDestroy(){
    this.ipc.removeListener('get_group_all',this.get_group_all)
    this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
  }
    ngOnInit() {
      this.Forms = this.allModels.modelForms;
      this.Forms.reset();
      this.ipc.send('send_my_id_enc_data_shipl',true);
      this.selectedItem = []
      this.ipc.send('send_group_all',true);
      /*this.groupservice.getAll().subscribe(
          val=> 
          {
            console.log("all group val--", val)
            this.prev_group_val = val
            this.selectedItem = [{id:32,ship: "DJY (MB)", uid: "0004",uname:"sd"}]
            val.map(dd=>{

            })
          },
          error => {

            console.log("error post", error);
            this.snackBar.open('Unsuccessfull, duplicate username probably', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['red-snackbar']
            });
          }
        )*/
    }

    async FormSubmit() {
      this.finalselectedstr = ""
      this.selectedItem.map((mv,index)=>{
      
        if(index == this.selectedItem.length - 1){
          this.finalselectedstr = this.finalselectedstr + mv.uid +  "," + this.my_id
          console.log("this.selected--", this.selectedItem,this.finalselectedstr)
          this.finallength = index + 1
  
        

            this.Forms.patchValue({members: this.finalselectedstr})
            this.Forms.patchValue({membar_id: '5'})
            if(!this.finalselectedstr){
              this.snackBar.open('No group member selected', "Remove", {
                duration: 6000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }
            if(this.Forms.controls['gr_number'].value.length != 3 ){
              this.snackBar.open('Group number must be 3 digits', "Remove", {
                duration: 6000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              this.Forms.patchValue({gr_number : "" })
          
              return
            }
            /*if(this.Forms.controls['membar_id'].value.length != 1 ){
              this.snackBar.open('Invalid member ID selected', "Remove", {
                duration: 6000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }*/

            let fobj = this.prev_group_val.find(x=> (x.gr_number.substr(1).toLowerCase()) == this.Forms.controls['gr_number'].value.toLowerCase())
            if(fobj){
              this.snackBar.open('Group Number allready exist', "Remove", {
                duration: 6000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }
            let fobj2 = this.prev_group_val.find(x=>  x.gr_name.toLowerCase() == this.Forms.controls['gr_name'].value.toLowerCase())
            if(fobj2){
              this.snackBar.open('Group name allready exist', "Remove", {
                duration: 6000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }
            /*
            let fobj3 = false
            if(isNaN(this.Forms.controls['membar_id'].value)){
              fobj3 = true
              this.snackBar.open('Member ID is not valid', "Remove", {
                duration: 6000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }*/
            setTimeout(async function(){
              this.Forms.patchValue({gr_number : "f" +  this.Forms.controls['gr_number'].value })
              this.Forms.patchValue({no_of_membar: this.finallength.toString()})

              const formValue = this.Forms.value;
              console.log("formval-", formValue)
              if(!fobj && !fobj2 ){//&& !fobj3){
                this.spinner.show()
                setTimeout(function(){
                  this.spinner.hide()
                }.bind(this),8000)
                  try {
                    await this.groupservice.Add(formValue).subscribe(
                    
                      data => {
                        this.finalselectedstr = ""
                        this.finallength = 0
                        console.log("post req successfull");
                        this.snackBar.open('Added successfully', "Remove", {
                          duration: 6000,
                          verticalPosition: 'top',
                          panelClass: ['blue-snackbar']
                        });
                        this.spinner.hide()
                        this.ipc.send('send_group_all',true);
                        this.router.navigate(["/admin/listgroup"]);
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
              }
            }.bind(this),200)

          }else{
            this.finalselectedstr = this.finalselectedstr + mv.uid + ","
          
          }
          
        })
      
    }

}
