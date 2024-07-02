import { Component,NgZone,ElementRef, ViewChild, 
  OnInit, Inject, QueryList,ViewChildren, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as CryptoJS from 'crypto-js'; 
@Component({
  selector: 'app-long-msg',
  templateUrl: './long-msg.component.html',
  styleUrls: ['./long-msg.component.scss']
})
export class LongMsgComponent implements OnInit {
  @ViewChild('someVar') el:ElementRef;
  @ViewChild("printt") print!: ElementRef;

  pageSize = 2

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  displayedColumns_inbox: string[] = ['subject','buttons'];
  displayedColumns_sent: string[] = ['subject','buttons'];
  displayedColumns_draft: string[] = ['subject','buttons'];
  displayedColumns_archieve: string[] = ['subject','buttons'];
  AllElement_inbox: MatTableDataSource<any>;
  AllElement_sent: MatTableDataSource<any>;
  AllElement_draft: MatTableDataSource<any>;
  //@ViewChildren('draftPaginator') draftPaginator:MatPaginator
  AllElement_archieve: MatTableDataSource<any>;

  //////////////
  all_sy_class = ["UNCLASS","RESTRICTED","CONFIDENTIAL","SECRET","TOP SECRET"]
  all_routine = ["ROUTINE","PRIORITY","IMMEDIATE","FLASH"]
  //////////////////////

  rcvrlist = []
  archieve_list = []
  sentlist = []
  draftlist = []
  inboxlist = []/*[{routine: "Routine",from: "From",to: "To",
    info:"Info", restricted: "Restricted",ref:"Ref", text:"textt", subtext: "textt.substr(0,50)"}
  ]*/
  showInbox = true
  showCompose = false
  showDraft = false
  showUnsent = false
  showSent = false
  showArchieve = false
  showSingleMail = false


  all_long_msg = []

  inputText = ""
  backcol ="p"

  Routine
  From
  To 
  Info
  Restricted
  Ref
  XMT
  DTG
  Send_To
  send_to_arr= [];//[{user:"SMA"},{user: "KVA"}]
  sent_perventage = "0%"

  selectsearchval1

  my_id;// = "0001"
  rcv_id = "ffff"
  enc_byte = "0000"
  end_bit = "91" //+ '\n'

  connectString = "Not Connected"
  my_dev_name
  rcv_my_id_enc_data_shipl
  //long_data_all_str_rcvd

  getACKforStartConfig
  long_msg_termination_ack_rcvd
  long_msg_string_ack_rcvd
  
  //ack_perm_for_long_msg_star_handshake
  ack_perm_for_long_msg_star_handshake_inside_comp
  long_data_all_str_rcvd_inside_comp
  long_data_decrypt_failed

  long_msg_rcv_complete  = false
  diagVisible = false


  finalText = ""

  all_str_sent_complete = false
  cancel_long_data_str_interval

  long_data_start_obj
  long_data_string_arr = []//[{main_data:'',ack_from:[],part_no: '',crc: 'crc_kermit'}]
  start_rcvr_arr_found = [] //["0001","0002",...] this arr holds rcvr list found after ack check
  
  curr_routine
  curr_from
  curr_to
  curr_info = "" //optional
  curr_restricted
  curr_dtg
  curr_xmt = "" // optional
  curr_ref = ""// optional
  
  curr_text

  usergrouplist = []
  rcv_all_long_msg
  get_archieve_list

  rc_str = ""
  dialogRef
  accept_dialogRef 
  accept_dialog_alradyopen = false //var to hold dialog state
  selected_sf_time = 350

  timeoutfor_rcv_msg
  mail_cancelation_grace_period = false // settimeout which is used so that user cannot send a new mail within 4 minutes after it manually cancels a mail
  mail_cancelation_grace_timeout = 60*1000*4 // 4 minute

  just_completed_sent = false

  final_text_witout_enc
  aes_enc_key = "Secret Passphrase"//"1234567812345678123456781234567812345678123456781234567812345678"
  
  /////////////////////////

                          
  private ipc: IpcRenderer;
  public doFilter_inbox = (value: string) => {
    this.AllElement_inbox.filter = value.trim().toLocaleLowerCase();
  }
  public doFilter_sent = (value: string) => {
    this.AllElement_sent.filter = value.trim().toLocaleLowerCase();
  }
  public doFilter_draft = (value: string) => {
    this.AllElement_draft.filter = value.trim().toLocaleLowerCase();
  }
  public doFilter_archieve = (value: string) => {
    this.AllElement_archieve.filter = value.trim().toLocaleLowerCase();
  }
  decrypt_textt (textt){
    return new Promise((resolve,reject)=>{
      var bytes  = CryptoJS.AES.decrypt(textt,  this.aes_enc_key)//.toString();
      textt = bytes.toString(CryptoJS.enc.Utf8)
      resolve(textt)
    })
  }
  long_msg_parse(strrr,obj,is_decrypt): Promise<any>{

    let ro_index = strrr.indexOf("</ro>")
    let Routine = strrr.substr(4, ro_index - 4)
    let fr_index1 = strrr.indexOf("<fr>")
    let fr_index2 = strrr.indexOf("</fr>")
    let From = strrr.substr(fr_index1 + 4, fr_index2 - fr_index1 -4)
    let to_index1 = strrr.indexOf("<to>")
    let to_index2 = strrr.indexOf("</to>")
    let To =  strrr.substr(to_index1 + 4, to_index2 - to_index1 -4)
    let info_index1 = strrr.indexOf("<info>")
    let info_index2 = strrr.indexOf("</info>")
    let Info = strrr.substr(info_index1 + 6, info_index2 - info_index1 -6)
    let rest_index1 = strrr.indexOf('<rest>')
    let rest_index2 = strrr.indexOf('</rest>')
    let Restricted = strrr.substr(rest_index1 + 6,rest_index2 - rest_index1 -6)
    let xmtindex1 = strrr.indexOf('<xmt>')
    let xmtindex2 = strrr.indexOf('</xmt>')
    let Xmt = strrr.substr(xmtindex1 + 5,xmtindex2 - xmtindex1 - 5)
    let dtgindex1 = strrr.indexOf("<dtg>")
    let dtgindex2 = strrr.indexOf("</dtg>")
    let Dtg = strrr.substr(dtgindex1 + 5,dtgindex2 - dtgindex1 - 5 )
    let ref_index1 = strrr.indexOf("<ref>")
    let ref_index2 = strrr.indexOf("</ref>")
    let Ref = strrr.substr(ref_index1 + 5, ref_index2 - ref_index1 - 5)
    
    let isrcvrinlist
    if(obj){
      isrcvrinlist = this.rcvrlist.find(x => x.uid == obj.msg[0].data.sender)
    }
    let recieved_from = ""
    if(isrcvrinlist)
        recieved_from =  isrcvrinlist.ship   
    let textt
    if(obj){
      textt = "<p>" + strrr.substr(ref_index2 + 6) + "</p>"
    }else{
      textt = strrr.substr(ref_index2 + 6) 
    }

      if(Ref == 'undefined'){
        Ref = ""
      }
      if(Dtg == 'undefined'){
        Dtg = ""
      }
      if(Xmt == 'undefined'){
        Xmt = ""
      }
      if(Info == 'undefined'){
        Info = ""
      }
    
      return new Promise((res,rej)=>{
        if(is_decrypt){

          
          setTimeout(function(){
            //console.log("texttt", textt)
            //if(textt)
              res({Routine:Routine,From:From,To:To,Info:Info,Restricted:Restricted,Xmt:Xmt,Dtg:Dtg,Ref:Ref,textt:textt})
          }.bind(this),100)
        }else{
          res({Routine:Routine,From:From,To:To,Info:Info,Restricted:Restricted,Xmt:Xmt,Dtg:Dtg,Ref:Ref,textt:textt})
        }
      })
      //textt  = CryptoJS.AES.decrypt(textt,  this.aes_enc_key)//.toString();
      //textt = bytes.toString(CryptoJS.enc.Utf8)
      //return {Routine:Routine,From:From,To:To,Info:Info,Restricted:Restricted,Xmt:Xmt,Dtg:Dtg,Ref:Ref,textt:textt}
      //return {Routine:Routine,From:From,To:To,Info:Info,Restricted:Restricted,Xmt:Xmt,Dtg:Dtg,Ref:Ref,textt:textt}
  }
  constructor( private cdref: ChangeDetectorRef,private router: Router, public dialog: MatDialog,
    private route: ActivatedRoute,private spinner: NgxSpinnerService,
    zone:NgZone,private snackBar: MatSnackBar,private cdf: ChangeDetectorRef ){
      //////////////////////////////
      this.rcv_all_long_msg = async(event, data) => {
        zone.run(async()=>{
          this.draftlist = []
          this.inboxlist = []
          this.sentlist = []
          //console.log("rcvd allmsg",data.msg)
          data.msg.map(async (mapval,index)=>{
            if(mapval.isdraft == "1"){// means draft msg
              let obj = await this.long_msg_parse(mapval.mtext, null,false)
              this.draftlist.push({id: mapval.id,routine: obj.Routine,from: obj.From,to: obj.To,
                info:obj.Info, restricted: obj.Restricted, dtg: obj.Dtg, xmt: obj.Xmt,
                ref:obj.Ref, text: obj.textt, subtext: obj.textt.substr(0,50),
                recieved_from: ""
              })
              this.AllElement_draft  = new MatTableDataSource(this.draftlist as any);
              this.AllElement_draft.paginator = this.paginator.toArray()[2];
              //this.AllElement_draft.paginator = this.draftPaginator 
              this.cdf.detectChanges;
            }else if(mapval.isinbox == "1"){// means inbox msg
              let rr = this.rcvrlist.find(x=>x.uid == mapval.sender)
              let rv_frr = ""
              if(rr){
                rv_frr = rr.ship
              }
              let obj = await this.long_msg_parse(mapval.mtext, null,true)
              //console.log("inbox", obj)
              this.inboxlist.push({id: mapval.id,routine: obj.Routine,from: obj.From,to: obj.To,
                info:obj.Info, restricted: obj.Restricted, dtg: obj.Dtg, xmt: obj.Xmt,
                ref:obj.Ref, text: obj.textt, subtext: obj.textt.substr(0,50),
                recieved_from: rv_frr,
                mtime: mapval.mtime, 
                showtime: moment(mapval.mtime).format("DDHHmm MMM YY")
              })
              this.AllElement_inbox  = new MatTableDataSource(this.inboxlist as any);
              this.AllElement_inbox.paginator = this.paginator.toArray()[0];
              this.cdf.detectChanges;
            }else if(mapval.issent == "1"){// means sent msg
              
              let rr = this.rcvrlist.find(x=>x.uid == mapval.rcvr)
              let rv_frr = ""
              if(rr){
                rv_frr = rr.ship
              }
              let obj = await this.long_msg_parse(mapval.mtext, null,true)
              //console.log("sentlist--",obj)
              this.sentlist.push({id: mapval.id,routine: obj.Routine,from: obj.From,to: obj.To,
                info:obj.Info, restricted: obj.Restricted, dtg: obj.Dtg, xmt: obj.Xmt,
                ref:obj.Ref, text: obj.textt, subtext: obj.textt.substr(0,50),
                recieved_from: rv_frr,
                mtime: mapval.mtime, 
                showtime: moment(mapval.mtime).format("DDHHmm MMM YY")
              })
              this.AllElement_sent  = new MatTableDataSource(this.sentlist as any);
              this.AllElement_sent.paginator = this.paginator.toArray()[1];
              this.cdf.detectChanges;
            }
            if(index == data.msg.length - 1){
              if(this.draftlist.length == 0){
                this.AllElement_draft  = new MatTableDataSource(this.draftlist as any);
                this.AllElement_draft.paginator = this.paginator.toArray()[2];
                //this.AllElement_draft.paginator = this.draftPaginator 
                this.cdf.detectChanges;
              }
              if(this.sentlist.length == 0){
                this.AllElement_sent  = new MatTableDataSource(this.sentlist as any);
                this.AllElement_sent.paginator = this.paginator.toArray()[1];
                this.cdf.detectChanges;
              }
              if(this.inboxlist.length == 0){
                this.AllElement_inbox  = new MatTableDataSource(this.inboxlist as any);
                this.AllElement_inbox.paginator = this.paginator.toArray()[0];
                this.cdf.detectChanges;
              }
            }
          })
        })
      }
      this.get_archieve_list = (event,data)=>{
        this.archieve_list = []
        zone.run(()=>{
          data.msg.map(async (mapval,index)=>{
            if(mapval.isinbox == "1"){
              //console.log("archieve --", mapval)
                let rr = this.rcvrlist.find(x=>x.uid == mapval.sender)
                let rv_frr = ""
                if(rr){
                  rv_frr = rr.ship
                }
                let obj = await this.long_msg_parse(mapval.mtext, null,true)
                this.archieve_list.push({id: mapval.id,routine: obj.Routine,from: obj.From,to: obj.To,
                  info:obj.Info, restricted: obj.Restricted, dtg: obj.Dtg, xmt: obj.Xmt,
                  ref:obj.Ref, text: obj.textt, subtext: obj.textt.substr(0,50),
                  recieved_from: rv_frr,
                  mtime: mapval.mtime, 
                  showtime: moment(mapval.mtime).format("DDHHmm MMM YY")
                })
                this.AllElement_archieve  = new MatTableDataSource(this.archieve_list as any);
                this.AllElement_archieve.paginator = this.paginator.toArray()[3];
                this.cdf.detectChanges;
            }
            if(index == data.msg.length - 1 || data.msg.length == 0){
              this.spinner.hide()
            
            }
          })
        })
      }
      /*ack permission ack_perm_for_long_msg_star_handshake*/
      this.ack_perm_for_long_msg_star_handshake_inside_comp = (event,data)=>{
        zone.run(()=>{
          console.log("rcvd req to allow trnsmssn")
          if(!this.accept_dialog_alradyopen){
            this.accept_dialog_alradyopen = true
                this.accept_dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                  width: '250px',
                  hasBackdrop: true,
                  disableClose: true,
                  data: "Do you want to accept message from " + this.rcvrlist.find(x=> x.uid == data.sender).ship + " ?"
                });
              this.accept_dialogRef.afterClosed().subscribe(result=>{
      
                //console.log("value of result--",result)
                if(result){
                  this.ipc.send("perm_of_acceptance_long_msg",true)
                  this.spinner.show() // accepted message now wait
                  this.long_msg_rcv_complete = false
                  let timee = data.time//moment(long_data_starting_config.mtime)
                  var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(timee)
                  var d = moment.duration(ms)
                  if(! this.timeoutfor_rcv_msg){
                      this.timeoutfor_rcv_msg = setTimeout(function(){
                        if(!this.long_msg_rcv_complete){
                          this.spinner.hide()
                          this.long_msg_rcv_complete = true
                          this.snackBar.open('Failed to recieve message', "Remove", {
                            duration: 9000,
                            verticalPosition: 'top',
                            panelClass: ['blue-snackbar']
                          });
                          this.ipc.send("rcv_msg_timout_end",true)
                        }
                        
                        
                      //(d.asMinutes() > (1 + Math.ceil((4 * parseInt(this.long_data_start_obj.num_of_part) * .350)/60 )) )
                      }.bind(this),(1 + Math.ceil((4 * parseInt(data.num_of_part) * .350)/60 )  )*60* 1000)
                  }
                  //this.accept_dialogRef.close('Closing')
                }else{
                  this.ipc.send("perm_of_acceptance_long_msg",false)
                  ///
                  this.showSingleMail = false
                  this.showDraft = false
                  this.showUnsent = false
                  this.showSent = false
                  this.showInbox = true
                  this.showArchieve = false
                  this.showCompose = false
                  console.log("Long Msg Canceled....cancel interval")
                  this.all_str_sent_complete = false
                  clearInterval(this.cancel_long_data_str_interval)
                  this.ipc.send('enableTransmitMode',false)
                 
                  this.spinner.hide()
            
                  this.snackBar.open('Mail receive cancelled', "Remove", {
                    duration: 9000,
                    verticalPosition: 'top',
                    panelClass: ['blue-snackbar']
                  });
                  this.dialogRef.close()
                  //this.accept_dialogRef.close('Closing')
                }
              })
              /////////////////////////////////
              setTimeout(function(){
                if(this.accept_dialogRef){     
                  this.accept_dialogRef.close()
                  //this.ipc.send("perm_of_acceptance_long_msg",false)
               

                }
              }.bind(this),22 * 1000)
              setTimeout(function(){
                this.ipc.send("perm_of_acceptance_long_msg",false)
                  
                this.accept_dialog_alradyopen = false // be ready to rcv again
              }.bind(this),50 * 1000)
              /////////////////////////////////////
          }

        })
      } 
      /////////////////////////////////
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
         //console.log("my id,enc,data,ship list rcvd--",data.msg)
          //data.msg = JSON.parse(data.parse)

          this.aes_enc_key = data.msg.enc_key
          

          this.selected_sf_time = data.msg.selected_sf_time
          this.my_id = data.msg.my_id_obj.uid
          this.my_dev_name = data.msg.my_id_obj.ship
          this.connectString = data.msg.my_id_obj.connectionstate
          this.enc_byte = data.msg.enc_key
          this.rcvrlist = data.msg.shipl
          this.rcvrlist  = this.rcvrlist.map(x=> ({...x,
            status:'Offline',state: false}))
          this.usergrouplist = data.msg.usergroup
          //console.log("this.usergrouplist-",this.usergrouplist)
          
          this.send_to_arr = []//this.usergrouplist

          for(const x of this.rcvrlist){
            this.send_to_arr.push({user: x.ship,uid: x.uid, members: null,membar_id: null,no_of_membar: 1})
            
          }
          ///// craete user list
          ///////////////////////
        })
      }
      //////////////////////////// start_config_Ack rcvd
      this.getACKforStartConfig = (event, data) => {
        zone.run(()=>{
          //console.log("long_data_starting_config_obj-",data)
          this.spinner.hide()
          let rc_str = ""
          this.rc_str = ""
          if(data.recieved_from_arr.length == 0){
            this.ipc.send('enableTransmitMode',false)
            //if(!this.inputText)
            {
              this.snackBar.open('Receiver busy/No receiver found. Try again', "Remove", {
                duration: 9000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar']
              });
              return
            }
          }
          data.recieved_from_arr.map((mapval,index)=>{
            rc_str = rc_str +" " +this.rcvrlist.find(x=> x.uid == mapval).ship + " "
            this.rc_str = rc_str
            this.start_rcvr_arr_found.push(mapval)
            if(index == data.recieved_from_arr.length - 1){
              //alert('Following network reciever found. ' + rc_str)
              if (data.state) { // long_data_starting config
                /*const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                  width: '450px',
                  hasBackdrop: true,
                  disableClose: true,
                  data: 'Reciever found. ' + rc_str + '\n' + ' -- ' + this.sent_perventage
                });*/
                
                this.dialogRef = this.dialog.open(EditusersetDialog, {
                  width: '300px',
                  hasBackdrop: true,
                  disableClose: true,
                  data: 'Sending To - ' + rc_str + ' : ' +  this.sent_perventage,
                  //data: 'Reciever found. ' + rc_str + '\n' + ' -- ' + this.sent_perventage
                });
                this.dialogRef.afterClosed().subscribe(result => {
                  if(result){

                  }
                  else{
                    console.log("USER CANCELED THIS MAIL...")
                    ///
                    this.dialogRef.componentInstance.data = 'Sending To - ' + this.rc_str + ' : ' +  this.sent_perventage//{numbers: value};
                    this.showSingleMail = false
                    this.showDraft = false
                    this.showUnsent = false
                    this.showSent = false
                    this.showArchieve = false
                    this.showInbox = true
                    this.showCompose = false
                    this.all_str_sent_complete = true
                    clearInterval(this.cancel_long_data_str_interval)
                    this.ipc.send('enableTransmitMode',false)
                    this.spinner.hide()

                    this.ipc.send("perm_of_acceptance_long_msg",false)
            
                    if( !this.just_completed_sent){
                     
                      this.mail_cancelation_grace_period = true
                      setTimeout(function(){
                        this.mail_cancelation_grace_period = false
                      }.bind(this),this.mail_cancelation_grace_timeout)
                    }
                    this.just_completed_sent = false
                    //////
                  }
                })
                ////////////////////////////////
                /// start send long data
                this.spinner.show()
                var trminal_val = parseInt(this.long_data_start_obj.num_of_part)
                for (var i = 0; i < trminal_val; i++) {
                  let part_no = (i + 1).toString()
                  if (part_no.length < 2) {
                    part_no = '0' + part_no
                  }
                  if (i !== trminal_val - 1) {
                    let main_str = this.my_id + part_no + '42' + this.finalText.substr(i * 42, 42)
                    let crc_kermit = this.crc16_kermit(main_str)
                    var fin_data = "15" + "l5" + main_str + crc_kermit + "91"
                    this.long_data_string_arr.push({ main_data: fin_data, ack_from: [], part_no: part_no,crc: crc_kermit })
                  }
                  else {
                    let wrd_len =  this.finalText.substr(i * 42).length.toString()
                    if(parseInt( wrd_len) < 10){
                      wrd_len = "0" + wrd_len
                    }
                    let main_str = this.my_id + part_no + wrd_len + this.finalText.substr(i * 42, 42)
                    
                    let crc_kermit = this.crc16_kermit(main_str)
                    var fin_data = "15" + "l5" + main_str + crc_kermit + "91"
                    this.long_data_string_arr.push({ main_data: fin_data, ack_from: [], part_no: part_no,crc: crc_kermit })
                    let flag = 0
                    // start data send as array is prepared
                    this.ipc.send('enableTransmitMode',true)
                    let ack1=0;let ack2=0;let ack3=0;let ack4=0;let ack5 =0 
                        
                    let no_of_memebr_to_send =  parseInt(this.send_to_arr.find(x => x.user == this.selectsearchval1 ).no_of_membar)
                    if(no_of_memebr_to_send  == 1){
                      no_of_memebr_to_send = 2
                    }
                    this.cancel_long_data_str_interval = setInterval(function () 
                    {
                      while (this.long_data_string_arr[flag].ack_from.length >= this.start_rcvr_arr_found.length){
                        flag++
                        if (flag == this.long_data_string_arr.length) {
                          flag = 0 // send repetedly . so flag is made 0
                        }//
                        ////////////                  
                      }
    
   
                          this.ipc.send('sendlongData_lora',this.long_data_string_arr[flag].main_data)
                          flag++
                          if (flag == this.long_data_string_arr.length) {
                            flag = 0 // send repetedly . so flag is made 0
                          }    
                          
                          ///  check if all string is rcvd
                          if(this.all_str_sent_complete){
                            this.mail_sent_to_all()
                          }
                          let completed_to_all_sent = 0
                          this.long_data_string_arr.map((mapval, index) => {
                            if (mapval.ack_from.length == this.start_rcvr_arr_found.length) {
                              completed_to_all_sent++
                            }
                            if (completed_to_all_sent == this.long_data_string_arr.length) {
                              console.log("completed from interval")
                              this.mail_sent_to_all()
                              
                            }
                          })
                          let timee = this.long_data_start_obj.time//moment(long_data_starting_config.mtime)
                          var ms = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(timee)
                          var d = moment.duration(ms)
                          if (d.asMinutes() > (1 + Math.ceil((3 * parseInt(this.long_data_start_obj.num_of_part) * .700)/60 )) )//7) 
                          {
                            if(this.cancel_long_data_str_interval && !this.all_str_sent_complete){
                              //console.log("Time limit crossed. cancel interval")
                              clearInterval(this.cancel_long_data_str_interval)
                              this.spinner.hide()
                              this.dialogRef.close()
                              this.ipc.send('enableTransmitMode',false)
                              this.snackBar.open('Failed to deliver mail', "Remove", {
                                duration: 9000,
                                verticalPosition: 'top',
                                panelClass: ['blue-snackbar']
                              });
                              return
                            }
                          }
                        
                    }.bind(this), 350 + (1 * this.selected_sf_time))//800 + (700 * no_of_memebr_to_send  ))
                    //console.log("this.send_to_arr.find(x => x.user == this.selectsearchval1 ).no_of_membar) --is ", this.send_to_arr.find(x => x.user == this.selectsearchval1 ).no_of_membar)
                    //console.log("final long_data string arr--", long_data_string_arr)
                  }
                }
                ///////////////////////////////////data send end
               
              }else{
                alert('No available reciever found. Sorry..')
              }
            }
          })// map arr traverse end
          
        })
      }// get ack from start end
      ////////////////////////////
      this.long_msg_string_ack_rcvd = (event, obj) => {
       //console.log("object crcc is..", obj)
        zone.run(()=>{
                var findobj = this.long_data_string_arr.find(x=> x.crc == obj.crc &&
                  obj.rcvr == this.my_id && x.part_no == obj.part_no)
                if(findobj){
                  //console.log("object found in main strrrrrr")
                  let ack_from = findobj.ack_from
                  let nf = ack_from.find(x=> x == obj.sender)
                  if(!nf){ // if ack is not there
                    ack_from.push(obj.sender)
                    //console.log("ack is new")
                    
                    //this.long_data_string_arr.filter(x=> x != findobj)
                    //let oo = {main_data: findobj.main_data,ack_from: ack_from}
                    //console.log("new array after rcving is", this.long_data_string_arr)
                    let completed_to_all_sent_1 = 0
                    this.long_data_string_arr.map((mapval, index) => {
                      if (mapval.ack_from.length == 1){//this.start_rcvr_arr_found.length) {
                        completed_to_all_sent_1++
                      }
                      if(index == this.long_data_string_arr.length - 1){
                        //onsole.log("Percentage calc -- ",completed_to_all_sent_1,this.long_data_string_arr.length )
                        this.sent_perventage = Math.floor(((completed_to_all_sent_1 / this.long_data_string_arr.length) * 100)).toString() + "%"
                        this.dialogRef.componentInstance.data = 'Sending To - ' + this.rc_str + ' : ' +  this.sent_perventage
                      }
                      if (completed_to_all_sent_1 == this.long_data_string_arr.length) {
                        //console.log("Inside ack termination string")
                        this.mail_sent_to_all()
                        
                        //alert("Message recieved by all in fin")
                      }
                    })
                    ////////////////////////////////////////
                  }
                  
                }
          })
      }
      /**/
      this.long_msg_termination_ack_rcvd = (event,obj) =>{
        zone.run(()=>{
          //console.log("termination string reciever from ", obj.sender)
          if(this.long_data_string_arr.length > 0 &&  this.long_data_string_arr[0].sender == obj.sendHandshakelongData_lora){
            //console.log("all sent complete...")
            if(this.timeoutfor_rcv_msg){

              clearTimeout(this.timeoutfor_rcv_msg)
              this.timeoutfor_rcv_msg = null
            }
            this.mail_sent_to_all()
            /*this.long_data_string_arr.map((mpval,index)=>{
              if(!(mpval.ack_from.find(x=> x == obj.sender))){
                mpval.ack_from.push(obj.sender)
                console.log("pushed from termination string")
              }
              if(index == this.long_data_string_arr.length - 1){
                let completed_to_all_sent = 0
                this.long_data_string_arr.map((mapval, index) => {
                  if (mapval.ack_from.length == 1){//this.start_rcvr_arr_found.length) {
                    completed_to_all_sent++
                  }
                  if (completed_to_all_sent == this.long_data_string_arr.length) {
                    console.log("all sent complete...")
                    this.mail_sent_to_all()
                  }
                })
              }
              return mpval
            })*/
          }
        })
      }
      /* */
      /*
      */
      this.long_data_all_str_rcvd_inside_comp = (event, obj) => {
        setTimeout(function(){
         // console.log("all long data rcvd ")
          this.long_msg_rcv_complete = true
          this.spinner.hide()
          this.snackBar.open('You received a new mail', "Remove", {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar']
          });
          zone.run(()=>{
            let strrr  = ""
            for(let i = 0;i< obj.msg.length ; i++){
              let yuu = obj.msg.find(x=> parseInt(x.data.part_no) == (i + 1))
              if(yuu){
  
                //console.log("all long data rcvd single obj ff",yuu)
                strrr = strrr + yuu.data.text
              }
              if(i == obj.msg.length - 1){
                ////////////////////
                //console.log("final strrr-",strrr)
                if(this.timeoutfor_rcv_msg){
  
                  clearTimeout(this.timeoutfor_rcv_msg)
                  this.timeoutfor_rcv_msg = null
                }
              }
            }
            ///////////////////////
          })
        }.bind(this),10000)

      }
      this.long_data_decrypt_failed = (event,obj) =>{
        zone.run(()=>{
          this.snackBar.open('AES Key Mismatched', "Remove", {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['red-snackbar']
            //////////////////////////////
            ////////////////////////////////////////
          });
          //////////////////////
          setTimeout(function(){
            this.long_msg_rcv_complete = true
            this.spinner.hide()
  
            if(this.timeoutfor_rcv_msg){ 
              clearTimeout(this.timeoutfor_rcv_msg)
              this.timeoutfor_rcv_msg = null
            }
              ///////////////////////
            
          }.bind(this),10000)
          //////////////////////////////////
        })
      }
      ////////////////////////////
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          console.log("ipc startttttt")
          this.ipc.on('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
          this.ipc.on('getACKforStartConfig',this.getACKforStartConfig)

           this.ipc.on('long_msg_termination_ack_rcvd',this.long_msg_termination_ack_rcvd)
          this.ipc.on('rcv_all_long_msg',this.rcv_all_long_msg)
          
           this.ipc.on("long_data_all_str_rcvd_inside_comp",this.long_data_all_str_rcvd_inside_comp)
           this.ipc.on("get_archieve_list",this.get_archieve_list)
           this.ipc.on("long_msg_string_ack_rcvd",this.long_msg_string_ack_rcvd)
           this.ipc.on("long_data_decrypt_failed",this.long_data_decrypt_failed)
           //this.ipc.on('long_data_all_str_rcvd',this.long_data_all_str_rcvd)
         
          //this.ipc.on('ack_perm_for_long_msg_star_handshake',this.ack_perm_for_long_msg_star_handshake)
          //this.arrlist = [{text: "message",time: "21/04/02", left: true}]
          //////////////////////////////////////////

     
        }  catch (error) {
          console.log(error);
        }
      }else {
        console.warn('Could not load electron ipc');
      }
  }
  save_to_draft(){
    if(!this.Routine){
      this.snackBar.open('Precedence is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }


    if(!this.DTG){
      this.snackBar.open('DTG is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }

    if(!this.inputText){
      this.snackBar.open('Input text is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    this.finalText = "<ro>" + this.Routine + "</ro>" + 
    "<fr>" + this.From + "</fr>" +
    "<to>" + this.To + "</to>" + 
    "<info>" + this.Info + "</info>" + 
    "<rest>" + this.Restricted + "</rest>" + 
    "<xmt>" + this.XMT + "</xmt>" + 
    "<dtg>" + this.DTG + "</dtg>" + 
    "<ref>" + this.Ref + "</ref>" +
    this.inputText

    let start = `\u{100}`;
    let end = `\u{10FFF0}`;
    let searchPattern = new RegExp(`[${start}-${end}]`,`g`);
    this.finalText = this.finalText.replace(searchPattern, ``);

    let et = moment().format('YYYY-MM-DD HH:mm:ss')
    let tobj = {sender:"",rcvr:"",mtime: et,text:this.finalText,isDraft: "1"
    ,isinbox: "0",issent: "0",isunsent: "0",isold: "0"}
    this.ipc.send("save_to_long_msg",tobj)

    setTimeout(function(){
      this.spinner.hide()
      this.showDraft = false
      this.showArchieve = false
      this.showUnsent = false
      this.showSent = false
      this.showInbox = true
      this.showCompose = false
      this.showSingleMail = false
    }.bind(this),4000)

    this.spinner.show()


  }
  SelectvalChanged1(event){
    this.selectsearchval1 = event
    //console.log("event-",event, this.selectsearchval1)
  }
  ngOnDestroy(){
    console.log("inside ng on destroy")
    this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    //this.ipc.removeListener('long_data_all_str_rcvd',this.long_data_all_str_rcvd)
    //this.ipc.removeListener('ack_perm_for_long_msg_star_handshake',this.ack_perm_for_long_msg_star_handshake)
    this.ipc.removeListener("ack_perm_for_long_msg_star_handshake_inside_comp",this.ack_perm_for_long_msg_star_handshake_inside_comp)
    this.ipc.removeListener("long_data_all_str_rcvd_inside_comp",this.long_data_all_str_rcvd_inside_comp)
       
    
    this.ipc.removeListener('getACKforStartConfig',this.getACKforStartConfig)
    this.ipc.removeListener('long_msg_string_ack_rcvd',this.long_msg_string_ack_rcvd)
    this.ipc.removeListener('long_msg_termination_ack_rcvd',this.long_msg_termination_ack_rcvd)
    this.ipc.removeListener('rcv_all_long_msg',this.rcv_all_long_msg)
    this.ipc.removeListener('get_archieve_list',this.get_archieve_list )
    this.ipc.removeListener('long_data_decrypt_failed',this.long_data_decrypt_failed)
    
  }
  ngOnInit(): void {
    //this.ipc.send("send_online_offline_state",true)
 


    this.AllElement_inbox  = new MatTableDataSource(this.inboxlist as any);
  
    this.AllElement_sent  = new MatTableDataSource(this.sentlist as any);

    this.AllElement_draft  = new MatTableDataSource(this.draftlist as any);

    //this.AllElement_draft.paginator = this.draftPaginator 
   
    this.AllElement_archieve  = new MatTableDataSource(this.archieve_list as any);

   
  }
  ngAfterContentChecked() {
    this.backcol = localStorage.getItem('back_col_val')
    this.cdref.detectChanges();
    
  }
  ngAfterViewInit(){

    this.ipc.send('send_my_id_enc_data_shipl',true);
    setTimeout(function(){
      this.ipc.on("ack_perm_for_long_msg_star_handshake_inside_comp",this.ack_perm_for_long_msg_star_handshake_inside_comp)
        
      this.ipc.send('send_long_msg_list',true);
    }.bind(this),3000)
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
  onkeydown(event){
    event.preventDefault()
  }
  FormSubmit(){
    if(this.mail_cancelation_grace_period){
      this.snackBar.open('You just canceled a mail. Wait for a while to send again', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(!this.selectsearchval1){
      this.snackBar.open('Please select a receiver', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(!this.Routine){
      this.snackBar.open('Precedence is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(!this.From){
      this.snackBar.open('From field is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(!this.To){
      this.snackBar.open('To field is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    /*if(!this.Info){
      this.snackBar.open('Info Field is Empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }*/
    if(!this.Restricted){
      this.snackBar.open('Sy Classification field is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(!this.DTG){
      this.snackBar.open('DTG is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }

    if(!this.inputText){
      this.snackBar.open('Input text is empty', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    if(this.inputText.length > 4000){
      this.snackBar.open('Please reduce text length ', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    this.sent_perventage = "0%"
    let inputText1 = this.inputText.replace(/(?:\r\n|\r|\n)/g, '<br>');
    

    // we can't use these in a regexp directly, unfortunately
    let start = `\u{100}`;
    let end = `\u{10FFF0}`;
    let searchPattern = new RegExp(`[${start}-${end}]`,`g`);
    inputText1 = inputText1.replace(searchPattern, ``);

    let encrypted_text = CryptoJS.AES.encrypt(inputText1.trim(), this.aes_enc_key,
    this.final_text_witout_enc = "<ro>" + this.Routine + "</ro>" + 
    "<fr>" + this.From + "</fr>" +
    "<to>" + this.To + "</to>" + 
    "<info>" + this.Info + "</info>" + 
    "<rest>" + this.Restricted + "</rest>" + 
    "<xmt>" + this.XMT + "</xmt>" + 
    "<dtg>" + this.DTG + "</dtg>" + 
    "<ref>" + this.Ref + "</ref>" +
    inputText1
    /*{
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    } */
    ).toString();  
    setTimeout(function(){   
        let num_of_part
        this.finalText = "<ro>" + this.Routine + "</ro>" + 
          "<fr>" + this.From + "</fr>" +
          "<to>" + this.To + "</to>" + 
          "<info>" + this.Info + "</info>" + 
          "<rest>" + this.Restricted + "</rest>" + 
          "<xmt>" + this.XMT + "</xmt>" + 
          "<dtg>" + this.DTG + "</dtg>" + 
          "<ref>" + this.Ref + "</ref>" +
          encrypted_text//inputText1
        /////////////////////////////////////////////
        //console.log("final selected user is-- ", this.send_to_arr.find(x=>x.user == this.selectsearchval1 ).uid)
        this.getACKforStartConfig
        //this.long_msg_string_ack_rcvd = null

        this.all_str_sent_complete = false
        this.cancel_long_data_str_interval = null

        this.long_data_start_obj = null
        this.long_data_string_arr = []//[{main_data:'',ack_from:[],part_no: '',crc: 'crc_kermit'}]
        this.start_rcvr_arr_found = [] //["0001","0002",...] this arr holds rcvr list found after ack check
        /////////////////////////
        if (this.finalText.length < 42) {
          num_of_part = '01'
        } else {
          num_of_part = parseInt(((this.finalText.length / 42) + 1).toString()).toString()
        }
        if (num_of_part.length < 2) {
          num_of_part = '0' + num_of_part
        }
        if(parseInt(num_of_part) > 99 ){
          this.snackBar.open('Please reduce text length ', "Remove", {
            duration: 6000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar']
          });
          return
        }
        let mtime = moment().format('HHmmss')
        let main_str = num_of_part + this.my_id + this.send_to_arr.find(x=>x.user== this.selectsearchval1 ).uid 
          + mtime //+ this.enc_byte;
        let crc = this.crc16_kermit(main_str)
        let fin_data = '15' + 'l1' + main_str + crc + '91'
        //console.log("fin data initial long str -- ", fin_data)
        
        this.long_data_start_obj = {
          raw_data : fin_data,
          start: fin_data.substr(0,2),num_of_part:fin_data.substr(4,2), 
                sender:fin_data.substr(6,4), rcvr: fin_data.substr(10,4),
                mtime: fin_data.substr(14,6), time: moment(moment().format('YYYY-MM-DD') + ' ' + fin_data.substr(14, 2) + ':' + fin_data.substr(16, 2) + ':' + fin_data.substr(18, 2),
                'YYYY-MM-DD HH:mm:ss'), enc: "",//fin_data.substr(20,4),
                crc: fin_data.substr(20,4)
        }
          
        ////////////////////
        this.ipc.send("perm_of_acceptance_long_msg",false)
        //////////////////////////
        let int_flag = 0
        var myinclose = setInterval(function () {
          this.ipc.send('sendHandshakelongData_lora',fin_data);
          int_flag = int_flag + 1
          if (int_flag > 22) {
            //console.log("interval cleared.. long_data_starting_config")
            //// now ask for ack....
            this.ipc.send('sendACKforStartConfig',true);
            clearInterval(myinclose)
          }
        }.bind(this), 2 * this.selected_sf_time)//2500)
        this.spinner.show()
      /* setTimeout(function(){
          this.spinner.hide()
        }.bind(this),1000 * 60)*/
        this.ipc.send('sendHandshakelongData_lora',fin_data);
    }.bind(this),100)
  }
  ///////////////////////////
  inbox_msg_clicked(i){

    //console.log("index clicked -- ")
    this.curr_routine =  i.routine 
    this.curr_from =  i.from
    this.curr_to =  i.to
    this.curr_info = i.info // optional
    this.curr_restricted = i.restricted
    this.curr_ref = i.ref // optional
    this.curr_text =  i.text
    this.curr_dtg = i.dtg
    this.curr_xmt = i.xmt // optional

    this.showSingleMail = true
    this.showDraft = false
    this.showArchieve = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showCompose = false
  } 
  sent_msg_clicked(i){
    //console.log("sent clicked -- ", i)
    this.curr_routine =  i.routine 
    this.curr_from =  i.from
    this.curr_to =  i.to
    this.curr_info = i.info // optional
    this.curr_restricted = i.restricted
    this.curr_ref = i.ref // optional
    this.curr_text =  i.text
    this.curr_dtg = i.dtg
    this.curr_xmt = i.xmt // optional

    this.showSingleMail = true
    this.showDraft = false
    this.showArchieve = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showCompose = false
  }
  draft_msg_clicked(i){
    this.showSingleMail = false
    this.showDraft = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showArchieve = false
    this.showCompose = true
    ///////////////////////
    this.Routine = i.routine,
    this.From = i.from
    this.To = i.to,
    this.Info = i.info,
    this.Restricted= i.restricted 
    this.DTG = i.dtg
    this.XMT = i.xmt,
    this.Ref = i.ref
    this.inputText= i.text

  }
  archieve_msg_clicked(i){
    //console.log("archieve clicked -- ", i)
    this.curr_routine =  i.routine 
    this.curr_from =  i.from
    this.curr_to =  i.to
    this.curr_info = i.info // optional
    this.curr_restricted = i.restricted
    this.curr_ref = i.ref // optional
    this.curr_text =  i.text
    this.curr_dtg = i.dtg
    this.curr_xmt = i.xmt // optional

    this.showSingleMail = true
    this.showDraft = false
    this.showArchieve = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showCompose = false
  }
  //////////////////////////////
  compose_pressed(){
    this.inputtext_length = "0"

    this.showDraft = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showArchieve = false
    this.showCompose = true
    this.showSingleMail = false

    this.Routine = ""
    this.From = ""
    this.To = ""
    this.Info = ""
    this.Restricted= ""
    this.DTG = ""
    this.XMT = ""
    this.Ref = ""
    this.inputText= ""
  }
  inbox_pressed(){
    this.showDraft = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = true
    this.showCompose = false
    this.showSingleMail = false
    this.showArchieve = false
  }
  sent_pressed(){
    this.showDraft = false
    this.showUnsent = false
    this.showSent = true
    this.showInbox = false
    this.showCompose = false
    this.showSingleMail = false
    this.showArchieve = false


  }
  unsent_pressed(){
    this.showDraft = false
    this.showUnsent = true
    this.showSent = false
    this.showInbox = false
    this.showCompose = false
    this.showSingleMail = false
    this.showArchieve = false
  }
  draft_pressed(){
    this.showDraft = true
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showCompose = false
    this.showSingleMail = false
    this.showArchieve = false
  }
  archieve_pressed(){
    this.showDraft = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showCompose = false
    this.showSingleMail = false
    this.showArchieve = true
    this.spinner.show()
    setTimeout(function(){
      this.spinner.hide()
    }.bind(this),7000)
    this.ipc.send("retrieve-archieve",true)
  }
  onForward(i,mtime,sender,dtg){
    this.showSingleMail = false
    this.showDraft = false
    this.showUnsent = false
    this.showSent = false
    this.showInbox = false
    this.showArchieve = false
    this.showCompose = true
    ///////////////////////
    this.Routine = i.routine,
    this.From = i.from
    this.To = i.to,
    this.Info = i.info,
    this.Restricted= i.restricted 
    this.DTG = i.dtg
    this.XMT = i.xmt,
    this.Ref = i.ref
    this.inputText= i.text
  }
  onDelete_inbox(id,mtime,sender,dtg){
    this.delete_mail(id)
  }
  onDeletedraft(id,mtime,sender,dtg){
    this.delete_mail(id)
  }
  onDeletesent(id,mtime,sender,dtg){
    this.delete_mail(id)
  }
  onDeletearchieve(id,mtime,sender,dtg){
    this.delete_mail(id)
  }
  delete_mail(id){
    if(id){
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '450px',
        hasBackdrop: true,
        data: "Are you sure you want to delete this Mail?"
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.ipc.send('mail-delete',id)
          this.spinner.show()
          setTimeout(function(){
            this.spinner.hide()
          }.bind(this),5000)
        }
      })
    }
  }
  /*print_mail(cmpName){
    var divContents = document.getElementById("printcomponent1").innerHTML;
    var a = window.open('', '', 'height=500, width=500');
    a.document.write('<html>');
    a.document.write('<body style="display:inline-block">');
    a.document.write(divContents);
    a.document.write('</body></html>');
    a.document.close();
    a.print();


  }*/
  triggerPrint(){
    
    this.print.nativeElement.click();
 
  }
  add_to_sentlist(){
    // add to sentlist

    let et = moment().format('YYYY-MM-DD HH:mm:ss')
    let tobj = {sender:this.my_id,rcvr: this.send_to_arr.find(x=>x.user== this.selectsearchval1 ).uid,mtime: et, 
      text:this.final_text_witout_enc,
      isDraft: "0"
    ,isinbox: "0",issent: "1",isunsent: "0",isold: "0"}
    this.ipc.send("save_to_long_msg",tobj)


    //this.sentlist.push()
  }
  mail_sent_to_all(){
    if(! this.all_str_sent_complete)
    {
      this.sent_perventage = "100%"
      this.dialogRef.componentInstance.data = 'Sending To - ' + this.rc_str + ' : ' +  this.sent_perventage//{numbers: value};
      this.showSingleMail = false
      this.showDraft = false
      this.showUnsent = false
      this.showSent = false
      this.showInbox = true
      this.showCompose = false
      this.showArchieve = false
      console.log("all data sent complete....cancel interval")
      this.all_str_sent_complete = true
      clearInterval(this.cancel_long_data_str_interval)
      if(this.timeoutfor_rcv_msg){

        clearTimeout(this.timeoutfor_rcv_msg)
        this.timeoutfor_rcv_msg = null
      }
      this.ipc.send('enableTransmitMode',false)

      this.spinner.hide()
      this.add_to_sentlist()

      this.just_completed_sent = true
      this.snackBar.open('Mail Sent', "Remove", {
        duration: 9000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      this.dialogRef.close()
    }
    ////

    /////
  }
  inputtext_length = "0/4000"
  inputTextOnChange(){
    var int_len = this.inputText.length
    if(this.inputText.length > 2000){
      int_len =  2000 + ((this.inputText.length - 2000) * 2 )
    }
    this.inputtext_length = ((this.Routine ? this.Routine.length : 0) + (this.From ? this.From.length : 0) + (this.To ? this.To.length : 0) +
      (this.Restricted ?  this.Restricted.length : 0) + (this.XMT ? this.XMT.length : 0) + (this.DTG ? this.DTG.length : 0) + (this.Ref ? this.Ref.length : 0)  + 
      + (this.Info ? this.Info.length : 0) + 
     int_len ).toString() + "/4000"
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

}


export interface DialogData {
  isgps: string;
}

@Component({
  selector: 'edituserset-dialog',
  templateUrl: '../dialogmodals/edituserset.html',
})
export class EditusersetDialog {
  constructor(
    public dialogRef: MatDialogRef<EditusersetDialog>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

