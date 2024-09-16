import { Test, TestingModule } from '@nestjs/testing';
import { JopService } from './jop.service';

describe('JopService', () => {
  let service: JopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JopService],
    }).compile();

    service = module.get<JopService>(JopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
