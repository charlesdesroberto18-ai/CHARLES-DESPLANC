import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, Shift, Goal } from "../types";

const SYSTEM_INSTRUCTION = `
Você é o CFO (Diretor Financeiro) e Estrategista Logístico de um entregador profissional (iFood/Uber).
Sua missão é gerar relatórios de alta precisão que misturam análise financeira com eficiência operacional.

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO (Markdown):

# 🏁 Relatório Executivo de Performance

## 1. Score de Eficiência (0-100)
Dê uma nota baseada na relação Lucro Líquido vs Horas Trabalhadas vs KM Rodados.

## 2. 📊 Métricas Operacionais
* **Lucro por KM:** (Quanto ganha a cada KM rodado)
* **Entregas/Hora:** (Média de produtividade)
* **Ticket Médio:** (Valor médio por entrega)

## 3. 🔮 Modelagem Preditiva
Com base na média atual, projete:
* **Ganhos Estimados do Mês:** (Projeção linear)
* *Veredito:* Você vai bater as metas atuais? (Sim/Não/Em Risco)

## 4. 🔍 Análise de Custos
Identifique padrões ocultos. Ex: "Seu custo por KM está alto (R$ X/km). Verifique manutenção ou estilo de pilotagem".

## 5. ⚡ Plano de Ação (Próximas 24h)
3 passos táticos imediatos para aumentar o valor da hora trabalhada amanhã.

---
*Tom de voz:* Analítico, direto, focado em crescimento ("Growth Mindset").
`;

export const getFinancialAdvice = async (
  transactions: Transaction[], 
  shifts: Shift[],
  goals: Goal[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 1. Process Financial Data
    const incomeTx = transactions.filter(t => t.type === 'income');
    const expenseTx = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTx.reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = expenseTx.reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // 2. Process Operational Data from Shifts
    const completedShifts = shifts.filter(s => s.endTime);
    const totalSeconds = completedShifts.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const totalHours = totalSeconds / 3600;
    
    const totalKm = completedShifts.reduce((acc, s) => acc + (s.kmDriven || 0), 0);
    const totalDeliveries = completedShifts.reduce((acc, s) => acc + (s.deliveryCount || 0), 0);

    const hourlyRate = totalHours > 0 ? (netProfit / totalHours).toFixed(2) : "0.00";
    const profitPerKm = totalKm > 0 ? (netProfit / totalKm).toFixed(2) : "0.00";
    const deliveriesPerHour = totalHours > 0 ? (totalDeliveries / totalHours).toFixed(1) : "0.0";
    const avgTicket = totalDeliveries > 0 ? (totalIncome / totalDeliveries).toFixed(2) : "0.00";

    // Maintenance Context logic
    const lastMaintenance = transactions
      .filter(t => t.category === Category.MAINTENANCE && t.maintenanceMetadata)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    let maintenanceContext = "";
    if (lastMaintenance && lastMaintenance.maintenanceMetadata) {
        const currentEstimatedOdometer = (lastMaintenance.maintenanceMetadata.currentOdometer || 0) + 
          shifts.filter(s => new Date(s.startTime) > new Date(lastMaintenance.date)).reduce((acc, s) => acc + (s.kmDriven || 0), 0);
        
        const nextServiceAt = lastMaintenance.maintenanceMetadata.nextServiceInterval || 0;
        const kmRemaining = nextServiceAt - currentEstimatedOdometer;

        maintenanceContext = `
        STATUS DA MOTO (CRÍTICO):
        - Última manutenção: ${new Date(lastMaintenance.date).toLocaleDateString()} (${lastMaintenance.description})
        - KM Atual Estimado: ${currentEstimatedOdometer.toFixed(1)} km
        - Próxima revisão prevista: ${nextServiceAt} km
        - KM Restante para revisão: ${kmRemaining.toFixed(1)} km
        
        ATENÇÃO: Se o KM restante for baixo (< 500km), ALERTE O USUÁRIO URGENTEMENTE no plano de ação.
        `;
    }

    // Recent History
    const recentHistory = transactions.slice(-15).map(t => 
      `- ${t.date.split('T')[0]}: ${t.type === 'income' ? '💰' : '💸'} R$${t.amount} (${t.category})`
    ).join('\n');

    const prompt = `
    DADOS FINANCEIROS GERAIS:
    - Faturamento: R$ ${totalIncome.toFixed(2)}
    - Custos Totais: R$ ${totalExpense.toFixed(2)}
    - Lucro Líquido: R$ ${netProfit.toFixed(2)}
    
    DADOS OPERACIONAIS (SHIFT REPORTS):
    - Horas Totais Trabalhadas: ${totalHours.toFixed(1)}h
    - KM Total Rodado: ${totalKm.toFixed(1)} km
    - Total Entregas: ${totalDeliveries}
    
    KPIs CALCULADOS:
    - Valor/Hora: R$ ${hourlyRate}/h
    - Lucro/KM: R$ ${profitPerKm}/km
    - Entregas/Hora: ${deliveriesPerHour}
    - Ticket Médio: R$ ${avgTicket}
    
    ${maintenanceContext}

    METAS ATIVAS:
    ${goals.map(g => `- ${g.title}: Alvo R$${g.targetAmount} (${((g.currentAmount/g.targetAmount)*100).toFixed(0)}%)`).join('\n')}

    HISTÓRICO RECENTE:
    ${recentHistory}
    
    Analise especificamente a eficiência do KM rodado e o volume de entregas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6, 
      }
    });

    return response.text || "Relatório indisponível. Tente novamente.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "### ⚠️ Erro de Conexão\nO consultor financeiro está offline. Verifique sua internet.";
  }
};

export const getDailyMotivation = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
    Gere uma frase curta (máximo 2 frases), motivacional e impactante para um entregador de moto que está começando o dia de trabalho.
    
    PERSONA: Você é um parceiro de estrada experiente, um irmão de corre.
    TOM DE VOZ:
    - Use gírias leves de motoboy/entregador (ex: corre, marcha, foguete, abençoado, guerreiro).
    - Pode ter um toque de espiritualidade/fé (proteção divina, Deus no comando), mas sem ser religioso demais.
    - Foco na batalha, na segurança, em fazer dinheiro e voltar bem pra casa.
    - NÃO use frases clichês de coach ou LinkedIn. Seja rua, seja real.
    
    Exemplos de estilo (NÃO COPIE, CRIE NOVO):
    - "Capacete fechado e Deus na proteção. O asfalto é nosso escritório, marcha nas entregas!"
    - "Foguete não tem ré, parceiro. Foco na meta e cuidado nos corredores que a família te espera."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0, // High creativity
      }
    });

    return response.text || "Marcha no progresso e Deus na proteção. Bom corre!";
  } catch (error) {
    console.error("Error fetching motivation:", error);
    return "Foco na meta e cuidado na pista. Bom trabalho, guerreiro!";
  }
};