import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BncgEncryptComponent } from './bncg-encrypt.component';

describe('BncgEncryptComponent', () => {
  let component: BncgEncryptComponent;
  let fixture: ComponentFixture<BncgEncryptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BncgEncryptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BncgEncryptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
