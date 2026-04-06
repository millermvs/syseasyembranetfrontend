# 📱 Guia de API para Frontend - cadastroviasnmp

**Versão:** 1.0
**Data:** 2026-04-06
**Stack Backend:** Java 21, Spring Boot 4.0.2, PostgreSQL
**Base URL:** `http://localhost:8080/api/v1`

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Tratamento de Erros](#tratamento-de-erros)
4. [Endpoints - Redes](#endpoints---redes)
5. [Endpoints - Equipamentos](#endpoints---equipamentos)
6. [DTOs de Response](#dtos-de-response)
7. [Fluxos de Negócio](#fluxos-de-negócio)
8. [Validações e Regras](#validações-e-regras)

---

## Visão Geral

A API segue padrão **REST** com responses em **JSON**. Todos os endpoints devem incluir headers:

```
Content-Type: application/json
Accept: application/json
```

### Convenções
- **GET** → Recuperar dados (idempotente)
- **POST** → Criar dados
- **PUT** → Atualizar dados existentes
- **DELETE** → Remover dados

### Status HTTP Esperados

| Código | Significado | Quando Acontece |
|--------|-------------|-----------------|
| 200 | OK | Requisição bem-sucedida (GET, PUT, DELETE) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Recurso já existe (duplicado) |
| 422 | Unprocessable Entity | Violação de regra de negócio |
| 500 | Internal Server Error | Erro no servidor |

---

## Autenticação

**Status Atual:** Nenhuma autenticação implementada (desenvolvimento).
Adicionar autenticação (JWT, OAuth2, etc.) em produção.

---

## Tratamento de Erros

### Formato Padrão de Erro

```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 404,
  "message": "Rede não encontrada."
}
```

### Tipos de Erro por Exceção

| Exceção | HTTP | Mensagem | Ação no Frontend |
|---------|------|---------|------------------|
| `NaoEncontradoException` | 404 | "Rede não encontrada." ou "Equipamento não encontrado." | Exibir mensagem; redirecionar para listagem |
| `JaCadastradoException` | 409 | "Rede já cadastrada no sistema." | Exibir aviso; sugerir editar existente |
| `RegraDeNegocioException` | 422 | "Não é possível excluir: rede possui equipamentos vinculados." ou "O IP ... não responde ao ping." | Exibir erro contextualizado; não permitir ação |

---

## Endpoints - Redes

### 1. Listar Redes (com Paginação)

```http
GET /redes/listar?page=0&size=20
```

**Parâmetros Query (opcionais):**
- `page` (int, default=0): Número da página (começa em 0)
- `size` (int, default=20): Quantidade de registros por página

**Response 200:**
```json
{
  "content": [
    {
      "idRede": 1,
      "rede": "192.168.1.0",
      "modoWireless": "AP",
      "totalEquipamentos": 45
    },
    {
      "idRede": 2,
      "rede": "192.168.2.0",
      "modoWireless": "STATION",
      "totalEquipamentos": 12
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 1,
  "totalElements": 2,
  "last": true,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}
```

**JavaScript Exemplo:**
```javascript
async function listarRedes(page = 0, size = 20) {
  const response = await fetch(`http://localhost:8080/api/v1/redes/listar?page=${page}&size=${size}`);
  const data = await response.json();
  return data.content; // Array de redes
}
```

---

### 2. Cadastrar Rede

```http
POST /redes/cadastrar
Content-Type: application/json
```

**Body (Request):**
```json
{
  "rede": "192.168.3.0",
  "modoWireless": "AP"
}
```

**Validações:**
- `rede`: Obrigatório, não pode estar vazio. Formato: "XXX.XXX.XXX.0" (CIDR /24)
- `modoWireless`: Obrigatório. Valores aceitos: "AP" ou "STATION"

**Response 200 (Sucesso):**
```json
{
  "idRede": 3,
  "rede": "192.168.3.0",
  "modoWireless": "AP",
  "totalEquipamentos": 0
}
```

**Response 409 (Já Cadastrada):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 409,
  "message": "Rede já cadastrada no sistema."
}
```

**JavaScript Exemplo:**
```javascript
async function cadastrarRede(rede, modoWireless) {
  const response = await fetch('http://localhost:8080/api/v1/redes/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rede, modoWireless })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

---

### 3. Mapear Rede (Varredura SNMP)

```http
POST /redes/mapear/{id}
```

**Parâmetros:**
- `{id}` (path): ID da rede a mapear

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "ip": "192.168.1.2",
    "rede": "192.168.1.0",
    "modoWireless": "AP",
    "mac": "AA:BB:CC:DD:EE:01",
    "nomeRadio": "Radio-01",
    "ssid": "Network-A",
    "nivelDeSinal": "-45 dBm",
    "canalRadio": "6",
    "macDoAp": "AA:BB:CC:DD:EE:FF",
    "Status": "SUCESSO",
    "modeloDoRadio": "TP-Link WR940N"
  },
  {
    "id": 2,
    "ip": "192.168.1.3",
    "rede": "192.168.1.0",
    "modoWireless": "AP",
    "mac": "AA:BB:CC:DD:EE:02",
    "nomeRadio": "Radio-02",
    "ssid": "Network-A",
    "nivelDeSinal": "-50 dBm",
    "canalRadio": "11",
    "macDoAp": "AA:BB:CC:DD:EE:FF",
    "Status": "SUCESSO",
    "modeloDoRadio": "TP-Link WR940N"
  },
  {
    "ip": "192.168.1.50",
    "Status": "Erro ao conectar SNMP do rádio: 192.168.1.50"
  }
]
```

**⚠️ Atenção:** Este endpoint é **síncrono e bloqueante**. Uma rede com 254 IPs pode levar **vários minutos** (até 10-15 min).

**Status Possíveis:**
- `"SUCESSO"` → Equipamento foi encontrado e dados SNMP foram coletados
- Mensagem de erro → Falha na comunicação SNMP ou ping não respondeu

**JavaScript Exemplo:**
```javascript
async function mapearRede(idRede) {
  const response = await fetch(`http://localhost:8080/api/v1/redes/mapear/${idRede}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json(); // Array de equipamentos
}
```

---

### 4. Excluir Rede

```http
DELETE /redes/excluir?id={id}
```

**Parâmetros:**
- `id` (query): ID da rede a excluir

**Response 200 (Sucesso):**
```json
{
  "idRede": 1,
  "rede": "192.168.1.0",
  "modoWireless": "AP",
  "totalEquipamentos": 0
}
```

**Response 422 (Rede com Equipamentos):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 422,
  "message": "Não é possível excluir: rede possui equipamentos vinculados."
}
```

**Response 404 (Rede não Encontrada):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 404,
  "message": "Rede não encontrada."
}
```

**JavaScript Exemplo:**
```javascript
async function excluirRede(idRede) {
  const response = await fetch(`http://localhost:8080/api/v1/redes/excluir?id=${idRede}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

---

## Endpoints - Equipamentos

### 1. Listar Equipamentos (com Paginação)

```http
GET /equipamentos/listar?page=0&size=20
```

**Parâmetros Query (opcionais):**
- `page` (int, default=0): Número da página
- `size` (int, default=20): Quantidade de registros por página

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "ip": "192.168.1.55",
      "rede": "192.168.1.0",
      "modoWireless": "AP",
      "mac": "AA:BB:CC:DD:EE:FF",
      "nomeRadio": "Radio-Principal",
      "ssid": "Network-A",
      "nivelDeSinal": "-45 dBm",
      "canalRadio": "6",
      "macDoAp": "AA:BB:CC:DD:EE:FF",
      "Status": "SUCESSO",
      "modeloDoRadio": "TP-Link WR940N"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```

**JavaScript Exemplo:**
```javascript
async function listarEquipamentos(page = 0, size = 20) {
  const response = await fetch(`http://localhost:8080/api/v1/equipamentos/listar?page=${page}&size=${size}`);
  const data = await response.json();
  return data.content;
}
```

---

### 2. Cadastrar Equipamento (Manual)

```http
POST /equipamentos/cadastrar
Content-Type: application/json
```

**Body (Request):**
```json
{
  "ip": "192.168.1.100",
  "mac": "AA:BB:CC:DD:EE:01",
  "nomeRadio": "Radio-Novo",
  "ssid": "Network-A",
  "nivelDeSinal": "-48 dBm",
  "canalRadio": "6",
  "macDoAp": "AA:BB:CC:DD:EE:FF",
  "modeloDoRadio": "TP-Link WR940N"
}
```

**Lógica Automática:**
- Se a rede (baseada no IP) **não existe**, será **criada automaticamente** com modo padrão "AP"
- Se a rede **já existe**, o equipamento será vinculado a ela

**Response 200 (Sucesso):**
```json
{
  "id": 10,
  "ip": "192.168.1.100",
  "rede": "192.168.1.0",
  "modoWireless": "AP",
  "mac": "AA:BB:CC:DD:EE:01",
  "nomeRadio": "Radio-Novo",
  "ssid": "Network-A",
  "nivelDeSinal": "-48 dBm",
  "canalRadio": "6",
  "macDoAp": "AA:BB:CC:DD:EE:FF",
  "Status": "SUCESSO",
  "modeloDoRadio": "TP-Link WR940N"
}
```

**Response 422 (Equipamento Já Cadastrado):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 422,
  "message": "Equipamento já cadastrado no sistema."
}
```

---

### 3. Buscar Informações de Equipamento (por IP via SNMP)

```http
GET /equipamentos/mapear/{ip}
```

**Parâmetros:**
- `{ip}` (path): IP do equipamento (ex: "192.168.1.55")

**Lógica:**
1. Faz **Ping** no IP. Se não responder → erro 422
2. Executa **SNMP GET** com 7 OIDs para coletar dados
3. Se equipamento **não existe** → cria novo
4. Se equipamento **existe** → compara e atualiza se houver mudanças

**Response 200 (Sucesso):**
```json
{
  "id": 1,
  "ip": "192.168.1.55",
  "rede": "192.168.1.0",
  "modoWireless": "AP",
  "mac": "AA:BB:CC:DD:EE:FF",
  "nomeRadio": "Radio-Principal",
  "ssid": "Network-A",
  "nivelDeSinal": "-45 dBm",
  "canalRadio": "6",
  "macDoAp": "AA:BB:CC:DD:EE:FF",
  "Status": "SUCESSO",
  "modeloDoRadio": "TP-Link WR940N"
}
```

**Response 422 (IP não Responde ao Ping):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 422,
  "message": "O IP 192.168.1.55 não responde ao ping. Verifique se o equipamento está ligado e conectado à rede."
}
```

**Response 422 (SNMP Inacessível):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 422,
  "message": "Erro ao conectar SNMP do rádio: 192.168.1.55"
}
```

**JavaScript Exemplo:**
```javascript
async function buscarEquipamentoPorIP(ip) {
  const response = await fetch(`http://localhost:8080/api/v1/equipamentos/mapear/${ip}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

---

### 4. Editar Equipamento

```http
PUT /equipamentos/editar?id={id}
Content-Type: application/json
```

**Parâmetros:**
- `id` (query): ID do equipamento a editar

**Body (Request):**
```json
{
  "mac": "AA:BB:CC:DD:EE:01",
  "nomeRadio": "Radio-Atualizado",
  "ssid": "Network-A",
  "nivelDeSinal": "-50 dBm",
  "canalRadio": "11",
  "macDoAp": "AA:BB:CC:DD:EE:FF",
  "modeloDoRadio": "TP-Link WR940N V2"
}
```

**⚠️ Campos NÃO editáveis:**
- `ip` (chave lógica; não muda)
- `rede` (uma vez vinculado, não muda)
- `modoWireless` (herdado da rede; imutável)

**Response 200 (Sucesso):**
```json
{
  "id": 1,
  "ip": "192.168.1.55",
  "rede": "192.168.1.0",
  "modoWireless": "AP",
  "mac": "AA:BB:CC:DD:EE:01",
  "nomeRadio": "Radio-Atualizado",
  "ssid": "Network-A",
  "nivelDeSinal": "-50 dBm",
  "canalRadio": "11",
  "macDoAp": "AA:BB:CC:DD:EE:FF",
  "Status": "SUCESSO",
  "modeloDoRadio": "TP-Link WR940N V2"
}
```

**Response 404 (Equipamento não Encontrado):**
```json
{
  "datetime": "2026-04-06T14:30:45.123456",
  "status": 404,
  "message": "Equipamento não encontrado."
}
```

---

## DTOs de Response

### RedeResponseDto
```typescript
interface Rede {
  idRede: number;           // ID único da rede
  rede: string;             // Endereço (ex: "192.168.1.0")
  modoWireless: string;     // "AP" ou "STATION" (IMUTÁVEL)
  totalEquipamentos: number; // Contagem de equipamentos nesta rede
}
```

### EquipamentoResponseDto
```typescript
interface Equipamento {
  id: number;              // ID único do equipamento
  ip: string;              // Endereço IP (chave lógica)
  rede: string;            // Endereço da rede (ex: "192.168.1.0")
  modoWireless: string;    // Modo herdado da rede ("AP" ou "STATION")
  mac: string;             // Endereço MAC (ex: "AA:BB:CC:DD:EE:FF")
  nomeRadio: string;       // Nome/identificação do equipamento
  ssid: string;            // SSID da rede Wi-Fi
  nivelDeSinal: string;    // Nível de sinal em dBm (ex: "-45 dBm")
  canalRadio: string;      // Canal de rádio (ex: "6")
  macDoAp: string;         // MAC do Access Point associado
  Status: string;          // "SUCESSO" ou mensagem de erro
  modeloDoRadio: string;   // Modelo do equipamento
}
```

---

## Fluxos de Negócio

### Fluxo 1: Criar Rede e Mapear Equipamentos

```
1. POST /redes/cadastrar
   ├─ Request: { "rede": "192.168.1.0", "modoWireless": "AP" }
   └─ Response: { "idRede": 1, ... }

2. POST /redes/mapear/1
   ├─ Backend: Varre .2 até .254
   ├─ Para cada IP alcançável: executa SNMP GET
   └─ Response: Array de equipamentos encontrados

3. GET /equipamentos/listar?page=0
   └─ Todos os equipamentos mapeados aparecem na listagem
```

### Fluxo 2: Cadastro Manual de Equipamento

```
1. POST /equipamentos/cadastrar
   ├─ Request: { "ip": "192.168.1.100", "mac": "...", ... }
   ├─ Backend: Verifica se rede 192.168.1.0 existe
   ├─ Se não existe: cria com modo padrão "AP"
   ├─ Se existe: vincula ao equipamento
   └─ Response: { "id": 10, "rede": "192.168.1.0", ... }

2. GET /equipamentos/listar
   └─ Equipamento manual agora aparece
```

### Fluxo 3: Buscar Equipamento via IP (SNMP)

```
1. GET /equipamentos/mapear/{ip}
   ├─ Backend: Faz ping no IP
   ├─ Se responde: executa SNMP GET
   ├─ Se não existe no BD: cria novo
   ├─ Se existe: atualiza se houver mudanças
   └─ Response: Dados completos do equipamento

2. Dados são salvos e aparecem em GET /equipamentos/listar
```

### Fluxo 4: Excluir Rede

```
1. DELETE /redes/excluir?id=1
   ├─ Backend: Verifica se existem equipamentos
   ├─ Se SIM: retorna erro 422
   └─ Se NÃO: exclui rede

2. Lógica: Equipamentos devem ser deletados individualmente
   ├─ Via UI: "Tem certeza que deseja desassociar X equipamentos?"
   └─ Opção: Auto-desassociar ou confirmar deleção em massa
```

---

## Validações e Regras

### Regras de Rede

| Regra | Validação | Erro |
|-------|-----------|------|
| **Modo Imutável** | `modoWireless` não pode ser alterado após criação | Não tente enviar em requests subsequentes |
| **Rede Única** | Não pode cadastrar mesma rede 2x | 409 Conflict |
| **Sem Equipamentos** | Só pode excluir rede vazia | 422 Unprocessable Entity |

### Regras de Equipamento

| Regra | Validação | Erro |
|-------|-----------|------|
| **IP Único** | Não pode cadastrar mesmo IP 2x | 422 Unprocessable Entity |
| **Rede Obrigatória** | Todo equipamento vinculado a uma rede | Auto-criação se não existir |
| **Modo Herdado** | `modoWireless` vem da rede, não editável | Campo é READ-ONLY |
| **SNMP Obrigatório** | Para buscar via IP, equipamento precisa responder SNMP | 422 se SNMP falhar |

### Validações de Entrada (Frontend)

**Ao cadastrar Rede:**
```javascript
function validarRede(rede, modoWireless) {
  if (!rede || rede.trim() === '') {
    throw new Error('Rede não pode estar vazia');
  }
  if (!modoWireless || !['AP', 'STATION'].includes(modoWireless)) {
    throw new Error('Modo wireless deve ser "AP" ou "STATION"');
  }
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.0$/.test(rede)) {
    throw new Error('Formato inválido. Use: 192.168.1.0');
  }
}
```

**Ao cadastrar Equipamento:**
```javascript
function validarEquipamento(equipamento) {
  const { ip, mac, nomeRadio, ssid, nivelDeSinal, canalRadio, macDoAp, modeloDoRadio } = equipamento;

  if (!ip || ip.trim() === '') throw new Error('IP é obrigatório');
  if (!mac || mac.trim() === '') throw new Error('MAC é obrigatório');
  if (!nomeRadio || nomeRadio.trim() === '') throw new Error('Nome do rádio é obrigatório');

  // Validar formato de IP
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    throw new Error('IP inválido');
  }

  // Validar formato de MAC
  if (!/^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$/i.test(mac)) {
    throw new Error('MAC inválido. Use: AA:BB:CC:DD:EE:FF');
  }
}
```

---

## Exemplos com React/TypeScript

### Componente: Listar Redes

```typescript
import { useState, useEffect } from 'react';

interface Rede {
  idRede: number;
  rede: string;
  modoWireless: string;
  totalEquipamentos: number;
}

export function ListarRedes() {
  const [redes, setRedes] = useState<Rede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    buscarRedes();
  }, [page]);

  async function buscarRedes() {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/redes/listar?page=${page}&size=20`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setRedes(data.content);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setRedes([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro: {error}</div>;

  return (
    <div>
      <h1>Redes Cadastradas</h1>
      <table>
        <thead>
          <tr>
            <th>Rede</th>
            <th>Modo</th>
            <th>Equipamentos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {redes.map(rede => (
            <tr key={rede.idRede}>
              <td>{rede.rede}</td>
              <td>{rede.modoWireless}</td>
              <td>{rede.totalEquipamentos}</td>
              <td>
                <button onClick={() => mapearRede(rede.idRede)}>Mapear</button>
                <button onClick={() => excluirRede(rede.idRede)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setPage(page - 1)} disabled={page === 0}>Anterior</button>
      <button onClick={() => setPage(page + 1)}>Próxima</button>
    </div>
  );

  async function mapearRede(idRede: number) {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/redes/mapear/${idRede}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Erro ao mapear rede');

      const equipamentos = await response.json();
      console.log('Equipamentos encontrados:', equipamentos);
      alert(`Encontrados ${equipamentos.length} equipamentos`);
      buscarRedes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  async function excluirRede(idRede: number) {
    if (!confirm('Tem certeza?')) return;

    try {
      const response = await fetch(`/api/v1/redes/excluir?id=${idRede}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      buscarRedes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }
}
```

---

## Resumo de Endpoints

| Método | Endpoint | Descrição | Status Sucesso |
|--------|----------|-----------|-----------------|
| GET | `/redes/listar?page=0&size=20` | Listar redes com paginação | 200 |
| POST | `/redes/cadastrar` | Criar nova rede | 200 |
| POST | `/redes/mapear/{id}` | Varrer e descobrir equipamentos | 200 |
| DELETE | `/redes/excluir?id={id}` | Excluir rede | 200 |
| GET | `/equipamentos/listar?page=0&size=20` | Listar equipamentos | 200 |
| POST | `/equipamentos/cadastrar` | Cadastrar equipamento manual | 200 |
| GET | `/equipamentos/mapear/{ip}` | Buscar equipamento por IP (SNMP) | 200 |
| PUT | `/equipamentos/editar?id={id}` | Atualizar dados do equipamento | 200 |

---

## Contatos

- **Backend Engineer:** Miller
- **Database:** PostgreSQL
- **Stack:** Java 21, Spring Boot 4.x
- **Documentação Banco:** Ver `blueprint-persistencia.md`
- **Documentação Services:** Ver `blueprint-exposicao.md`

---

**Última Atualização:** 2026-04-06
**Status da API:** ✅ Pronto para Desenvolvimento Frontend
