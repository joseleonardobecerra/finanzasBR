const DashboardTab = ({ 
  flujoNetoMes, cuotasMesTotal, cuotasMesRestantes, ingresosMesTotal, 
  egresosMesTotal, deudaTotal, liquidezTotal, selectedMonth, 
  egresosMes, ingresos, egresos, presupuestos, pagosFijos, 
  ingresosFijos, cuentas 
}) => {
  const { useState, useMemo } = React;
  const [chartFilter, setChartFilter] = useState('Todos');
  const [expandedCard, setExpandedCard] = useState(null);
  
  const toggleCard = (cardId) => { 
    setExpandedCard(prev => prev === cardId ? null : cardId); 
  };

  // Identificador de dueños (Leo/Andre/Shared)
  const identifyOwner = (cuentaId, itemPersona, textDesc) => {
    if (itemPersona === 'L' || itemPersona === 'Leo') return 'Leo'; 
    if (itemPersona === 'A' || itemPersona === 'Andre') return 'Andre';
    
    let targetName = textDesc || ''; 
    if (cuentaId) { 
      const c = cuentas.find(acc => acc.id === cuentaId); 
      if (c) targetName = c.name; 
    }
    
    const t = targetName.toUpperCase();
    if (t.includes('LEO') || t.endsWith(' L')) return 'Leo'; 
    if (t.includes('ANDRE') || t.endsWith(' A')) return 'Andre'; 
    
    return 'Shared';
  };

  // Variables y cálculos
  const idsTarjetas = cuentas.filter(c => c.type === 'credit').map(c => c.id);
  const totalPresupuestadoFijo = pagosFijos ? pagosFijos.reduce((sum, item) => sum + item.monto, 0) : 0;
  const totalPresupuestadoVar = presupuestos ? presupuestos.reduce((sum, item) => sum + item.limite, 0) : 0;
  const presupuestoTotal = totalPresupuestadoFijo + totalPresupuestadoVar;

  const proyIngLeo = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyIngAndre = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyeccionIngresosMes = ingresosFijos ? ingresosFijos.reduce((sum, item) => sum + Number(item.monto), 0) : 0; 
  const totalProyeccionMes = proyeccionIngresosMes - presupuestoTotal;

  const ingLeo = ingresos.filter(i => i.fecha.startsWith(selectedMonth) && identifyOwner(i.cuentaId, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + i.monto, 0);
  const ingAndre = ingresos.filter(i => i.fecha.startsWith(selectedMonth) && identifyOwner(i.cuentaId, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + i.monto, 0);
  const egrLeo = egresosMes.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Leo').reduce((s, e) => s + e.monto, 0);
  const egrAndre = egresosMes.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Andre').reduce((s, e) => s + e.monto, 0);

  const gastadoFijoSinTC = egresosMes.filter(e => e.tipo === 'Fijo' && !idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);
  const gastadoVarSinTC = egresosMes.filter(e => e.tipo !== 'Fijo' && !idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);
  const pagosTC = egresosMes.filter(e => idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);

  // Cálculos para Gráficas
  const gastosFiltrados = chartFilter === 'Todos' ? egresosMes : egresosMes.filter(e => e.tipo === chartFilter);
  const gastosPorCategoria = {};
  
  gastosFiltrados.forEach(g => {
    const cat = g.categoria || 'Otros'; 
    const interes = g.interesesOtros || 0;
    if (g.monto - interes > 0) gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + (g.monto - interes);
    if (interes > 0) gastosPorCategoria['Intereses y Cargos'] = (gastosPorCategoria['Intereses y Cargos'] || 0) + interes;
  });
  
  const chartData = Object.entries(gastosPorCategoria).sort((a,b)=>b[1]-a[1]);
  const maxMonto = chartData.length > 0 ? chartData[0][1] : 1;

  // Cálculos de tendencia (6 meses)
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
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Inicio</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Estado de flujos reales para el mes actual.</p>
      </header>

      {/* Tarjetas de Resumen Numérico */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-5 border-t-4 border-t-emerald-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Ingresos Totales</h3>
          <p className="text-lg md:text-2xl font-bold text-emerald-400 mt-1">
            {formatCOP(ingresosMesTotal)}
          </p>
        </Card>
        
        <Card className="p-3 md:p-5 border-t-4 border-t-rose-500 cursor-pointer hover:bg-slate-800/30 transition-colors" onClick={() => toggleCard('egresos')}>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Egresos Totales</h3>
          <p className="text-lg md:text-2xl font-bold text-rose-400 mt-1">
            {formatCOP(egresosMesTotal)}
          </p>
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 ${ingresosMesTotal - egresosMesTotal >= 0 ? 'border-t-indigo-500' : 'border-t-rose-500'}`}>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Flujo Libre Real</h3>
          <p className={`text-lg md:text-2xl font-bold mt-1 ${ingresosMesTotal - egresosMesTotal >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
            {formatCOP(ingresosMesTotal - egresosMesTotal)}
          </p>
        </Card>
      </div>

      {/* Tarjeta de Consolidado y Realidad en Vivo */}
      <Card className="flex flex-col border-t-4 border-t-indigo-500 bg-slate-900/80">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-indigo-400" /> Resumen y Realidad (En Vivo)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800">
          
          {/* Finanzas Leo */}
          <div className="space-y-4 lg:border-r lg:border-slate-800 lg:pr-6">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">1. Finanzas Leo</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Ingresos</span>
              <span className="font-bold text-emerald-400">{formatCOP(ingLeo)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Egresos</span>
              <span className="font-bold text-rose-400">{formatCOP(egrLeo)}</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-slate-800 items-center">
              <span>Neto</span>
              <span className={ingLeo - egrLeo >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingLeo - egrLeo)}</span>
            </div>
          </div>
          
          {/* Finanzas Andre */}
          <div className="space-y-4 lg:border-r lg:border-slate-800 lg:pr-6">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-800 pb-2">2. Finanzas Andre</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Ingresos</span>
              <span className="font-bold text-emerald-400">{formatCOP(ingAndre)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Egresos</span>
              <span className="font-bold text-rose-400">{formatCOP(egrAndre)}</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-slate-800 items-center">
              <span>Neto</span>
              <span className={ingAndre - egrAndre >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingAndre - egrAndre)}</span>
            </div>
          </div>
          
          {/* Consolidado Hogar */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">3. Consolidado Hogar</h3>
            <div className="flex justify-between items-center text-sm">
              <span>Fijos (Sin TC)</span>
              <span className="font-bold text-rose-400">{formatCOP(gastadoFijoSinTC)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Variables</span>
              <span className="font-bold text-rose-400">{formatCOP(gastadoVarSinTC)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Pagos TC</span>
              <span className="font-bold text-rose-400">{formatCOP(pagosTC)}</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-slate-800 items-center">
              <span>TOTAL REAL</span>
              <span className={ingresosMesTotal - egresosMesTotal >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingresosMesTotal - egresosMesTotal)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Gráficas: Tendencia e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica de Tendencia de 6 Meses */}
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart size={18} className="text-emerald-400" /> Tendencia Histórica (6 Meses)
          </h2>
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

        {/* Gráfica de Distribución de Egresos */}
        <Card className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-400" /> Distribución de Egresos
            </h2>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs font-medium w-full md:w-auto">
              <button onClick={()=>setChartFilter('Todos')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Todos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
              <button onClick={()=>setChartFilter('Fijo')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Fijo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Fijos</button>
              <button onClick={()=>setChartFilter('Variable')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Variable' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Variables</button>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {chartData.length === 0 && <p className="text-sm text-slate-500 text-center py-10">No hay egresos registrados.</p>}
            
            {chartData.map(([name, amount]) => {
              const width = Math.max((amount / maxMonto) * 100, 2);
              const pres = presupuestos.find(p => p.categoria === name);
              
              let barColorClass = 'bg-indigo-500';
              if (name === 'Intereses y Cargos') barColorClass = 'bg-amber-500';
              else if (pres && pres.limite > 0) {
                 const pct = (amount / pres.limite) * 100;
                 if (pct >= 100) barColorClass = 'bg-rose-500';
                 else if (pct >= 80) barColorClass = 'bg-amber-500';
                 else barColorClass = 'bg-emerald-500';
              } else if (chartFilter === 'Fijo') {
                 barColorClass = 'bg-amber-500';
              }

              return (
                <div key={name} className="relative group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium truncate pr-4">{name}</span>
                    <span className={`font-bold ${name === 'Intereses y Cargos' ? 'text-amber-400' : 'text-slate-200'}`}>
                      {formatCOP(amount)}
                    </span>
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
