import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffmapComponent } from './offmap.component';

describe('OffmapComponent', () => {
  let component: OffmapComponent;
  let fixture: ComponentFixture<OffmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OffmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OffmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
