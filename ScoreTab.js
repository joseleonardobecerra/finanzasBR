const ScoreTab = ({ scoreData, scoreHistory, selectedMonth, presupuestos, egresosMes, cuentas, ingresosMesTotal, egresosMesTotal, cuotasMesTotal, pagosFijos }) => {
  const { score, recs } = scoreData;

  // LÓGICA DE ESTRATEGIA UNIFICADA
  const deudasActivas = cuentas.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0).sort((a,b) => b.tasaEA - a.tasaEA);
  const focoAvalancha = deudasActivas.length > 0 ? deudasActivas[0] : null;

  const metaInversion = pagosFijos ? pagosFijos.filter(pf => pf.categoria === 'Inversión' || pf.descripcion.toLowerCase().includes('ahorro')).reduce((s, pf) => s + pf.monto, 0) : 0;
  const invertidoActual = egresosMes.filter(e => e.categoria === 'Inversión' || e.descripcion.toLowerCase().includes('ahorro')).reduce((s, e) => s + e.monto, 0);
  const progresoInversion = metaInversion > 0 ? Math.min((invertidoActual / metaInversion) * 100, 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header><h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2"><Activity className="text-indigo-400 w-8 h-8"/> Score Familia y Estrategia</h1><p className="text-sm text-slate-400 mt-1">Diagnóstico, planes de ahorro y prioridades de pago unificados.</p></header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Card className="flex flex-col items-center justify-center py-10 bg-slate-900/50"><div className={`text-7xl font-black font-mono ${score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>{score}</div><p className="font-bold text-white uppercase text-xs mt-2 tracking-widest">Salud Financiera</p><div className="w-full max-w-[150px] bg-slate-800 h-2 rounded-full mt-6"><div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{width: `${score}%`}}></div></div></Card>
          
          <Card className="border-t-4 border-t-rose-500">
             <h3 className="text-xs font-bold text-rose-500 uppercase mb-3 flex items-center gap-2"><ShieldAlert size={14}/> Foco Avalancha</h3>
             {focoAvalancha ? (<div><p className="font-bold text-white">{focoAvalancha.name}</p><p className="text-xl font-black text-rose-400">{formatCOP(focoAvalancha.currentDebt)}</p><p className="text-[10px] text-slate-500 mt-1 uppercase">Prioridad #1 de abono extra</p></div>) : <p className="text-xs text-slate-500">Sin deudas activas.</p>}
          </Card>

          <Card className="border-t-4 border-t-emerald-500">
             <h3 className="text-xs font-bold text-emerald-500 uppercase mb-3 flex items-center gap-2"><PiggyBank size={14}/> Meta de Ahorro / Mes</h3>
             <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>{progresoInversion.toFixed(0)}% Logrado</span><span>{formatCOP(invertidoActual)} / {formatCOP(metaInversion)}</span></div>
             <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700"><div className="bg-emerald-500 h-full transition-all duration-1000" style={{width: `${progresoInversion}%`}}></div></div>
          </Card>
        </div>

        <div className="lg:col-span-8"><Card className="h-full border-t-4 border-t-amber-500"><h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-amber-400"/> Plan de Acción Sugerido</h2><div className="space-y-3">{recs.map((r, i) => (<div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-4"><div className="text-2xl">{r.ico}</div><div><h4 className="font-bold text-slate-200">{r.title}</h4><p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.txt}</p></div></div>))}</div></Card></div>
      </div>

      <Card className="border-t-4 border-t-indigo-500">
        <h2 className="text-lg font-bold text-white mb-4">Estrategia Avalancha: Tabla de Prioridades</h2>
        <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
          <table className="w-full text-sm text-left"><thead className="text-[10px] text-slate-500 uppercase bg-slate-900/50"><tr><th className="px-4 py-4">Prio</th><th className="px-4 py-4">Obligación</th><th className="px-4 py-4 text-right">Saldo Deuda</th><th className="px-4 py-4 text-center">Tasa E.A.</th><th className="px-4 py-4">Acción</th></tr></thead><tbody className="divide-y divide-slate-800/50">
            {deudasActivas.map((d, i) => (
              <tr key={d.id} className={i === 0 ? 'bg-indigo-600/5' : ''}>
                <td className="px-4 py-4"><span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i===0?'bg-indigo-600 text-white':'bg-slate-800 text-slate-400'}`}>{i+1}</span></td>
                <td className="px-4 py-4 font-bold text-slate-200">{d.name}</td>
                <td className="px-4 py-4 text-right text-rose-400 font-bold">{formatCOP(d.currentDebt)}</td>
                <td className="px-4 py-4 text-center text-amber-500 font-bold">{d.tasaEA}%</td>
                <td className="px-4 py-4 text-xs">{i === 0 ? <span className="text-indigo-400 font-black tracking-wider">🔥 ABONAR TODO EXTRA AQUÍ</span> : <span className="text-slate-500">Pagar cuota mínima</span>}</td>
              </tr>
            ))}
            {deudasActivas.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-500">No tienes deudas activas. ¡Buen trabajo!</td></tr>}
          </tbody></table>
        </div>
      </Card>
    </div>
  );
};
