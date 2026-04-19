const EgresosTab = ({ 
  egresos, 
  addEgreso, 
  updateEgreso, 
  removeEgreso, 
  pagosFijos, 
  addPagoFijo, 
  updatePagoFijo, 
  removePagoFijo, 
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
  
  const XIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const ChevronDownIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const ChevronUpIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );

  const ListIcon = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );

  // ============================================================================
  // 1. ESTADOS DEL FORMULARIO PRINCIPAL
  // ============================================================================
  const [fecha, setFecha] = useState(getLocalToday());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  
  // Flujo Inteligente de Cuentas
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
    fijos: true,
    historial: false
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ 
      ...prev, 
      [sec]: !prev[sec] 
    }));
  };

  // ============================================================================
  // 5. ESTADOS PARA EDICIÓN RÁPIDA DE PAGOS FIJOS
  // ============================================================================
  const [pfState, setPfState] = useState({});

  // ============================================================================
  // LÓGICA DE FILTRADO DE CUENTAS
  // ============================================================================
  const cuentasActivas = cuentas.filter(c => ['bank', 'cash', 'credit', 'pocket'].includes(c.type));
  const todasLasDeudas = cuentas.filter(c => ['credit', 'loan'].includes(c.type));

  // Añadimos "Intereses y Cargos" dinámicamente a la lista
  const categoriasConIntereses = Array.from(new Set([...categoriasMaestras, 'Intereses y Cargos'])).sort();

  // Filtrado de cuentas según el método de pago elegido
  const cuentasFiltradas = cuentasActivas.filter(c => {
    if (!metodoPago) return false;
    if (metodoPago === 'cash') return c.type === 'cash';
    if (metodoPago === 'bank') return c.type === 'bank' || c.type === 'pocket';
    if (metodoPago === 'credit') return c.type === 'credit';
    return false;
  });

  const handleMetodoChange = (e) => {
    setMetodoPago(e.target.value);
    setCuentaId(''); // Si cambia el método, reseteamos la cuenta elegida
  };

  // ============================================================================
  // CÁLCULOS PRINCIPALES DEL MES
  // ============================================================================
  const egresosMes = useMemo(() => {
    return egresos
      .filter(e => e.fecha.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [egresos, selectedMonth]);

  const totalMes = egresosMes.reduce((s, e) => s + Number(e.monto), 0);
  
  const totalFijos = egresosMes
    .filter(e => e.tipo === 'Fijo')
    .reduce((s, e) => s + Number(e.monto), 0);
    
  const totalVariables = egresosMes
    .filter(e => e.tipo !== 'Fijo')
    .reduce((s, e) => s + Number(e.monto), 0);

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
      interesesOtros: Number(interesesOtros) || 0, // Guarda el interés opcional
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
    
    await updateEgreso(editingId, { 
      ...editData, 
      monto: Number(editData.monto),
      interesesOtros: Number(editData.interesesOtros) || 0 
    });
    
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
    setFilters({ 
      descripcion: '', 
      tipo: 'Ambos', 
      categoria: '', 
      cuenta: '' 
    });
  };

  // ============================================================================
  // FUNCIONES PARA PAGOS FIJOS (CHECKLIST)
  // ============================================================================
  const getEgresoPagoFijo = (pf) => {
    return egresosMes.find(e => {
      if (e.tipo !== 'Fijo') return false;
      if (e.pagoFijoId) return e.pagoFijoId === pf.id;
      return e.descripcion.toLowerCase() === pf.descripcion.toLowerCase();
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
    setPfState(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        [field]: value 
      }
    }));
  };

  const registrarPagoFijo = (pf) => {
    const cuentaFinal = getPfCuenta(pf);
    const montoFinal = Number(getPfMonto(pf));
    const deudaFinal = getPfDeuda(pf) || null;
    
    if (!cuentaFinal) {
      showToast('Selecciona una cuenta para registrar el pago.', 'error');
      return;
    }
    if (montoFinal <= 0) {
      showToast('El monto del pago debe ser mayor a 0.', 'error');
      return;
    }

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

  const deshacerPagoFijo = (egreso) => {
    if (window.confirm('¿Deshacer este pago? El dinero volverá a tus cuentas automáticamente.')) {
      removeEgreso(egreso.id);
      showToast('Pago revertido y cuentas ajustadas.', 'success');
    }
  };

  const pagosFijosOrdenados = useMemo(() => {
    return [...pagosFijos].sort((a, b) => {
      const aPaid = !!getEgresoPagoFijo(a);
      const bPaid = !!getEgresoPagoFijo(b);
      
      if (aPaid && !bPaid) return 1;
      if (!aPaid && bPaid) return -1;
      
      return (a.diaPago || 1) - (b.diaPago || 1);
    });
  }, [pagosFijos, egresosMes]);

  const pagosRealizados = pagosFijosOrdenados.filter(pf => !!getEgresoPagoFijo(pf)).length;

  // ============================================================================
  // ESTRUCTURA VISUAL (UI)
  // ============================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* ENCABEZADO */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Receipt className="text-rose-400 w-8 h-8"/> 
          Gestión de Egresos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registra tus gastos diarios, abonos a deudas y checklist de pagos fijos.
        </p>
      </header>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-t-4 border-t-rose-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Gastado/Pagado (Mes)</p>
          <p className="text-xl md:text-2xl font-black text-rose-400">{formatCOP(totalMes)}</p>
        </Card>
        
        <Card className="p-4 border-t-4 border-t-orange-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Gastos/Pagos Fijos</p>
          <p className="text-xl md:text-2xl font-black text-orange-400">{formatCOP(totalFijos)}</p>
        </Card>
        
        <Card className="p-4 border-t-4 border-t-blue-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Gastos Variables</p>
          <p className="text-xl md:text-2xl font-black text-blue-400">{formatCOP(totalVariables)}</p>
        </Card>
      </div>

      {/* ============================================================================ */}
      {/* 1. FORMULARIO REGISTRO NORMAL */}
      {/* ============================================================================ */}
      <Card className="border-t-4 border-t-rose-500 transition-all duration-300">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2 select-none"
          onClick={() => toggleSection('form')}
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            1. Registrar Gasto o Pago a Deuda
          </h2>
          <button className="text-slate-400 hover:text-white transition-colors">
            {openSections.form ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>

        {openSections.form && (
          <form 
            onSubmit={handleSubmit} 
            className="mt-5 animate-in slide-in-from-top-4 fade-in duration-300"
          >
            {/* FILA 1: DATOS BÁSICOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha</label>
                <input 
                  type="date" 
                  required 
                  value={fecha} 
                  onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                  onChange={(e) => setFecha(e.target.value)} 
                  className="w-full bg-[#0f0f11]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner cursor-pointer"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descripción</label>
                <input 
                  type="text" 
                  required 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Ej. Almuerzo, Pago de tarjeta..." 
                  className="w-full bg-[#0f0f11]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner placeholder:text-slate-700" 
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categoría</label>
                <div className="relative">
                  <select 
                    required 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)} 
                    className="w-full bg-[#0f0f11]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#17171a] text-slate-400">Seleccione...</option>
                    {categoriasConIntereses.map(c => <option key={c} value={c} className="bg-[#17171a] text-slate-200">{c}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"><ChevronDownIcon size={16} /></div>
                </div>
              </div>

            </div>

            {/* FILA 2: LÓGICA INTELIGENTE DE CÓMO SE PAGÓ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Método de Pago</label>
                <div className="relative">
                  <select 
                    required 
                    value={metodoPago} 
                    onChange={handleMetodoChange} 
                    className="w-full bg-[#0f0f11]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#17171a] text-slate-400">Seleccione...</option>
                    <option value="cash" className="bg-[#17171a] text-slate-200">💵 Efectivo</option>
                    <option value="bank" className="bg-[#17171a] text-slate-200">🏦 Débito / Ahorros</option>
                    <option value="credit" className="bg-[#17171a] text-slate-200">💳 Tarjeta de Crédito</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"><ChevronDownIcon size={16} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">¿De cuál cuenta exacta?</label>
                <div className="relative">
                  <select 
                    required 
                    disabled={!metodoPago} 
                    value={cuentaId} 
                    onChange={(e) => setCuentaId(e.target.value)} 
                    className="w-full bg-[#0f0f11]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#17171a] text-slate-400">
                      {metodoPago ? 'Seleccione cuenta...' : 'Elija método primero'}
                    </option>
                    {cuentasFiltradas.map(c => <option key={c.id} value={c.id} className="bg-[#17171a] text-slate-200">{c.name}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"><ChevronDownIcon size={16} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monto Total</label>
                <input 
                  type="number" 
                  required 
                  value={monto} 
                  onChange={(e) => setMonto(e.target.value)} 
                  placeholder="$ 0" 
                  className="w-full bg-[#0f0f11]/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/20 transition-all duration-300 shadow-inner placeholder:text-slate-700" 
                />
              </div>

            </div>

            {/* FILA 3: ABONO A DEUDA E INTERESES (MÓDULO AZUL) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 md:p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-2xl">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <ShieldAlert size={14}/> Abonar a Deuda (Opcional)
                </label>
                <div className="relative">
                  <select 
                    value={deudaId} 
                    onChange={(e) => setDeudaId(e.target.value)} 
                    className="w-full bg-[#0f0f11]/80 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm text-indigo-200 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#17171a] text-slate-400">No es pago a deuda (Gasto normal)</option>
                    {todasLasDeudas.map(d => <option key={d.id} value={d.id} className="bg-[#17171a] text-slate-200">Pagar: {d.name}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-500/50"><ChevronDownIcon size={16} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  Intereses pagados (Opcional)
                </label>
                <input 
                  type="number" 
                  value={interesesOtros} 
                  onChange={(e) => setInteresesOtros(e.target.value)} 
                  placeholder="Ej: $ 15.000" 
                  className="w-full bg-[#0f0f11]/80 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm font-bold text-indigo-200 focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner placeholder:text-indigo-900/50" 
                />
              </div>

            </div>

            {/* FILA 4: CONTROLES */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-5 border-t border-white/[0.05]">
               
               <div className="flex bg-[#0f0f11] rounded-xl border border-white/10 p-1 w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={() => setTipo('Variable')} 
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${tipo === 'Variable' ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    Variable
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipo('Fijo')} 
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${tipo === 'Fijo' ? 'bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)] text-white' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    Fijo
                  </button>
               </div>
               
              <button 
                type="submit" 
                className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] active:scale-95"
              >
                <Plus size={18} /> Registrar Movimiento
              </button>

            </div>
          </form>
        )}
      </Card>


      {/* ============================================================================ */}
      {/* 2. PAGOS FIJOS (CHECKLIST EN 1 SOLA COLUMNA) */}
      {/* ============================================================================ */}
      <Card className="border-t-4 border-t-orange-500 flex flex-col transition-all duration-300 lg:col-span-2">
        <div 
          className="flex justify-between items-center cursor-pointer select-none" 
          onClick={() => toggleSection('fijos')}
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare size={20} className="text-orange-400"/> 2. Pagos Fijos (Checklist)
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
               {pagosRealizados} / {pagosFijos.length} Pagados
            </span>
            <button className="text-slate-400 hover:text-white transition-colors">
              {openSections.fijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.fijos && (
          <div className="mt-6 flex-1 overflow-y-auto max-h-[450px] pr-2 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full animate-in slide-in-from-top-4 fade-in duration-300">
            
            {pagosFijosOrdenados.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">No has configurado pagos fijos en Presupuestos.</p>
            ) : (
              <div className="flex flex-col gap-4">
              {pagosFijosOrdenados.map(pf => {
                const egresoAsociado = getEgresoPagoFijo(pf);
                const isPaid = !!egresoAsociado;
                
                return (
                  <div 
                    key={pf.id} 
                    className={`p-4 md:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                      isPaid 
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' 
                        : 'bg-white/[0.02] border-white/10 hover:border-orange-500/30 shadow-lg'
                    }`}
                  >
                    
                    {/* Sección Izquierda: Botón, Nombre y Fecha */}
                    <div className="flex items-center gap-4 w-full md:w-1/3 shrink-0">
                      <button 
                        onClick={() => isPaid ? deshacerPagoFijo(egresoAsociado) : registrarPagoFijo(pf)} 
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all duration-300 shrink-0 group ${
                          isPaid 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-rose-500 hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                            : 'bg-[#0f0f11] border-white/20 text-transparent hover:border-orange-500 hover:shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                        }`} 
                        title={isPaid ? "Deshacer este pago" : "Marcar como pagado"}
                      >
                         {isPaid ? (
                           <React.Fragment>
                             <CheckIcon size={14} className="group-hover:hidden" />
                             <XIcon size={14} className="hidden group-hover:block" />
                           </React.Fragment>
                         ) : (
                           <CheckIcon size={14} />
                         )}
                      </button>
                      
                      <div className="overflow-hidden">
                        <p className={`text-sm md:text-base font-bold truncate ${isPaid ? 'text-emerald-400 line-through opacity-70' : 'text-slate-200'}`}>
                          {pf.descripcion}
                        </p>
                        <p className="text-[10px] font-bold tracking-widest text-slate-500 mt-1 uppercase">
                          Día sugerido: {pf.diaPago || 1} • {pf.categoria}
                        </p>
                      </div>
                    </div>
                    
                    {/* Sección Central y Derecha */}
                    {!isPaid ? (
                      <div className="flex-1 flex flex-col md:flex-row items-center gap-3 w-full">
                        
                        <div className="relative w-full flex-1">
                          <select 
                            value={getPfCuenta(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'cuentaId', e.target.value)} 
                            title="Cuenta desde la que pagas"
                            className="w-full bg-[#0f0f11]/60 border border-white/10 text-slate-300 rounded-xl p-3 text-[11px] outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-[#17171a]">De dónde sale...</option>
                            {cuentasActivas.map(c => <option key={c.id} value={c.id} className="bg-[#17171a]">{c.name}</option>)}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"><ChevronDownIcon size={14} /></div>
                        </div>

                        <div className="relative w-full flex-1">
                          <select 
                            value={getPfDeuda(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'deudaId', e.target.value)} 
                            title="Abonar a Deuda (Opcional)"
                            className="w-full bg-[#0f0f11]/60 border border-white/10 text-slate-300 rounded-xl p-3 text-[11px] outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-[#17171a]">No es pago a deuda</option>
                            {todasLasDeudas.map(d => <option key={d.id} value={d.id} className="bg-[#17171a]">Pagar: {d.name}</option>)}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"><ChevronDownIcon size={14} /></div>
                        </div>
                        
                        <div className="w-full md:w-32 shrink-0">
                           <input 
                             type="number" 
                             value={getPfMonto(pf)} 
                             onChange={(e) => handlePfChange(pf.id, 'monto', e.target.value)} 
                             title="Monto exacto a pagar"
                             className="w-full bg-[#0f0f11]/60 border border-white/10 text-[13px] font-black text-orange-400 rounded-xl p-3 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-right transition-all shadow-inner placeholder:text-orange-900" 
                           />
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex justify-end items-center gap-5 w-full">
                        <div className="text-right border-r border-emerald-500/20 pr-5">
                          <p className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-black mb-1">Monto Pagado</p>
                          <p className="text-base font-black text-emerald-400">{formatCOP(egresoAsociado.monto)}</p>
                        </div>
                        <button 
                          onClick={() => deshacerPagoFijo(egresoAsociado)}
                          className="text-[11px] font-black text-rose-400 hover:text-white hover:bg-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-500/20 uppercase tracking-wider"
                        >
                          Deshacer
                        </button>
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
      <Card className="flex flex-col border-t-4 border-t-slate-600 mt-6 transition-all duration-300">
        <div 
          className="flex justify-between items-center cursor-pointer select-none mb-2" 
          onClick={() => toggleSection('historial')}
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListIcon className="text-slate-400" /> 3. Historial Completo de Egresos
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-[#0f0f11] border border-white/10 text-slate-400 text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest shadow-inner">
              {egresosFiltrados.length} Movimientos
            </span>
            <button className="text-slate-400 hover:text-white transition-colors">
              {openSections.historial ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.historial && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0f0f11]/40 mt-5 animate-in slide-in-from-top-4 fade-in duration-300 shadow-inner">
            <table className="w-full text-left border-collapse min-w-[900px]">
              
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-400 bg-white/[0.02]">
                  <th className="p-5 font-black w-[10%]">Fecha</th>
                  <th className="p-5 font-black w-[25%]">Descripción</th>
                  <th className="p-5 font-black w-[12%] text-center">Fijo/Var</th>
                  <th className="p-5 font-black w-[15%]">Categoría</th>
                  <th className="p-5 font-black w-[15%]">Cuenta</th>
                  <th className="p-5 font-black w-[15%] text-right">Monto</th>
                  <th className="p-5 font-black text-center w-[8%]">Acciones</th>
                </tr>
                
                {/* Fila de Filtros */}
                <tr className="border-b-2 border-white/10 bg-white/[0.01]">
                  <th className="p-2"></th>
                  <th className="p-2">
                    <input type="text" placeholder="Buscar descripción..." className="w-full bg-[#0f0f11] border border-white/10 rounded-lg p-2.5 text-[11px] text-white focus:outline-none focus:border-rose-500/50 shadow-inner placeholder:text-slate-600" value={filters.descripcion} onChange={e => setFilters({...filters, descripcion: e.target.value})}/>
                  </th>
                  <th className="p-2">
                    <select className="w-full bg-[#0f0f11] border border-white/10 rounded-lg p-2.5 text-[11px] text-white focus:outline-none focus:border-rose-500/50 shadow-inner appearance-none cursor-pointer" value={filters.tipo} onChange={e => setFilters({...filters, tipo: e.target.value})}>
                      <option value="Ambos">Ambos</option>
                      <option value="Fijo">Fijo</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </th>
                  <th className="p-2">
                    <select className="w-full bg-[#0f0f11] border border-white/10 rounded-lg p-2.5 text-[11px] text-white focus:outline-none focus:border-rose-500/50 shadow-inner appearance-none cursor-pointer" value={filters.categoria} onChange={e => setFilters({...filters, categoria: e.target.value})}>
                      <option value="">Todas</option>
                      {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </th>
                  <th className="p-2">
                    <select className="w-full bg-[#0f0f11] border border-white/10 rounded-lg p-2.5 text-[11px] text-white focus:outline-none focus:border-rose-500/50 shadow-inner appearance-none cursor-pointer" value={filters.cuenta} onChange={e => setFilters({...filters, cuenta: e.target.value})}>
                      <option value="">Todas</option>
                      {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </th>
                  <th className="p-2"></th>
                  <th className="p-2 text-center">
                    <button onClick={limpiarFiltros} className="text-[10px] uppercase font-black text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-3 py-2 rounded-lg w-full transition-all border border-rose-500/20">Limpiar</button>
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {egresosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500 font-medium italic">No se encontraron gastos con esos filtros.</td>
                  </tr>
                ) : (
                  egresosFiltrados.map(egreso => {
                    const isEditing = editingId === egreso.id;
                    const cuentaObj = cuentas.find(c => c.id === egreso.cuentaId);
                    const cuentaName = cuentaObj?.name || 'Cuenta eliminada';
                    
                    return (
                      <tr key={egreso.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        
                        <td className="p-5 text-slate-400 text-[11px] font-bold tracking-wider">
                          {isEditing ? (
                            <input type="date" value={editData.fecha} onChange={e => setEditData({...editData, fecha: e.target.value})} className="w-full bg-[#0f0f11] border border-white/10 rounded p-1.5 text-xs text-white outline-none" />
                          ) : egreso.fecha}
                        </td>

                        <td className="p-5 text-slate-200 font-bold text-[13px]">
                          {isEditing ? (
                            <input type="text" value={editData.descripcion} onChange={e => setEditData({...editData, descripcion: e.target.value})} className="w-full bg-[#0f0f11] border border-white/10 rounded p-1.5 text-xs text-white outline-none" />
                          ) : egreso.descripcion}
                        </td>

                        <td className="p-5 text-center">
                          {isEditing ? (
                            <select value={editData.tipo} onChange={e => setEditData({...editData, tipo: e.target.value})} className="w-full bg-[#0f0f11] border border-white/10 rounded p-1.5 text-xs text-white outline-none">
                              <option value="Fijo">Fijo</option><option value="Variable">Variable</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-lg border uppercase tracking-widest ${egreso.tipo === 'Fijo' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                              {egreso.tipo || 'VARIABLE'}
                            </span>
                          )}
                        </td>

                        <td className="p-5">
                          {isEditing ? (
                            <select value={editData.categoria} onChange={e => setEditData({...editData, categoria: e.target.value})} className="w-full bg-[#0f0f11] border border-white/10 rounded p-1.5 text-xs text-white outline-none">
                              {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          ) : (<span className="px-3 py-1.5 bg-[#0f0f11] border border-white/5 text-slate-300 text-[11px] font-bold rounded-lg tracking-wide shadow-inner">{egreso.categoria}</span>)}
                        </td>

                        <td className="p-5">
                          {isEditing ? (
                            <select value={editData.cuentaId} onChange={e => setEditData({...editData, cuentaId: e.target.value})} className="w-full bg-[#0f0f11] border border-white/10 rounded p-1.5 text-xs text-white outline-none">
                              {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          ) : (<p className="text-[11px] text-blue-400 font-bold tracking-wide">Pagado con: {cuentaName}</p>)}
                        </td>

                        <td className="p-5 text-right flex flex-col items-end">
                          {isEditing ? (
                            <React.Fragment>
                              <input type="number" value={editData.monto} onChange={e => setEditData({...editData, monto: e.target.value})} className="w-full bg-[#0f0f11] border border-white/10 rounded p-1.5 text-xs text-right text-white outline-none font-bold mb-1" placeholder="Monto total"/>
                              <input type="number" value={editData.interesesOtros || ''} onChange={e => setEditData({...editData, interesesOtros: e.target.value})} className="w-full bg-[#0f0f11]/50 border border-indigo-500/30 rounded p-1.5 text-[10px] text-right text-indigo-300 outline-none placeholder:text-indigo-900/50" placeholder="Intereses incluidos"/>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <span className="font-black text-rose-400 text-sm tabular-nums">{formatCOP(egreso.monto)}</span>
                              {egreso.interesesOtros > 0 && <span className="text-[9px] text-indigo-400 font-bold mt-1 tracking-widest uppercase">Incluye Int: {formatCOP(egreso.interesesOtros)}</span>}
                            </React.Fragment>
                          )}
                        </td>

                        <td className="p-5">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={saveEdit} className="text-emerald-400 hover:text-white hover:bg-emerald-500 p-2 bg-emerald-500/10 rounded-lg transition-all border border-emerald-500/20" title="Confirmar"><CheckIcon size={14} /></button>
                              <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-white hover:bg-rose-500 p-2 bg-rose-500/10 rounded-lg transition-all border border-rose-500/20" title="Cancelar"><XIcon size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => startEditing(egreso)} className="text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 hover:bg-indigo-500/10 p-2 rounded-lg" title="Editar"><Edit3 size={14}/></button>
                              <button onClick={() => handleDelete(egreso.id)} className="text-slate-500 hover:text-rose-500 transition-colors bg-white/5 hover:bg-rose-500/10 p-2 rounded-lg" title="Eliminar"><Trash2 size={14}/></button>
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
