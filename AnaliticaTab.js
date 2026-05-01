const AnaliticaTab = ({ ingresos, egresos, selectedMonth, cuentas, scoreData, scoreHistory, proyeccionLiquidez, privacyMode }) => {
  const { useMemo } = React;

  // ✨ IMPORTAMOS COMPONENTES DE GRÁFICAS
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip: RechartsTooltip, ResponsiveContainer, Legend } = window.Recharts;

  // --- ÍCONOS NATIVOS ---
  const Zap = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );

  const TrendingDown = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
      <polyline points="16 17 22 17 22 11"></polyline>
    </svg>
  );

  const TrendingUp = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );

  const Activity = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );

  // ✨ MODO PRIVACIDAD APLICADO
  const formatCOP = (val) => {
    if (privacyMode) return '****';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // ============================================================================
  // COMPONENTES SVG DINÁMICOS ORIGINALES (CYBERPUNK STYLE)
  // ============================================================================

  const ScoreGauge = ({ score }) => {
    const radius = 54;
    const circum = 2 * Math.PI * radius;
    const offset = circum - (score / 100) * circum;
    const colorClass = score >= 80 ? '#00E5FF' : score >= 50 ? '#fbbf24' : '#FF007A'; 

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-28 h-28" style={{ filter: `drop-shadow(0 0 10px ${colorClass}80)` }}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="10" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={colorClass} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circum} strokeDashoffset={offset} transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center mt-1">
          <span className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: colorClass, textShadow: `0 0 10px ${colorClass}80` }}>{score}</span>
          <span className="text-[10px] font-bold text-[#8A92A6] uppercase tracking-widest">/ 100</span>
        </div>
      </div>
    );
  };

  const DonutChart = ({ fijos, variables }) => {
    const total = fijos + variables || 1;
    const pFijos = (fijos / total) * 100;
    const radius = 54;
    const circum = 2 * Math.PI * radius;
    const fijosOffset = circum - (pFijos / 100) * circum;

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-32 h-32 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#00E5FF" strokeWidth="12" /> {/* Cyan (Variables) */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circum} strokeDashoffset={fijosOffset} transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          /> {/* Amber (Fijos) */}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center mt-1">
          <span className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest">Fijos</span>
          <span className="text-xl font-black text-amber-400 tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{pFijos.toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  // ============================================================================
  // LÓGICA DE DATOS MEJORADA (Sin saltos de tiempo y con identidad correcta)
  // ============================================================================
  
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

  const {
    historialMensual, totalIngresosAnual, totalEgresosAnual, totalFijosAnual, totalVariablesAnual, mesesConSuperavit
  } = useMemo(() => {
    const APP_START = '2026-04';
    const meses = [];
    let sumIng = 0, sumEgr = 0, sumFijos = 0, sumVar = 0, superavitCount = 0;

    // ✨ CORRECCIÓN: Fechas locales sin toISOString
    const [selYear, selMonth] = selectedMonth.split('-');

    for (let i = 11; i >= 0; i--) {
      // Calculamos usando el día 15 para evitar saltos de mes por horas nocturnas
      const d = new Date(Number(selYear), Number(selMonth) - 1 - i, 15);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const mesStr = `${y}-${m}`;
      
      if (mesStr >= APP_START) {
        const label = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }).replace(/^\w/, c => c.toUpperCase());

        const egresosMesFiltrados = egresos.filter(e => e.fecha.startsWith(mesStr));
        const ingMes = ingresos.filter(i => i.fecha.startsWith(mesStr)).reduce((s, i) => s + Number(i.monto), 0);
        const egrMes = egresosMesFiltrados.reduce((s, e) => s + Number(e.monto), 0);
        const fijosMes = egresosMesFiltrados.filter(e => e.tipo === 'Fijo').reduce((s, e) => s + Number(e.monto), 0);
        const varMes = egresosMesFiltrados.filter(e => e.tipo !== 'Fijo').reduce((s, e) => s + Number(e.monto), 0);

        const neto = ingMes - egrMes;
        const tasaAhorroMes = ingMes > 0 ? (neto > 0 ? (neto / ingMes) * 100 : 0) : 0;
        if (neto > 0) superavitCount++;

        sumIng += ingMes; sumEgr += egrMes; sumFijos += fijosMes; sumVar += varMes;

        meses.push({ mesStr, label, ingresos: ingMes, egresos: egrMes, neto, tasaAhorro: tasaAhorroMes });
      }
    }

    return { historialMensual: meses, totalIngresosAnual: sumIng, totalEgresosAnual: sumEgr, totalFijosAnual: sumFijos, totalVariablesAnual: sumVar, mesesConSuperavit: superavitCount };
  }, [ingresos, egresos, selectedMonth]);

  const deudasOrdenadas = useMemo(() => {
    return cuentas.filter(c => (c.type === 'credit' || c.type === 'loan') && c.currentDebt > 0).sort((a, b) => b.tasaEA - a.tasaEA); 
  }, [cuentas]);

  const ingMesActual = historialMensual[historialMensual.length - 1]?.ingresos || 0;
  
  // ✨ CORRECCIÓN: Carga de Deuda Dinámica (Evita el 0% falso en Tarjetas)
  const cuotasMesActual = cuentas.reduce((sum, c) => {
    if (c.currentDebt <= 0) return sum;
    if (c.type === 'credit') {
        const cuotaTC = Number(c.cuotaMinima) || 0;
        // Si el usuario configuró $0, estimamos un 5% de la deuda como pago mínimo para medir el impacto financiero.
        return sum + (cuotaTC > 0 ? cuotaTC : c.currentDebt * 0.05);
    }
    return sum + (Number(c.cuotaMinima) || 0);
  }, 0);
  
  const cargaDeuda = ingMesActual > 0 ? (cuotasMesActual / ingMesActual) * 100 : 0;
  const tasaAhorroAnual = totalIngresosAnual > 0 ? ((totalIngresosAnual - totalEgresosAnual) / totalIngresosAnual) * 100 : 0;
  const flujoPromedioMes = (totalIngresosAnual - totalEgresosAnual) / (historialMensual.length || 1);

  const recomendaciones = useMemo(() => {
    const recs = [];
    if (cargaDeuda > 40) recs.push({ tipo: 'alerta', ico: '🚨', title: 'Carga de Deuda Crítica', desc: `Estás comprometiendo aprox. el ${cargaDeuda.toFixed(1)}% de tus ingresos en cuotas y pagos mínimos.` });
    else if (cargaDeuda > 20) recs.push({ tipo: 'precaucion', ico: '⚠️', title: 'Carga de Deuda Moderada', desc: `Tus cuotas consumen aprox. el ${cargaDeuda.toFixed(1)}% de tu ingreso.` });

    if (tasaAhorroAnual < 5) recs.push({ tipo: 'alerta', ico: '📉', title: 'Capacidad de Ahorro Mínima', desc: 'Tu retención de capital anual es muy baja. Revisa tu Estructura de Gasto.' });
    else if (tasaAhorroAnual >= 20) recs.push({ tipo: 'exito', ico: '🏆', title: 'Excelente Tasa de Retención', desc: `Históricamente estás reteniendo el ${tasaAhorroAnual.toFixed(1)}% de tu dinero.` });

    scoreData.recs.forEach(r => { if (!recs.find(existing => existing.title === r.title)) recs.push({ tipo: 'info', ico: r.ico, title: r.title, desc: r.txt }); });

    if (recs.length === 0) recs.push({ tipo: 'exito', ico: '🚀', title: 'Finanzas Saludables', desc: 'Tus indicadores a largo plazo están perfectos.' });
    return recs;
  }, [cargaDeuda, tasaAhorroAnual, scoreData.recs]);

  const topCategoriasAnual = useMemo(() => {
    // ✨ CORRECCIÓN: Tiempo Local para topCategorias
    const [sY, sM] = selectedMonth.split('-');
    const dateBase = new Date(Number(sY), Number(sM) - 1 - 11, 15);
    const hace12MesesStr = `${dateBase.getFullYear()}-${String(dateBase.getMonth() + 1).padStart(2, '0')}`;
    
    const APP_START = '2026-04';
    const filterStart = hace12MesesStr < APP_START ? APP_START : hace12MesesStr;

    const gastos12m = egresos.filter(e => e.fecha >= filterStart);
    const catMap = {};
    gastos12m.forEach(g => { const c = g.categoria || 'Otros'; catMap[c] = (catMap[c] || 0) + Number(g.monto); });
    return Object.entries(catMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [egresos, selectedMonth]);

  const { mejorMes, peorMes } = useMemo(() => {
    if (historialMensual.length === 0) return { mejorMes: null, peorMes: null };
    let mejor = historialMensual[0]; let peor = historialMensual[0];
    historialMensual.forEach(m => { if (m.neto > mejor.neto) mejor = m; if (m.neto < peor.neto) peor = m; });
    return { mejorMes: mejor, peorMes: peor };
  }, [historialMensual]);

  const maxValCat = topCategoriasAnual.length > 0 ? topCategoriasAnual[0][1] : 1;
  const pctFijos = totalEgresosAnual > 0 ? (totalFijosAnual / totalEgresosAnual) * 100 : 0;
  const pctVariables = totalEgresosAnual > 0 ? (totalVariablesAnual / totalEgresosAnual) * 100 : 0;

  // ============================================================================
  // ✨ CORRECCIÓN: DATOS PARA GRÁFICO RECHARTS LEO VS ANDRE (Identidad)
  // ============================================================================
  const datosComparativos = useMemo(() => {
    const egresosMesFiltrados = egresos.filter(e => e.fecha.startsWith(selectedMonth));
    const categoriasObj = {};

    egresosMesFiltrados.forEach(e => {
      const cat = e.categoria || 'Otros';
      if (!categoriasObj[cat]) categoriasObj[cat] = { name: cat, Leo: 0, Andre: 0, Shared: 0 };
      
      const owner = identifyOwner(e.cuentaId, e.persona, e.descripcion);

      if (owner === 'Leo') categoriasObj[cat].Leo += e.monto;
      else if (owner === 'Andre') categoriasObj[cat].Andre += e.monto;
      else categoriasObj[cat].Shared += e.monto;
    });

    return Object.values(categoriasObj)
      .sort((a, b) => (b.Leo + b.Andre + b.Shared) - (a.Leo + a.Andre + a.Shared))
      .slice(0, 6); 
  }, [egresos, selectedMonth, cuentas]);

  const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-appcard/95 backdrop-blur-md border border-white/[0.05] p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] min-w-[150px]">
          <p className="text-[11px] font-black uppercase tracking-widest text-white mb-3 border-b border-white/[0.1] pb-2">{label}</p>
          {payload.map((entry, index) => (
             entry.value > 0 && (
              <div key={index} className="flex justify-between items-center text-xs font-bold mb-1.5 gap-4">
                <span style={{ color: entry.fill }} className="uppercase tracking-wider">{entry.name}</span>
                <span className="text-white tabular-nums">{formatCOP(entry.value)}</span>
              </div>
             )
          ))}
        </div>
      );
    }
    return null;
  };

  const EmptyStateAnalitica = () => (
    <div className="flex flex-col items-center justify-center p-10 h-full text-center animate-in zoom-in-95 duration-500">
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 bg-neonmagenta/20 blur-xl rounded-full animate-pulse"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-neonmagenta drop-shadow-[0_0_10px_rgba(255,0,122,0.8)]">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </div>
      <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">Sin datos para analizar</h3>
      <p className="text-[#8A92A6] text-[10px] font-bold w-3/4 mx-auto">Comienza a registrar movimientos.</p>
    </div>
  );


  // ============================================================================
  // INTERFAZ DE USUARIO (UI)
  // ============================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-wide">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neoncyan to-blue-600 flex items-center justify-center shadow-glow-cyan">
             <Activity className="text-[#0b0c16] w-6 h-6"/> 
          </div>
          Analítica y Score Familia
        </h1>
        <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
          El panel de control definitivo con gráficas dinámicas nativas.
        </p>
      </header>

      {/* ---------------------------------------------------- */}
      {/* SECCIÓN 1: TARJETAS DE SALUD FINANCIERA             */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gráfica Circular de Score */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] flex flex-col items-center justify-center p-6 !border-t-0 shadow-neumorph-inset bg-[#111222]">
          <p className="text-[10px] md:text-xs text-[#8A92A6] uppercase font-black tracking-widest mb-4">Salud Financiera</p>
          <ScoreGauge score={scoreData.score} />
        </div>

        {/* Tarjetas de KPI */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 flex flex-col justify-center !border-t-0 shadow-neumorph-inset bg-[#111222] group hover:shadow-glow-magenta transition-all">
              <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1 group-hover:text-neonmagenta transition-colors">Carga de Deuda</p>
              <p className={`text-3xl font-black tabular-nums drop-shadow-md ${cargaDeuda > 40 ? 'text-neonmagenta drop-shadow-[0_0_10px_rgba(255,0,122,0.5)]' : 'text-white'}`}>
                {cargaDeuda.toFixed(1)}%
              </p>
            </div>

            <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 flex flex-col justify-center !border-t-0 shadow-neumorph-inset bg-[#111222] group hover:shadow-glow-cyan transition-all">
              <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1 group-hover:text-neoncyan transition-colors">Tasa de Ahorro</p>
              <p className="text-3xl font-black text-neoncyan tabular-nums drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">{tasaAhorroAnual.toFixed(1)}%</p>
            </div>

            <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 flex flex-col justify-center !border-t-0 shadow-neumorph-inset bg-[#111222]">
              <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Flujo Promedio</p>
              <p className={`text-2xl font-black tabular-nums ${flujoPromedioMes >= 0 ? 'text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]'}`}>
                {formatCOP(flujoPromedioMes)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECCIÓN NUEVA: GRÁFICO RECHARTS LEO VS ANDRE         */}
      {/* ---------------------------------------------------- */}
      <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col h-[400px]">
        <h2 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-neoncyan"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          Top Gastos: Leo vs Andre
        </h2>
        <p className="text-[10px] text-[#8A92A6] font-bold uppercase tracking-widest mb-6">Comparativa por Categorías (Mes Actual)</p>
        
        <div className="flex-1 w-full">
          {datosComparativos.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosComparativos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1e32" vertical={false} />
                <XAxis dataKey="name" stroke="#8A92A6" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => val.substring(0,6)+'...'} />
                <YAxis stroke="#8A92A6" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltipBar />} cursor={{fill: '#1c1e32', opacity: 0.4}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="Leo" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Andre" fill="#FF007A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Shared" name="Compartido" fill="#FBBF24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyStateAnalitica />
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECCIÓN PROYECCIÓN Y RECOMENDACIONES                 */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {proyeccionLiquidez ? (
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 xl:col-span-2 flex flex-col justify-center">
            <h2 className="text-lg font-black text-white mb-6 tracking-wide flex items-center gap-2">
              <TrendingUp size={20} className="text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"/> 
              Proyección de Liquidez (90 Días)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: '30 días', val: proyeccionLiquidez.liq30 },
                { label: '60 días', val: proyeccionLiquidez.liq60 },
                { label: '90 días', val: proyeccionLiquidez.liq90 },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[#111222] shadow-neumorph-inset border border-transparent rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 hover:border-white/[0.05] transition-colors">
                  <p className="text-[11px] text-[#8A92A6] uppercase font-black tracking-widest">{label}</p>
                  <p className={`text-3xl font-black tabular-nums ${val >= 0 ? 'text-neoncyan drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-neonmagenta drop-shadow-[0_0_10px_rgba(255,0,122,0.4)]'}`}>
                    {formatCOP(val)}
                  </p>
                  <div className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest ${val >= 0 ? 'bg-neoncyan/10 text-neoncyan border border-neoncyan/20' : 'bg-neonmagenta/10 text-neonmagenta border border-neonmagenta/20'}`}>
                    {val >= 0 ? '✓ Flujo Positivo' : '⚠ Déficit'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 xl:col-span-2 flex items-center justify-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Calculando proyección de liquidez...</p>
          </div>
        )}

        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col">
           <div className="flex items-center gap-2 mb-6">
              <Zap className="text-amber-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"/>
              <h2 className="text-lg font-black tracking-wide text-white">Acciones Sugeridas</h2>
           </div>
           
           <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32]">
              {recomendaciones.map((r, i) => (
                <div key={i} className={`p-4 rounded-2xl border transition-all ${
                  r.tipo === 'alerta' ? 'bg-[#111222] shadow-neumorph-inset border-neonmagenta/50 shadow-glow-magenta' : 
                  r.tipo === 'precaucion' ? 'bg-[#111222] shadow-neumorph-inset border-amber-500/30' : 
                  r.tipo === 'exito' ? 'bg-[#111222] shadow-neumorph-inset border-neoncyan/30' : 
                  'bg-[#111222] shadow-neumorph-inset border-transparent'
                }`}>
                   <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl drop-shadow-md">{r.ico}</span>
                      <span className={`font-black tracking-wide text-sm ${r.tipo === 'alerta' ? 'text-neonmagenta' : r.tipo === 'precaucion' ? 'text-amber-400' : r.tipo === 'exito' ? 'text-neoncyan' : 'text-white'}`}>{r.title}</span>
                   </div>
                   <p className="text-xs text-[#8A92A6] font-medium leading-relaxed pl-8">
                     {r.desc}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ---------------------------------------------------- */}
        {/* TARJETA 5: ESTRATEGIA AVALANCHA                      */}
        {/* ---------------------------------------------------- */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black tracking-wide text-white flex items-center gap-2">Estrategia Avalancha</h2>
            <div className="hidden md:block px-3 py-1.5 bg-neonmagenta/10 text-neonmagenta rounded-lg text-[10px] font-black uppercase tracking-widest border border-neonmagenta/30 shadow-[0_0_10px_rgba(255,0,122,0.2)]">
              Prioridad: Tasa EA
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[350px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32]">
             {deudasOrdenadas.map((d, i) => (
               <div key={d.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${i === 0 ? 'bg-[#111222] shadow-neumorph-inset border-neonmagenta shadow-glow-magenta' : 'bg-appcard shadow-neumorph border-transparent hover:border-white/[0.05]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${i === 0 ? 'bg-neonmagenta text-[#0b0c16] shadow-[0_0_15px_rgba(255,0,122,0.8)]' : 'bg-[#111222] shadow-neumorph-inset border border-transparent text-[#8A92A6]'}`}>
                      #{i+1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1 tracking-wide">{d.name}</p>
                      <p className="text-[10px] font-black tracking-widest text-[#8A92A6] mt-1 uppercase">
                        Tasa EA: <span className={i === 0 ? 'text-neonmagenta' : 'text-white'}>{d.tasaEA}%</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-base font-black tabular-nums ${i === 0 ? 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]' : 'text-white'}`}>
                      {formatCOP(d.currentDebt)}
                    </p>
                    <p className="text-[10px] text-[#8A92A6] uppercase tracking-widest mt-1 font-black">Saldo</p>
                  </div>
               </div>
             ))}
             {deudasOrdenadas.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full py-10">
                 <p className="text-4xl mb-4 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">🎉</p>
                 <p className="text-neoncyan font-black tracking-wide text-sm uppercase">¡Cero Deudas Activas!</p>
                 <p className="text-[#8A92A6] font-bold text-xs mt-2">Eres libre de intereses bancarios.</p>
               </div>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* ---------------------------------------------------- */}
          {/* TARJETA 6: EXTREMOS DEL AÑO                          */}
          {/* ---------------------------------------------------- */}
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col justify-center gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Extremos de tu Historial</h3>
            
            <div className="bg-[#111222] shadow-neumorph-inset border border-transparent p-4 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-neoncyan/10 text-neoncyan flex items-center justify-center rounded-xl shrink-0 shadow-glow-cyan border border-neoncyan/30">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] text-neoncyan font-black tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">Mejor Mes ({mejorMes?.label || 'N/A'})</p>
                <p className="text-2xl font-black text-white tabular-nums">{formatCOP(mejorMes?.neto || 0)}</p>
              </div>
            </div>

            <div className="bg-[#111222] shadow-neumorph-inset border border-transparent p-4 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-neonmagenta/10 text-neonmagenta flex items-center justify-center rounded-xl shrink-0 shadow-glow-magenta border border-neonmagenta/30">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-[10px] text-neonmagenta font-black tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]">Peor Mes ({peorMes?.label || 'N/A'})</p>
                <p className="text-2xl font-black text-white tabular-nums">{formatCOP(peorMes?.neto || 0)}</p>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* TARJETA 7: TOP 5 FUGAS                               */}
          {/* ---------------------------------------------------- */}
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Top Fugas ({topCategoriasAnual.length > 0 ? topCategoriasAnual.length : 0})</h3>
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {topCategoriasAnual.map(([cat, amount], i) => {
                const width = Math.max((amount / maxValCat) * 100, 5);
                return (
                  <div key={cat} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8A92A6] font-bold truncate pr-2 group-hover:text-white transition-colors">
                        <span className="text-neonmagenta/60 font-black mr-2">#{i+1}</span> 
                        {cat}
                      </span>
                      <span className="font-black text-neonmagenta tabular-nums">{formatCOP(amount)}</span>
                    </div>
                    <div className="w-full bg-[#111222] shadow-neumorph-inset rounded-full h-[10px] border border-transparent overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neonmagenta to-[#ff5e99] rounded-full transition-all duration-1000 shadow-glow-magenta relative" style={{ width: `${width}%` }}>
                        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full opacity-60 mix-blend-screen"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {topCategoriasAnual.length === 0 && <p className="text-sm text-[#8A92A6] font-bold text-center">Sin datos registrados.</p>}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TARJETA 8: ESTRUCTURA DE GASTO CON DONA SVG          */}
        {/* ---------------------------------------------------- */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 lg:col-span-2 flex flex-col justify-center">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Estructura de Gasto Real</h3>
          
          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#111222] shadow-neumorph-inset border border-transparent rounded-[30px] p-6 md:p-8">
            <DonutChart fijos={totalFijosAnual} variables={totalVariablesAnual} />

            <div className="flex-1 space-y-5 w-full">
              <div className="bg-appcard shadow-neumorph border border-white/[0.02] p-5 rounded-2xl flex justify-between items-center hover:shadow-glow-amber transition-all">
                <span className="text-[#8A92A6] font-black text-xs tracking-widest uppercase">Gastos Fijos</span>
                <span className="text-amber-400 font-black text-xl tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{pctFijos.toFixed(1)}%</span>
              </div>

              <div className="bg-appcard shadow-neumorph border border-white/[0.02] p-5 rounded-2xl flex justify-between items-center hover:shadow-glow-cyan transition-all">
                <span className="text-[#8A92A6] font-black text-xs tracking-widest uppercase">Gastos Variables</span>
                <span className="text-neoncyan font-black text-xl tabular-nums drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">{pctVariables.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs font-black text-[#8A92A6] uppercase tracking-widest">
              Relación de Vida: <strong className="text-white text-sm tracking-wide">{(totalVariablesAnual > 0 ? (totalFijosAnual/totalVariablesAnual).toFixed(1) : 0)} a 1</strong> <span className="lowercase font-bold tracking-normal text-[10px] ml-1">(Fijos / Variable)</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
