const AnaliticaTab = ({ ingresos, egresos, selectedMonth }) => {
  const { useMemo } = React;
  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // 1. GENERAR HISTORIAL DE LOS ÚLTIMOS 12 MESES
  const { historialMensual, totalIngresosAnual, totalEgresosAnual } = useMemo(() => {
    const meses = [];
    const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);
    let sumIng = 0; let sumEgr = 0;
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(fechaBase);
      d.setMonth(d.getMonth() - i);
      const mesStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }).replace(/^\w/, c => c.toUpperCase());
      
      const ingMes = ingresos.filter(i => i.fecha.startsWith(mesStr)).reduce((s, i) => s + Number(i.monto), 0);
      const egrMes = egresos.filter(e => e.fecha.startsWith(mesStr)).reduce((s, e) => s + Number(e.monto), 0);
      const neto = ingMes - egrMes;
      const tasaAhorro = ingMes > 0 ? (neto > 0 ? (neto / ingMes) * 100 : 0) : 0;
      
      sumIng += ingMes; sumEgr += egrMes;
      meses.push({ mesStr, label, ingresos: ingMes, egresos: egrMes, neto, tasaAhorro });
    }
    return { historialMensual: meses, totalIngresosAnual: sumIng, totalEgresosAnual: sumEgr };
  }, [ingresos, egresos, selectedMonth]);

  // 2. CÁLCULOS AVANZADOS (KPIs y Top Categorías)
  const promedios = {
      ingreso: totalIngresosAnual / 12,
      egreso: totalEgresosAnual / 12,
      neto: (totalIngresosAnual - totalEgresosAnual) / 12,
      tasaAhorro: totalIngresosAnual > 0 ? ((totalIngresosAnual - totalEgresosAnual) / totalIngresosAnual) * 100 : 0
  };

  const { mejorMes, peorMes } = useMemo(() => {
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
      const hace12MesesStr = fechaBase.toISOString().slice(0, 7);

      const gastos12m = egresos.filter(e => e.fecha >= hace12MesesStr);
      const catMap = {};
      gastos12m.forEach(g => {
          const c = g.categoria || 'Otros';
          catMap[c] = (catMap[c] || 0) + Number(g.monto);
      });
      return Object.entries(catMap).sort((a,b) => b[1] - a[1]).slice(0, 5); // Top 5
  }, [egresos, selectedMonth]);

  const maxValHist = Math.max(...historialMensual.map(m => Math.max(m.ingresos, m.egresos)), 1);
  const maxValCat = topCategoriasAnual.length > 0 ? topCategoriasAnual[0][1] : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart className="text-indigo-400 w-8 h-8"/> Analítica y Trazabilidad
        </h1>
        <p className="text-sm text-slate-400 mt-1">Análisis macro de tus finanzas durante los últimos 12 meses.</p>
      </header>

      {/* ✨ 1. TARJETAS DE KPIs (Métricas Clave) */}
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

      {/* ✨ 2. GRÁFICA PRINCIPAL: HISTÓRICO DE FLUJO */}
      <Card className="border-t-4 border-t-indigo-500">
        <h2 className="text-lg font-bold text-white mb-6">Comparativo Histórico: Ingresos vs Egresos</h2>
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

      {/* ✨ 3. SECCIÓN DE PROFUNDIDAD: FUGAS Y EXTREMOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Gastos Históricos */}
        <Card className="flex flex-col border-t-4 border-t-amber-500">
          <h2 className="text-lg font-bold text-white mb-2">Top 5 Fugas de Capital (12 Meses)</h2>
          <p className="text-[10px] text-slate-400 mb-6">Descubre en qué categorías se te ha ido más dinero en el último año.</p>
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
        <Card className="flex flex-col border-t-4 border-t-indigo-500">
          <h2 className="text-lg font-bold text-white mb-6">Extremos e Insights</h2>
          <div className="flex-1 flex flex-col justify-center gap-6">
             
             {/* Mejor Mes */}
             <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Tu Mejor Mes ({mejorMes?.label})</p>
                   <p className="text-xl font-black text-emerald-400">{formatCOP(mejorMes?.neto)}</p>
                   <p className="text-[10px] text-slate-400 mt-1">Retuviste el {mejorMes?.tasaAhorro.toFixed(1)}% de tus ingresos.</p>
                </div>
             </div>

             {/* Peor Mes */}
             <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-full shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-1">Mes de Mayor Déficit ({peorMes?.label})</p>
                   <p className="text-xl font-black text-rose-400">{formatCOP(peorMes?.neto)}</p>
                   <p className="text-[10px] text-slate-400 mt-1">Gastaste {formatCOP(peorMes?.egresos)} frente a ingresos de {formatCOP(peorMes?.ingresos)}.</p>
                </div>
             </div>

             <div className="mt-2 text-center text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                💡 <strong>Análisis:</strong> Tienes una diferencia de <strong className="text-indigo-400">{formatCOP((mejorMes?.neto || 0) - (peorMes?.neto || 0))}</strong> entre tu mejor y peor momento. Identificar qué hiciste diferente en {mejorMes?.label} es clave para mejorar tu Score.
             </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
