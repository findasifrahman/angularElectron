import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteOlderChatComponent } from './delete-older-chat.component';

describe('DeleteOlderChatComponent', () => {
  let component: DeleteOlderChatComponent;
  let fixture: ComponentFixture<DeleteOlderChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteOlderChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteOlderChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
