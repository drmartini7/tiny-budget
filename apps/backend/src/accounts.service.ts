import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Account, CreateAccountDto } from '@fun-budget/domain';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  private toDomainAccount(a: any): Account {
    return {
      id: a.id,
      name: a.name,
      type: a.type as 'BANK' | 'CREDIT_CARD',
      financialInstitution: a.financialInstitution,
      active: a.active,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async createAccount(data: CreateAccountDto): Promise<Account> {
    const account = await this.prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        financialInstitution: data.financialInstitution,
        active: data.active,
      },
    });
    return this.toDomainAccount(account);
  }

  async getAccounts(): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      orderBy: { name: 'asc' },
    });
    return accounts.map(this.toDomainAccount);
  }

  async getAccountById(id: string): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return this.toDomainAccount(account);
  }
}
