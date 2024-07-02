import { TestBed } from '@angular/core/testing';

import { MyidService } from './myid.service';

describe('MyidService', () => {
  let service: MyidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
