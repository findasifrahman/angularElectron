import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";
import { IpcRenderer } from 'electron';
import * as $ from 'jquery';
@Component({
  selector: 'app-set-user',
  templateUrl: './set-user.component.html',
  styleUrls: ['./set-user.component.scss']
})
export class SetUserComponent implements OnInit {
  simpleSnackBarRef: any;
  Forms: any;
  private ipc: IpcRenderer;
  constructor(private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,private router:Router,private spinner: NgxSpinnerService) { 
      this.ipc = (<any>window).require('electron').ipcRenderer
    }

    ngOnInit() {
      $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
      });
      this.Forms = this.formBuilder.group({
        username: ["", Validators.required],
        id: ["", Validators.required],
      });
    }

    async FormSubmit() {
      const formValue = this.Forms.value;
      //this.spinner.show();
      console.log("setuser form submit", formValue)
      this.ipc.send('settingsData',formValue);         
      this.snackBar.open('Username added', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });

      ////////
      await localStorage.setItem("username",formValue.username)
      await localStorage.setItem("device_id", formValue.id)
      //////////////
      this.router.navigate(["home", formValue.username, formValue.id ]);
    }
    gotoSettings(){

    }
    gotoHome(){
      this.router.navigate(["home"]);
    }

}
