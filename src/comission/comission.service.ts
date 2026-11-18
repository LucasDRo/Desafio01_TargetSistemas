import { BadRequestException, Injectable } from '@nestjs/common';
import { ComissionSales } from './dtos/comission_sales.dto';
import { Sale } from './sale.entity';

@Injectable()
export class ComissionService {

    comission(sales: Sale[]): ComissionSales[] {

        if (!Array.isArray(sales)) throw new BadRequestException("Invalid JSON format")

        const sellers = new Map<string, { value: number; qtt: number, totalComission: number }>();

        //ITERANDO SOBRE AS VENDAS
        for (const sale of sales) {
            const obj = sellers.get(sale.vendedor) || {
                value: 0,
                qtt: 0,
                totalComission: 0,
            };

            //CONVERSÃO DO VALOR DA VENDA PARA CENTAVOS, EVITANDO ERROS
            const value = Math.round(sale.valor * 100);

            //AGRUPAMENTO DE VENDAS POR VENDEDOR
            sellers.set(sale.vendedor, {
                value: obj.value + value,
                qtt: obj.qtt + 1,
                //SOMATÓRIA DE COMISSÃO TOTAL SOBRE CADA VENDA POR VENDEDOR
                totalComission: obj.totalComission + this.comissionValueCalc(sale.valor),
            });
        }

        const comissionSale: ComissionSales[] = [];

        sellers.forEach((dados, vendedor) => {

            //CONVERSÃO DE CENTAVOS PARA VALOR REAIS
            const totalVendas = dados.value / 100;
            comissionSale.push({
                vendedor,
                quantidadeVendas: dados.qtt,
                totalVendas: totalVendas,
                totalComissao: dados.totalComission,
                total: totalVendas + dados.totalComission
            });
        });

        return comissionSale;
    }

    //FUNÇÃO PARA CÁLCULO DE COMISSÃO, SEGUINDO AS REGRAS PARA O VALOR:
    // MAIOR QUE 500 = 5%
    // MENOR QUE 500 && MENOR OU IGUAL A 100 = 1%
    // MENOR QUE 100 = 0%
    comissionValueCalc(value: number) {

        if (value >= 500) {
            return Math.round(value * 0.05);
        }

        if (value < 500 && value >= 100) {
            return Math.round(value * 0.01);
        }

        return 0;
    }
}
