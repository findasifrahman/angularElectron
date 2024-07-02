import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { IpcRenderer } from 'electron';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PassDialogComponent} from '../../sharedComponentModule/pass-dialog/pass-dialog.component';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-voice-settings',
  templateUrl: './voice-settings.component.html',
  styleUrls: ['./voice-settings.component.scss']
})
export class VoiceSettingsComponent implements OnInit {
  backcol ="p"
  self = this;
  chanval
  freqtable
  set_channel_id
  set_channel_freq
  set_channel_freq_type
  set_channel_type
  
  private ipc: IpcRenderer;
  cleartimeout
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['channel_id','type', 'buttons'];
  displayedColumnsName: string[] = ['channel_id','type','buttons'];
  AllElement: MatTableDataSource<any>;

  return_msg_dmr = ""

  channel_change_drop
  inputval
  setfreqval
  setid_val
  rcvr_grp_id
  set_color_id
  set_ctcss

  dmr_return_msg
  get_freq_table
  get_curr_chan

  ////////////////
  accept_dialog_alradyopen
  accept_dialogRef 

  /////////////////////////
  sq_set_result

  voice_enc_key
  //data_low_power: any[] = [0x68,0x17,0x01,0x01,0x00,0x01,0xff,0x10]

  all_Set_success
  all_set_successfull = false
  mg_set_result

  constructor(  private cdref: ChangeDetectorRef,zone:NgZone,private snackBar: MatSnackBar,  public _router: Router,
    public dialog: MatDialog, private router: Router,private spinner: NgxSpinnerService) { 
    this.self = this

    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer
        //console.log("ipc startttttt voice")
        this.dmr_return_msg = (event, data) => {
          zone.run(()=>{
            this.return_msg_dmr = data.msg.res
          })
        }
        this.get_curr_chan = (event, data)=>{
          zone.run(()=>{
            this.voice_enc_key = data.voice_enc_key
            //console.log("voice enc key is--", data.voice_enc_key)
            this.set_channel_id = data.msg.channel_id          
            this.set_channel_freq = this.freqtable.find(x=> x.channel_id == parseInt(this.set_channel_id)).frequency

            if(parseInt(this.set_channel_id) <= 8 ){
              if(this.set_channel_id == 7 || this.set_channel_id == 8)
                this.set_channel_type = "Digital Enc"
              else{
                this.set_channel_type = "Digital"
              }
            }else{
              this.set_channel_type = "Analog"
            }
            if(this.set_channel_id == 1 || this.set_channel_id == 2 || this.set_channel_id == 3
               || this.set_channel_id == 7 || this.set_channel_id == 8 || this.set_channel_id == 9
               || this.set_channel_id == 10 ){
                 this.set_channel_freq_type = "Military Freqyency"
            }else{
              this.set_channel_freq_type = "Non Military Freqyency"
            }

          })
         
        }
        this.all_Set_success = (event, data) =>{
          zone.run(()=>{
            this.snackBar.open(' Channel changed successfully ', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
            if(this.spinner)
              this.spinner.hide()
            this.all_set_successfull = true
            this.set_channel_id = this.channel_change_drop         
            this.set_channel_freq = this.freqtable.find(x=> x.channel_id == parseInt(this.set_channel_id)).frequency
            if(parseInt(this.set_channel_id) <= 8 ){
              if(this.set_channel_id == 7 || this.set_channel_id == 8)
                this.set_channel_type = "Digital Enc"
              else{
                this.set_channel_type = "Digital"
              }
            }else{
              this.set_channel_type = "Analog"
            }
            if(this.set_channel_id == 1 || this.set_channel_id == 2 
               || this.set_channel_id == 7 || this.set_channel_id == 8 
               || this.set_channel_id == 10 || this.set_channel_id == 11 || this.set_channel_id == 12 
               || this.set_channel_id == 13){
                 this.set_channel_freq_type = "Military Freqyency"
            }else{
              this.set_channel_freq_type = "Non Military Freqyency"
            }
          })
        }
        this.get_freq_table = (event, data) => { // freq table recieved
          zone.run(()=>{
            this.freqtable = data.msg
            let new_arr = []
            data.msg.map((mapval,index)=>{

              if(mapval.channel_id == '6' ||  mapval.channel_id == '17'){
                if(mapval.channel_id == '6'){
                  mapval.type = "Digital"
                }else{
                  mapval.type = "Analog"
                }
                new_arr.push(mapval)
              }
              if(index == data.msg.length - 1){
                this.AllElement = new MatTableDataSource(new_arr as any);
                this.AllElement.paginator = this.paginator;
                // now get curr channel
                this.ipc.send('send_curr_chan',"true");
              }
            })

            //console.log("freq table is-", data.msg)

          })
        }
        this.sq_set_result = (event,data) =>{
          zone.run(()=>{
            this.spinner.show()
            setTimeout(function(){
              this.spinner.hide()
            }.bind(this),6000)
            this.snackBar.open('SQ set successfully', "Remove", {
              duration: 8000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            return
          })
        }
        this.mg_set_result = (event,data) =>{
          zone.run(()=>{
            this.spinner.show()
            setTimeout(function(){
              this.spinner.hide()
            }.bind(this),6000)
            this.snackBar.open('Gain set successfully', "Remove", {
              duration: 8000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            return
          })
        }
        ///////////////////


        this.ipc.on('dmr_return_msg', this.dmr_return_msg)
        this.ipc.on('get_curr_chan',this.get_curr_chan)
        this.ipc.on('get_freq_table', this.get_freq_table)
        this.ipc.on('sq_set_result',this.sq_set_result)
        this.ipc.on('all_Set_success',this.all_Set_success)
        this.ipc.on('mg_set_result', this.mg_set_result)
      }catch(e){}
    }
  }
  ngOnDestroy(){
    this.ipc.removeListener('dmr_return_msg', this.dmr_return_msg)
    this.ipc.removeListener('get_curr_chan',this.get_curr_chan)
    this.ipc.removeListener('get_freq_table', this.get_freq_table)
    this.ipc.removeListener('sq_set_result', this.sq_set_result)
    this.ipc.removeListener('all_Set_success',this.all_Set_success)
    this.ipc.removeListener('mg_set_result', this.mg_set_result)
  }
  ngOnInit(): void {
    this.ipc.send('send_freq_table',"true");
  }
  ngAfterContentChecked() {
    this.backcol = localStorage.getItem('back_col_val')
    this.cdref.detectChanges();
    
  }
  advancedSet(){
    //
    const passdialogRef = this.dialog.open(PassDialogComponent, {
      width: '450px',
      hasBackdrop: true
      //data: "Are you sure you want to change Channel?"
    });
    passdialogRef.afterClosed().subscribe(dpass => {
  
      if(dpass == "Intricate21"){
        this.router.navigate(['/advvoiceset'])
      }
    })

  }
  channelChangeSubmit(vall){
    if(this.cleartimeout){
      clearTimeout(this.cleartimeout)
      this.cleartimeout = null
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, you want to change channel?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.all_set_successfull = false
        this.spinner.show()
        this.cleartimeout = setTimeout(function(){
          this.spinner.hide()
          if(!this.all_set_successfull){
            this.snackBar.open(' Failed To change channel', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
          }
        }.bind(this),8000)
        //this.ipc.send('db_save_curr_chan',vall);
        this.channel_change_drop = vall
       //console.log("this.channel_change_drop",this.channel_change_drop)
        if(this.channel_change_drop){
          this.ipc.send('set_channel',{channel_id: this.channel_change_drop})

        }
        else{
          this.snackBar.open('Select a channel first', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
        }
      }
    })

  }
  text_channelChangeSubmit(ch){

  }
  changesq(val){
    if(this.set_channel_id <= 9){
      this.snackBar.open('SQ settings only for analog channel', "Remove", {
        duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
      });
      return
    }
    let aa = 0x00
    if(val == 1){
      aa = 0x01
    }else if(val == 2){
      aa = 0x02
    }else if(val == 3){
      aa = 0x02
    }else if(val == 4){
      aa = 0x04
    }else if(val == 5){
      aa = 0x05
    }

    let tochksum = [0x68,0x12,0x01,0x01,0x00,0x01,aa,0x10]
    let checksum = this.checksumcalc(tochksum ,tochksum.length).toString(16)
    let finval = [tochksum[0],tochksum[1],tochksum[2],tochksum[3],
      Number("0x"+ checksum.substr(0,2)),  Number("0x"+ checksum.substr(2,2)),
      tochksum[4],tochksum[5],tochksum[6],tochksum[7]]

    this.ipc.send('stm_send_dmr',finval);
  }
  changemc(val){
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, you want to change Microphone Gain?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){

          let aa = 0x00
          if(val == 1){
            aa = 0x01
          }else if(val == 2){
            aa = 0x02
          }else if(val == 3){
            aa = 0x06
          }else if(val == 4){
            aa = 0x08
          }else if(val == 5){
            aa = 0x0a
          }

          let tochksum = [0x68,0x0b,0x01,0x01,0x00,0x01,aa,0x10]
          let checksum = this.checksumcalc(tochksum ,tochksum.length).toString(16)
          let finval = [tochksum[0],tochksum[1],tochksum[2],tochksum[3],
            Number("0x"+ checksum.substr(0,2)),  Number("0x"+ checksum.substr(2,2)),
            tochksum[4],tochksum[5],tochksum[6],tochksum[7]]

          this.ipc.send('stm_send_dmr',finval);

      }
    })
  }
  onEdit(id){
    //console.log("onedit id id--",id)
    this._router.navigate(['/freqedit', id, '']);

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

