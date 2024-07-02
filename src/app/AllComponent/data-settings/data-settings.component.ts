import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { IpcRenderer } from 'electron';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PassDialogComponent} from '../../sharedComponentModule/pass-dialog/pass-dialog.component';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-data-settings',
  templateUrl: './data-settings.component.html',
  styleUrls: ['./data-settings.component.scss']
})
export class DataSettingsComponent implements OnInit,AfterContentChecked  {
  backcol ="p"
  selectchancol1 = "q" // p means selected chan color green else yellow
  selectchancol2 = "q"
  selectchancol3 = "q"
  selectchancol4 = "q"
  selectchancol5 = "q"
  selectchancol6 = "q"

  self = this;
  chanval
  freqtable
  set_channel_id

  set_channel_freq_type
  set_channel_type
  
  all_set_successfull = false
  channel_change_drop
  private ipc: IpcRenderer;

  get_curr_data_chan 

  success_data_ch_change
  constructor(  private cdref: ChangeDetectorRef,zone:NgZone,private snackBar: MatSnackBar,  public _router: Router,
    public dialog: MatDialog, private router: Router,private spinner: NgxSpinnerService)  { 
      this.self = this
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.get_curr_data_chan = (event, data)=>{
            zone.run(()=>{
              this.set_channel_id = parseInt(data.msg.channel_id)          
              this.changeselectchan(this.set_channel_id )
              if(this.set_channel_id == 1 ){
                   this.set_channel_freq_type = "Military Freqyency"
              }else{
                this.set_channel_freq_type = "Non Military Freqyency"
              }
  
            })
           
          }
          this.success_data_ch_change = (event, data)=>{
            zone.run(()=>{
              this.set_channel_id = parseInt(data.msg.channel_id)          
              this.changeselectchan(this.set_channel_id )
              if(this.set_channel_id == 1 ){
                   this.set_channel_freq_type = "Military Freqyency"
              }else{
                this.set_channel_freq_type = "Non Military Freqyency"
              }
              this.all_set_successfull = true
              this.spinner.hide()
              this.snackBar.open('Successfully changed channel', "Remove", {
                duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
              });
            })
           
          }
          this.ipc.on('get_curr_data_chan', this.get_curr_data_chan)
          this.ipc.on('success_data_ch_change',this.success_data_ch_change)
        }catch(e){}
      }
  }

  text_channelChangeSubmit(ch_id){
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, you want to change channel?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.all_set_successfull = false
        this.spinner.show()
        setTimeout(function(){
          this.spinner.hide()
          if(!this.all_set_successfull){
            this.snackBar.open(' Failed to change channel', "Remove", {
              duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
            });
          }
        }.bind(this),8000)
        //this.ipc.send('db_save_curr_chan',vall);
        this.channel_change_drop = ch_id
        if(this.channel_change_drop){
          this.ipc.send('set_data_channel',{channel_id: this.channel_change_drop})

        }
        else{
          this.snackBar.open('Select a channel first', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
        }
      }
    })
  }
  ngOnInit(): void {
    this.ipc.send('send_curr_data_chan',true)
  }
  ngAfterContentChecked() {
    this.backcol = localStorage.getItem('back_col_val')
    this.cdref.detectChanges();
    
  }
  ngOnDestroy(){
    this.ipc.removeListener('get_curr_data_chan', this.get_curr_data_chan )
    this.ipc.removeListener('success_data_ch_change',this.success_data_ch_change)
  }
  changeselectchan(select_chan){
    if(select_chan == 1){
      this.selectchancol1 = "p"
      this.selectchancol2 = "q"
      this.selectchancol3 = "q"
      this.selectchancol4 = "q"
      this.selectchancol5 = "q"
      this.selectchancol6 = "q"
    }else if(select_chan == 2){
      this.selectchancol1 = "q"
      this.selectchancol2 = "p"
      this.selectchancol3 = "q"
      this.selectchancol4 = "q"
      this.selectchancol5 = "q"
      this.selectchancol6 = "q"
    }else if(select_chan == 3){
      this.selectchancol1 = "q"
      this.selectchancol2 = "q"
      this.selectchancol3 = "p"
      this.selectchancol4 = "q"
      this.selectchancol5 = "q"
      this.selectchancol6 = "q"
    }
    else if(select_chan == 4){
      this.selectchancol1 = "q"
      this.selectchancol2 = "q"
      this.selectchancol3 = "q"
      this.selectchancol4 = "p"
      this.selectchancol5 = "q"
      this.selectchancol6 = "q"
    }
    else if(select_chan == 5){
      this.selectchancol1 = "q"
      this.selectchancol2 = "q"
      this.selectchancol3 = "q"
      this.selectchancol4 = "q"
      this.selectchancol5 = "p"
      this.selectchancol6 = "q"
    }
    else if(select_chan == 6){
      this.selectchancol1 = "q"
      this.selectchancol2 = "q"
      this.selectchancol3 = "q"
      this.selectchancol4 = "q"
      this.selectchancol5 = "q"
      this.selectchancol6 = "p"
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
}
