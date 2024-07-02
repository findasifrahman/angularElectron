import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEncComponent } from './edit-enc.component';

describe('EditEncComponent', () => {
  let component: EditEncComponent;
  let fixture: ComponentFixture<EditEncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEncComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
