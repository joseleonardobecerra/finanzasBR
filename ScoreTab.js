const ScoreTab = ({ scoreData, scoreHistory, selectedMonth, presupuestos, egresosMes, cuentas, ingresosMesTotal, egresosMesTotal, cuotasMesTotal }) => {
      const { score, desglose, recs } = scoreData;

      const prevMonthDate = new Date(`${selectedMonth}-01T12:00:00`);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
      const prevScore = scoreHistory[prevMonthStr] || null;

      const scoreColor = score === 0 && desglose.length === 1 ? 'text-slate-500' : score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
      const scoreBg = score === 0 && desglose.length === 1 ? 'bg-slate-700' : score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

      const tasaAhorro = ingresosMesTotal > 0 ? ((ingresosMesTotal - egresosMesTotal - cuotasMesTotal) / ingresosMesTotal) * 100 : 0;
      const nivelEndeudamiento = ingresosMesTotal > 0 ? (cuotasMesTotal / ingresosMesTotal) * 100 : 0;
      
      const deudasPeligrosas = cuentas.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0 && c.tasaEA >= 25).sort((a,b) => b.tasaEA - a.tasaEA);
      
      const alertasPresupuesto = presupuestos.map(p => {
         const gastado = egresosMes.filter(e => e.categoria.toLowerCase() === p.categoria.toLowerCase() && e.tipo !== 'Fijo').reduce((s, e) => s + e.monto, 0);
         return { ...p, gastado, porcentaje: p.limite > 0 ? (gastado / p.limite) * 100 : 0 };
      }).filter(p => p.porcentaje >= 75).sort((a,b) => b.porcentaje - a.porcentaje);

      // Combinamos las recomendaciones del algoritmo principal con las alertas dinámicas de deudas/presupuestos
      const dynamicRecs = useMemo(() => {
        let items = [...recs];
        if (deudasPeligrosas.length > 0) {
            items.push({
                ico: <ShieldAlert size={24} className="text-rose-500" />,
                title: "Deuda de Alto Riesgo Detectada",
                txt: `Tu cuenta "${deudasPeligrosas[0].name}" tiene un interés muy alto (${deudasPeligrosas[0].tasaEA}% E.A.). Te recomendamos aplicar pagos extra urgentemente.`
            });
        }
        if (nivelEndeudamiento > 40) {
            items.push({
                ico: <AlertCircle size={24} className="text-amber-500" />,
                title: "Peligro de Sobreendeudamiento",
                txt: `Tus cuotas mensuales representan el ${nivelEndeudamiento.toFixed(1)}% de tus ingresos. El límite saludable es el 30-40%.`
            });
        }
        if (tasaAhorro < 10 && ingresosMesTotal > 0) {
            items.push({
                ico: <TrendingUp size={24} className="text-amber-500" />,
                title: "Impulsa tu Ahorro",
                txt: `Tu flujo de caja actual solo te permite ahorrar un ${tasaAhorro.toFixed(1)}%. Intenta aplicar la regla 50-30-20.`
            });
        }
        if (tasaAhorro >= 20) {
            items.push({
                ico: <PiggyBank size={24} className="text-emerald-500" />,
                title: "¡Excelente capacidad de ahorro!",
                txt: `Estás reteniendo un ${tasaAhorro.toFixed(1)}% de lo que ganas. Te sugerimos abrir la pestaña Simuladores y automatizar transferencias a inversión.`
            });
        }
        if (alertasPresupuesto.some(p => p.porcentaje >= 100)) {
            items.push({
                ico: <Target size={24} className="text-rose-500" />,
                title: "Presupuestos Rotos",
                txt: `Has excedido el límite en algunas categorías variables este mes. Revisa tus gastos impulsivos en la pestaña Presupuestos.`
            });
        }
        if (items.length === 0) {
            items.push({
                ico: <CheckCircle2 size={24} className="text-emerald-500" />,
                title: "Todo en orden",
                txt: "Tus indicadores principales son saludables. Mantén tus presupuestos al día y tus deudas controladas."
            });
        }
        return items;
      }, [deudasPeligrosas, nivelEndeudamiento, tasaAhorro, alertasPresupuesto, ingresosMesTotal, recs]);

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2"><Activity className="text-indigo-400 w-8 h-8"/> Score Familia</h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">Diagnóstico, alertas y el porqué de tu calificación financiera.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            <div className="lg:col-span-4 space-y-6">
              <Card className="flex flex-col items-center justify-center py-8 bg-slate-900/50 relative overflow-hidden">
                {prevScore !== null && score > 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                    {score > prevScore ? <span className="text-emerald-400 flex items-center gap-1"><ArrowUpRight size={14}/> +{score - prevScore} pts</span> :
                     score < prevScore ? <span className="text-rose-400 flex items-center gap-1"><ArrowDownRight size={14}/> {prevScore - score} pts</span> :
                     <span className="text-slate-400 flex items-center gap-1"><Minus size={14}/> = pts</span>}
                  </div>
                )}
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><Activity size={18} className="text-emerald-400"/> Salud Financiera</h2>
                <div className={`text-7xl font-black font-mono mt-2 ${scoreColor}`}>{score}</div>
                <p className={`font-bold mt-2 ${scoreColor}`}>
                  {score === 0 && desglose.length === 1 ? 'Faltan Datos' : score >= 80 ? 'Excelente Salud' : score >= 50 ? 'Requiere Atención' : 'Situación Crítica'}
                </p>
                <div className="w-full max-w-[200px] bg-slate-800 rounded-full h-2 mt-6">
                  <div className={`h-full rounded-full transition-all duration-1000 ${scoreBg}`} style={{width: `${score}%`}}></div>
                </div>
              </Card>

              {/* ✨ NUEVO: Explicación matemática del Score */}
              <Card className="border-t-4 border-t-indigo-500">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Info size={16} className="text-indigo-400"/> ¿Por qué este puntaje?</h3>
                <div className="space-y-3">
                  {desglose.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-300 pr-2">{item.text}</span>
                      <span className={`font-bold whitespace-nowrap ${item.type === 'success' ? 'text-emerald-400' : item.type === 'danger' ? 'text-rose-400' : item.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {item.pts > 0 ? `+${item.pts}` : item.pts < 0 ? `${item.pts}` : item.pts === 0 && item.type !== 'neutral' ? '0' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Tasa de Ahorro</p>
                    <p className={`text-2xl font-bold ${tasaAhorro >= 15 ? 'text-emerald-400' : tasaAhorro > 0 ? 'text-amber-400' : 'text-rose-400'}`}>{tasaAhorro.toFixed(1)}%</p>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Carga de Deuda</p>
                    <p className={`text-2xl font-bold ${nivelEndeudamiento <= 30 ? 'text-emerald-400' : nivelEndeudamiento <= 45 ? 'text-amber-400' : 'text-rose-400'}`}>{nivelEndeudamiento.toFixed(1)}%</p>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <Card className="h-full border-t-4 border-t-amber-500">
                <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-2"><Target size={18} className="text-amber-400"/> Plan de Acción Sugerido</h2>
                <div className="space-y-4">
                  {dynamicRecs.map((r, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex gap-4 items-start hover:border-slate-700 transition-colors">
                      <div className="mt-1 bg-slate-900 p-2 rounded-lg shadow-inner">{r.ico}</div>
                      <div><h3 className="font-bold text-sm text-slate-200">{r.title}</h3><p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.txt}</p></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      );
    };

