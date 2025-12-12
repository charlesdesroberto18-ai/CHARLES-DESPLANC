import React, { useState, useEffect } from 'react';
import { Bike, ShieldCheck, AlertCircle } from 'lucide-react';

// --- CONFIGURAÇÃO DO GOOGLE ---
// ATENÇÃO: Para o login funcionar de verdade, você precisa criar um projeto no Google Cloud,
// configurar a tela de consentimento e criar um ID do Cliente OAuth para Aplicação Web.
// Coloque seu Client ID abaixo.
const GOOGLE_CLIENT_ID = "SEU_CLIENT_ID_DO_GOOGLE_AQUI.apps.googleusercontent.com"; 

interface Props {
  onLogin: (user: { name: string; email: string; photo: string }) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isClientIdMissing, setIsClientIdMissing] = useState(false);

  // Helper to decode JWT token from Google without external library
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleCredentialResponse = (response: any) => {
    if (response.credential) {
      const payload = parseJwt(response.credential);
      if (payload) {
        onLogin({
            name: payload.name,
            email: payload.email,
            photo: payload.picture
        });
      } else {
        setError('Falha ao processar dados do Google.');
      }
    } else {
        setError('Nenhuma credencial recebida.');
    }
  };

  useEffect(() => {
    if (GOOGLE_CLIENT_ID.includes("SEU_CLIENT_ID")) {
        setIsClientIdMissing(true);
        return;
    }

    const initializeGoogleLogin = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleButtonDiv"),
          { 
            theme: "filled_blue", 
            size: "large", 
            shape: "pill",
            width: "300",
            text: "continue_with"
          }
        );
      } else {
        // Retry if script hasn't loaded yet
        setTimeout(initializeGoogleLogin, 500);
      }
    };

    initializeGoogleLogin();
  }, []);

  const handleDemoLogin = () => {
     onLogin({
        name: "Entregador Demo",
        email: "demo@entregapro.com",
        photo: `https://ui-avatars.com/api/?name=Entregador+Demo&background=1e293b&color=fff`
     });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-white z-50 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-in my-auto">
        
        <div className="mb-8 relative animate-fade-in">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
            <div className="w-20 h-20 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 rotate-3">
                <Bike size={40} />
            </div>
        </div>

        <h1 className="text-3xl font-black mb-2 text-center tracking-tight">EntregaPro</h1>
        <p className="text-slate-400 text-center mb-10 max-w-[260px] leading-relaxed text-sm">
           Painel integrado com sua Conta Google.
        </p>

        {isClientIdMissing ? (
            <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl text-amber-200 text-xs mb-6 w-full">
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-400 text-sm">
                    <AlertCircle size={16} />
                    Configuração Necessária
                </div>
                <p className="mb-2">Para ativar o login real do Google:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-80 mb-3">
                    <li>Crie um projeto no Google Cloud Console.</li>
                    <li>Gere um <b>ID do Cliente OAuth</b>.</li>
                    <li>Edite o arquivo <code>LoginScreen.tsx</code>.</li>
                    <li>Cole o ID na constante <code>GOOGLE_CLIENT_ID</code>.</li>
                </ol>
                <button 
                    onClick={handleDemoLogin}
                    className="w-full bg-amber-500 text-slate-900 font-bold py-2 rounded-lg hover:bg-amber-400 transition-colors"
                >
                    Entrar no Modo Demo (Sem Google)
                </button>
            </div>
        ) : (
            <div className="w-full flex flex-col items-center gap-4">
                {/* O Google injetará o botão aqui */}
                <div id="googleButtonDiv" className="h-[44px]"></div>
                
                {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                
                <div className="flex items-center gap-2 mt-4 opacity-50">
                    <div className="h-px w-12 bg-gray-500"></div>
                    <span className="text-xs">ou</span>
                    <div className="h-px w-12 bg-gray-500"></div>
                </div>

                <button 
                    onClick={handleDemoLogin}
                    className="text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                    Continuar como Convidado (Sem Google)
                </button>
            </div>
        )}

        <p className="mt-12 text-xs text-slate-600 flex items-center gap-1.5 text-center px-4 leading-normal">
           <ShieldCheck size={12} className="shrink-0" />
           Ao fazer login, você concorda que o EntregaPro utilize seu nome e foto para personalizar sua experiência.
        </p>

      </div>
    </div>
  );
};