import { Component, Inject, NgZone } from '@angular/core';
import * as $ from 'jquery';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PassDialogComponent} from './sharedComponentModule/pass-dialog/pass-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Bijoy 50 UHF Communication Set';

  mailhidden = true
  no_of_new_mail_msg = 0

  chathidden = true
  no_of_new_chat_msg = 0

  hard_arm_comm = ""
  gps_comm = ""
  lora_comm = ""
  hard_arm_data = ""
  gps_data = ""
  lora_data = ""
  mymenshow = true
  backcol = "p"

  //@Input() showsearchattoolbar = false
  showsearchattoolbar = false
  loading = false;
  private ipc: IpcRenderer;
  diagVisible = false

   all_diag_res
   delete_db_text_result 
   new_text_msg
   ack_perm_for_long_msg_star_handshake
   long_data_all_str_rcvd 

   voice_module_color = false
   data_module_color = false
   voice_rx_color = false
   voice_tx_color = false
   gps_color = false

   get_system_state
   rx_rssi_val = ""

   rcv_my_id_enc_data_shipl
   my_name

   showCallState = false
   callstateString = ""
   color_interval
   call_string_color = true

   already_ply_snd = 1
  constructor( private router: Router, private snackBar: MatSnackBar,
    public dialog: MatDialog,  zone:NgZone){
      //////////////////////////////
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
          this.my_name = data.msg.my_id_obj.ship
        })
      }
      //////////////////////////////
      this.all_diag_res = (event, data) => {
        zone.run(()=>{
          this.hard_arm_comm = data.msg.hard_arm_comm
          this.gps_comm = data.msg.gps_comm
          this.lora_comm = data.msg.lora_comm
          this.hard_arm_data = data.msg.hard_arm_comm
          this.lora_data = data.msg.lora_data
          this.gps_data = data.msg.gps_data
        })
      }
      this.get_system_state = (event,data)=>{
        zone.run(()=>{
          if(data.voice_module_color != 2)
            this.voice_module_color = data.voice_module_color ? true : false 
          if(data.data_module_color != 2)
            this.data_module_color = data.data_module_color ? true : false
          if(data.voice_tx_color != 2){
            this.voice_tx_color = data.voice_tx_color ? true: false


            let aa
            if(data.curr_voice_chan_set )
            {
              
              if(data.curr_voice_chan_set == 7 || data.curr_voice_chan_set == 8){
                aa =  data.voice_tx_color ? true: false
                this.showCallState = true
                this.callstateString = "Encrypted by AES-128"
              }else if(data.curr_voice_chan_set <=6){
                aa =  data.voice_tx_color ? true: false
                this.showCallState = true
                this.callstateString = "Encoded by CODEC-3"
              }else{
                //this.callstateString = "Analog"
              }
              if(aa){
                if(!this.color_interval){
                  this.color_interval = setInterval(function(){
                    console.log("interval started")
                    if(!aa){
                      console.log("interval ended 2")
                      clearInterval(this.color_interval)
                      this.color_interval = null
                      this.showCallState = false
                      this.callstateString = ""
                    }
                    if(this.call_string_color){
                      this.call_string_color = false
                    }else{
                      this.call_string_color = true
                    }
                  }.bind(this),1000)
                }
              }else{
                if(this.color_interval){
                  clearInterval(this.color_interval)
                  console.log("interval ended")
                  this.color_interval = null
                  this.call_string_color == true
                  this.showCallState = false
                  this.callstateString = ""
                }
              }
            }
          }
          if(data.voice_rx_color > 2){
            let testt = Math.ceil((parseInt(data.voice_rx_color))/20)
            if(testt > 5 ){ testt = 5}
            this.rx_rssi_val = "= " + testt.toString()
            this.voice_rx_color = true

            ///
            if(data.curr_voice_chan_set )
            {
              
              if(data.curr_voice_chan_set == 7 || data.curr_voice_chan_set == 8){
                this.showCallState = true
                this.callstateString = "Encrypted by AES-128"
                if(!this.color_interval){
                  this.color_interval = setInterval(function(){
                    console.log("interval started rx")
                    if(this.call_string_color){
                      this.call_string_color = false
                    }else{
                      this.call_string_color = true
                    }
                  }.bind(this),1000)
                }
              }else if(data.curr_voice_chan_set <=6){
                this.showCallState = true
                this.callstateString = "Encoded by CODEC-3"
                if(!this.color_interval){
                  this.color_interval = setInterval(function(){
                    console.log("interval started rx")
                    if(this.call_string_color){
                      this.call_string_color = false
                    }else{
                      this.call_string_color = true
                    }
                  }.bind(this),1000)
                }
              }/*else{
                this.callstateString = "Analog"
              }
              if(!this.color_interval){
                this.color_interval = setInterval(function(){
                  console.log("interval started rx")
                  if(this.call_string_color){
                    this.call_string_color = false
                  }else{
                    this.call_string_color = true
                  }
                }.bind(this),1000)
              }*/
            }
            ////
            /*setTimeout(function(){ 
              this.voice_rx_color = false;
              this.rx_rssi_val = "" 
            }.bind(this),10*900)*/
          }if(data.voice_rx_color == 0){
            this.voice_rx_color = false;
            this.rx_rssi_val = "" 
            if(this.color_interval){
              clearInterval(this.color_interval)
              console.log("interval ended")
              this.color_interval = null
              this.call_string_color == true
              this.showCallState = false
              this.callstateString = ""
            }
          }
          else{
            if(data.voice_rx_color != 2)
              this.voice_rx_color = data.voice_rx_color ? true : false
              /*setTimeout(function(){ 
                this.voice_rx_color = false;
                this.rx_rssi_val = "" 
              }.bind(this),10*900)*/
          }
          if(data.gps_color  != 2)
            this.gps_color = data.gps_color ? true : false
          //// call state show

          ////
        })
      }
      this.delete_db_text_result = (event, data) => {
        this.snackBar.open('data deleted Succesfully', "Remove", {
          duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
        });
      }
      this.new_text_msg =  (event, data) => {
        zone.run(()=>{
         console.log("new msg rcvr list --", )
          this.snackBar.open('New message from - ' + data.new_msg.sender, "Remove", {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar']
          });
          this.play_sound()
          this.chathidden = false
          this.no_of_new_chat_msg = this.no_of_new_chat_msg + 1
          ///
         
          let state_of_new_sh_msg = JSON.parse(localStorage.getItem('state_of_new_sh_msg'))
          if(!state_of_new_sh_msg)
            state_of_new_sh_msg = []
          let prevs
          if(data.new_msg.rcvr.startsWith('f')){
            prevs = state_of_new_sh_msg.find(x=> x.uid == data.new_msg.rcvr)
          }else{
            prevs = state_of_new_sh_msg.find(x=> x.uid == data.new_msg.sender_uid)
          }
          if(prevs){
          
            if(data.new_msg.rcvr.startsWith('f')){
              state_of_new_sh_msg =  state_of_new_sh_msg.filter(x => x.uid !== data.new_msg.rcvr)
              state_of_new_sh_msg.push({uid: data.new_msg.rcvr, uid_rcvr: data.new_msg.rcvr, no_of_msg: prevs.no_of_msg + 1})
            }
            else{
              state_of_new_sh_msg =  state_of_new_sh_msg.filter(x => x.uid !== data.new_msg.sender_uid)
              state_of_new_sh_msg.push({uid: data.new_msg.sender_uid, uid_rcvr: data.new_msg.rcvr, no_of_msg:  prevs.no_of_msg + 1})
            }
          }
          else{
            if(data.new_msg.rcvr.startsWith('f'))
              state_of_new_sh_msg.push({uid: data.new_msg.rcvr, uid_rcvr: data.new_msg.rcvr, no_of_msg: 1})
            else{
              state_of_new_sh_msg.push({uid: data.new_msg.sender_uid, uid_rcvr: data.new_msg.rcvr, no_of_msg:  1})
            }
          }
          localStorage.setItem('state_of_new_sh_msg',JSON.stringify(state_of_new_sh_msg))
          console.log("state_of_new_sh_msg-",state_of_new_sh_msg)
          //////////////////
        })
      }
      this.long_data_all_str_rcvd = (event, obj) => {
        console.log("all long data rcvd ",obj.msg)
        zone.run(()=>{
          this.snackBar.open(' You received a new mail ', "Remove", {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar']
          });
          this.play_sound()
          this.mailhidden = false
          this.no_of_new_mail_msg = 1
        })
      }
      this.ack_perm_for_long_msg_star_handshake = (event,data)=>{
        zone.run(()=>{
          //this.play_sound()
          //temp

      
          if(this.already_ply_snd == 1){
            this.play_sound()
            this.already_ply_snd = 0
          }
          setTimeout(function(){

            this.already_ply_snd = 1
            
          }.bind(this),10000)
          ///
          console.log("recieved request to allow transmission")
          if(this.router.url === '/longmessage'){
            console.log("allready inside long msg")
          }else
            this.router.navigate(['/longmessage'])
          /*if(!this.accept_dialog_alradyopen){
            this.accept_dialog_alradyopen = true
                this.accept_dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                  width: '250px',
                  hasBackdrop: true,
                  disableClose: true,
                  data: "Do you want to accept Message from " + this.rcvrlist.find(x=> x.uid == data.sender).ship + " ?"
                });
              this.accept_dialogRef.afterClosed().subscribe(result=>{    
                console.log("value of result--",result)
                if(result){
                  this.ipc.send("perm_of_acceptance_long_msg",true)
                  this.accept_dialogRef.close('Closing')
                  this.router.navigate(['/longmessage'])
                }else{
                  this.ipc.send("perm_of_acceptance_long_msg",false)
                  this.accept_dialogRef.close('Closing')
                }
              })
              /////////////////////////////////
              setTimeout(function(){
                if(this.accept_dialogRef){     
                  this.accept_dialogRef.close()
                  //this.ipc.send("perm_of_acceptance_long_msg",false)
                  console.log("after 22 sec")

                }
              }.bind(this),22 * 1000)
              setTimeout(function(){
                this.accept_dialog_alradyopen = false // be ready to rcv again
              }.bind(this),50 * 1000)
              /////////////////////////////////////
          }*/

        })
      } 

    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer
        console.log("ipc startttttt")
        this.ipc.on('delete_db_text_result', this.delete_db_text_result )
        this.ipc.on("all_diag_res",this.all_diag_res)
        this.ipc.on("new_text_msg",this.new_text_msg)
        this.ipc.on('long_data_all_str_rcvd',this.long_data_all_str_rcvd)
        this.ipc.on('ack_perm_for_long_msg_star_handshake',this.ack_perm_for_long_msg_star_handshake)
        this.ipc.on('get_system_state',this.get_system_state)
        this.ipc.on('rcv_my_id_enc_data_shipl', this.rcv_my_id_enc_data_shipl)
         
      }catch(e){}
    }
  }
  changebackcol(){
    if(this.backcol == "p"){
      this.backcol = "g"
      localStorage.setItem('back_col_val',"g")
    }else{
      this.backcol = "p"
      localStorage.setItem('back_col_val',"p")
    }
  }
  long_message(){
    this.mailhidden = true
    this.no_of_new_mail_msg = 0
    this.router.navigate(['/longmessage'])
  }
  opl_chat(){
    this.chathidden = true
    this.no_of_new_chat_msg = 0
    this.router.navigate(['/chat'])
  }
  location(){
    this.router.navigate(['/map'])
  }
  gotovoiceset(){
    this.router.navigate(['/voiceset'])
  }
  gotodataset(){
    this.router.navigate(['/dataset'])
  }
  ngOnInit(){
        localStorage.setItem('back_col_val',"p")  
        setTimeout(function(){
          this.ipc.send('send_my_id_enc_data_shipl',true);  
        }.bind(this),8000) 
                
  }
  isgps = 1
  user_settings(){
    /*const dialogRef = this.dialog.open(EditusersetDialog, {
      width: '250px',
      data: {isgps: this.isgps},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      
    });*/

    
    this.router.navigate(['/edituserset'])
  }

  gotohome(){
    this.router.navigate(['/'])
  }

  myidedit(){
    const passdialogRef = this.dialog.open(PassDialogComponent, {
      width: '450px',
      hasBackdrop: true
      //data: "Are you sure you want to change Channel?"
    });
    passdialogRef.afterClosed().subscribe(dpass => {
      if(dpass){
        if(dpass.includes('bijoy50')){
          this.router.navigate(['/editmyid'])
        }
      }
    })

  }
  


  login(){
    this.router.navigate(['/login'])
  }
  ngOnDestroy(){
    console.log("inside ng on destroy app")
    this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    
    this.ipc.removeListener('delete_db_text_result',this.delete_db_text_result)
    this.ipc.removeListener('all_diag_res',this.all_diag_res)
    this.ipc.removeListener('new_text_msg',this.new_text_msg)
    this.ipc.removeListener('long_data_all_str_rcvd',this.long_data_all_str_rcvd)
    this.ipc.removeListener('ack_perm_for_long_msg_star_handshake',this.ack_perm_for_long_msg_star_handshake)
    this.ipc.removeListener('get_system_state',this.get_system_state)
  }
  run_diag(){
    
    
    const passdialogRef = this.dialog.open(PassDialogComponent, {
      width: '450px',
      hasBackdrop: true
      //data: "Are you sure you want to change Channel?"
    });
    passdialogRef.afterClosed().subscribe(dpass => {
      if(dpass){
        console.log("dpass is--", dpass)
        if(dpass == "Intricate21"){
          this.ipc.send('all_diag',true)
          this.diagVisible = true
          setTimeout(function(){
            this.diagVisible = false
          }.bind(this),40000)
        }
      }
    })
    
  }
  datadelfrom(){
    console.log("yeah")
    const passdialogRef = this.dialog.open(PassDialogComponent, {
      width: '450px',
      hasBackdrop: true
      //data: "Are you sure you want to change Channel?"
    });
    passdialogRef.afterClosed().subscribe(dpass => {
      if(dpass){
        console.log("dpass is--", dpass)
        if(dpass.includes('bijoy50')){
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            hasBackdrop: true,
            data: "This will delete all data from db? Are you sure"
          });
          dialogRef.afterClosed().subscribe(result => {
            if(result){
              this.ipc.send("delete_all_text_db",true)
            }
          })
        }
      }
    })


  }

  play_sound(){

      let audio = new Audio()
      audio.src = "./assets/rr.mp3"
      audio.load()
      audio.play()

    
  }
}

/*
export interface DialogData {
  isgps: string;
}

@Component({
  selector: 'edituserset-dialog',
  templateUrl: './AllComponent/dialogmodals/edituserset.html',
})
export class EditusersetDialog {
  constructor(
    public dialogRef: MatDialogRef<EditusersetDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

*/