import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditsfComponent } from './editsf.component';

describe('EditsfComponent', () => {
  let component: EditsfComponent;
  let fixture: ComponentFixture<EditsfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditsfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditsfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
