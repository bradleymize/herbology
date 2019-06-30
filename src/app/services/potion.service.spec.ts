import { TestBed } from '@angular/core/testing';

import { PotionService } from './potion.service';

describe('PotionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PotionService = TestBed.get(PotionService);
    expect(service).toBeTruthy();
  });
});
