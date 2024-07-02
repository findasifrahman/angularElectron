import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableforAdminComponent } from './tablefor-admin.component';

describe('TableforAdminComponent', () => {
  let component: TableforAdminComponent;
  let fixture: ComponentFixture<TableforAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableforAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableforAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
