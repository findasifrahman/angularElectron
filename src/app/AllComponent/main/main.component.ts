import { Component,NgZone,ElementRef,Renderer2, ViewChild,OnInit } from '@angular/core';
import * as $ from 'jquery';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  allloaded = true
  ch1 = "409"
  ch2 = "410"
  ch3 = "411"
  ch4 = "412"

  ch5 = "409"
  ch6 = "410"
  ch7 = "411"
  ch8 = "412"
  ch9 = "409"
  ch10 = "410"
  ch11 = "411"
  ch12 = "412"
  ch13 = "409"
  ch14 = "410"
  ch15 = "411"
  ch16 = "412"

  chanel_arr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
  encryption_tx = [{name:"TR1",val:"039"},{name:"TR2",val:"040"},{name:"TR3",val:"041"},{name:"TR4",val:"042"},
  {name:"TR5",val:"043"},{name:"TR6",val:"045"},{name:"TR7",val:"046"},{name:"TR8",val:"047"},
  {name:"TR9",val:"048"},{name:"TR10",val:"049"},{name:"TR11",val:"050"},{name:"TR12",val:"051"},
  {name:"TR13",val:"052"},{name:"TR14",val:"053"},{name:"TR15",val:"054"},{name:"TR16",val:"055"},
  {name:"TR17",val:"056"},{name:"TR18",val:"057"},{name:"TR19",val:"058"},{name:"TR20",val:"059"},
  {name:"TR21",val:"060"},{name:"TR22",val:"061"},{name:"TR23",val:"062"},{name:"TR24",val:"063"},
  {name:"TR25",val:"064"},{name:"TR26",val:"065"},{name:"TR27",val:"066"},{name:"TR28",val:"067"},
  {name:"N1",val:"001"},{name:"N2",val:"002"},{name:"N3",val:"003"},{name:"N4",val:"004"}]
  encryption_rx = [{name:"TR1",val:"039"},{name:"TR2",val:"040"},{name:"TR3",val:"041"},{name:"TR4",val:"042"},
  {name:"TR5",val:"043"},{name:"TR6",val:"045"},{name:"TR7",val:"046"},{name:"TR8",val:"047"},
  {name:"TR9",val:"048"},{name:"TR10",val:"049"},{name:"TR11",val:"050"},{name:"TR12",val:"051"},
  {name:"TR13",val:"052"},{name:"TR14",val:"053"},{name:"TR15",val:"054"},{name:"TR16",val:"055"},
  {name:"TR17",val:"056"},{name:"TR18",val:"057"},{name:"TR19",val:"058"},{name:"TR20",val:"059"},
  {name:"TR21",val:"060"},{name:"TR22",val:"061"},{name:"TR23",val:"062"},{name:"TR24",val:"063"},
  {name:"TR25",val:"064"},{name:"TR26",val:"065"},{name:"TR27",val:"066"},{name:"TR28",val:"067"},
  {name:"N1",val:"001"},{name:"N2",val:"002"},{name:"N3",val:"003"},{name:"N4",val:"004"}]
  
  sq = ["0","1","2","3","4","5","6","7"]
  encryption_tx_val = "0"
  encryption_rx_val = "0"
  sqlevel = "0"
  self = this;
  private ipc: IpcRenderer;
  connectState = true
  connecString = ""
  constructor(  private router: Router,private route: ActivatedRoute,zone:NgZone,private snackBar: MatSnackBar, ) { 
    this.self = this
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer
        console.log("ipc startttttt")
        //this.arrlist = [{text: "message",time: "21/04/02", left: true}]
        this.ipc.on('setdata', (event, data) => {
          console.log("returned set daa-",data)
          zone.run(()=>{
            if(data.msg == "success"){
              this.snackBar.open('Data written successfully', "Remove", {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              }); 
            }else{
              this.snackBar.open('Error writting data', "Remove", {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              }); 
            }
          })
        })
        this.ipc.on('getfreq', (event, data) => {
          //this.connectState = "Connected"//data.msg
          var arr = data.msg.split(',')
          zone.run(()=>{
            if(arr.length > 0){
              this.ch1 = arr[0].substr(2)
              this.ch2 = arr[2]
              this.ch3 = arr[4]
              this.ch4 = arr[6]
              this.ch5 = arr[8]
              this.ch6 = arr[10]
              this.ch7 = arr[12]
              this.ch8 = arr[14]
              this.ch9 = arr[16]
              this.ch10 = arr[18]
              this.ch11 = arr[20]
              this.ch12 = arr[22]
              this.ch13 = arr[24]
              this.ch14 = arr[26]
              this.ch15 = arr[28]
              this.ch16 = arr[30]
              this.sqlevel = arr[34]
              this.encryption_tx_val = arr[32]
              this.encryption_rx_val = arr[33]

            }
            if(data.msg){
              this.connecString = "Connected"
            }else{
              this.connecString = "Disconnected"
            }
          })
        })
      }catch (error) {
        throw error;
      }
    }
  

  }

  ngOnInit(): void {
  }
  channel
  chnSubmit(){
    this.ipc.send('channelget',this.channel); 
    this.snackBar.open('Channel Set', "Remove", {
      duration: 4000,
      verticalPosition: 'top',
      panelClass: ['blue-snackbar']
    }); 
  }
  formSubmit(){
    let cc1 = this.ch1
    let obj = {}
    let mainobj = "AAFA3" + this.ch1 + "," + this.ch1 + "," + 
    this.ch2 + "," + this.ch2 + "," + this.ch3 + "," + this.ch3 + "," + 
    this.ch4 + "," + this.ch4 + "," + this.ch5 + "," + this.ch5 + "," + 
    this.ch6 + "," + this.ch6 + "," + this.ch7 + "," + this.ch7 + "," +
    this.ch8 + "," + this.ch8 + "," + this.ch9 + "," + this.ch9 + "," +
    this.ch10 + "," + this.ch10 + ","  + this.ch11 + "," + this.ch11 + "," +
    this.ch12 + "," + this.ch12 + "," + this.ch13 + "," + this.ch13 + "," +  
    this.ch14 + "," + this.ch14 + "," + this.ch15 + "," + this.ch15 + "," + 
    this.ch16 + "," + this.ch16 + "," + this.encryption_tx_val + "," + 
    this.encryption_rx_val + "," +this.sqlevel
    obj = {ch1:this.ch1,ch2: this.ch2,ch3: this.ch3,ch4: this.ch4,ch5: this.ch5,ch6: this.ch6,ch7: this.ch7,ch8: this.ch8,
      ch9:this.ch9,ch10: this.ch10,ch11: this.ch11,ch12: this.ch12,ch13: this.ch13,ch14: this.ch14,ch15: this.ch15,ch16: this.ch16,
      tx_en: this.encryption_tx_val,rx_en:this.encryption_rx_val, sq: this.sqlevel}
    console.log("obj--", obj)
    this.ipc.send('getData',mainobj); 

  }

}
