import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAllFreqComponent } from './change-all-freq.component';

describe('ChangeAllFreqComponent', () => {
  let component: ChangeAllFreqComponent;
  let fixture: ComponentFixture<ChangeAllFreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeAllFreqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAllFreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
