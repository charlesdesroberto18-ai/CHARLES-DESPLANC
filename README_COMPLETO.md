# 🚀 EntregaPro - Aplicativo de Gerenciamento Financeiro para Entregadores

## 📱 Visão Geral

**EntregaPro** é uma aplicação web moderna e completa para ajudar entregadores profissionais (iFood, Uber Eats, etc.) a gerenciar suas finanças, otimizar sua eficiência operacional e receber conselhos estratégicos baseados em IA.

### ✨ Características Principais

- **📊 Dashboard Inteligente**: Visualize seu saldo, ganhos, gastos e taxa horária em tempo real
- **⏱️ Rastreamento de Turnos**: Registre turnos com GPS automático de KM rodado
- **💰 Gerenciamento de Transações**: Categorize receitas e despesas
- **🤖 Consultor IA (Gemini)**: Receba análises preditivas e recomendações estratégicas
- **📈 Análises Avançadas**: Gráficos de desempenho com dados dos últimos 7 dias
- **🎯 Metas Financeiras**: Defina e acompanhe seus objetivos
- **📅 Histórico Completo**: Acesse todo o histórico de transações e turnos
- **🔧 Manutenção do Veículo**: Rastreie agendamentos de manutenção

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Propósito |
|---|---|---|
| **React** | 19.2.1 | Framework UI |
| **TypeScript** | 5.8.2 | Tipagem estática |
| **Vite** | 6.2.0 | Build tool |
| **Tailwind CSS** | 3.x | Estilização |
| **Recharts** | 3.5.1 | Gráficos |
| **Gemini API** | 1.31.0 | IA e análises |
| **Express** | 4.x | Servidor web |
| **CORS** | 2.x | Controle de acesso |

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Chave da API Gemini (obtenha em [Google AI Studio](https://aistudio.google.com))

### Passos de Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/charlesdesroberto18-ai/CHARLES-ROBERTO.git
cd CHARLES-ROBERTO

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.production .env.local

# 4. Editar .env.local com suas chaves
# GEMINI_API_KEY=sua_chave_aqui
# REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

## 🚀 Como Executar

### Desenvolvimento (com Hot Reload)

```bash
npm run dev
```

Acesse em: `http://localhost:3000`

### Produção (Build Otimizado)

```bash
# Gerar build
npm run build

# Servir com Express
node server.js
```

### Preview do Build

```bash
npm run preview
```

## 📖 Guia de Uso

### 1. **Autenticação**

- Clique em "Entrar no Modo Demo (Sem Google)" para acessar sem autenticação
- Ou configure Google OAuth para autenticação real

### 2. **Iniciar um Turno**

1. Na aba "Painel", clique em "Começar Agora"
2. O app começará a rastrear seu KM via GPS
3. Você pode ajustar o horário de início se necessário
4. Clique em "Encerrar" quando terminar o turno

### 3. **Registrar Transações**

1. Clique no botão "+" (flutuante)
2. Escolha "Ganho" ou "Gasto"
3. Insira o valor, data e categoria
4. Adicione uma observação (opcional)
5. Clique em "Salvar"

### 4. **Consultar Análises**

1. Acesse a aba "Análises"
2. Visualize suas métricas (R$/Hora, R$/KM, etc.)
3. Veja o gráfico de ganhos dos últimos 7 dias
4. Acompanhe seu lucro líquido total

### 5. **Usar o Consultor IA**

1. Acesse a aba "IA Copilot"
2. Clique em "Gerar Relatório Pro"
3. Aguarde a análise da IA Gemini
4. Leia as recomendações e insights

### 6. **Definir Metas**

1. Acesse a aba "Metas"
2. Clique em "+" para adicionar uma nova meta
3. Defina o valor alvo e prazo
4. Acompanhe seu progresso

## 📊 Estrutura de Dados

### Transaction (Transação)

```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: Category;
  date: string; // ISO String
  description?: string;
  shiftId?: string;
}
```

### Shift (Turno)

```typescript
interface Shift {
  id: string;
  startTime: string; // ISO String
  endTime?: string;
  durationSeconds?: number;
  totalEarnings?: number;
  totalExpenses?: number;
  deliveryCount?: number;
  kmDriven?: number;
}
```

### Goal (Meta)

```typescript
interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'item';
}
```

## 🔐 Segurança

- ✅ Dados armazenados localmente em localStorage
- ✅ Sem envio de dados sensíveis para servidores
- ✅ Chaves de API protegidas em .env.local
- ✅ CORS configurado para acesso seguro

### ⚠️ Nota de Segurança

Para produção, recomenda-se:
1. Implementar backend seguro com autenticação
2. Usar banco de dados criptografado
3. Implementar HTTPS
4. Usar variáveis de ambiente seguras

## 🐛 Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"

**Solução**: Certifique-se de que o arquivo `.env.local` existe e contém a chave:

```bash
GEMINI_API_KEY=sua_chave_aqui
```

### Erro: "GPS não disponível"

**Solução**: O navegador precisa de permissão para acessar GPS. Verifique:
- Se o site está em HTTPS (localhost funciona)
- Se você permitiu acesso ao GPS no navegador
- Se o GPS do dispositivo está ativado

### Erro: "Dados não persistem"

**Solução**: localStorage pode estar desativado. Verifique:
- Se cookies/storage estão habilitados
- Se você não está em modo privado/incógnito
- Se há espaço disponível no storage

## 📈 Roadmap Futuro

- [ ] Autenticação com Google OAuth completa
- [ ] Backend com Node.js/Express
- [ ] Banco de dados (MongoDB/Firebase)
- [ ] Sincronização em nuvem
- [ ] Aplicativo mobile (React Native)
- [ ] Integração com APIs de entrega (iFood, Uber)
- [ ] Notificações push
- [ ] Modo offline com service workers
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Integração com contadores

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através de:
- Email: suporte@entregapro.com
- Discord: [Link do servidor]
- WhatsApp: [Número]

## 🙏 Agradecimentos

- Google Gemini API por fornecer IA avançada
- Comunidade React por ferramentas incríveis
- Todos os contribuidores e usuários

---

**Desenvolvido com ❤️ para entregadores profissionais**

**Versão:** 1.0.0  
**Última atualização:** 22 de Dezembro de 2025  
**Status:** ✅ Produção Pronta
