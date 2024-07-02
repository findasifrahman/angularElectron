import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserSetComponent } from './edit-user-set.component';

describe('EditUserSetComponent', () => {
  let component: EditUserSetComponent;
  let fixture: ComponentFixture<EditUserSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUserSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
