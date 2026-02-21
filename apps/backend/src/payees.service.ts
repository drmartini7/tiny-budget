import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Payee, CreatePayeeDto, UpdatePayeeDto } from '@fun-budget/domain';

@Injectable()
export class PayeesService {
  constructor(private prisma: PrismaService) {}

  public toDomainPayee(p: any): Payee {
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async createPayee(data: CreatePayeeDto): Promise<Payee> {
    const payee = await this.prisma.payee.create({
      data: {
        name: data.name,
      },
    });
    return this.toDomainPayee(payee);
  }

  async getPayees(search?: string): Promise<Payee[]> {
    const payees = await this.prisma.payee.findMany({
      where: search ? {
        name: { contains: search }
      } : {},
      orderBy: { name: 'asc' },
    });
    return payees.map(this.toDomainPayee);
  }

  async getPayeeById(id: string): Promise<Payee> {
    const payee = await this.prisma.payee.findUnique({
      where: { id },
    });
    if (!payee) {
      throw new NotFoundException('Payee not found');
    }
    return this.toDomainPayee(payee);
  }

  async updatePayee(id: string, data: UpdatePayeeDto): Promise<Payee> {
    const payee = await this.prisma.payee.update({
      where: { id },
      data,
    });
    return this.toDomainPayee(payee);
  }

  async deletePayee(id: string): Promise<void> {
    await this.prisma.payee.delete({
      where: { id },
    });
  }

  // Helper to find or create a payee by name
  async findOrCreatePayee(name: string): Promise<Payee> {
    const existing = await this.prisma.payee.findUnique({
      where: { name },
    });
    
    if (existing) {
      return this.toDomainPayee(existing);
    }

    return this.createPayee({ name });
  }
}
