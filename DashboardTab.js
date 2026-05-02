(() => {
  // ============================================================================
  // DASHBOARD TAB - VERSIÓN CORREGIDA
  // Correcciones principales:
  // 1. Export correcto: window.DashboardTab = DashboardTab
  // 2. Protección contra arrays undefined/null
  // 3. Protección contra fechas, descripciones, montos y cuentas vacías
  // 4. Evita crashes si Recharts no carga
  // 5. Separa compras con tarjeta vs pagos a tarjeta
  // 6. Separa dinero en liquidez, inversión/ahorro y deuda total
  // ============================================================================

  // Íconos SVG privados para Dashboard
  const ChevronRight = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );

  const Calculator = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="8" y1="6" x2="16" y2="6"></line>
      <line x1="16" y1="14" x2="16" y2="14.01"></line>
      <line x1="16" y1="10" x2="16" y2="10.01"></line>
      <line x1="16" y1="18" x2="16" y2="18.01"></line>
      <line x1="8" y1="14" x2="12" y2="14"></line>
      <line x1="8" y1="10" x2="12" y2="10"></line>
      <line x1="8" y1="18" x2="12" y2="18"></line>
    </svg>
  );

  const BarChart3 = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <rect width="4" height="7" x="7" y="10" rx="1" />
      <rect width="4" height="12" x="15" y="5" rx="1" />
    </svg>
  );

  const DashboardTab = ({
    flujoNetoMes = 0,
    cuotasMesTotal = 0,
    cuotasMesRestantes = 0,
    ingresosMesTotal = 0,
    egresosMesTotal = 0,
    deudaTotal = 0,
    liquidezTotal = 0,
    inversionTotal = 0,
    selectedMonth = "",
    egresosMes = [],
    ingresos = [],
    egresos = [],
    presupuestos = [],
    pagosFijos = [],
    ingresosFijos = [],
    cuentas = [],
    proyeccionLiquidez = 0,
    privacyMode = false
  }) => {
    const { useState, useMemo } = React;

    const Recharts = window.Recharts || {};
    const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip: RechartsTooltip } = Recharts;

    const [chartFilter, setChartFilter] = useState("Todos");
    const [expandedCard, setExpandedCard] = useState(null);

    const toggleCard = (cardId) => {
      setExpandedCard((prev) => (prev === cardId ? null : cardId));
    };

    // ============================================================================
    // HELPERS SEGUROS
    // ============================================================================
    const asArray = (value) => (Array.isArray(value) ? value : []);

    const num = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const text = (value) => (value === undefined || value === null ? "" : String(value));

    const formatCOP = (val) => {
      if (privacyMode) return "****";

      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }).format(num(val));
    };

    const cuentasSafe = asArray(cuentas);
    const ingresosSafe = asArray(ingresos);
    const egresosMesSafe = asArray(egresosMes);
    const presupuestosSafe = asArray(presupuestos);
    const pagosFijosSafe = asArray(pagosFijos);
    const ingresosFijosSafe = asArray(ingresosFijos);

    // ============================================================================
    // LÓGICA DE DATOS PRINCIPAL
    // ============================================================================
    const identifyOwner = (cuentaId, itemPersona, textDesc) => {
      if (itemPersona === "L" || itemPersona === "Leo") return "Leo";
      if (itemPersona === "A" || itemPersona === "Andre" || itemPersona === "André") return "Andre";

      let targetName = text(textDesc);

      if (cuentaId) {
        const c = cuentasSafe.find((acc) => acc && acc.id === cuentaId);
        if (c && c.name) targetName = c.name;
      }

      const t = text(targetName).toUpperCase();
      const hasL = t.includes("LEO") || t.endsWith(" L") || t.includes(" L ");
      const hasA = t.includes("ANDRE") || t.includes("ANDRÉ") || t.endsWith(" A") || t.includes(" A ");

      if (hasL && !hasA) return "Leo";
      if (hasA && !hasL) return "Andre";

      return "Shared";
    };

    const tarjetasCredito = cuentasSafe.filter((c) => c && c.type === "credit");
    const idsTarjetas = tarjetasCredito.map((c) => c.id);

    const cuentasLiquidez = cuentasSafe.filter((c) => c && ["bank", "cash"].includes(c.type));
    const idsCuentasLiquidez = cuentasLiquidez.map((c) => c.id);

    const cuentasInversion = cuentasSafe.filter((c) => c && ["investment", "pocket"].includes(c.type));
    const cuentasDeuda = cuentasSafe.filter((c) => c && ["credit", "loan"].includes(c.type));

    const totalPresupuestadoFijo = pagosFijosSafe.reduce((sum, item) => sum + num(item && item.monto), 0);
    const totalPresupuestadoVar = presupuestosSafe.reduce((sum, item) => sum + num(item && item.limite), 0);
    const presupuestoTotal = totalPresupuestadoFijo + totalPresupuestadoVar;

    const proyIngLeo = ingresosFijosSafe
      .filter((i) => identifyOwner(i && i.cuentaId, i && i.persona, i && i.descripcion) === "Leo")
      .reduce((s, i) => s + num(i && i.monto), 0);

    const proyIngAndre = ingresosFijosSafe
      .filter((i) => identifyOwner(i && i.cuentaId, i && i.persona, i && i.descripcion) === "Andre")
      .reduce((s, i) => s + num(i && i.monto), 0);

    const proyeccionIngresosMes = ingresosFijosSafe.reduce((sum, item) => sum + num(item && item.monto), 0);
    const totalProyeccionMes = proyeccionIngresosMes - presupuestoTotal;

    const ingresosMesActual = ingresosSafe.filter((i) => text(i && i.fecha).startsWith(selectedMonth));

    const ingLeo = ingresosMesActual
      .filter((i) => identifyOwner(i && i.cuentaId, i && i.persona, i && i.descripcion) === "Leo")
      .reduce((s, i) => s + num(i && i.monto), 0);

    const ingAndre = ingresosMesActual
      .filter((i) => identifyOwner(i && i.cuentaId, i && i.persona, i && i.descripcion) === "Andre")
      .reduce((s, i) => s + num(i && i.monto), 0);

    const egrLeo = egresosMesSafe
      .filter((e) => identifyOwner(e && e.cuentaId, null, e && e.descripcion) === "Leo")
      .reduce((s, e) => s + num(e && e.monto), 0);

    const egrAndre = egresosMesSafe
      .filter((e) => identifyOwner(e && e.cuentaId, null, e && e.descripcion) === "Andre")
      .reduce((s, e) => s + num(e && e.monto), 0);

    // ============================================================================
    // CLASIFICACIÓN CORRECTA DE TARJETAS
    // ============================================================================

    const comprasConTarjeta = egresosMesSafe.filter((e) => {
      if (!e) return false;

      const usaTarjetaComoMedioPago = idsTarjetas.includes(e.cuentaId);
      const esPagoATarjeta = Boolean(e.pagoTarjetaId) || idsTarjetas.includes(e.deudaId);

      return usaTarjetaComoMedioPago && !esPagoATarjeta;
    });

    const pagosATarjeta = egresosMesSafe.filter((e) => {
      if (!e) return false;
      return Boolean(e.pagoTarjetaId) || idsTarjetas.includes(e.deudaId);
    });

    const salidasDesdeLiquidez = egresosMesSafe.filter((e) => {
      if (!e) return false;
      return idsCuentasLiquidez.includes(e.cuentaId);
    });

    const consumoSinPagosDeTarjeta = egresosMesSafe.filter((e) => {
      if (!e) return false;

      const esPagoATarjeta = Boolean(e.pagoTarjetaId) || idsTarjetas.includes(e.deudaId);
      return !esPagoATarjeta;
    });

    const gastadoFijoSinTC = consumoSinPagosDeTarjeta
      .filter((e) => e && e.tipo === "Fijo" && !idsTarjetas.includes(e.cuentaId))
      .reduce((s, e) => s + num(e && e.monto), 0);

    const gastadoVarSinTC = consumoSinPagosDeTarjeta
      .filter((e) => e && e.tipo !== "Fijo" && !idsTarjetas.includes(e.cuentaId))
      .reduce((s, e) => s + num(e && e.monto), 0);

    const totalComprasConTarjeta = comprasConTarjeta
      .reduce((s, e) => s + num(e && e.monto), 0);

    const totalPagosATarjeta = pagosATarjeta
      .reduce((s, e) => s + num(e && e.monto), 0);

    const totalSalidasDesdeLiquidez = salidasDesdeLiquidez
      .reduce((s, e) => s + num(e && e.monto), 0);

    const comprasTCLeo = comprasConTarjeta
      .filter((e) => identifyOwner(e && e.cuentaId, null, e && e.descripcion) === "Leo")
      .reduce((s, e) => s + num(e && e.monto), 0);

    const comprasTCAndre = comprasConTarjeta
      .filter((e) => identifyOwner(e && e.cuentaId, null, e && e.descripcion) === "Andre")
      .reduce((s, e) => s + num(e && e.monto), 0);

    const pagosTCLeo = pagosATarjeta
      .filter((e) => {
        const tc = tarjetasCredito.find((t) => t.id === e.deudaId || t.id === e.pagoTarjetaId);
        return identifyOwner(tc && tc.id, null, (tc && tc.name) || e.descripcion) === "Leo";
      })
      .reduce((s, e) => s + num(e && e.monto), 0);

    const pagosTCAndre = pagosATarjeta
      .filter((e) => {
        const tc = tarjetasCredito.find((t) => t.id === e.deudaId || t.id === e.pagoTarjetaId);
        return identifyOwner(tc && tc.id, null, (tc && tc.name) || e.descripcion) === "Andre";
      })
      .reduce((s, e) => s + num(e && e.monto), 0);

    const dineroDisponible = num(ingresosMesTotal) - num(egresosMesTotal);

    const isPagoFijoRealizado = (pf) => {
      if (!pf) return false;

      return egresosMesSafe.some((e) => {
        if (!e || e.tipo !== "Fijo") return false;
        if (e.pagoFijoId === pf.id) return true;

        const descE = text(e.descripcion).toLowerCase();
        const descP = text(pf.descripcion).toLowerCase();

        if (!descE || !descP) return false;

        return descE === descP || descE.includes(descP);
      });
    };

    const isTCPagada = (tc) => {
      if (!tc) return false;

      return egresosMesSafe.some((e) => {
        if (!e) return false;
        if (e.pagoTarjetaId === tc.id) return true;
        if (e.deudaId === tc.id && e.tipo === "Fijo") return true;

        const descE = text(e.descripcion).toLowerCase();
        const tcName = text(tc.name).toLowerCase();

        if (!descE || !tcName) return false;

        return descE.includes(tcName) && e.tipo === "Fijo";
      });
    };

    const pagosFijosReales = pagosFijosSafe.filter((pf) => {
      const descPf = text(pf && pf.descripcion).toLowerCase();
      if (!descPf) return true;
      return !tarjetasCredito.some((tc) => text(tc && tc.name).toLowerCase() === descPf);
    });

    const fijosPendientesLista = pagosFijosReales.filter((pf) => !isPagoFijoRealizado(pf));
    const tcPendientesLista = tarjetasCredito.filter((tc) => !isTCPagada(tc));

    const montoFijosPtes = fijosPendientesLista.reduce((s, pf) => s + num(pf && pf.monto), 0);
    const montoTCPtes = 0;
    const pagosFijosPendientesTotal = montoFijosPtes + montoTCPtes;

    // ============================================================================
    // LIQUIDEZ, INVERSIÓN Y DEUDA
    // ============================================================================
    let liquidezLeoCuentas = 0;
    let liquidezLeoEfectivo = 0;
    let liquidezAndreCuentas = 0;
    let liquidezAndreEfectivo = 0;
    let liquidezCompartida = 0;

    cuentasLiquidez.forEach((c) => {
      const owner = identifyOwner(c.id, null, c.name);
      const balance = num(c.currentBalance);

      if (owner === "Leo") {
        if (c.type === "cash") liquidezLeoEfectivo += balance;
        else liquidezLeoCuentas += balance;
      } else if (owner === "Andre") {
        if (c.type === "cash") liquidezAndreEfectivo += balance;
        else liquidezAndreCuentas += balance;
      } else {
        liquidezCompartida += balance;
      }
    });

    let inversionLeo = 0;
    let inversionAndre = 0;
    let inversionCompartida = 0;

    cuentasInversion.forEach((c) => {
      const owner = identifyOwner(c.id, null, c.name);
      const balance = num(c.currentBalance);

      if (owner === "Leo") inversionLeo += balance;
      else if (owner === "Andre") inversionAndre += balance;
      else inversionCompartida += balance;
    });

    const deudaTarjetas = cuentasDeuda
      .filter((c) => c.type === "credit")
      .reduce((s, c) => s + num(c.currentDebt), 0);

    const deudaPrestamos = cuentasDeuda
      .filter((c) => c.type === "loan")
      .reduce((s, c) => s + num(c.currentDebt), 0);

    const patrimonioOperativo = num(liquidezTotal) + num(inversionTotal);

    const chartData = useMemo(() => {
      const gastosFiltrados = chartFilter === "Todos"
        ? egresosMesSafe
        : egresosMesSafe.filter((e) => e && e.tipo === chartFilter);

      const gastosPorCategoria = {};

      gastosFiltrados.forEach((g) => {
        const macroCat = text(g && g.categoria) || "Otros Gastos";
        gastosPorCategoria[macroCat] = (gastosPorCategoria[macroCat] || 0) + num(g && g.monto);
      });

      return Object.entries(gastosPorCategoria)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }, [egresosMesSafe, chartFilter]);

    const COLORS = ["#00E5FF", "#FF007A", "#FBBF24", "#34D399", "#818CF8", "#F472B6", "#A78BFA", "#38BDF8", "#FB923C", "#4ADE80"];

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const item = payload[0];
        const itemColor = item && item.payload && item.payload.fill ? item.payload.fill : "#FFFFFF";

        return (
          <div className="bg-appcard/95 backdrop-blur-md border border-white/[0.05] p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8A92A6] mb-1">{item.name}</p>
            <p className="text-sm font-black text-white" style={{ color: itemColor }}>
              {formatCOP(item.value)}
            </p>
          </div>
        );
      }

      return null;
    };

    const EmptyStateIlustrado = () => (
      <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500 w-full h-full min-h-[200px]">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-neoncyan/20 blur-xl rounded-full animate-pulse"></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-neoncyan drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          </svg>
        </div>

        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">Sin datos</h3>
        <p className="text-[#8A92A6] text-[10px] font-bold w-3/4 mx-auto">Motor listo para arrancar.</p>
      </div>
    );

    // ============================================================================
    // ESTRUCTURA UI
    // ============================================================================
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
        <header>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">Dashboard Global</h1>
          <p className="text-sm md:text-base text-[#8A92A6] mt-1 font-medium tracking-wide">
            Resumen de flujos, liquidez, inversión, deuda y analítica de egresos.
          </p>
        </header>

        {/* 1. TARJETAS DE RESUMEN SUPERIORES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center">
            <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Ingresos Mes</h3>
            <p className="text-xl md:text-3xl font-black text-neoncyan mt-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] truncate">
              {formatCOP(ingresosMesTotal)}
            </p>
          </div>

          <div onClick={() => toggleCard("egresos")} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Egresos Mes</h3>
                <p className="text-xl md:text-3xl font-black text-neonmagenta mt-1 drop-shadow-[0_0_8px_rgba(255,0,122,0.4)] truncate">
                  {formatCOP(egresosMesTotal)}
                </p>
              </div>

              <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === "egresos" ? "rotate-90" : ""}`} />
            </div>

            {expandedCard === "egresos" && (
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
            <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10">Flujo Mes</h3>
            <p className={`text-xl md:text-3xl font-black mt-1 truncate relative z-10 ${dineroDisponible >= 0 ? "text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" : "text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]"}`}>
              {formatCOP(dineroDisponible)}
            </p>
          </div>

          <div onClick={() => toggleCard("liquidez")} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Dinero Liquidez</h3>
                <p className="text-xl md:text-3xl font-black text-emerald-400 mt-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] truncate">
                  {formatCOP(liquidezTotal)}
                </p>
              </div>

              <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === "liquidez" ? "rotate-90" : ""}`} />
            </div>

            {expandedCard === "liquidez" && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-black text-neoncyan uppercase mb-2">Leo</h4>
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
                  <h4 className="text-[10px] font-black text-neonmagenta uppercase mb-2">Andre</h4>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#8A92A6] font-bold">Bancos</span>
                    <span className="font-black text-white">{formatCOP(liquidezAndreCuentas)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8A92A6] font-bold">Efectivo</span>
                    <span className="font-black text-white">{formatCOP(liquidezAndreEfectivo)}</span>
                  </div>
                </div>

                {liquidezCompartida !== 0 && (
                  <div className="col-span-2 flex justify-between items-center text-xs pt-3 border-t border-white/[0.05]">
                    <span className="text-[#8A92A6] font-bold">Compartida / sin dueño</span>
                    <span className="font-black text-white">{formatCOP(liquidezCompartida)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div onClick={() => toggleCard("inversion")} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Inversión / Ahorro</h3>
                <p className="text-xl md:text-3xl font-black text-amber-400 mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] truncate">
                  {formatCOP(inversionTotal)}
                </p>
              </div>

              <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === "inversion" ? "rotate-90" : ""}`} />
            </div>

            {expandedCard === "inversion" && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold">Leo</span>
                  <span className="font-black text-white">{formatCOP(inversionLeo)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold">Andre</span>
                  <span className="font-black text-white">{formatCOP(inversionAndre)}</span>
                </div>

                {inversionCompartida !== 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8A92A6] font-bold">Compartida / sin dueño</span>
                    <span className="font-black text-white">{formatCOP(inversionCompartida)}</span>
                  </div>
                )}

                <div className="pt-3 mt-3 border-t border-white/[0.05] flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest">Patrimonio operativo</span>
                  <span className="font-black text-amber-400">{formatCOP(patrimonioOperativo)}</span>
                </div>
              </div>
            )}
          </div>

          <div onClick={() => toggleCard("deuda")} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Deuda Total</h3>
                <p className="text-xl md:text-3xl font-black text-rose-400 mt-1 drop-shadow-[0_0_8px_rgba(251,113,133,0.4)] truncate">
                  {formatCOP(deudaTotal)}
                </p>
              </div>

              <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === "deuda" ? "rotate-90" : ""}`} />
            </div>

            {expandedCard === "deuda" && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold">Tarjetas</span>
                  <span className="font-black text-rose-400">{formatCOP(deudaTarjetas)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold">Préstamos</span>
                  <span className="font-black text-rose-400">{formatCOP(deudaPrestamos)}</span>
                </div>
              </div>
            )}
          </div>

          <div onClick={() => toggleCard("pendientes")} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Pagos Fijos Ptes.</h3>
                <p className="text-xl md:text-3xl font-black text-amber-400 mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] truncate">
                  {formatCOP(pagosFijosPendientesTotal)}
                </p>
              </div>

              <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === "pendientes" ? "rotate-90" : ""}`} />
            </div>

            {expandedCard === "pendientes" && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-3">Pendientes confirmados:</p>

                <ul className="space-y-2">
                  {fijosPendientesLista.map((pf) => (
                    <li key={pf.id} className="flex justify-between text-[11px] font-bold text-white">
                      <span className="truncate pr-2">{pf.descripcion || "Pago fijo"}</span>
                      <span className="text-amber-500 shrink-0">{formatCOP(pf.monto)}</span>
                    </li>
                  ))}

                  {tcPendientesLista.map((tc) => (
                    <li key={tc.id} className="flex justify-between text-[11px] font-bold text-white">
                      <span className="truncate pr-2">Tarjeta {tc.name || "sin nombre"}</span>
                      <span className="text-indigo-400 shrink-0 uppercase tracking-widest text-[9px]">Pendiente</span>
                    </li>
                  ))}

                  {pagosFijosPendientesTotal === 0 && tcPendientesLista.length === 0 && (
                    <li className="text-center text-emerald-400 text-xs py-2 font-black">✓ ¡Todo al día!</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div onClick={() => toggleCard("presupuesto")} className="bg-[#111222] shadow-neumorph-inset p-4 md:p-5 rounded-2xl border border-transparent flex flex-col justify-center relative cursor-pointer group hover:bg-[#1c1e32] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#8A92A6] text-[10px] md:text-xs font-black uppercase tracking-widest">Presupuesto Config.</h3>
                <p className="text-xl md:text-3xl font-black text-white mt-1 truncate">
                  {formatCOP(presupuestoTotal)}
                </p>
              </div>

              <ChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${expandedCard === "presupuesto" ? "rotate-90" : ""}`} />
            </div>

            {expandedCard === "presupuesto" && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="text-[#8A92A6] font-bold">Gastos Fijos</span>
                  <span className="font-black text-amber-400">{formatCOP(totalPresupuestadoFijo)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8A92A6] font-bold">Gastos Variables</span>
                  <span className="font-black text-neoncyan">{formatCOP(totalPresupuestadoVar)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. RESUMEN EN VIVO */}
        <div className="bg-appcard shadow-neumorph p-5 md:p-8 rounded-2xl border border-white/[0.02] flex flex-col">
          <h2 className="text-sm font-black text-white mb-5 flex items-center gap-2 uppercase tracking-widest">
            <Calculator size={18} className="text-neoncyan" /> Resumen y Realidad En Vivo
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#111222] shadow-neumorph-inset p-5 md:p-8 rounded-2xl border border-white/[0.02]">
            {/* LEO */}
            <div className="space-y-5 lg:border-r lg:border-white/[0.05] lg:pr-6">
              <h3 className="text-xs font-black text-neoncyan uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neoncyan shadow-glow-cyan"></div> 1. Flujo mes Leo
              </h3>

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span>
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 w-max border border-indigo-500/20">Proy: {formatCOP(proyIngLeo)}</span>
                </div>

                <span className="font-black text-emerald-400 mt-1">{formatCOP(ingLeo)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#8A92A6]">Total Egresos</span>
                <span className="font-black text-neonmagenta">{formatCOP(egrLeo)}</span>
              </div>

              <div className="flex justify-between text-[11px] items-center">
                <span className="text-[#8A92A6] font-bold">Compras con TC</span>
                <span className="font-black text-neonmagenta">{formatCOP(comprasTCLeo)}</span>
              </div>

              <div className="flex justify-between text-[11px] items-center">
                <span className="text-[#8A92A6] font-bold">Pagos a TC</span>
                <span className="font-black text-indigo-400">{formatCOP(pagosTCLeo)}</span>
              </div>

              <div className="flex justify-between text-base font-black pt-4 border-t border-white/[0.05] items-center">
                <span className="text-white">Flujo Leo</span>
                <span className={ingLeo - egrLeo >= 0 ? "text-neoncyan" : "text-neonmagenta"}>{formatCOP(ingLeo - egrLeo)}</span>
              </div>
            </div>

            {/* ANDRE */}
            <div className="space-y-5 lg:border-r lg:border-white/[0.05] lg:pr-6">
              <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neonmagenta shadow-glow-magenta"></div> 2. Flujo Mes Andre
              </h3>

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span>
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 w-max border border-indigo-500/20">Proy: {formatCOP(proyIngAndre)}</span>
                </div>

                <span className="font-black text-emerald-400 mt-1">{formatCOP(ingAndre)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#8A92A6]">Total Egresos</span>
                <span className="font-black text-neonmagenta">{formatCOP(egrAndre)}</span>
              </div>

              <div className="flex justify-between text-[11px] items-center">
                <span className="text-[#8A92A6] font-bold">Compras con TC</span>
                <span className="font-black text-neonmagenta">{formatCOP(comprasTCAndre)}</span>
              </div>

              <div className="flex justify-between text-[11px] items-center">
                <span className="text-[#8A92A6] font-bold">Pagos a TC</span>
                <span className="font-black text-indigo-400">{formatCOP(pagosTCAndre)}</span>
              </div>

              <div className="flex justify-between text-base font-black pt-4 border-t border-white/[0.05] items-center">
                <span className="text-white">Flujo Andre</span>
                <span className={ingAndre - egrAndre >= 0 ? "text-neoncyan" : "text-neonmagenta"}>{formatCOP(ingAndre - egrAndre)}</span>
              </div>
            </div>

            {/* HOGAR */}
            <div className="space-y-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/[0.05] pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]"></div> 3. Consolidado Hogar
              </h3>

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#8A92A6]">Total Ingresos</span>
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 w-max border border-indigo-500/20">Proy: {formatCOP(proyeccionIngresosMes)}</span>
                </div>

                <span className="font-black text-emerald-400 mt-1">{formatCOP(ingresosMesTotal)}</span>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#8A92A6]">Fijos sin pagos TC</span>
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 w-max border border-indigo-500/20">Proy: {formatCOP(totalPresupuestadoFijo)}</span>
                </div>

                <span className="font-black text-amber-400 mt-1">{formatCOP(gastadoFijoSinTC)}</span>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#8A92A6]">Variables sin pagos TC</span>
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 w-max border border-indigo-500/20">Proy: {formatCOP(totalPresupuestadoVar)}</span>
                </div>

                <span className="font-black text-neoncyan mt-1">{formatCOP(gastadoVarSinTC)}</span>
              </div>

              <div className="space-y-2 bg-[#0b0c16]/40 rounded-xl p-3 border border-white/[0.03]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#8A92A6]">Compras con TC</span>
                  <span className="font-black text-neonmagenta">{formatCOP(totalComprasConTarjeta)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#8A92A6]">Pagos a TC</span>
                  <span className="font-black text-indigo-400">{formatCOP(totalPagosATarjeta)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest">Salidas desde liquidez</span>
                  <span className="font-black text-slate-300">{formatCOP(totalSalidasDesdeLiquidez)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm items-center border-t border-white/[0.05] pt-4 mt-2">
                <span className="text-white font-bold">Total Egresos</span>
                <span className="font-black text-neonmagenta">{formatCOP(egresosMesTotal)}</span>
              </div>

              <div className="flex justify-between text-lg font-black pt-3 border-t border-white/[0.05] items-center">
                <div className="flex flex-col">
                  <span className="text-white">TOTAL REAL</span>
                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded mt-1 w-max border border-indigo-500/20 uppercase tracking-widest">Esperado: {formatCOP(totalProyeccionMes)}</span>
                </div>

                <span className={dineroDisponible >= 0 ? "text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" : "text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]"}>
                  {formatCOP(dineroDisponible)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. GRÁFICO DE DISTRIBUCIÓN */}
        <div className="bg-appcard shadow-neumorph p-5 rounded-2xl border border-white/[0.02] flex flex-col">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-3">
            <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <BarChart3 size={18} className="text-neonmagenta" /> Distribución de Gastos
            </h2>

            <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1.5 w-full xl:w-auto border border-transparent">
              <button onClick={() => setChartFilter("Todos")} className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartFilter === "Todos" ? "bg-neonmagenta text-white shadow-glow-magenta" : "text-[#8A92A6] hover:text-white"}`}>
                Todos
              </button>

              <button onClick={() => setChartFilter("Fijo")} className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartFilter === "Fijo" ? "bg-amber-500 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "text-[#8A92A6] hover:text-white"}`}>
                Fijos
              </button>

              <button onClick={() => setChartFilter("Variable")} className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartFilter === "Variable" ? "bg-neoncyan text-[#0b0c16] shadow-glow-cyan" : "text-[#8A92A6] hover:text-white"}`}>
                Var
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            {chartData.length > 0 && PieChart && Pie && Cell && ResponsiveContainer ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 0px 5px ${COLORS[index % COLORS.length]}80)` }} />
                      ))}
                    </Pie>

                    {RechartsTooltip && <RechartsTooltip content={<CustomTooltip />} />}
                  </PieChart>
                </ResponsiveContainer>

                <div className="w-full mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
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
    );
  };

  window.DashboardTab = DashboardTab;
})();
