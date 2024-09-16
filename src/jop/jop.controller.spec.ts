import { Test, TestingModule } from '@nestjs/testing';
import { JopController } from './jop.controller';
import { JopService } from './jop.service';

describe('JopController', () => {
  let controller: JopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JopController],
      providers: [JopService],
    }).compile();

    controller = module.get<JopController>(JopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
