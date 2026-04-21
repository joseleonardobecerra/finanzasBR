const ScoreTab = ({ scoreData, scoreHistory, selectedMonth, presupuestos, egresosMes, cuentas, ingresosMesTotal, egresosMesTotal, cuotasMesTotal, pagosFijos }) => {
      const { useState, useMemo } = React;
      const { score, desglose, recs } = scoreData;

      // 1. HISTÓRICO DE SCORE
      const prevMonthDate = new Date(`${selectedMonth}-01T12:00:00`);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
      const prevScore = scoreHistory[prevMonthStr] || null;

      const scoreColor = score === 0 && desglose.length === 1 ? 'text-slate-500' : score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
      const scoreBg = score === 0 && desglose.length === 1 ? 'bg-slate-700' : score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

      // 2. INDICADORES FINANCIEROS
      const tasaAhorro = ingresosMesTotal > 0 ? ((ingresosMesTotal - egresosMesTotal - cuotasMesTotal) / ingresosMesTotal) * 100 : 0;
      const nivelEndeudamiento = ingresosMesTotal > 0 ? (cuotasMesTotal / ingresosMesTotal) * 100 : 0;
      
      // 3. ALERTAS DINÁMICAS (Lógica original conservada)
      const deudasPeligrosas = cuentas.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0 && c.tasaEA >= 25).sort((a,b) => b.tasaEA - a.tasaEA);
      
      const alertasPresupuesto = presupuestos.map(p => {
         const gastado = egresosMes.filter(e => e.categoria.toLowerCase() === p.categoria.toLowerCase() && e.tipo !== 'Fijo').reduce((s, e) => s + e.monto, 0);
         return { ...p, gastado, porcentaje: p.limite > 0 ? (gastado / p.limite) * 100 : 0 };
      }).filter(p => p.porcentaje >= 75).sort((a,b) => b.porcentaje - a.porcentaje);

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

      // 4. LÓGICA UNIFICADA: ESTRATEGIA AVALANCHA E INVERSIÓN
      const deudasActivas = cuentas.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0).sort((a,b) => b.tasaEA - a.tasaEA);
      const focoAvalancha = deudasActivas.length > 0 ? deudasActivas[0] : null;

      // FIX: null-safety en descripcion para evitar crash si el campo está vacío
      const metaInversion = pagosFijos ? pagosFijos.filter(pf => pf.categoria === 'Inversión' || (pf.descripcion && pf.descripcion.toLowerCase().includes('ahorro'))).reduce((s, pf) => s + pf.monto, 0) : 0;
      const invertidoActual = egresosMes.filter(e => e.categoria === 'Inversión' || (e.descripcion && e.descripcion.toLowerCase().includes('ahorro'))).reduce((s, e) => s + e.monto, 0);
      const progresoInversion = metaInversion > 0 ? Math.min((invertidoActual / metaInversion) * 100, 100) : 0;

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2"><Activity className="text-indigo-400 w-8 h-8"/> Score Familia y Estrategia</h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">Diagnóstico, planes de ahorro y prioridades de pago unificados.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Tarjeta de Score con Histórico */}
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

              {/* Foco Avalancha */}
              <Card className="border-t-4 border-t-rose-500">
                 <h3 className="text-xs font-bold text-rose-500 uppercase mb-3 flex items-center gap-2"><ShieldAlert size={14}/> Foco Avalancha</h3>
                 {focoAvalancha ? (
                   <div>
                     <p className="font-bold text-white">{focoAvalancha.name}</p>
                     <p className="text-xl font-black text-rose-400">{formatCOP(focoAvalancha.currentDebt)}</p>
                     <p className="text-[10px] text-slate-500 mt-1 uppercase">Prioridad #1 de abono extra</p>
                   </div>
                 ) : <p className="text-xs text-slate-500">Sin deudas activas.</p>}
              </Card>

              {/* Meta de Ahorro / Inversión */}
              <Card className="border-t-4 border-t-emerald-500">
                 <h3 className="text-xs font-bold text-emerald-500 uppercase mb-3 flex items-center gap-2"><PiggyBank size={14}/> Meta de Ahorro / Mes</h3>
                 <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{progresoInversion.toFixed(0)}% Logrado</span>
                    <span>{formatCOP(invertidoActual)} / {formatCOP(metaInversion)}</span>
                 </div>
                 <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div className="bg-emerald-500 h-full transition-all duration-1000" style={{width: `${progresoInversion}%`}}></div>
                 </div>
              </Card>

              {/* Desglose Matemático del Score */}
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

              {/* Indicadores Tasa de Ahorro y Deuda */}
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

            {/* --- COLUMNA DERECHA --- */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Plan de Acción Sugerido */}
              <Card className="border-t-4 border-t-amber-500">
                <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-2"><Target size={18} className="text-amber-400"/> Plan de Acción Sugerido</h2>
                <div className="space-y-4">
                  {dynamicRecs.map((r, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex gap-4 items-start hover:border-slate-700 transition-colors">
                      <div className="mt-1 bg-slate-900 p-2 rounded-lg shadow-inner">{r.ico}</div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-200">{r.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.txt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tabla de Estrategia Avalancha */}
              <Card className="border-t-4 border-t-indigo-500">
                <h2 className="text-lg font-bold text-white mb-4">Estrategia Avalancha: Orden de Pago</h2>
                <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-4">Prio</th>
                        <th className="px-4 py-4">Obligación</th>
                        <th className="px-4 py-4 text-right">Saldo Deuda</th>
                        <th className="px-4 py-4 text-center">Tasa E.A.</th>
                        <th className="px-4 py-4">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {deudasActivas.map((d, i) => (
                        <tr key={d.id} className={i === 0 ? 'bg-indigo-600/5' : ''}>
                          <td className="px-4 py-4">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i===0?'bg-indigo-600 text-white':'bg-slate-800 text-slate-400'}`}>
                              {i+1}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-200">{d.name}</td>
                          <td className="px-4 py-4 text-right text-rose-400 font-bold">{formatCOP(d.currentDebt)}</td>
                          <td className="px-4 py-4 text-center text-amber-500 font-bold">{d.tasaEA}%</td>
                          <td className="px-4 py-4 text-xs">
                            {i === 0 ? 
                              <span className="text-indigo-400 font-black tracking-wider">🔥 ABONAR TODO EXTRA AQUÍ</span> : 
                              <span className="text-slate-500">Pagar cuota mínima</span>
                            }
                          </td>
                        </tr>
                      ))}
                      {deudasActivas.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-8 text-slate-500">No tienes deudas activas. ¡Buen trabajo!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          </div>
        </div>
      );
    };
