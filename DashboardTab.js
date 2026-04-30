const DashboardTab = ({ flujoNetoMes, cuotasMesTotal, cuotasMesRestantes, ingresosMesTotal, egresosMesTotal, deudaTotal, liquidezTotal, selectedMonth, egresosMes, ingresos, egresos, presupuestos, pagosFijos, ingresosFijos, cuentas, proyeccionLiquidez, privacyMode }) => {
  const { useState, useMemo } = React;
  
  // ✨ Importamos los componentes de Recharts desde el objeto global window
  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip: RechartsTooltip } = window.Recharts;

  const [expandedCard, setExpandedCard] = useState(null);
  const toggleCard = (cardId) => setExpandedCard(prev => prev === cardId ? null : cardId);

  const formatCOP = (val) => {
    if (privacyMode) return '****';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  // Íconos SVG
  const ChevronRight = ({ size=18, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
  const AlertCircle = ({ size=16, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
  const Calculator = ({ size=18, className="" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line><line x1="8" y1="14" x2="12" y2="14"></line><line x1="8" y1="10" x2="12" y2="10"></line><line x1="8" y1="18" x2="12" y2="18"></line></svg>;

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

  const idsTarjetas = cuentas.filter(c => c.type === 'credit').map(c => c.id);

  const totalPresupuestadoFijo = pagosFijos ? pagosFijos.reduce((sum, item) => sum + item.monto, 0) : 0;
  const totalPresupuestadoVar = presupuestos ? presupuestos.reduce((sum, item) => sum + item.limite, 0) : 0;
  const presupuestoTotal = totalPresupuestadoFijo + totalPresupuestadoVar;

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

  const isPagoFijoRealizado = (pf) => egresosMes.some(e => {
    if (e.tipo !== 'Fijo') return false;
    if (e.pagoFijoId) return e.pagoFijoId === pf.id;
    return e.descripcion.toLowerCase() === (pf.descripcion || '').toLowerCase();
  });
  const pagosFijosPendientesTotal = pagosFijos ? pagosFijos.filter(pf => !isPagoFijoRealizado(pf)).reduce((sum, pf) => sum + pf.monto, 0) : 0;

  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const pagosPorVencer = pagosFijos ? pagosFijos.filter(pf => {
    if (isPagoFijoRealizado(pf)) return false;
    const dia = pf.diaPago || 1;
    return dia >= diaHoy && dia <= diaHoy + 7;
  }).sort((a, b) => (a.diaPago || 1) - (b.diaPago || 1)) : [];

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

  // ============================================================================
  // PREPARACIÓN DE DATOS PARA EL GRÁFICO DE DONA (RECHARTS)
  // ============================================================================
  const datosGrafico = useMemo(() => {
    const agrupados = egresosMes.reduce((acc, egreso) => {
      acc[egreso.categoria] = (acc[egreso.categoria] || 0) + egreso.monto;
      return acc;
    }, {});
    
    return Object.keys(agrupados)
      .map(cat => ({ name: cat, value: agrupados[cat] }))
      .sort((a, b) => b.value - a.value); // De mayor a menor
  }, [egresosMes]);

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

  const EmptyStateIlustrado = () => (
    <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500 w-full h-full min-h-[250px]">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-neoncyan/20 blur-xl rounded-full animate-pulse"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-neoncyan drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
      </div>
      <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Lienzo en blanco</h3>
      <p className="text-[#8A92A6] text-xs font-bold w-3/4 mx-auto">No hay gastos registrados en este mes. ¡El motor está listo para arrancar!</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">Dashboard Global</h1>
        <p className="text-sm md:text-base text-[#8A92A6] mt-1 font-medium tracking-wide">Resumen de flujos, analítica de egresos y proyecciones.</p>
      </header>

      {/* 1. TARJETAS DE RESUMEN SUPERIORES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="flex flex-col justify-center">
          <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Ingresos (Mes)</h3>
          <p className="text-xl md:text-2xl font-black text-neoncyan mt-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] truncate">
            {formatCOP(ingresosMesTotal)}
          </p>
        </Card>
        
        <Card onClick={() => toggleCard('egresos')} className="flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Egresos Totales</h3>
              <p className="text-xl md:text-2xl font-black text-neonmagenta mt-1 drop-shadow-[0_0_8px_rgba(255,0,122,0.4)] truncate">
                {formatCOP(egresosMesTotal)}
              </p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'egresos' ? 'rotate-90' : ''}`} />
          </div>
          {expandedCard === 'egresos' && (
            <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2">
              <ul className="space-y-3 text-xs">
                {datosGrafico.map((entry, index) => (
                  <li key={entry.name} className="flex justify-between items-center">
                    <span className="truncate pr-2 font-bold text-white" style={{ color: COLORS[index % COLORS.length] }}>{entry.name}</span>
                    <span className="font-black text-white">{formatCOP(entry.value)}</span>
                  </li>
                ))}
                {datosGrafico.length === 0 && <li className="text-slate-500 text-center py-2 font-bold">Sin egresos</li>}
              </ul>
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-center">
          <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Flujo del mes</h3>
          <p className={`text-xl md:text-2xl font-black mt-1 truncate ${dineroDisponible >= 0 ? 'text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]'}`}>
            {formatCOP(dineroDisponible)}
          </p>
        </Card>

        <Card onClick={() => toggleCard('cuentas')} className="flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Dinero Cuentas</h3>
              <p className="text-xl md:text-2xl font-black text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] truncate">
                {formatCOP(totalDineroCuentas)}
              </p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'cuentas' ? 'rotate-90' : ''}`} />
          </div>
          {expandedCard === 'cuentas' && (
            <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-black text-neoncyan uppercase mb-2">Cuentas Leo</h4>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#8A92A6] font-bold">Bancos</span>
                  <span className="font-black text-white">{formatCOP(liquidezLeoCuentas)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8A92A6] font-bold">Efectivo</span>
                  <span className="font-black text-white">{formatCOP(liquidezLeoEfectivo)}</span>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-neonmagenta uppercase mb-2">Cuentas Andre</h4>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#8A92A6] font-bold">Bancos</span>
                  <span className="font-black text-white">{formatCOP(liquidezAndreCuentas)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8A92A6] font-bold">Efectivo</span>
                  <span className="font-black text-white">{formatCOP(liquidezAndreEfectivo)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
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

      {/* 3. GRÁFICOS Y ÚLTIMOS MOVIMIENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* GRÁFICO DE DONA */}
        <div className="md:col-span-1 bg-appcard shadow-neumorph p-5 rounded-2xl border border-white/[0.02] flex flex-col">
          <h2 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-400"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Distribución de Gastos
          </h2>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
            {datosGrafico.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={datosGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {datosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 0px 5px ${COLORS[index % COLORS.length]}80)` }} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Leyenda minimalista */}
                <div className="w-full mt-4 space-y-2 max-h-[100px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                  {datosGrafico.slice(0, 5).map((entry, index) => (
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

        {/* ÚLTIMOS MOVIMIENTOS */}
        <div className="md:col-span-2 bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-transparent flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-neoncyan"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Últimos Movimientos
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 h-[300px]">
            {egresosMes.length === 0 ? (
              <EmptyStateIlustrado />
            ) : (
              <div className="space-y-3">
                {egresosMes.slice(0, 8).map(e => (
                  <div key={e.id} className="flex justify-between items-center p-3.5 bg-appcard border border-white/[0.02] rounded-xl hover:border-white/[0.05] transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.tipo === 'Fijo' ? 'bg-amber-500/10 text-amber-400' : 'bg-neoncyan/10 text-neoncyan'}`}>
                        {e.tipo === 'Fijo' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                      </div>
                      <div className="truncate pr-2">
                        <p className="text-sm font-bold text-white tracking-wide truncate">{e.descripcion}</p>
                        <p className="text-[9px] text-[#8A92A6] font-black uppercase tracking-widest mt-0.5 truncate">{e.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-neonmagenta tabular-nums drop-shadow-[0_0_3px_rgba(255,0,122,0.3)]">-{formatCOP(e.monto)}</p>
                      <p className="text-[9px] text-slate-500 font-bold tracking-widest mt-0.5">{e.fecha.slice(8,10)}/{e.fecha.slice(5,7)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. RESUMEN EN VIVO (LEO VS ANDRE) */}
      <Card className="flex flex-col">
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
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span>
                <span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(proyIngLeo)}</span>
              </div>
              <span className="font-black text-emerald-400">{formatCOP(ingLeo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#8A92A6]">Total Egresos</span>
              <span className="font-black text-neonmagenta">{formatCOP(egrLeo)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-4 border-t border-white/[0.05] items-center">
              <span className="text-white">Flujo Leo</span>
              <span className={ingLeo - egrLeo >= 0 ? 'text-neoncyan' : 'text-neonmagenta'}>
                {formatCOP(ingLeo - egrLeo)}
              </span>
            </div>
          </div>

          {/* ANDRE */}
          <div className="space-y-5 lg:border-r lg:border-white/[0.05] lg:pr-6">
            <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neonmagenta shadow-glow-magenta"></div> 2. Flujo Mes Andre
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span>
                <span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(proyIngAndre)}</span>
              </div>
              <span className="font-black text-emerald-400">{formatCOP(ingAndre)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#8A92A6]">Total Egresos</span>
              <span className="font-black text-neonmagenta">{formatCOP(egrAndre)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-4 border-t border-white/[0.05] items-center">
              <span className="text-white">Flujo Andre</span>
              <span className={ingAndre - egrAndre >= 0 ? 'text-neoncyan' : 'text-neonmagenta'}>
                {formatCOP(ingAndre - egrAndre)}
              </span>
            </div>
          </div>

          {/* HOGAR */}
          <div className="space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]"></div> 3. Consolidado Hogar
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span>
                <span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(proyeccionIngresosMes)}</span>
              </div>
              <span className="font-black text-emerald-400">{formatCOP(ingresosMesTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#8A92A6]">Fijos (Sin TC)</span>
                <span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(totalPresupuestadoFijo)}</span>
              </div>
              <span className="font-black text-amber-400">{formatCOP(gastadoFijoSinTC)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#8A92A6]">Var. (Sin TC)</span>
                <span className="text-[10px] font-bold text-slate-600">Proy: {formatCOP(totalPresupuestadoVar)}</span>
              </div>
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
      </Card>
      
    </div>
  );
};
