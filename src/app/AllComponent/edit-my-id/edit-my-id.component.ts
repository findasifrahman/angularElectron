import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MyidService } from '../my-id/myid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { models } from '../../models/my_idmodels';

@Component({
  selector: 'app-edit-my-id',
  templateUrl: './edit-my-id.component.html',
  styleUrls: ['./edit-my-id.component.scss']
})
export class EditMyIdComponent implements OnInit {
  id = 1;
  Forms: FormGroup;
  constructor(private snackBar: MatSnackBar,  private cdref: ChangeDetectorRef, private service:MyidService,
    private formBuilder: FormBuilder, private _router: Router,
    private models:models,private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.Forms = this.models.modelForms;
    this.service.getbyid(this.id).subscribe((data) => {
      this.Forms.patchValue(data);
    })
    /*this.route.params.subscribe(params => {
      //this.id = params['id'];
      this.service.getbyid(1).subscribe((data) => {
        this.Forms.patchValue(data);
      })
    })*/
  }
  async FormSubmit() {
    const formValue = this.Forms.value;
    //console.log(formValue);
    await this.service.update(this.id, formValue).subscribe(() => {
      console.log("Update req successfull");
      this.snackBar.open('Data updated successfully', "Remove", {
        duration: 5000, verticalPosition: 'top', panelClass: ['blue-snackbar']
      });
      this._router.navigate(['/']);
    },
      error => {
        console.log("error Update", error);
        this.snackBar.open('Update unsuccessfull', "Remove", {
          duration: 6000, verticalPosition: 'top', panelClass: ['red-snackbar']
        });
      }
    );
  }


}
