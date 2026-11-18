# Desafio técnico — API de cálculo de comissões

API desenvolvida em **TypeScript com NestJS** como solução para um desafio técnico de processo seletivo. A aplicação recebe uma lista de vendas, calcula a comissão de cada venda e retorna os resultados agrupados por vendedor.

## Funcionalidades

- Receber vendas por meio de um endpoint HTTP.
- Calcular comissões conforme a faixa de valor de cada venda.
- Agrupar os resultados por vendedor, com quantidade de vendas, valor vendido e comissão acumulada.
- Retornar erro HTTP `400` quando o campo `vendas` não for um array.

## Tecnologias

- Node.js
- TypeScript 6
- NestJS 12 com Express
- npm para gerenciamento de dependências

## Regras de negócio

A faixa de comissão é determinada pelo valor de **cada venda**, antes do agrupamento por vendedor.

| Valor da venda | Comissão |
| --- | --- |
| Menor que R$ 100,00 | 0% |
| De R$ 100,00 até abaixo de R$ 500,00 | 1% |
| A partir de R$ 500,00 | 5% |

Na implementação atual:

- Cada comissão é arredondada para o inteiro mais próximo com `Math.round`. Por exemplo, uma venda de R$ 150,00 gera R$ 2,00 de comissão, pois o cálculo de 1% resulta em R$ 1,50.
- O valor de cada venda é convertido em centavos e arredondado antes da soma do total vendido. O resultado é convertido novamente para reais na resposta.
- O campo `total` corresponde à soma de `totalVendas` e `totalComissao`.
- Uma lista de vendas vazia retorna `[]`.
- Os vendedores aparecem na ordem de sua primeira ocorrência na entrada.

## Como executar

### Pré-requisitos

- Node.js 20 ou superior, conforme o requisito da dependência NestJS.
- npm instalado.

A compilação foi verificada localmente com Node.js `24.11.1` e npm `11.19.1`.

### Instalação

No diretório que contém o arquivo `package.json`, execute:

```bash
npm ci
```

### Desenvolvimento

```bash
npm run dev
```

A API fica disponível em `http://localhost:3000`. O comando inicia a aplicação com recompilação automática ao alterar os arquivos.

Para iniciar sem monitorar alterações:

```bash
npm start
```

### Build e execução do código compilado

```bash
npm run build
npm run start:prod
```

A porta padrão é `3000` e pode ser alterada pela variável de ambiente `PORT`. Não é necessário configurar banco de dados ou arquivo `.env` para executar a aplicação.

Exemplo no PowerShell:

```powershell
$env:PORT = '3001'
npm run dev
```

## Uso da API

### Calcular comissões

```http
POST /comission/calc
Content-Type: application/json
```

O caminho utiliza a grafia `comission`, conforme definido no código.

**Corpo da requisição:**

```json
{
  "vendas": [
    { "vendedor": "Ana", "valor": 80 },
    { "vendedor": "Ana", "valor": 200 },
    { "vendedor": "Ana", "valor": 500 },
    { "vendedor": "Bruno", "valor": 1000 }
  ]
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `vendas` | Array | Lista de vendas a processar. |
| `vendas[].vendedor` | String | Nome utilizado para agrupar as vendas. |
| `vendas[].valor` | Number | Valor da venda em reais. |

**Resposta de sucesso — HTTP `201 Created`:**

```json
[
  {
    "vendedor": "Ana",
    "quantidadeVendas": 3,
    "totalVendas": 780,
    "totalComissao": 27,
    "total": 807
  },
  {
    "vendedor": "Bruno",
    "quantidadeVendas": 1,
    "totalVendas": 1000,
    "totalComissao": 50,
    "total": 1050
  }
]
```

Para Ana, as comissões são R$ 0,00, R$ 2,00 e R$ 25,00, totalizando R$ 27,00.

### Exemplo no PowerShell

Com a aplicação em execução, abra outro terminal e envie:

```powershell
$body = @{
  vendas = @(
    @{ vendedor = 'Ana'; valor = 80 }
    @{ vendedor = 'Ana'; valor = 200 }
    @{ vendedor = 'Ana'; valor = 500 }
    @{ vendedor = 'Bruno'; valor = 1000 }
  )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod `
  -Uri 'http://localhost:3000/comission/calc' `
  -Method Post `
  -ContentType 'application/json' `
  -Body $body
```

### Exemplo de entrada inválida

Requisição:

```json
{
  "vendas": "valor inválido"
}
```

Resposta — HTTP `400 Bad Request`:

```json
{
  "message": "Invalid JSON format",
  "error": "Bad Request",
  "statusCode": 400
}
```

## Organização do projeto

```text
src/
├── main.ts                         # Inicialização do servidor e definição da porta
├── app.module.ts                   # Módulo principal
└── comission/
    ├── comission.module.ts         # Registro do controller e do service
    ├── comission.controller.ts     # Endpoint de cálculo
    ├── comission.service.ts        # Regras de comissão e agrupamento
    ├── sale.entity.ts              # Interface de uma venda
    └── dtos/
        ├── sales.dto.ts           # Contrato de entrada
        └── comission_sales.dto.ts # Contrato de saída
```

O controller recebe a requisição e delega o processamento ao service. O service utiliza um `Map` para acumular os valores de cada vendedor em uma única passagem pela lista. Os contratos de entrada e saída são definidos com interfaces TypeScript.

O processamento ocorre em memória durante a requisição, sem persistência de dados.

## Verificação e escopo atual

A compilação pode ser verificada com:

```bash
npm run build
```

O repositório contém configuração do Jest e scripts de teste no `package.json`, mas ainda não possui testes automatizados implementados.

A validação atual verifica se `vendas` é um array. Os campos individuais de cada venda ainda não possuem validação em tempo de execução; por isso, os exemplos pressupõem nomes de vendedores e valores numéricos válidos.

## Possíveis evoluções

- Adicionar testes para limites das faixas de comissão, arredondamento, agrupamento e entradas inválidas.
- Validar os campos de cada venda em tempo de execução.
- Padronizar a precisão monetária das comissões conforme os requisitos de negócio.
- Documentar o contrato da API com Swagger/OpenAPI.
