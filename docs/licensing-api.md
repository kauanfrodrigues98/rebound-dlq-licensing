# Licensing API

Este documento explica como usar o micro `rebound-dlq-licensing` e quais simulações fazer para validar o fluxo self-hosted.

## Visão Geral

O micro de Licensing roda na cloud da Rebound. O Rebound DLQ self-hosted do cliente conversa com ele para:

- ativar uma instalação;
- validar a licença;
- sincronizar novos limites;
- reportar uso básico;
- receber snapshots assinados de entitlements.

O self-hosted não acessa billing diretamente. Ele só entende a licença técnica retornada por este serviço.

## Autenticação Admin

Endpoints admin exigem o header:

```http
x-admin-api-key: <ADMIN_API_KEY>
```

O valor vem do `.env`:

```env
ADMIN_API_KEY=...
```

## Endpoints

### Ativar Licença

```http
POST /admin/licenses/activate
```

Cria uma nova instalação self-hosted e retorna o `licenseToken` que será configurado no ambiente do cliente.

Nesta etapa o serviço também gera um `installationFingerprint` seguro. Ele deve ser configurado no self-hosted junto com o `licenseToken`.

Use quando um contrato foi fechado e uma instalação precisa ser liberada.

Headers:

```http
Content-Type: application/json
x-admin-api-key: <ADMIN_API_KEY>
```

Body:

```json
{
  "customerId": "cus_acme",
  "contractId": "con_2026",
  "installationName": "Acme Production",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "entitlements": {
    "maxProjects": 10,
    "maxUsers": 30,
    "maxMonthlyEvents": 250000,
    "maxRetentionDays": 30,
    "aiAnalysisEnabled": true,
    "aiMonthlyCredits": 1000,
    "replayEnabled": true,
    "webhooksEnabled": true
  }
}
```

Resposta:

```json
{
  "licenseInstanceId": "lic_inst_xxx",
  "licenseToken": "rbd_lic_xxx",
  "installationFingerprint": "fp_xxx",
  "status": "active",
  "version": 1,
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "gracePeriodUntil": "2027-01-07T23:59:59.000Z",
  "entitlements": {
    "maxProjects": 10
  },
  "signature": "..."
}
```

Importante: o `licenseToken` bruto só aparece na ativação. No banco, o serviço salva apenas o hash.

### Check-In Da Licença

```http
POST /licenses/check-in
```

Endpoint chamado pelo self-hosted periodicamente, pelo botão "Sincronizar licença" ou após receber uma notificação futura.

Ele valida o token, confere o fingerprint da instalação, registra uso e retorna o snapshot atual.

Regra:

- se o `installationFingerprint` não bater com o salvo na ativação, retorna `403`;
- licença não deve existir sem fingerprint.

Body:

```json
{
  "licenseToken": "rbd_lic_xxx",
  "installationFingerprint": "fp_xxx",
  "currentLicenseVersion": 1,
  "appVersion": "0.1.0",
  "usage": {
    "projects": 3,
    "users": 12,
    "monthlyEvents": 25000
  }
}
```

Resposta:

```json
{
  "licenseInstanceId": "lic_inst_xxx",
  "status": "active",
  "version": 1,
  "hasUpdate": false,
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "gracePeriodUntil": "2027-01-07T23:59:59.000Z",
  "entitlements": {
    "maxProjects": 10
  },
  "signature": "..."
}
```

Se `hasUpdate` vier `true`, o self-hosted deve salvar o novo snapshot local.

### Buscar Licença Atual

```http
GET /licenses/:licenseInstanceId/current
```

Retorna o snapshot atual da licença.

Uso principal: debug, suporte ou tela administrativa.

Exemplo:

```http
GET /licenses/lic_inst_xxx/current
```

Resposta:

```json
{
  "licenseInstanceId": "lic_inst_xxx",
  "status": "active",
  "version": 1,
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "gracePeriodUntil": "2027-01-07T23:59:59.000Z",
  "entitlements": {
    "maxProjects": 10
  },
  "signature": "..."
}
```

### Reemitir Licença

```http
POST /admin/licenses/:licenseInstanceId/reissue
```

Cria uma nova versão da licença para upgrade, downgrade, renovação ou mudança de recursos.

Headers:

```http
Content-Type: application/json
x-admin-api-key: <ADMIN_API_KEY>
```

Body:

```json
{
  "expiresAt": "2027-12-31T23:59:59.000Z",
  "entitlements": {
    "maxProjects": 25,
    "maxUsers": 75,
    "maxMonthlyEvents": 1000000,
    "maxRetentionDays": 90,
    "aiAnalysisEnabled": true,
    "aiMonthlyCredits": 5000,
    "replayEnabled": true,
    "webhooksEnabled": true,
    "ssoEnabled": true
  }
}
```

Resposta:

```json
{
  "licenseInstanceId": "lic_inst_xxx",
  "status": "active",
  "version": 2,
  "expiresAt": "2027-12-31T23:59:59.000Z",
  "gracePeriodUntil": "2028-01-07T23:59:59.000Z",
  "entitlements": {
    "maxProjects": 25
  },
  "signature": "..."
}
```

No próximo check-in com versão antiga, o self-hosted recebe `hasUpdate=true`.

## Simulações Recomendadas

### Fluxo Feliz

1. Chame `POST /admin/licenses/activate`.
2. Copie `licenseToken` e `licenseInstanceId`.
3. Chame `POST /licenses/check-in` com `currentLicenseVersion: 0`.
4. Confirme que `hasUpdate=true`.
5. Chame `POST /licenses/check-in` de novo com a versão atual.
6. Confirme que `hasUpdate=false`.

### Upgrade

1. Ative uma licença.
2. Faça check-in e salve a versão atual.
3. Chame `POST /admin/licenses/:licenseInstanceId/reissue` com limites maiores.
4. Faça check-in informando a versão antiga.
5. Confirme que `hasUpdate=true` e que os novos entitlements chegaram.

### Fingerprint Inválido

1. Ative uma licença.
2. Faça check-in com `installationFingerprint` diferente.
3. O serviço deve retornar `403`.

### Token Inválido

1. Faça check-in com um `licenseToken` inexistente.
2. O serviço deve retornar `401`.

## Como O Self-Hosted Deve Usar

No primeiro setup:

1. Admin do cliente informa o `licenseToken`.
2. Self-hosted salva o `installationFingerprint` recebido na ativação.
3. Self-hosted chama `POST /licenses/check-in`.
4. Self-hosted salva localmente:
   - `licenseInstanceId`;
   - `version`;
   - `status`;
   - `expiresAt`;
   - `gracePeriodUntil`;
   - `entitlements`;
   - `signature`.

Geração usada pelo licensing:

```ts
import { createHash, randomBytes } from 'node:crypto';

const secret = randomBytes(32).toString('base64url');
const installationFingerprint = `fp_${createHash('sha256')
  .update(`rebound-dlq-installation:${secret}`)
  .digest('hex')}`;
```

O self-hosted recebe e salva apenas o fingerprint.

Na rotina:

- Executar check-in automático em intervalo configurável.
- Ter botão "Sincronizar licença" na tela de configurações.
- Continuar usando snapshot local se a cloud estiver indisponível.
- Respeitar `gracePeriodUntil` antes de bloquear recursos contratados.

## Requestly

A collection para simulação está em:

```text
docs/requestly/rebound-dlq-licensing.postman_collection.json
```

O environment local com a `ADMIN_API_KEY` está em:

```text
.requestly-local/rebound-dlq-licensing.local.postman_environment.json
```

Essa pasta é ignorada pelo git.
