import React from 'react';
import { X, Download, FileSpreadsheet, LogOut, User, Database, Map } from 'lucide-react';
import { Transaction, Shift } from '../types';

interface Props {
  onClose: () => void;
  onLogout: () => void;
  user: { name: string; email: string; photo?: string };
  transactions: Transaction[];
  shifts: Shift[];
}

export const SettingsModal: React.FC<Props> = ({ onClose, onLogout, user, transactions, shifts }) => {
  
  const handleExportCSV = (type: 'transactions' | 'shifts') => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "";

    if (type === 'transactions') {
        csvContent += "ID,Data,Tipo,Categoria,Valor,Descricao\n";
        transactions.forEach(row => {
            csvContent += `${row.id},${row.date},${row.type},${row.category},${row.amount},${row.description || ''}\n`;
        });
        filename = "entregapro_transacoes.csv";
    } else {
        csvContent += "ID,Inicio,Fim,Ganhos,Gastos,Entregas,KM\n";
        shifts.forEach(row => {
            csvContent += `${row.id},${row.startTime},${row.endTime || 'Ativo'},${row.totalEarnings || 0},${row.totalExpenses || 0},${row.deliveryCount || 0},${row.kmDriven || 0}\n`;
        });
        filename = "entregapro_turnos.csv";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h3 className="font-bold text-gray-800">Configurações</h3>
           <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-600">
               <X size={18} />
           </button>
        </div>

        <div className="p-6">
            {/* User Profile */}
            <div className="flex items-center gap-4 mb-8">
                {user.photo ? (
                    <img src={user.photo} className="w-16 h-16 rounded-full border-4 border-gray-50" />
                ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                        <User size={32} />
                    </div>
                )}
                <div>
                    <h4 className="font-bold text-lg text-slate-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                        Conta Google Conectada
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* Data Export Section */}
                <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                        <Database size={12} /> Seus Dados
                    </h5>
                    <div className="space-y-2">
                        <button 
                            onClick={() => handleExportCSV('transactions')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-green-50 text-slate-700 hover:text-green-700 border border-gray-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-sm">Exportar Financeiro</span>
                                    <span className="block text-xs opacity-60">Formato compatível com Google Sheets</span>
                                </div>
                            </div>
                            <Download size={18} />
                        </button>

                        <button 
                            onClick={() => handleExportCSV('shifts')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-gray-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                    <Map size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-sm">Exportar Turnos e KM</span>
                                    <span className="block text-xs opacity-60">Histórico operacional completo</span>
                                </div>
                            </div>
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button 
                        onClick={onLogout}
                        className="w-full py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut size={18} />
                        Sair da Conta
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-gray-300">
                        EntregaPro v2.1.0 • Integração Google Workspace
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};