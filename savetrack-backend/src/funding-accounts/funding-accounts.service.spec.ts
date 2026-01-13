import { Test, TestingModule } from '@nestjs/testing';
import { FundingAccountsService } from './funding-accounts.service';

describe('FundingAccountsService', () => {
  let service: FundingAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundingAccountsService],
    }).compile();

    service = module.get<FundingAccountsService>(FundingAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
