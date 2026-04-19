// --- MAIN APP ---
function App() {
  const { useState, useMemo, useEffect, useRef } = React;
  const [appCargando, setAppCargando] = useState(true);
  
  const [authUser, setAuthUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [toast, setToast] = useState(null);
  const [filtroPersona, setFiltroPersona] = useState('Total');
  const [scoreHistory, setScoreHistory] = useState({});

  // WIZARD DE REGISTRO RÁPIDO (MÓVIL)
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [qeStep, setQeStep] = useState(1);
  const [qeType, setQeType] = useState('');
  const [qeMonto, setQeMonto] = useState('');
  const [qeDescripcion, setQeDescripcion] = useState('');
  const [qeCategoria, setQeCategoria] = useState('');
  const [qeMethod, setQeMethod] = useState('');
  const [qeCuenta, setQeCuenta] = useState('');
  const [qeDeuda, setQeDeuda] = useState(''); // ✨ Conexión a deudas en móvil

  // BASES DE DATOS GLOBALES (Sin Compras a Cuotas)
  const [cuentas, setCuentas] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [pagosFijos, setPagosFijos] = useState([]);
  const [ingresosFijos, setIngresosFijos] = useState([]);
  
  const [categoriasMaestras, setCategoriasMaestras] = useState([
    'Vivienda', 'Transporte', 'Alimentación', 'Servicios', 'Educación', 'Salud', 'Entretenimiento', 'Ropa', 'Otros', 'Intereses y Cargos'
  ]);

  // ============================================================================
  // ÍCONOS SVG RESTAURADOS AL 100% (LA UI VUELVE A LA NORMALIDAD)
  // ============================================================================
  const XIcon = ({size=16, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  const CheckIcon = ({size=16, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
  const PlusIcon = ({size=18, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  const PieChartIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
  const TrendingUpIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
  const ActivityIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
  const GridIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  const TargetIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const WalletIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>;
  const ReceiptIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 14h-4"/><path d="M16 10H8"/><path d="M16 18H8"/></svg>;
  const FilterIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
  const CreditCardIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
  const ZapIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const SettingsIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  const LogOutIcon = ({size=20, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  const WifiOffIcon = ({size=14, className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.82"/></svg>;

  // ============================================================================
  // CONEXIÓN A FIREBASE
  // ============================================================================
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setAuthUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (authChecking) return;
    if (!authUser) {
      setAppCargando(false);
      return;
    }

    const unsubscribeDB = cloudDocRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data.cuentas) setCuentas(data.cuentas);
        if (data.ingresos) setIngresos(data.ingresos);
        if (data.egresos) setEgresos(data.egresos);
        if (data.transferencias) setTransferencias(data.transferencias);
        if (data.presupuestos) setPresupuestos(data.presupuestos);
        if (data.pagosFijos) setPagosFijos(data.pagosFijos);
        if (data.ingresosFijos) setIngresosFijos(data.ingresosFijos);
        if (data.categoriasMaestras) setCategoriasMaestras(data.categoriasMaestras);
        if (data.scoreHistory) setScoreHistory(data.scoreHistory);
      } else {
        cloudDocRef.set({
          cuentas: [], ingresos: [], egresos: [], transferencias: [], presupuestos: [],
          pagosFijos: [], ingresosFijos: [], categoriasMaestras, scoreHistory: {}
        });
      }
      setAppCargando(false);
    }, (error) => {
      console.error("Error cargando DB:", error);
      setAppCargando(false);
    });

    return () => unsubscribeDB();
  }, [authUser, authChecking]);

  const syncToCloud = (partialData) => {
    if (!authUser) return;
    cloudDocRef.set(partialData, { merge: true }).catch(err => {
      console.error("Error al sincronizar:", err);
      if (isOffline) showToast("Guardado localmente. Se sincronizará al conectar.");
    });
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getLocalToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  // ============================================================================
  // EL CEREBRO MATEMÁTICO (PARTIDA DOBLE)
  // ============================================================================
  const activeCalculatedAccounts = useMemo(() => {
    return cuentas.map(acc => {
      let currentBalance = Number(acc.initialBalance) || 0;
      let currentDebt = Number(acc.initialDebt) || 0;

      ingresos.forEach(ing => {
        if (ing.cuentaId === acc.id) currentBalance += Number(ing.monto);
      });

      egresos.forEach(egr => {
        // Gasto desde la cuenta
        if (egr.cuentaId === acc.id) {
           if (acc.type === 'credit') currentDebt += Number(egr.monto);
           else currentBalance -= Number(egr.monto);
        }
        // Abono a la deuda
        if (egr.deudaId === acc.id) {
           currentDebt -= Number(egr.monto);
           if (currentDebt < 0) currentDebt = 0; 
        }
      });

      transferencias.forEach(tx => {
         if (tx.fromId === acc.id) {
            const montoAExtraer = Number(tx.monto) + Number(tx.costoAvance || 0);
            if (acc.type === 'credit') currentDebt += montoAExtraer; 
            else currentBalance -= montoAExtraer; 
         }
         if (tx.toId === acc.id) {
            if (acc.type === 'credit' || acc.type === 'loan') {
               currentDebt -= Number(tx.monto);
               if (currentDebt < 0) currentDebt = 0;
            } else {
               currentBalance += Number(tx.monto);
            }
         }
      });

      return { ...acc, currentBalance, currentDebt };
    });
  }, [cuentas, ingresos, egresos, transferencias]);


  // ============================================================================
  // CÁLCULOS GLOBALES
  // ============================================================================
  const egresosMes = egresos.filter(e => e.fecha.startsWith(selectedMonth));
  const ingresosMes = ingresos.filter(i => i.fecha.startsWith(selectedMonth));
  
  const ingresosMesTotal = ingresosMes.reduce((sum, i) => sum + Number(i.monto), 0);
  const egresosMesTotal = egresosMes.reduce((sum, e) => sum + Number(e.monto), 0);
  
  const liquidezTotal = activeCalculatedAccounts.filter(c => ['bank', 'cash', 'pocket'].includes(c.type)).reduce((sum, c) => sum + c.currentBalance, 0);
  const deudaTotal = activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type)).reduce((sum, c) => sum + c.currentDebt, 0);
  const flujoNetoMes = ingresosMesTotal - egresosMesTotal;

  // Calculadora de Score
  const scoreData = useMemo(() => {
    let score = 100;
    const desglose = [];
    const recs = [];

    if (activeCalculatedAccounts.length === 0) {
      return { score: 0, desglose: [{label: 'Sin datos', val: 0}], recs: ['Agrega cuentas para iniciar'] };
    }

    if (ingresosMesTotal > 0) {
      const gastoFijoRatio = (egresosMes.filter(e=>e.tipo==='Fijo').reduce((s,e)=>s+Number(e.monto),0) / ingresosMesTotal) * 100;
      if (gastoFijoRatio > 50) { score -= 15; desglose.push({label:'Gastos Fijos Altos', val: -15}); recs.push('Tus gastos fijos superan el 50% de tus ingresos.'); }
    } else {
       score -= 20; desglose.push({label:'Sin ingresos este mes', val: -20});
    }

    if (liquidezTotal < egresosMesTotal) {
      score -= 20; desglose.push({label:'Liquidez en Riesgo', val: -20}); recs.push('Tu liquidez no cubre tus gastos del mes.');
    }

    if (deudaTotal > liquidezTotal * 2) {
      score -= 20; desglose.push({label:'Endeudamiento Crítico', val: -20}); recs.push('Tu deuda es más del doble de tu liquidez. Frena el uso de TDC.');
    } else if (deudaTotal > liquidezTotal) {
      score -= 10; desglose.push({label:'Deuda > Liquidez', val: -10});
    }

    if (score === 100) { desglose.push({label:'¡Salud Óptima!', val: 100}); recs.push('Mantén este ritmo. Tienes un excelente control financiero.'); }
    
    return { score: Math.max(0, score), desglose, recs };
  }, [liquidezTotal, deudaTotal, ingresosMesTotal, egresosMes, activeCalculatedAccounts.length]);


  // ============================================================================
  // FUNCIONES CRUD
  // ============================================================================
  const handleQuickSave = () => {
    if (!qeMonto || !qeDescripcion || !qeCategoria || !qeCuenta) { showToast("Faltan datos", "error"); return; }
    
    const txData = {
      id: generateId(),
      fecha: getLocalToday(),
      descripcion: qeDescripcion,
      categoria: qeCategoria,
      monto: Number(qeMonto),
      cuentaId: qeCuenta,
      tipo: 'Variable'
    };

    if (qeType === 'egreso') {
      txData.deudaId = qeDeuda || null; // ✨ Conexión a deudas desde el móvil
      const newEgresos = [...egresos, txData];
      setEgresos(newEgresos); syncToCloud({ egresos: newEgresos });
      showToast("Gasto guardado rápido");
    } else {
      txData.persona = 'Total';
      const newIngresos = [...ingresos, txData];
      setIngresos(newIngresos); syncToCloud({ ingresos: newIngresos });
      showToast("Ingreso guardado rápido");
    }

    setQuickEntryOpen(false);
    setQeStep(1); setQeMonto(''); setQeDescripcion(''); setQeCategoria(''); setQeMethod(''); setQeCuenta(''); setQeDeuda('');
  };

  const importAllState = async (data) => {
    try {
      if (data.cuentas) setCuentas(data.cuentas);
      if (data.ingresos) setIngresos(data.ingresos);
      if (data.egresos) setEgresos(data.egresos);
      if (data.transferencias) setTransferencias(data.transferencias);
      if (data.presupuestos) setPresupuestos(data.presupuestos);
      if (data.pagosFijos) setPagosFijos(data.pagosFijos);
      if (data.ingresosFijos) setIngresosFijos(data.ingresosFijos);
      if (data.categoriasMaestras) setCategoriasMaestras(data.categoriasMaestras);
      await cloudDocRef.set(data, { merge: true });
    } catch(err) { console.error(err); throw err; }
  };

  const addCuenta = (c) => { const n = [...cuentas, c]; setCuentas(n); syncToCloud({ cuentas: n }); };
  const updateCuenta = (id, nd) => { const n = cuentas.map(c => c.id === id ? { ...c, ...nd } : c); setCuentas(n); syncToCloud({ cuentas: n }); };
  const removeCuenta = (id) => { const n = cuentas.filter(c => c.id !== id); setCuentas(n); syncToCloud({ cuentas: n }); };
  
  const addIngreso = (i) => { const n = [...ingresos, i]; setIngresos(n); syncToCloud({ ingresos: n }); };
  const updateIngreso = (id, nd) => { const n = ingresos.map(i => i.id === id ? { ...i, ...nd } : i); setIngresos(n); syncToCloud({ ingresos: n }); };
  const removeIngreso = (id) => { const n = ingresos.filter(i => i.id !== id); setIngresos(n); syncToCloud({ ingresos: n }); };

  const addEgreso = (e) => { const n = [...egresos, e]; setEgresos(n); syncToCloud({ egresos: n }); };
  const updateEgreso = (id, nd) => { const n = egresos.map(e => e.id === id ? { ...e, ...nd } : e); setEgresos(n); syncToCloud({ egresos: n }); };
  const removeEgreso = (id) => { const n = egresos.filter(e => e.id !== id); setEgresos(n); syncToCloud({ egresos: n }); };

  const addTransferencia = (t) => { const n = [...transferencias, t]; setTransferencias(n); syncToCloud({ transferencias: n }); };
  const removeTransferencia = (id) => { const n = transferencias.filter(t => t.id !== id); setTransferencias(n); syncToCloud({ transferencias: n }); };

  const addPresupuesto = (p) => { const n = [...presupuestos, p]; setPresupuestos(n); syncToCloud({ presupuestos: n }); };
  const updatePresupuesto = (id, nd) => { const n = presupuestos.map(p => p.id === id ? { ...p, ...nd } : p); setPresupuestos(n); syncToCloud({ presupuestos: n }); };
  const removePresupuesto = (id) => { const n = presupuestos.filter(p => p.id !== id); setPresupuestos(n); syncToCloud({ presupuestos: n }); };

  const addPagoFijo = (p) => { const n = [...pagosFijos, p]; setPagosFijos(n); syncToCloud({ pagosFijos: n }); };
  const updatePagoFijo = (id, nd) => { const n = pagosFijos.map(p => p.id === id ? { ...p, ...nd } : p); setPagosFijos(n); syncToCloud({ pagosFijos: n }); };
  const removePagoFijo = (id) => { const n = pagosFijos.filter(p => p.id !== id); setPagosFijos(n); syncToCloud({ pagosFijos: n }); };


  // ============================================================================
  // RENDERIZADO CONDICIONAL
  // ============================================================================
  if (appCargando || authChecking) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold tracking-widest text-sm animate-pulse">CARGANDO CEREBRO FINANCIERO...</p>
      </div>
    );
  }

  if (!authUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-slate-300 font-sans pb-24 md:pb-0 select-none">
      {/* TOASTS */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl font-bold text-white flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XIcon/> : <CheckIcon/>}
          {toast.msg}
        </div>
      )}

      {/* MENÚ LATERAL ESCRITORIO */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-[#17171a] border-r border-slate-800/50 z-40 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">F</div>
            <div>
              <h1 className="font-black text-white text-lg leading-tight">Finanzas</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Familia Edition</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: PieChartIcon, label: 'Dashboard' },
              { id: 'analitica', icon: TrendingUpIcon, label: 'Analítica' },
              { id: 'score', icon: ActivityIcon, label: 'Score & Avalancha' },
              { id: 'cuentas', icon: GridIcon, label: 'Cuentas' },
              { id: 'inversiones', icon: TargetIcon, label: 'Inversiones' },
              { id: 'ingresos', icon: WalletIcon, label: 'Ingresos' },
              { id: 'egresos', icon: ReceiptIcon, label: 'Egresos' },
              { id: 'presupuestos', icon: FilterIcon, label: 'Presupuestos' },
              { id: 'deudas', icon: CreditCardIcon, label: 'Deudas & Tarjetas' },
              { id: 'simulador', icon: ZapIcon, label: 'Simulador Pagos' },
              { id: 'settings', icon: SettingsIcon, label: 'Ajustes & Backup' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
              >
                 <item.icon size={20} />
                 {item.label}
              </button>
            ))}
            
            <button 
              onClick={() => auth.signOut()} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-rose-500 hover:bg-rose-500/10 mt-8"
            >
              <LogOutIcon size={20} /> 
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#17171a] p-4 rounded-2xl border border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
               {['Total', 'Leo', 'Andre'].map(p => (
                 <button 
                   key={p} 
                   onClick={() => setFiltroPersona(p)} 
                   className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filtroPersona === p ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                   {p}
                 </button>
               ))}
             </div>
             {isOffline && (
               <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider animate-pulse flex items-center gap-1"> 
                 <WifiOffIcon size={14}/> Offline
               </span>
             )}
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 cursor-pointer"
            />
            <button 
              onClick={() => {setQeType('egreso'); setQuickEntryOpen(true);}} 
              className="md:hidden bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <PlusIcon size={20}/>
            </button>
          </div>
        </div>

        {/* PESTAÑAS (RUTEO VIRTUAL) */}
        <div className="animate-in fade-in duration-300">
          
          {activeTab === 'dashboard' && <DashboardTab flujoNetoMes={flujoNetoMes} cuotasMesTotal={0} cuotasMesRestantes={0} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} deudaTotal={deudaTotal} liquidezTotal={liquidezTotal} selectedMonth={selectedMonth} egresosMes={egresosMes} ingresos={ingresos} egresos={egresos} presupuestos={presupuestos} pagosFijos={pagosFijos} ingresosFijos={ingresosFijos} comprasCuotas={[]} cuentas={activeCalculatedAccounts} filtroPersona={filtroPersona} />}
          
          {activeTab === 'analitica' && <AnaliticaTab ingresos={ingresos} egresos={egresos} selectedMonth={selectedMonth} cuentas={activeCalculatedAccounts} scoreData={scoreData} scoreHistory={scoreHistory} filtroPersona={filtroPersona} comprasCuotas={[]} />}
          
          {activeTab === 'score' && <ScoreTab scoreData={scoreData} scoreHistory={scoreHistory} selectedMonth={selectedMonth} presupuestos={presupuestos} egresosMes={egresosMes} cuentas={activeCalculatedAccounts} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} cuotasMesTotal={0} pagosFijos={pagosFijos} comprasCuotas={[]} />}
          
          {activeTab === 'cuentas' && <CuentasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} transferencias={transferencias} addTransferencia={addTransferencia} removeTransferencia={removeTransferencia} showToast={showToast} filtroPersona={filtroPersona} />}
          
          {activeTab === 'inversiones' && <InversionesTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} ingresos={ingresos} addIngreso={addIngreso} egresos={egresos} transferencias={transferencias} selectedMonth={selectedMonth} showToast={showToast} />}
          
          {activeTab === 'ingresos' && <IngresosTab ingresos={ingresos} addIngreso={addIngreso} updateIngreso={updateIngreso} removeIngreso={removeIngreso} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} showToast={showToast} filtroPersona={filtroPersona} />}
          
          {activeTab === 'egresos' && <EgresosTab egresos={egresos} addEgreso={addEgreso} updateEgreso={updateEgreso} removeEgreso={removeEgreso} pagosFijos={pagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} presupuestos={presupuestos} categoriasMaestras={categoriasMaestras} showToast={showToast} />}
          
          {activeTab === 'presupuestos' && <PresupuestosTab presupuestos={presupuestos} addPresupuesto={addPresupuesto} updatePresupuesto={updatePresupuesto} removePresupuesto={removePresupuesto} pagosFijos={pagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} egresos={egresos} selectedMonth={selectedMonth} showToast={showToast} categoriasMaestras={categoriasMaestras} />}
          
          {activeTab === 'deudas' && <DeudasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} showToast={showToast} egresos={egresos} />}
          
          {activeTab === 'simulador' && <SimuladorTab cuentas={activeCalculatedAccounts} showToast={showToast} />}
          
          {activeTab === 'settings' && <SettingsTab stateData={{cuentas, ingresos, egresos, transferencias, presupuestos, pagosFijos, ingresosFijos, comprasCuotas: [], categoriasMaestras}} importAllState={importAllState} selectedMonth={selectedMonth} showToast={showToast} />}
        </div>
      </main>

      {/* MENÚ INFERIOR MÓVIL RESTAURADO */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#17171a]/95 backdrop-blur-xl border-t border-slate-800/50 pb-safe z-40 px-2 py-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'dashboard', icon: PieChartIcon, label: 'Dash' },
          { id: 'cuentas', icon: GridIcon, label: 'Cuentas' },
          { id: 'add_button' }, 
          { id: 'egresos', icon: ReceiptIcon, label: 'Gastos' },
          { id: 'settings', icon: SettingsIcon, label: 'Ajustes' }
        ].map((item) => {
          
          if (item.id === 'add_button') {
            return (
              <button 
                key="add" 
                onClick={() => {setQeType('egreso'); setQuickEntryOpen(true);}} 
                className="relative -top-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border-4 border-[#0f0f11] active:scale-90 transition-transform"
              >
                <PlusIcon size={24} />
              </button>
            );
          }
          
          const isActive = activeTab === item.id;
          
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex flex-col items-center justify-center w-16 p-1 transition-all ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}/>
              <span className="text-[9px] font-bold mt-1 tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* WIZARD DE REGISTRO RÁPIDO (MÓVIL) */}
      {quickEntryOpen && (
        <div className="fixed inset-0 bg-[#0f0f11]/95 backdrop-blur-md z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          
          <div className="p-6 flex justify-between items-center border-b border-slate-800">
            <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
               <ZapIcon size={20} className="text-amber-400"/> Movimiento Rápido
            </h3>
            <button 
              onClick={() => {setQuickEntryOpen(false); setQeStep(1);}} 
              className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"
            >
              <XIcon size={18}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full max-w-sm mx-auto">
              
              {/* Barra de progreso */}
              <div className="flex gap-2 mb-8">
                {[1,2,3,4,5].map(step => (
                  <div 
                    key={step} 
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step <= qeStep ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}
                  ></div>
                ))}
              </div>

              {qeStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-8">¿Qué quieres registrar?</h4>
                  
                  <button 
                    onClick={() => {setQeType('egreso'); setQeStep(2);}} 
                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/30 text-rose-400 py-6 rounded-2xl flex flex-col items-center gap-3 transition-colors"
                  >
                    <ReceiptIcon size={32}/>
                    <span className="font-black text-lg tracking-widest uppercase">Un Gasto</span>
                  </button>
                  
                  <button 
                    onClick={() => {setQeType('ingreso'); setQeStep(2);}} 
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 text-emerald-400 py-6 rounded-2xl flex flex-col items-center gap-3 transition-colors"
                  >
                    <WalletIcon size={32}/>
                    <span className="font-black text-lg tracking-widest uppercase">Un Ingreso</span>
                  </button>
                </div>
              )}

              {qeStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-4">¿De cuánto estamos hablando?</h4>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500">$</span>
                    <input 
                      type="number" 
                      autoFocus 
                      value={qeMonto} 
                      onChange={e => setQeMonto(e.target.value)} 
                      className="w-full bg-slate-900 border-2 border-indigo-500/50 text-white text-4xl font-black rounded-2xl py-6 pl-14 pr-6 outline-none focus:border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
                      placeholder="0" 
                    />
                  </div>
                  <button 
                    disabled={!qeMonto} 
                    onClick={() => setQeStep(3)} 
                    className="w-full py-4 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-black text-lg transition-colors shadow-lg"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {qeStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-4">¿De qué fue?</h4>
                  <input 
                    type="text" 
                    autoFocus 
                    value={qeDescripcion} 
                    onChange={e => setQeDescripcion(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xl font-bold rounded-2xl p-4 outline-none focus:border-indigo-500" 
                    placeholder="Ej. Almuerzo, Uber..." 
                  />
                  <button 
                    disabled={!qeDescripcion} 
                    onClick={() => setQeStep(4)} 
                    className="w-full py-4 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-black text-lg transition-colors shadow-lg"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {qeStep === 4 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-4">Selecciona la Categoría</h4>
                  <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                    {categoriasMaestras.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => {setQeCategoria(cat); setQeStep(5);}} 
                        className="bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 py-4 px-2 rounded-xl text-sm font-bold transition-all text-center"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {qeStep === 5 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
                  <h4 className="text-2xl font-black text-white text-center mb-4">
                    {qeType === 'egreso' ? '¿Con qué pagaste?' : '¿A dónde entró?'}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      {id: 'cash', label: 'Efectivo', icon: '💵'},
                      {id: 'bank', label: 'Débito', icon: '🏦'},
                      {id: 'credit', label: 'Crédito', icon: '💳'}
                    ].map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => {setQeMethod(m.id); setQeCuenta('');}} 
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${qeMethod === m.id ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                      >
                        <span className="text-2xl mb-2">{m.icon}</span>
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {activeCalculatedAccounts.filter(c => c.type === qeMethod).map(acc => (
                      <button 
                        key={acc.id} 
                        onClick={() => setQeCuenta(acc.id)} 
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${qeCuenta === acc.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'}`}
                      >
                        <span className="font-bold">{acc.name}</span>
                        {qeCuenta === acc.id && <CheckIcon size={20} />}
                      </button>
                    ))}
                  </div>

                  {/* Selector de Abono a Deuda en el Botón Móvil */}
                  {qeType === 'egreso' && (
                    <div className="mt-6 p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl">
                      <label className="text-xs font-bold text-indigo-400 uppercase block mb-2">
                        Abonar a Deuda (Opcional)
                      </label>
                      <select 
                        value={qeDeuda} 
                        onChange={e => setQeDeuda(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500"
                      >
                        <option value="">No es pago a deuda</option>
                        {activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type)).map(d => (
                          <option key={d.id} value={d.id}>Pagar: {d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {qeCuenta && (
                    <button 
                      onClick={handleQuickSave} 
                      className={`w-full py-4 rounded-xl font-black text-white text-lg transition-transform hover:scale-[1.02] mt-6 animate-in slide-in-from-bottom-4 shadow-xl ${qeType === 'egreso' ? 'bg-rose-600 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}
                    >
                      ¡Guardar Definitivo!
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
