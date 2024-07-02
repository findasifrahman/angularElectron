
import { Component, OnInit, ChangeDetectorRef,PipeTransform } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';


import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

import Map from 'ol/Map';
import View from 'ol/View';
import LineString from 'ol/geom/LineString';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import OlFeature from 'ol/Feature';
import OlPoint from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import {Fill, Stroke, Circle, Style, Text,Icon} from 'ol/style'

import OSM from 'ol/source/OSM';
import { LoginService } from '../../../AllComponent/login/login.service';

import 'ol/ol.css';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-without-sidebarlayout',
  templateUrl: './without-sidebarlayout.component.html',
  styleUrls: ['./without-sidebarlayout.component.scss']
})
export class WithoutSidebarlayoutComponent implements OnInit {
  alarmListToday = []
  matbadgecount = 0
  showNotiiList = false
  showMailList = false
  Administrator
  loggedUserName = ""

  matmailcount = 0
  usermailobj = []
  screenWidth: number;

  userdetobj
  formval
  arralarm
  alarmListtoPush = []
  devicedetail = []
  intervalstate
  constructor(private spinner: NgxSpinnerService,
    private router:Router,private lservice: LoginService, private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef) { 


      this.screenWidth = window.innerWidth;
      window.onresize = () => {
        // set screenWidth on screen size change
        this.screenWidth = window.innerWidth;
      };
  } 
  ngOnDestroy() {
    if (this.intervalstate) {
      clearInterval(this.intervalstate);
    }
  }
  ngAfterViewInit() {
    this.spinner.hide();

    if(this.lservice.getUserLogStatus()){
      this.loggedUserName = this.lservice.getUser().charAt(0).toUpperCase();
      this.Administrator =  "Welcome " + this.lservice.getUser()
      if(this.lservice.getrole() == "user"){
      }

    }
    this.intervalstate = setInterval(function(){
      this.repeat()
    }.bind(this),60000 * 10)

  }
  ngOnInit() {
          //////////////
          let userdetobj
          userdetobj = this.userdetobj =   JSON.parse(localStorage.getItem("userDetails"))
          this.formval = JSON.parse(localStorage.getItem("alluser")).map(({ uid }) => uid)  //params['devobj']
          this.devicedetail =  JSON.parse(localStorage.getItem("alluser"))
       


  }

  clickMailList(){
    this.showNotiiList = false
    this.showMailList = !this.showMailList
  }
  showAlarmList(){
    this.showNotiiList = !this.showNotiiList
    this.showMailList = false
  }
}
