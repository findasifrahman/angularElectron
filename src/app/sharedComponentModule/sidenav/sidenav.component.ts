import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { LoginService} from '../../AllComponent/login/login.service'
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ROUTES } from './sidebar-routes.config';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {



  public color: string;
  public menuItems: object;
  public activeFontColor: string;
  public normalFontColor: string;
  public dividerBgColor: string;

  status1: boolean = false;
  clickEvent(){
      this.status1 = !this.status1;       
  }
  isExpanded = false;

  isShowSettings = true//false;
  isShowSettingsli: boolean = false
  loggedUserName ="U"
  Administrator = "Welcome"

  toggleDisplaySettings() {
    this.isShowSettings = !this.isShowSettings;
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
  constructor(private lService: LoginService,private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef,private router: Router) { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    if(this.lService.getUserLogStatus()){

      this.loggedUserName = this.lService.getUser().charAt(0).toUpperCase();
      this.Administrator =  "Welcome " + this.lService.getUser()
      console.log("user is", this.Administrator)
      if(this.lService.getrole() == "user"){
        console.log("user role is user man--------------")
        this. isShowSettingsli = true;
      }
      this.cdref.detectChanges();
    }
  }

  logOutClick(){
    this.lService.logout();
    this.snackBar.open('Logged Out Successfully', "Remove", {
      duration: 6000,
      verticalPosition: 'top',
      panelClass: ['blue-snackbar']
    });
    this.router.navigate(["/"]);
  }


  showChangeSpeed = false
  showChangePass = false
  showAll = true




  changePassClick(){
    this.showChangeSpeed = false
    this.showChangePass = true
    this.showAll = false
  }
  speedLimitClick(){
    this.showChangeSpeed = true
    this.showChangePass = false
    this.showAll = false
  }
  homeClick(){
    this.router.navigate(["/viewlocation"])
  }


}
