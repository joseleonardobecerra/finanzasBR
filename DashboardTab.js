const DashboardTab = ({ flujoNetoMes, cuotasMesTotal, cuotasMesRestantes, ingresosMesTotal, egresosMesTotal, deudaTotal, liquidezTotal, selectedMonth, egresosMes, ingresos, egresos, presupuestos, pagosFijos, ingresosFijos, cuentas, proyeccionLiquidez }) => {
  const { useState, useMemo } = React;
  const [chartFilter, setChartFilter] = useState('Todos');
  const [expandedCard, setExpandedCard] = useState(null);
  
  const toggleCard = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

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

  // FIX: detección de pago realizado consistente con EgresosTab (ID primero, texto exacto fallback)
  const isPagoFijoRealizado = (pf) => egresosMes.some(e => {
    if (e.tipo !== 'Fijo') return false;
    if (e.pagoFijoId) return e.pagoFijoId === pf.id;
    return e.descripcion.toLowerCase() === (pf.descripcion || '').toLowerCase();
  });
  const pagosFijosPendientesTotal = pagosFijos ? pagosFijos.filter(pf => !isPagoFijoRealizado(pf)).reduce((sum, pf) => sum + pf.monto, 0) : 0;

  // ✨ ALERTAS DE PAGOS PRÓXIMOS A VENCER (próximos 7 días)
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

  // ✨ MOTOR DE MACRO-CATEGORÍAS (Agrupa los datos solo para visualización)
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
      
      return catName; // Si no cuadra en ninguna, muestra su nombre original
  };

  const gastosFiltrados = chartFilter === 'Todos' ? egresosMes : egresosMes.filter(e => e.tipo === chartFilter);
  const gastosPorCategoria = {};
  
  gastosFiltrados.forEach(g => {
    const catOriginal = g.categoria || 'Otros';
    const interesOriginal = g.interesesOtros || 0;
    const capitalGasto = g.monto - interesOriginal;
    
    // Aplicamos el conversor a las "Bolsas" grandes
    const macroCat = getMacroCategoria(catOriginal);
    const macroInteres = getMacroCategoria('Intereses y Cargos');
    
    if (capitalGasto > 0) gastosPorCategoria[macroCat] = (gastosPorCategoria[macroCat] || 0) + capitalGasto;
    if (interesOriginal > 0) gastosPorCategoria[macroInteres] = (gastosPorCategoria[macroInteres] || 0) + interesOriginal;
  });
  
  const chartData = Object.entries(gastosPorCategoria).sort((a,b)=>b[1]-a[1]);
  const maxMonto = chartData.length > 0 ? chartData[0][1] : 1;

  const trendData = useMemo(() => {
    return Array.from({length: 6}, (_, i) => {
      const d = new Date(`${selectedMonth}-01T12:00:00`);
      d.setMonth(d.getMonth() - 5 + i);
      const mStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('es-ES', { month: 'short' }).replace(/^\w/, c=>c.toUpperCase());
      const tIng = ingresos.filter(x => x.fecha.startsWith(mStr)).reduce((s, x) => s + x.monto, 0);
      const tEgr = egresos.filter(x => x.fecha.startsWith(mStr)).reduce((s, x) => s + x.monto, 0);
      return { mes: mStr, label, ing: tIng, egr: tEgr };
    });
  }, [ingresos, egresos, selectedMonth]);

  const maxTrendVal = Math.max(...trendData.map(d => Math.max(d.ing, d.egr)), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Inicio y Dashboard Global</h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">Resumen de flujos, PowerBI de egresos y proyecciones.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-5 border-t-4 border-t-emerald-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Ingresos Totales (Mes)</h3>
          <p className="text-lg md:text-2xl font-bold text-emerald-400 mt-1">{formatCOP(ingresosMesTotal)}</p>
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 border-t-rose-500 transition-colors ${expandedCard === 'egresos' ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => toggleCard('egresos')}>
            <div className="flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs md:text-sm font-medium">Egresos Totales</h3>
              <p className="text-lg md:text-2xl font-bold text-rose-400 mt-1">{formatCOP(egresosMesTotal)}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'egresos' ? '-rotate-90' : 'rotate-90'}`} />
          </div>
          {expandedCard === 'egresos' && (
            <div className="mt-4 pt-3 border-t border-slate-800 animate-in slide-in-from-top-2">
              <ul className="space-y-2 text-xs">
                {chartData.map(([cat, amount]) => (
                  <li key={cat} className="flex justify-between items-center text-slate-300">
                    <span className="truncate pr-2 font-medium">{cat}</span>
                    <span className="font-bold text-rose-400">{formatCOP(amount)}</span>
                  </li>
                ))}
                {chartData.length === 0 && <li className="text-slate-500 text-center py-2">No hay egresos registrados</li>}
              </ul>
            </div>
          )}
        </Card>

        <Card className={`p-3 md:p-5 border-t-4 ${dineroDisponible >= 0 ? 'border-t-indigo-500' : 'border-t-rose-500'}`}>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Dinero Disponible (Ing - Egr)</h3>
          <p className={`text-lg md:text-2xl font-bold mt-1 ${dineroDisponible >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
            {formatCOP(dineroDisponible)}
          </p>
        </Card>
        
        <Card className="p-3 md:p-5 border-t-4 border-t-amber-500">
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Pagos Fijos Pendientes (Todos)</h3>
          <p className="text-lg md:text-2xl font-bold text-amber-400 mt-1">{formatCOP(pagosFijosPendientesTotal)}</p>
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 border-t-slate-500 transition-colors ${expandedCard === 'presupuesto' ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => toggleCard('presupuesto')}>
            <div className="flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs md:text-sm font-medium">Presupuesto Configurado</h3>
              <p className="text-lg md:text-2xl font-bold text-slate-200 mt-1">{formatCOP(presupuestoTotal)}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'presupuesto' ? '-rotate-90' : 'rotate-90'}`} />
          </div>
          {expandedCard === 'presupuesto' && (
            <div className="mt-4 pt-3 border-t border-slate-800 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400">Gastos Fijos</span>
                <span className="font-bold text-orange-400">{formatCOP(totalPresupuestadoFijo)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Gastos Variables</span>
                <span className="font-bold text-blue-400">{formatCOP(totalPresupuestadoVar)}</span>
              </div>
            </div>
          )}
        </Card>
        
        <Card className={`p-3 md:p-5 border-t-4 border-t-emerald-500/50 transition-colors ${expandedCard === 'cuentas' ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}>
          <div className="flex justify-between items-start cursor-pointer select-none" onClick={() => toggleCard('cuentas')}>
            <div className="flex flex-col justify-between">
              <h3 className="text-slate-400 text-xs md:text-sm font-medium">Dinero en Cuentas (Total)</h3>
              <p className="text-lg md:text-2xl font-bold text-emerald-400/80 mt-1">{formatCOP(totalDineroCuentas)}</p>
            </div>
            <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === 'cuentas' ? '-rotate-90' : 'rotate-90'}`} />
          </div>
          {expandedCard === 'cuentas' && (
            <div className="mt-4 pt-3 border-t border-slate-800 animate-in slide-in-from-top-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Cuentas Leo</h4>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Bancos</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezLeoCuentas)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Efectivo</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezLeoEfectivo)}</span>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-rose-500 uppercase mb-1">Cuentas Andre</h4>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Bancos</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezAndreCuentas)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Efectivo</span>
                  <span className="font-bold text-slate-200">{formatCOP(liquidezAndreEfectivo)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ✨ ALERTAS: PAGOS PRÓXIMOS A VENCER (próximos 7 días) */}
      {pagosPorVencer.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle size={14}/> Pagos fijos que vencen en los próximos 7 días
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {pagosPorVencer.map(pf => (
              <div key={pf.id} className="flex justify-between items-center bg-slate-950 border border-amber-500/20 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[140px]">{pf.descripcion}</p>
                  <p className="text-[10px] text-amber-400">Día {pf.diaPago || 1}</p>
                </div>
                <p className="text-sm font-black text-amber-400">{formatCOP(pf.monto)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✨ PROYECCIÓN DE LIQUIDEZ 30 / 60 / 90 DÍAS */}
      {proyeccionLiquidez && (
        <Card className="border-t-4 border-t-indigo-400 bg-slate-900/60">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <TrendingUp size={16} className="text-indigo-400"/> Proyección de Liquidez
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '30 días', val: proyeccionLiquidez.liq30 },
              { label: '60 días', val: proyeccionLiquidez.liq60 },
              { label: '90 días', val: proyeccionLiquidez.liq90 },
            ].map(({ label, val }) => (
              <div key={label} className="bg-slate-950 border border-slate-800 rounded-xl p-3 md:p-4 text-center flex flex-col items-center gap-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
                <p className={`text-base md:text-lg font-black ${val >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>{formatCOP(val)}</p>
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${val >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {val >= 0 ? '✓ Positivo' : '⚠ Déficit'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-3">Estimado basado en ingresos fijos proyectados menos pagos fijos y cuotas pendientes.</p>
        </Card>
      )}

      <Card className="flex flex-col border-t-4 border-t-indigo-500 bg-slate-900/80">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-indigo-400" /> Resumen y Realidad (En Vivo)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800">
          <div className="space-y-4 lg:border-r lg:border-slate-800 lg:pr-6">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider border-b border-slate-800 pb-2">1. Finanzas Leo</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Total Ingresos</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(proyIngLeo)}</span></div>
              <span className="font-bold text-emerald-400">{formatCOP(ingLeo)}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Total Egresos</span><span className="font-bold text-rose-400">{formatCOP(egrLeo)}</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 items-center">
              <span className="text-slate-200">Flujo Leo</span><span className={ingLeo - egrLeo >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingLeo - egrLeo)}</span>
            </div>
          </div>
          <div className="space-y-4 lg:border-r lg:border-slate-800 lg:pr-6">
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider border-b border-slate-800 pb-2">2. Finanzas Andre</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Total Ingresos</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(proyIngAndre)}</span></div>
              <span className="font-bold text-emerald-400">{formatCOP(ingAndre)}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Total Egresos</span><span className="font-bold text-rose-400">{formatCOP(egrAndre)}</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800 items-center">
              <span className="text-slate-200">Flujo Andre</span><span className={ingAndre - egrAndre >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(ingAndre - egrAndre)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">3. Consolidado Hogar</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Total Ingresos</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(proyeccionIngresosMes)}</span></div>
              <span className="font-bold text-emerald-400">{formatCOP(ingresosMesTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Pagos Fijos (Sin TC)</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(totalPresupuestadoFijo)}</span></div>
              <span className="font-bold text-orange-400">{formatCOP(gastadoFijoSinTC)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm text-slate-400">Pagos Variables (Sin TC)</span><span className="text-[10px] text-slate-600">Proy: {formatCOP(totalPresupuestadoVar)}</span></div>
              <span className="font-bold text-blue-400">{formatCOP(gastadoVarSinTC)}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Pagos con TC (Ambos)</span><span className="font-bold text-rose-400">{formatCOP(pagosTCLeo + pagosTCAndre)}</span></div>
            <div className="flex justify-between text-sm items-center border-t border-slate-800/50 pt-3 mt-1"><span className="text-slate-400">Total Egresos</span><span className="font-bold text-rose-400">{formatCOP(egresosMesTotal)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-800 items-center">
              <div className="flex flex-col"><span className="text-slate-200">TOTAL REAL</span><span className="text-[10px] text-slate-600">Esperado: {formatCOP(totalProyeccionMes)}</span></div>
              <span className={dineroDisponible >= 0 ? 'text-indigo-400' : 'text-rose-500'}>{formatCOP(dineroDisponible)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><BarChart size={18} className="text-emerald-400" /> Tendencia Histórica (6 Meses)</h2>
          <div className="flex-1 flex items-end justify-between gap-2 h-48 pb-2 border-b border-slate-800">
            {trendData.map((d, i) => {
              const hInc = (d.ing / maxTrendVal) * 100;
              const hExp = (d.egr / maxTrendVal) * 100;
              const flujoAnterior = d.ing - d.egr;
              return (
                <div key={i} className="flex flex-col items-center w-full h-full justify-end group relative">
                  <div className="flex gap-1 w-full justify-center items-end h-full">
                    <div style={{ height: `${Math.max(hInc, 2)}%` }} className="w-1/3 max-w-[12px] bg-emerald-500/80 rounded-t-sm transition-all group-hover:bg-emerald-400"></div>
                    <div style={{ height: `${Math.max(hExp, 2)}%` }} className="w-1/3 max-w-[12px] bg-rose-500/80 rounded-t-sm transition-all group-hover:bg-rose-400"></div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-16 bg-slate-950 border border-slate-700 text-white text-[10px] p-2 rounded shadow-2xl whitespace-nowrap z-10 pointer-events-none transition-opacity">
                    <p className="text-emerald-400 mb-0.5">Ing: {formatCOP(d.ing)}</p>
                    <p className="text-rose-400 mb-0.5">Egr: {formatCOP(d.egr)}</p>
                    <div className="border-t border-slate-800 my-1"></div>
                    <p className={`font-bold ${flujoAnterior >= 0 ? 'text-indigo-400' : 'text-amber-500'}`}>Neto: {formatCOP(flujoAnterior)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {trendData.map((d, i) => <span key={i} className="text-[10px] font-medium text-slate-500 uppercase">{d.label}</span>)}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500/80"></div> Ingresos</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-rose-500/80"></div> Egresos</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart3 size={18} className="text-indigo-400" /> Distribución de Egresos</h2>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs font-medium w-full md:w-auto">
              <button onClick={()=>setChartFilter('Todos')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Todos' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
              <button onClick={()=>setChartFilter('Fijo')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Fijo' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Fijos</button>
              <button onClick={()=>setChartFilter('Variable')} className={`flex-1 md:flex-none px-4 py-2 rounded ${chartFilter==='Variable' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Variables</button>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {chartData.length === 0 && <p className="text-sm text-slate-500 text-center py-10">No hay egresos registrados.</p>}
            {chartData.map(([name, amount]) => {
              const width = Math.max((amount / maxMonto) * 100, 2);
              
              let barColorClass = '';
              let textColorClass = '';

              if (chartFilter === 'Todos') {
                barColorClass = 'bg-rose-500';
                textColorClass = 'text-rose-400';
              } else if (chartFilter === 'Fijo') {
                barColorClass = 'bg-orange-500';
                textColorClass = 'text-orange-400';
              } else if (chartFilter === 'Variable') {
                barColorClass = 'bg-blue-500';
                textColorClass = 'text-blue-400';
              }

              return (
                <div key={name} className="relative group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium truncate pr-4">{name}</span>
                    <span className={`font-bold ${textColorClass}`}>{formatCOP(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div className={`h-full rounded-full transition-all duration-1000 ${barColorClass}`} style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
