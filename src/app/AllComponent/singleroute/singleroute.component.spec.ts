import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglerouteComponent } from './singleroute.component';

describe('SinglerouteComponent', () => {
  let component: SinglerouteComponent;
  let fixture: ComponentFixture<SinglerouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SinglerouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SinglerouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
