const EgresosTab = ({ 
  egresos, 
  addEgreso, 
  updateEgreso, 
  removeEgreso, 
  pagosFijos, 
  addPagoFijo, 
  updatePagoFijo, 
  removePagoFijo, 
  comprasCuotas, 
  addComprasCuotas, 
  removeComprasCuotas, 
  cuentas, 
  selectedMonth, 
  presupuestos, 
  categoriasMaestras, 
  showToast 
}) => {
  const { useState, useMemo } = React;

  // ============================================================================
  // UTILIDADES
  // ============================================================================
  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  }).format(val);

  const getLocalToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  // ============================================================================
  // ÍCONOS SVG NATIVOS 
  // ============================================================================
  const CheckIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
  );
  const XIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
  const ChevronDownIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
  );
  const ChevronUpIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="18 15 12 9 6 15"></polyline></svg>
  );
  const ListIcon = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
  );

  // ============================================================================
  // 1. ESTADOS DEL FORMULARIO PRINCIPAL
  // ============================================================================
  const [fecha, setFecha] = useState(getLocalToday());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [deudaId, setDeudaId] = useState('');
  const [interesesOtros, setInteresesOtros] = useState('');
  const [tipo, setTipo] = useState('Variable');

  // ============================================================================
  // 2. ESTADOS DE EDICIÓN EN LÍNEA
  // ============================================================================
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ============================================================================
  // 3. ESTADOS DE FILTROS PARA LA TABLA
  // ============================================================================
  const [filters, setFilters] = useState({
    descripcion: '',
    tipo: 'Ambos',
    categoria: '',
    cuenta: ''
  });

  // ============================================================================
  // 4. ESTADOS PARA LOS ACORDEONES
  // ============================================================================
  const [openSections, setOpenSections] = useState({
    form: true,
    fijos: false,
    historial: false
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // ============================================================================
  // 5. ESTADOS PARA EDICIÓN RÁPIDA DE PAGOS FIJOS
  // ============================================================================
  const [pfState, setPfState] = useState({});

  // Listas de Cuentas Filtradas Globales
  const cuentasActivas = cuentas.filter(c => ['bank', 'cash', 'credit', 'pocket'].includes(c.type));
  const todasLasDeudas = cuentas.filter(c => ['credit', 'loan'].includes(c.type));

  // Filtro dinámico de cuentas según el método de pago elegido
  const cuentasFiltradas = useMemo(() => {
    if (!metodoPago) return [];
    if (metodoPago === 'cash') return cuentasActivas.filter(c => c.type === 'cash');
    if (metodoPago === 'bank') return cuentasActivas.filter(c => c.type === 'bank' || c.type === 'pocket');
    if (metodoPago === 'credit') return cuentasActivas.filter(c => c.type === 'credit');
    return [];
  }, [metodoPago, cuentasActivas]);

  // ============================================================================
  // CÁLCULOS PRINCIPALES DEL MES
  // ============================================================================
  const egresosMes = useMemo(() => {
    return egresos
      .filter(e => e.fecha.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [egresos, selectedMonth]);

  const totalMes = egresosMes.reduce((s, e) => s + Number(e.monto), 0);
  const totalFijos = egresosMes.filter(e => e.tipo === 'Fijo').reduce((s, e) => s + Number(e.monto), 0);
  const totalVariables = egresosMes.filter(e => e.tipo !== 'Fijo').reduce((s, e) => s + Number(e.monto), 0);

  // ============================================================================
  // FILTRADO DEL HISTORIAL COMPLETO
  // ============================================================================
  const egresosFiltrados = useMemo(() => {
    return egresosMes.filter(egreso => {
      const matchDesc = egreso.descripcion.toLowerCase().includes(filters.descripcion.toLowerCase());
      const matchTipo = filters.tipo === 'Ambos' || egreso.tipo === filters.tipo;
      const matchCat = filters.categoria === '' || egreso.categoria === filters.categoria;
      const matchCuenta = filters.cuenta === '' || egreso.cuentaId === filters.cuenta;
      return matchDesc && matchTipo && matchCat && matchCuenta;
    });
  }, [egresosMes, filters]);

  // ============================================================================
  // FUNCIONES DE REGISTRO INDIVIDUAL
  // ============================================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion || !monto || !categoria || !cuentaId) {
      showToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }
    
    addEgreso({
      id: generateId(),
      fecha,
      descripcion,
      categoria,
      monto: Number(monto),
      interesesOtros: Number(interesesOtros) || 0,
      cuentaId,
      tipo,
      deudaId: deudaId || null
    });
    
    setDescripcion('');
    setMonto('');
    setInteresesOtros('');
    setDeudaId('');
    showToast('Gasto registrado correctamente.');
  };

  const startEditing = (egreso) => {
    setEditingId(egreso.id);
    setEditData({ ...egreso });
  };

  const saveEdit = async () => {
    if (!editData.descripcion || !editData.monto || !editData.cuentaId || !editData.categoria) {
      showToast('Faltan datos en la edición', 'error');
      return;
    }
    await updateEgreso(editingId, { ...editData, monto: Number(editData.monto) });
    setEditingId(null);
    showToast('Gasto actualizado.');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
      removeEgreso(id);
      showToast('Gasto eliminado.', 'error');
    }
  };

  const limpiarFiltros = () => {
    setFilters({ descripcion: '', tipo: 'Ambos', categoria: '', cuenta: '' });
  };

  // ============================================================================
  // FUNCIONES PARA PAGOS FIJOS (CHECKLIST)
  // ============================================================================
  
  // ✨ CORRECCIÓN: Ahora esta función retorna el OBJETO egreso real, no solo true/false
  const getPagoRealizado = (pf) => {
    return egresosMes.find(e => {
      if (e.tipo !== 'Fijo') return false;
      if (e.pagoFijoId) return e.pagoFijoId === pf.id;
      return e.descripcion.toLowerCase() === (pf.descripcion || '').toLowerCase();
    });
  };

  const getPfMonto = (pf) => pfState[pf.id]?.monto !== undefined 
    ? pfState[pf.id].monto 
    : Number(pf.monto || pf.montoEstimado || 0);

  const getPfCuenta = (pf) => pfState[pf.id]?.cuentaId !== undefined 
    ? pfState[pf.id].cuentaId 
    : (cuentasActivas.length > 0 ? cuentasActivas[0].id : '');

  const getPfDeuda = (pf) => pfState[pf.id]?.deudaId !== undefined 
    ? pfState[pf.id].deudaId 
    : '';

  const handlePfChange = (id, field, value) => {
    setPfState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const registrarPagoFijo = (pf) => {
    const cuentaFinal = getPfCuenta(pf);
    const montoFinal = Number(getPfMonto(pf));
    const deudaFinal = getPfDeuda(pf) || null;
    
    if (!cuentaFinal) return showToast('Selecciona una cuenta para registrar el pago.', 'error');
    if (montoFinal <= 0) return showToast('El monto del pago debe ser mayor a 0.', 'error');

    addEgreso({
      id: generateId(),
      fecha: getLocalToday(),
      descripcion: pf.descripcion,
      categoria: pf.categoria || 'Otros',
      monto: montoFinal,
      cuentaId: cuentaFinal,
      tipo: 'Fijo',
      deudaId: deudaFinal,
      pagoFijoId: pf.id,
    });
    
    showToast(`Pago de ${pf.descripcion} registrado.`);
  };

  const deshacerPagoFijo = (pf) => {
    const egresoAEliminar = getPagoRealizado(pf);
    if (egresoAEliminar) {
      removeEgreso(egresoAEliminar.id);
      showToast(`Se ha revertido el pago de ${pf.descripcion}.`, 'error');
    }
  };

  const pagosFijosOrdenados = useMemo(() => {
    return [...pagosFijos].sort((a, b) => {
      const aPaid = !!getPagoRealizado(a);
      const bPaid = !!getPagoRealizado(b);
      if (aPaid && !bPaid) return 1;
      if (!aPaid && bPaid) return -1;
      return (a.diaPago || 1) - (b.diaPago || 1);
    });
  }, [pagosFijos, egresosMes]);

  // ============================================================================
  // ESTILOS BASE UI NEON & NEUMORPHISM
  // ============================================================================
  const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neonmagenta focus:shadow-glow-magenta transition-all duration-300 placeholder:text-slate-600";
  const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

  // ============================================================================
  // ESTRUCTURA VISUAL (UI)
  // ============================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* ENCABEZADO */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonmagenta to-purple-600 flex items-center justify-center shadow-glow-magenta">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b0c16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
          </div>
          Gestión de Egresos
        </h1>
        <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
          Registra tus gastos diarios, abonos a deudas y pagos fijos.
        </p>
      </header>

      {/* TARJETAS RESUMEN (Neumorfismo Inset) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
            Total Gastado (Mes)
          </p>
          <p className="text-xl md:text-3xl font-black text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]">
            {formatCOP(totalMes)}
          </p>
        </div>
        
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
            Gastos Fijos
          </p>
          <p className="text-xl md:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            {formatCOP(totalFijos)}
          </p>
        </div>
        
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
            Gastos Variables
          </p>
          <p className="text-xl md:text-3xl font-black text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            {formatCOP(totalVariables)}
          </p>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 1. FORMULARIO REGISTRO NORMAL (ACORDEÓN) */}
      {/* ============================================================================ */}
      <Card>
        <div 
          className="flex justify-between items-center cursor-pointer mb-2 select-none"
          onClick={() => toggleSection('form')}
        >
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
            <span className="w-6 h-6 rounded-md bg-neonmagenta/20 text-neonmagenta flex items-center justify-center text-xs">1</span>
            Registrar Gasto o Pago a Deuda
          </h2>
          <button className="text-slate-500 hover:text-white transition-colors">
            {openSections.form ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>

        {openSections.form && (
          <form 
            onSubmit={handleSubmit} 
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 animate-in slide-in-from-top-4 fade-in duration-300"
          >
            {/* Fila 1 */}
            <div>
              <label className={labelBaseClass}>Fecha</label>
              <input 
                type="date" 
                required 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                className={`${inputBaseClass} cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.8]`}
              />
            </div>
            
            <div>
              <label className={labelBaseClass}>Descripción</label>
              <input 
                type="text" 
                required 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                placeholder="Ej. Almuerzo, Pago de tarjeta..." 
                className={inputBaseClass}
              />
            </div>
            
            <div>
              <label className={labelBaseClass}>Categoría</label>
              <select 
                required 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)} 
                className={`${inputBaseClass} appearance-none cursor-pointer`}
              >
                <option value="" className="bg-[#111222]">Seleccione...</option>
                {categoriasMaestras.map(c => (
                  <option key={c} value={c} className="bg-[#111222]">{c}</option>
                ))}
                {!categoriasMaestras.includes('Intereses y otros') && (
                  <option value="Intereses y otros" className="bg-[#111222]">Intereses y otros</option>
                )}
              </select>
            </div>

            {/* Fila 2 */}
            <div>
              <label className={labelBaseClass}>Método de Pago</label>
              <select 
                required 
                value={metodoPago} 
                onChange={(e) => {
                  setMetodoPago(e.target.value);
                  setCuentaId(''); 
                }} 
                className={`${inputBaseClass} appearance-none cursor-pointer`}
              >
                <option value="" className="bg-[#111222]">Seleccione...</option>
                <option value="cash" className="bg-[#111222]">💵 Efectivo (Leo/Andre)</option>
                <option value="bank" className="bg-[#111222]">🏦 Débito / Ahorro</option>
                <option value="credit" className="bg-[#111222]">💳 Tarjeta de Crédito</option>
              </select>
            </div>

            <div>
              <label className={labelBaseClass}>De dónde sale la plata</label>
              <select 
                required 
                disabled={!metodoPago}
                value={cuentaId} 
                onChange={(e) => setCuentaId(e.target.value)} 
                className={`${inputBaseClass} appearance-none cursor-pointer disabled:opacity-30`}
              >
                <option value="" className="bg-[#111222]">{metodoPago ? "Seleccione cuenta..." : "Elija método de pago"}</option>
                {cuentasFiltradas.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#111222]">
                    {c.type === 'cash' ? '💵' : c.type === 'credit' ? '💳' : '🏦'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1 mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Abonar a Deuda (Opcional)
              </label>
              <select 
                value={deudaId} 
                onChange={(e) => setDeudaId(e.target.value)} 
                className={`${inputBaseClass} !border-indigo-500/30 focus:!border-indigo-500 focus:!shadow-[0_0_15px_rgba(99,102,241,0.4)] appearance-none cursor-pointer`}
              >
                <option value="" className="bg-[#111222]">No es pago a deuda</option>
                {todasLasDeudas.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#111222]">Pagar: {d.name}</option>
                ))}
              </select>
            </div>
            
            {/* Fila 3: Montos */}
            <div className="md:col-span-2 relative">
              <label className={labelBaseClass}>Monto Total Pagado</label>
              <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
              <input 
                type="number" 
                required 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                placeholder="0" 
                className={`${inputBaseClass} pl-8 font-black text-lg text-neonmagenta`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest pl-1 mb-1.5 flex items-center gap-1">
                Pago de Intereses (Opcional)
              </label>
              <input 
                type="number" 
                value={interesesOtros} 
                onChange={(e) => setInteresesOtros(e.target.value)} 
                placeholder="$ 0 (Extra/Interés)" 
                className={`${inputBaseClass} !border-amber-500/30 focus:!border-amber-500 focus:!shadow-[0_0_15px_rgba(251,191,36,0.4)] font-bold text-amber-400`}
                title="Si este pago incluye intereses, digita cuánto fue."
              />
            </div>

            {/* Fila 4: Controles */}
            <div className="md:col-span-3 flex flex-col md:flex-row justify-between items-center mt-4 pt-6 border-t border-white/[0.05] gap-4">
               <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1 w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={() => setTipo('Variable')} 
                    className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${tipo === 'Variable' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-[#8A92A6] hover:text-white'}`}
                  >
                    Variable
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipo('Fijo')} 
                    className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${tipo === 'Fijo' ? 'bg-amber-500 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-[#8A92A6] hover:text-white'}`}
                  >
                    Fijo
                  </button>
               </div>
               
              <button 
                type="submit" 
                className="w-full md:w-auto bg-neonmagenta hover:bg-[#ff1a8c] text-[#0b0c16] font-black py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-magenta hover:scale-105 active:scale-95 tracking-wide uppercase"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg> GUARDAR MOVIMIENTO
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* ============================================================================ */}
      {/* 2. PAGOS FIJOS (CHECKLIST) */}
      {/* ============================================================================ */}
      <Card>
        <div 
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => toggleSection('fijos')}
        >
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
             <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs">2</span>
             Checklist de Pagos Fijos
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest">
               {pagosFijos.filter(pf => !!getPagoRealizado(pf)).length} / {pagosFijos.length} Listo
            </span>
            <button className="text-slate-500 hover:text-white transition-colors">
              {openSections.fijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.fijos && (
          <div className="mt-6">
            {pagosFijosOrdenados.length === 0 ? (
              <div className="bg-[#111222] shadow-neumorph-inset rounded-2xl p-10 text-center border border-transparent">
                <p className="text-sm text-[#8A92A6] font-bold uppercase tracking-widest">No has configurado pagos fijos en Presupuestos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
                {pagosFijosOrdenados.map(pf => {
                  
                  // ✨ CORRECCIÓN CLAVE: Obtenemos el registro real del historial, no solo true/false
                  const egresoPagado = getPagoRealizado(pf);
                  const isPaid = !!egresoPagado;
                  
                  return (
                    <div 
                      key={pf.id} 
                      className={`p-5 rounded-2xl flex flex-col transition-all gap-4 border ${
                        isPaid 
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                          : 'bg-[#111222] shadow-neumorph-inset border-transparent hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                      }`}
                    >
                      {/* Fila 1: Botón y Título */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <button 
                            onClick={() => isPaid ? deshacerPagoFijo(pf) : registrarPagoFijo(pf)} 
                            title={isPaid ? "Desmarcar y eliminar registro de este mes" : "Registrar pago de este mes"}
                            className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                              isPaid 
                                ? 'bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer hover:bg-rose-500 hover:border-rose-500 hover:shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                                : 'bg-[#111222] border-slate-600 text-transparent hover:border-amber-500 cursor-pointer'
                            }`}
                          >
                            {isPaid ? <CheckIcon size={14} className="hover:hidden block"/> : null}
                            {isPaid ? <XIcon size={14} className="hidden hover:block"/> : null}
                          </button>
                          
                          <div className="truncate">
                            <p className={`text-sm font-bold tracking-wide truncate ${isPaid ? 'text-emerald-500/70 line-through' : 'text-white'}`}>
                              {pf.descripcion}
                            </p>
                            <p className="text-[10px] text-[#8A92A6] font-black uppercase tracking-widest mt-0.5">
                              Día sugerido: {pf.diaPago || 1}
                            </p>
                          </div>
                        </div>

                        {/* ✨ CORRECCIÓN CLAVE: Monto pagado basado en la base de datos real, no en el presupuesto */}
                        {isPaid && (
                          <p className="text-sm font-black text-emerald-500/50 text-right shrink-0 pl-2">
                            {formatCOP(Number(egresoPagado.monto))}
                          </p>
                        )}
                      </div>
                      
                      {/* Fila 2: Controles de edición ANTES de pagar */}
                      {!isPaid && (
                        <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.05]">
                          <div className="flex gap-2">
                            {/* Origen del dinero */}
                            <select 
                              value={getPfCuenta(pf)} 
                              onChange={(e) => handlePfChange(pf.id, 'cuentaId', e.target.value)}
                              title="Cuenta desde la que pagas"
                              className="bg-appcard border border-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-500 flex-1 w-full appearance-none cursor-pointer shadow-neumorph"
                            >
                              <option value="">De dónde sale...</option>
                              {cuentasActivas.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>

                            {/* Monto exacto */}
                            <input 
                              type="number" 
                              value={getPfMonto(pf)} 
                              onChange={(e) => handlePfChange(pf.id, 'monto', e.target.value)}
                              title="Monto exacto a pagar"
                              className="bg-appcard border border-white/[0.02] text-[11px] font-black text-amber-400 rounded-lg p-2.5 outline-none focus:border-amber-500 w-[100px] text-right shadow-neumorph"
                            />
                          </div>
                          
                          {/* Selector de Abono a Deuda en Pagos Fijos */}
                          <select 
                            value={getPfDeuda(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'deudaId', e.target.value)}
                            title="Deuda a la que vas a abonar (Opcional)"
                            className="bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider text-indigo-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 w-full appearance-none cursor-pointer"
                          >
                            <option value="">No es pago a deuda (Opcional)</option>
                            {todasLasDeudas.map(d => (
                              <option key={d.id} value={d.id}>Abonar a: {d.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ============================================================================ */}
      {/* 3. TABLA HISTORIAL COMPLETA (ACORDEÓN) */}
      {/* ============================================================================ */}
      <Card>
        <div 
          className="flex justify-between items-center cursor-pointer select-none mb-4"
          onClick={() => toggleSection('historial')}
        >
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-xs"><ListIcon size={14}/></span>
            3. Historial Completo de Egresos
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-[#111222] shadow-neumorph-inset text-[#8A92A6] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
              {egresosFiltrados.length} Movimientos
            </span>
            <button className="text-slate-500 hover:text-white transition-colors">
              {openSections.historial ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.historial && (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.05] bg-[#111222] mt-6 animate-in slide-in-from-top-4 fade-in duration-300 shadow-neumorph-inset">
            <table className="w-full text-left border-collapse min-w-[900px]">
              
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-widest text-[#8A92A6] bg-[#0b0c16]/50">
                  <th className="p-4 font-black w-[10%]">Fecha</th>
                  <th className="p-4 font-black w-[25%]">Descripción</th>
                  <th className="p-4 font-black w-[12%] text-center">Fijo/Var</th>
                  <th className="p-4 font-black w-[15%]">Categoría</th>
                  <th className="p-4 font-black w-[15%]">Cuenta</th>
                  <th className="p-4 font-black w-[15%] text-right">Monto</th>
                  <th className="p-4 font-black text-center w-[8%]">Acciones</th>
                </tr>
                
                {/* Fila de Filtros */}
                <tr className="border-b-2 border-white/[0.05] bg-appcard/30">
                  <th className="p-2"></th>
                  <th className="p-2">
                    <input 
                      type="text" 
                      placeholder="Buscar descripción..." 
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none placeholder:text-slate-600" 
                      value={filters.descripcion} 
                      onChange={e => setFilters({...filters, descripcion: e.target.value})}
                    />
                  </th>
                  <th className="p-2">
                    <select 
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none appearance-none" 
                      value={filters.tipo} 
                      onChange={e => setFilters({...filters, tipo: e.target.value})}
                    >
                      <option value="Ambos">Ambos</option>
                      <option value="Fijo">Fijo</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </th>
                  <th className="p-2">
                    <select 
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none appearance-none" 
                      value={filters.categoria} 
                      onChange={e => setFilters({...filters, categoria: e.target.value})}
                    >
                      <option value="">Categorías (Todas)</option>
                      {categoriasMaestras.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </th>
                  <th className="p-2">
                    <select 
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none appearance-none" 
                      value={filters.cuenta} 
                      onChange={e => setFilters({...filters, cuenta: e.target.value})}
                    >
                      <option value="">Cuentas (Todas)</option>
                      {cuentasActivas.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </th>
                  <th className="p-2"></th>
                  <th className="p-2 text-center">
                    <button 
                      onClick={limpiarFiltros} 
                      className="text-[10px] uppercase font-black text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-3 py-1.5 rounded-lg w-full transition-all tracking-widest"
                    >
                      Limpiar
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {egresosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-[#8A92A6] font-bold italic">
                      No se encontraron gastos con esos filtros.
                    </td>
                  </tr>
                ) : (
                  egresosFiltrados.map(egreso => {
                    const isEditing = editingId === egreso.id;
                    const cuentaObj = cuentas.find(c => c.id === egreso.cuentaId);
                    const cuentaName = cuentaObj?.name || 'Cuenta eliminada';
                    
                    return (
                      <tr 
                        key={egreso.id} 
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        
                        <td className="p-4 text-[#8A92A6] text-xs font-bold">
                          {isEditing ? (
                            <input 
                              type="date" 
                              value={editData.fecha} 
                              onChange={e => setEditData({...editData, fecha: e.target.value})} 
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white"
                            />
                          ) : egreso.fecha}
                        </td>

                        <td className="p-4 text-white font-bold text-[13px]">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editData.descripcion} 
                              onChange={e => setEditData({...editData, descripcion: e.target.value})} 
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white"
                            />
                          ) : egreso.descripcion}
                        </td>

                        <td className="p-4 text-center">
                          {isEditing ? (
                            <select 
                              value={editData.tipo} 
                              onChange={e => setEditData({...editData, tipo: e.target.value})} 
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white appearance-none"
                            >
                              <option value="Fijo">Fijo</option>
                              <option value="Variable">Variable</option>
                            </select>
                          ) : (
                            <span 
                              className={`px-2.5 py-1.5 text-[9px] font-black rounded-md uppercase tracking-widest ${
                                egreso.tipo === 'Fijo' 
                                  ? 'bg-amber-500/10 text-amber-400' 
                                  : 'bg-neoncyan/10 text-neoncyan'
                              }`}
                            >
                              {egreso.tipo || 'VAR'}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {isEditing ? (
                            <select 
                              value={editData.categoria} 
                              onChange={e => setEditData({...editData, categoria: e.target.value})} 
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white appearance-none"
                            >
                              {categoriasMaestras.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-3 py-1.5 bg-appcard border border-white/[0.05] text-[#8A92A6] text-[11px] font-bold uppercase tracking-wider rounded-lg">
                              {egreso.categoria}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {isEditing ? (
                            <select 
                              value={editData.cuentaId} 
                              onChange={e => setEditData({...editData, cuentaId: e.target.value})} 
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white appearance-none"
                            >
                              {cuentasActivas.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {cuentaName.substring(0, 15)}
                            </p>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editData.monto} 
                              onChange={e => setEditData({...editData, monto: e.target.value})} 
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-right text-neonmagenta font-black"
                            />
                          ) : (
                            <span className="font-black text-neonmagenta text-[14px]">
                              {formatCOP(egreso.monto)}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={saveEdit} 
                                className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-400/10 rounded transition-colors" 
                                title="Confirmar"
                              >
                                <CheckIcon size={18} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)} 
                                className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-400/10 rounded transition-colors" 
                                title="Cancelar"
                              >
                                <XIcon size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-4">
                              <button 
                                onClick={() => startEditing(egreso)} 
                                className="text-[#8A92A6] hover:text-neoncyan transition-colors" 
                                title="Editar"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(egreso.id)} 
                                className="text-[#8A92A6] hover:text-rose-500 transition-colors" 
                                title="Eliminar"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
