import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit } from '@angular/core';
import { IpcRenderer } from 'electron';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-offmap',
  templateUrl: './offmap.component.html',
  styleUrls: ['./offmap.component.scss']
})
export class OffmapComponent implements AfterViewInit {
  private map
  private ipc: IpcRenderer;
  pos_arr:any = []
  rcvrlist = []
  markers: any = {}
  backcol ="p"
  rcv_my_id_enc_data_shipl
  own_gps_data
  status_msg_map
  my_id
  myinterval

  pointList_0001 = []
  pointList_0002 = []
  pointList_0003 = []
  pointList_0004 = []
  pointList_0005 = []
  pointList_0006 = []
  my_id_gps_list = []
  //my_id_gps = []
  layerGroup;// = L.layerGroup().addTo(this.map);

  /////////////long msg var
  accept_dialog_alradyopen
  accept_dialogRef 


  selected_id = ""
  id_arr = []
  pointList_ : any[];
  isgps = true
  id
  Forms: FormGroup;
  location_state_text = ""

  rcv_single_gps
  return_user_set_obj
  user_set_update_success
  all_gps_saved = []
  constructor(zone:NgZone,private snackBar: MatSnackBar,
    public dialog: MatDialog,  private _router: Router )  {
      this.pointList_ = []
      //////////////////////////////////////////////////
      this.rcv_single_gps = (event, data) => {
        zone.run(()=>{
          //console.log("all gps data rcvd")
          //////////////
          /////////////////////////////////create poly with prev data
          if(this.layerGroup)
            this.layerGroup.clearLayers()

          let my_id_gps = []

          this.pointList_ = []
          //this.id_arr = []
          data.msg.single_all_gps.map((mapval,index)=>{
            if(moment(mapval.mtime).isValid){
              mapval.mtime = moment(mapval.mtime)

                const isLat =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                const isLon =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                if(isLat && isLon){ 
                  if(this.pointList_ && this.pointList_.length > 1 ){
                    let findist = this.distance(this.pointList_[this.pointList_.length -1].lat,
                      this.pointList_[this.pointList_.length -1].long,
                      mapval.lat,mapval.long)

                      var ms = moment(moment(mapval.mtime).
                          format('YYYY-MM-DD HH:mm:ss')).
                          diff(moment(this.pointList_[this.pointList_.length -1].mtime)) 
                      var d = moment.duration(ms)
                      //console.log("inside arr")
                      if(d.asMinutes() < 5){
                        if(findist > 5){
                          console.log("discard invalid gps value")
                        }
                        else{
                          this.pointList_.push(mapval)
                          //console.log("val of pointlist", this.pointList_.length)
                        }
                      }
                      else{
                        this.pointList_.push(mapval)
                        //console.log("val of pointlist", this.pointList_.length)
                      }
                  }else{
                    this.pointList_.push(mapval)
                    //console.log("val of pointlist", this.pointList_.length)
                    //console.log(this.pointList_,this.pointList_[mapval.uid])
                  }

                }
            }
            const customOptions = {
              'className': 'class-popup' // name custom popup,
            }
            if(index >=data.msg.single_all_gps.length - 1){

              setTimeout(function(){
                  var tmplist = []
                  this.pointList_.map((mp,index)=>{
                    //this.pointList_[mp.uid].push(new L.LatLng(mp.lat,mp.long))
                    tmplist.push(new L.LatLng(mp.lat,mp.long))
                    if(index >= this.pointList_.length - 1){
                      var oranIcon

                      var firstpolyline = new L.Polyline(tmplist, {
                        color: 'green',
                        weight: 3,
                        opacity: 0.9,
                        smoothFactor: 1
                      });
                      firstpolyline.addTo(  this.layerGroup)//this.map);
                        
                      //////// all gps marker
                      if(data.msg.all_gps.length > 0){
                        //console.log("data.msg.all_gps",data.msg.all_gps)
                         let my_id_gps_obj = data.msg.all_gps.find(x=> x.uid == this.my_id)
                         //console.log("my_id_gps_obj", my_id_gps_obj )
                         if(my_id_gps_obj  && my_id_gps_obj.mtime){
                           if(moment(my_id_gps_obj.mtime).isValid){
                             const isLat =  isFinite(my_id_gps_obj.lat) && Math.abs(my_id_gps_obj.lat) <= 90;
                             const isLon =  isFinite(my_id_gps_obj.long) && Math.abs(my_id_gps_obj.long) <= 180;
                             if(isLat && isLon){
                               //this.addmarker(my_id_gps_obj.lat,my_id_gps_obj.long,moment(my_id_gps_obj.mtime),my_id_gps_obj.uid,my_id_gps_obj.lat,my_id_gps_obj.long)
                               setTimeout(function(){   
                                 data.msg.all_gps.map((mapval,index)=>{
                                   if(mapval.mtime){
                                     if(moment(mapval.mtime).isValid){
                                       mapval.mtime = moment(mapval.mtime)
                                       //if(this.my_id == mapval.uid)
                                       {
                                         const isLat1 =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                                         const isLon1 =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                                         if(isLat1 && isLon1){
                                           this.addmarker(mapval.lat,mapval.long,mapval.mtime,mapval.uid,my_id_gps_obj.lat,my_id_gps_obj.long)
                                         }
                                       }
                                     }
                       
                                   }
                                 })
                               }.bind(this),10)
                             }
                           }
                         }else{//if my_id not present
                            data.msg.all_gps.map((mapval,index)=>{
                              if(mapval.mtime){
                                if(moment(mapval.mtime).isValid){
                                  mapval.mtime = moment(mapval.mtime)
                                  //if(this.my_id == mapval.uid)
                                  {
                                    const isLat1 =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                                    const isLon1 =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                                    if(isLat1 && isLon1){
                                      this.addmarker(mapval.lat,mapval.long,mapval.mtime,mapval.uid,mapval.lat,mapval.long)
                                    }
                                  }
                                }
                  
                              }
                            })
                            //////////////
                         }
                       }
                      ///////// end hhh
                    }
                  })
                 // this.gps_draw_track(this.pointList_[mm],my_id_gps,customOptions)
                
              }.bind(this),2000)
            }

          })

          //////////////////////////////////

        })
      }// end of definition for single gps
      //////////////////////////////////////////////////////////////
      this.rcv_my_id_enc_data_shipl = (event, data) => {
        zone.run(()=>{
          this.pos_arr.push({id:data.msg.my_id_obj.uid, self: true})
          this.rcvrlist = data.msg.shipl
          this.rcvrlist  = this.rcvrlist.map(x=> ({...x,status:'Offline',state: false}))
          data.msg.shipl.map(mapval=>{
            this.pos_arr.push({id: mapval.uid, self: false})
          })
          this.my_id = data.msg.my_id_obj.uid
          /////////////////////////////////create poly with prev data
          if(this.layerGroup)
            this.layerGroup.clearLayers()

          /*
          start test
          */
         this.all_gps_saved = data.msg.all_gps
         if(data.msg.all_gps.length > 0){
           //console.log("data.msg.all_gps",data.msg.all_gps)
            let my_id_gps_obj = data.msg.all_gps.find(x=> x.uid == this.my_id)
            //console.log("my_id_gps_obj", my_id_gps_obj )
            if(my_id_gps_obj  && my_id_gps_obj.mtime){
              if(moment(my_id_gps_obj.mtime).isValid){
                const isLat =  isFinite(my_id_gps_obj.lat) && Math.abs(my_id_gps_obj.lat) <= 90;
                const isLon =  isFinite(my_id_gps_obj.long) && Math.abs(my_id_gps_obj.long) <= 180;
                if(isLat && isLon){
                  //this.addmarker(my_id_gps_obj.lat,my_id_gps_obj.long,moment(my_id_gps_obj.mtime),my_id_gps_obj.uid,my_id_gps_obj.lat,my_id_gps_obj.long)
                  setTimeout(function(){   
                    data.msg.all_gps.map((mapval,index)=>{
                      if(mapval.mtime){
                        if(moment(mapval.mtime).isValid){
                          mapval.mtime = moment(mapval.mtime)
                          //if(this.my_id == mapval.uid)
                          {
                            const isLat1 =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                            const isLon1 =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                            if(isLat1 && isLon1){
                              this.addmarker(mapval.lat,mapval.long,mapval.mtime,mapval.uid,my_id_gps_obj.lat,my_id_gps_obj.long)
                            }
                          }
                        }
          
                      }
                    })
                  }.bind(this),10)
                }
              }
            }else{
              data.msg.all_gps.map((mapval,index)=>{
                if(mapval.mtime){
                  if(moment(mapval.mtime).isValid){
                    mapval.mtime = moment(mapval.mtime)
                    //if(this.my_id == mapval.uid)
                    {
                      const isLat1 =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                      const isLon1 =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                      if(isLat1 && isLon1){
                        this.addmarker(mapval.lat,mapval.long,mapval.mtime,mapval.uid,mapval.lat,mapval.long)
                      }
                    }
                  }
    
                }
              })
            }
            ///if myid gps not present 
            /////////
          }


         /*
         end testtt
         */

          ////////////////////////////////
        
        
         
        })
      }
      this.return_user_set_obj = (event, data) => {
        zone.run(()=>{
          //console.log("user set val is --", data.msg)
          this.id = data.msg.id
          if(data.msg.isgps == "1"){
            this.isgps = true
            this.location_state_text = "Location On"
          }else{
            this.isgps = false
            this.location_state_text = "Location Off"
          }
        })
      }
      this.user_set_update_success = (event, data) => {
        zone.run(()=>{
          this.snackBar.open('Data updated successfully', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
          //this._router.navigate(['/']);
        })
      }
      //////////////////////////////////////
      ///////////////////////////////////
      if ((<any>window).require) {
        try {

          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('rcv_my_id_enc_data_shipl', this.rcv_my_id_enc_data_shipl)
          this.ipc.on('rcv_single_gps', this.rcv_single_gps) 
          this.ipc.on('return_user_set_obj', this.return_user_set_obj)
       
          this.ipc.on('user_set_update_success', this.user_set_update_success)
          
        }catch(e){}
      }
  }
  
  initMap(): void{
    var bounds = new L.LatLngBounds(new L.LatLng(22.858,92.297), new L.LatLng(17.53751,86.58411))
    this.map = L.map('map',{
      center: [22.3569,91.7832],//bounds.getCenter(),//[22.3569,91.7832],
      zoom: 12,

      //maxBounds : bounds,
      //maxBoundsViscosity: 0.75
    })

    const tiles = L.tileLayer(
      'assets/maps/{z}/{x}/{y}.png'
      //'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ,{
        maxZoom:13,
        minZoom: 8
       }
    )
    tiles.addTo(this.map)
    this.layerGroup = L.layerGroup({
      contextmenu: true,
      contextmenuWidth: 140,
      contextmenuItems: [{
          text: 'show Track',
          index: 0
        }, {
          separator: 'Marker item',
          index: 1
        }],
    }).addTo(this.map);

    /*this.layerGroup.on('mouseover mousemove', function(e){
      var hover_bubble = new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
        .setContent(feature.properties.name)
        .setLatLng(e.latlng)
        .openOn(rrose_map);
    });
    this.layerGroup.on('mouseout', function(e){ rrose_map.closePopup() });*/
  }
  ngOnDestroy(){
    console.log("inside ng on destroy")
    clearInterval(this.myinterval)
    this.ipc.removeListener('rcv_my_id_enc_data_shipl',this.rcv_my_id_enc_data_shipl)
    this.ipc.removeListener('rcv_single_gps',this.rcv_single_gps)
    this.ipc.removeListener('user_set_update_success', this.user_set_update_success)
    this.ipc.removeListener('return_user_set_obj',this.return_user_set_obj)
     
    setTimeout(function(){
      this.map.off();
      this.map.remove();
    }.bind(this),500)
    
  }
  ngAfterViewInit(): void {
    this.initMap()
   /* var marker = L.marker([22.3569,91.7832]).addTo(this.map);
    var marker2 = L.marker([22.340617,91.784651]).addTo(this.map);
    var pointA = new L.LatLng(22.3569,91.7832);
    var pointB = new L.LatLng(22.340617,91.784651);
    var pointC = new L.LatLng(22.338025,91.791742);
    var pointList = [pointA, pointB,pointC];
      var firstpolyline = new L.Polyline(pointList, {
        color: 'green',
        weight: 3,
        opacity: 0.9,
        smoothFactor: 1
    });
    firstpolyline.addTo(this.map);*/
  }
  ngOnInit(): void {
    this.ipc.send('send_my_id_enc_data_shipl',true);
    this.ipc.send("get-current_user_set_obj",true)
    this.myinterval = setInterval(function(){
      this.ipc.send('send_my_id_enc_data_shipl',true);
      if(this.selected_id){
        let id =  this.selected_id
  
        setTimeout(function(){
          this.ipc.send('send_single_gps',id);
        }.bind(this),500)
        //this.router.navigate(['/singleroute',id])
      }
    }.bind(this),60000 * 2)
  }
  edituseerset(){
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, You want to change location status?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        if(this.isgps){
          
          this.ipc.send("edit-user-set",{isgps: 1,id: this.id})
        }else{
          this.ipc.send("edit-user-set",{isgps: 0,id: this.id})
        }
      }
    })
  }
  onNoClick(){
    //this.router.navigate(['/'])
  }
  cleartrack(){
    //this.selected_id = ""
    /////////////////////////////

    if(this.layerGroup)
      this.layerGroup.clearLayers()

    /*
    start test
    */

   if( this.all_gps_saved.length > 0){
     //console.log("data.msg.all_gps",data.msg.all_gps)
      let my_id_gps_obj =    this.all_gps_saved.find(x=> x.uid == this.my_id)
      //console.log("my_id_gps_obj", my_id_gps_obj )
      if(my_id_gps_obj  && my_id_gps_obj.mtime){
        if(moment(my_id_gps_obj.mtime).isValid){
          const isLat =  isFinite(my_id_gps_obj.lat) && Math.abs(my_id_gps_obj.lat) <= 90;
          const isLon =  isFinite(my_id_gps_obj.long) && Math.abs(my_id_gps_obj.long) <= 180;
          if(isLat && isLon){
            //this.addmarker(my_id_gps_obj.lat,my_id_gps_obj.long,moment(my_id_gps_obj.mtime),my_id_gps_obj.uid,my_id_gps_obj.lat,my_id_gps_obj.long)
            setTimeout(function(){   
              this.all_gps_saved.map((mapval,index)=>{
                if(mapval.mtime){
                  if(moment(mapval.mtime).isValid){
                    mapval.mtime = moment(mapval.mtime)
                    //if(this.my_id == mapval.uid)
                    {
                      const isLat1 =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                      const isLon1 =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                      if(isLat1 && isLon1){
                        this.addmarker(mapval.lat,mapval.long,mapval.mtime,mapval.uid,my_id_gps_obj.lat,my_id_gps_obj.long)
                      }
                    }
                  }
    
                }
              })
            }.bind(this),10)
          }
        }
      }else{
        this.all_gps_saved.map((mapval,index)=>{
          if(mapval.mtime){
            if(moment(mapval.mtime).isValid){
              mapval.mtime = moment(mapval.mtime)
              //if(this.my_id == mapval.uid)
              {
                const isLat1 =  isFinite(mapval.lat) && Math.abs(mapval.lat) <= 90;
                const isLon1 =  isFinite(mapval.long) && Math.abs(mapval.long) <= 180;
                if(isLat1 && isLon1){
                  this.addmarker(mapval.lat,mapval.long,mapval.mtime,mapval.uid,mapval.lat,mapval.long)
                }
              }
            }

          }
        })
      }
      ///if myid gps not present 
      /////////
    }
    /////////////////////////////////////
  }
  distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        //if (unit=="K") { dist = dist * 1.609344 }
        //if (unit=="N") { dist = dist * 0.8684 }
        return ((dist * 0.8684).toFixed(2)).toString()//dist;
    }
  }

  toDegreesMinutesAndSeconds(coordinate) {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return degrees + " " + minutes + " " + seconds;
  }

  convertDMS(lat, lng) {
    var latitude = this.toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = lat >= 0 ? "N" : "S";

    var longitude = this.toDegreesMinutesAndSeconds(lng);
    var longitudeCardinal = lng >= 0 ? "E" : "W";

    return latitude + " " + latitudeCardinal + "\n" + longitude + " " + longitudeCardinal;
  }
  
  ///////////////////////////////////////////////////
  addmarker(mmlat,mmlong,mmtime,idd,my_id_lat,my_id_long){
    const customOptions = {
      'className': 'class-popup' // name custom popup,
      ,
      
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: 'show Track',
            index: 0
          }, {
            separator: 'Marker item',
            index: 1
          }],
        //icon: customDefaultIcon
    
    }
    var oranIcon 
    let contentString
    let boxText
    let mmship = ""
    if(idd != this.my_id){
        let mname =  this.rcvrlist.find(x=>x.uid == idd)
       
        if(mname){
          mmship = mname.ship
        }
        let findist =""
        findist = this.distance(my_id_lat ,my_id_long,
            mmlat,mmlong).toString()
    
          
        oranIcon = new L.Icon({
          iconUrl: 'assets/ship_icon/' + mname.uname + ".png",//'assets/marker--orange.png',
          iconSize: [35, 23],
          iconAnchor: [20, 23],
          popupAnchor: [1, -25],
          shadowSize: [35, 35],

        });
        boxText = document.createElement("div");
        contentString = '<h6 style="color:black;padding: 0 !important;margin:0 !important">' + this.convertDMS(mmlat,mmlong) + '</h6>'
        + '<h6 style="color:brown;padding: 0 !important;margin:0 !important">' + findist  +' nm</h6>' 
        + '<h6 style="color:red;padding: 0 !important;margin:0 !important">' + mmtime.format("HH:mm") + '</h6>'
        //+ '<button class="track" style="background: rgba(0,0,0,0.2);color:yellow;">View Track</button>'
        
        boxText.innerHTML = contentString;
    }else{
        var oranIcon = new L.Icon({
          iconUrl: 'assets/icon2.png',
          iconSize: [20, 35],
          iconAnchor: [10, 35],
          popupAnchor: [1, -34],
          shadowSize: [35, 35]
        });
      mmship = "own_pos"
      boxText = document.createElement("div");
      contentString = '<h6 style="color:black;padding: 0 !important;margin:0 !important">' + this.convertDMS(mmlat,mmlong) + '</h6>'
      + '<h6 style="color:red;padding: 0 !important;margin:0 !important">' + mmtime.format("HH:mm") + '</h6>'
  
    }
                         

      boxText.innerHTML = contentString;

      const button = document.createElement('button');
      button.style.cssText = '-moz-border-radius:100px;border:1px  solid #ddd;-moz-box-shadow: 0px 0px 8px  #fff;background:rgba(0,0,0,0.4);color:yellow';

      button.addEventListener('click', (e) => {
          this.showalert();//your typescript function
      });
      button.innerText = 'Track';
      boxText.appendChild(button);
     // const popupContent1 =  '<h6 style="color:black;padding: 0 !important;margin:0 !important">' + this.convertDMS(mp.lat,mp.long) + '</h6>'
     // + '<h6 style="color:red;padding: 0 !important;margin:0 !important">' + mp.mtime.format("HH:mm") + '</h6>'
  
      this.markers[idd] = new L.marker([mmlat,mmlong],{icon: oranIcon,
      })//,{icon:oranIcon})
      .bindTooltip(mmship,{
        permanent: true,direction:'bottom',sticky:true,
        opacity: 0.8
      }).bindPopup(boxText, customOptions).openPopup()
      .on("popupopen", (a) => {
        //console.log("popup openeddd")
        var popUp = a.target.getPopup()
        if(popUp.getElement().querySelector('.track')){
              popUp.getElement()
            .querySelector(".track")
            .addEventListener("click", e => {
             // console.log("clicked....")
              this.showalert()
            
            });
          }
      })   
      .on('popupclose', function(a){
        //console.log("popup closedd")
        var popUp = a.target.getPopup()
        if(popUp.getElement().querySelector('.track')){
          popUp.getElement().querySelector('.track').removeEventListener('click', e => {
                          
          })
        }

      })
      .addTo(this.layerGroup)//this.map);  

      this.markers[idd].on('click', function (ev) {
        this.selected_id = idd
        ev.target.openPopup();
      }.bind(this));
      this.markers[idd].on('mouseout', function (ev) {
        //ev.target.closePopup();
          //this.closePopup();
      });
      this.markers[idd].on('contextmenu', function (ev) {
        ev.target.closePopup();
        //console.log("contexttt",ev.target)
      });

      this.map.panTo(new L.LatLng(mmlat,mmlong));                 
     
  }
  ///////////////////////////////////////////////////
  showalert(){
    if(this.selected_id){
      let id =  this.selected_id

      setTimeout(function(){
        this.ipc.send('send_single_gps',id);
      }.bind(this),10)
      //this.router.navigate(['/singleroute',id])
    }
    else{
      alert("selec an id first")
    }
    //alert('hello')
  }
}




/// test data
/*insert into gps_data(mtime,lat,long,uid) values('2023-01-03 11:14:00',20.62588,92.32307,'0003');
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 11:15:00',20.62315,92.30322,'0003');
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 11:16:00',20.62048,92.29034,'0003');
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 11:17:00',20.61841,92.28051,'0003');
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 11:18:00',20.61676,92.27475,'0003');

*/
/*
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 12:14:00',22.22103,91.77709,'0001');
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 12:15:00',22.21006,91.71286,'0001');
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 12:16:00',21.62163,90.69825,'0001'); 
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 12:17:00',22.14204,91.68405,'0001'); 
insert into gps_data(mtime,lat,long,uid) values('2023-01-03 12:18:00',22.07843,91.64113,'0001');

*/
/*
insert into gps_data(mtime,lat,long,uid) values('2022-12-27 12:14:00',22.22103,91.77709,'0001');
insert into gps_data(mtime,lat,long,uid) values('2022-12-27 12:15:00',22.21006,91.71286,'0001');
insert into gps_data(mtime,lat,long,uid) values('2022-12-27 12:16:00',21.62163,90.69825,'0001'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-27 12:17:00',22.14204,91.68405,'0001'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0001');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:22:00',22.27345,91.72313,'0002');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:23:00',22.28186,91.66975,'0003');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:24:00',22.29552,91.64252,'0004'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:25:00',22.30647,91.58781,'0005'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:26:00',22.22831,91.48028,'0006');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:27:00',22.06614,91.44664,'0007');

insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:28:00',21.87140,91.39408,'0008');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:29:00',21.99887,90.31325,'0009'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:30:00',21.87890,91.22895,'0010'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:31:00',22.07843,91.64113,'0011');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:32:00',22.22103,91.77709,'0012');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:33:00',22.21006,91.71286,'0013');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:34:00',21.62163,90.69825,'0014'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:35:00',22.14204,91.68405,'0015'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:36:00',22.07843,91.64113,'0016');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:37:00',22.22103,91.77709,'0017');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:38:00',22.21006,91.71286,'0018');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:39:00',21.62163,90.69825,'0019'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:40:00',22.14204,91.68405,'0020'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:41:00',22.07843,91.64113,'0021');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:42:00',22.22103,91.77709,'0022');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:43:00',22.21006,91.71286,'0023');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:44:00',21.62163,90.69825,'0024'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:45:00',22.14204,91.68405,'0025'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:46:00',22.07843,91.64113,'0026');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:47:00',22.22103,91.77709,'0027');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:47:00',22.21006,91.71286,'0028');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:47:00',21.62163,90.69825,'0029'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:47:00',22.14204,91.68405,'0030'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:47:00',22.07843,91.64113,'0031');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:48:00',22.22103,91.77709,'0032');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:48:00',22.21006,91.71286,'0033');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:48:00',21.62163,90.69825,'0034'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:17:00',22.14204,91.68405,'0035'); 
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0036');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0037');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:36:00',22.29916,91.41343,'0038');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0039');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0040');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0041');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0042');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0043');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0044');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0045');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0046');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0047');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0048');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0049');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0050');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0051');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0052');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0053');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0054');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'0055');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'9056');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'9057');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'9058');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'9059');
insert into gps_data(mtime,lat,long,uid) values('2022-12-29 12:18:00',22.07843,91.64113,'9060');
*/