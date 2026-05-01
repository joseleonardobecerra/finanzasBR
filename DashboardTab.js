const DashboardTab = ({ flujoNetoMes, cuotasMesTotal, cuotasMesRestantes, ingresosMesTotal, egresosMesTotal, deudaTotal, liquidezTotal, selectedMonth, egresosMes, ingresos, egresos, presupuestos, pagosFijos, ingresosFijos, cuentas, proyeccionLiquidez, privacyMode }) => {
  const { useState, useMemo } = React;
  
  // ✨ Importamos los componentes de Recharts
  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip: RechartsTooltip } = window.Recharts;

  const [chartFilter, setChartFilter] = useState('Todos');
  const [expandedCard, setExpandedCard] = useState(null);
  
  const toggleCard = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

  // ✨ MODO PRIVACIDAD APLICADO
  const formatCOP = (val) => {
    if (privacyMode) return '****';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  // Íconos SVG
  const ChevronRight = ({ size=18, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
  const AlertCircle = ({ size=16, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
  const Calculator = ({ size=18, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line><line x1="8" y1="14" x2="12" y2="14"></line><line x1="8" y1="10" x2="12" y2="10"></line><line x1="8" y1="18" x2="12" y2="18"></line></svg>;
  const BarChartIcon = ({ size=18, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
  const BarChart3 = ({ size=18, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>;

  // ============================================================================
  // LÓGICA DE DATOS
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

  const tarjetasCredito = cuentas.filter(c => c.type === 'credit');
  const idsTarjetas = tarjetasCredito.map(c => c.id);

  // Sumas de presupuestos configurados
  const totalPresupuestadoFijo = pagosFijos ? pagosFijos.reduce((sum, item) => sum + item.monto, 0) : 0;
  const totalPresupuestadoTC = tarjetasCredito.reduce((sum, tc) => sum + (Number(tc.cuotaMinima) || 0), 0);
  const totalPresupuestadoVar = presupuestos ? presupuestos.reduce((sum, item) => sum + item.limite, 0) : 0;
  const presupuestoTotal = totalPresupuestadoFijo + totalPresupuestadoTC + totalPresupuestadoVar;

  const proyIngLeo = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyIngAndre = ingresosFijos ? ingresosFijos.filter(i => identifyOwner(null, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + Number(i.monto), 0) : 0;
  const proyeccionIngresosMes = ingresosFijos ? ingresosFijos.reduce((sum, item) => sum + Number(item.monto), 0) : 0; 
  const totalProyeccionMes = proyeccionIngresosMes - presupuestoTotal;

  const ingresosMesActual = ingresos.filter(i => i.fecha.startsWith(selectedMonth));
  const ingLeo = ingresosMesActual.filter(i => identifyOwner(i.cuentaId, i.persona, i.descripcion) === 'Leo').reduce((s, i) => s + i.monto, 0);
  const ingAndre = ingresosMesActual.filter(i => identifyOwner(i.cuentaId, i.persona, i.descripcion) === 'Andre').reduce((s, i) => s + i.monto, 0);

  const egrLeo = egresosMes.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Leo').reduce((s, e) => s + e.monto, 0);
  const egrAndre = egresosMes.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Andre').reduce((s, e) => s + e.monto, 0);

  const gastadoFijoSinTC = egresosMes.filter(e => e.tipo === 'Fijo' && !idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);
  const gastadoVarSinTC = egresosMes.filter(e => e.tipo !== 'Fijo' && !idsTarjetas.includes(e.cuentaId)).reduce((s, e) => s + e.monto, 0);

  const pagosTC = egresosMes.filter(e => idsTarjetas.includes(e.cuentaId));
  const pagosTCLeo = pagosTC.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Leo').reduce((s, e) => s + e.monto, 0);
  const pagosTCAndre = pagosTC.filter(e => identifyOwner(e.cuentaId, null, e.descripcion) === 'Andre').reduce((s, e) => s + e.monto, 0);

  const dineroDisponible = ingresosMesTotal - egresosMesTotal;

  // ============================================================================
  // ✨ DETECCIÓN A PRUEBA DE BALAS DE PAGOS PENDIENTES
  // ============================================================================
  const isPagoFijoRealizado = (pf) => egresosMes.some(e => {
    if (e.tipo !== 'Fijo') return false;
    if (e.pagoFijoId === pf.id) return true;
    
    // Fallback inteligente para nombres viejos o variaciones
    const descE = e.descripcion.toLowerCase();
    const descP = (pf.descripcion || '').toLowerCase();
    return descE === descP || descE.includes(descP);
  });

  const isTCPagada = (tc) => egresosMes.some(e => {
    if (e.pagoTarjetaId === tc.id) return true;
    if (e.deudaId === tc.id && e.tipo === 'Fijo') return true;
    
    // Fallback inteligente para tarjetas
    const descE = e.descripcion.toLowerCase();
    const tcName = tc.name.toLowerCase();
    return (descE.includes(tcName) && e.tipo === 'Fijo');
  });

  // Filtramos para evitar que TCs viejas en la tabla de Fijos sumen doble
  const pagosFijosReales = pagosFijos ? pagosFijos.filter(pf => 
    !tarjetasCredito.some(tc => tc.name.toLowerCase() === (pf.descripcion || '').toLowerCase())
  ) : [];

  const pagosFijosPtes = pagosFijosReales.filter(pf => !isPagoFijoRealizado(pf)).reduce((sum, pf) => sum + pf.monto, 0);
  const tcPtes = tarjetasCredito.filter(tc => !isTCPagada(tc)).reduce((sum, tc) => sum + (Number(tc.cuotaMinima) || 0), 0);
  
  const pagosFijosPendientesTotal = pagosFijosPtes + tcPtes;

  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const pagosPorVencer = pagosFijosReales.filter(pf => {
    if (isPagoFijoRealizado(pf)) return false;
    const dia = pf.diaPago || 1;
    return dia >= diaHoy && dia <= diaHoy + 7;
  }).sort((a, b) => (a.diaPago || 1) - (b.diaPago || 1));

  // ============================================================================
  // LIQUIDEZ Y CATEGORÍAS
  // ============================================================================
  const liquidezAccounts = cuentas.filter(c => ['bank', 'cash'].includes(c.type) && !c.name.toLowerCase().includes('rappi'));
  let liquidezLeoCuentas = 0; let liquidezLeoEfectivo = 0;
  let liquidezAndreCuentas = 0; let liquidezAndreEfectivo = 0;

  liquidezAccounts.forEach(c => {
     const owner = identifyOwner(c.id, null, c.name);
     if (owner === 'Leo') {
         if (c.type === 'cash') liquidezLeoEfectivo += c.currentBalance;
         else liquidezLeoCuentas += c.currentBalance;
     } else if (owner === 'Andre') {
         if (c.type === 'cash') liquidezAndreEfectivo += c.currentBalance;
         else liquidezAndreCuentas += c.currentBalance;
     }
  });

  const totalDineroCuentas = liquidezLeoCuentas + liquidezLeoEfectivo + liquidezAndreCuentas + liquidezAndreEfectivo;

  const getMacroCategoria = (catName) => {
      if (!catName) return 'Otros Gastos';
      const lower = catName.toLowerCase();
      
      if (lower.includes('tarjeta') || lower.includes('crédito') || lower.includes('credito') || lower.includes('interes') || lower.includes('davibank') || lower.includes('lulo')) return 'Tarjetas y Créditos';
      if (lower.includes('vehículo') || lower.includes('vehiculo') || lower.includes('gasolina') || lower.includes('peaje') || lower.includes('parqueadero')) return 'Vehículo y Gasolina';
      if (lower.includes('hogar') || lower.includes('aseo') || lower.includes('agua') || lower.includes('públicos') || lower.includes('publicos') || lower.includes('internet') || lower.includes('administración') || lower.includes('gas') || lower.includes('arriendo')) return 'Hogar y Servicios';
      if (lower.includes('mercado') || lower.includes('alimentación') || lower.includes('alimentacion') || lower.includes('comida') || lower.includes('panadería') || lower.includes('restaurante')) return 'Mercado y Alimentación';
      if (lower.includes('seguro') || lower.includes('salud') || lower.includes('médico') || lower.includes('medico') || lower.includes('farmacia')) return 'Seguros y Salud';
      if (lower.includes('tobías') || lower.includes('tobias') || lower.includes('salomé') || lower.includes('salome') || lower.includes('niños') || lower.includes('colegio') || lower.includes('educación') || lower.includes('natación')) return 'Tobías y Salomé';
      if (lower === 'andre' || lower === 'andrea' || lower.includes('ropa andre')) return 'Andre';
      if (lower === 'leo' || lower.includes('ropa leo')) return 'Leo';
      if (lower.includes('inversión') || lower.includes('inversion') || lower.includes('ahorro')) return 'Inversión y Ahorro';
      
      return catName; 
  };

  // ============================================================================
  // PREPARACIÓN DE DATOS PARA GRÁFICOS
  // ============================================================================
  const chartData = useMemo(() => {
    const gastosFiltrados = chartFilter === 'Todos' ? egresosMes : egresosMes.filter(e => e.tipo === chartFilter);
    const gastosPorCategoria = {};
    
    gastosFiltrados.forEach(g => {
      const catOriginal = g.categoria || 'Otros';
      const interesOriginal = g.interesesOtros || 0;
      const capitalGasto = g.monto - interesOriginal;
      
      const macroCat = getMacroCategoria(catOriginal);
      const macroInteres = getMacroCategoria('Intereses y Cargos');
      
      if (capitalGasto > 0) gastosPorCategoria[macroCat] = (gastosPorCategoria[macroCat] || 0) + capitalGasto;
      if (interesOriginal > 0) gastosPorCategoria[macroInteres] = (gastosPorCategoria[macroInteres] || 0) + interesOriginal;
    });
    
    return Object.entries(gastosPorCategoria)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [egresosMes, chartFilter]);

  const COLORS = ['#00E5FF', '#FF007A', '#FBBF24', '#34D399', '#818CF8', '#F472B6', '#A78BFA', '#38BDF8', '#FB923C', '#4ADE80'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-appcard/95 backdrop-blur-md border border-white/[0.05] p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8A92A6] mb-1">{payload[0].name}</p>
          <p className="text-sm font-black text-white" style={{ color: payload[0].payload.fill }}>
            {formatCOP(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const trendData = useMemo(() => {
    const APP_START = '2026-04';
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(`${selectedMonth}-01T12:00:00`);
      d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().slice(0, 7);
      
      if (mStr >= APP_START) {
        const label = d.toLocaleString('es-ES', { month: 'short' }).replace(/^\w/, c=>c.toUpperCase());
        const tIng = ingresos.filter(x => x.fecha.startsWith(mStr)).reduce((s, x) => s + x.monto, 0);
        const tEgr = egresos.filter(x => x.fecha.startsWith(mStr)).reduce((s, x) => s + x.monto, 0);
        data.push({ mes: mStr, label, ing: tIng, egr: tEgr });
      }
    }
    return data;
  }, [ingresos, egresos, selectedMonth]);

  const maxTrendVal = Math.max(...trendData.map(d => Math.max(d.ing, d.egr)), 1);

  const EmptyStateIlustrado = () => (
    <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500 w-full h-full min-h-[200px]">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-neoncyan/20 blur-xl rounded-full animate-pulse"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-neoncyan drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        </svg>
      </div>
      <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">Sin datos</h3>
      <p className="text-[#8A92A6] text-[10px] font-bold w-3/4 mx-auto">Motor listo para arrancar.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">Dashboard Global</h1>
        <p className="text-sm md:text-base text-[#8A92A6] mt-1 font-medium tracking-wide">Resumen de flujos, analítica de egresos y proyecciones.</p>
      </header>

      {/* 1. TARJETAS DE RESUMEN SUPERIORES */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        
        <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center">
          <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Ingresos (Mes)</h3>
          <p className="text-xl md:text-3xl font-black text-neoncyan mt-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] truncate">
            {formatCOP(ingresosMesTotal)}
          </p>
        </div>
        
        <div onClick={() => toggleCard('egresos')} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Egresos Totales</h3>
              <p className="text-xl md:text-3xl font-black text-neonmagenta mt-1 drop-shadow-[0_0_8px_rgba(255,0,122,0.4)] truncate">
                {formatCOP(egresosMesTotal)}
              </p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'egresos' ? 'rotate-90' : ''}`} />
          </div>
          {expandedCard === 'egresos' && (
            <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2">
              <ul className="space-y-3 text-xs">
                {chartData.map((entry, index) => (
                  <li key={entry.name} className="flex justify-between items-center">
                    <span className="truncate pr-2 font-bold text-white" style={{ color: COLORS[index % COLORS.length] }}>{entry.name}</span>
                    <span className="font-black text-white">{formatCOP(entry.value)}</span>
                  </li>
                ))}
                {chartData.length === 0 && <li className="text-slate-500 text-center py-2 font-bold">Sin egresos</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-neoncyan/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10">Flujo del mes</h3>
          <p className={`text-xl md:text-3xl font-black mt-1 truncate relative z-10 ${dineroDisponible >= 0 ? 'text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]'}`}>
            {formatCOP(dineroDisponible)}
          </p>
        </div>
        
        {/* ✨ TARJETA RECALCULADA A $0 AUTOMÁTICAMENTE */}
        <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center">
          <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Pagos Fijos Ptes.</h3>
          <p className="text-xl md:text-3xl font-black text-amber-400 mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] truncate">
            {formatCOP(pagosFijosPendientesTotal)}
          </p>
        </div>
        
        <div onClick={() => toggleCard('presupuesto')} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Presupuesto Config.</h3>
              <p className="text-xl md:text-3xl font-black text-white mt-1 truncate">
                {formatCOP(presupuestoTotal)}
              </p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'presupuesto' ? 'rotate-90' : ''}`} />
          </div>
          {expandedCard === 'presupuesto' && (
            <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-[#8A92A6] font-bold">Gastos Fijos</span>
                <span className="font-black text-amber-400">{formatCOP(totalPresupuestadoFijo)}</span>
              </div>
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-[#8A92A6] font-bold">Cuotas TC</span>
                <span className="font-black text-indigo-400">{formatCOP(totalPresupuestadoTC)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8A92A6] font-bold">Gastos Variables</span>
                <span className="font-black text-neoncyan">{formatCOP(totalPresupuestadoVar)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div onClick={() => toggleCard('cuentas')} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Dinero Cuentas</h3>
              <p className="text-xl md:text-3xl font-black text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] truncate">
                {formatCOP(totalDineroCuentas)}
              </p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'cuentas' ? 'rotate-90' : ''}`} />
          </div>
          {expandedCard === 'cuentas' && (
            <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-black text-neoncyan uppercase mb-2">Cuentas Leo</h4>
                <div className="flex justify-between items-center text-xs mb-1.5"><span className="text-[#8A92A6] font-bold">Bancos</span><span className="font-black text-white">{formatCOP(liquidezLeoCuentas)}</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-[#8A92A6] font-bold">Efectivo</span><span className="font-black text-white">{formatCOP(liquidezLeoEfectivo)}</span></div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-neonmagenta uppercase mb-2">Cuentas Andre</h4>
                <div className="flex justify-between items-center text-xs mb-1.5"><span className="text-[#8A92A6] font-bold">Bancos</span><span className="font-black text-white">{formatCOP(liquidezAndreCuentas)}</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-[#8A92A6] font-bold">Efectivo</span><span className="font-black text-white">{formatCOP(liquidezAndreEfectivo)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ALERTAS: PAGOS PRÓXIMOS A VENCER */}
      {pagosPorVencer.length > 0 && (
        <div className="bg-appcard border-l-4 border-amber-500 rounded-[20px] p-5 shadow-neumorph flex flex-col gap-4 animate-in fade-in">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16}/> Pagos fijos venciendo (Próx. 7 días)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pagosPorVencer.map(pf => (
              <div key={pf.id} className="flex justify-between items-center bg-[#111222] shadow-neumorph-inset rounded-xl px-4 py-3 border border-transparent hover:border-amber-500/30 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[140px]">{pf.descripcion}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-0.5">Día {pf.diaPago || 1}</p>
                </div>
                <p className="text-sm font-black text-amber-400">{formatCOP(pf.monto)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RESUMEN EN VIVO (LEO VS ANDRE) */}
      <div className="bg-appcard shadow-neumorph p-5 md:p-8 rounded-2xl border border-white/[0.02] flex flex-col">
        <h2 className="text-sm font-black text-white mb-5 flex items-center gap-2 uppercase tracking-widest">
          <Calculator size={18} className="text-neoncyan" /> Resumen y Realidad (En Vivo)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#111222] shadow-neumorph-inset p-5 md:p-8 rounded-2xl border border-white/[0.02]">
          
          {/* LEO */}
          <div className="space-y-5 lg:border-r lg:border-white/[0.05] lg:pr-6">
            <h3 className="text-xs font-black text-neoncyan uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neoncyan shadow-glow-cyan"></div> 1. Flujo mes Leo
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span><span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(proyIngLeo)}</span></div>
              <span className="font-black text-emerald-400">{formatCOP(ingLeo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#8A92A6]">Total Egresos</span>
              <span className="font-black text-neonmagenta">{formatCOP(egrLeo)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-4 border-t border-white/[0.05] items-center">
              <span className="text-white">Flujo Leo</span>
              <span className={ingLeo - egrLeo >= 0 ? 'text-neoncyan' : 'text-neonmagenta'}>{formatCOP(ingLeo - egrLeo)}</span>
            </div>
          </div>

          {/* ANDRE */}
          <div className="space-y-5 lg:border-r lg:border-white/[0.05] lg:pr-6">
            <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neonmagenta shadow-glow-magenta"></div> 2. Flujo Mes Andre
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span><span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(proyIngAndre)}</span></div>
              <span className="font-black text-emerald-400">{formatCOP(ingAndre)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#8A92A6]">Total Egresos</span>
              <span className="font-black text-neonmagenta">{formatCOP(egrAndre)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-4 border-t border-white/[0.05] items-center">
              <span className="text-white">Flujo Andre</span>
              <span className={ingAndre - egrAndre >= 0 ? 'text-neoncyan' : 'text-neonmagenta'}>{formatCOP(ingAndre - egrAndre)}</span>
            </div>
          </div>

          {/* HOGAR */}
          <div className="space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]"></div> 3. Consolidado Hogar
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span><span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(proyeccionIngresosMes)}</span></div>
              <span className="font-black text-emerald-400">{formatCOP(ingresosMesTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-xs font-bold text-[#8A92A6]">Fijos (Sin TC)</span><span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(totalPresupuestadoFijo)}</span></div>
              <span className="font-black text-amber-400">{formatCOP(gastadoFijoSinTC)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-xs font-bold text-[#8A92A6]">Var. (Sin TC)</span><span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(totalPresupuestadoVar)}</span></div>
              <span className="font-black text-neoncyan">{formatCOP(gastadoVarSinTC)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#8A92A6]">Tarjetas Crédito</span>
              <span className="font-black text-neonmagenta">{formatCOP(pagosTCLeo + pagosTCAndre)}</span>
            </div>
            <div className="flex justify-between text-sm items-center border-t border-white/[0.05] pt-4 mt-2">
              <span className="text-white font-bold">Total Egresos</span>
              <span className="font-black text-neonmagenta">{formatCOP(egresosMesTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-3 border-t border-white/[0.05] items-center">
              <div className="flex flex-col">
                <span className="text-white">TOTAL REAL</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Esperado: {formatCOP(totalProyeccionMes)}</span>
              </div>
              <span className={dineroDisponible >= 0 ? 'text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]'}>
                {formatCOP(dineroDisponible)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. GRÁFICAS DE TENDENCIA Y DISTRIBUCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICA: TENDENCIA 6 MESES */}
        <div className="bg-appcard shadow-neumorph p-5 rounded-2xl border border-white/[0.02] flex flex-col">
          <h2 className="text-sm font-black text-white mb-8 flex items-center gap-2 uppercase tracking-widest">
            <BarChartIcon size={18} className="text-neoncyan" /> Tendencia Histórica
          </h2>
          <div className="flex-1 flex items-end justify-between gap-3 h-[200px] pb-4 border-b border-white/[0.05]">
            {trendData.map((d, i) => {
              const hInc = (d.ing / maxTrendVal) * 100;
              const hExp = (d.egr / maxTrendVal) * 100;
              const flujoAnterior = d.ing - d.egr;
              return (
                <div key={i} className="flex flex-col items-center w-full h-full justify-end group relative">
                  <div className="flex gap-1.5 w-full justify-center items-end h-full">
                    <div style={{ height: `${Math.max(hInc, 2)}%` }} className="w-1/3 max-w-[14px] bg-gradient-to-t from-[#111222] to-neoncyan rounded-t-md shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all group-hover:shadow-[0_0_15px_rgba(0,229,255,0.6)]"></div>
                    <div style={{ height: `${Math.max(hExp, 2)}%` }} className="w-1/3 max-w-[14px] bg-gradient-to-t from-[#111222] to-neonmagenta rounded-t-md shadow-[0_0_10px_rgba(255,0,122,0.2)] transition-all group-hover:shadow-[0_0_15px_rgba(255,0,122,0.6)]"></div>
                  </div>
                  
                  {/* Tooltip Hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-20 bg-appcard shadow-neumorph border border-white/[0.05] p-3 rounded-xl whitespace-nowrap z-10 pointer-events-none transition-all duration-300">
                    <p className="text-neoncyan font-black text-xs mb-1">Ing: {formatCOP(d.ing)}</p>
                    <p className="text-neonmagenta font-black text-xs mb-2">Egr: {formatCOP(d.egr)}</p>
                    <div className="border-t border-white/[0.05] my-1 pt-1"></div>
                    <p className={`font-black text-xs ${flujoAnterior >= 0 ? 'text-white' : 'text-amber-500'}`}>Neto: {formatCOP(flujoAnterior)}</p>
                  </div>
                </div>
              )
            })}
            {trendData.length === 0 && (
               <div className="w-full text-center text-slate-500 font-bold text-xs pb-10">Esperando datos...</div>
            )}
          </div>
          <div className="flex justify-between mt-3 px-2">
            {trendData.map((d, i) => <span key={i} className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest">{d.label}</span>)}
          </div>
          <div className="flex justify-center gap-6 mt-6 text-[10px] font-black text-[#8A92A6] uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neoncyan shadow-glow-cyan"></div> Ingresos</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neonmagenta shadow-glow-magenta"></div> Egresos</span>
          </div>
        </div>

        {/* GRÁFICO: DISTRIBUCIÓN DONA RECHARTS */}
        <div className="bg-appcard shadow-neumorph p-5 rounded-2xl border border-white/[0.02] flex flex-col">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-3">
            <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <BarChart3 size={18} className="text-neonmagenta" /> Distribución
            </h2>
            {/* Filtros */}
            <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1.5 w-full xl:w-auto border border-transparent">
              <button onClick={()=>setChartFilter('Todos')} className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartFilter==='Todos' ? 'bg-neonmagenta text-white shadow-glow-magenta' : 'text-[#8A92A6] hover:text-white'}`}>Todos</button>
              <button onClick={()=>setChartFilter('Fijo')} className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartFilter==='Fijo' ? 'bg-amber-500 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-[#8A92A6] hover:text-white'}`}>Fijos</button>
              <button onClick={()=>setChartFilter('Variable')} className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartFilter==='Variable' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-[#8A92A6] hover:text-white'}`}>Var</button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 0px 5px ${COLORS[index % COLORS.length]}80)` }} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="w-full mt-4 space-y-2 max-h-[100px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                  {chartData.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-[10px] font-bold">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 5px ${COLORS[index % COLORS.length]}` }}></div>
                        <span className="text-slate-300 uppercase tracking-widest truncate">{entry.name}</span>
                      </div>
                      <span className="text-white tabular-nums shrink-0">{formatCOP(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyStateIlustrado />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
