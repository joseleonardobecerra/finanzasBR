(() => {
  // ============================================================================
  // COMPONENTES UI EXTERNOS (Privados para Login)
  // ============================================================================
  const AlertCircle = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  );

  const LockIcon = ({ size = 12, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );

  const SpinnerIcon = ({ size = 20, className = "" }) => (
    <div className={`border-2 border-[#0b0c16]/30 border-t-[#0b0c16] rounded-full animate-spin ${className}`} style={{ width: size, height: size }}></div>
  );

  // ============================================================================
  // COMPONENTE PRINCIPAL
  // ============================================================================
  const LoginComponent = () => {
    const { useState } = React;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      try {
        await window.firebase.auth().signInWithEmailAndPassword(email, password);
      } catch (err) {
        console.error(err);
        setLoading(false);
        if(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
             setError('Credenciales incorrectas o usuario no encontrado.');
        } else if (err.code === 'auth/unauthorized-domain') {
             setError('Dominio no autorizado en Firebase.');
        } else {
             setError(err.message);
        }
      }
    };

    // Clases base UI
    const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-neoncyan focus:shadow-glow-cyan transition-all duration-300 placeholder:text-slate-600";
    const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-2 block";

    return (
      <div className="min-h-screen bg-appbg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Luces Ambientales (Cyberpunk Vibe) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-neoncyan/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-neonmagenta/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-appcard p-8 md:p-10 rounded-[30px] border border-white/[0.02] shadow-neumorph animate-in zoom-in-95 duration-500 relative z-10">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neoncyan to-blue-600 flex items-center justify-center text-3xl font-black text-[#0b0c16] mb-6 shadow-glow-cyan">
              F
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">Finanzas Familia</h1>
            <p className="text-[#8A92A6] text-sm mt-2 font-bold tracking-widest uppercase">Panel de Control Global</p>
          </div>

          {error && (
            <div className="bg-[#111222] shadow-neumorph-inset border border-neonmagenta/30 text-neonmagenta p-4 rounded-xl text-xs font-black tracking-widest text-center mb-6 uppercase flex items-center justify-center gap-2">
              <AlertCircle size={16}/>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={labelBaseClass}>Correo Electrónico</label>
              <input 
                type="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={inputBaseClass}
                placeholder="ejemplo@familia.com"
              />
            </div>
            
            <div>
              <label className={labelBaseClass}>Contraseña</label>
              <input 
                type="password" 
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={inputBaseClass}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] font-black tracking-widest uppercase py-4 rounded-xl transition-all shadow-glow-cyan hover:scale-[1.02] active:scale-95 mt-8 flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
            >
              {loading ? <SpinnerIcon size={20}/> : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-white/[0.05] text-center">
             <p className="text-[9px] text-[#8A92A6] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
               <LockIcon size={12}/>
               Sistema Privado y Encriptado
             </p>
          </div>
        </div>
      </div>
    );
  };

  window.Login = LoginComponent;
})();
