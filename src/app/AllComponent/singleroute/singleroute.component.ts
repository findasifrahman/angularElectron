import { ActivatedRoute, Params } from '@angular/router';
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
@Component({
  selector: 'app-singleroute',
  templateUrl: './singleroute.component.html',
  styleUrls: ['./singleroute.component.scss']
})
export class SinglerouteComponent implements OnInit {
  select_id 

  private map
  private ipc: IpcRenderer;
  pos_arr:any = []
  rcvrlist = []
  markers: any = {}
  backcol ="p"
  rcv_single_gps
  own_gps_data
  status_msg_map
  my_id
  myinterval

  layerGroup;

  pointList_ : any[];
  constructor(private route: ActivatedRoute,
    zone:NgZone,private snackBar: MatSnackBar,
    public dialog: MatDialog, private router: Router) { 
      this.rcv_single_gps = (event, data) => {
        zone.run(()=>{
          console.log("all gps data rcvd")
          //////////////
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
          //console.log("total val all gps", data.msg.all_gps)
          //this.markers["0002"].clearLayers()
          //this.markers["0001"].clearLayers()

          let my_id_gps = []

          this.pointList_ = []
          //this.id_arr = []
          data.msg.all_gps.map((mapval,index)=>{
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
                      console.log("inside arr")
                      if(d.asMinutes() < 10){
                        if(findist > 15){
                          console.log("discard invalid gps value")
                        }
                        else{
                          this.pointList_.push(mapval)
                          console.log("val of pointlist", this.pointList_.length)
                        }
                      }
                      else{
                        this.pointList_.push(mapval)
                        console.log("val of pointlist", this.pointList_.length)
                      }
                  }else{
                    this.pointList_.push(mapval)
                    console.log("val of pointlist", this.pointList_.length)
                    //console.log(this.pointList_,this.pointList_[mapval.uid])
                  }

                }
            }
            const customOptions = {
              'className': 'class-popup' // name custom popup,
            }
            if(index >=data.msg.all_gps.length - 1){

              setTimeout(function(){
                //console.log("inside arr finisheddd", this.pointList_, this.pointList_.length)
                ////////////////////////////////
                  //console.log("inside id arr--",mm)
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
                        let mname =  this.rcvrlist.find(x=>x.uid == mp.uid)
                        let mship = ""
                        if(mname){
                          mship = mname.ship
                          oranIcon = new L.Icon({
                            iconUrl: 'assets/ship_icon/' + mname.uname + ".png",//'assets/marker--orange.png',
                            iconSize: [35, 23],
                            iconAnchor: [20, 23],
                            popupAnchor: [1, -25],
                            shadowSize: [35, 35],
                
                          });
                        }else{
                          console.log("this.selec_id",this.select_id)
                          if(this.select_id == this.my_id){
                            console.log("this.my_id", this.my_id)
                            mname = {uid:this.my_id,mship:"self"}
                            //mname.mship == "self"
                            mship = "self"

                            var oranIcon = new L.Icon({
                              iconUrl: 'assets/ship_icon/base.png',
                              iconSize: [20, 35],
                              iconAnchor: [10, 35],
                              popupAnchor: [1, -34],
                              shadowSize: [35, 35]
                            });
                              
                          }
                        }
                        /*let findist =""
                        if(my_id_gps.length > 0 ){
                          findist = this.distance(my_id_gps[my_id_gps.length -1].lat,my_id_gps[my_id_gps.length -1].long,
                            mp.lat,mp.long).toString()
              
                        }*/
                        if(mname){
                            ////////////////////////////////////
                            var boxText = document.createElement("div");
                            const contentString = '<h6 style="color:black;padding: 0 !important;margin:0 !important">' + this.convertDMS(mp.lat,mp.long) + '</h6>'
                            //+ '<h6 style="color:brown;padding: 0 !important;margin:0 !important">' + findist  +' nm</h6>' 
                            + '<h6 style="color:red;padding: 0 !important;margin:0 !important">' + this.pointList_[this.pointList_.length -1].mtime.format("HH:mm") + '</h6>'
                            //+ '<button class="track" style="background: rgba(0,0,0,0.2);color:yellow;">View Track</button>'
                            
                            boxText.innerHTML = contentString;                   

                            console.log("ship is-",mship)
                          
                            
                            this.markers[mp.uid] = new L.marker([this.pointList_[this.pointList_.length -1].lat,this.pointList_[this.pointList_.length -1].long],
                              {icon: oranIcon,
                              }
                              )//mp.lat,mp.long])
                            .bindTooltip(mship,{
                              permanent: true,direction:'bottom',sticky:true,
                              opacity: 0.8
                            }).bindPopup(boxText/*popupContent1*/, customOptions)//.openPopup()
                            .addTo(this.layerGroup)//this.map);
                            
                  
                            this.markers[mp.uid].on('mouseover', function (ev) {
                              this.selected_id = mp.uid
                              ev.target.openPopup();
                              var originalTarget = ev.originalEvent.target;
                  
                                //this.openPopup();
                            }.bind(this));
                            this.markers[mp.uid].on('mouseout', function (ev) {
                              //ev.target.closePopup();
                                //this.closePopup();
                            });
                            this.map.panTo(new L.LatLng(mp.lat,mp.long));
                          }
                    }
                  })
                 // this.gps_draw_track(this.pointList_[mm],my_id_gps,customOptions)
                
              }.bind(this),2000)
            }

          })

          //////////////////////////////////

        })
      }// end of definition for single gps
      /////////////////////////////
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('rcv_single_gps', this.rcv_single_gps)             
        }catch(e){}
      }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
        this.select_id = params['id']
        console.log("select id is--",this.select_id)
     

    })
  } 
  ngAfterViewInit(): void {
    setTimeout(function(){
      this.initMap()
      this.ipc.send('send_single_gps',this.select_id);
    }.bind(this),1000)
    

  }
  ngOnDestroy(){
    console.log("inside ng on destroy")
    //this.ipc.removeListener('status_msg_map', this.status_msg_map)
    this.ipc.removeListener('rcv_single_gps',this.rcv_single_gps)
     
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
}
