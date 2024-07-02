import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit, AfterViewChecked, TestabilityRegistry, ViewChildren, QueryList } from '@angular/core';
import * as $ from 'jquery';
import { IpcRenderer } from 'electron';
import { Observable } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import {ChangeDetectorRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-delete-older-chat',
  templateUrl: './delete-older-chat.component.html',
  styleUrls: ['./delete-older-chat.component.scss']
})
export class DeleteOlderChatComponent implements OnInit {
  private ipc: IpcRenderer;
    
  public dateTimeRange: Date;
  _date = ""
  constructor(private spinner: NgxSpinnerService,
    zone:NgZone,private snackBar: MatSnackBar,public dialog: MatDialog) {
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
        }  catch (error) {
          console.log(error);
        }
      }else {
        console.warn('Could not load electron ipc');
      }  
  }

  ngOnInit(): void {
  }

  triggerDelete(){
    if(!this.dateTimeRange){
      this.snackBar.open('Time not selected', "Remove", {
        duration: 6000,
        verticalPosition: 'top',
        panelClass: ['blue-snackbar']
      });
      return
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "This will delete Opl Chat data. This action is irreversible. Are you Certain?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
          console.log(this.dateTimeRange)
          this._date = moment(this.dateTimeRange).format("DDHHmm MMM YY")
          this.spinner.show()
          setTimeout(function(){
            if(this.spinner)
              this.spinner.hide()
          }.bind(this),8000)
          let nn = ""

          this.ipc.send("delete_chat_by_time",{dt1: this.dateTimeRange})
      }
    })
  }
}
