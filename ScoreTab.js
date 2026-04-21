const ScoreTab = ({ scoreData, scoreHistory, selectedMonth, presupuestos, egresosMes, cuentas, ingresosMesTotal, egresosMesTotal, cuotasMesTotal, pagosFijos }) => {
      const { useState, useMemo } = React;
      const { score, desglose, recs } = scoreData;

      // 1. HISTÓRICO DE SCORE
      const prevMonthDate = new Date(`${selectedMonth}-01T12:00:00`);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
      const prevScore = scoreHistory[prevMonthStr] || null;

      // Adaptación de colores al nuevo tema Neón
      const scoreColor = score === 0 && desglose.length === 1 ? 'text-[#8A92A6]' : score >= 80 ? 'text-neoncyan drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]' : score >= 50 ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-neonmagenta drop-shadow-[0_0_15px_rgba(255,0,122,0.5)]';
      const scoreBg = score === 0 && desglose.length === 1 ? 'bg-[#1c1e32]' : score >= 80 ? 'bg-neoncyan shadow-glow-cyan' : score >= 50 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-neonmagenta shadow-glow-magenta';

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
                ico: <ShieldAlert size={24} className="text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.5)]" />,
                title: "Deuda de Alto Riesgo Detectada",
                txt: `Tu cuenta "${deudasPeligrosas[0].name}" tiene un interés muy alto (${deudasPeligrosas[0].tasaEA}% E.A.). Te recomendamos aplicar pagos extra urgentemente.`
            });
        }
        if (nivelEndeudamiento > 40) {
            items.push({
                ico: <AlertCircle size={24} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />,
                title: "Peligro de Sobreendeudamiento",
                txt: `Tus cuotas mensuales representan el ${nivelEndeudamiento.toFixed(1)}% de tus ingresos. El límite saludable es el 30-40%.`
            });
        }
        if (tasaAhorro < 10 && ingresosMesTotal > 0) {
            items.push({
                ico: <TrendingUp size={24} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />,
                title: "Impulsa tu Ahorro",
                txt: `Tu flujo de caja actual solo te permite ahorrar un ${tasaAhorro.toFixed(1)}%. Intenta aplicar la regla 50-30-20.`
            });
        }
        if (tasaAhorro >= 20) {
            items.push({
                ico: <PiggyBank size={24} className="text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />,
                title: "¡Excelente capacidad de ahorro!",
                txt: `Estás reteniendo un ${tasaAhorro.toFixed(1)}% de lo que ganas. Te sugerimos abrir la pestaña Simuladores y automatizar transferencias a inversión.`
            });
        }
        if (alertasPresupuesto.some(p => p.porcentaje >= 100)) {
            items.push({
                ico: <Target size={24} className="text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.5)]" />,
                title: "Presupuestos Rotos",
                txt: `Has excedido el límite en algunas categorías variables este mes. Revisa tus gastos impulsivos en la pestaña Presupuestos.`
            });
        }
        if (items.length === 0) {
            items.push({
                ico: <CheckCircle2 size={24} className="text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />,
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
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                 <Activity className="text-[#0b0c16] w-6 h-6"/> 
              </div>
              Score Familia y Estrategia
            </h1>
            <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
              Diagnóstico, planes de ahorro y prioridades de pago unificados.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Tarjeta de Score con Histórico */}
              <Card className="flex flex-col items-center justify-center py-10 bg-[#111222] shadow-neumorph-inset !border-transparent relative overflow-hidden">
                {/* Halo de luz de fondo */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none ${score >= 80 ? 'bg-neoncyan' : score >= 50 ? 'bg-amber-400' : 'bg-neonmagenta'}`}></div>
                
                {prevScore !== null && score > 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-appcard px-3 py-1.5 rounded-lg border border-white/[0.05] shadow-neumorph">
                    {score > prevScore ? <span className="text-neoncyan flex items-center gap-1"><ArrowUpRight size={14}/> +{score - prevScore} pts</span> :
                     score < prevScore ? <span className="text-neonmagenta flex items-center gap-1"><ArrowDownRight size={14}/> {prevScore - score} pts</span> :
                     <span className="text-[#8A92A6] flex items-center gap-1"><Minus size={14}/> = pts</span>}
                  </div>
                )}
                
                <h2 className="text-xs font-black text-[#8A92A6] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={16} className={score >= 80 ? 'text-neoncyan' : score >= 50 ? 'text-amber-400' : 'text-neonmagenta'}/> 
                  Salud Financiera
                </h2>
                
                <div className={`text-8xl font-black tabular-nums tracking-tighter mt-2 relative z-10 ${scoreColor}`}>
                  {score}
                </div>
                
                <p className={`font-black uppercase tracking-widest text-[11px] mt-4 z-10 ${scoreColor}`}>
                  {score === 0 && desglose.length === 1 ? 'Faltan Datos' : score >= 80 ? 'Excelente Salud' : score >= 50 ? 'Requiere Atención' : 'Situación Crítica'}
                </p>
                
                <div className="w-full max-w-[220px] bg-[#0b0c16] shadow-neumorph-inset rounded-full h-3 mt-8 border border-transparent overflow-hidden z-10">
                  <div className={`h-full rounded-full transition-all duration-1000 ${scoreBg}`} style={{width: `${score}%`}}></div>
                </div>
              </Card>

              {/* Foco Avalancha */}
              <Card className="!border-transparent flex flex-col">
                 <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest mb-4 flex items-center gap-2">
                   <ShieldAlert size={16}/> Foco Avalancha
                 </h3>
                 {focoAvalancha ? (
                   <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-transparent">
                     <p className="font-bold text-white text-base truncate">{focoAvalancha.name}</p>
                     <p className="text-2xl font-black text-neonmagenta mt-1 drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]">{formatCOP(focoAvalancha.currentDebt)}</p>
                     <p className="text-[10px] font-black text-[#8A92A6] mt-2 uppercase tracking-widest">Prioridad #1 de abono extra</p>
                   </div>
                 ) : (
                   <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-transparent text-center">
                     <p className="text-xs font-bold text-[#8A92A6] uppercase tracking-widest">Sin deudas activas</p>
                   </div>
                 )}
              </Card>

              {/* Meta de Ahorro / Inversión */}
              <Card className="!border-transparent flex flex-col">
                 <h3 className="text-xs font-black text-neoncyan uppercase tracking-widest mb-4 flex items-center gap-2">
                   <PiggyBank size={16}/> Meta de Ahorro / Mes
                 </h3>
                 <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-transparent">
                   <div className="flex justify-between text-[10px] font-black text-[#8A92A6] uppercase tracking-widest mb-3">
                      <span className="text-neoncyan">{progresoInversion.toFixed(0)}% Logrado</span>
                      <span>{formatCOP(invertidoActual)} / {formatCOP(metaInversion)}</span>
                   </div>
                   <div className="w-full bg-[#0b0c16] shadow-neumorph-inset h-3 rounded-full overflow-hidden border border-transparent">
                      <div className="bg-neoncyan shadow-glow-cyan h-full rounded-full transition-all duration-1000" style={{width: `${progresoInversion}%`}}></div>
                   </div>
                 </div>
              </Card>

              {/* Desglose Matemático del Score */}
              <Card className="!border-transparent">
                <h3 className="text-xs font-black text-white mb-5 uppercase tracking-widest flex items-center gap-2">
                  <Info size={16} className="text-indigo-400"/> ¿Por qué este puntaje?
                </h3>
                <div className="space-y-3 bg-[#111222] shadow-neumorph-inset p-4 rounded-2xl">
                  {desglose.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                      <span className="text-[#8A92A6] font-bold tracking-wide pr-2 leading-tight">{item.text}</span>
                      <span className={`font-black whitespace-nowrap text-sm ${item.type === 'success' ? 'text-neoncyan' : item.type === 'danger' ? 'text-neonmagenta' : item.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {item.pts > 0 ? `+${item.pts}` : item.pts < 0 ? `${item.pts}` : item.pts === 0 && item.type !== 'neutral' ? '0' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Indicadores Tasa de Ahorro y Deuda */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-transparent text-center flex flex-col items-center justify-center hover:shadow-glow-cyan transition-all">
                    <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1.5">Tasa de Ahorro</p>
                    <p className={`text-2xl font-black tabular-nums drop-shadow-md ${tasaAhorro >= 15 ? 'text-neoncyan' : tasaAhorro > 0 ? 'text-amber-400' : 'text-neonmagenta'}`}>{tasaAhorro.toFixed(1)}%</p>
                 </div>
                 <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-transparent text-center flex flex-col items-center justify-center hover:shadow-glow-magenta transition-all">
                    <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1.5">Carga de Deuda</p>
                    <p className={`text-2xl font-black tabular-nums drop-shadow-md ${nivelEndeudamiento <= 30 ? 'text-neoncyan' : nivelEndeudamiento <= 45 ? 'text-amber-400' : 'text-neonmagenta'}`}>{nivelEndeudamiento.toFixed(1)}%</p>
                 </div>
              </div>

            </div>

            {/* --- COLUMNA DERECHA --- */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Plan de Acción Sugerido */}
              <Card className="!border-transparent">
                <h2 className="text-base md:text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Target size={20} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"/> 
                  Plan de Acción Sugerido
                </h2>
                <div className="space-y-4">
                  {dynamicRecs.map((r, i) => (
                    <div key={i} className="bg-[#111222] shadow-neumorph-inset border border-transparent rounded-2xl p-5 flex gap-5 items-start hover:shadow-glow-cyan transition-all duration-300">
                      <div className="mt-1 bg-appcard p-3 rounded-xl shadow-neumorph border border-white/[0.02]">
                        {r.ico}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white tracking-wide">{r.title}</h3>
                        <p className="text-xs font-medium text-[#8A92A6] mt-2 leading-relaxed">{r.txt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tabla de Estrategia Avalancha */}
              <Card className="!border-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ListIcon /> Orden de Pago (Avalancha)
                  </h2>
                  <div className="px-4 py-2 bg-[#111222] shadow-neumorph-inset rounded-lg text-[10px] font-black uppercase tracking-widest text-[#8A92A6]">
                    Prioridad matemática: <span className="text-neonmagenta">Mayor Tasa E.A.</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto bg-[#111222] rounded-2xl shadow-neumorph-inset border border-transparent">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                      <tr>
                        <th className="px-5 py-4 w-[10%]">Prio</th>
                        <th className="px-5 py-4 w-[30%]">Obligación</th>
                        <th className="px-5 py-4 w-[25%] text-right">Saldo Deuda</th>
                        <th className="px-5 py-4 w-[15%] text-center">Tasa E.A.</th>
                        <th className="px-5 py-4 w-[20%] text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {deudasActivas.map((d, i) => (
                        <tr key={d.id} className={`transition-colors ${i === 0 ? 'bg-neonmagenta/5 hover:bg-neonmagenta/10' : 'hover:bg-white/[0.02]'}`}>
                          <td className="px-5 py-4">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${i === 0 ? 'bg-neonmagenta text-[#0b0c16] shadow-glow-magenta' : 'bg-appcard text-[#8A92A6] border border-white/[0.02]'}`}>
                              #{i+1}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-white tracking-wide">{d.name}</td>
                          <td className={`px-5 py-4 text-right font-black tabular-nums ${i === 0 ? 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]' : 'text-rose-400'}`}>
                            {formatCOP(d.currentDebt)}
                          </td>
                          <td className="px-5 py-4 text-center text-amber-400 font-black tabular-nums">{d.tasaEA}%</td>
                          <td className="px-5 py-4 text-center">
                            {i === 0 ? 
                              <span className="text-[10px] px-3 py-1.5 rounded-lg bg-neonmagenta/20 text-neonmagenta border border-neonmagenta/30 font-black uppercase tracking-widest">Abonar Extra</span> : 
                              <span className="text-[10px] text-[#8A92A6] font-bold uppercase tracking-widest">Cuota Mín.</span>
                            }
                          </td>
                        </tr>
                      ))}
                      {deudasActivas.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-12">
                            <p className="text-4xl mb-3 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">🎉</p>
                            <p className="text-neoncyan font-black uppercase tracking-widest text-sm">No tienes deudas activas</p>
                            <p className="text-[#8A92A6] text-xs font-bold mt-2">¡Sigue invirtiendo y ahorrando!</p>
                          </td>
                        </tr>
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
