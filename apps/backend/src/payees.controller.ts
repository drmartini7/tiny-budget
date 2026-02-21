import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PayeesService } from './payees.service';
import { CreatePayeeDto, UpdatePayeeDto, Payee } from '@fun-budget/domain';

@Controller('payees')
export class PayeesController {
  constructor(private readonly payeesService: PayeesService) {}

  @Get()
  async getPayees(@Query('search') search?: string): Promise<Payee[]> {
    return this.payeesService.getPayees(search);
  }

  @Get(':id')
  async getPayeeById(@Param('id') id: string): Promise<Payee> {
    return this.payeesService.getPayeeById(id);
  }

  @Post()
  async createPayee(@Body() data: CreatePayeeDto): Promise<Payee> {
    return this.payeesService.createPayee(data);
  }

  @Put(':id')
  async updatePayee(@Param('id') id: string, @Body() data: UpdatePayeeDto): Promise<Payee> {
    return this.payeesService.updatePayee(id, data);
  }

  @Delete(':id')
  async deletePayee(@Param('id') id: string): Promise<void> {
    return this.payeesService.deletePayee(id);
  }
}
