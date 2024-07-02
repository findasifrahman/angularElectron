import {AfterViewInit, Component, OnDestroy, OnInit,Input,Output,EventEmitter, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ReplaySubject, Subject} from 'rxjs';
import { MatSelect } from '@angular/material/select';
import {take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-select-search',
  templateUrl: './select-search.component.html',
  styleUrls: ['./select-search.component.scss']
})
export class SelectSearchComponent implements OnInit {

  @Input() list: any[];
  @Input() preVal: string;
  @Output() outputval: EventEmitter<string> = new EventEmitter();
  public siteCtrl: FormControl = new FormControl("4");

  public siteFilterCtrl: FormControl = new FormControl();
  @Input() formControlnam: string;
  /** list of sites filtered by search keyword */
  public filteredSites: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected onDestroy = new Subject<void>();
  constructor() { }
  ngOnChanges(changes) {
    if(this.list){
      console.log("on changes--", this.formControlnam)
      this.filteredSites.next(this.list.slice());
      this.siteFilterCtrl.valueChanges
        .pipe(takeUntil(this.onDestroy))
        .subscribe(() => {
          this.filterSites();
        });
        if (this.preVal != null) {
          console.log("pre val-- ", this.preVal)
          this.setInitialValue(this.preVal);
        }
        this.setInitialValue(this.preVal);
    }

  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {


  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  protected setInitialValue(val) {
    console.log("f nam----",this.formControlnam)
    if( this.singleSelect){
    this.filteredSites
      .pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (a: any, b: any) => a && b && a[this.formControlnam] === val;
      });
    }

  }

  protected filterSites() {
    if (!this.list) {
      return;
    }
    let search = this.siteFilterCtrl.value;
    if (!search) {
      this.filteredSites.next(this.list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the sites
    this.filteredSites.next(
      this.list.filter(site => site[this.formControlnam].toLowerCase().indexOf(search) > -1)
    );
  }

  cliidchanged(ev){
    this.outputval.emit(ev.value[this.formControlnam]);

  }

}



