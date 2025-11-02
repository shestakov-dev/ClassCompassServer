import { Test, TestingModule } from '@nestjs/testing';
import { DailySchedulesController } from './daily-schedules.controller';
import { DailySchedulesService } from './daily-schedules.service';

describe('DailySchedulesController', () => {
  let controller: DailySchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailySchedulesController],
      providers: [DailySchedulesService],
    }).compile();

    controller = module.get<DailySchedulesController>(DailySchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
