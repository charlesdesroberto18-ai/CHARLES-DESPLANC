import React, { useState } from 'react';
import { Bike, ShieldCheck, Mail, Lock, UserPlus, LogIn, ArrowLeft, Check } from 'lucide-react';

interface Props {
  onLogin: (user: { name: string; email: string; photo: string }) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'selection' | 'google_input' | 'email_form'>('selection');
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  
  // Form States
  const [googleEmail, setGoogleEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) {
        setError('Digite seu e-mail do Google');
        return;
    }
    
    setLoading(true);
    setError('');

    // Simulate Google Auth Delay
    setTimeout(() => {
        // Extract name from email for display purposes
        const namePart = googleEmail.split('@')[0];
        const formattedName = namePart.split(/[._]/).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
        
        onLogin({
            name: formattedName,
            email: googleEmail,
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=random&bold=true`
        });
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
        setError("Preencha todos os campos");
        return;
    }

    setLoading(true);
    
    setTimeout(() => {
        if (emailMode === 'register') {
            if (!name) {
                setError("Nome é obrigatório");
                setLoading(false);
                return;
            }
            onLogin({
                name: name,
                email: email,
                photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=fff`
            });
        } else {
            const userName = email.split('@')[0];
            onLogin({
                name: userName.charAt(0).toUpperCase() + userName.slice(1),
                email: email,
                photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1e293b&color=fff`
            });
        }
    }, 1000);
  };

  const renderSelection = () => (
    <div className="w-full space-y-4 animate-fade-in">
        <button 
            onClick={() => setAuthMethod('google_input')}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-slate-800"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.52 12.29C23.52 11.43 23.45 10.73 23.32 10.01H12V14.51H18.52C18.24 15.93 17.37 17.15 16.09 18.01V20.89H19.93C22.19 18.83 23.52 15.82 23.52 12.29Z" fill="#4285F4"/>
                <path d="M12 24.0001C15.24 24.0001 17.96 22.9301 19.93 21.1101L16.09 18.2301C15.02 18.9601 13.63 19.3901 12 19.3901C8.87 19.3901 6.22 17.2701 5.27 14.4101H1.3V17.4801C3.26 21.3601 7.31 24.0001 12 24.0001Z" fill="#34A853"/>
                <path d="M5.27 14.41C5.02 13.63 4.88 12.82 4.88 12C4.88 11.18 5.02 10.37 5.27 9.59V6.52H1.3C0.47 8.16 0 10.02 0 12C0 13.98 0.47 15.84 1.3 17.48L5.27 14.41Z" fill="#FBBC05"/>
                <path d="M12 4.61C13.76 4.61 15.34 5.22 16.58 6.4L19.98 3.01C17.96 1.13 15.24 0 12 0C7.31 0 3.26 2.64 1.3 6.52L5.27 9.59C6.22 6.73 8.87 4.61 12 4.61Z" fill="#EA4335"/>
            </svg>
            <span>Entrar com Google</span>
        </button>

        <button 
            onClick={() => setAuthMethod('email_form')}
            className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-700 transition-all active:scale-95 shadow-lg border border-slate-700"
        >
            <Mail size={20} />
            <span>Entrar com E-mail</span>
        </button>
    </div>
  );

  const renderGoogleInput = () => (
    <form onSubmit={handleGoogleSubmit} className="w-full bg-white p-6 rounded-2xl animate-fade-in text-slate-900">
        <div className="flex items-center gap-2 mb-6">
             <button type="button" onClick={() => setAuthMethod('selection')} className="text-gray-500 hover:text-gray-800">
                <ArrowLeft size={20} />
             </button>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.52 12.29C23.52 11.43 23.45 10.73 23.32 10.01H12V14.51H18.52C18.24 15.93 17.37 17.15 16.09 18.01V20.89H19.93C22.19 18.83 23.52 15.82 23.52 12.29Z" fill="#4285F4"/>
                <path d="M12 24.0001C15.24 24.0001 17.96 22.9301 19.93 21.1101L16.09 18.2301C15.02 18.9601 13.63 19.3901 12 19.3901C8.87 19.3901 6.22 17.2701 5.27 14.4101H1.3V17.4801C3.26 21.3601 7.31 24.0001 12 24.0001Z" fill="#34A853"/>
                <path d="M5.27 14.41C5.02 13.63 4.88 12.82 4.88 12C4.88 11.18 5.02 10.37 5.27 9.59V6.52H1.3C0.47 8.16 0 10.02 0 12C0 13.98 0.47 15.84 1.3 17.48L5.27 14.41Z" fill="#FBBC05"/>
                <path d="M12 4.61C13.76 4.61 15.34 5.22 16.58 6.4L19.98 3.01C17.96 1.13 15.24 0 12 0C7.31 0 3.26 2.64 1.3 6.52L5.27 9.59C6.22 6.73 8.87 4.61 12 4.61Z" fill="#EA4335"/>
            </svg>
            <span className="font-bold text-lg">Fazer login</span>
        </div>

        <div className="mb-6">
            <h3 className="text-center text-sm font-medium mb-1">Ir para EntregaPro</h3>
            <p className="text-center text-xs text-gray-500">Use sua Conta do Google</p>
        </div>

        <div className="mb-6 relative">
            <input 
                type="email" 
                autoFocus
                value={googleEmail}
                onChange={e => { setGoogleEmail(e.target.value); setError(''); }}
                placeholder="E-mail ou telefone"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        
        <div className="flex justify-end items-center gap-4">
            <button type="button" className="text-blue-600 font-bold text-sm hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                Criar conta
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                {loading ? 'Verificando...' : 'Próxima'}
            </button>
        </div>
    </form>
  );

  const renderEmailForm = () => (
    <form onSubmit={handleEmailAuth} className="w-full space-y-4 animate-fade-in relative">
        <button 
            type="button" 
            onClick={() => setAuthMethod('selection')}
            className="absolute -top-12 left-0 text-white/50 hover:text-white flex items-center gap-1 text-sm"
        >
            <ArrowLeft size={16} /> Voltar
        </button>

        {emailMode === 'register' && (
            <div className="relative">
                <UserPlus className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Seu Nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
                />
            </div>
        )}
        
        <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
                type="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
            />
        </div>

        <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
                type="password" 
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
            />
        </div>

        {error && <p className="text-red-400 text-xs text-center font-bold bg-red-900/20 p-2 rounded-lg">{error}</p>}

        <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-900/50"
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                    {emailMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {emailMode === 'login' ? 'Acessar Conta' : 'Criar Conta'}
                </>
            )}
        </button>
        
        <div className="text-center pt-2">
            <button 
                type="button"
                onClick={() => { setEmailMode(prev => prev === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-slate-400 text-xs font-bold hover:text-white transition-colors"
            >
                {emailMode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Fazer login'}
            </button>
        </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-white z-50 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-in my-auto">
        
        {authMethod !== 'google_input' && (
            <div className="mb-8 relative animate-fade-in">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="w-20 h-20 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 rotate-3">
                    <Bike size={40} />
                </div>
            </div>
        )}

        {authMethod !== 'google_input' && (
            <>
                <h1 className="text-3xl font-black mb-2 text-center tracking-tight">EntregaPro</h1>
                <p className="text-slate-400 text-center mb-8 max-w-[260px] leading-relaxed text-sm">
                Plataforma de gestão inteligente para entregadores.
                </p>
            </>
        )}

        {authMethod === 'selection' && renderSelection()}
        {authMethod === 'google_input' && renderGoogleInput()}
        {authMethod === 'email_form' && renderEmailForm()}

        <p className="mt-8 text-xs text-slate-500 flex items-center gap-1.5">
           <ShieldCheck size={12} />
           Seus dados são salvos localmente
        </p>

      </div>
    </div>
  );
};