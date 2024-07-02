import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-productviewcard',
  templateUrl: './productviewcard.component.html',
  styleUrls: ['./productviewcard.component.css']
})
export class ProductviewcardComponent implements OnInit {
  @Input() name:string;
  @Input() image:string;
  @Input() title:string;
  constructor() { }

  ngOnInit() {
  }

}
