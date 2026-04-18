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

  // ✨ ESTADOS PARA EL WIZARD DE REGISTRO RÁPIDO PASO A PASO
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [qeStep, setQeStep] = useState(1); // Pasos del 1 al 5
  const [qeType, setQeType] = useState(''); // 'egreso' | 'ingreso'
  const [qeMonto, setQeMonto] = useState('');
  const [qeDescripcion, setQeDescripcion] = useState('');
  const [qeCategoria, setQeCategoria] = useState('');
  const [qeMethod, setQeMethod] = useState(''); // 'cash' | 'bank' | 'credit'
  const [qeCuenta, setQeCuenta] = useState('');

  // Íconos
  const XIcon = ({ size=24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
  const ArrowLeftIcon = ({ size=24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setAuthUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const changeMonth = (offset) => { const [y, m] = selectedMonth.split('-'); const d = new Date(y, parseInt(m) - 1 + offset, 1); setSelectedMonth(d.toISOString().slice(0, 7)); };
  const getMonthName = (ym) => { const [y, m] = ym.split('-'); return new Date(y, parseInt(m) - 1, 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }); };

  const [cuentas, setCuentas] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [comprasCuotas, setComprasCuotas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [pagosFijos, setPagosFijos] = useState([]);
  const [ingresosFijos, setIngresosFijos] = useState([]);

  const loadedRef = useRef(0);
  const TOTAL_COL = 9;
  const markLoaded = () => { loadedRef.current += 1; if (loadedRef.current >= TOTAL_COL) setAppCargando(false); };

  useEffect(() => {
    if (!authUser) return;
    const col = (name, setter) => db.collection(name).onSnapshot(snap => { setter(snap.docs.map(d => d.data())); markLoaded(); });
    const unsubs = [
      col('cuentas', setCuentas), col('transferencias', setTransferencias), col('ingresos', setIngresos),
      col('egresos', setEgresos), col('comprasCuotas', setComprasCuotas), col('presupuestos', setPresupuestos),
      col('pagosFijos', setPagosFijos), col('ingresosFijos', setIngresosFijos),
      db.collection('sistema').doc('scoreHistory').onSnapshot(snap => { if (snap.exists) setScoreHistory(snap.data()); markLoaded(); }),
    ];
    return () => unsubs.forEach(u => u());
  }, [authUser]);

  const fire = {
    add: (colName, data) => db.collection(colName).doc(data.id).set(data),
    update: (colName, id, data) => db.collection(colName).doc(id).set(data, { merge: true }),
    remove: (colName, id) => db.collection(colName).doc(id).delete(),
    bulkReplace: async (colName, newArray) => {
      const existing = await db.collection(colName).get();
      for (let i = 0; i < existing.docs.length; i += 450) {
        const batch = db.batch(); existing.docs.slice(i, i + 450).forEach(d => batch.delete(d.ref)); await batch.commit();
      }
      for (let i = 0; i < newArray.length; i += 450) {
        const batch = db.batch(); newArray.slice(i, i + 450).forEach(item => batch.set(db.collection(colName).doc(item.id), item)); await batch.commit();
      }
    },
  };

  const addCuenta = (d) => fire.add('cuentas', d);
  const updateCuenta = (id, d) => fire.update('cuentas', id, d);
  const removeCuenta = (id) => fire.remove('cuentas', id);
  const addTransferencia = (d) => fire.add('transferencias', d);
  const addEgreso = (d) => fire.add('egresos', d);
  const updateEgreso = (id, d) => fire.update('egresos', id, d);
  const removeEgreso = (id) => fire.remove('egresos', id);
  const addIngreso = (d) => fire.add('ingresos', d);
  const updateIngreso = (id, d) => fire.update('ingresos', id, d);
  const removeIngreso = (id) => fire.remove('ingresos', id);
  const addComprasCuotas = (d) => fire.add('comprasCuotas', d);
  const removeComprasCuotas = (id) => fire.remove('comprasCuotas', id);
  const addPresupuesto = (d) => fire.add('presupuestos', d);
  const updatePresupuesto = (id, d) => fire.update('presupuestos', id, d);
  const removePresupuesto = (id) => fire.remove('presupuestos', id);
  const addPagoFijo = (d) => fire.add('pagosFijos', d);
  const updatePagoFijo = (id, d) => fire.update('pagosFijos', id, d);
  const removePagoFijo = (id) => fire.remove('pagosFijos', id);
  const addIngresoFijo = (d) => fire.add('ingresosFijos', d);
  const updateIngresoFijo = (id, d) => fire.update('ingresosFijos', id, d);
  const removeIngresoFijo = (id) => fire.remove('ingresosFijos', id);

  const importAllState = async (p) => {
    const cols = [['cuentas', p.cuentas], ['transferencias', p.transferencias], ['ingresos', p.ingresos], ['egresos', p.egresos], ['presupuestos', p.presupuestos], ['pagosFijos', p.pagosFijos], ['comprasCuotas', p.comprasCuotas], ['ingresosFijos', p.ingresosFijos]];
    for (const [n, a] of cols) { if (a && a.length) await fire.bulkReplace(n, a); }
  };

  const addPagoFijoToState = (pf) => addPagoFijo({ ...pf, id: generateId(), diaPago: pf.diaPago || 1, categoria: pf.categoria || 'Otros' });

  const categoriasMaestras = useMemo(() => {
    const cats = new Set(['Inversión', 'Gasolina', 'Mercado', 'Mercado Aseo', 'Aseo hogar', 'Botellón Agua', 'Panadería', 'Alimentación', 'Ocio']);
    presupuestos.forEach(p => cats.add(String(p.categoria)));
    pagosFijos.forEach(pf => { if (pf.categoria && pf.categoria !== 'Otros') cats.add(String(pf.categoria)); });
    egresos.forEach(e => { if (e.categoria && e.categoria !== 'Otros') cats.add(String(e.categoria)); });
    return Array.from(cats).sort();
  }, [presupuestos, pagosFijos, egresos]);

  const calculatedAccounts = useMemo(() => {
    const accMap = {};
    cuentas.forEach(c => { accMap[c.id] = { ...c, currentBalance: Number(c.initialBalance) || 0, currentDebt: Number(c.initialDebt) || 0, montoPrestado: Number(c.montoPrestado) || Number(c.initialDebt) || 0, totalPagado: Number(c.totalPagadoPrevio) || 0, lastPaymentDate: c.lastPaymentDate || null }; });
    ingresos.forEach(i => { if (accMap[i.cuentaId]) accMap[i.cuentaId].currentBalance += Number(i.monto); });
    const sortedEgresos = [...egresos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    sortedEgresos.forEach(e => {
      if (accMap[e.cuentaId]) {
        if (['credit', 'loan'].includes(accMap[e.cuentaId].type)) accMap[e.cuentaId].currentDebt += Number(e.monto);
        else accMap[e.cuentaId].currentBalance -= Number(e.monto);
      }
      if (e.deudaId && accMap[e.deudaId]) {
        const account = accMap[e.deudaId]; account.totalPagado += Number(e.monto);
        if (account.type === 'loan') {
          let capital = Number(e.monto);
          if (account.lastPaymentDate) {
            const diffDays = Math.round(Math.abs(new Date(e.fecha) - new Date(account.lastPaymentDate)) / 86400000);
            const tasaDiaria = Math.pow(1 + account.tasaEA / 100, 1 / 360) - 1; capital = Number(e.monto) - account.currentDebt * tasaDiaria * diffDays;
          } else { capital = Number(e.monto) - account.currentDebt * getTasaMensual(account.tasaEA); }
          account.lastPaymentDate = e.fecha; account.currentDebt = Math.max(0, account.currentDebt - capital);
        } else { account.currentDebt = Math.max(0, account.currentDebt - Number(e.monto)); }
      }
    });
    transferencias.forEach(t => {
      if (accMap[t.fromId]) { if (['credit', 'loan'].includes(accMap[t.fromId].type)) accMap[t.fromId].currentDebt += Number(t.monto); else accMap[t.fromId].currentBalance -= Number(t.monto); }
      if (accMap[t.toId]) { if (['credit', 'loan'].includes(accMap[t.toId].type)) accMap[t.toId].currentDebt = Math.max(0, accMap[t.toId].currentDebt - Number(t.monto)); else accMap[t.toId].currentBalance += Number(t.monto); }
    });
    return Object.values(accMap);
  }, [cuentas, ingresos, egresos, transferencias]);

  const getOwnerFallback = (text) => {
     if (!text) return 'Shared'; const t = text.toUpperCase();
     const hasL = t.includes('LEO') || t.endsWith(' L') || t.includes(' L '); const hasA = t.includes('ANDRE') || t.includes('ANDRÉ') || t.endsWith(' A') || t.includes(' A ');
     if (hasL && !hasA) return 'Leo'; if (hasA && !hasL) return 'Andre'; return 'Shared';
  };

  const belongsToFilter = (owner) => filtroPersona === 'Total' || owner === 'Shared' || owner === filtroPersona;
  const activeCalculatedAccounts = useMemo(() => calculatedAccounts.filter(c => belongsToFilter(c.ownerId || getOwnerFallback(c.name))), [calculatedAccounts, filtroPersona]);
  const activeIngresos = useMemo(() => ingresos.filter(i => { const ownerAcc = cuentas.find(c => c.id === i.cuentaId); const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared'; return belongsToFilter(accOwner !== 'Shared' ? accOwner : (i.ownerId || getOwnerFallback(i.persona + ' ' + i.descripcion))); }), [ingresos, cuentas, filtroPersona]);
  const activeEgresos = useMemo(() => egresos.filter(e => { const ownerAcc = cuentas.find(c => c.id === e.cuentaId); const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared'; return belongsToFilter(accOwner !== 'Shared' ? accOwner : (e.ownerId || getOwnerFallback(e.descripcion + ' ' + e.categoria))); }), [egresos, cuentas, filtroPersona]);
  const activePagosFijos = useMemo(() => pagosFijos.filter(pf => belongsToFilter(pf.ownerId || getOwnerFallback(pf.descripcion + ' ' + pf.categoria))), [pagosFijos, filtroPersona]);
  const activeIngresosFijos = useMemo(() => { const currentMonthNum = selectedMonth.split('-')[1]; return ingresosFijos.filter(inf => { const passFilter = belongsToFilter(inf.ownerId || getOwnerFallback(inf.descripcion + ' ' + inf.persona)); const descLower = inf.descripcion.toLowerCase(); let passMonth = true; if (descLower.includes('prima 1')) passMonth = currentMonthNum === '07'; else if (descLower.includes('prima 2')) passMonth = currentMonthNum === '12'; return passFilter && passMonth; }); }, [ingresosFijos, filtroPersona, selectedMonth]);
  const activePresupuestos = useMemo(() => presupuestos.filter(p => belongsToFilter(p.ownerId || getOwnerFallback(p.categoria))), [presupuestos, filtroPersona]);
  
  const activeComprasCuotas = useMemo(() => comprasCuotas.filter(c => { const ownerAcc = cuentas.find(acc => acc.id === c.tarjetaId); const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared'; return belongsToFilter(accOwner !== 'Shared' ? accOwner : (c.ownerId || getOwnerFallback(c.descripcion))); }), [comprasCuotas, cuentas, filtroPersona]);
  const activeTransferencias = useMemo(() => transferencias.filter(t => { const ownerFrom = cuentas.find(c => c.id === t.fromId); const ownerTo = cuentas.find(c => c.id === t.toId); return belongsToFilter(ownerFrom ? (ownerFrom.ownerId || getOwnerFallback(ownerFrom.name)) : 'Shared') || belongsToFilter(ownerTo ? (ownerTo.ownerId || getOwnerFallback(ownerTo.name)) : 'Shared'); }), [transferencias, cuentas, filtroPersona]);

  const isThisMonth = (f) => f && f.startsWith(selectedMonth);
  const ingresosMesTotal = useMemo(() => activeIngresos.filter(i => isThisMonth(i.fecha)).reduce((s, i) => s + Number(i.monto), 0), [activeIngresos, selectedMonth]);
  const egresosMesTotal = useMemo(() => activeEgresos.filter(e => isThisMonth(e.fecha)).reduce((s, e) => s + Number(e.monto), 0), [activeEgresos, selectedMonth]);
  const egresosMes = activeEgresos.filter(e => e.fecha.startsWith(selectedMonth));
  const cuotasMesTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0).reduce((s, c) => s + Number(c.cuotaMinima), 0), [activeCalculatedAccounts]);
  const pagosDeCuotasEsteMes = egresosMes.filter(e => e.tipo === 'Fijo' && (e.categoria.toLowerCase().includes('tarjeta') || e.categoria.toLowerCase().includes('crédito') || e.categoria.toLowerCase().includes('vehículo') || e.categoria.toLowerCase().includes('davibank'))).reduce((sum, e) => sum + e.monto, 0);
  const cuotasMesRestantes = Math.max(0, cuotasMesTotal - pagosDeCuotasEsteMes);

  const flujoNetoMes = ingresosMesTotal - egresosMesTotal - cuotasMesRestantes;
  const liquidezTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['bank', 'cash', 'pocket'].includes(c.type)).reduce((s, c) => s + c.currentBalance, 0), [activeCalculatedAccounts]);
  const deudaTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type)).reduce((s, c) => s + c.currentDebt, 0), [activeCalculatedAccounts]);

  const scoreData = useMemo(() => {
    if (ingresosMesTotal === 0 && egresosMesTotal === 0 && cuotasMesTotal === 0 && liquidezTotal === 0) return { score: 0, desglose: [{ text: 'Aún no hay datos.', pts: 0, type: 'neutral' }], recs: [{ico: '📝', title: 'Empieza tu registro', txt: 'Añade datos para evaluar tu salud.'}] };
    let scr = 100; const desgloseArr = [{ text: 'Puntaje Base Ideal', pts: 100, type: 'success' }]; const rr = [];
    if (flujoNetoMes < 0) { scr -= 40; desgloseArr.push({ text: 'Flujo negativo', pts: -40, type: 'danger' }); rr.push({ico: '⚠️', title: 'Flujo Crítico', txt: 'Gastas más de lo que ganas.'}); }
    if (cuotasMesTotal > ingresosMesTotal * 0.4 && ingresosMesTotal > 0) { scr -= 25; desgloseArr.push({ text: 'Deudas > 40%', pts: -25, type: 'danger' }); }
    if (scr === 100) desgloseArr.push({ text: '¡Sin penalizaciones!', pts: 0, type: 'success' });
    return { score: Math.max(0, scr), desglose: desgloseArr, recs: rr };
  }, [flujoNetoMes, cuotasMesTotal, ingresosMesTotal, liquidezTotal]);

  useEffect(() => { const cM = new Date().toISOString().slice(0, 7); if (selectedMonth === cM && !appCargando) { setScoreHistory(prev => { if (prev[selectedMonth] !== scoreData.score) { const next = { ...prev, [selectedMonth]: scoreData.score }; db.collection('sistema').doc('scoreHistory').set(next, {merge: true}); return next; } return prev; }); } }, [scoreData.score, selectedMonth, appCargando]);


  // ✨ FUNCIONES DEL WIZARD PASO A PASO
  const handleOpenWizard = () => {
    setQeStep(1); setQeType(''); setQeMonto(''); setQeDescripcion(''); setQeCategoria(''); setQeMethod(''); setQeCuenta('');
    setQuickEntryOpen(true);
  };

  const handleQuickSave = () => {
    if (!qeMonto || !qeCategoria || !qeCuenta) return;
    
    const today = getLocalToday();
    const montoNum = Number(qeMonto);
    const descFinal = qeDescripcion.trim() !== '' ? qeDescripcion : (qeType === 'egreso' ? `Gasto rápido (${qeCategoria})` : `Ingreso rápido (${qeCategoria})`);

    if (qeType === 'egreso') {
      addEgreso({
        id: generateId(),
        fecha: today,
        descripcion: descFinal,
        categoria: qeCategoria,
        monto: montoNum,
        interesesOtros: 0,
        cuentaId: qeCuenta,
        tipo: 'Variable',
        deudaId: null
      });
      showToast("Gasto registrado al instante.");
    } else {
      addIngreso({
        id: generateId(),
        fecha: today,
        descripcion: descFinal,
        categoria: qeCategoria,
        monto: montoNum,
        cuentaId: qeCuenta,
        persona: 'Total',
        tipo: 'Variable'
      });
      showToast("Ingreso registrado al instante.");
    }
    
    setQuickEntryOpen(false);
  };

  if (authChecking) return <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f11]"><div className="w-10 h-10 border-4 border-[#333] border-t-indigo-500 rounded-full animate-spin mb-4"></div><p className="text-slate-400 font-medium">Validando seguridad...</p></div>;
  if (!authUser) return <Login />;
  if (appCargando) return <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f11]"><div className="w-10 h-10 border-4 border-[#333] border-t-indigo-500 rounded-full animate-spin mb-4"></div><p className="text-slate-400 font-medium">Descargando datos de la nube...</p></div>;

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'ingresos', label: 'Ingresos', icon: Wallet },
    { id: 'egresos', label: 'Egresos', icon: Receipt }, 
    { id: 'cuentas', label: 'Cuentas', icon: Landmark },
    { id: 'deudas', label: 'Deudas', icon: ShieldAlert },
    { id: 'inversiones', label: 'Inversión y ahorro', icon: PiggyBank }, 
    { id: 'analitica', label: 'Analítica', icon: BarChart }, 
    { id: 'score', label: 'Score Familia', icon: Activity },
    { id: 'presupuestos', label: 'Presupuestos', icon: PieChart },
    { id: 'simulador', label: 'Simuladores', icon: Calculator },
    { id: 'settings', label: 'Ajustes', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f11] text-slate-200 flex flex-col md:flex-row font-sans md:pt-0 pt-[24px] relative">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <aside className="hidden md:flex w-64 bg-[#17171a] border-r border-slate-800 flex-shrink-0 flex-col z-20">
        <div className="p-6 border-b border-slate-800"><h1 className="text-xl font-bold text-white flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">F</div>FinanzasFamilia</h1></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2">Diario</div>
          {navItems.slice(0, 6).map(i => <button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === i.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}><i.icon size={18}/> {i.label}</button>)}
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mt-6 mb-2">Estrategia</div>
          {navItems.slice(6, 10).map(i => <button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === i.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}><i.icon size={18}/> {i.label}</button>)}
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mt-6 mb-2">Sistema</div>
          {navItems.slice(10).map(i => <button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === i.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}><i.icon size={18}/> {i.label}</button>)}
          <button onClick={() => auth.signOut()} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all mt-4 border border-rose-500/20">Cerrar Sesión</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-[72px] md:pb-0 relative">
        <div className="bg-[#17171a] border-b border-slate-800 p-3 md:p-4 flex justify-between items-center gap-4">
          <button onClick={() => auth.signOut()} className="md:hidden text-rose-500/80 hover:text-rose-400 p-2"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></button>
          {['ingresos', 'cuentas', 'deudas'].includes(activeTab) && <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 text-xs font-bold w-full md:w-auto"><button onClick={() => setFiltroPersona('Total')} className={`flex-1 md:px-6 py-2 rounded-md ${filtroPersona === 'Total' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>TOTAL</button><button onClick={() => setFiltroPersona('Andre')} className={`flex-1 md:px-6 py-2 rounded-md ${filtroPersona === 'Andre' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}>ANDRE</button><button onClick={() => setFiltroPersona('Leo')} className={`flex-1 md:px-6 py-2 rounded-md ${filtroPersona === 'Leo' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>LEO</button></div>}
          <div className="flex-1 flex justify-end md:justify-end w-full md:w-auto"><div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700 w-full md:max-w-[240px] justify-between"><button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-indigo-400"><ChevronLeft size={18}/></button><span className="font-bold text-white capitalize text-sm">{getMonthName(selectedMonth)}</span><button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-indigo-400"><ChevronRight size={18}/></button></div></div>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto flex-1 relative">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary>
              {activeTab === 'dashboard' && <DashboardTab flujoNetoMes={flujoNetoMes} cuotasMesTotal={cuotasMesTotal} cuotasMesRestantes={cuotasMesRestantes} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} deudaTotal={deudaTotal} liquidezTotal={liquidezTotal} selectedMonth={selectedMonth} egresosMes={egresosMes} ingresos={activeIngresos} egresos={activeEgresos} presupuestos={activePresupuestos} pagosFijos={activePagosFijos} ingresosFijos={activeIngresosFijos} cuentas={activeCalculatedAccounts} />}
              {activeTab === 'analitica' && <AnaliticaTab ingresos={ingresos} egresos={egresos} selectedMonth={selectedMonth} />}
              {activeTab === 'score' && <ScoreTab scoreData={scoreData} scoreHistory={scoreHistory} selectedMonth={selectedMonth} presupuestos={activePresupuestos} egresosMes={egresosMes} cuentas={activeCalculatedAccounts} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} cuotasMesTotal={cuotasMesTotal} pagosFijos={activePagosFijos} />}
              {activeTab === 'cuentas' && <CuentasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} transferencias={activeTransferencias} addTransferencia={addTransferencia} addEgreso={addEgreso} showToast={showToast} />}
              {activeTab === 'ingresos' && <IngresosTab ingresos={activeIngresos} addIngreso={addIngreso} updateIngreso={updateIngreso} removeIngreso={removeIngreso} ingresosFijos={activeIngresosFijos} addIngresoFijo={addIngresoFijo} updateIngresoFijo={updateIngresoFijo} removeIngresoFijo={removeIngresoFijo} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} showToast={showToast} filtroPersona={filtroPersona} />}
              {activeTab === 'egresos' && <EgresosTab egresos={activeEgresos} addEgreso={addEgreso} updateEgreso={updateEgreso} removeEgreso={removeEgreso} pagosFijos={activePagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} comprasCuotas={activeComprasCuotas} addComprasCuotas={addComprasCuotas} removeComprasCuotas={removeComprasCuotas} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} presupuestos={activePresupuestos} categoriasMaestras={categoriasMaestras} showToast={showToast} />}
              {activeTab === 'presupuestos' && <PresupuestosTab presupuestos={activePresupuestos} addPresupuesto={addPresupuesto} updatePresupuesto={updatePresupuesto} removePresupuesto={removePresupuesto} pagosFijos={activePagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} egresos={activeEgresos} selectedMonth={selectedMonth} showToast={showToast} categoriasMaestras={categoriasMaestras} />}
              {activeTab === 'deudas' && <DeudasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} showToast={showToast} egresos={activeEgresos} />}
              {activeTab === 'inversiones' && <InversionesTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} ingresos={ingresos} addIngreso={addIngreso} egresos={egresos} transferencias={transferencias} selectedMonth={selectedMonth} showToast={showToast} getOwner={getOwnerFallback} />}
              {activeTab === 'simulador' && <SimuladorTab cuentas={activeCalculatedAccounts} addPagoFijo={addPagoFijoToState} showToast={showToast} />}
              {activeTab === 'settings' && <SettingsTab stateData={{cuentas, transferencias, ingresos, egresos, presupuestos, pagosFijos, comprasCuotas, ingresosFijos}} importAllState={importAllState} selectedMonth={selectedMonth} showToast={showToast} />}
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#17171a] border-t border-slate-800 z-30 flex overflow-x-auto h-[72px]">
        <div className="flex px-1 min-w-max w-full">
          {navItems.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-[76px] flex flex-col items-center justify-center p-2 transition-colors ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`}><item.icon size={24} className={activeTab === item.id ? 'mb-1 text-indigo-400' : 'mb-1 opacity-70'}/><span className={`text-[10px] font-medium truncate w-full text-center ${activeTab === item.id ? 'font-bold' : ''}`}>{item.label}</span></button>)}
        </div>
      </nav>

      {/* ✨ BOTÓN FLOTANTE (FAB) PARA REGISTRO RÁPIDO */}
      <button 
        onClick={handleOpenWizard}
        className="fixed bottom-[90px] md:bottom-8 right-4 md:right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center z-40 transition-transform hover:scale-105 border-4 border-[#0f0f11]"
      >
        <Plus size={28} />
      </button>

      {/* ✨ MODAL TIPO WIZARD (Paso a Paso) */}
      {quickEntryOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#17171a] w-full md:w-[400px] md:rounded-3xl rounded-t-3xl p-6 border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-10 min-h-[400px] flex flex-col relative">
            
            {/* Header del Wizard */}
            <div className="flex justify-between items-center mb-6 shrink-0">
               <div className="flex items-center gap-3">
                 {qeStep > 1 && (
                   <button onClick={() => setQeStep(qeStep - 1)} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full transition-colors">
                     <ArrowLeftIcon size={18}/>
                   </button>
                 )}
                 <div>
                   <h3 className="text-lg font-black text-white tracking-tight">Registro Rápido</h3>
                   <div className="flex gap-1 mt-1.5">
                      {[1,2,3,4,5].map(s => (
                        <div key={s} className={`h-1 w-[18px] rounded-full transition-all duration-500 ${s <= qeStep ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
                      ))}
                   </div>
                 </div>
               </div>
               <button onClick={() => setQuickEntryOpen(false)} className="text-slate-500 hover:text-rose-400 bg-slate-900 p-2 rounded-full transition-colors">
                 <XIcon size={18}/>
               </button>
            </div>

            {/* Cuerpos de cada paso */}
            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* PASO 1: TIPO DE MOVIMIENTO */}
              {qeStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-center text-slate-400 font-bold mb-6">¿Qué vas a registrar?</h4>
                  <button onClick={() => { setQeType('egreso'); setQeStep(2); }} className="w-full flex items-center justify-center gap-3 p-6 bg-rose-500/10 border-2 border-rose-500/30 hover:border-rose-500 rounded-2xl text-rose-400 font-black text-xl transition-all hover:scale-[1.02] shadow-lg shadow-rose-500/5">
                    📉 Es un Gasto
                  </button>
                  <button onClick={() => { setQeType('ingreso'); setQeStep(2); }} className="w-full flex items-center justify-center gap-3 p-6 bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-2xl text-emerald-400 font-black text-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/5">
                    📈 Es un Ingreso
                  </button>
                </div>
              )}

              {/* PASO 2: MONTO Y DESCRIPCIÓN */}
              {qeStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${qeType === 'egreso' ? 'text-rose-500' : 'text-emerald-500'}`}>Monto exacto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">$</span>
                      <input type="number" value={qeMonto} onChange={(e)=>setQeMonto(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-800 focus:border-indigo-500 text-white rounded-2xl pl-10 pr-4 py-4 text-3xl font-black outline-none transition-colors shadow-inner" placeholder="0" autoFocus />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Descripción corta (Opcional)</label>
                    <input type="text" value={qeDescripcion} onChange={(e)=>setQeDescripcion(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors" placeholder="Ej. Almuerzo KFC" />
                  </div>
                  <button disabled={!qeMonto} onClick={() => setQeStep(3)} className="w-full py-4 rounded-xl font-black text-white text-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 transition-all shadow-lg mt-2">
                    Siguiente
                  </button>
                </div>
              )}

              {/* PASO 3: CATEGORÍA */}
              {qeStep === 3 && (
                <div className="h-full flex flex-col">
                  <h4 className="text-center text-slate-400 font-bold mb-4">Selecciona la categoría</h4>
                  <div className="flex-1 overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="grid grid-cols-2 gap-2">
                      {(qeType === 'egreso' ? categoriasMaestras : ['Salario', 'Honorarios', 'Transferencia', 'Inversión', 'Regalo', 'Otros']).map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => { setQeCategoria(cat); setQeStep(4); }}
                          className={`p-3 rounded-xl text-xs font-bold text-left transition-all border bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 active:scale-95`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4: MÉTODO DE PAGO (Nuevo Paso) */}
              {qeStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-center text-slate-400 font-bold mb-6">{qeType === 'egreso' ? '¿Cómo lo pagaste?' : '¿A dónde entró el dinero?'}</h4>
                  
                  <button onClick={() => { setQeMethod('cash'); setQeStep(5); }} className="w-full p-4 rounded-xl text-sm font-bold text-left transition-all border flex items-center gap-3 bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 active:scale-95">
                    <span className="text-xl">💵</span> Efectivo
                  </button>
                  
                  <button onClick={() => { setQeMethod('bank'); setQeStep(5); }} className="w-full p-4 rounded-xl text-sm font-bold text-left transition-all border flex items-center gap-3 bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 active:scale-95">
                    <span className="text-xl">🏦</span> Cuenta Débito / Ahorros
                  </button>

                  {/* Ocultamos Tarjeta de Crédito si es un Ingreso */}
                  {qeType === 'egreso' && (
                    <button onClick={() => { setQeMethod('credit'); setQeStep(5); }} className="w-full p-4 rounded-xl text-sm font-bold text-left transition-all border flex items-center gap-3 bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 active:scale-95">
                      <span className="text-xl">💳</span> Tarjeta de Crédito
                    </button>
                  )}
                </div>
              )}

              {/* PASO 5: CUENTA EXACTA Y GUARDAR */}
              {qeStep === 5 && (
                <div className="space-y-6">
                  <h4 className="text-center text-slate-400 font-bold mb-2">{qeType === 'egreso' ? '¿De cuál cuenta exactamente?' : '¿A qué cuenta exactamente?'}</h4>
                  
                  <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[250px] pr-1">
                    {/* Renderizamos SÓLO las cuentas que coinciden con el método elegido en el paso 4 */}
                    {activeCalculatedAccounts.filter(c => c.type === qeMethod).map(acc => (
                      <button 
                        key={acc.id} 
                        onClick={() => setQeCuenta(acc.id)}
                        className={`p-4 rounded-xl text-sm font-bold text-left transition-all border flex justify-between items-center ${qeCuenta === acc.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        <span className="flex items-center gap-2">
                          {acc.name}
                        </span>
                        {qeCuenta === acc.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                    ))}

                    {/* Mensaje por si no hay cuentas de ese tipo registradas */}
                    {activeCalculatedAccounts.filter(c => c.type === qeMethod).length === 0 && (
                      <div className="text-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-2">
                        <p className="text-rose-400 text-xs font-bold">No tienes cuentas de este tipo registradas.</p>
                      </div>
                    )}
                  </div>
                  
                  {qeCuenta && (
                    <button 
                      onClick={handleQuickSave} 
                      className={`w-full py-4 rounded-xl font-black text-white text-lg transition-transform hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 shadow-xl ${qeType === 'egreso' ? 'bg-rose-600 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}
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
