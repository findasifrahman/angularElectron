import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-pass-dialog',
  templateUrl: './pass-dialog.component.html',
  styleUrls: ['./pass-dialog.component.scss']
})
export class PassDialogComponent implements OnInit {
  dpass = ''
  constructor(
    public passdialogRef: MatDialogRef<PassDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string) { }

  onNoClick(): void {
    this.passdialogRef.close();
  }

  ngOnInit() {
  }

}
