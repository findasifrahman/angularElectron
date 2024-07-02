import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-threecolmatgrid',
  templateUrl: './threecolmatgrid.component.html',
  styleUrls: ['./threecolmatgrid.component.css']
})
export class ThreecolmatgridComponent implements OnInit,AfterViewInit {
  @Input() iconname:string;
  @Input() title:string;
  @Input() description:string;
  @Input() color:string;
  


  tiles: Tile[] = [
    { text: '<button mat-fab color="warn">Warn</button>', cols: 1, rows: 3, color: 'lightblue' },
    { text: 'Two', cols: 2, rows: 1, color: 'lightgreen' },
    { text: 'Three', cols: 2, rows: 2, color: 'lightpink' },

  ];
  constructor() { }
  ngAfterViewInit(){
    console.log(this.iconname);
  }
  ngOnInit() {
  }

}

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}