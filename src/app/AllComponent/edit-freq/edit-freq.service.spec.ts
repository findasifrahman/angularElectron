import { TestBed } from '@angular/core/testing';

import { EditFreqService } from './edit-freq.service';

describe('EditFreqService', () => {
  let service: EditFreqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditFreqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
