import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithoutSidebarlayoutComponent } from './without-sidebarlayout.component';

describe('WithoutSidebarlayoutComponent', () => {
  let component: WithoutSidebarlayoutComponent;
  let fixture: ComponentFixture<WithoutSidebarlayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithoutSidebarlayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithoutSidebarlayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
