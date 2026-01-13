import { Test, TestingModule } from '@nestjs/testing';
import { FundingAccountsController } from './funding-accounts.controller';

describe('FundingAccountsController', () => {
  let controller: FundingAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundingAccountsController],
    }).compile();

    controller = module.get<FundingAccountsController>(FundingAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
