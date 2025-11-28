import { Test, TestingModule } from '@nestjs/testing';
import { HydraController } from './hydra.controller';

describe('HydraController', () => {
  let controller: HydraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HydraController],
    }).compile();

    controller = module.get<HydraController>(HydraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
