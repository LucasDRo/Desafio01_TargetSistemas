import { Body, Controller, Post } from '@nestjs/common';
import { ComissionService } from './comission.service';
import { ComissionSales } from './dtos/comission_sales.dto';
import type { SalesDTO } from './dtos/sales.dto';

@Controller('comission')
export class ComissionController {
    constructor(
        private comissionService : ComissionService
    ){}

    @Post("/calc")
    comission(@Body() request: SalesDTO): ComissionSales[]{
       return this.comissionService.comission(request.vendas);
    }
}
