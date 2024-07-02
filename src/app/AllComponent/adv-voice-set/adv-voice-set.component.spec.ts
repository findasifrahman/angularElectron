import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvVoiceSetComponent } from './adv-voice-set.component';

describe('AdvVoiceSetComponent', () => {
  let component: AdvVoiceSetComponent;
  let fixture: ComponentFixture<AdvVoiceSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvVoiceSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvVoiceSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
