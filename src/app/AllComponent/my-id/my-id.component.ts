import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MyidService } from './myid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { allusermodels } from '../../models/allusermodels';

@Component({
  selector: 'app-my-id',
  templateUrl: './my-id.component.html',
  styleUrls: ['./my-id.component.scss']
})
export class MyIdComponent implements OnInit {

  simpleSnackBarRef: any;
  Forms: FormGroup;
  selectFormControl = new FormControl('', Validators.required);
  constructor(private snackBar: MatSnackBar, private addshipservice: MyidService,
    private formBuilder: FormBuilder,private router:Router,
    private spinner: NgxSpinnerService,private allModels:allusermodels) { }


    ngOnInit() {
      this.Forms = this.allModels.modelForms;
      this.Forms.reset();
    }

    async FormSubmit() {
      const formValue = this.Forms.value;
      console.log("formval-", formValue)
      try {
        await this.addshipservice.Add(formValue).subscribe(
          data => {
            console.log("post req successfull");
            this.snackBar.open('Added successfully', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });
            this.router.navigate(["/"]);
          },
          error => {
            console.log("error post", error);
            this.snackBar.open('Unsuccessfull, duplicate username probably', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['red-snackbar']
            });
          }
        );
 
      }
      catch (err) {
      }
    }


}
