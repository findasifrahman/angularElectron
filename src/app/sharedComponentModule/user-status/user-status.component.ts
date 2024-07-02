import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-status',
  templateUrl: './user-status.component.html',
  styleUrls: ['./user-status.component.scss']
})
export class UserStatusComponent implements OnInit {
  @Input() expireTime
  @Input() serviceCharge
  @Input() simNo
  @Input() userPhone
  @Input() dataBackup
  @Input() username
  constructor() { }

  ngOnInit() {
  }

}
