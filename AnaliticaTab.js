const AnaliticaTab = ({ ingresos, egresos, selectedMonth }) => {
  const { useMemo } = React;
  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // ✨ EL DÍA CERO DE LA APLICACIÓN
  const FECHA_INICIO_APP = "2026-04";

  // 1. GENERAR HISTORIAL (SOLO DESDE ABRIL 2026) Y ESTRUCTURA DE COSTOS
  const { historialMensual, totalIngresosAnual, totalEgresosAnual, totalFijosAnual, totalVariablesAnual, mesesValidos } = useMemo(() => {
    const meses = [];
    const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);
    let sumIng = 0; let sumEgr = 0;
    let sumFijos = 0; let sumVar = 0;
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(fechaBase);
      d.setMonth(d.getMonth() - i);
      const mesStr = d.toISOString().slice(0, 7);
      
      // Filtro estricto: Omitir cualquier mes antes de Abril 2026
      if (mesStr < FECHA_INICIO_APP) continue;
      
      const label = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }).replace(/^\w/, c => c.toUpperCase());
      
      const ingMes = ingresos.filter(i => i.fecha.startsWith(mesStr)).reduce((s, i) => s + Number(i.monto), 0);
      
      const egresosMesFiltrados = egresos.filter(e => e.fecha.startsWith(mesStr));
      const egrMes = egresosMesFiltrados.reduce((s, e) => s + Number(e.monto), 0);
      
      const fijosMes = egresosMesFiltrados.filter(e => e.tipo === 'Fijo').reduce((s, e) => s + Number(e.monto), 0);
      const varMes = egresosMesFiltrados.filter(e => e.tipo !== 'Fijo').reduce((s, e) => s + Number(e.monto), 0);
      
      const neto = ingMes - egrMes;
      const tasaAhorro = ingMes > 0 ? (neto > 0 ? (neto / ingMes) * 100 : 0) : 0;
      
      sumIng += ingMes; sumEgr += egrMes;
      sumFijos += fijosMes; sumVar += varMes;
      
      meses.push({ mesStr, label, ingresos: ingMes, egresos: egrMes, neto, tasaAhorro });
    }
    return { 
      historialMensual: meses, 
      totalIngresosAnual: sumIng, 
      totalEgresosAnual: sumEgr,
      totalFijosAnual: sumFijos,
      totalVariablesAnual: sumVar,
      mesesValidos: Math.max(1, meses.length) // Para que los promedios sean exactos
    };
  }, [ingresos, egresos, selectedMonth]);

  // 2. CÁLCULOS AVANZADOS REALES (Usando solo los meses que llevan usando la app)
  const promedios = {
      ingreso: totalIngresosAnual / mesesValidos,
      egreso: totalEgresosAnual / mesesValidos,
      neto: (totalIngresosAnual - totalEgresosAnual) / mesesValidos,
      tasaAhorro: totalIngresosAnual > 0 ? ((totalIngresosAnual - totalEgresosAnual) / totalIngresosAnual) * 100 : 0
  };

  const pctFijos = totalEgresosAnual > 0 ? (totalFijosAnual / totalEgresosAnual) * 100 : 0;
  const pctVariables = totalEgresosAnual > 0 ? (totalVariablesAnual / totalEgresosAnual) * 100 : 0;

  const { mejorMes, peorMes } = useMemo(() => {
      if (historialMensual.length === 0) return { mejorMes: null, peorMes: null };
      let mejor = historialMensual[0]; let peor = historialMensual[0];
      historialMensual.forEach(m => {
          if (m.neto > mejor.neto) mejor = m;
          if (m.neto < peor.neto) peor = m;
      });
      return { mejorMes: mejor, peorMes: peor };
  }, [historialMensual]);

  const topCategoriasAnual = useMemo(() => {
      const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);
      fechaBase.setMonth(fechaBase.getMonth() - 11);
      let hace12MesesStr = fechaBase.toISOString().slice(0, 7);
      
      // Tampoco buscar categorías antes de la fecha de inicio
      if (hace12MesesStr < FECHA_INICIO_APP) hace12MesesStr = FECHA_INICIO_APP;

      const gastos12m = egresos.filter(e => e.fecha >= hace12MesesStr);
      const catMap = {};
      gastos12m.forEach(g => {
          const c = g.categoria || 'Otros';
          catMap[c] = (catMap[c] || 0) + Number(g.monto);
      });
      return Object.entries(catMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [egresos, selectedMonth]);

  const maxNetoAbs = Math.max(...historialMensual.map(m => Math.abs(m.neto)), 1);
  const maxValCat = topCategoriasAnual.length > 0 ? topCategoriasAnual[0][1] : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart className="text-indigo-400 w-8 h-8"/> Analítica y Trazabilidad
        </h1>
        <p className="text-sm text-slate-400 mt-1">Análisis macro de tus finanzas (Datos medidos desde Abril 2026).</p>
      </header>

      {/* TARJETAS DE KPIs (Métricas Clave Ajustadas) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 border-t-4 border-t-emerald-500">
          <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold mb-1">Ingreso Promedio (Mes)</p>
          <p className="text-lg md:text-xl font-bold text-emerald-400">{formatCOP(promedios.ingreso)}</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-rose-500">
          <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold mb-1">Egreso Promedio (Mes)</p>
          <p className="text-lg md:text-xl font-bold text-rose-400">{formatCOP(promedios.egreso)}</p>
        </Card>
        <Card className={`p-4 border-t-4 ${promedios.neto >= 0 ? 'border-t-indigo-500' : 'border-t-amber-500'}`}>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold mb-1">Ahorro Promedio (Mes)</p>
          <p className={`text-lg md:text-xl font-bold ${promedios.neto >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>{formatCOP(promedios.neto)}</p>
        </Card>
        <Card className={`p-4 border-t-4 ${promedios.tasaAhorro >= 20 ? 'border-t-emerald-500' : promedios.tasaAhorro >= 10 ? 'border-t-indigo-500' : 'border-t-rose-500'}`}>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold mb-1">Tasa Retención (Global)</p>
          <p className="text-lg md:text-xl font-bold text-white">{promedios.tasaAhorro.toFixed(1)}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Capacidad de Ahorro */}
        <Card className="lg:col-span-2 border-t-4 border-t-indigo-500 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-2">Evolución de Capacidad de Ahorro (Flujo Libre)</h2>
          <p className="text-[10px] text-slate-400 mb-4">Diferencia exacta entre lo que ganaste y gastaste desde el inicio.</p>
          
          <div className="flex-1 flex items-end justify-center gap-4 md:gap-8 border-b border-slate-800 pb-2 relative h-56 mt-4">
            {historialMensual.map((m, i) => {
              const heightPct = Math.max((Math.abs(m.neto) / maxNetoAbs) * 100, 2);
              const isPos = m.neto >= 0;
              
              return (
                <div key={i} className="flex flex-col items-center group relative h-full justify-end">
                  <div 
                    style={{ height: `${heightPct}%` }} 
                    className={`w-6 md:w-10 rounded-t-sm transition-all duration-500 ${isPos ? 'bg-emerald-500/80 group-hover:bg-emerald-400' : 'bg-rose-500/80 group-hover:bg-rose-400'}`}>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-slate-500 mt-2 font-bold uppercase">{m.label}</span>
                  
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-24 bg-slate-950 border border-slate-700 p-3 rounded shadow-2xl z-20 pointer-events-none transition-opacity text-[10px] min-w-[140px]">
                    <p className="text-slate-300 font-bold uppercase mb-2 border-b border-slate-800 pb-1">{m.label}</p>
                    <div className="flex justify-between mb-1"><span className="text-emerald-400">Ingresos:</span> <span className="text-white font-bold">{formatCOP(m.ingresos)}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-rose-400">Egresos:</span> <span className="text-white font-bold">{formatCOP(m.egresos)}</span></div>
                    <div className="border-t border-slate-800 my-1.5"></div>
                    <div className="flex justify-between font-black text-xs"><span className={isPos ? 'text-emerald-400' : 'text-rose-500'}>{isPos ? 'Ahorro:' : 'Déficit:'}</span> <span className={isPos ? 'text-emerald-400' : 'text-rose-500'}>{formatCOP(Math.abs(m.neto))}</span></div>
                  </div>
                </div>
              );
            })}
            {historialMensual.length === 0 && <div className="text-slate-500 text-sm flex items-center h-full">No hay datos desde Abril 2026.</div>}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold uppercase tracking-wider">
             <span className="flex items-center gap-2 text-emerald-400"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Superávit (Ahorro)</span>
             <span className="flex items-center gap-2 text-rose-400"><div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div> Déficit (Pérdida)</span>
          </div>
        </Card>

        {/* Estructura del Gasto */}
        <Card className="border-t-4 border-t-slate-500 flex flex-col justify-between">
          <div>
             <h2 className="text-lg font-bold text-white mb-2">Estructura del Gasto</h2>
             <p className="text-[10px] text-slate-400 mb-6">Promedio basado en tu historial desde Abril 2026.</p>
          </div>
          
          <div className="flex flex-col gap-6 mb-4">
             <div>
                <div className="flex justify-between text-sm mb-1.5">
                   <span className="text-slate-300 font-bold">Gastos Fijos</span>
                   <span className="text-orange-400 font-bold">{pctFijos.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-4 border border-slate-800 overflow-hidden shadow-inner">
                   <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{width: `${pctFijos}%`}}></div>
                </div>
                <p className="text-[10px] text-slate-500 text-right mt-1 font-medium">{formatCOP(totalFijosAnual)} gastados</p>
             </div>
             
             <div>
                <div className="flex justify-between text-sm mb-1.5">
                   <span className="text-slate-300 font-bold">Gastos Variables</span>
                   <span className="text-blue-400 font-bold">{pctVariables.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-4 border border-slate-800 overflow-hidden shadow-inner">
                   <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${pctVariables}%`}}></div>
                </div>
                <p className="text-[10px] text-slate-500 text-right mt-1 font-medium">{formatCOP(totalVariablesAnual)} gastados</p>
             </div>
          </div>
          
          <div className="text-center text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
             💡 <strong>Regla saludable:</strong> Se recomienda que tus gastos fijos (Naranja) no superen el <strong className="text-orange-400">50%</strong> de tus ingresos totales.
          </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Gastos Históricos */}
        <Card className="flex flex-col border-t-4 border-t-amber-500">
          <h2 className="text-lg font-bold text-white mb-2">Top 5 Fugas de Capital</h2>
          <p className="text-[10px] text-slate-400 mb-6">Categorías donde se te ha ido más dinero desde el inicio.</p>
          <div className="flex-1 space-y-5">
            {topCategoriasAnual.map(([cat, amount], i) => {
              const width = Math.max((amount / maxValCat) * 100, 5);
              return (
                <div key={cat} className="relative">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-bold flex items-center gap-2">
                       <span className="text-amber-500/50">#{i+1}</span> {cat}
                    </span>
                    <span className="font-bold text-amber-400">{formatCOP(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              );
            })}
            {topCategoriasAnual.length === 0 && <p className="text-slate-500 text-sm py-4 text-center">No hay datos suficientes.</p>}
          </div>
        </Card>

        {/* Extremos e Insights */}
        <Card className="flex flex-col border-t-4 border-t-rose-500">
          <h2 className="text-lg font-bold text-white mb-6">Extremos e Insights</h2>
          <div className="flex-1 flex flex-col justify-center gap-6">
             
             {mejorMes && (
               <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full shrink-0">
                    <TrendingUp size={24} />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Tu Mejor Mes ({mejorMes.label})</p>
                     <p className="text-xl font-black text-emerald-400">{formatCOP(mejorMes.neto)}</p>
                     <p className="text-[10px] text-slate-400 mt-1">Retuviste el {mejorMes.tasaAhorro.toFixed(1)}% de tus ingresos.</p>
                  </div>
               </div>
             )}

             {peorMes && (
               <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-1">Mes de Mayor Déficit ({peorMes.label})</p>
                     <p className="text-xl font-black text-rose-400">{formatCOP(peorMes.neto)}</p>
                     <p className="text-[10px] text-slate-400 mt-1">Gastaste {formatCOP(peorMes.egresos)} frente a ingresos de {formatCOP(peorMes.ingresos)}.</p>
                  </div>
               </div>
             )}

             {mejorMes && peorMes && (
               <div className="mt-2 text-center text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                  💡 <strong>Análisis:</strong> Tienes una diferencia de <strong className="text-indigo-400">{formatCOP((mejorMes.neto || 0) - (peorMes.neto || 0))}</strong> entre tu mejor y peor momento. Identificar qué hiciste diferente en {mejorMes.label} es clave para acelerar tu crecimiento.
               </div>
             )}
          </div>
        </Card>

      </div>
    </div>
  );
};
