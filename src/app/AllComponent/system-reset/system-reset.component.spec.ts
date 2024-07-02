import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemResetComponent } from './system-reset.component';

describe('SystemResetComponent', () => {
  let component: SystemResetComponent;
  let fixture: ComponentFixture<SystemResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemResetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
