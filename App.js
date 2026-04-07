// --- MAIN APP ---
    function App() {
      // ── Estado UI ──────────────────────────────────────────────────────────────
      const [appCargando, setAppCargando]   = useState(true);
      const [isOffline,   setIsOffline]     = useState(!navigator.onLine);
      const [activeTab,   setActiveTab]     = useState('dashboard');
      const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
      const [toast,       setToast]         = useState(null);
      const [filtroPersona, setFiltroPersona] = useState('Total');
      const [scoreHistory,  setScoreHistory]  = useState({});

      // ── Detector de conexión ───────────────────────────────────────────────────
      useEffect(() => {
        const on  = () => setIsOffline(false);
        const off = () => setIsOffline(true);
        window.addEventListener('online',  on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
      }, []);

      // ── Helpers UI ─────────────────────────────────────────────────────────────
      const showToast   = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
      const changeMonth = (offset) => { const [y, m] = selectedMonth.split('-'); const d = new Date(y, parseInt(m) - 1 + offset, 1); setSelectedMonth(d.toISOString().slice(0, 7)); };
      const getMonthName = (ym) => { const [y, m] = ym.split('-'); return new Date(y, parseInt(m) - 1, 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }); };

      // ============================================================================
      // 🔥 ESTADO LOCAL
      // ============================================================================
      const [cuentas,       setCuentas]       = useState([]);
      const [transferencias,setTransferencias]= useState([]);
      const [ingresos,      setIngresos]      = useState([]);
      const [egresos,       setEgresos]       = useState([]);
      const [comprasCuotas, setComprasCuotas] = useState([]);
      const [presupuestos,  setPresupuestos]  = useState([]);
      const [pagosFijos,    setPagosFijos]    = useState([]);
      const [ingresosFijos, setIngresosFijos] = useState([]);

      const loadedRef = useRef(0);
      const TOTAL_COL = 9;
      const markLoaded = () => { loadedRef.current += 1; if (loadedRef.current >= TOTAL_COL) setAppCargando(false); };

      useEffect(() => {
        const col = (name, setter) =>
          db.collection(name).onSnapshot(snap => { setter(snap.docs.map(d => d.data())); markLoaded(); });

        const unsubs = [
          col('cuentas',        setCuentas),
          col('transferencias',  setTransferencias),
          col('ingresos',        setIngresos),
          col('egresos',         setEgresos),
          col('comprasCuotas',   setComprasCuotas),
          col('presupuestos',    setPresupuestos),
          col('pagosFijos',      setPagosFijos),
          col('ingresosFijos',   setIngresosFijos),
          db.collection('sistema').doc('scoreHistory').onSnapshot(snap => { if (snap.exists) setScoreHistory(snap.data()); markLoaded(); }),
        ];
        return () => unsubs.forEach(u => u());
      }, []);

      const col  = (name) => db.collection(name);
      const fire = {
        add:    (colName, data)   => col(colName).doc(data.id).set(data),
        update: (colName, id, data) => col(colName).doc(id).set(data, { merge: true }),
        remove: (colName, id)     => col(colName).doc(id).delete(),
        bulkReplace: async (colName, newArray) => {
          const existing = await col(colName).get();
          for (let i = 0; i < existing.docs.length; i += 450) {
            const batch = db.batch();
            existing.docs.slice(i, i + 450).forEach(d => batch.delete(d.ref));
            await batch.commit();
          }
          for (let i = 0; i < newArray.length; i += 450) {
            const batch = db.batch();
            newArray.slice(i, i + 450).forEach(item => batch.set(col(colName).doc(item.id), item));
            await batch.commit();
          }
        },
      };

      const addCuenta    = (data)     => fire.add('cuentas', data);
      const updateCuenta = (id, data) => fire.update('cuentas', id, data);
      const removeCuenta = (id)       => fire.remove('cuentas', id);
      const addTransferencia    = (data) => fire.add('transferencias', data);
      const removeTransferencia = (id)   => fire.remove('transferencias', id);
      const addIngreso    = (data)     => fire.add('ingresos', data);
      const updateIngreso = (id, data) => fire.update('ingresos', id, data);
      const removeIngreso = (id)       => fire.remove('ingresos', id);
      const addEgreso    = (data)     => fire.add('egresos', data);
      const updateEgreso = (id, data) => fire.update('egresos', id, data);
      const removeEgreso = (id)       => fire.remove('egresos', id);
      const addComprasCuotas    = (data) => fire.add('comprasCuotas', data);
      const removeComprasCuotas = (id)   => fire.remove('comprasCuotas', id);
      const addPresupuesto    = (data)     => fire.add('presupuestos', data);
      const updatePresupuesto = (id, data) => fire.update('presupuestos', id, data);
      const removePresupuesto = (id)       => fire.remove('presupuestos', id);
      const addPagoFijo    = (data)     => fire.add('pagosFijos', data);
      const updatePagoFijo = (id, data) => fire.update('pagosFijos', id, data);
      const removePagoFijo = (id)       => fire.remove('pagosFijos', id);
      const addIngresoFijo    = (data)     => fire.add('ingresosFijos', data);
      const updateIngresoFijo = (id, data) => fire.update('ingresosFijos', id, data);
      const removeIngresoFijo = (id)       => fire.remove('ingresosFijos', id);

      const importAllState = async (parsed) => {
        const collections = [
          ['cuentas',       parsed.cuentas],
          ['transferencias',parsed.transferencias],
          ['ingresos',      parsed.ingresos],
          ['egresos',       parsed.egresos],
          ['presupuestos',  parsed.presupuestos],
          ['pagosFijos',    parsed.pagosFijos],
          ['comprasCuotas', parsed.comprasCuotas],
          ['ingresosFijos', parsed.ingresosFijos],
        ];
        for (const [colName, arr] of collections) {
          if (arr && arr.length) await fire.bulkReplace(colName, arr);
        }
      };

      const addPagoFijoToState = (pf) => addPagoFijo({ ...pf, id: generateId(), diaPago: pf.diaPago || 1, categoria: pf.categoria || 'Otros' });

      // ✨ NUEVAS CATEGORÍAS AÑADIDAS AQUÍ
      const categoriasMaestras = useMemo(() => {
        const cats = new Set(['Inversión', 'Gasolina', 'Mercado', 'Mercado Aseo', 'Aseo hogar', 'Botellón Agua', 'Panadería', 'Alimentación', 'Ocio']);
        presupuestos.forEach(p => cats.add(String(p.categoria)));
        pagosFijos.forEach(pf => { if (pf.categoria && pf.categoria !== 'Otros') cats.add(String(pf.categoria)); });
        egresos.forEach(e => { if (e.categoria && e.categoria !== 'Otros') cats.add(String(e.categoria)); });
        return Array.from(cats).sort();
      }, [presupuestos, pagosFijos, egresos]);

      const calculatedAccounts = useMemo(() => {
        const accMap = {};
        cuentas.forEach(c => {
          accMap[c.id] = { ...c, currentBalance: Number(c.initialBalance) || 0, currentDebt: Number(c.initialDebt) || 0, montoPrestado: Number(c.montoPrestado) || Number(c.initialDebt) || 0, totalPagado: Number(c.totalPagadoPrevio) || 0, lastPaymentDate: c.lastPaymentDate || null };
        });

        ingresos.forEach(i => { if (accMap[i.cuentaId]) accMap[i.cuentaId].currentBalance += Number(i.monto); });

        const sortedEgresos = [...egresos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        sortedEgresos.forEach(e => {
          if (accMap[e.cuentaId]) {
            if (['credit', 'loan'].includes(accMap[e.cuentaId].type)) accMap[e.cuentaId].currentDebt += Number(e.monto);
            else accMap[e.cuentaId].currentBalance -= Number(e.monto);
          }
          if (e.deudaId && accMap[e.deudaId]) {
            const account = accMap[e.deudaId];
            account.totalPagado += Number(e.monto);
            if (account.type === 'loan') {
              let capital = Number(e.monto);
              if (account.lastPaymentDate) {
                const diffDays = Math.round(Math.abs(new Date(e.fecha) - new Date(account.lastPaymentDate)) / 86400000);
                const tasaDiaria = Math.pow(1 + account.tasaEA / 100, 1 / 360) - 1;
                capital = Number(e.monto) - account.currentDebt * tasaDiaria * diffDays;
              } else {
                capital = Number(e.monto) - account.currentDebt * getTasaMensual(account.tasaEA);
              }
              account.lastPaymentDate = e.fecha;
              account.currentDebt = Math.max(0, account.currentDebt - capital);
            } else {
              account.currentDebt = Math.max(0, account.currentDebt - Number(e.monto));
            }
          }
        });

        transferencias.forEach(t => {
          if (accMap[t.fromId]) {
            if (['credit', 'loan'].includes(accMap[t.fromId].type)) accMap[t.fromId].currentDebt += Number(t.monto);
            else accMap[t.fromId].currentBalance -= Number(t.monto);
          }
          if (accMap[t.toId]) {
            if (['credit', 'loan'].includes(accMap[t.toId].type)) accMap[t.toId].currentDebt = Math.max(0, accMap[t.toId].currentDebt - Number(t.monto));
            else accMap[t.toId].currentBalance += Number(t.monto);
          }
        });
        return Object.values(accMap);
      }, [cuentas, ingresos, egresos, transferencias]);

      const getOwnerFallback = (text) => {
         if (!text) return 'Shared';
         const t = text.toUpperCase();
         const hasL = t.includes('LEO') || t.endsWith(' L') || t.includes(' L ');
         const hasA = t.includes('ANDRE') || t.includes('ANDRÉ') || t.endsWith(' A') || t.includes(' A ');
         if (hasL && !hasA) return 'Leo';
         if (hasA && !hasL) return 'Andre';
         return 'Shared';
      };

      const belongsToFilter = (itemOwner) => filtroPersona === 'Total' || itemOwner === 'Shared' || itemOwner === filtroPersona;
      const activeCalculatedAccounts = useMemo(() => calculatedAccounts.filter(c => belongsToFilter(c.ownerId || getOwnerFallback(c.name))), [calculatedAccounts, filtroPersona]);
      const activeIngresos = useMemo(() => ingresos.filter(i => {
         const ownerAcc = cuentas.find(c => c.id === i.cuentaId);
         const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared';
         const itemOwner = i.ownerId || getOwnerFallback(i.persona + ' ' + i.descripcion);
         return belongsToFilter(accOwner !== 'Shared' ? accOwner : itemOwner);
      }), [ingresos, cuentas, filtroPersona]);

      const activeEgresos = useMemo(() => egresos.filter(e => {
         const ownerAcc = cuentas.find(c => c.id === e.cuentaId);
         const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared';
         const itemOwner = e.ownerId || getOwnerFallback(e.descripcion + ' ' + e.categoria);
         return belongsToFilter(accOwner !== 'Shared' ? accOwner : itemOwner);
      }), [egresos, cuentas, filtroPersona]);

      const activePagosFijos = useMemo(() => pagosFijos.filter(pf => belongsToFilter(pf.ownerId || getOwnerFallback(pf.descripcion + ' ' + pf.categoria))), [pagosFijos, filtroPersona]);
      const activeIngresosFijos = useMemo(() => {
        const currentMonthNum = selectedMonth.split('-')[1];
        return ingresosFijos.filter(inf => {
           const passFilter = belongsToFilter(inf.ownerId || getOwnerFallback(inf.descripcion + ' ' + inf.persona));
           const descLower = inf.descripcion.toLowerCase();
           const isPrima1 = descLower.includes('prima 1');
           const isPrima2 = descLower.includes('prima 2');
           let passMonth = true;
           if (isPrima1) passMonth = currentMonthNum === '07';
           else if (isPrima2) passMonth = currentMonthNum === '12';
           else if (descLower.includes('prima')) passMonth = currentMonthNum === '07' || currentMonthNum === '12';
           return passFilter && passMonth;
        });
      }, [ingresosFijos, filtroPersona, selectedMonth]);
      const activePresupuestos = useMemo(() => presupuestos.filter(p => belongsToFilter(p.ownerId || getOwnerFallback(p.categoria))), [presupuestos, filtroPersona]);
      const activeComprasCuotas = useMemo(() => comprasCuotas.filter(c => {
         const ownerAcc = cuentas.find(acc => acc.id === c.tarjetaId);
         const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared';
         const itemOwner = c.ownerId || getOwnerFallback(c.descripcion);
         return belongsToFilter(accOwner !== 'Shared' ? accOwner : itemOwner);
      }), [comprasCuotas, cuentas, filtroPersona]);
      const activeTransferencias = useMemo(() => transferencias.filter(t => {
         const ownerFromAcc = cuentas.find(c => c.id === t.fromId);
         const ownerToAcc = cuentas.find(c => c.id === t.toId);
         const ownerFrom = ownerFromAcc ? (ownerFromAcc.ownerId || getOwnerFallback(ownerFromAcc.name)) : 'Shared';
         const ownerTo = ownerToAcc ? (ownerToAcc.ownerId || getOwnerFallback(ownerToAcc.name)) : 'Shared';
         return belongsToFilter(ownerFrom) || belongsToFilter(ownerTo);
      }), [transferencias, cuentas, filtroPersona]);

      const isThisMonth = (fecha) => fecha && fecha.startsWith(selectedMonth);
      const ingresosMesTotal = useMemo(() => activeIngresos.filter(i => isThisMonth(i.fecha)).reduce((s, i) => s + Number(i.monto), 0), [activeIngresos, selectedMonth]);
      const egresosMesTotal = useMemo(() => activeEgresos.filter(e => isThisMonth(e.fecha)).reduce((s, e) => s + Number(e.monto), 0), [activeEgresos, selectedMonth]);
      const egresosMes = activeEgresos.filter(e=>e.fecha.startsWith(selectedMonth));
      const cuotasMesTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0).reduce((s, c) => s + Number(c.cuotaMinima), 0), [activeCalculatedAccounts]);
      const pagosDeCuotasEsteMes = egresosMes.filter(e => e.tipo === 'Fijo' && (e.categoria.toLowerCase().includes('tarjeta') || e.categoria.toLowerCase().includes('crédito') || e.categoria.toLowerCase().includes('vehículo') || e.categoria.toLowerCase().includes('davibank'))).reduce((sum, e) => sum + e.monto, 0);
      const cuotasMesRestantes = Math.max(0, cuotasMesTotal - pagosDeCuotasEsteMes);

      const flujoNetoMes = ingresosMesTotal - egresosMesTotal - cuotasMesRestantes;
      const liquidezTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['bank', 'cash', 'pocket'].includes(c.type)).reduce((s, c) => s + c.currentBalance, 0), [activeCalculatedAccounts]);
      const deudaTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type)).reduce((s, c) => s + c.currentDebt, 0), [activeCalculatedAccounts]);
      
      const tasaEndeudamiento = ingresosMesTotal > 0 ? (cuotasMesTotal / ingresosMesTotal) * 100 : 0;
      const tasaAhorro = ingresosMesTotal > 0 ? (flujoNetoMes > 0 ? (flujoNetoMes / ingresosMesTotal) * 100 : 0) : 0;

      const scoreData = useMemo(() => {
        if (ingresosMesTotal === 0 && egresosMesTotal === 0 && cuotasMesTotal === 0 && liquidezTotal === 0) {
          return { score: 0, desglose: [{ text: 'Aún no hay datos registrados este mes.', pts: 0, type: 'neutral' }], recs: [{ico: '📝', title: 'Empieza tu registro', txt: 'Añade ingresos y gastos para que el sistema evalúe tu salud financiera.'}] };
        }
        let scr = 100;
        const desgloseArr = [{ text: 'Puntaje Base Ideal', pts: 100, type: 'success' }];
        const rr = [];
        if (flujoNetoMes < 0) { scr -= 40; desgloseArr.push({ text: 'Flujo de caja mensual negativo', pts: -40, type: 'danger' }); rr.push({ico: '⚠️', title: 'Flujo Crítico', txt: 'Tus compromisos superan tus ingresos.'}); }
        if (cuotasMesTotal > ingresosMesTotal * 0.4 && ingresosMesTotal > 0) { scr -= 25; desgloseArr.push({ text: 'Deudas superan el 40% del ingreso', pts: -25, type: 'danger' }); rr.push({ico: '🛡️', title: 'Riesgo de Sobreendeudamiento', txt: 'Usa la estrategia Avalancha en la pestaña Deudas para liberar liquidez.'}); }
        const tieneAhorroProgramado = activePagosFijos.some(pf => pf.categoria === 'Inversión' || pf.descripcion.toLowerCase().includes('ahorro'));
        if (!tieneAhorroProgramado && ingresosMesTotal > 0) { scr -= 10; desgloseArr.push({ text: 'No hay ahorros/inversión programados', pts: -10, type: 'warning' }); rr.push({ico: '🎯', title: 'Falta de Dirección', txt: 'Usa el Simulador para definir un Plan de Ahorro y asúmelo como pago fijo.'}); }
        if (tasaAhorro < 10 && ingresosMesTotal > 0 && tieneAhorroProgramado) { scr -= 15; desgloseArr.push({ text: 'Tasa de ahorro mensual muy baja (< 10%)', pts: -15, type: 'warning' }); }
        if (scr === 100) { desgloseArr.push({ text: '¡Sin penalizaciones!', pts: 0, type: 'success' }); }
        return { score: Math.max(0, scr), desglose: desgloseArr, recs: rr };
      }, [flujoNetoMes, cuotasMesTotal, ingresosMesTotal, tasaAhorro, activePagosFijos, liquidezTotal]);

      useEffect(() => {
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        if (selectedMonth === currentMonthStr && !appCargando) {
          setScoreHistory(prev => {
            if (prev[selectedMonth] !== scoreData.score) {
              const next = { ...prev, [selectedMonth]: scoreData.score };
              db.collection('sistema').doc('scoreHistory').set(next, {merge: true});
              return next;
            }
            return prev;
          });
        }
      }, [scoreData.score, selectedMonth, appCargando]);

      if (appCargando) {
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f11]">
             <div className="w-10 h-10 border-4 border-[#333] border-t-indigo-500 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-medium">Sincronizando con la nube...</p>
          </div>
        );
      }

      const navItems = [
        { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
        { id: 'ingresos', label: 'Ingresos', icon: Wallet },
        { id: 'egresos', label: 'Egresos', icon: Receipt }, 
        { id: 'inversiones', label: 'Inversión y ahorro', icon: PiggyBank }, 
        { id: 'score', label: 'Score Familia', icon: Activity },
        { id: 'cuentas', label: 'Cuentas', icon: Landmark },
        { id: 'presupuestos', label: 'Presupuestos', icon: PieChart },
        { id: 'deudas', label: 'Deudas', icon: ShieldAlert },
        { id: 'simulador', label: 'Simuladores', icon: Calculator },
        { id: 'settings', label: 'Ajustes', icon: Settings2 },
      ];

      return (
        <div className="min-h-screen bg-[#0f0f11] text-slate-200 flex flex-col md:flex-row font-sans pt-[24px]">
          {isOffline && (
            <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white text-[11px] font-bold text-center py-1 z-[100] flex justify-center items-center gap-2 shadow-md">
              <AlertCircle size={14} /> Sin conexión. Trabajando offline.
            </div>
          )}
          
          <Toast toast={toast} onClose={() => setToast(null)} />
          
          <aside className="hidden md:flex w-64 bg-[#17171a] border-r border-slate-800 flex-shrink-0 flex-col relative z-20">
            <div className="p-6 border-b border-slate-800">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-serif">F</div>
                FinanzasFamilia
              </h1>
            </div>
            <div className="px-4 pt-4 pb-2 border-b border-slate-800/50 bg-slate-900/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Resumen del Mes</p>
              <p className={`text-xl font-black ${flujoNetoMes >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>{formatCOP(flujoNetoMes)}</p>
              <p className="text-[10px] text-slate-400">Flujo Libre {getMonthName(selectedMonth).split(' ')[0]}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400 font-medium">Score Salud</span>
                <span className="font-bold text-emerald-400">{scoreData.score}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className={`h-full rounded-full transition-all duration-1000 ${scoreData.score >= 80 ? 'bg-emerald-500' : scoreData.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${scoreData.score}%`}}></div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-4">Diario</div>
              {navItems.slice(0, 4).map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}>
                    <Icon size={18} className={activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'} /> {item.label}
                  </button>
                );
              })}
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-4">Futuro y Proyección</div>
              {navItems.slice(4, 9).map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}>
                    <Icon size={18} className={activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'} /> {item.label}
                  </button>
                );
              })}
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-4">Sistema</div>
              {navItems.slice(9).map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}>
                    <Icon size={18} className={activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'} /> {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 pb-[72px] md:pb-0">
            <div className="bg-[#17171a] border-b border-slate-800 p-3 md:p-4 flex flex-col md:flex-row justify-between items-center shadow-md gap-4">
              <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
                 {['ingresos', 'cuentas', 'deudas'].includes(activeTab) && (
                   <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 text-xs font-bold w-full md:w-auto shadow-inner">
                     <button onClick={() => setFiltroPersona('Total')} className={`flex-1 md:px-6 py-2 rounded-md transition-all duration-200 ${filtroPersona === 'Total' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>TOTAL</button>
                     <button onClick={() => setFiltroPersona('Andre')} className={`flex-1 md:px-6 py-2 rounded-md transition-all duration-200 ${filtroPersona === 'Andre' ? 'bg-rose-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>ANDRE</button>
                     <button onClick={() => setFiltroPersona('Leo')} className={`flex-1 md:px-6 py-2 rounded-md transition-all duration-200 ${filtroPersona === 'Leo' ? 'bg-emerald-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>LEO</button>
                   </div>
                 )}
               </div>

               <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
                 <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700 w-full md:max-w-[240px] justify-between shadow-inner">
                   <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"><ChevronLeft size={18}/></button>
                   <span className="font-bold text-white capitalize px-2 text-sm text-center truncate">{getMonthName(selectedMonth)}</span>
                   <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"><ChevronRight size={18}/></button>
                 </div>
               </div>
            </div>

            <div className="p-4 md:p-8 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="max-w-6xl mx-auto">
                <ErrorBoundary>
                  {activeTab === 'dashboard' && <DashboardTab flujoNetoMes={flujoNetoMes} cuotasMesTotal={cuotasMesTotal} cuotasMesRestantes={cuotasMesRestantes} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} deudaTotal={deudaTotal} liquidezTotal={liquidezTotal} selectedMonth={selectedMonth} egresosMes={egresosMes} ingresos={activeIngresos} egresos={activeEgresos} presupuestos={activePresupuestos} pagosFijos={activePagosFijos} ingresosFijos={activeIngresosFijos} cuentas={activeCalculatedAccounts} />}
                  {activeTab === 'score' && <ScoreTab scoreData={scoreData} scoreHistory={scoreHistory} selectedMonth={selectedMonth} presupuestos={activePresupuestos} egresosMes={egresosMes} cuentas={activeCalculatedAccounts} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} cuotasMesTotal={cuotasMesTotal} />}
                  {activeTab === 'cuentas' && <CuentasTab
                      cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta}
                      transferencias={activeTransferencias} addTransferencia={addTransferencia} removeTransferencia={removeTransferencia}
                      addEgreso={addEgreso} showToast={showToast} />}
                  {activeTab === 'ingresos' && <IngresosTab
                      ingresos={activeIngresos} addIngreso={addIngreso} updateIngreso={updateIngreso} removeIngreso={removeIngreso}
                      ingresosFijos={activeIngresosFijos} addIngresoFijo={addIngresoFijo} updateIngresoFijo={updateIngresoFijo} removeIngresoFijo={removeIngresoFijo}
                      cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} showToast={showToast} filtroPersona={filtroPersona} />}
                  
                  {/* ✨ EGRESOS AHORA RECIBE EL PARÁMETRO CATEGORÍASMAESTRAS ACTUALIZADO */}
                  {activeTab === 'egresos' && <EgresosTab
                      egresos={activeEgresos} addEgreso={addEgreso} updateEgreso={updateEgreso} removeEgreso={removeEgreso}
                      pagosFijos={activePagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo}
                      comprasCuotas={activeComprasCuotas} addComprasCuotas={addComprasCuotas} removeComprasCuotas={removeComprasCuotas}
                      cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} presupuestos={activePresupuestos}
                      categoriasMaestras={categoriasMaestras} showToast={showToast} />}
                  
                  {activeTab === 'presupuestos' && <PresupuestosTab
                      presupuestos={activePresupuestos} addPresupuesto={addPresupuesto} updatePresupuesto={updatePresupuesto} removePresupuesto={removePresupuesto}
                      pagosFijos={activePagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo}
                      egresos={activeEgresos} selectedMonth={selectedMonth} showToast={showToast} categoriasMaestras={categoriasMaestras} />}
                  
                  {/* ✨ DEUDAS AHORA RECIBE EGRESOS PARA EL CÁLCULO DE INTERESES */}
                  {activeTab === 'deudas' && <DeudasTab
                      cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta}
                      showToast={showToast} egresos={activeEgresos} />}
                  
                  {activeTab === 'inversiones' && <InversionesTab
                      cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta}
                      ingresos={ingresos} addIngreso={addIngreso}
                      egresos={egresos} transferencias={transferencias}
                      selectedMonth={selectedMonth} showToast={showToast} getOwner={getOwnerFallback} />}
                  {activeTab === 'simulador' && <SimuladorTab cuentas={activeCalculatedAccounts} addPagoFijo={addPagoFijoToState} showToast={showToast} />}
                  {activeTab === 'settings' && <SettingsTab
                      stateData={{cuentas, transferencias, ingresos, egresos, presupuestos, pagosFijos, comprasCuotas, ingresosFijos}}
                      importAllState={importAllState} selectedMonth={selectedMonth} showToast={showToast} />}
                </ErrorBoundary>
              </div>
            </div>
          </main>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#17171a] border-t border-slate-800 z-50 flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-[72px]">
            <div className="flex px-1 min-w-max w-full">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-[76px] flex flex-col items-center justify-center p-2 transition-colors flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Icon size={24} className={isActive ? 'mb-1 text-indigo-400' : 'mb-1 opacity-70 text-slate-500'} />
                    <span className={`text-[10px] font-medium truncate w-full text-center ${isActive ? 'font-bold text-indigo-400' : 'text-slate-500'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
