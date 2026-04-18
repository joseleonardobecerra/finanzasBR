const AnaliticaTab = ({ ingresos, egresos, selectedMonth, cuentas, scoreData, scoreHistory }) => {
  const { useMemo } = React;

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val);

  // ----------------------------------------------------
  // 1. CÁLCULOS HISTÓRICOS Y ESTRUCTURA (ANALÍTICA)
  // ----------------------------------------------------
  const {
    historialMensual,
    totalIngresosAnual,
    totalEgresosAnual,
    totalFijosAnual,
    totalVariablesAnual,
    mesesConSuperavit
  } = useMemo(() => {
    const meses = [];
    const fechaBase = new Date(`${selectedMonth}-01T12:00:00`);

    let sumIng = 0;
    let sumEgr = 0;
    let sumFijos = 0;
    let sumVar = 0;
    let superavitCount = 0;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(fechaBase);
      d.setMonth(d.getMonth() - i);

      const mesStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('es-ES', {
        month: 'short',
        year: '2-digit'
      }).replace(/^\w/, c => c.toUpperCase());

      const egresosMesFiltrados = egresos.filter(e => e.fecha.startsWith(mesStr));
      const ingMes = ingresos.filter(i => i.fecha.startsWith(mesStr)).reduce((s, i) => s + Number(i.monto), 0);
      const egrMes = egresosMesFiltrados.reduce((s, e) => s + Number(e.monto), 0);

      const fijosMes = egresosMesFiltrados
        .filter(e => e.tipo === 'Fijo')
        .reduce((s, e) => s + Number(e.monto), 0);

      const varMes = egresosMesFiltrados
        .filter(e => e.tipo !== 'Fijo')
        .reduce((s, e) => s + Number(e.monto), 0);

      const neto = ingMes - egrMes;

      if (neto > 0) {
        superavitCount++;
      }

      sumIng += ingMes;
      sumEgr += egrMes;
      sumFijos += fijosMes;
      sumVar += varMes;

      meses.push({
        mesStr,
        label,
        ingresos: ingMes,
        egresos: egrMes,
        neto
      });
    }

    return {
      historialMensual: meses,
      totalIngresosAnual: sumIng,
      totalEgresosAnual: sumEgr,
      totalFijosAnual: sumFijos,
      totalVariablesAnual: sumVar,
      mesesConSuperavit: superavitCount
    };
  }, [ingresos, egresos, selectedMonth]);

  // ----------------------------------------------------
  // 2. ESTRATEGIA AVALANCHA (SCORE FAMILIA)
  // ----------------------------------------------------
  const deudasOrdenadas = useMemo(() => {
    return cuentas
      .filter(c => (c.type === 'credit' || c.type === 'loan') && c.currentDebt > 1000)
      .sort((a, b) => b.tasaEA - a.tasaEA); // Ordenadas de mayor a menor tasa
  }, [cuentas]);

  // ----------------------------------------------------
  // 3. CARGA DE DEUDA Y RECOMENDACIONES INTELIGENTES
  // ----------------------------------------------------
  const ingMesActual = historialMensual[11]?.ingresos || 0;

  const cuotasMesActual = cuentas.reduce((sum, c) => {
    if (c.currentDebt > 0) {
      return sum + (Number(c.cuotaMinima) || 0);
    }
    return sum;
  }, 0);

  const cargaDeuda = ingMesActual > 0 ? (cuotasMesActual / ingMesActual) * 100 : 0;
  const tasaAhorroAnual = totalIngresosAnual > 0 ? ((totalIngresosAnual - totalEgresosAnual) / totalIngresosAnual) * 100 : 0;

  const recomendaciones = useMemo(() => {
    const recs = [];

    if (cargaDeuda > 40) {
      recs.push({
        ico: '🔥',
        title: 'Carga de Deuda Crítica',
        desc: 'Tus deudas consumen más del 40% de tu ingreso. Prioriza abonos a capital y evita usar tarjetas de crédito por 3 meses.'
      });
    }

    if (tasaAhorroAnual < 10) {
      recs.push({
        ico: '📉',
        title: 'Capacidad de Ahorro Baja',
        desc: 'Estás ahorrando menos del 10% anual. Revisa tus gastos variables; busca categorías donde puedas recortar para mejorar tu liquidez.'
      });
    }

    if (mesesConSuperavit < 6) {
      recs.push({
        ico: '⚠️',
        title: 'Inconsistencia Financiera',
        desc: 'En el último año has tenido más meses en pérdida que en ganancia. Es vital crear un fondo de emergencia para evitar endeudamiento.'
      });
    }

    if (deudasOrdenadas.length > 0) {
      recs.push({
        ico: '🛡️',
        title: 'Ataque de Avalancha',
        desc: `Tu deuda más cara es ${deudasOrdenadas[0].name}. Cualquier ingreso extra (superávit) este mes debe ir directo a capital en esa cuenta.`
      });
    }

    if (recs.length === 0) {
      recs.push({
        ico: '🚀',
        title: '¡Impecable!',
        desc: 'Tus indicadores están en zona verde. Mantienes control de tu flujo, tienes buena tasa de ahorro y deudas bajo control. ¡Sigue así!'
      });
    }

    return recs;
  }, [cargaDeuda, tasaAhorroAnual, mesesConSuperavit, deudasOrdenadas]);

  const maxNetoAbs = Math.max(...historialMensual.map(m => Math.abs(m.neto)), 1);

  // Porcentajes de estructura de gastos
  const pctFijos = totalEgresosAnual > 0 ? (totalFijosAnual / totalEgresosAnual) * 100 : 0;
  const pctVariables = totalEgresosAnual > 0 ? (totalVariablesAnual / totalEgresosAnual) * 100 : 0;
  const relacionGasto = totalVariablesAnual > 0 ? (totalFijosAnual / totalVariablesAnual).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BarChart className="text-indigo-400 w-8 h-8"/>
          Analítica y Estrategia
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Visión de 12 meses, salud crediticia y hoja de ruta financiera.
        </p>
      </header>

      {/* ---------------------------------------------------- */}
      {/* ✨ 1. TARJETAS DE KPIs DE SALUD FAMILIAR               */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-t-4 border-t-emerald-500 flex flex-col justify-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Score Salud
          </p>
          <p className="text-2xl font-black text-white">
            {scoreData.score} <span className="text-base font-medium text-slate-500">/ 100</span>
          </p>
        </Card>

        <Card className="p-4 border-t-4 border-t-indigo-500 flex flex-col justify-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Carga de Deuda
          </p>
          <p className={`text-2xl font-black ${cargaDeuda > 40 ? 'text-rose-400' : 'text-indigo-400'}`}>
            {cargaDeuda.toFixed(1)}%
          </p>
        </Card>

        <Card className="p-4 border-t-4 border-t-amber-500 flex flex-col justify-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Tasa Ahorro (Anual)
          </p>
          <p className={`text-2xl font-black ${tasaAhorroAnual > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {tasaAhorroAnual.toFixed(1)}%
          </p>
        </Card>

        <Card className="p-4 border-t-4 border-t-slate-500 flex flex-col justify-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Meses Ganadores
          </p>
          <p className="text-2xl font-black text-white">
            {mesesConSuperavit} <span className="text-base font-medium text-slate-500">de 12</span>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ---------------------------------------------------- */}
        {/* ✨ 2. GRÁFICA DE FLUJO (Evolución de Capacidad)      */}
        {/* ---------------------------------------------------- */}
        <Card className="lg:col-span-2 border-t-4 border-t-indigo-500 p-5 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">
            Evolución de Capacidad de Ahorro
          </h2>

          <div className="flex-1 h-56 flex items-end justify-between gap-1 md:gap-4 border-b border-slate-800 pb-2 relative">
            {historialMensual.map((m, i) => {
              const heightPct = Math.max((Math.abs(m.neto) / maxNetoAbs) * 100, 2);
              const isPos = m.neto >= 0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-3 md:w-6 rounded-t-sm transition-all duration-500 ${isPos ? 'bg-emerald-500/80 group-hover:bg-emerald-400' : 'bg-rose-500/80 group-hover:bg-rose-400'}`}
                  ></div>

                  <span className="text-[9px] md:text-[10px] text-slate-500 mt-2 font-bold uppercase">
                    {m.label}
                  </span>

                  {/* Tooltip Hover (Aparece al poner el mouse) */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-24 bg-slate-950 border border-slate-700 p-3 rounded shadow-2xl z-20 pointer-events-none transition-opacity text-[10px] min-w-[140px]">
                    <p className="text-slate-300 font-bold uppercase mb-2 border-b border-slate-800 pb-1">
                      {m.label}
                    </p>
                    <div className="flex justify-between mb-1">
                      <span className="text-emerald-400">Ingresos:</span>
                      <span className="text-white font-bold">{formatCOP(m.ingresos)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-rose-400">Egresos:</span>
                      <span className="text-white font-bold">{formatCOP(m.egresos)}</span>
                    </div>
                    <div className="border-t border-slate-800 my-1.5"></div>
                    <div className="flex justify-between font-black text-xs">
                      <span className={isPos ? 'text-emerald-400' : 'text-rose-500'}>
                        {isPos ? 'Ahorro:' : 'Déficit:'}
                      </span>
                      <span className={isPos ? 'text-emerald-400' : 'text-rose-500'}>
                        {formatCOP(Math.abs(m.neto))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold uppercase tracking-wider">
             <span className="flex items-center gap-2 text-emerald-400">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
               Superávit (Ahorro)
             </span>
             <span className="flex items-center gap-2 text-rose-400">
               <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div>
               Déficit (Pérdida)
             </span>
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* ✨ 3. RECOMENDACIONES (Insights e Inteligencia)      */}
        {/* ---------------------------------------------------- */}
        <Card className="border-t-4 border-t-amber-500 p-5 flex flex-col">
           <h2 className="text-lg font-bold text-white mb-4">
             Hoja de Ruta e Insights
           </h2>
           <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {recomendaciones.map((r, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{r.ico}</span>
                      <span className="font-bold text-sm text-slate-200">{r.title}</span>
                   </div>
                   <p className="text-[11px] text-slate-400 leading-relaxed">
                     {r.desc}
                   </p>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------------------------------------------------- */}
        {/* ✨ 4. ESTRATEGIA AVALANCHA (Orden de Pago de Deudas) */}
        {/* ---------------------------------------------------- */}
        <Card className="border-t-4 border-t-rose-500 p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">
              Estrategia Avalancha: Orden de Pago
            </h2>
            <div className="px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-[10px] font-bold uppercase tracking-wide">
              Prioridad: Interés
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
             {deudasOrdenadas.map((d, i) => (
               <div key={d.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-slate-800 text-slate-400'}`}>
                      #{i+1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{d.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Tasa: <span className="text-rose-400">{d.tasaEA}% EA</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-white">{formatCOP(d.currentDebt)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Saldo Pendiente</p>
                  </div>
               </div>
             ))}

             {deudasOrdenadas.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full py-10">
                 <p className="text-4xl mb-3">🎉</p>
                 <p className="text-slate-400 font-bold text-sm">¡No tienes deudas activas!</p>
                 <p className="text-slate-500 text-xs mt-1">Eres libre de intereses.</p>
               </div>
             )}
          </div>

          <div className="mt-5 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 font-medium flex items-start gap-3">
             <span className="text-lg">💡</span>
             <p>
               Paga la <strong className="text-indigo-400">Cuota Mínima</strong> de todas las deudas,
               y todo el dinero extra (superávit) inyéctalo directo a capital a la deuda <strong className="text-rose-400">#{1}</strong>.
               Esto te ahorrará miles en intereses bancarios.
             </p>
          </div>
        </Card>

        {/* ---------------------------------------------------- */}
        {/* ✨ 5. ESTRUCTURA DEL GASTO ANUAL                     */}
        {/* ---------------------------------------------------- */}
        <Card className="border-t-4 border-t-slate-500 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              Estructura del Gasto Anual
            </h2>
            <p className="text-[11px] text-slate-400 mb-8">
              Distribución de tu estilo de vida en los últimos 12 meses.
            </p>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center mb-6">
             
             {/* Gasto Fijo */}
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-bold">Gastos Fijos (Compromisos)</span>
                  <span className="text-orange-400 font-black text-lg">{pctFijos.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-4 rounded-full border border-slate-800 overflow-hidden shadow-inner">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pctFijos}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 text-right mt-1.5 font-medium">
                  {formatCOP(totalFijosAnual)} gastados
                </p>
             </div>

             {/* Gasto Variable */}
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-bold">Gastos Variables (Estilo de vida)</span>
                  <span className="text-blue-400 font-black text-lg">{pctVariables.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-4 rounded-full border border-slate-800 overflow-hidden shadow-inner">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pctVariables}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 text-right mt-1.5 font-medium">
                  {formatCOP(totalVariablesAnual)} gastados
                </p>
             </div>
          </div>

          <div className="mt-2 p-4 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
             <p className="text-xs text-slate-400">
               Tu relación de gasto es <strong className="text-white text-sm">{relacionGasto} a 1</strong> (Fijo vs Variable).
               <br/>
               <span className="text-[10px] mt-1 block opacity-70">
                 Entre más alto sea el porcentaje fijo, menos flexibilidad de maniobra tienes mes a mes.
               </span>
             </p>
          </div>
        </Card>

      </div>
    </div>
  );
};
