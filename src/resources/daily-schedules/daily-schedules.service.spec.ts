import { Test, TestingModule } from '@nestjs/testing';
import { DailySchedulesService } from './daily-schedules.service';

describe('DailySchedulesService', () => {
  let service: DailySchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailySchedulesService],
    }).compile();

    service = module.get<DailySchedulesService>(DailySchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
