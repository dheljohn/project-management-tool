import { Test, TestingModule } from '@nestjs/testing';
import { ChangelogController } from './changelog.controller';
import { ChangelogService } from './changelog.service';

describe('ChangelogController', () => {
  let controller: ChangelogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangelogController],
      providers: [ChangelogService],
    }).compile();

    controller = module.get<ChangelogController>(ChangelogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
