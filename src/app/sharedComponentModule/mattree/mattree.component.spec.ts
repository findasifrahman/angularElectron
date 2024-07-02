import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MattreeComponent } from './mattree.component';

describe('MattreeComponent', () => {
  let component: MattreeComponent;
  let fixture: ComponentFixture<MattreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MattreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MattreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
