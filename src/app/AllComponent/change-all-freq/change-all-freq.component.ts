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
  selector: 'app-change-all-freq',
  templateUrl: './change-all-freq.component.html',
  styleUrls: ['./change-all-freq.component.scss']
})
export class ChangeAllFreqComponent implements OnInit {
  private ipc: IpcRenderer;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['channel_id','frequency', 'buttons'];
  displayedColumnsName: string[] = ['channel_id','frequency','buttons'];
  AllElement: MatTableDataSource<any>;

  get_freq_table
  freqtable
  constructor(private cdref: ChangeDetectorRef,zone:NgZone,private snackBar: MatSnackBar,  public _router: Router,
    public dialog: MatDialog, private router: Router,private spinner: NgxSpinnerService) { 
      this.get_freq_table = (event, data) => { // freq table recieved
        zone.run(()=>{
          this.freqtable = data.msg
          let new_arr = []
          data.msg.map((mapval,index)=>{
            //console.log("freq",mapval)
              new_arr.push(mapval)
            
            if(index == data.msg.length - 1){
              this.AllElement = new MatTableDataSource(new_arr as any);
              this.AllElement.paginator = this.paginator;
              // now get curr channel
              //this.ipc.send('send_curr_chan',"true");
            }
          })

          //console.log("freq table is-", data.msg)
          
        })
      }
      
      if ((<any>window).require) {
        try {
          this.ipc = (<any>window).require('electron').ipcRenderer
          this.ipc.on('get_freq_table', this.get_freq_table)

        }catch(e){}
      }
  }
  public doFilter = (value: string) => {
    this.AllElement.filter = value.trim().toLocaleLowerCase();
  }

  ngOnInit(): void {
      this.ipc.send('send_freq_table',"true");
  }
  ngOnDestroy(){
    this.ipc.removeListener('get_freq_table', this.get_freq_table)
   
  }
  onEdit(id){
    console.log("onedit id id--",id)
    this._router.navigate(['/freqedit', id, "all"]);

  }
}
