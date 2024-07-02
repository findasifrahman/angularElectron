import { Component, OnInit,ViewChild,Inject } from '@angular/core';
import { AddShipService } from '../add-ship/add-ship.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../sharedComponentModule/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { allusermodels } from '../../models/allusermodels';
import * as moment from 'moment';

@Component({
  selector: 'app-list-ship',
  templateUrl: './list-ship.component.html',
  styleUrls: ['./list-ship.component.scss']
})
export class ListShipComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['id','uid','ship', 'buttons'];
  displayedColumnsName: string[] = ['id','uid','ship', 'buttons'];
  AllElement: MatTableDataSource<any>;
  constructor(private snackBar: MatSnackBar, 
    private shipService : AddShipService, public dialog: MatDialog,
    public _router: Router) {

    }

  
  ngOnInit(): void {
    
  }
  searchIn = 0
  public doFilter = (value: string) => {
    this.searchIn = 2
    this.AllElement.filter = value.trim().toLocaleLowerCase();
  }
  public doFilterdate = (value: string) => {
    console.log("value-",value)
    this.searchIn = 1
    this.AllElement.filter = value.trim()
  }
  public doFiltercategory = (value: string) => {
    this.searchIn = 0
    this.AllElement.filter = value.trim()
  }



  ngAfterViewInit(): void {
    this.shipService.getAll().subscribe((posts) => {
      //posts["date"] = moment(posts['date']).format("YYYY-MM-DD")
      this.AllElement = new MatTableDataSource(posts as any);
      this.AllElement.paginator = this.paginator;

      /*this.AllElement.filterPredicate = (data, filter: string) => {
        if(this.searchIn == 1){
         return !filter || data.date.includes(filter);
        }else if(this.searchIn == 2){
          return !filter || data.title.includes(filter);
        }else {
          return !filter || data.category.includes(filter);
        }
      }*/

     /* this.AllElement.filterPredicate = (data, filter: string) => 
      !filter || data.category.includes(filter);*/
      //setTimeout(() => this.AllElement.paginator = this.paginator);
      console.log(posts);
    });
  }
  onDelete(id) {
    console.log("Inside Delete--" + id);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      hasBackdrop: true,
      data: "Are you sure, you want to delete this data?"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.shipService.delete(id).subscribe((posts) => {
          this.AllElement = new MatTableDataSource(posts as any);
          this.AllElement.paginator = this.paginator;
          console.log(posts);

          this.snackBar.open('Data deleted successfully', "Remove", {
            duration: 6000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar']
          });
        },
          error => {
            this.snackBar.open('Unsuccessfull', "Remove", {
              duration: 6000,
              verticalPosition: 'top',
              panelClass: ['red-snackbar']
            });
          }
        )
      }//if end
    })//dialog ref
  }//Delete end

  onUpdate(id) {
    this._router.navigate(['/editEvent', id]);
  }
  onList(id){
    let baseUrl = window.location.href.replace(this._router.url, '');
    const url = this._router.serializeUrl(this._router.createUrlTree(['/viewtemptwo',id]));
    console.log(baseUrl + url)
    window.open(baseUrl + url, '_blank');
    //this._router.navigate(['/searchlist',id])
  }

}
