import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeStatusMsgStateComponent } from './change-status-msg-state.component';

describe('ChangeStatusMsgStateComponent', () => {
  let component: ChangeStatusMsgStateComponent;
  let fixture: ComponentFixture<ChangeStatusMsgStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeStatusMsgStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeStatusMsgStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
