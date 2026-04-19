const AnaliticaTab = ({ ingresos, egresos, selectedMonth, cuentas, scoreData, scoreHistory }) => {
  const { useMemo } = React;

  // --- ÍCONOS FALTANTES AÑADIDOS NATIVAMENTE ---
  const Zap = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );

  const TrendingDown = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
      <polyline points="16 17 22 17 22 11"></polyline>
    </svg>
  );

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val);

  // ============================================================================
  // 1. MOTOR DE CÁLCULOS: HISTORIAL DE 12 MESES (ANALÍTICA CLÁSICA)
  // ============================================================================
  const {
    historialMensual,
    totalIngresosAnual,
    totalEgresosAnual,
    totalFijosAnual,
    totalVariablesAnual,
    mesesConSuperavit
  } = useMemo(() => {
    const meses = [];
    const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);

    let sumIng = 0;
    let sumEgr = 0;
    let sumFijos = 0;
    let sumVar = 0;
    let superavitCount = 0;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(fechaBase);
      d.setMonth(d.getMonth() - i);

      const mesStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('es-ES', {
        month: 'short',
        year: '2-digit'
      }).replace(/^\w/, c => c.toUpperCase());

      const egresosMesFiltrados = egresos.filter(e => e.fecha.startsWith(mesStr));
      const ingMes = ingresos.filter(i => i.fecha.startsWith(mesStr)).reduce((s, i) => s + Number(i.monto), 0);
      const egrMes = egresosMesFiltrados.reduce((s, e) => s + Number(e.monto), 0);

      const fijosMes = egresosMesFiltrados.filter(e => e.tipo === 'Fijo').reduce((s, e) => s + Number(e.monto), 0);
      const varMes = egresosMesFiltrados.filter(e => e.tipo !== 'Fijo').reduce((s, e) => s + Number(e.monto), 0);

      const neto = ingMes - egrMes;
      const tasaAhorroMes = ingMes > 0 ? (neto > 0 ? (neto / ingMes) * 100 : 0) : 0;

      if (neto > 0) superavitCount++;

      sumIng += ingMes;
      sumEgr += egrMes;
      sumFijos += fijosMes;
      sumVar += varMes;

      meses.push({
        mesStr,
        label,
        ingresos: ingMes,
        egresos: egrMes,
        neto,
        tasaAhorro: tasaAhorroMes
      });
    }

    return {
      historialMensual: meses,
      totalIngresosAnual: sumIng,
      totalEgresosAnual: sumEgr,
      totalFijosAnual: sumFijos,
      totalVariablesAnual: sumVar,
      mesesConSuperavit: superavitCount
    };
  }, [ingresos, egresos, selectedMonth]);

  // ============================================================================
  // 2. MOTOR DE CÁLCULOS: SCORE Y DEUDAS (ESTRATEGIA AVALANCHA)
  // ============================================================================
  const deudasOrdenadas = useMemo(() => {
    return cuentas
      .filter(c => (c.type === 'credit' || c.type === 'loan') && c.currentDebt > 0)
      .sort((a, b) => b.tasaEA - a.tasaEA); 
  }, [cuentas]);

  const ingMesActual = historialMensual[11]?.ingresos || 0;
  const cuotasMesActual = cuentas.reduce((sum, c) => sum + (c.currentDebt > 0 ? (Number(c.cuotaMinima) || 0) : 0), 0);
  
  const cargaDeuda = ingMesActual > 0 ? (cuotasMesActual / ingMesActual) * 100 : 0;
  const tasaAhorroAnual = totalIngresosAnual > 0 ? ((totalIngresosAnual - totalEgresosAnual) / totalIngresosAnual) * 100 : 0;
  const flujoPromedioMes = (totalIngresosAnual - totalEgresosAnual) / 12;

  // ============================================================================
  // 3. MOTOR DE RECOMENDACIONES INTELIGENTES (BASADO EN COMPORTAMIENTO)
  // ============================================================================
  const recomendaciones = useMemo(() => {
    const recs = [];

    if (cargaDeuda > 40) {
      recs.push({
        tipo: 'alerta',
        ico: '🚨',
        title: 'Carga de Deuda en Nivel Crítico',
        desc: `Estás comprometiendo el ${cargaDeuda.toFixed(1)}% de tus ingresos solo en cuotas. Debes congelar inmediatamente el uso de tarjetas de crédito y aplicar todo el excedente a tu deuda más pequeña para liberar flujo de caja.`
      });
    } else if (cargaDeuda > 20) {
      recs.push({
        tipo: 'precaucion',
        ico: '⚠️',
        title: 'Carga de Deuda Moderada',
        desc: `Tus cuotas consumen el ${cargaDeuda.toFixed(1)}% de tu ingreso. Estás en un rango manejable, pero no adquieras nuevas obligaciones hasta cancelar al menos una tarjeta.`
      });
    }

    if (tasaAhorroAnual < 5) {
      recs.push({
        tipo: 'alerta',
        ico: '📉',
        title: 'Capacidad de Ahorro Mínima',
        desc: 'Tu retención de capital es muy baja. Revisa tu "Estructura de Gasto" abajo: si tus gastos fijos superan el 60%, debes negociar servicios o seguros. Si los variables son el problema, recorta salidas y domicilios este mes.'
      });
    } else if (tasaAhorroAnual >= 20) {
      recs.push({
        tipo: 'exito',
        ico: '🏆',
        title: 'Excelente Tasa de Retención',
        desc: `Estás ahorrando el ${tasaAhorroAnual.toFixed(1)}% de tu dinero. Es momento de mover ese capital a un fondo de inversión o cuenta de alto rendimiento para ganarle a la inflación.`
      });
    }

    if (mesesConSuperavit <= 6) {
      recs.push({
        tipo: 'precaucion',
        ico: '⚖️',
        title: 'Flujo de Caja Inconsistente',
        desc: `En el último año, has tenido déficits en ${12 - mesesConSuperavit} meses. Esto significa que estás dependiendo de ahorros previos o tarjetas para cubrir tu estilo de vida. Crea un presupuesto más estricto.`
      });
    }

    scoreData.recs.forEach(r => {
      if (!recs.find(existing => existing.title === r.title)) {
        recs.push({ tipo: 'info', ico: r.ico, title: r.title, desc: r.txt });
      }
    });

    if (recs.length === 0) {
      recs.push({
        tipo: 'exito',
        ico: '🚀',
        title: 'Finanzas Saludables',
        desc: 'Tus indicadores de flujo, deuda y ahorro están perfectos. Sigue tu estrategia actual.'
      });
    }

    return recs;
  }, [cargaDeuda, tasaAhorroAnual, mesesConSuperavit, scoreData.recs]);


  // ============================================================================
  // 4. TOP 5 FUGAS DE CAPITAL
  // ============================================================================
  const topCategoriasAnual = useMemo(() => {
    const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);
    fechaBase.setMonth(fechaBase.getMonth() - 11);
    const hace12MesesStr = fechaBase.toISOString().slice(0, 7);

    const gastos12m = egresos.filter(e => e.fecha >= hace12MesesStr);
    const catMap = {};
    gastos12m.forEach(g => {
        const c = g.categoria || 'Otros';
        catMap[c] = (catMap[c] || 0) + Number(g.monto);
    });
    return Object.entries(catMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [egresos, selectedMonth]);

  const { mejorMes, peorMes } = useMemo(() => {
    let mejor = historialMensual[0]; let peor = historialMensual[0];
    historialMensual.forEach(m => {
        if (m.neto > mejor.neto) mejor = m;
        if (m.neto < peor.neto) peor = m;
    });
    return { mejorMes: mejor, peorMes: peor };
  }, [historialMensual]);

  const maxValHist = Math.max(...historialMensual.map(m => Math.max(m.ingresos, m.egresos)), 1);
  const maxValCat = topCategoriasAnual.length > 0 ? topCategoriasAnual[0][1] : 1;
  const pctFijos = totalEgresosAnual > 0 ? (totalFijosAnual / totalEgresosAnual) * 100 : 0;
  const pctVariables = totalEgresosAnual > 0 ? (totalVariablesAnual / totalEgresosAnual) * 100 : 0;


  // ============================================================================
  // INTERFAZ DE USUARIO (UI)
  // ============================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* ENCABEZADO */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart className="text-indigo-400 w-8 h-8"/> 
          Analítica y Score Familia
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          El panel de control definitivo: Historial, métricas de riesgo y plan de acción.
        </p>
      </header>

      {/* ---------------------------------------------------- */}
      {/* SECCIÓN 1: TARJETAS DE SALUD FINANCIERA (FUSIÓN)     */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* Score General */}
        <Card className="p-4 border-t-4 border-t-indigo-500 bg-indigo-950/20">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] md:text-xs text-indigo-400 uppercase font-bold">Score Salud</p>
            <Activity size={16} className="text-indigo-400"/>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{scoreData.score} <span className="text-sm text-slate-500 font-medium">/100</span></p>
        </Card>

        {/* Carga de Deuda */}
        <Card className={`p-4 border-t-4 ${cargaDeuda > 40 ? 'border-t-rose-500 bg-rose-950/20' : 'border-t-emerald-500 bg-emerald-950/20'}`}>
          <div className="flex justify-between items-start mb-1">
            <p className={`text-[10px] md:text-xs uppercase font-bold ${cargaDeuda > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>Carga de Deuda</p>
            <ShieldAlert size={16} className={cargaDeuda > 40 ? 'text-rose-400' : 'text-emerald-400'}/>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{cargaDeuda.toFixed(1)}%</p>
        </Card>

        {/* Tasa de Ahorro */}
        <Card className={`p-4 border-t-4 ${tasaAhorroAnual >= 10 ? 'border-t-emerald-500 bg-emerald-950/20' : 'border-t-amber-500 bg-amber-950/20'}`}>
          <div className="flex justify-between items-start mb-1">
            <p className={`text-[10px] md:text-xs uppercase font-bold ${tasaAhorroAnual >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>Tasa de Ahorro</p>
            <PiggyBank size={16} className={tasaAhorroAnual >= 10 ? 'text-emerald-400' : 'text-amber-400'}/>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{tasaAhorroAnual.toFixed(1)}%</p>
        </Card>

        {/* Flujo Promedio Mensual */}
        <Card className={`p-4 border-t-4 ${flujoPromedioMes >= 0 ? 'border-t-emerald-500' : 'border-t-rose-500'}`}>
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold">Flujo Promedio</p>
            <Wallet size={16} className="text-slate-500"/>
          </div>
          <p className={`text-xl md:text-2xl font-black ${flujoPromedioMes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCOP(flujoPromedioMes)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 2: COMPARATIVO HISTÓRICO (ANALÍTICA ORIGINAL)*/}
        {/* ---------------------------------------------------- */}
        <Card className="xl:col-span-2 border-t-4 border-t-indigo-500">
          <h2 className="text-lg font-bold text-white mb-6">Comparativo Histórico: Ingresos vs Egresos (12 Meses)</h2>
          
          <div className="h-64 flex items-end justify-between gap-1 md:gap-4 border-b border-slate-800 pb-2 mt-4">
            {historialMensual.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                
                <div className="flex gap-0.5 md:gap-1 w-full justify-center items-end h-full">
                  <div style={{ height: `${Math.max((m.ingresos / maxValHist) * 100, 2)}%` }} className="w-3 md:w-5 bg-emerald-500/80 rounded-t-sm group-hover:bg-emerald-400 transition-all"></div>
                  <div style={{ height: `${Math.max((m.egresos / maxValHist) * 100, 2)}%` }} className="w-3 md:w-5 bg-rose-500/80 rounded-t-sm group-hover:bg-rose-400 transition-all"></div>
                </div>
                <span className="text-[9px] md:text-[10px] text-slate-500 mt-2 font-bold uppercase">{m.label}</span>
                
                <div className="opacity-0 group-hover:opacity-100 absolute -top-24 bg-slate-950 border border-slate-700 p-3 rounded shadow-2xl z-20 pointer-events-none transition-opacity text-[10px] min-w-[140px]">
                  <p className="text-slate-300 font-bold uppercase mb-2 border-b border-slate-800 pb-1">{m.label}</p>
                  <div className="flex justify-between mb-1"><span className="text-emerald-400 font-bold">Ingresos:</span> <span className="text-white">{formatCOP(m.ingresos)}</span></div>
                  <div className="flex justify-between mb-1"><span className="text-rose-400 font-bold">Egresos:</span> <span className="text-white">{formatCOP(m.egresos)}</span></div>
                  <div className="border-t border-slate-800 my-1.5"></div>
                  <div className="flex justify-between font-black"><span className={m.neto >= 0 ? 'text-indigo-400' : 'text-amber-500'}>Neto:</span> <span className={m.neto >= 0 ? 'text-indigo-400' : 'text-amber-500'}>{formatCOP(m.neto)}</span></div>
                  <div className="flex justify-between mt-1 text-[9px]"><span className="text-slate-500">Retención:</span> <span className="text-slate-300">{m.tasaAhorro.toFixed(1)}%</span></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-6 mt-4 text-xs font-bold uppercase tracking-wider">
             <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Ingresos</span>
             <span className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Egresos</span>
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 3: RECOMENDACIONES Y ACCIONES                */}
        {/* ---------------------------------------------------- */}
        <Card className="border-t-4 border-t-amber-500 flex flex-col">
           <div className="flex items-center gap-2 mb-6">
              <Zap className="text-amber-400 w-5 h-5"/>
              <h2 className="text-lg font-bold text-white">Acciones Sugeridas</h2>
           </div>
           
           <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {recomendaciones.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border shadow-inner ${
                  r.tipo === 'alerta' ? 'bg-rose-950/20 border-rose-500/30' : 
                  r.tipo === 'precaucion' ? 'bg-amber-950/20 border-amber-500/30' : 
                  r.tipo === 'exito' ? 'bg-emerald-950/20 border-emerald-500/30' : 
                  'bg-slate-950 border-slate-800'
                }`}>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{r.ico}</span>
                      <span className="font-bold text-sm text-white">{r.title}</span>
                   </div>
                   <p className="text-[11px] text-slate-400 leading-relaxed">
                     {r.desc}
                   </p>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 4: ESTRATEGIA AVALANCHA (DEUDAS)             */}
        {/* ---------------------------------------------------- */}
        <Card className="border-t-4 border-t-rose-500 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <ShieldAlert className="text-rose-400 w-5 h-5"/>
               Estrategia Avalancha: Orden de Pago
            </h2>
            <div className="hidden md:block px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-[10px] font-bold uppercase tracking-wide border border-rose-500/20">
              Prioridad: Tasa de Interés
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[350px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
             {deudasOrdenadas.map((d, i) => (
               <div key={d.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${i === 0 ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-xs md:text-sm shrink-0 ${i === 0 ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-slate-800 text-slate-400'}`}>
                      #{i+1}
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-slate-200 line-clamp-1">{d.name}</p>
                      <p className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-0.5">
                        Tasa EA: <span className="text-rose-400 font-bold">{d.tasaEA}%</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm md:text-base font-black ${i === 0 ? 'text-rose-400' : 'text-white'}`}>
                      {formatCOP(d.currentDebt)}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Saldo</p>
                  </div>
               </div>
             ))}

             {deudasOrdenadas.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full py-10">
                 <p className="text-4xl mb-3">🎉</p>
                 <p className="text-slate-300 font-bold text-sm">¡Cero Deudas Activas!</p>
                 <p className="text-slate-500 text-xs mt-1">Eres libre de intereses bancarios.</p>
               </div>
             )}
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 5: FUGAS, EXTREMOS Y ESTRUCTURA DE GASTO     */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-6 flex flex-col">
           
           {/* Top 5 Fugas y Extremos */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Extremos */}
              <Card className="flex flex-col justify-center border-t-4 border-t-emerald-500 gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Extremos del Año</h3>
                
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Mejor Mes ({mejorMes?.label})</p>
                    <p className="text-lg font-black text-emerald-400">{formatCOP(mejorMes?.neto)}</p>
                  </div>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shrink-0">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-rose-500 font-bold uppercase">Peor Mes ({peorMes?.label})</p>
                    <p className="text-lg font-black text-rose-400">{formatCOP(peorMes?.neto)}</p>
                  </div>
                </div>
              </Card>

              {/* Top Fugas */}
              <Card className="border-t-4 border-t-orange-500">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top 5 Fugas</h3>
                <div className="space-y-3">
                  {topCategoriasAnual.map(([cat, amount], i) => {
                    const width = Math.max((amount / maxValCat) * 100, 5);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium truncate pr-2"><span className="text-orange-500/50 font-bold">#{i+1}</span> {cat}</span>
                          <span className="font-bold text-orange-400">{formatCOP(amount)}</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${width}%` }}></div></div>
                      </div>
                    );
                  })}
                </div>
              </Card>
           </div>

           {/* Estructura de Gasto */}
           <Card className="border-t-4 border-t-slate-500 flex-1">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Estructura de Gasto (Fijo vs Variable)</h3>
             
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-bold">Gastos Fijos (Compromisos)</span>
                    <span className="text-orange-400 font-black text-lg">{pctFijos.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden shadow-inner">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${pctFijos}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-bold">Gastos Variables (Estilo de vida)</span>
                    <span className="text-blue-400 font-black text-lg">{pctVariables.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden shadow-inner">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${pctVariables}%` }}></div>
                  </div>
                </div>
             </div>

             <div className="mt-5 p-3 bg-slate-950 border border-slate-800 rounded-lg text-center shadow-inner">
                <p className="text-xs text-slate-400">Tu relación de costo de vida es <strong className="text-white text-sm">{(totalVariablesAnual > 0 ? (totalFijosAnual/totalVariablesAnual).toFixed(1) : 0)} a 1</strong> (Fijos por cada Variable).</p>
             </div>
           </Card>
        </div>

      </div>
    </div>
  );
};
