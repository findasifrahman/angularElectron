import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDataFreqComponent } from './edit-data-freq.component';

describe('EditDataFreqComponent', () => {
  let component: EditDataFreqComponent;
  let fixture: ComponentFixture<EditDataFreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDataFreqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDataFreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
