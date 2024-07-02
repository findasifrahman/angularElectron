import { Component,NgZone,ElementRef,Renderer2, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('someVar') el:ElementRef;
  inervalclose
  arrlist = [] // main data 
  sendarrList = []
  userlist = []
  serialCount = 0
  
  username = ""
  device_id

  private ipc: IpcRenderer;
  inputText
  self = this;
  sync_time_counter = 1
  intervalclos
  connectState = true
  connecString = ""
  constructor(  private router: Router,private route: ActivatedRoute,zone:NgZone,private snackBar: MatSnackBar, ) { 
    this.self = this
    
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer
        console.log("ipc startttttt")
        //this.arrlist = [{text: "message",time: "21/04/02", left: true}]
        this.ipc.on('connection_state', (event, data) => {
          this.connectState = data.msg
          zone.run(()=>{
            if(data.msg){
              this.connecString = "Connected"
            }else{
              this.connecString = "Disconnected"
            }
          })
        })
        this.ipc.on('ackrcv_data', (event, data) => {
          zone.run(()=>{
            let ssserial = data.msg.serial
            let num_of_sent =  data.msg.response.substr(data.msg.response.indexOf("ackrcv") + 6,1)
            console.log("num of successfull sent....", ssserial, data.msg.response,data.msg.response.indexOf("ackrcv"))
            console.log("num of successfull sent....", num_of_sent)
            let newobj = this.arrlist.map(mapval=>{          
              if(mapval.padserial.includes(ssserial)){
                mapval.ackState = "delivered"
                let obj = mapval                          
              }
              return mapval
            })
            //this.arrlist = newobj
            ///////////////////////////
            let newobj2 = this.arrlist.map((mapval,index)=>{
              //if(mapval._id)
              {
                  if(mapval.padserial == ssserial){
                    if(!isNaN(num_of_sent)){
                      let undue;// = this.props.unsentMessageobj.filter(x=> !x.padserial.includes(ssserial))
                      if(num_of_sent == 2){
                        let resent_count = mapval.resent_count + 1
                        mapval.resent_count = resent_count
                        console.log("ssserial-", ssserial)
                        undue =  this.sendarrList.filter(x=> !x.padserial.includes(ssserial))
                        //console.log("filtered message--", undue)   
                        if(resent_count == 1){
                           this.sendarrList = undue
                            mapval.received = true
                            mapval.pending = false
                            mapval.sent = true
                            //Vibration.vibrate(1 * 500)
                        }
                        
                      }else if(num_of_sent == 1){
                         mapval.pending = false
                         mapval.sent = true  
                         //console.log("mapval.sent is now true")                     
                      }
                      
                    }
                    
                  }
               }
               if(this.arrlist.length == index -1){
                this.arrlist =   newobj2
                //console.log("arrlist at end of arr- ", this.arrlist)
               }
              return mapval

              
            }) 
            this.arrlist =   newobj2
            /////////////////////////////////


          })
        })

        this.ipc.on('ode_data', (event, data) => {
          zone.run(()=>{
            //console.log("ode data--", data.msg)
            let location = data.msg.Location
            if(data.msg.nname && this.device_id !== data.msg.name){
              let newo = {name:data.msg.nname, node_id: data.msg.name, status: data.msg.status, time: data.msg.mtime, isonline:true}
                       
              if(this.userlist.length > 0){
                let contain = this.userlist.filter(x=> !x.node_id.includes(newo.node_id))
                //console.log("contain-", contain)
                if(contain){             
                  contain.push(newo)
                  this.userlist = contain               
                }else{
                  let oldo = this.userlist
                  oldo.push(newo)
                  this.userlist = oldo
                }            
              }else{
                let oldo = this.userlist
                oldo.push(newo)
                this.userlist = oldo
              }
 
            }
  
          })
        })

        this.ipc.on('userdataobj', (event, data) => {
          if(data.msg){
            console.log("userdata recieved--", data.msg)
            zone.run(()=>{
              this.username = data.msg.username
              this.device_id =  data.msg.device_id
            })
            localStorage.setItem("username",data.msg.username)
            localStorage.setItem("device_id", data.msg.device_id)
          }else{         
          }
          
        })
        this.ipc.on('message', (event, data) => {
          // When the message is received...
          zone.run(()=>{
            // the code that requires change detection here, just like below //
            //////////////
           // console.log('Message received', data);
            let init_str_data = 0
            let sender_name_length = parseInt(data.msg.substr(init_str_data  + 5,1), 10)
            //console.log("sender name length--", sender_name_length)
            let str = data.msg.substr(init_str_data)

            let sender_node = str.substr(init_str_data + 4,1)
            if(sender_node == "5"){sender_node = "1"}
            else if(sender_node == "6"){ sender_node = "2"}
            else if(sender_node == "7"){sender_node = "3"}

            let name = str.substr(init_str_data + 6,sender_name_length)
            let serial = str.substr(init_str_data + 6 + sender_name_length, 5)
            let mess_len = str.substr(init_str_data + 11 + sender_name_length)
            let message = str.substr(init_str_data + 11 + sender_name_length, str.length - 16 -  sender_name_length)
            let indexof = message.indexOf("79")
            if(indexof > 0)
              message = message.substr(0,indexof)
            if(name.includes('\n')){
              name = name.substr(0, name.indexOf('\n'))
            }
            let mm = moment().format("YYYY-MM-DD") + " " + message.substr(0,2) + ":" + message.substr(3,2) +  ":" + message.substr(6,2)
           
            let timee =  moment(mm)
            
            //console.log("message--", message)
            //console.log("sender_node--", sender_node)
            //console.log("name--", name)
            //console.log("pad serial--", serial)
            //console.log("timee--", mm)
            /////////////////////////////////
            let newobj = {text: message.substr(10, parseInt(message.substr(8,2))),
              mname: name, sender_node:sender_node, serial: serial,time: mm, left: true,
              alignContent:"left",location: 0, ackState:"pending", color:"#2233cc", 
              resent_count: 0,pending: true,received: false,sent: false, 
              nodeId:sender_node, padserial: serial }
        if(newobj.text && newobj.text != '/n'){
          if(this.arrlist.length > 0 ){
            if(newobj.sender_node == "1" || newobj.sender_node == "2" || newobj.sender_node== "3"){
                    //let lastobj = this.state.listobject[this.state.listobject.length - 1]
                    //console.log("lastobjectttt--", lastobj)
                    //console.log("objj--",obj)
                    let mmtim = moment(mm)
                    let ress = this.arrlist.find(x=> x.mname && x.mname.includes(newobj.mname) && x.nodeId && x.nodeId.includes(newobj.sender_node)
                      && x.text.includes(newobj.text) && x.time.toString().includes(mm) && x.padserial.includes(newobj.serial))
                    
                    let ress1 = this.arrlist.find(x=> x.mname && x.mname.includes(newobj.mname)  && x.nodeId && x.nodeId.includes(newobj.sender_node)
                      && x.text.includes(newobj.text) && x.time.toString().includes(mmtim) && x.padserial.includes(newobj.serial))
                    
                    let ntext = newobj.text + "7"
                    let ress2 = this.arrlist.find(x=> x.mname && x.mname.includes(newobj.mname) && x.nodeId && x.nodeId.includes(newobj.sender_node)
                      && x.text.includes(newobj.text + "7") && x.time.toString().includes(mmtim) && x.padserial.includes(newobj.serial))

                    let ress3 = this.arrlist.find(x=> x.mname && x.mname.includes(newobj.mname) && x.nodeId && x.nodeId.includes(newobj.sender_node)
                      && ntext.includes(x.text) && x.time.toString().includes(mmtim) && x.padserial.includes(newobj.serial))
                  if(!ress && !ress1 && !ress2 && !ress3){
                    let prevarr =   this.arrlist
                    prevarr.push(newobj)
                    this.arrlist = prevarr
                       /// add to database
                    //this.ipc.send('chatdataentry',newobj);   
        
                    var element = document.getElementById("someVar");
                    element.scrollTop = element.scrollHeight;
        
                    this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight
                    /////////
                    let newobj_list = this.userlist.map(mapval=>{
                      if(mapval.node_id == newobj.sender_node){
                        mapval.status = "Mesh Route"
                      }
                      return mapval
                    })
                    this.userlist = newobj_list
                    /////////////
                    
                  }
                }
              }
              else{
                let prevarr =   this.arrlist
                prevarr.push(newobj)
                this.arrlist = prevarr
                              
                /// add to database
                //this.ipc.send('chatdataentry',newobj);   
    
                var element = document.getElementById("someVar");
                element.scrollTop = element.scrollHeight;
    
                this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight

                let newobj_list = this.userlist.map(mapval=>{
                  if(mapval.node_id == newobj.sender_node){
                    mapval.status = "Mesh Route"
                  }
                  return mapval
                })
                this.userlist = newobj_list

              }
            }
            //////////////////////////////////////////

            
            //////////////////
         });


          // ... change the state of this React component.
          //self.setState({name: 'It worked!'});
      });
      } catch (error) {
        throw error;
      }
    } else {
      console.warn('Could not load electron ipc');
    }
  }

  getData() {
    return new Observable<any>(observer => {
      this.ipc.once('getDataResponse', (event, arg) => {
        observer.next(arg);
      });
      ///
      this.ipc.on('message', function (event, data) {
          // When the message is received...
          console.log('Message received', data);
          // ... change the state of this React component.
          //self.setState({name: 'It worked!'});
      });
      ///
      this.ipc.send('getData');
    });
  }

  ngOnInit(){
        $('#action_menu_btn').click(function(){
            $('.action_menu').toggle();
        });
        this.getData()
        /////////////////
        this.inervalclose =  setInterval(function(){
          let undue = this.sendarrList
          if(undue){
              if(undue.length > 0){
                // mthis.setState({noInput: true})
              }
              undue.slice(0).reverse().map((mapval, index)=>{
                if(index < 10 && mapval.sent_count < 10){
                  mapval.sent_count = mapval.sent_count + 1
                  setTimeout(function(){
                    let mmms = mapval.main_data
                    //console.log("sending--", undue)
                    this.ipc.send('getData',mmms);  
                    console.log("failesd message -- ", mapval.main_data)
                  }.bind(this),300)
                  
                }
                if(index >= 10 || index >= (undue.length - 2)){
                  //mthis.setState({noInput: false})
                }
              })
          }
          ///////////////////
        }.bind(this),2000)
        
        ////////////////////////
        this.username =  localStorage.getItem('username')
        this.device_id =  localStorage.getItem('device_id')

        this.route.params.subscribe(params => {
          let uu  = params['user'];
          let ii = params['id'];
          if(uu && ii){
            this.username = params['user'];
            this.device_id = params['id'];
          }
        })

        setTimeout(function(){
          //this.username =  localStorage.getItem("username")
          //this.device_id =  localStorage.getItem("device_id")
          if(!this.username || !this.device_id){
                /////////
                this.snackBar.open('Please set Username and ID', "Remove", {
                  duration: 6000,
                  verticalPosition: 'top',
                  panelClass: ['blue-snackbar']
                });
                this.router.navigate(["/setUser"]);
        
                /////////////
          }
        }.bind(this),8000)
        ////////////////////////////
        this.intervalclos =  setInterval(function() {
                
              let online_count = 0
              let newobj = this.userlist.map(mapval=>{
                var now = moment();//.format('HH:mm:ss'); //todays date
                var yyy = moment().format('YYYY-MM-DD')
                var end = moment(yyy + " " + mapval.time); // another date

                var duration = moment.duration(now.diff(end));
                var mins = duration.asMinutes();

                if(mins > 2){
                  mapval.status = "No Direct Route"
                  mapval.isonline = false
                  console.log("no direct route")
                  console.log("no direct route")
                  console.log("no direct route after 2 minnn")
                }else{                
                }
                
                if(mapval.isonline){
                  online_count++
                  if(online_count >=2){
                    let undue = this.sendarrList
                      if(undue){
                          if(undue.length > 0){
                            // mthis.setState({noInput: true})
                          }
                          undue.slice(0).reverse().map((mapval, index)=>{
                            if(index < 10 && mapval.sent_count < 10){
                              mapval.sent_count = mapval.sent_count + 1
                              setTimeout(function(){
                                let mmms = mapval.main_data
                                //console.log("sending--", undue)
                                this.ipc.send('getData',mmms);  
                                console.log("failesd message -- ", mapval.full)
                              }.bind(this),300)
                              
                            }
                            if(index >= 10 || index >= (undue.length - 2)){
                              //mthis.setState({noInput: false})
                            }
                          })
                      }
                  }
                }
                return mapval
              })
              if(newobj && newobj.length > 0){
                this.userlist =  newobj
              }else{
                this.userlist =  []
              }
            
              //console.log("resultofdb-", resultofdb)
             if(this.connectState == false){
 
              }else{
                let  sync_time_counter= this.sync_time_counter
                if(sync_time_counter > 58 || sync_time_counter == 0){
                  //console.log("Sending sync..")
                  //sendtcp("29syncN" + "\n", this)
                  //this.setState({sync_time_counter:1})
                  this.sync_time_counter = 1
                }else{
                  sync_time_counter++;
                  this.sync_time_counter = sync_time_counter
                }
              
              }
              ///////////////////////////////
            
               
        }.bind(this),2000)
        //////////////////////////
        /*setInterval(function(){
          this.ipc.send('getData');
        }.bind(this),5000)*/

    }
    title = 'electronchat';
    
    FormSubmit(){
      let snt_time = moment().format("HH-mm-ss")//this.pad_time()
      let len = this.inputText.length
      let f_len = ""
      if(len<10){
        f_len = "0" + len.toString()
      }else{
        f_len = len
      }
      if(len > 30){
        this.snackBar.open('Text length more than 30 character', "Remove", {
          duration: 6000,
          verticalPosition: 'top',
          panelClass: ['blue-snackbar']
        });
        return
      }
      let padserial = this.padserial()
      let send_text = "28289" + this.username.length +  this.username + padserial + snt_time + f_len + this.inputText + "7979" + "\n"
      console.log("this.sendText--",send_text)
      let newo = this.sendarrList
      newo.push({main_data:send_text, padserial: padserial,sent_count: 0})
      this.sendarrList = newo
      /////////////////////////
     
      let newobj = {text: this.inputText,
        mname: this.username, sender_node: this.device_id, serial: padserial,
        time: moment().format("MM-DD HH:mm:ss").toString(),
         right: true, alignContent:"right",location: 0, ackState:"pending", color:"#2233cc",
         resent_count: 0,pending: true,received: false,sent: false, padserial: padserial, nodeId: this.device_id}

      /// add to database
      this.ipc.send('chatdataentry',newobj);        
      let prevarr =   this.arrlist
      prevarr.push(newobj)
      this.arrlist = prevarr
      this.inputText = ""
      //////////////////////////

      this.ipc.send('getData',send_text);
      //this.router.navigate(["/map"]);
    }
    gotoSettings(){
      this.router.navigate(["/setUser"]);
    }
    gotoMap(){
      this.router.navigate(["/map"]);
    }

    padserial(){
      this.serialCount = this.serialCount + 1
      let serial =  this.serialCount
      let device_id = this.device_id
      if(device_id){
          if(serial < 10){
            return  device_id + "000" + serial.toString()
          }else if(serial <100){
            return device_id + "00" + serial.toString()
          }else if(serial <1000){
            return device_id + "0" + serial.toString()
          }else if(serial <10000){
            return device_id + "" + serial.toString()
          }else if(serial <100000){
            return  device_id + "000" + serial.toString()
          }else{
            return "00000"
          }
      }else return "00000"
    }
}
