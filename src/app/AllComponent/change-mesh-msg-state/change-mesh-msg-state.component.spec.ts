import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMeshMsgStateComponent } from './change-mesh-msg-state.component';

describe('ChangeMeshMsgStateComponent', () => {
  let component: ChangeMeshMsgStateComponent;
  let fixture: ComponentFixture<ChangeMeshMsgStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeMeshMsgStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeMeshMsgStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
