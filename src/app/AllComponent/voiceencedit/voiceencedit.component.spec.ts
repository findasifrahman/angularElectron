import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceenceditComponent } from './voiceencedit.component';

describe('VoiceenceditComponent', () => {
  let component: VoiceenceditComponent;
  let fixture: ComponentFixture<VoiceenceditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoiceenceditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceenceditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
