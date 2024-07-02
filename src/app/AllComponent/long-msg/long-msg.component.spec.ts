import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LongMsgComponent } from './long-msg.component';

describe('LongMsgComponent', () => {
  let component: LongMsgComponent;
  let fixture: ComponentFixture<LongMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LongMsgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LongMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
