import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFreqComponent } from './edit-freq.component';

describe('EditFreqComponent', () => {
  let component: EditFreqComponent;
  let fixture: ComponentFixture<EditFreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFreqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
