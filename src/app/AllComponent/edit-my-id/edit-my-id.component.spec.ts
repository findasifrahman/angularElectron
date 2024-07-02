import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMyIdComponent } from './edit-my-id.component';

describe('EditMyIdComponent', () => {
  let component: EditMyIdComponent;
  let fixture: ComponentFixture<EditMyIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMyIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMyIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
