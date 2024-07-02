import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAllDataFreqComponent } from './change-all-data-freq.component';

describe('ChangeAllDataFreqComponent', () => {
  let component: ChangeAllDataFreqComponent;
  let fixture: ComponentFixture<ChangeAllDataFreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeAllDataFreqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAllDataFreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
