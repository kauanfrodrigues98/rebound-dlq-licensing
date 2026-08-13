# Rebound DLQ Licensing

Microserviço responsável por gerenciar licenças, entitlements e check-ins das instalações self-hosted do Rebound DLQ.

Este serviço deve rodar na cloud da Rebound. O core self-hosted do cliente usa este micro apenas para ativar, validar e sincronizar a licença.

## Responsabilidades

- Ativar uma instalação self-hosted.
- Emitir token de licença para a instalação.
- Armazenar apenas hash do token de licença.
- Guardar snapshots assinados de entitlements.
- Receber check-ins periódicos do self-hosted.
- Registrar uso reportado pelo cliente.
- Reemitir licença em caso de upgrade, downgrade ou renovação.

## Banco

Este micro usa um banco próprio:

```env
DB_NAME=rebound_dlq_licensing
```

Tabelas principais:

- `license_instances`
- `license_tokens`
- `entitlement_snapshots`
- `license_check_ins`

## Setup

```bash
npm install
```

Configure o `.env` a partir de `.env.example`.

## Migrations

Para consultar migrations pendentes:

```bash
npm run migration:show
```

Para aplicar migrations no Postgres configurado no `.env`:

```bash
npm run migration:run
```

Para reverter a última migration:

```bash
npm run migration:revert
```

## Rodar

```bash
npm run start:dev
```

## Validar

```bash
npm run build
npm run lint
npm run test:e2e
npm audit --omit=dev
```

## API

A documentação dos endpoints e simulações está em:

[docs/licensing-api.md](docs/licensing-api.md)

## Requestly

Collection para testar manualmente:

[docs/requestly/rebound-dlq-licensing.postman_collection.json](docs/requestly/rebound-dlq-licensing.postman_collection.json)

Environment local com segredos fica em `.requestly-local/` e está ignorado pelo git.

## License

This project is proprietary software owned by Codify Labs / Rebound DLQ.
Use, distribution, modification, or redistribution is only allowed under a valid commercial agreement or written permission.
