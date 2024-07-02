import { Component, OnInit } from '@angular/core';

import { routeurls } from '../../AllComponent/routeurls/routeurls'
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isExpanded = false;
  imageSrc;
  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
  constructor() { }

  ngOnInit() {

  }

}
