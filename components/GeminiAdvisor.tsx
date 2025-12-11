import React, { useState } from 'react';
import { Transaction, Shift, Goal } from '../types';
import { getFinancialAdvice, searchMarketIntelligence, findNearbyPlaces } from '../services/geminiService';
import { Sparkles, RefreshCw, Printer, Share2, TrendingUp, MapPin, DollarSign, Globe, Search, ArrowRight, ExternalLink, Loader2, Navigation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  transactions: Transaction[];
  shifts: Shift[];
  goals?: Goal[]; 
}

export const GeminiAdvisor: React.FC<Props> = ({ transactions, shifts, goals = [] }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'market' | 'map'>('report');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Market Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{text: string, sources: any[]} | null>(null);
  const [searching, setSearching] = useState(false);

  // Map Search State
  const [mapQuery, setMapQuery] = useState('');
  const [mapResult, setMapResult] = useState<{text: string, sources: any[]} | null>(null);
  const [mapSearching, setMapSearching] = useState(false);

  // Calculate metrics locally for display
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const totalKm = shifts.reduce((acc, s) => acc + (s.kmDriven || 0), 0);
  const profitPerKm = totalKm > 0 ? netProfit / totalKm : 0;

  const handleGetAdvice = async () => {
    if (transactions.length < 3 && shifts.length < 1) {
      setAdvice("### 📉 Dados Insuficientes\n\nPara gerar o **Relatório Executivo** completo, o sistema precisa de mais dados.\n\n**Ação Recomendada:**\n1. Finalize pelo menos 1 turno completo.\n2. Registre seus gastos de hoje.");
      return;
    }
    setLoading(true);
    const result = await getFinancialAdvice(transactions, shifts, goals);
    setAdvice(result);
    setLoading(false);
  };

  const handleMarketSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    const result = await searchMarketIntelligence(searchQuery);
    setSearchResult(result);
    setSearching(false);
  };

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapQuery.trim()) return;

    setMapSearching(true);
    
    // Get user location for context
    let location = undefined;
    if ('geolocation' in navigator) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        } catch (e) {
            console.warn("Could not get location", e);
        }
    }

    const result = await findNearbyPlaces(mapQuery, location);
    setMapResult(result);
    setMapSearching(false);
  };

  const predefinedQueries = [
    "Preço médio da gasolina em SP hoje?",
    "Eventos em São Paulo hoje à noite?",
    "Vai chover hoje à tarde?",
    "Melhores regiões para entrega sexta à noite"
  ];

  const predefinedMapQueries = [
    "Postos de gasolina baratos por perto",
    "Restaurantes abertos agora",
    "Oficinas de moto próximas",
    "Áreas de descanso para entregadores"
  ];

  const handlePrint = () => window.print();

  return (
    <div className="p-4 h-full flex flex-col pb-24 animate-fade-in bg-gray-50">
      {/* Header */}
      <div className="mb-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-300 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 backdrop-blur-md rounded-lg border border-indigo-400/30">
                        <Sparkles size={20} className="text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">EntregaPro Intelligence</h2>
                        <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Consultoria & Mercado</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-4 print:hidden overflow-x-auto">
        <button 
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'}`}
        >
            <TrendingUp size={16} /> Relatório
        </button>
        <button 
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'market' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
        >
            <Globe size={16} /> Web
        </button>
        <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
        >
            <MapPin size={16} /> Mapa
        </button>
      </div>

      {/* --- REPORT TAB --- */}
      {activeTab === 'report' && (
        <>
            {!advice && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm print:hidden">
                    <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-600">
                        <TrendingUp size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Análise Preditiva</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                        Descubra seu score de eficiência e projeções de ganhos usando Inteligência Avançada (Pro).
                    </p>
                    <button
                        onClick={handleGetAdvice}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Sparkles size={20} className="text-yellow-400" />
                        Gerar Relatório Pro
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 print:hidden">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Processando dados...</p>
                </div>
            )}

            {advice && !loading && (
                <div className="flex-1 flex flex-col animate-fade-in">
                     <div className="flex justify-between items-center mb-3 print:hidden">
                        <span className="text-xs font-bold text-gray-400 uppercase">Relatório Gerado</span>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="p-2 bg-white border rounded-lg text-gray-600 hover:text-slate-900 shadow-sm"><Printer size={18} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-none print:p-0">
                        <div className="prose prose-sm prose-slate max-w-none">
                            <ReactMarkdown>{advice}</ReactMarkdown>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleGetAdvice}
                        className="mt-4 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 print:hidden"
                    >
                        <RefreshCw size={18} /> Atualizar
                    </button>
                </div>
            )}
        </>
      )}

      {/* --- MARKET TAB (WEB SEARCH) --- */}
      {activeTab === 'market' && (
        <div className="flex-1 flex flex-col animate-fade-in">
            <form onSubmit={handleMarketSearch} className="mb-4 relative">
                <input 
                    type="text" 
                    placeholder="Pesquisar na Web..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                    type="submit" 
                    disabled={searching}
                    className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {searching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </button>
            </form>

            {!searchResult && !searching && (
                <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Sugestões (Web)</p>
                    <div className="flex flex-wrap gap-2">
                        {predefinedQueries.map(q => (
                            <button 
                                key={q}
                                onClick={() => { setSearchQuery(q); handleMarketSearch({ preventDefault: () => {} } as any); }}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-colors text-left"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {searchResult && (
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-5 overflow-y-auto shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe size={16} className="text-indigo-500" /> 
                        Resultado Web
                    </h3>
                    <div className="prose prose-sm prose-slate mb-6">
                        <ReactMarkdown>{searchResult.text}</ReactMarkdown>
                    </div>

                    {searchResult.sources && searchResult.sources.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Fontes Encontradas</p>
                            <div className="space-y-2">
                                {searchResult.sources.map((chunk: any, i: number) => {
                                    const web = chunk.web;
                                    if (!web) return null;
                                    return (
                                        <a 
                                            key={i} 
                                            href={web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 group"
                                        >
                                            <p className="text-xs font-bold text-slate-700 truncate mb-0.5 group-hover:text-indigo-700">{web.title}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <ExternalLink size={10} />
                                                <span className="truncate">{web.uri}</span>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
             {!searchResult && !searching && (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                     <Globe size={64} className="mb-4" />
                     <p className="text-sm font-medium">Conectado ao Google Search</p>
                 </div>
             )}
        </div>
      )}

      {/* --- MAP TAB (GOOGLE MAPS GROUNDING) --- */}
      {activeTab === 'map' && (
        <div className="flex-1 flex flex-col animate-fade-in">
            <form onSubmit={handleMapSearch} className="mb-4 relative">
                <input 
                    type="text" 
                    placeholder="Ex: Postos de gasolina, oficinas..."
                    value={mapQuery}
                    onChange={e => setMapQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                    type="submit" 
                    disabled={mapSearching}
                    className="absolute right-2 top-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                    {mapSearching ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                </button>
            </form>

            {!mapResult && !mapSearching && (
                <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Locais Próximos</p>
                    <div className="flex flex-wrap gap-2">
                        {predefinedMapQueries.map(q => (
                            <button 
                                key={q}
                                onClick={() => { setMapQuery(q); handleMapSearch({ preventDefault: () => {} } as any); }}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition-colors text-left"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {mapResult && (
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-5 overflow-y-auto shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-500" /> 
                        Locais Encontrados
                    </h3>
                    <div className="prose prose-sm prose-slate mb-6">
                        <ReactMarkdown>{mapResult.text}</ReactMarkdown>
                    </div>

                    {mapResult.sources && mapResult.sources.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Google Maps Links</p>
                            <div className="space-y-2">
                                {mapResult.sources.map((chunk: any, i: number) => {
                                    // Check if it's a maps chunk
                                    const mapData = chunk.maps;
                                    const web = chunk.web;
                                    
                                    if (mapData) {
                                        return (
                                            <a 
                                                key={i} 
                                                href={mapData.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200 group"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">{mapData.title || "Local no Mapa"}</p>
                                                        <div className="flex items-center gap-1 text-[10px] text-emerald-600/70">
                                                            <span>Abrir no Google Maps</span>
                                                            <ExternalLink size={10} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    } 
                                    
                                    // Fallback for web chunks mixed in
                                    if (web) {
                                         return (
                                            <a 
                                                key={i} 
                                                href={web.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                                            >
                                                <p className="text-xs font-bold text-slate-700 truncate">{web.title}</p>
                                                <span className="text-[10px] text-gray-400">{web.uri}</span>
                                            </a>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
             {!mapResult && !mapSearching && (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                     <Navigation size={64} className="mb-4" />
                     <p className="text-sm font-medium">Use sua localização para buscar</p>
                 </div>
             )}
        </div>
      )}
    </div>
  );
};