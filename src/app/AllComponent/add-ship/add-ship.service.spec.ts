import { TestBed } from '@angular/core/testing';

import { AddShipService } from './add-ship.service';

describe('AddShipService', () => {
  let service: AddShipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddShipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
