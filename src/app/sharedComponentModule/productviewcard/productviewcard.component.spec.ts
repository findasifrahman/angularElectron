import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductviewcardComponent } from './productviewcard.component';

describe('ProductviewcardComponent', () => {
  let component: ProductviewcardComponent;
  let fixture: ComponentFixture<ProductviewcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductviewcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductviewcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
