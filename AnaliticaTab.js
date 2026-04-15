const AnaliticaTab = ({ ingresos, egresos, cuentas, selectedMonth }) => {
  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // 1. Generar historial de los últimos 12 meses
  const historialMensual = useMemo(() => {
    const meses = [];
    const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(fechaBase);
      d.setMonth(d.getMonth() - i);
      const mesStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }).replace(/^\w/, c => c.toUpperCase());
      
      const ingMes = ingresos.filter(i => i.fecha.startsWith(mesStr)).reduce((s, i) => s + i.monto, 0);
      const egrMes = egresos.filter(e => e.fecha.startsWith(mesStr)).reduce((s, e) => s + e.monto, 0);
      
      meses.push({ mesStr, label, ingresos: ingMes, egresos: egrMes, neto: ingMes - egrMes });
    }
    return meses;
  }, [ingresos, egresos, selectedMonth]);

  const maxVal = Math.max(...historialMensual.map(m => Math.max(m.ingresos, m.egresos)), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart className="text-indigo-400 w-8 h-8"/> Analítica y Trazabilidad
        </h1>
        <p className="text-sm text-slate-400 mt-1">Análisis comparativo de tu comportamiento financiero en el tiempo.</p>
      </header>

      <Card className="border-t-4 border-t-indigo-500">
        <h2 className="text-lg font-bold text-white mb-6">Comparativo Ingresos vs Egresos (12 Meses)</h2>
        <div className="h-64 flex items-end justify-between gap-1 md:gap-4 border-b border-slate-800 pb-2">
          {historialMensual.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div className="flex gap-0.5 md:gap-1 w-full justify-center items-end h-full">
                <div style={{ height: `${(m.ingresos / maxVal) * 100}%` }} className="w-2 md:w-4 bg-emerald-500/80 rounded-t-sm group-hover:bg-emerald-400 transition-all"></div>
                <div style={{ height: `${(m.egresos / maxVal) * 100}%` }} className="w-2 md:w-4 bg-rose-500/80 rounded-t-sm group-hover:bg-rose-400 transition-all"></div>
              </div>
              <span className="text-[9px] md:text-[10px] text-slate-500 mt-2 font-bold uppercase">{m.label}</span>
              
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-20 bg-slate-950 border border-slate-700 p-2 rounded shadow-xl z-20 pointer-events-none transition-opacity text-[10px] min-w-[120px]">
                <p className="text-emerald-400 font-bold">Ing: {formatCOP(m.ingresos)}</p>
                <p className="text-rose-400 font-bold">Egr: {formatCOP(m.egresos)}</p>
                <div className="border-t border-slate-800 my-1"></div>
                <p className={`font-black ${m.neto >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>Neto: {formatCOP(m.neto)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-6 text-xs font-bold uppercase tracking-wider">
           <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Ingresos</span>
           <span className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Egresos</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-emerald-500">
          <h2 className="text-lg font-bold text-white mb-4">Resumen de Trazabilidad</h2>
          <div className="space-y-4">
             {historialMensual.slice(-6).reverse().map((m, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm font-bold text-slate-300">{m.label}</span>
                  <div className="text-right">
                    <p className={`text-sm font-black ${m.neto >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{formatCOP(m.neto)}</p>
                    <p className="text-[10px] text-slate-500">Flujo Neto</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>

        <Card className="border-t-4 border-t-rose-500">
          <h2 className="text-lg font-bold text-white mb-4">Promedios Mensuales</h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Ingreso Promedio (12m)</p>
              <p className="text-2xl font-black text-emerald-400">{formatCOP(historialMensual.reduce((s,m)=>s+m.ingresos,0)/12)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Egreso Promedio (12m)</p>
              <p className="text-2xl font-black text-rose-400">{formatCOP(historialMensual.reduce((s,m)=>s+m.egresos,0)/12)}</p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Capacidad de Ahorro Real</p>
              <p className="text-2xl font-black text-indigo-400">{formatCOP(historialMensual.reduce((s,m)=>s+m.neto,0)/12)} / mes</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};