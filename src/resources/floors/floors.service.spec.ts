import { Test, TestingModule } from '@nestjs/testing';
import { FloorsService } from './floors.service';

describe('FloorsService', () => {
  let service: FloorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FloorsService],
    }).compile();

    service = module.get<FloorsService>(FloorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
