import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, Account } from '@fun-budget/domain';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getAccounts(): Promise<Account[]> {
    return this.accountsService.getAccounts();
  }

  @Get(':id')
  async getAccountById(@Param('id') id: string): Promise<Account> {
    return this.accountsService.getAccountById(id);
  }

  @Post()
  async createAccount(@Body() data: CreateAccountDto): Promise<Account> {
    return this.accountsService.createAccount(data);
  }
}
