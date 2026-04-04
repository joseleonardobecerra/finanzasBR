// --- Componentes de Pestañas ---
const DashboardTab = ({ flujoNetoMes, cuotasMesTotal, cuotasMesRestantes, ingresosMesTotal, egresosMesTotal, deudaTotal, liquidezTotal, selectedMonth, egresosMes, ingresos, egresos, presupuestos, pagosFijos, ingresosFijos, cuentas }) => {
  const [chartFilter, setChartFilter] = useState('Todos');
  
  // Helpers para identificar dueños
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

  // --- CÁLCULOS DE PROYECCIÓN ---
  const totalPresupuestadoFijo = pagosFijos ? pagosFijos.reduce((sum, item) => sum + item.monto, 0) : 0;
  const totalPresupuestadoVar = presupuestos ? presupuestos.reduce((sum, item) => sum + item.limite, 0) : 0;
  const presupuestoTotal = totalPresupuestadoFijo + totalPresupuestadoVar;

  const proyIngLeo = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyIngAndre = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyeccionIngresosMes = ingresosFijos ? ingresosFijos.reduce((sum, item) => sum + Number(item.monto), 0) : 0; 
  
  const totalProyeccionMes = proyeccionIngresosMes - presupuestoTotal;

  // --- CÁLCULOS DE REALIDAD ---
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

  // Pagos Fijos Pendientes (Todos sin excluir tarjetas)
  const pagosFijosPendientesTotal = pagosFijos ? pagosFijos.filter(pf => !egresosMes.some(e => e.pagoFijoId === pf.id)).reduce((sum, pf) => sum + pf.monto, 0) : 0;

  // Gráficas
  const gastosFiltrados = chartFilter === 'Todos' ? egresosMes : egresosMes.filter(e => e.tipo === chartFilter);
  const gastosPorCategoria = {};
  gastosFiltrados.forEach(g => {
    const cat = g.categoria || 'Otros';
    gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + g.monto;
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
      <header><h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Inicio y Dashboard Global</h1><p className="text-sm md:text-base text-slate-400 mt-1">Resumen de flujos, PowerBI de egresos y proyecciones.</p></header>

      {/* TARJETAS PRINCIPALES (MODIFICADAS SEGÚN SOLICITUD) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-5 border-t-4 border-t-emerald-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Ingresos Totales (Mes)</h3>
          <p className="text-lg md:text-2xl font-bold text-emerald-400 mt-1">{formatCOP(ingresosMesTotal)}</p>
        </Card>
        <Card className="p-3 md:p-5 border-t-4 border-t-rose-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Egresos Totales</h3>
          <p className="text-lg md:text-2xl font-bold text-rose-400 mt-1">{formatCOP(egresosMesTotal)}</p>
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
        <Card className="p-3 md:p-5 border-t-4 border-t-slate-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Presupuesto Configurado</h3>
          <p className="text-lg md:text-2xl font-bold text-slate-200 mt-1">{formatCOP(presupuestoTotal)}</p>
        </Card>
        <Card className={`p-3 md:p-5 border-t-4 ${presupuestoTotal - egresosMesTotal >= 0 ? 'border-t-emerald-500/50' : 'border-t-rose-500/50'}`}>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Presupuesto Restante</h3>
          <p className={`text-lg md:text-2xl font-bold mt-1 ${presupuestoTotal - egresosMesTotal >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
            {formatCOP(presupuestoTotal - egresosMesTotal)}
          </p>
        </Card>
      </div>

      {/* RESUMEN Y PROYECCIÓN DETALLADA (LEO VS ANDRE) */}
      <Card className="flex flex-col border-t-4 border-t-indigo-500 bg-slate-900/80">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Calculator size={18} className="text-indigo-400" /> Resumen y Proyección Detallada</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">1. Proyección del Mes</h3>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Proyección ingresos Leo</span> <span className="font-bold text-emerald-400">{formatCOP(proyIngLeo)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Proyección ingresos Andre</span> <span className="font-bold text-emerald-400">{formatCOP(proyIngAndre)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Proyección pagos fijos</span> <span className="font-bold text-rose-400">{formatCOP(totalPresupuestadoFijo)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Proyección pagos variables</span> <span className="font-bold text-rose-400">{formatCOP(totalPresupuestadoVar)}</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 items-center"><span className="text-slate-200">TOTAL ESPERADO</span> <span className={totalProyeccionMes >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(totalProyeccionMes)}</span></div>
          </div>
          <div className="space-y-4 md:border-l md:border-slate-800 md:pl-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">2. Realidad (En vivo)</h3>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total ingresos Leo</span> <span className="font-bold text-emerald-400">{formatCOP(ingLeo)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total ingresos Andre</span> <span className="font-bold text-emerald-400">{formatCOP(ingAndre)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total egresos Leo (Cuentas)</span> <span className="font-bold text-rose-400">{formatCOP(egrLeo)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total egresos Andre (Cuentas)</span> <span className="font-bold text-rose-400">{formatCOP(egrAndre)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total pagos fijos (Sin TC)</span> <span className="font-bold text-rose-400">{formatCOP(gastadoFijoSinTC)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total pagos variables (Sin TC)</span> <span className="font-bold text-rose-400">{formatCOP(gastadoVarSinTC)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total pagos TC Leo</span> <span className="font-bold text-rose-400">{formatCOP(pagosTCLeo)}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-slate-400">Total pagos TC Andre</span> <span className="font-bold text-rose-400">{formatCOP(pagosTCAndre)}</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 items-center"><span className="text-slate-200">TOTAL REAL</span> <span className={dineroDisponible >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(dineroDisponible)}</span></div>
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
              return (
                <div key={i} className="flex flex-col items-center w-full h-full justify-end group relative">
                  <div className="flex gap-1 w-full justify-center items-end h-full">
                    <div style={{ height: `${Math.max(hInc, 2)}%` }} className="w-1/3 max-w-[12px] bg-emerald-500/80 rounded-t-sm transition-all group-hover:bg-emerald-400"></div>
                    <div style={{ height: `${Math.max(hExp, 2)}%` }} className="w-1/3 max-w-[12px] bg-rose-500/80 rounded-t-sm transition-all group-hover:bg-rose-400"></div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-950 border border-slate-800 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap z-10 pointer-events-none transition-opacity">
                    <p className="text-emerald-400">Ing: {formatCOP(d.ing)}</p>
                    <p className="text-rose-400">Egr: {formatCOP(d.egr)}</p>
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
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs font-medium w-full md:w-auto">
              <button onClick={()=>setChartFilter('Todos')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Todos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
              <button onClick={()=>setChartFilter('Fijo')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Fijo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Fijos</button>
              <button onClick={()=>setChartFilter('Variable')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Variable' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Variables</button>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-2">
            {chartData.length === 0 && <p className="text-sm text-slate-500 text-center py-10">No hay egresos registrados.</p>}
            {chartData.map(([name, amount]) => {
              const width = Math.max((amount / maxMonto) * 100, 2);
              return (
                <div key={name} className="relative">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium truncate pr-4">{name}</span>
                    <span className="font-bold text-slate-200">{formatCOP(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${width}%` }}></div>
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