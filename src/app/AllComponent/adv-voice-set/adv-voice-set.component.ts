import { Component,NgZone,ElementRef,Renderer2, ViewChild, 
  OnInit, AfterViewInit } from '@angular/core';
import { IpcRenderer } from 'electron';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-adv-voice-set',
  templateUrl: './adv-voice-set.component.html',
  styleUrls: ['./adv-voice-set.component.scss']
})
export class AdvVoiceSetComponent implements OnInit {

  constructor(){}
  ngOnInit(){}


}
