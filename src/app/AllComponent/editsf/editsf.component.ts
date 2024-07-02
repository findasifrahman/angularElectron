import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { IpcRenderer } from 'electron';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PassDialogComponent} from '../../sharedComponentModule/pass-dialog/pass-dialog.component';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-editsf',
  templateUrl: './editsf.component.html',
  styleUrls: ['./editsf.component.scss']
})
export class EditsfComponent implements OnInit {
  private ipc: IpcRenderer;
  sf_chan_state
  constructor(  private cdref: ChangeDetectorRef,zone:NgZone,private snackBar: MatSnackBar,  public _router: Router,
    public dialog: MatDialog, private router: Router,private spinner: NgxSpinnerService) { 
      this.sf_chan_state = (event, data) => {
        zone.run(()=>{
          this.snackBar.open(' Data Rate Change Success', "Remove", {
            duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
          });
        })
      }
      
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('sf_chan_state', this.sf_chan_state )
         
        }catch(e){

        }
      }
  }
  ngOnDestroy(){
    this.ipc.removeListener('sf_chan_state',this.sf_chan_state)
  
  }
  ngOnInit(): void {
  }
  sf_chan(ch){
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, you want to change data rate?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.ipc.send("change_spread_factor",ch)
      }
    })
  }

}
