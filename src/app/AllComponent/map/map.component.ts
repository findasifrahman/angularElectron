import { Component, OnInit,NgZone } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Router,ActivatedRoute } from '@angular/router';
//import * as mapboxgl from 'mapbox-gl';
const mapboxgl = require('mapbox-gl');
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  private ipc: IpcRenderer;
  layerPaint = {
    'circle-radius': 10,
    'circle-color': '#3887be'
  };
  allgeometry = {
    'type': 'Point',
    'coordinates': [90.3795,23.8759]
  }
  allgeometry2 = {
    'type': 'Point',
    'coordinates': [90.3654,23.8223]
  }
  coordinates = [0, 0];

  geojson = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
          'message': 'Foo',
          'iconSize': [60, 60]
        },
        'geometry': {
          'type': 'Circle',
          'coordinates': [
            90.3795,23.8759
          ]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'message': 'Bar',
          'iconSize': [50, 50]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -61.2158203125,
            -15.97189158092897
          ]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'message': 'Baz',
          'iconSize': [40, 40]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -63.29223632812499,
            -18.28151823530889
          ]
        }
      }
    ]
  };
  userlist = []
  constructor(zone:NgZone, private router: Router) {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer

        this.ipc.on('ode_data', (event, data) => {
          zone.run(()=>{

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
            this.userlist.map(mapval=>{            
              //console.log("ode data--", data.msg)
              let location = data.msg.Location
              if(location.length > 0){
                console.log("location--", location)
                let inn = location.indexOf(',')
                let lat = parseFloat(location.substr(0, inn)) 
                let long =  parseFloat(location.substr(inn+1, location.length - inn -1))
                if(!isNaN(lat)){
                      this.allgeometry = {
                        'type': 'Point',
                        'coordinates': [long,lat]
                      }
                      var popup = new mapboxgl.Popup({ offset: 25 }).setText(
                        data.msg.nname + "(" + data.msg.name +")"
                      );
                      
                      var marker2 = new mapboxgl.Marker({ color: 'black', rotation: 0 }).setLngLat([long, lat])
                      .setPopup(popup).addTo(this.map);
                }
              }
            })
                    
          })
        })

      }catch (error) {
        throw error;
      }
    }
  }
  /////////////////////////////////////
  changeColor(color: string) {
    this.layerPaint = { ...this.layerPaint, 'circle-color': color };
  }


  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 23.6850;
  lng = 90.3563;

  ngOnInit() {
    //(mapboxgl as typeof mapboxgl).accessToken = environment.accessToken;
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXNpZjEwMDE4IiwiYSI6ImNrbmNqY2M2bjIyNnkycHA5OHR2eHg1bnAifQ.Ptk-4lJTQB0NOb3gZOHT7w'//environment.accessToken;
    //mapboxgl.accessToken = environment.accessToken;
      this.map = new mapboxgl.Map({
        //accessToken: 'pk.eyJ1IjoiYXNpZjEwMDE4IiwiYSI6ImNrbmNqY2M2bjIyNnkycHA5OHR2eHg1bnAifQ.Ptk-4lJTQB0NOb3gZOHT7w',//environment.accessToken,
        container: 'mapa',
        style: this.style,
        zoom: 9,
        center: [this.lng, this.lat]
    });

    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
  }
  ////////////////////////////////


  gotoHome(){
    this.router.navigate(["/home"]);
  }
  gotoSettings(){
    this.router.navigate(["/setUser"]);
  }
  gotoMap(){
    this.router.navigate(["/map"]);
  }

}
