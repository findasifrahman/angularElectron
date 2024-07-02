import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatusAdminComponent } from './user-status-admin.component';

describe('UserStatusAdminComponent', () => {
  let component: UserStatusAdminComponent;
  let fixture: ComponentFixture<UserStatusAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStatusAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStatusAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
