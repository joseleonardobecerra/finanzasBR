const Login = () => {
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
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#17171a] p-8 rounded-2xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white font-serif mb-4 shadow-lg shadow-indigo-500/30">
            F
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Finanzas Familia</h1>
          <p className="text-slate-400 text-sm mt-1">Ingresa para acceder a tu panel</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm font-medium text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
              placeholder="ejemplo@familia.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg transition-all mt-4 flex justify-center items-center gap-2"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-600 mt-8 font-medium">
          Sistema Privado y Encriptado
        </p>
      </div>
    </div>
  );
};