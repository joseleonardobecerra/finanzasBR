const DashboardTab = ({ flujoNetoMes, cuotasMesTotal, cuotasMesRestantes, ingresosMesTotal, egresosMesTotal, deudaTotal, liquidezTotal, selectedMonth, egresosMes, ingresos, egresos, presupuestos, pagosFijos, ingresosFijos, cuentas }) => {
  const { useState, useMemo } = React;
  const [chartFilter, setChartFilter] = useState('Todos');
  const [expandedCard, setExpandedCard] = useState(null);
  
  const toggleCard = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

  const identifyOwner = (cuentaId, itemPersona, textDesc) => {
    if (itemPersona === 'L' || itemPersona === 'Leo') return 'Leo';
    if (itemPersona === 'A' || itemPersona === 'Andre') return 'Andre';
    let targetName = textDesc || '';
    if (cuentaId) {
        const c = cuentas.find(acc => acc.id === cuentaId);
        if (c) targetName = c.name;
    }
    const t = targetName.toUpperCase();
    const hasL = t.includes('LEO') || t.endsWith(' L') || t.includes(' L ');
    const hasA = t.includes('ANDRE') || t.includes('ANDRÉ') || t.endsWith(' A') || t.includes(' A ');
    if (hasL && !hasA) return 'Leo';
    if (hasA && !hasL) return 'Andre';
    return 'Shared';
  };

  const idsTarjetas = cuentas.filter(c => c.type === 'credit').map(c => c.id);

  const totalPresupuestadoFijo = pagosFijos ? pagosFijos.reduce((sum, item) => sum + item.monto, 0) : 0;
  const totalPresupuestadoVar = presupuestos ? presupuestos.reduce((sum, item) => sum + item.limite, 0) : 0;
  const presupuestoTotal = totalPresupuestadoFijo + totalPresupuestadoVar;

  const proyIngLeo = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyIngAndre = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyeccionIngresosMes = ingresosFijos ? ingresosFijos.reduce((sum, item) => sum + Number(item.monto), 0) : 0; 
  const totalProyeccionMes = proyeccionIngresosMes - presupuestoTotal;

  const ingresosMesActual = ingresos.filter(i => i.fecha.startsWith(selectedMonth));
  const ingLeo = ingresosMesActual.filter(i => identifyOwner(i.cuentaId, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + i.monto, 0);
  const ingAndre = ingresosMesActual.filter(i => identifyOwner(i.cuentaId, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + i.monto, 0);

  const egrLeo = egresosMes.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Leo').reduce((s, e) => s + e.monto, 0);
  const egrAndre = egresosMes.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Andre').reduce((s, e) => s + e.monto, 0);

  const gastadoFijoSinTC = egresosMes.filter(e => e.tipo === 'Fijo' && !idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);
  const gastadoVarSinTC = egresosMes.filter(e => e.tipo !== 'Fijo' && !idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);

  const pagosTC = egresosMes.filter(e => idsTarjetas.includes(e.cuentaId));
  const pagosTCLeo = pagosTC.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Leo').reduce((s, e) => s + e.monto, 0);
  const pagosTCAndre = pagosTC.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Andre').reduce((s, e) => s + e.monto, 0);

  const dineroDisponible = ingresosMesTotal - egresosMesTotal;
  const pagosFijosPendientesTotal = pagosFijos ? pagosFijos.filter(pf => !egresosMes.some(e => e.pagoFijoId === pf.id)).reduce((sum, pf) => sum + pf.monto, 0) : 0;

  const liquidezAccounts = cuentas.filter(c => ['bank', 'cash'].includes(c.type) && !c.name.toLowerCase().includes('rappi'));
  let liquidezLeoCuentas = 0; let liquidezLeoEfectivo = 0;
  let liquidezAndreCuentas = 0; let liquidezAndreEfectivo = 0;

  liquidezAccounts.forEach(c => {
     const owner = identifyOwner(c.id, null, c.name);
     if (owner === 'Leo') {
         if (c.type === 'cash') liquidezLeoEfectivo += c.currentBalance;
         else liquidezLeoCuentas += c.currentBalance;
     } else if (owner === 'Andre') {
         if (c.type === 'cash') liquidezAndreEfectivo += c.currentBalance;
         else liquidezAndreCuentas += c.currentBalance;
     }
  });

  const totalDineroCuentas = liquidezLeoCuentas + liquidezLeoEfectivo + liquidezAndreCuentas + liquidezAndreEfectivo;

  const deudasActivas = cuentas.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0).sort((a,b) => b.tasaEA - a.tasaEA);
  const focoAvalancha = deudasActivas.length > 0 ? deudasActivas[0] : null;

  const metaInversion = pagosFijos ? pagosFijos.filter(pf => pf.categoria === 'Inversión' || pf.descripcion.toLowerCase().includes('ahorro')).reduce((s, pf) => s + pf.monto, 0) : 0;
  const invertidoActual = egresosMes.filter(e => e.categoria === 'Inversión' || e.descripcion.toLowerCase().includes('ahorro')).reduce((s, e) => s + e.monto, 0);
  const progresoInversion = metaInversion > 0 ? Math.min((invertidoActual / metaInversion) * 100, 100) : 0;

  const gastosFiltrados = chartFilter === 'Todos' ? egresosMes : egresosMes.filter(e => e.tipo === chartFilter);
  const gastosPorCategoria = {};
  
  gastosFiltrados.forEach(g => {
    const cat = g.categoria || 'Otros';
    const interes = g.interesesOtros || 0;
    const capitalGasto = g.monto - interes;
    if (capitalGasto > 0) gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + capitalGasto;
    if (interes > 0) gastosPorCategoria['Intereses y Cargos'] = (gastosPorCategoria['Intereses y Cargos'] || 0) + interes;
  });
  
  const chartData = Object.entries(gastosPorCategoria).sort((a,b)=>b[1]-a[1]);
  const maxMonto = chartData.length > 0 ? chartData[0][1] : 1;

  const trendData = useMemo(() => {
    return Array.from({length: 6}, (_, i) => {
      const d = new Date(`${selectedMonth}-01T12:00:00`);
      d.setMonth(d.getMonth() - 5 + i);
      const mStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('es-ES', { month: 'short' }).replace(/^\w/, c=>c.toUpperCase());
      const tIng = ingresos.filter(x => x.fecha.startsWith(mStr)).reduce((s, x) => s + x.monto, 0);
      const tEgr = egresos.filter(x => x.fecha.startsWith(mStr)).reduce((s, x) => s + x.monto, 0);
      return { mes: mStr, label, ing: tIng, egr: tEgr };
    });
  }, [ingresos, egresos, selectedMonth]);

  const maxTrendVal = Math.max(...trendData.map(d => Math.max(d.ing, d.egr)), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Inicio y Dashboard Global</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Resumen de flujos, PowerBI de egresos y proyecciones.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-5 border-t-4 border-t-emerald-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Ingresos Totales (Mes)</h3>
          <p className="text-lg md:text-2xl font-bold text-emerald-400 mt-1">{formatCOP(ingresosMesTotal)}</p>
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 border-t-rose-500 transition-colors ${expandedCard === 'egresos' ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => toggleCard('egresos')}>
            <div className="flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs md:text-sm font-medium">Egresos Totales</h3>
              <p className="text-lg md:text-2xl font-bold text-rose-400 mt-1">{formatCOP(egresosMesTotal)}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'egresos' ? '-rotate-90' : 'rotate-90'}`} />
          </div>
          {expandedCard === 'egresos' && (
            <div className="mt-4 pt-3 border-t border-slate-800 animate-in slide-in-from-top-2">
              <ul className="space-y-2 text-xs">
                {chartData.map(([cat, amount]) => (
                  <li key={cat} className="flex justify-between items-center text-slate-300">
                    <span className="truncate pr-2 font-medium">{cat}</span>
                    <span className={`font-bold ${cat === 'Intereses y Cargos' ? 'text-amber-400' : 'text-rose-400'}`}>{formatCOP(amount)}</span>
                  </li>
                ))}
                {chartData.length === 0 && <li className="text-slate-500 text-center py-2">No hay egresos registrados</li>}
              </ul>
            </div>
          )}
        </Card>

        <Card className={`p-3 md:p-5 border-t-4 ${dineroDisponible >= 0 ? 'border-t-indigo-500' : 'border-t-rose-500'}`}>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Dinero Disponible (Ing - Egr)</h3>
          <p className={`text-lg md:text-2xl font-bold mt-1 ${dineroDisponible >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
            {formatCOP(dineroDisponible)}
          </p>
        </Card>
        
        <Card className="p-3 md:p-5 border-t-4 border-t-amber-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Pagos Fijos Pendientes (Todos)</h3>
          <p className="text-lg md:text-2xl font-bold text-amber-400 mt-1">{formatCOP(pagosFijosPendientesTotal)}</p>
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 border-t-slate-500 transition-colors ${expandedCard === 'presupuesto' ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => toggleCard('presupuesto')}>
            <div className="flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs md:text-sm font-medium">Presupuesto Configurado</h3>
              <p className="text-lg md:text-2xl font-bold text-slate-200 mt-1">{formatCOP(presupuestoTotal)}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'presupuesto' ? '-rotate-90' : 'rotate-90'}`} />
          </div>
          {expandedCard === 'presupuesto' && (
            <div className="mt-4 pt-3 border-t border-slate-800 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400">Gastos Fijos</span>
                <span className="font-bold text-orange-400">{formatCOP(totalPresupuestadoFijo)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Gastos Variables</span>
                <span className="font-bold text-blue-400">{formatCOP(totalPresupuestadoVar)}</span>
              </div>
            </div>
          )}
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 border-t-emerald-500/50 transition-colors ${expandedCard === 'cuentas' ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => toggleCard('cuentas')}>
            <div className="flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs md:text-sm font-medium">Dinero en Cuentas (Total)</h3>
              <p className="text-lg md:text-2xl font-bold text-emerald-400/80 mt-1">{formatCOP(totalDineroCuentas)}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'cuentas' ? '-rotate-90' : 'rotate-90'}`} />
          </div>
          {expandedCard === 'cuentas' && (
            <div className="mt-4 pt-3 border-t border-slate-800 animate-in slide-in-from-top-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Cuentas Leo</h4>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Bancos</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezLeoCuentas)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Efectivo</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezLeoEfectivo)}</span>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-rose-500 uppercase mb-1">Cuentas Andre</h4>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Bancos</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezAndreCuentas)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Efectivo</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezAndreEfectivo)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-t-4 border-t-rose-500 bg-slate-900/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
               <ShieldAlert size={16} className="text-rose-400" /> Foco Avalancha (Deudas)
             </h3>
             <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-1 rounded border border-rose-500/20">Prioridad 1</span>
          </div>
          {focoAvalancha ? (
            <div>
              <p className="text-xl font-bold text-white mb-1">{focoAvalancha.name}</p>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-xs text-slate-400">Deuda Restante</p>
                  <p className="text-lg font-bold text-rose-400">{formatCOP(focoAvalancha.currentDebt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Tasa Interés</p>
                  <p className="text-base font-bold text-amber-400">{focoAvalancha.tasaEA}% E.A.</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                💡 <strong>Estrategia:</strong> Paga el mínimo en las demás obligaciones y todo el dinero sobrante del mes aplícalo a esta deuda.
              </p>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-4 text-emerald-400">
               <CheckCircle2 size={32} className="mb-2 opacity-80" />
               <p className="text-sm font-bold">¡Libre de deudas activas!</p>
             </div>
          )}
        </Card>

        <Card className="border-t-4 border-t-emerald-500 bg-slate-900/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
               <PiggyBank size={16} className="text-emerald-400" /> Meta de Ahorro / Inversión
             </h3>
             {progresoInversion >= 100 && <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">¡Logrado!</span>}
          </div>
          {metaInversion > 0 ? (
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Aportado este mes</span>
                  <span className="font-bold text-emerald-400">{formatCOP(invertidoActual)} <span className="text-slate-500">/ {formatCOP(metaInversion)}</span></span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-4 border border-slate-800 relative overflow-hidden mb-3">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${progresoInversion}%`}}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                    {progresoInversion.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  {progresoInversion < 100 ? `Te faltan ${formatCOP(metaInversion - invertidoActual)} para cumplir tu objetivo mensual.` : '¡Has cumplido tu cuota de "Págate a ti mismo primero" este mes!'}
                </p>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-4 text-amber-400">
               <Target size={32} className="mb-2 opacity-80" />
               <p className="text-sm font-bold text-center">No hay metas configuradas.<br/><span className="text-xs text-slate-400 font-normal">Ve a Simuladores y activa un Plan de Ahorro.</span></p>
             </div>
          )}
        </Card>
      </div>

      <Card className="flex flex-col border-t-4 border-t-indigo-500 bg-slate-900/80">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-indigo-400" /> Resumen y Realidad (En Vivo)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800">
          <div className="space-y-4 lg:border-r lg:border-slate-800 lg:pr-6">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider border-b border-slate-800 pb-2">1. Finanzas Leo</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Total Ingresos</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(proyIngLeo)}</span></div>
              <span className="font-bold text-emerald-400">{formatCOP(ingLeo)}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Total Egresos</span><span className="font-bold text-rose-400">{formatCOP(egrLeo)}</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 items-center">
              <span className="text-slate-200">Flujo Leo</span><span className={ingLeo - egrLeo >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingLeo - egrLeo)}</span>
            </div>
          </div>
          <div className="space-y-4 lg:border-r lg:border-slate-800 lg:pr-6">
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider border-b border-slate-800 pb-2">2. Finanzas Andre</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Total Ingresos</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(proyIngAndre)}</span></div>
              <span className="font-bold text-emerald-400">{formatCOP(ingAndre)}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Total Egresos</span><span className="font-bold text-rose-400">{formatCOP(egrAndre)}</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 items-center">
              <span className="text-slate-200">Flujo Andre</span><span className={ingAndre - egrAndre >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingAndre - egrAndre)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">3. Consolidado Hogar</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Total Ingresos</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(proyeccionIngresosMes)}</span></div>
              <span className="font-bold text-emerald-400">{formatCOP(ingresosMesTotal)}</span>
            </div>
            {/* ✨ COLORES NARANJA Y AZUL APLICADOS AQUÍ TAMBIÉN */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Pagos Fijos (Sin TC)</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(totalPresupuestadoFijo)}</span></div>
              <span className="font-bold text-orange-400">{formatCOP(gastadoFijoSinTC)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Pagos Variables (Sin TC)</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(totalPresupuestadoVar)}</span></div>
              <span className="font-bold text-blue-400">{formatCOP(gastadoVarSinTC)}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Pagos con TC (Ambos)</span><span className="font-bold text-rose-400">{formatCOP(pagosTCLeo + pagosTCAndre)}</span></div>
            <div className="flex justify-between text-sm items-center border-t border-slate-800/50 pt-3 mt-1"><span className="text-slate-400">Total Egresos</span><span className="font-bold text-rose-400">{formatCOP(egresosMesTotal)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-800 items-center">
              <div className="flex flex-col"><span className="text-slate-200">TOTAL REAL</span><span className="text-[10px] text-slate-600">Esperado: {formatCOP(totalProyeccionMes)}</span></div>
              <span className={dineroDisponible >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(dineroDisponible)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><BarChart size={18} className="text-emerald-400" /> Tendencia Histórica (6 Meses)</h2>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 pb-2 border-b border-slate-800">
            {trendData.map((d, i) => {
              const hInc = (d.ing / maxTrendVal) * 100;
              const hExp = (d.egr / maxTrendVal) * 100;
              const flujoAnterior = d.ing - d.egr;
              return (
                <div key={i} className="flex flex-col items-center w-full h-full justify-end group relative">
                  <div className="flex gap-1 w-full justify-center items-end h-full">
                    <div style={{ height: `${Math.max(hInc, 2)}%` }} className="w-1/3 max-w-[12px] bg-emerald-500/80 rounded-t-sm transition-all group-hover:bg-emerald-400"></div>
                    <div style={{ height: `${Math.max(hExp, 2)}%` }} className="w-1/3 max-w-[12px] bg-rose-500/80 rounded-t-sm transition-all group-hover:bg-rose-400"></div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-16 bg-slate-950 border border-slate-700 text-white text-[10px] p-2 rounded shadow-2xl whitespace-nowrap z-10 pointer-events-none transition-opacity">
                    <p className="text-emerald-400 mb-0.5">Ing: {formatCOP(d.ing)}</p>
                    <p className="text-rose-400 mb-0.5">Egr: {formatCOP(d.egr)}</p>
                    <div className="border-t border-slate-800 my-1"></div>
                    <p className={`font-bold ${flujoAnterior >= 0 ? 'text-indigo-400' : 'text-amber-500'}`}>Neto: {formatCOP(flujoAnterior)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {trendData.map((d, i) => <span key={i} className="text-[10px] font-medium text-slate-500 uppercase">{d.label}</span>)}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500/80"></div> Ingresos</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-rose-500/80"></div> Egresos</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart3 size={18} className="text-indigo-400" /> Distribución de Egresos</h2>
            {/* ✨ FILTROS DE GRÁFICA CON COLORES */}
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs font-medium w-full md:w-auto">
              <button onClick={()=>setChartFilter('Todos')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Todos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
              <button onClick={()=>setChartFilter('Fijo')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Fijo' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Fijos</button>
              <button onClick={()=>setChartFilter('Variable')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Variable' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Variables</button>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {chartData.length === 0 && <p className="text-sm text-slate-500 text-center py-10">No hay egresos registrados.</p>}
            {chartData.map(([name, amount]) => {
              const width = Math.max((amount / maxMonto) * 100, 2);
              const pres = presupuestos.find(p => p.categoria === name);
              const isFijo = egresosMes.some(e => e.categoria === name && e.tipo === 'Fijo');
              
              // ✨ BARRAS DE LA GRÁFICA CON EL COLOR ADECUADO
              let barColorClass = 'bg-blue-500'; // Azul para Variable por defecto
              if (isFijo || chartFilter === 'Fijo') barColorClass = 'bg-orange-500'; // Naranja para Fijos
              
              if (name === 'Intereses y Cargos') barColorClass = 'bg-amber-500';
              else if (pres && pres.limite > 0) {
                 const pct = (amount / pres.limite) * 100;
                 if (pct >= 100) barColorClass = 'bg-rose-500';
                 else if (pct >= 85) barColorClass = 'bg-yellow-500';
              }

              return (
                <div key={name} className="relative group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium truncate pr-4">{name}</span>
                    <span className={`font-bold ${name === 'Intereses y Cargos' ? 'text-amber-400' : (isFijo || chartFilter === 'Fijo' ? 'text-orange-400' : 'text-blue-400')}`}>{formatCOP(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div className={`h-full rounded-full transition-all duration-1000 ${barColorClass}`} style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
