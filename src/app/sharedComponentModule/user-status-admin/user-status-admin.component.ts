import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-status-admin',
  templateUrl: './user-status-admin.component.html',
  styleUrls: ['./user-status-admin.component.scss']
})
export class UserStatusAdminComponent implements OnInit {
  @Input() username
  @Input() useremail
  @Input() userPhone
  @Input() agentName
  @Input() agentPhone
  @Input() activateDate
  constructor() { }

  ngOnInit(): void {
  }

}
