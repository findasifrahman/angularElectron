import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginService } from '../../AllComponent/login/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adminlayout',
  templateUrl: './adminlayout.component.html',
  styleUrls: ['./adminlayout.component.scss']
})
export class AdminlayoutComponent implements OnInit {
   hide:boolean;


  /*ngOnInit() {
    this.hide = !this.lService.getUserLogStatus();

  }*/
  isShowSettings = true;
  isShowSettingsli: boolean = false
  screenWidth: number;
  Administrator
  loggedUserName
  isShowNotiiNav = false
  toggleDisplaySettings() {
    this.isShowSettings = !this.isShowSettings;
  }
  @Output() sideNavToggled = new EventEmitter<void>();

  constructor(private readonly router: Router,private lservice: LoginService) {
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      // set screenWidth on screen size change
      this.screenWidth = window.innerWidth;
    };
  }

  ngOnInit() {
    let username = this.lservice.getUser()
    if(username.includes("bijoy50_dsig_admin")){
      this.isShowSettingsli = true
    }
  }

  toggleSidebar() {
    this.sideNavToggled.emit();
  }

  onLoggedout() {
    localStorage.removeItem('isLoggedin');
    this.router.navigate(['/login']);
  }

}
