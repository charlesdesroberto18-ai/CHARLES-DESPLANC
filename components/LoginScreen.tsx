import React, { useState } from 'react';
import { Bike, ShieldCheck } from 'lucide-react';

interface Props {
  onLogin: (user: { name: string; email: string; photo: string }) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate API delay for realism
    setTimeout(() => {
        onLogin({
            name: 'Motorista Pro',
            email: 'motorista@gmail.com',
            photo: 'https://ui-avatars.com/api/?name=Motorista+Pro&background=0D8ABC&color=fff'
        });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-white z-50">
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
        
        <div className="mb-10 relative">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
            <div className="w-24 h-24 bg-white text-slate-900 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 rotate-3">
                <Bike size={48} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-slate-900">
                PRO
            </div>
        </div>

        <h1 className="text-3xl font-black mb-2 text-center tracking-tight">EntregaPro</h1>
        <p className="text-slate-400 text-center mb-12 max-w-[260px] leading-relaxed">
          O sistema operacional definitivo para sua logística e finanças.
        </p>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
             <>
               <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
               <span>Conectando...</span>
             </>
          ) : (
            <>
                {/* Google G Icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.52 12.29C23.52 11.43 23.45 10.73 23.32 10.01H12V14.51H18.52C18.24 15.93 17.37 17.15 16.09 18.01V20.89H19.93C22.19 18.83 23.52 15.82 23.52 12.29Z" fill="#4285F4"/>
                    <path d="M12 24.0001C15.24 24.0001 17.96 22.9301 19.93 21.1101L16.09 18.2301C15.02 18.9601 13.63 19.3901 12 19.3901C8.87 19.3901 6.22 17.2701 5.27 14.4101H1.3V17.4801C3.26 21.3601 7.31 24.0001 12 24.0001Z" fill="#34A853"/>
                    <path d="M5.27 14.41C5.02 13.63 4.88 12.82 4.88 12C4.88 11.18 5.02 10.37 5.27 9.59V6.52H1.3C0.47 8.16 0 10.02 0 12C0 13.98 0.47 15.84 1.3 17.48L5.27 14.41Z" fill="#FBBC05"/>
                    <path d="M12 4.61C13.76 4.61 15.34 5.22 16.58 6.4L19.98 3.01C17.96 1.13 15.24 0 12 0C7.31 0 3.26 2.64 1.3 6.52L5.27 9.59C6.22 6.73 8.87 4.61 12 4.61Z" fill="#EA4335"/>
                </svg>
                <span>Continuar com Google</span>
            </>
          )}
        </button>

        <p className="mt-8 text-xs text-slate-500 flex items-center gap-1.5">
           <ShieldCheck size={12} />
           Dados criptografados e salvos localmente
        </p>

      </div>
    </div>
  );
};