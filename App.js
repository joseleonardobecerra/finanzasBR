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

  // WIZARD DE REGISTRO RÁPIDO
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [qeStep, setQeStep] = useState(1);
  const [qeType, setQeType] = useState('');
  const [qeMonto, setQeMonto] = useState('');
  const [qeDescripcion, setQeDescripcion] = useState('');
  const [qeCategoria, setQeCategoria] = useState('');
  const [qeMethod, setQeMethod] = useState('');
  const [qeCuenta, setQeCuenta] = useState('');
  const [qeDeuda, setQeDeuda] = useState(''); // ✨ NUEVO: Para el pago rápido de deudas

  // BASES DE DATOS GLOBALES
  const [cuentas, setCuentas] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [pagosFijos, setPagosFijos] = useState([]);
  const [ingresosFijos, setIngresosFijos] = useState([]);
  const [comprasCuotas, setComprasCuotas] = useState([]);
  const [categoriasMaestras, setCategoriasMaestras] = useState([
    'Vivienda', 'Transporte', 'Alimentación', 'Servicios', 'Educación', 'Salud', 'Entretenimiento', 'Ropa', 'Otros', 'Intereses y Cargos'
  ]);

  // ============================================================================
  // CONEXIÓN A FIREBASE Y SINCRONIZACIÓN
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
    const unsubscribeAuth = auth.onAuthStateStateChanged(user => {
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
        setCuentas(data.cuentas || []);
        setIngresos(data.ingresos || []);
        setEgresos(data.egresos || []);
        setTransferencias(data.transferencias || []);
        setPresupuestos(data.presupuestos || []);
        setPagosFijos(data.pagosFijos || []);
        setIngresosFijos(data.ingresosFijos || []);
        setComprasCuotas(data.comprasCuotas || []);
        if (data.categoriasMaestras) setCategoriasMaestras(data.categoriasMaestras);
        if (data.scoreHistory) setScoreHistory(data.scoreHistory);
      } else {
        cloudDocRef.set({
          cuentas: [], ingresos: [], egresos: [], transferencias: [], presupuestos: [],
          pagosFijos: [], ingresosFijos: [], comprasCuotas: [],
          categoriasMaestras, scoreHistory: {}
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
      console.error("Error al sincronizar con la nube:", err);
      if (isOffline) showToast("Guardado localmente. Se sincronizará cuando vuelvas a estar online.");
    });
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ============================================================================
  // 🧠 EL CEREBRO MATEMÁTICO (AQUÍ ESTÁ LA CONEXIÓN TOTAL)
  // ============================================================================
  const activeCalculatedAccounts = useMemo(() => {
    return cuentas.map(acc => {
      // 1. Partimos del saldo y deuda inicial de la cuenta
      let currentBalance = Number(acc.initialBalance) || 0;
      let currentDebt = Number(acc.initialDebt) || 0;

      // 2. SUMAR INGRESOS
      ingresos.forEach(ing => {
        if (ing.cuentaId === acc.id) {
          currentBalance += Number(ing.monto);
        }
      });

      // 3. PROCESAR EGRESOS Y PAGOS DE DEUDAS
      egresos.forEach(egr => {
        // CASO A: El dinero salió de esta cuenta
        if (egr.cuentaId === acc.id) {
           if (acc.type === 'credit') {
              // Si pagas algo usando la Tarjeta, LA DEUDA AUMENTA
              currentDebt += Number(egr.monto);
           } else {
              // Si pagas algo con Débito o Efectivo, EL SALDO BAJA
              currentBalance -= Number(egr.monto);
           }
        }

        // CASO B: Abono directo a una Deuda
        // ✨ ¡Esta es la corrección maestra! Si la tarjeta coincide con el deudaId del egreso
        if (egr.deudaId === acc.id) {
           currentDebt -= Number(egr.monto);
           if (currentDebt < 0) currentDebt = 0; // Previene que la deuda quede en negativo
        }
      });

      // 4. PROCESAR TRANSFERENCIAS Y AVANCES
      transferencias.forEach(tx => {
         // Si la plata salió de aquí
         if (tx.fromId === acc.id) {
            const montoAExtraer = Number(tx.monto) + Number(tx.costoAvance || 0);
            if (acc.type === 'credit') {
               currentDebt += montoAExtraer; // Avance de tarjeta aumenta deuda + comisión
            } else {
               currentBalance -= montoAExtraer; // Traslado normal baja el saldo
            }
         }
         // Si la plata entró aquí
         if (tx.toId === acc.id) {
            if (acc.type === 'credit' || acc.type === 'loan') {
               // Si le transfieres a una tarjeta, es un PAGO (Baja la deuda)
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
  // CÁLCULOS GLOBALES PARA EL DASHBOARD
  // ============================================================================
  const egresosMes = egresos.filter(e => e.fecha.startsWith(selectedMonth));
  const ingresosMes = ingresos.filter(i => i.fecha.startsWith(selectedMonth));
  
  const ingresosMesTotal = ingresosMes.reduce((sum, i) => sum + Number(i.monto), 0);
  const egresosMesTotal = egresosMes.filter(e => !e.esCuota).reduce((sum, e) => sum + Number(e.monto), 0);
  const cuotasMesTotal = egresosMes.filter(e => e.esCuota).reduce((sum, e) => sum + Number(e.monto), 0);
  
  const liquidezTotal = activeCalculatedAccounts.filter(c => ['bank', 'cash', 'pocket'].includes(c.type)).reduce((sum, c) => sum + c.currentBalance, 0);
  const deudaTotal = activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type)).reduce((sum, c) => sum + c.currentDebt, 0);
  const flujoNetoMes = ingresosMesTotal - egresosMesTotal - cuotasMesTotal;

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

    const activeCuotas = comprasCuotas.filter(c => c.estado === 'Activa').length;
    if (activeCuotas > 3) {
      score -= 10; desglose.push({label:'Exceso de Compras a Cuotas', val: -10}); recs.push('Tienes más de 3 compras a cuotas activas. Trata de unificarlas o liquidarlas.');
    }

    if (score === 100) { desglose.push({label:'¡Salud Óptima!', val: 100}); recs.push('Mantén este ritmo. Tienes un excelente control financiero.'); }
    
    return { score: Math.max(0, score), desglose, recs };
  }, [liquidezTotal, deudaTotal, ingresosMesTotal, egresosMes, comprasCuotas, activeCalculatedAccounts.length]);


  // ============================================================================
  // FUNCIONES DE CONTROL (CRUD PARA COMPONENTES)
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
      txData.deudaId = qeDeuda || null; // Conexión rápida de deudas
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
      if (data.comprasCuotas) setComprasCuotas(data.comprasCuotas);
      if (data.categoriasMaestras) setCategoriasMaestras(data.categoriasMaestras);
      await cloudDocRef.set(data, { merge: true });
    } catch(err) { console.error(err); throw err; }
  };

  // ... (RESTO DE FUNCIONES CRUD PARA PASAR COMO PROPS)
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

  const addComprasCuotas = (c) => { const n = [...comprasCuotas, c]; setComprasCuotas(n); syncToCloud({ comprasCuotas: n }); };
  const updateComprasCuotas = (id, nd) => { const n = comprasCuotas.map(c => c.id === id ? { ...c, ...nd } : c); setComprasCuotas(n); syncToCloud({ comprasCuotas: n }); };
  const removeComprasCuotas = (id) => { const n = comprasCuotas.filter(c => c.id !== id); setComprasCuotas(n); syncToCloud({ comprasCuotas: n }); };


  // ============================================================================
  // RENDERIZADO CONDICIONAL DE PANTALLAS
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
      {/* NOTIFICACIONES TOAST */}
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
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
                <item.icon /> {item.label}
              </button>
            ))}
            <button onClick={() => auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-rose-500 hover:bg-rose-500/10 mt-8">
              <LogOutIcon /> Cerrar Sesión
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
        
        {/* BARRA SUPERIOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#17171a] p-4 rounded-2xl border border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
               {['Total', 'Leo', 'Andre'].map(p => (
                 <button key={p} onClick={() => setFiltroPersona(p)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filtroPersona === p ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                   {p}
                 </button>
               ))}
             </div>
             {isOffline && <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider animate-pulse flex items-center gap-1"><WifiOffIcon/> Offline</span>}
          </div>
          
          <div className="flex items-center gap-3">
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 cursor-pointer"/>
            <button onClick={() => {setQeType('egreso'); setQuickEntryOpen(true);}} className="md:hidden bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform"><PlusIcon/></button>
          </div>
        </div>

        {/* PESTAÑAS (RUTEO VIRTUAL) */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'dashboard' && <DashboardTab flujoNetoMes={flujoNetoMes} cuotasMesTotal={cuotasMesTotal} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} deudaTotal={deudaTotal} liquidezTotal={liquidezTotal} selectedMonth={selectedMonth} egresosMes={egresosMes} ingresos={ingresos} egresos={egresos} presupuestos={presupuestos} pagosFijos={pagosFijos} cuentas={activeCalculatedAccounts} filtroPersona={filtroPersona} />}
          {activeTab === 'analitica' && <AnaliticaTab ingresos={ingresos} egresos={egresos} selectedMonth={selectedMonth} cuentas={activeCalculatedAccounts} scoreData={scoreData} scoreHistory={scoreHistory} filtroPersona={filtroPersona} />}
          {activeTab === 'score' && <ScoreTab scoreData={scoreData} scoreHistory={scoreHistory} selectedMonth={selectedMonth} presupuestos={presupuestos} egresosMes={egresosMes} cuentas={activeCalculatedAccounts} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} cuotasMesTotal={cuotasMesTotal} />}
          {activeTab === 'cuentas' && <CuentasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} transferencias={transferencias} addTransferencia={addTransferencia} removeTransferencia={removeTransferencia} showToast={showToast} filtroPersona={filtroPersona} />}
          {activeTab === 'inversiones' && <InversionesTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} ingresos={ingresos} addIngreso={addIngreso} egresos={egresos} transferencias={transferencias} selectedMonth={selectedMonth} showToast={showToast} />}
          {activeTab === 'ingresos' && <IngresosTab ingresos={ingresos} addIngreso={addIngreso} updateIngreso={updateIngreso} removeIngreso={removeIngreso} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} showToast={showToast} filtroPersona={filtroPersona} />}
          {activeTab === 'egresos' && <EgresosTab egresos={egresos} addEgreso={addEgreso} updateEgreso={updateEgreso} removeEgreso={removeEgreso} pagosFijos={pagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} comprasCuotas={comprasCuotas} addComprasCuotas={addComprasCuotas} removeComprasCuotas={removeComprasCuotas} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} presupuestos={presupuestos} categoriasMaestras={categoriasMaestras} showToast={showToast} filtroPersona={filtroPersona} />}
          {activeTab === 'presupuestos' && <PresupuestosTab presupuestos={presupuestos} addPresupuesto={addPresupuesto} updatePresupuesto={updatePresupuesto} removePresupuesto={removePresupuesto} pagosFijos={pagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} egresos={egresos} selectedMonth={selectedMonth} showToast={showToast} categoriasMaestras={categoriasMaestras} filtroPersona={filtroPersona} />}
          {activeTab === 'deudas' && <DeudasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} showToast={showToast} egresos={egresos} />}
          {activeTab === 'simulador' && <SimuladorTab cuentas={activeCalculatedAccounts} showToast={showToast} />}
          {activeTab === 'settings' && <SettingsTab stateData={{cuentas, ingresos, egresos, transferencias, presupuestos, pagosFijos, comprasCuotas, categoriasMaestras}} importAllState={importAllState} selectedMonth={selectedMonth} showToast={showToast} />}
        </div>
      </main>

      {/* MENÚ INFERIOR (MÓVIL) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#17171a]/95 backdrop-blur-xl border-t border-slate-800/50 pb-safe z-40 px-2 py-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'dashboard', icon: PieChartIcon, label: 'Dash' },
          { id: 'cuentas', icon: GridIcon, label: 'Cuentas' },
          { id: 'add_button' }, 
          { id: 'egresos', icon: ReceiptIcon, label: 'Gastos' },
          { id: 'settings', icon: SettingsIcon, label: 'Ajustes' }
        ].map((item, idx) => {
          if (item.id === 'add_button') {
            return (
              <button key="add" onClick={() => {setQeType('egreso'); setQuickEntryOpen(true);}} className="relative -top-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border-4 border-[#0f0f11] active:scale-90 transition-transform">
                <PlusIcon size={24} />
              </button>
            );
          }
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-16 p-1 transition-all ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
              <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}/>
              <span className="text-[9px] font-bold mt-1 tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* WIZARD: REGISTRO RÁPIDO (MÓVIL) */}
      {quickEntryOpen && (
        <div className="fixed inset-0 bg-[#0f0f11]/95 backdrop-blur-md z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="p-6 flex justify-between items-center border-b border-slate-800">
            <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <ZapIcon className="text-amber-400"/> Movimiento Rápido
            </h3>
            <button onClick={() => {setQuickEntryOpen(false); setQeStep(1);}} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"><XIcon/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full max-w-sm mx-auto">
              
              {/* Barra de progreso */}
              <div className="flex gap-2 mb-8">
                {[1,2,3,4,5].map(step => (
                  <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step <= qeStep ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
                ))}
              </div>

              {qeStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-8">¿Qué quieres registrar?</h4>
                  <button onClick={() => {setQeType('egreso'); setQeStep(2);}} className="w-full bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/30 text-rose-400 py-6 rounded-2xl flex flex-col items-center gap-3 transition-colors">
                    <ReceiptIcon size={32}/>
                    <span className="font-black text-lg tracking-widest uppercase">Un Gasto</span>
                  </button>
                  <button onClick={() => {setQeType('ingreso'); setQeStep(2);}} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 text-emerald-400 py-6 rounded-2xl flex flex-col items-center gap-3 transition-colors">
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
                    <input type="number" autoFocus value={qeMonto} onChange={e => setQeMonto(e.target.value)} className="w-full bg-slate-900 border-2 border-indigo-500/50 text-white text-4xl font-black rounded-2xl py-6 pl-14 pr-6 outline-none focus:border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" placeholder="0" />
                  </div>
                  <button disabled={!qeMonto} onClick={() => setQeStep(3)} className="w-full py-4 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-black text-lg transition-colors shadow-lg">Continuar</button>
                </div>
              )}

              {qeStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-4">¿De qué fue?</h4>
                  <input type="text" autoFocus value={qeDescripcion} onChange={e => setQeDescripcion(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-xl font-bold rounded-2xl p-4 outline-none focus:border-indigo-500" placeholder="Ej. Almuerzo, Uber..." />
                  <button disabled={!qeDescripcion} onClick={() => setQeStep(4)} className="w-full py-4 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-black text-lg transition-colors shadow-lg">Continuar</button>
                </div>
              )}

              {qeStep === 4 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <h4 className="text-2xl font-black text-white text-center mb-4">Selecciona la Categoría</h4>
                  <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                    {categoriasMaestras.map(cat => (
                      <button key={cat} onClick={() => {setQeCategoria(cat); setQeStep(5);}} className="bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 py-4 px-2 rounded-xl text-sm font-bold transition-all text-center">
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
                        {qeCuenta === acc.id && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                  
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
