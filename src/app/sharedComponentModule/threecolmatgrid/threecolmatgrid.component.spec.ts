import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreecolmatgridComponent } from './threecolmatgrid.component';

describe('ThreecolmatgridComponent', () => {
  let component: ThreecolmatgridComponent;
  let fixture: ComponentFixture<ThreecolmatgridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreecolmatgridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreecolmatgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
