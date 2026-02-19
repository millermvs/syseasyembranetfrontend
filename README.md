# 🖥️ EasyEmbranet — Interface Web (Frontend Angular)

Interface web responsável por **gerenciar redes e visualizar dispositivos encontrados via mapeamento SNMP**.

Este frontend consome a API do backend (Scanner SNMP) e permite:

- Mapear redes
- Visualizar dispositivos encontrados
- Adicionar dispositivos ao inventário
- Gerenciar redes cadastradas
- Visualizar status e nível de sinal dos rádios

---

## ✅ O que este projeto faz

- Lista redes cadastradas
- Executa mapeamento de rede via API
- Exibe dispositivos encontrados dinamicamente
- Indica:
  - Status do SNMP (OK / erro)
  - IP do dispositivo
  - SSID
  - Nome do rádio
  - Nível de sinal (com indicador visual)
- Permite adicionar dispositivos encontrados ao inventário
- Interface responsiva com layout em cards

---

## 🧩 Arquitetura

O frontend consome a API:

POST /api/v1/redes/mapear/{idRede}

### Exemplo de resposta da API:

[
  {
    "Status": "Ok",
    "ip": "10.10.29.27",
    "mac": "04:18:d6:5f:89:78",
    "nivelDeSinal": "-63",
    "nomeRadio": "6065_RES_FERNANDO_MIRANDA",
    "ssid": "lafbase03"
  }
]

A interface renderiza dinamicamente esses dados usando:

- Angular Signals
- *ngFor
- Component-based layout
- Bootstrap 5

---

## 🛠️ Tecnologias

- Angular (Standalone Components)
- TypeScript
- Bootstrap 5
- Angular Signals
- HttpClient (REST API)

---

## 🚀 Como executar

### 📌 Pré-requisitos

- Node.js 18+
- Angular CLI
- Backend rodando (API SNMP Scanner)

---

### 📦 Instalar dependências

npm install

---

### ▶️ Executar em modo desenvolvimento

ng serve

A aplicação ficará disponível em:

http://localhost:4200

---

## 📂 Estrutura do projeto

src/
 ├── app/
 │    ├── components/
 │    ├── services/
 │    ├── models/
 │    └── pages/
 ├── environments/
 └── assets/

---

## 🎯 Funcionalidades principais

### 🔍 Mapeamento de Rede

- Envia requisição para o backend para mapear a rede selecionada
- Renderiza uma lista de dispositivos encontrados
- Exibe erros de SNMP de forma visual (itens destacados)
- Permite adicionar um dispositivo encontrado ao inventário pelo botão +

---

## 🧭 Roadmap (próximos passos)

- [ ] Tela de inventário (dispositivos cadastrados)
- [ ] Filtros por SSID, sinal e status
- [ ] Ordenação por nível de sinal
- [ ] Indicador de carregamento / progresso durante o mapeamento
- [ ] Dashboard com métricas (dispositivos online/offline, por rede, etc.)

---

## ⚠️ Observações importantes

- O frontend depende do backend em execução e acessível via URL configurada em environment
- Para produção, recomenda-se configurar proxy / CORS adequadamente e servir o build com Nginx/Traefik

---

## 📄 Licença

Este projeto pode ser usado e adaptado conforme sua necessidade.
