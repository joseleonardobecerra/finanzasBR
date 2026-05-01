const AnaliticaTab = (() => {

  // ============================================================================
  // COMPONENTES UI EXTERNOS & ÍCONOS NATIVOS (Privados)
  // ============================================================================
  const Zap = ({ size = 24, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
  const TrendingDown = ({ size = 24, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>;
  const TrendingUp = ({ size = 24, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>;
  const Activity = ({ size = 24, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
  const InfoIcon = ({ size = 14, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
  const BarChartIcon = ({ size = 18, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
  const Target = ({ size = 18, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const PieChartIcon = ({ size = 18, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;

  // --- COMPONENTES VISUALES ---
  const ScoreGauge = ({ score }) => {
    const radius = 54;
    const circum = 2 * Math.PI * radius;
    const offset = circum - (score / 100) * circum;
    const colorClass = score >= 80 ? '#00E5FF' : score >= 50 ? '#fbbf24' : '#FF007A'; 

    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-28 md:h-28" style={{ filter: `drop-shadow(0 0 10px ${colorClass}80)` }}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="10" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={colorClass} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circum} strokeDashoffset={offset} transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center mt-1">
          <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter" style={{ color: colorClass, textShadow: `0 0 10px ${colorClass}80` }}>{score}</span>
          <span className="text-[9px] font-bold text-[#8A92A6] uppercase tracking-widest">/ 100</span>
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
        <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
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
  // COMPONENTE PRINCIPAL DE LA PESTAÑA
  // ============================================================================
  const AnaliticaTabComponent = ({ ingresos, egresos, selectedMonth, cuentas, scoreData, scoreHistory, proyeccionLiquidez, privacyMode }) => {
    const { useMemo, useState } = React;

    // ✨ IMPORTAMOS COMPONENTES DE GRÁFICAS DE RECHARTS
    const { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip: RechartsTooltip } = window.Recharts;

    const [expandedInfo, setExpandedInfo] = useState(null);
    const toggleInfo = (id) => setExpandedInfo(prev => prev === id ? null : id);

    const formatCOP = (val) => {
      if (privacyMode) return '****';
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    // ============================================================================
    // LÓGICA DE DATOS
    // ============================================================================
    const {
      historialMensual, totalIngresosAnual, totalEgresosAnual, totalFijosAnual, totalVariablesAnual
    } = useMemo(() => {
      const APP_START = '2026-04';
      const meses = [];
      let sumIng = 0, sumEgr = 0, sumFijos = 0, sumVar = 0;

      const [selYear, selMonth] = selectedMonth.split('-');

      for (let i = 11; i >= 0; i--) {
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
          
          sumIng += ingMes; sumEgr += egrMes; sumFijos += fijosMes; sumVar += varMes;
          meses.push({ mesStr, label, ingresos: ingMes, egresos: egrMes, neto });
        }
      }

      return { historialMensual: meses, totalIngresosAnual: sumIng, totalEgresosAnual: sumEgr, totalFijosAnual: sumFijos, totalVariablesAnual: sumVar };
    }, [ingresos, egresos, selectedMonth]);

    const deudasOrdenadas = useMemo(() => {
      return cuentas.filter(c => (c.type === 'credit' || c.type === 'loan') && c.currentDebt > 0).sort((a, b) => b.tasaEA - a.tasaEA); 
    }, [cuentas]);

    const ingMesActual = historialMensual[historialMensual.length - 1]?.ingresos || 0;
    
    const cuotasMesActual = cuentas.reduce((sum, c) => {
      if (c.currentDebt <= 0) return sum;
      if (c.type === 'credit') {
          const cuotaTC = Number(c.cuotaMinima) || 0;
          return sum + (cuotaTC > 0 ? cuotaTC : c.currentDebt * 0.05);
      }
      return sum + (Number(c.cuotaMinima) || 0);
    }, 0);
    
    const cargaDeuda = ingMesActual > 0 ? (cuotasMesActual / ingMesActual) * 100 : 0;
    const tasaAhorroAnual = totalIngresosAnual > 0 ? ((totalIngresosAnual - totalEgresosAnual) / totalIngresosAnual) * 100 : 0;
    const flujoPromedioMes = (totalIngresosAnual - totalEgresosAnual) / (historialMensual.length || 1);

    // ✨ CÁLCULOS AVANZADOS PARA NUEVOS INSIGHTS
    const liquidezEfectiva = cuentas.filter(c => ['bank', 'cash'].includes(c.type)).reduce((s, c) => s + c.currentBalance, 0);
    const liquidezInvertida = cuentas.filter(c => c.type === 'pocket').reduce((s, c) => s + c.currentBalance, 0);
    const liquidezTotalCalc = liquidezEfectiva + liquidezInvertida;
    const gastoPromedioMes = totalEgresosAnual / (historialMensual.length || 1);
    const mesesCobertura = gastoPromedioMes > 0 ? liquidezTotalCalc / gastoPromedioMes : 0;

    // ✨ MOTOR DE RECOMENDACIONES (SUPER MEJORADO)
    const recomendaciones = useMemo(() => {
      const recs = [];
      
      // 1. Carga de Deuda
      if (cargaDeuda > 40) recs.push({ tipo: 'alerta', ico: '🚨', title: 'Carga de Deuda Crítica', desc: `Estás comprometiendo aprox. el ${cargaDeuda.toFixed(1)}% de tus ingresos en pagar créditos. Cuidado con tu flujo de caja.` });
      else if (cargaDeuda > 20) recs.push({ tipo: 'precaucion', ico: '⚠️', title: 'Carga de Deuda Moderada', desc: `Tus cuotas consumen el ${cargaDeuda.toFixed(1)}% de tu ingreso. Mantén a raya las compras a plazos.` });
      else if (cargaDeuda > 0) recs.push({ tipo: 'exito', ico: '🛡️', title: 'Deuda Controlada', desc: `Tus deudas representan solo el ${cargaDeuda.toFixed(1)}% de tu ingreso mensual. Excelente capacidad de pago.` });

      // 2. Fondo de Emergencia (Cobertura)
      if (mesesCobertura < 1) recs.push({ tipo: 'alerta', ico: '🛟', title: 'Fondo de Emergencia Crítico', desc: 'Tu liquidez actual no alcanza para cubrir ni 1 mes de gastos en caso de imprevistos. Prioriza el ahorro líquido.' });
      else if (mesesCobertura >= 3) recs.push({ tipo: 'exito', ico: '🏰', title: 'Fondo de Emergencia Sólido', desc: `Tienes ${mesesCobertura.toFixed(1)} meses de gastos cubiertos. Esto te otorga una gran paz mental y resiliencia.` });

      // 3. Tasa de Ahorro
      if (tasaAhorroAnual < 5) recs.push({ tipo: 'alerta', ico: '📉', title: 'Capacidad de Retención Baja', desc: 'Estás gastando casi todo lo que ganas. Revisa tus gastos "hormiga" o tus suscripciones fijas.' });
      else if (tasaAhorroAnual >= 20) recs.push({ tipo: 'exito', ico: '🏆', title: 'Excelente Ahorrador', desc: `Históricamente estás reteniendo el ${tasaAhorroAnual.toFixed(1)}% de tu dinero. ¡Sigue así!` });

      // 4. Deuda Tóxica (Tasas EA Altas)
      if (deudasOrdenadas.length > 0 && deudasOrdenadas[0].tasaEA >= 28) {
        recs.push({ tipo: 'alerta', ico: '🔥', title: 'Crédito de Alto Costo Detectado', desc: `Tienes saldo en una cuenta con ${deudasOrdenadas[0].tasaEA}% de interés EA. Prioriza liquidarla mediante el Método Avalancha.` });
      }

      // 5. Estructura Fijo vs Variable
      if (totalVariablesAnual > totalFijosAnual && totalFijosAnual > 0) {
        recs.push({ tipo: 'precaucion', ico: '⚖️', title: 'Gasto Variable Dominante', desc: 'Gastas más en cosas variables (ocio, salidas, varios) que en tus obligaciones fijas mensuales. Ajustar esto es clave para ahorrar más.' });
      }

      // 6. Dinero Ocioso (Inflación)
      if (liquidezEfectiva > (gastoPromedioMes * 1.5) && liquidezInvertida === 0) {
        recs.push({ tipo: 'info', ico: '💡', title: 'Dinero Ocioso Detectado', desc: 'Tienes buena liquidez en el banco, pero $0 en Inversiones. La inflación le está quitando valor a tu dinero. Considera abrir un "Bolsillo" que rente intereses.' });
      }

      // 7. Tendencia de Flujo
      if (historialMensual.length >= 2) {
        const last = historialMensual[historialMensual.length - 1];
        const prev = historialMensual[historialMensual.length - 2];
        if (last.neto < 0 && prev.neto < 0) {
          recs.push({ tipo: 'alerta', ico: '⚠️', title: 'Déficit Sostenido', desc: 'Llevas varios meses gastando más de lo que ingresas. Si no ajustas el presupuesto pronto, tendrás que recurrir a endeudamiento.' });
        }
      }

      // 8. Integrar recomendaciones previas del score general
      scoreData.recs.forEach(r => { 
        if (!recs.find(existing => existing.title === r.title)) recs.push({ tipo: 'info', ico: r.ico, title: r.title, desc: r.txt }); 
      });

      if (recs.length === 0) recs.push({ tipo: 'exito', ico: '🚀', title: 'Finanzas Impecables', desc: 'Todos tus indicadores macro están en niveles óptimos.' });
      
      return recs;
    }, [cargaDeuda, tasaAhorroAnual, scoreData.recs, mesesCobertura, deudasOrdenadas, totalVariablesAnual, totalFijosAnual, liquidezEfectiva, liquidezInvertida, gastoPromedioMes, historialMensual]);

    const topCategoriasAnual = useMemo(() => {
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

    // Componente Tooltip Customizado para Recharts
    const CustomAreaTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-[#0b0c16]/95 backdrop-blur-md border border-white/[0.1] p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8A92A6] mb-3 border-b border-white/[0.05] pb-2">{label}</p>
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between items-center gap-4 mb-2 text-sm font-black">
                <span style={{ color: entry.color }} className="capitalize">{entry.name}</span>
                <span className="text-white">{formatCOP(entry.value)}</span>
              </div>
            ))}
            <div className="border-t border-white/[0.05] mt-3 pt-2 flex justify-between items-center text-[11px] font-black">
              <span className="text-slate-400 uppercase tracking-widest">Neto</span>
              <span className={payload[0].value - payload[1].value >= 0 ? 'text-neoncyan' : 'text-neonmagenta'}>
                {formatCOP(payload[0].value - payload[1].value)}
              </span>
            </div>
          </div>
        );
      }
      return null;
    };

    // ============================================================================
    // RENDERIZADO UI
    // ============================================================================
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
        
        <header>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-wide">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neoncyan to-blue-600 flex items-center justify-center shadow-glow-cyan">
               <Activity className="text-[#0b0c16] w-6 h-6"/> 
            </div>
            Analítica y Estrategia
          </h1>
          <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
            Inteligencia financiera basada en tu histórico de datos.
          </p>
        </header>

        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 1: 4 PILARES DE LA SALUD FINANCIERA */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          
          <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-[24px] border border-transparent flex flex-col justify-center items-center text-center">
             <ScoreGauge score={scoreData.score} />
             <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8A92A6] mt-3">Score Motor</p>
          </div>

          <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-[24px] border border-transparent flex flex-col justify-center gap-2 relative overflow-hidden group">
            <div className={`absolute top-0 w-full h-1 left-0 ${tasaAhorroAnual >= 15 ? 'bg-neoncyan shadow-glow-cyan' : tasaAhorroAnual >= 5 ? 'bg-amber-400' : 'bg-neonmagenta shadow-glow-magenta'}`}></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8A92A6]">Tasa Ahorro</p>
            <p className={`text-2xl md:text-4xl font-black tabular-nums drop-shadow-md ${tasaAhorroAnual >= 15 ? 'text-neoncyan' : tasaAhorroAnual >= 5 ? 'text-amber-400' : 'text-neonmagenta'}`}>
              {tasaAhorroAnual.toFixed(1)}%
            </p>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded w-max ${tasaAhorroAnual >= 15 ? 'bg-neoncyan/10 text-neoncyan' : tasaAhorroAnual >= 5 ? 'bg-amber-400/10 text-amber-400' : 'bg-neonmagenta/10 text-neonmagenta'}`}>
              {tasaAhorroAnual >= 15 ? '🟢 Óptimo' : tasaAhorroAnual >= 5 ? '🟡 Moderado' : '🔴 Crítico'}
            </span>
          </div>

          <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-[24px] border border-transparent flex flex-col justify-center gap-2 relative overflow-hidden group">
            <div className={`absolute top-0 w-full h-1 left-0 ${cargaDeuda <= 20 ? 'bg-neoncyan shadow-glow-cyan' : cargaDeuda <= 40 ? 'bg-amber-400' : 'bg-neonmagenta shadow-glow-magenta'}`}></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8A92A6]">Carga Deuda</p>
            <p className={`text-2xl md:text-4xl font-black tabular-nums drop-shadow-md ${cargaDeuda <= 20 ? 'text-white' : cargaDeuda <= 40 ? 'text-amber-400' : 'text-neonmagenta'}`}>
              {cargaDeuda.toFixed(1)}%
            </p>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded w-max ${cargaDeuda <= 20 ? 'bg-neoncyan/10 text-neoncyan' : cargaDeuda <= 40 ? 'bg-amber-400/10 text-amber-400' : 'bg-neonmagenta/10 text-neonmagenta'}`}>
              {cargaDeuda <= 20 ? '🟢 Sano' : cargaDeuda <= 40 ? '🟡 Cuidado' : '🔴 Peligro'}
            </span>
          </div>

          <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-[24px] border border-transparent flex flex-col justify-center gap-2 relative overflow-hidden group">
            <div className={`absolute top-0 w-full h-1 left-0 ${flujoPromedioMes >= 0 ? 'bg-neoncyan shadow-glow-cyan' : 'bg-neonmagenta shadow-glow-magenta'}`}></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8A92A6]">Flujo Mensual Promedio</p>
            <p className={`text-xl md:text-2xl font-black tabular-nums drop-shadow-md truncate ${flujoPromedioMes >= 0 ? 'text-neoncyan' : 'text-neonmagenta'}`}>
              {formatCOP(flujoPromedioMes)}
            </p>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded w-max ${flujoPromedioMes >= 0 ? 'bg-neoncyan/10 text-neoncyan' : 'bg-neonmagenta/10 text-neonmagenta'}`}>
              {flujoPromedioMes >= 0 ? '✓ Superávit' : '⚠ Déficit Constante'}
            </span>
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* ✨ SECCIÓN 2: VISIÓN MACRO (Gráfica de Área Recharts) */}
        {/* ---------------------------------------------------- */}
        <div className="bg-appcard shadow-neumorph p-5 md:p-8 rounded-[30px] border border-white/[0.02] flex flex-col">
          <h2 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <BarChartIcon size={18} className="text-neoncyan" /> Visión Macro: Historial de Operaciones
          </h2>
          
          <div className="w-full h-[280px] bg-[#111222] shadow-neumorph-inset p-4 md:p-6 rounded-[24px] border border-transparent relative">
            {historialMensual.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historialMensual} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF007A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FF007A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" stroke="#8A92A6" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#8A92A6" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000000}M`} />
                  <RechartsTooltip content={<CustomAreaTooltip />} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#FF007A" strokeWidth={3} fillOpacity={1} fill="url(#colorEgresos)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">Esperando datos históricos...</div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 3: RADIOGRAFÍA DEL GASTO (Fugas y Estructura) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
               <Activity size={18} className="text-neonmagenta"/> Top 5 Fugas de Capital
            </h3>
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
                    <div className="w-full bg-[#111222] shadow-neumorph-inset rounded-full h-[12px] border border-transparent overflow-hidden">
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

          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col justify-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
               <PieChartIcon size={18} className="text-amber-400"/> Estructura de Gasto Real
            </h3>
            
            <div className="flex flex-col md:flex-row items-center gap-8 bg-[#111222] shadow-neumorph-inset border border-transparent rounded-[24px] p-6">
              <DonutChart fijos={totalFijosAnual} variables={totalVariablesAnual} />

              <div className="flex-1 space-y-4 w-full">
                <div className="bg-appcard shadow-neumorph border border-white/[0.02] p-4 rounded-2xl flex justify-between items-center hover:shadow-glow-amber transition-all">
                  <span className="text-[#8A92A6] font-black text-[10px] tracking-widest uppercase">Gastos Fijos</span>
                  <span className="text-amber-400 font-black text-lg tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{pctFijos.toFixed(1)}%</span>
                </div>

                <div className="bg-appcard shadow-neumorph border border-white/[0.02] p-4 rounded-2xl flex justify-between items-center hover:shadow-glow-cyan transition-all">
                  <span className="text-[#8A92A6] font-black text-[10px] tracking-widest uppercase">Gastos Variables</span>
                  <span className="text-neoncyan font-black text-lg tabular-nums drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">{pctVariables.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs font-black text-[#8A92A6] uppercase tracking-widest bg-[#111222] shadow-neumorph-inset py-2 px-4 rounded-xl border border-transparent inline-block">
                Relación (Fijo/Var): <strong className="text-white text-sm tracking-wide ml-2">{(totalVariablesAnual > 0 ? (totalFijosAnual/totalVariablesAnual).toFixed(1) : 0)} a 1</strong>
              </p>
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* SECCIÓN 4: ESTRATEGIA DE DEUDA Y RECOMENDACIONES */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ESTRATEGIA AVALANCHA */}
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm uppercase font-black tracking-widest text-white flex items-center gap-2">
                 <Target size={18} className="text-neonmagenta"/> Target: Avalancha
              </h2>
              <div className="px-3 py-1.5 bg-neonmagenta/10 text-neonmagenta rounded-lg text-[9px] font-black uppercase tracking-widest border border-neonmagenta/30 shadow-[0_0_10px_rgba(255,0,122,0.2)]">
                Ordenado por Tasa EA
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
                 </div>
               )}
            </div>
          </div>

          {/* INSIGHTS Y RECOMENDACIONES */}
          <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 flex flex-col">
             <div className="flex items-center gap-2 mb-6">
                <Zap className="text-amber-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"/>
                <h2 className="text-sm font-black tracking-widest uppercase text-white">Insights del Motor</h2>
             </div>
             
             <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[350px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32]">
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

      </div>
    );
  };

  return AnaliticaTabComponent;
})();
