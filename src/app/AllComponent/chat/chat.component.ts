import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit, AfterViewChecked, TestabilityRegistry, ViewChildren, QueryList } from '@angular/core';
import * as $ from 'jquery';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { AddShipService } from '../add-ship/add-ship.service'
import { NgxSpinnerService } from "ngx-spinner";
import * as CryptoJS from 'crypto-js'; 
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import {ChangeDetectorRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit,AfterViewInit,AfterViewChecked {
  @ViewChild('someVar') el:ElementRef;
  @ViewChild("printt") print!: ElementRef;
  items = [
    {id: 1, name: 'Item 1'},
    {id: 2, name: 'Item 2'},
    {id: 3, name: 'Item 3'}
  ];

  @ViewChildren(MatMenuTrigger) contextMenu: QueryList<MatMenuTrigger>;
  //@ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  /// pin ncontext menu
  pinitem = [
    {id: 1, name: 'Item 1'}
  ];
  //@ViewChild(MatMenuTrigger) pincontextMenu: MatMenuTrigger;
  pincontextMenuPosition = { x: '0px', y: '0px' };
  ////
  
  public dateTimeRange: Date;
  public dateTimeRange2: Date;
  to_date = ""
  from_date = ""

  number_of_repeat_txt = 2
  inervalclose
  txtlist = [] // text data 
  print_txtlist = [] // print datta
  two_part_msg = [] // 2 part message half
  three_part_msg = [] // 3 part message half
  four_part_msg = [] // 4 part message half
  sendarrList = []
  rcvrlist = []
  status_msg_arr = []
  serialCount = 0
  schrollflag = false
  username = ""
  my_dev_name
  /////////////////////////
  simple_msg_start_bit = "13"
  my_id;// = "0001"
  rcv_id = "ffff"
  enc_byte = "0000"
  end_bit = "91" //+ '\n'
  cur_msg_ser = 0

  ack_msg_start_bit = "14"
  /////////////////////////
  private ipc: IpcRenderer;
  inputText
  self = this;
  sync_time_counter = 1
  intervalclos
  connectState = true
  connectString = "Not Connected"
  backservice

  //// var for unregister electron ipc subsxription
  status_msg_on_data
  rcv_my_id_enc_data_shipl
  txt_msg
  text_msg_sent
  lora_connection_state
  backcol ="p"

  activeFolder = false

  tmp_txtlist = []
  current_selected_rcvr

  /////////////long msg var
  accept_dialog_alradyopen
  accept_dialogRef 



  
  inputtext_length = "0"
  /////////////////////////
  online_offline_state

  chat_between = ""
  aes_enc_key = "Secret Passphrase"//"1234567812345678123456781234567812345678123456781234567812345678"
  showall = true
  showprint = false
  send_chat_print_by_date

  selected_pin_item

  selected_sf_time = 350
  constructor(  private cdref: ChangeDetectorRef,private shipservice: AddShipService ,private router: Router,
    private route: ActivatedRoute,private spinner: NgxSpinnerService,
    zone:NgZone,private snackBar: MatSnackBar,public dialog: MatDialog ){
    this.self = this

    /////////////////////// lora connection state
    this.lora_connection_state = (event, data) => {
      this.connectState = data.msg
      zone.run(()=>{
        //console.log("connect state rcvd--",data.msg)
        if(data.msg){
          this.connectString = "Connected"
        }else{
          this.connectString  = "Disconnected"
        }
      })
    }
    ////////////////////// status msg rcvd
    this.status_msg_on_data = (event, data) => {//status with or without gps rcvd
      
      //console.log("inside status msg-")    
      zone.run(()=>{
        //this.schrollflag = false
        if(this.rcvrlist.length > 0){
          //console.log("dataa status front-", data,this.rcvrlist)
          for(const x of this.rcvrlist){
            if(x.uid == data.msg.sender){
              x.status = "Online"
              x.state = true
              x.time = moment().format("YYYY-MM-DD HH:mm:ss")
              
              return
            }

          }

          //this.rcvrlist.sort((a,b)=> a.state === b.state?-1:0)
          
          ///
        }
      })
    }
    ///////////////////////////////// connection state
    this.online_offline_state = (event,data) =>{
      //console.log("only online state-", data)
      zone.run(()=>{
        for(const x of this.rcvrlist){
          if(data.find(xpre=> xpre.uid == x.uid)){
            x.state = data.find(xpre=> xpre.uid == x.uid).mstatus
            if(x.state){
              x.status = "Online"

            }
          }
        }
      })
    }
    //////////////////////// id enc data rcvd

    this.rcv_my_id_enc_data_shipl = (event, data) => {
      zone.run(()=>{
        //console.log("my id,enc,data,ship list rcvd--",data.msg)
        //data.msg = JSON.parse(data.parse)
        this.selected_sf_time = data.msg.selected_sf_time
        this.my_id = data.msg.my_id_obj.uid
        this.my_dev_name = data.msg.my_id_obj.ship
        this.connectString = data.msg.my_id_obj.connectionstate
       
        this.aes_enc_key = data.msg.enc_key
        //console.log("aes key is", this.aes_enc_key)
        /*this.rcvrlist = data.msg.shipl
        this.rcvrlist  = this.rcvrlist.map(x=> ({...x,
          status:'Offline',state: false,isactive: false}))*/
        this.rcvrlist = data.msg.usergroup
        this.rcvrlist = this.rcvrlist.map(x=> ({...x,ship:x.user,
          status:'Offline',state: false,isactive: false,new_msg_no:0,bg_hidden: true }))
        let yu = {id:0,user:"",members: null,ship: "Broadcast",isactive: true,state:true, status:"", uid:"ffff", uname: null,
        new_msg_no:0,bg_hidden: true }
        

        this.rcvrlist = [yu].concat(this.rcvrlist)
        //this.rcvrlist.push(yu) // added broadcast group
        //console.log("rcvr",this.rcvrlist)
        
        let state_of_new_sh_msg = JSON.parse(localStorage.getItem('state_of_new_sh_msg')) // prev history of new msg
        let pin_arr_temp = []
        let unpin_arr_temp = []
        setTimeout(function() {
            this.rcvrlist.map((mpv,index)=>{
              //console.log("is pinnnn",mpv)
              let yu
              if(mpv.uid.startsWith('f')){
                if(state_of_new_sh_msg){
                  let er = state_of_new_sh_msg.find(x=> x.uid == mpv.uid)
                  if(er){
                    yu = {id:mpv.id,user:mpv.user, ship:mpv.ship,
                      isactive: mpv.isactive, state:mpv.state, status:"", uid:mpv.uid,
                      uname: mpv.uname, members: mpv.members ,new_msg_no:er.no_of_msg,bg_hidden: false }
                  }else{
                    yu = {id:mpv.id,user:mpv.user, ship:mpv.ship,
                      isactive: mpv.isactive, state:mpv.state, status:"", uid:mpv.uid,
                      uname: mpv.uname, members: mpv.members ,new_msg_no:0,bg_hidden: true }
                  }
                }
                else{
                  yu = {id:mpv.id,user:mpv.user, ship:mpv.ship,
                    isactive: mpv.isactive, state:mpv.state, status:"", uid:mpv.uid,
                    uname: mpv.uname, members: mpv.members ,new_msg_no:0,bg_hidden: true }
                }

                //console.log("h yu",yu)
                pin_arr_temp.push(yu)
              }
              else if(mpv.pin){
                //console.log("is pinnnn",mpv.pin)
                //////////////////////////////
                if(state_of_new_sh_msg){
                  let er = state_of_new_sh_msg.find(x=> x.uid == mpv.uid)
                  if(er){
                    mpv.new_msg_no = er.no_of_msg,
                    mpv.bg_hidden = false 
                  }
                }
                //////////////////////////////
                if(mpv.pin){
                  pin_arr_temp.push(mpv)
                  //console.log("insider true",mpv.pin)
                }else{
                  unpin_arr_temp.push(mpv)
                }
                
              } else{
                if(state_of_new_sh_msg){
                  let er = state_of_new_sh_msg.find(x=> x.uid == mpv.uid)
                  if(er){
                    mpv.new_msg_no = er.no_of_msg,
                    mpv.bg_hidden = false 
                  }
                }
                unpin_arr_temp.push(mpv)
              }
            
              ////
              if(index == this.rcvrlist.length - 1){
                //console.log("pin arr--", pin_arr_temp)
                this.rcvrlist = []
                this.rcvrlist = pin_arr_temp.concat(unpin_arr_temp)//[yu].concat(pin_arr_temp)
                //this.rcvrlist =  this.rcvrlist.concat(unpin_arr_temp)
              

                this.chat_between =  "All"
                ////////////////////////
                //this.current_selected_rcvr = yu
                this.current_selected_rcvr = this.rcvrlist.find(x=> x.uid == 'ffff')//data.new_msg.rcvr
                //x.isactive = true
                //console.log("this yu",this.current_selected_rcvr)
                for(const x of this.rcvrlist){
                  if(data.msg.prestate.find(xpre=> xpre.uid == x.uid)){
                    x.state = data.msg.prestate.find(xpre=> xpre.uid == x.uid).mstatus
                    if(x.state){
                      x.status = "Online"

                    }
                  }
                }
                let new_Arr = []
                this.tmp_txtlist = []
                data.msg.data.map((x,index) => {
                  if(typeof x.mleft == 'string' || x.mleft instanceof String){
                  
                    if(x.mleft.includes('true')){
                      x.mleft = true
                      x.mright = false
                    }else{
                      x.mleft = false
                      x.mright = true
                    }
                  }
                  //if(! moment(x.rawtime).isSame(new Date(), "day"))
                  {
                    x.showtime = moment(x.rawtime).format("DDHHmm MMM YY")
                  }
                
                  new_Arr.push(x)
                  if(x.rcvr == 'ffff'){
                    this.tmp_txtlist.indexOf(x) === -1 ? this.tmp_txtlist.push(x) : null
                  }
                    //this.tmp_txtlist.push(x)
                  if(index == data.msg.data.length - 1){
                    this.txtlist = new_Arr.reverse()
                    //this.print_txtlist = this.txtlist
                    this.tmp_txtlist = this.tmp_txtlist.reverse()
                    /*var element = document.getElementById("someVar");
                    if(element)
                    {
                      element.scrollTop = element.scrollHeight;  
                      this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight
                    }*/
                  }
                })

            }
          })
      ///////////////////////
      }.bind(this),50)
    })

    }
    /////////////////////// text msg sent
    this.text_msg_sent = (event,data)=>{

        zone.run(()=>{  
         // console.log("correctly sent...data-", data.time,this.txtlist)         

        let mdata = moment().format("YYMMDD") + data.time  
        let obj = this.txtlist.find(x=> x.mright && moment(x.rawtime).format('YYMMDDHHmmss') == mdata ) 
         if(obj){
          // console.log("obj found --", obj)
           this.txtlist = this.txtlist.filter(x=> moment(x.rawtime).format('YYMMDDHHmmss') !== mdata)
           obj.allOnlineSent = data.allOnlineSent,
           obj.sent = data.sent
           obj.groupSent = data.groupSent
          
           this.txtlist.push(obj)
         }   
        
        })

    
    }
    /////////////////////// text msg recieved
    this.txt_msg =  (event, data) => {
      zone.run(()=>{
        /*if(this.txtlist.find(x=>x.raw_data == data.msg.raw_data)){
        }
        else{
      
        }*/// dplicate check else end
        this.schrollflag = false
        
          /////////////////////////////////////////
          if(data.new_msg.rcvr == 'ffff'){// broadcast rcvr
            //this.chat_between =  "Receiver- All"
            for(const x of this.rcvrlist){
              if(x.uid == 'ffff'){
                //x.isactive = true
                x.bg_hidden = false
                x.new_msg_no= x.new_msg_no + 1
                //this.current_selected_rcvr =  this.rcvrlist.find(x=> x.uid == data.new_msg.rcvr)
              }else{
                //x.isactive = false
              }
            }
          }else if(data.new_msg.rcvr.substr(0,1) == "f"){
            for(const x of this.rcvrlist){
              if(x.uid == data.new_msg.rcvr){
                //x.isactive = true
                x.bg_hidden = false
                x.new_msg_no= x.new_msg_no + 1
                //////////////////////
                let mm = this.rcvrlist.find(x => x.uid == data.new_msg.rcvr).members
                let arr = mm.split(',');
                let rcvrstr = ""
                arr.map((mp,index)=>{
                  let aa = this.rcvrlist.find(x=> x.uid == mp)
                  if(aa){
                    rcvrstr = rcvrstr + aa.ship + ", "
                    
                  }
                  if(index == arr.length - 1){
                    //this.chat_between = "Group Members- " + rcvrstr
                  }
                })
                ////////////////////////////
                //this.current_selected_rcvr =  this.rcvrlist.find(x=> x.uid == data.new_msg.rcvr)
              }else{
                //x.isactive = false
              }
            }
          }else{
            for(const x of this.rcvrlist){
              if(x.uid == data.new_msg.sender_uid){
                //this.current_selected_rcvr = this.rcvrlist.find(x=> x.uid == data.new_msg.sender_uid)//data.new_msg.rcvr
                //x.isactive = true
                x.bg_hidden = false
                x.new_msg_no= x.new_msg_no + 1
                //this.chat_between = this.current_selected_rcvr.ship
              }else{
                //x.isactive = false
              }
              
            }
          }
          let new_Arr = []
          if(data.new_msg.rcvr.substr(0,1) == "f" ) {
            if(this.current_selected_rcvr.uid == data.new_msg.rcvr)
              this.tmp_txtlist = []
          }
          else{
            if(this.current_selected_rcvr.uid == data.new_msg.sender_uid){
              this.tmp_txtlist = []
            }
          }
          //this.tmp_txtlist = []
          //console.log("new msg sender --", data.new_msg,this.current_selected_rcvr.uid,this.current_selected_rcvr )
          let changed = 0
              data.msg.map((x,index) => {
                if(typeof x.mleft == 'string' || x.mleft instanceof String){
                
                  if(x.mleft.includes('true')){
                    x.mleft = true
                    x.mright = false
                  }else{
                    x.mleft = false
                    x.mright = true
                  }
                }
                /*if(! moment(x.rawtime).isSame(new Date(), "day")){
                  x.showtime = moment.unix(x.rawtime).format("DDHHmm MMM YY")
                }*/

                new_Arr.push(x)
                if(data.new_msg.rcvr == 'ffff'){
                  if(x.rcvr == 'ffff'){
                    if(this.current_selected_rcvr.uid == data.new_msg.rcvr){
                       this.tmp_txtlist.push(x)
                       changed = 1
                    }
                  }
                }else if(data.new_msg.rcvr.substr(0,1) == "f"){
                  if(x.rcvr == data.new_msg.rcvr){
                    if(this.current_selected_rcvr.uid == data.new_msg.rcvr){
                        this.tmp_txtlist.push(x)
                        changed = 1
                    }
                  }
                }else{

                  if(x.sender.localeCompare(data.new_msg.sender) == 0 && x.rcvr.localeCompare(this.my_id) == 0){
                    if(this.current_selected_rcvr.uid == data.new_msg.sender_uid){
                        this.tmp_txtlist.push(x)
                        changed = 1
                    }
                  }else if(x.rcvr == data.new_msg.sender_uid){
                    if(this.current_selected_rcvr.uid == data.new_msg.sender_uid){
                      this.tmp_txtlist.push(x)
                      changed = 1
                    }
                  }
                }
              
                if(index == data.msg.length - 1){
                  this.txtlist = new_Arr.reverse()
                  if( changed == 1)
                    this.tmp_txtlist = this.tmp_txtlist.reverse()

                }
              })
          
          ///////////////////////////////////////////

          for(const x of this.rcvrlist){
            if(x.uid == data.new_msg.sender_uid){
              x.status = "Online"
              x.state = true
              x.time = moment().format("YYYY-MM-DD HH:mm:ss")
              
              return
            }
  
          }

        })

      }
      ////////////////////////////////////////////////
      this.send_chat_print_by_date = (event,data) =>{
        //console.log("retrned print chat --", data)
        zone.run(()=>{
            let new_Arr = []
            if(data.length == 0){
              this.spinner.hide()
              this.snackBar.open(' No communication records found between this time window ', "Remove", {
                duration: 5000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }
            data.map((x,index) => {
              if(typeof x.mleft == 'string' || x.mleft instanceof String){
              
                if(x.mleft.includes('true')){
                  x.mleft = true
                  x.mright = false
                }else{
                  x.mleft = false
                  x.mright = true
                }
              }
              //if(! moment(x.rawtime).isSame(new Date(), "day"))
              {
                x.showtime = moment(x.rawtime).format("DDHHmm MMM YY")
              }
              new_Arr.push(x)

              if(index == data.length - 1){
                this.print_txtlist = new_Arr.reverse()
                setTimeout(function(){
                  this.print.nativeElement.click();
                  //console.log("print text list--", this.print_txtlist)
                  this.spinner.hide()
                }.bind(this),6000)

              }
            })
        })
        //this.print_txtlist = obj
      }
      ///////////////////////////////////////////////////////////

      ///
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer
        console.log("ipc startttttt")
        //this.arrlist = [{text: "message",time: "21/04/02", left: true}]
        this.ipc.on('lora_connection_state', this.lora_connection_state)
        this.ipc.on('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
        //// message sent success
        this.ipc.on('text_msg_sent',this.text_msg_sent)
        this.ipc.on('status_msg', this.status_msg_on_data)
        ////// text msg rcvd
        this.ipc.on('text_msg',this.txt_msg)
        ///////////////////////

        this.ipc.on('online_offline_state', this.online_offline_state)
        
        this.ipc.on('send_chat_print_by_date',this.send_chat_print_by_date)
        ///////////////////////////
        ////////// rssi recieve
        /*this.ipc.on('rssi_msg',(event,data)=>{
          zone.run(()=>{  
            alert('Incoming Call. Rssi value is - ' + data.msg)
    
          })
        })*/
        //})
      }  catch (error) {
        console.log(error);
      }
    }else {
     // console.warn('Could not load electron ipc');
    }
  }
  ngOnDestroy(){
    clearInterval(this.backservice)
    console.log("inside ng on destroy")
    this.ipc.removeListener('status_msg', this.status_msg_on_data)
    this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    this.ipc.removeListener('text_msg_sent',this.text_msg_sent)
    this.ipc.removeListener('lora_connection_state',this.lora_connection_state)
    this.ipc.removeListener('text_msg',this.txt_msg)
    
   this.ipc.removeListener('online_offline_state', this.online_offline_state)
    this.ipc.removeListener('send_chat_print_by_date',this.send_chat_print_by_date)
  }
  ngOnInit(): void {
    /*this.shipservice.getAll().subscribe(val=>{
      this.rcvrlist = val
      this.rcvrlist  = this.rcvrlist.map(x=> ({...x,status:'Offline',state: false}))
      console.log(this.rcvrlist)
    })*/
    this.backservice = setInterval(function(){
      //this.schrollflag = false
      this.ipc.send("send_online_offline_state",true)
      this.rcvrlist = this.rcvrlist.map(x=> {
        var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(moment(x.time)) 
        var d = moment.duration(ms)
        //console.log("moment duration-", d, d.asMinutes())
        if(d.asMinutes() > 8){
          x.status = "Offline"
          x.state = false
        }
        return x
      })
    }.bind(this),5000*13)
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
  ngAfterViewInit(){
    this.ipc.send('send_my_id_enc_data_shipl',true);

    //this.backcol = localStorage.getItem('back_col_val')
  }
  ngAfterContentChecked() {
    this.backcol = localStorage.getItem('back_col_val')
    this.cdref.detectChanges();
    
  }
  ngAfterViewChecked() {        
    //this.scrollToBottom();        
  } 
  onScroll() {
    let element = this.el.nativeElement
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight
    if (this.schrollflag && atBottom) {
        this.schrollflag = false
    } else {
        this.schrollflag = true
    }
  }
  scrollToBottom = () =>{ 
    if (this.schrollflag) {
      return
    }
    //if(this.schrollflag)
    {
      try {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        //console.log("inside scroll to bottom")
      } catch(err) {
        //console.log("scroll to bottom error")
       } 
    }
  }
  onkeydown(event){
    event.preventDefault()
  }
  FormSubmit(){
    // start bit(13) + msgpart (01) + sender_id (01) 
    // + RCVR_id(01) + enc_byte(0000) + message_id(000000) +  message_length (xx) + message + end_bit(91) 
    if(this.current_selected_rcvr){
      if(this.inputText){
          let snt_time = moment()//this.pad_time()
          let len = this.inputText.length
          let f_len = ""
          let msg_part;
          let mtime = snt_time.format('YYYY-MM-DD HH:mm:ss')//Math.round(+ new Date()/1000).toString(16)
          let mmtime = snt_time.format('HHmmss') 
      
          //var iv = CryptoJS.enc.Utf8.parse('5ty76ujie324$567');
          let encrypted_text = CryptoJS.AES.encrypt(this.inputText.trim(), this.aes_enc_key,
          /*{
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          } */
          ).toString();  
          //console.log("Encrypted text is",encrypted_text, encrypted_text.length)
          if(encrypted_text.length > 204){
            this.snackBar.open('Text length is above limit', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            return
          }
          if(!this.my_id && this.my_id.length != 4){
            this.snackBar.open('Device ID not found', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            return
          }
          this.cur_msg_ser++;
          this.rcv_id = this.current_selected_rcvr.uid
          
          let msg = {
            start: "13",msg_part: "11",
            sender: this.my_id, rcvr: this.rcv_id, 
            time: mmtime,
            enc: this.enc_byte,
            msg_serial: this.msg_serial(4) ,len:this.getlen(len.toString(16)),
            text: this.inputText,
            end: this.end_bit,
            mleft: false,
            mright: true,
            showtime: moment().format("DDHHmm MMM YY"),
            rawtime: mtime
          }
          this.txtlist.push(msg)
          this.tmp_txtlist.push(msg)
         /* this.txtlist = this.txtlist.sort (function(a, b){return <any>moment(b.time) 
            - <any>moment(a.time)})*/
          // now save to db
          let obj = {mleft: false,mright: true,sender:msg.sender,
            rcvr:msg.rcvr,enc: msg.enc,msg_serial:msg.msg_serial,
            len: msg.len,text: msg.text,showtime: msg.showtime,rawtime: msg.rawtime
          }
          this.ipc.send('allmsg_save_to_db', obj);              

          ///////////////////////
          this.spinner.show()
          setTimeout(function(){
            this.spinner.hide()
          }.bind(this),13000)
          if(encrypted_text.length > 34 && encrypted_text.length <= 68){
            msg_part = "21"

            let lenn = this.getlen(encrypted_text.substr(0,34).length.toString(16))
            let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
             + lenn.toString() + encrypted_text.substr(0,34) 
            let send_text = this.simple_msg_start_bit +  mainstr +
            this.crc16_kermit(mainstr) + this.end_bit
            this.ipc.send('sendData_lora',send_text);

              setTimeout(function(){
                msg_part = "22"
                let lenn = this.getlen(encrypted_text.substr(34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                  this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
              }.bind(this),this.selected_sf_time)//700)
              
        
          }else if(encrypted_text.length > 68 && encrypted_text.length<=102){
            msg_part = "31"
            let lenn = this.getlen(encrypted_text.substr(0,34).length.toString(16))
            let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
             + lenn.toString() + encrypted_text.substr(0,34)  
            let send_text = this.simple_msg_start_bit +  mainstr +
            this.crc16_kermit(mainstr) + this.end_bit
            this.ipc.send('sendData_lora',send_text);
                  
              setTimeout(function(){
                msg_part = "32"
                let lenn = this.getlen(encrypted_text.substr(34,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(34,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                      
              }.bind(this),this.selected_sf_time)//600)
              setTimeout(function(){
                msg_part = "33"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(68).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(68)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 2)//1300)
          }else if(encrypted_text.length > 102 && encrypted_text.length<=136){
            msg_part = "41"
            let lenn = this.getlen(encrypted_text.substr(0,34).length.toString(16))
            let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
             + lenn.toString() + encrypted_text.substr(0,34)  
            let send_text = this.simple_msg_start_bit +  mainstr +
            this.crc16_kermit(mainstr) + this.end_bit
            this.ipc.send('sendData_lora',send_text);
                  
              setTimeout(function(){
                msg_part = "42"
                let lenn = this.getlen(encrypted_text.substr(34,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(34,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                      
              }.bind(this),this.selected_sf_time)//600)
              setTimeout(function(){
                msg_part = "43"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(68,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(68,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
              }.bind(this),this.selected_sf_time * 2)//1300)
              setTimeout(function(){
                msg_part = "44"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(102).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(102)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 3)//2000)
          }else if(encrypted_text.length > 136 && encrypted_text.length<=170){ // 5 part
            msg_part = "51"
            let lenn = this.getlen(encrypted_text.substr(0,34).length.toString(16))
            let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
             + lenn.toString() + encrypted_text.substr(0,34)  
            let send_text = this.simple_msg_start_bit +  mainstr +
            this.crc16_kermit(mainstr) + this.end_bit
            this.ipc.send('sendData_lora',send_text);
                  
              setTimeout(function(){
                msg_part = "52"
                let lenn = this.getlen(encrypted_text.substr(34,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(34,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                      
              }.bind(this),this.selected_sf_time)//600)
              setTimeout(function(){
                msg_part = "53"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(68,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(68,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 2)//1300)
              setTimeout(function(){
                msg_part = "54"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(102,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(102,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 3)//2000)
              setTimeout(function(){
                msg_part = "55"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(136).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(136)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 4)//2700)
          }else if(encrypted_text.length > 170 && encrypted_text.length<=204){ // 6 part
            msg_part = "61"
            let lenn = this.getlen(encrypted_text.substr(0,34).length.toString(16))
            let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
             + lenn.toString() + encrypted_text.substr(0,34)  
            let send_text = this.simple_msg_start_bit +  mainstr +
            this.crc16_kermit(mainstr) + this.end_bit
            this.ipc.send('sendData_lora',send_text);
                  
              setTimeout(function(){
                msg_part = "62"
                let lenn = this.getlen(encrypted_text.substr(34,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(34,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                      
              }.bind(this),this.selected_sf_time)//600)
              setTimeout(function(){
                msg_part = "63"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(68,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(68,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 2)//1300)
              setTimeout(function(){
                msg_part = "64"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(102,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(102,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 3)//2000)
              setTimeout(function(){
                msg_part = "65"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(136,34).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(136,34)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 4)//2700)
              setTimeout(function(){
                msg_part = "66"
                mtime = moment().format("HHmm")
                let lenn = this.getlen(encrypted_text.substr(170).length.toString(16))
                let mainstr = msg_part + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
                 + lenn.toString() + encrypted_text.substr(170)  
                let send_text = this.simple_msg_start_bit +  mainstr +
                this.crc16_kermit(mainstr) + this.end_bit
                this.ipc.send('sendData_lora',send_text);
                this.inputText = ""
                      
               
              }.bind(this),this.selected_sf_time * 5)//3500)
          }else{
            msg_part = "11"
            let lenn = this.getlen(len.toString(16)).toString() 
            let mainstr = msg_part 
            + this.my_id + this.rcv_id + mmtime //+ this.enc_byte  
            //this.msg_serial(4)
             + lenn.toString() + encrypted_text.substr(0,34) 

            //console.log("crc kermit-- ",mainstr,this.crc16_kermit(mainstr))  

            let send_text = this.simple_msg_start_bit +  mainstr +
            this.crc16_kermit(mainstr) + this.end_bit
            
            this.ipc.send('sendData_lora',send_text);
            this.inputText = ""
          }


          this.schrollflag = false
     }
    }else{
      
      this.snackBar.open('Please select a Receiver', "Remove", {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
  }
  selcetship(c){
    console.log("selected ship item--", c)
      /////////////
      let state_of_new_sh_msg = JSON.parse(localStorage.getItem('state_of_new_sh_msg'))
      if(!state_of_new_sh_msg)
        state_of_new_sh_msg = []
      let prevs = state_of_new_sh_msg.find(x=> x.uid == c.uid)

      if(prevs){
        state_of_new_sh_msg =  state_of_new_sh_msg.filter(x => x.uid !== c.uid)
        localStorage.setItem('state_of_new_sh_msg',JSON.stringify(state_of_new_sh_msg))
      }
      console.log("JSON.parse(localStorage.getItem('state_of_new_sh_msg'))--", 
      JSON.parse(localStorage.getItem('state_of_new_sh_msg')))
     
      /////////////
    for(const x of this.rcvrlist){
      if(x.uid == c.uid){
        x.isactive = true
        x.bg_hidden = true
        x.new_msg_no= 0
      
      }else{
        x.isactive = false
        //x.bg_hidden = false
        //x.new_msg_no= x.new_msg_no
      }
      
    }
    if(c.uid == "ffff"){
      this.chat_between =  "Receiver- All"
    }else if(c.uid.substr(0,1) == "f"){
      //console.log("this.rcvrlist", this.rcvrlist, c.uid,this.rcvrlist.find(x => x.uid.startsWith(c.uid)))

      let mm = this.rcvrlist.find(x => x.uid.startsWith(c.uid)).members

      let arr = mm.split(',');
      let rcvrstr = ""
      arr.map((mp,index)=>{
        let aa = this.rcvrlist.find(x=> x.uid == mp)
        if(aa){
          rcvrstr = rcvrstr + aa.ship + ", "
          
        }
        if(index == arr.length - 1){
          this.chat_between = "Group Members- " + rcvrstr
        }
      })
    }else{
      this.chat_between =  "Receiver- " + this.rcvrlist.find(x=>x.uid == c.uid).ship
    }
      //this.chat_between =  "All"
    this.tmp_txtlist = []
    this.txtlist.map((mi,index)=>{
      if(c.uid == 'ffff'){
        if(mi.rcvr == 'ffff'){
          this.tmp_txtlist.indexOf(mi) === -1 ? this.tmp_txtlist.push(mi) : null
          //this.tmp_txtlist.push(mi)
        }
      }else if(c.uid.substr(0,1) == "f"){
        if(mi.rcvr == c.uid){
          this.tmp_txtlist.indexOf(mi) === -1 ? this.tmp_txtlist.push(mi) : null
          //this.tmp_txtlist.push(mi)
        }
      }
      else{ // mi.sender is ship name
        if(mi.sender.localeCompare(c.ship) == 0 && mi.rcvr.localeCompare(this.my_id) == 0){
          this.tmp_txtlist.indexOf(mi) === -1 ? this.tmp_txtlist.push(mi) : null
          //this.tmp_txtlist.push(mi)
        }else if(mi.rcvr == c.uid){
          this.tmp_txtlist.indexOf(mi) === -1 ? this.tmp_txtlist.push(mi) : null
          //this.tmp_txtlist.push(mi)
        }
      }
      
      /*if(index == this.txtlist.length - 1){
        this.tmp_txtlist = this.tmp_txtlist.reverse()
      }*/
    })

    this.current_selected_rcvr = c
    this.schrollflag = false
    //this.scrollToBottom() 
  }
  inputTextOnChange(){
    this.inputtext_length = this.inputText.length
  }

  triggerPrint(){
    if(!this.dateTimeRange){
      this.snackBar.open('From time not selected', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(!this.dateTimeRange2){
      this.snackBar.open('To time not selected', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    //console.log(this.dateTimeRange,this.dateTimeRange2)
    this.to_date = moment(this.dateTimeRange).format("DDHHmm MMM YY")
    this.from_date = moment(this.dateTimeRange2).format("DDHHmm MMM YY")
    this.spinner.show()
    setTimeout(function(){
      if(this.spinner)
        this.spinner.hide()
    }.bind(this),11000)
    let nn = ""
    if(this.current_selected_rcvr.ship){
      nn = this.current_selected_rcvr.ship
    }
    this.ipc.send("get-chat-print-by-date",{dt1: this.dateTimeRange,dt2:this.dateTimeRange2,rcvr:this.current_selected_rcvr.uid,rcvr_name:nn})
  }
  msg_serial(padding){
    if(this.cur_msg_ser > 65536){
      this.cur_msg_ser = 0
    }
    var hex = this.cur_msg_ser.toString(16)
    if(hex.length < padding){
      while(hex.length < padding){
        hex = "0" + hex
      }
    }
    return hex
  }
  getlen(txt){
    if(txt.length < 2){
      while(txt.length < 2){
        txt = "0" + txt
      }
    }
    return txt
  }
  toggleview(){
    if(this.showall){
      this.showall = false
      this.showprint = true
    }else{
      this.showall = true
      this.showprint =false
    }
  }
  ord(str){return str.charCodeAt(0);}
  crc16_kermit(string1) { 

    let crc = 0; 
    for (var x=0; x < string1.length; x++ ) { 

       crc = crc ^ this.ord( string1[x] ); 
       for (var y = 0; y < 8; y++) { 

          if ( (crc & 0x0001) == 0x0001 ) crc = ( (crc >> 1 ) ^ 0x8408 ); 
          else                             crc =    crc >> 1; 
       } 
    } 

    let lb  = (crc & 0xff00) >> 8; 
    let hb  = (crc & 0x00ff) << 8; 
    crc = hb | lb; 

    let mhex = crc.toString(16)
    if(mhex.length < 4){
      while(mhex.length < 4){
        mhex = "0" + mhex
      }
      return mhex 
    }else{
      return mhex 
    }
 }
 //////////////////////////
 onpinContextMenu(event: MouseEvent, item) {

  event.preventDefault();
  if(item.uid.startsWith('ffff')){
    return
  }
  this.pincontextMenuPosition.x = event.clientX + 'px';
  this.pincontextMenuPosition.y = event.clientY + 'px';
  this.contextMenu.toArray()[0].menuData = { 'pinitem': item };
  this.contextMenu.toArray()[0].menu.focusFirstItem('mouse');
  console.log("selected context data",item)
  
  this.selected_pin_item = item
  this.contextMenu.toArray()[0].openMenu();
 }
 pinContextMenu(item) {
  //alert(`pin unpin`);
  if(this.selected_pin_item){
    this.ipc.send("pin_unpin_user", {uid: this.selected_pin_item.uid,pin:true})
    var gtt = []
    this.rcvrlist.map((item, index) => {
      if(this.selected_pin_item && item.uid ==  this.selected_pin_item.uid)
        item.pin = true;
      gtt.push(item)
      if(index == this.rcvrlist.length - 1){
        this.rcvrlist = gtt
        this.rearrangr_rcvr_list()
      }
    }); 
  }
  this.selected_pin_item = null
 }
 UnpinContextMenu(item) {
    //alert(`pin unpin`);
    if(this.selected_pin_item){
      this.ipc.send("pin_unpin_user", {uid: this.selected_pin_item.uid,pin:false})
      var gtt = []
      this.rcvrlist.map((item, index) => {
        if(this.selected_pin_item && item.uid ==  this.selected_pin_item.uid)
          item.pin = false;
        gtt.push(item)
        if(index == this.rcvrlist.length - 1){
          this.rcvrlist = gtt
          this.rearrangr_rcvr_list()
        }
      }); 
    }
    this.selected_pin_item = null
 }
 rearrangr_rcvr_list(){
  let pin_arr_temp = []
  let unpin_arr_temp = []
  this.rcvrlist.map((mpv,index)=>{
    if(mpv.uid.startsWith('f')){
      pin_arr_temp.push(mpv)
    }
    else if(mpv.pin){
      if(mpv.pin){
        pin_arr_temp.push(mpv)
        console.log("insider true",mpv.pin)
      }else{
        unpin_arr_temp.push(mpv)
      }
    } else{
      unpin_arr_temp.push(mpv)
    }
    if(index == this.rcvrlist.length - 1){
      //console.log("pin arr--", pin_arr_temp)
      this.rcvrlist = []
      this.rcvrlist = pin_arr_temp.concat(unpin_arr_temp)//[yu].concat(pin_arr_temp)
      //this.rcvrlist =  this.rcvrlist.concat(unpin_arr_temp)
    }

  })
 }
 onContextMenu(event: MouseEvent, item: Item) {
  event.preventDefault();
  this.contextMenuPosition.x = event.clientX + 'px';
  this.contextMenuPosition.y = event.clientY + 'px';
  this.contextMenu.toArray()[1].menuData = { 'item': item };
  this.contextMenu.toArray()[1].menu.focusFirstItem('mouse');
  //console.log("selected context data",item)
  this.contextMenu.toArray()[1].openMenu();
 }

  onContextMenuAction1(item: Item) {
    alert(`Click on Action 1 for ${item.name}`);
  }

  onContextMenuAction2(item: Item) {
    alert(`Click on Action 2 for ${item.name}`);
  }
  ///////////////////////////////
  strTohexEncode(m){
    var hex, i;

    const result = new Buffer(m).toString('hex');
    //console.log("string to hex is--", result)
    return result
  }
  play_sound(){
    let audio = new Audio()
    audio.src = "./assets/rr.mp3"
    audio.load()
    audio.play()
  }
}
export interface Item {
  id: number;
  name: string;
}
