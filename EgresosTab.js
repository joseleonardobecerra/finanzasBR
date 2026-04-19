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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ============================================================================
  // ÍCONOS SVG NATIVOS
  // ============================================================================
  const CheckIcon = ({ size = 16, className = "" }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
  
  const XIcon = ({ size = 16, className = "" }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const ChevronDownIcon = ({ size = 20, className = "" }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const ChevronUpIcon = ({ size = 20, className = "" }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );

  // ============================================================================
  // ESTADOS DEL COMPONENTE
  // ============================================================================
  
  // 1. Estados del Formulario Principal
  const [fecha, setFecha] = useState(getLocalToday());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [deudaId, setDeudaId] = useState('');
  const [tipo, setTipo] = useState('Variable');

  // 2. Estados de Edición en Línea (Historial)
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // 3. Filtros del Historial
  const [filters, setFilters] = useState({ 
    descripcion: '', 
    tipo: 'Ambos', 
    categoria: '', 
    cuenta: '' 
  });

  // 4. Control de Acordeones
  const [openSections, setOpenSections] = useState({ 
    form: true, 
    fijos: true, 
    historial: false 
  });

  // 5. Estado temporal para pagos fijos
  const [pfState, setPfState] = useState({});

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ 
      ...prev, 
      [sec]: !prev[sec] 
    }));
  };

  // ============================================================================
  // CÁLCULOS Y LISTAS FILTRADAS
  // ============================================================================
  const cuentasActivas = cuentas.filter(c => !['loan'].includes(c.type));
  const todasLasDeudas = cuentas.filter(c => ['credit', 'loan'].includes(c.type));

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

  const egresosFiltrados = useMemo(() => {
    return egresosMes.filter(egreso => {
      const descSegura = egreso.descripcion || '';
      const matchDesc = descSegura.toLowerCase().includes(filters.descripcion.toLowerCase());
      
      const matchTipo = filters.tipo === 'Ambos' || egreso.tipo === filters.tipo;
      
      const matchCat = filters.categoria === '' || egreso.categoria === filters.categoria;
      
      const matchCuenta = filters.cuenta === '' || egreso.cuentaId === filters.cuenta;
      
      return matchDesc && matchTipo && matchCat && matchCuenta;
    });
  }, [egresosMes, filters]);

  // ============================================================================
  // FUNCIONES CRUD (CREAR, EDITAR, ELIMINAR)
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
      cuentaId, 
      tipo, 
      deudaId: deudaId || null 
    });
    
    setDescripcion(''); 
    setMonto(''); 
    setDeudaId(''); 
    showToast('Gasto o Pago registrado correctamente.');
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
      monto: Number(editData.monto) 
    });
    
    setEditingId(null); 
    showToast('Gasto actualizado.');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) { 
      removeEgreso(id); 
      showToast('Registro eliminado.', 'error'); 
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
  // LÓGICA DE PAGOS FIJOS (CHECKLIST)
  // ============================================================================
  const checkPagoRealizado = (pfDesc) => {
    const descSegura = pfDesc || '';
    return egresosMes.some(e => 
      e.tipo === 'Fijo' && 
      (e.descripcion || '').toLowerCase().includes(descSegura.toLowerCase())
    );
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
      showToast('Selecciona una cuenta de pago.', 'error'); 
      return; 
    }
    if (montoFinal <= 0) { 
      showToast('El monto debe ser mayor a 0.', 'error'); 
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
      deudaId: deudaFinal 
    });
    
    showToast(`Pago de ${pf.descripcion} registrado.`);
  };

  const pagosFijosOrdenados = useMemo(() => {
    return [...pagosFijos].sort((a, b) => {
      const aPaid = checkPagoRealizado(a.descripcion);
      const bPaid = checkPagoRealizado(b.descripcion);
      
      if (aPaid && !bPaid) return 1;
      if (!aPaid && bPaid) return -1;
      
      return (a.diaPago || 1) - (b.diaPago || 1);
    });
  }, [pagosFijos, egresosMes]);

  // ============================================================================
  // RENDER JSX DE LA VISTA
  // ============================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* ----------------- HEADER ----------------- */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-rose-400 text-3xl">🧾</span> 
          Gestión de Egresos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registra tus gastos diarios, abonos a deudas y checklist de pagos fijos.
        </p>
      </header>

      {/* ----------------- TARJETAS DE RESUMEN ----------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 shadow-sm border-t-4 border-t-rose-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Total Gastado/Pagado (Mes)
          </p>
          <p className="text-xl md:text-2xl font-black text-rose-400">
            {formatCOP(totalMes)}
          </p>
        </div>
        
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 shadow-sm border-t-4 border-t-orange-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Gastos/Pagos Fijos
          </p>
          <p className="text-xl md:text-2xl font-black text-orange-400">
            {formatCOP(totalFijos)}
          </p>
        </div>
        
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 shadow-sm border-t-4 border-t-blue-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Gastos Variables
          </p>
          <p className="text-xl md:text-2xl font-black text-blue-400">
            {formatCOP(totalVariables)}
          </p>
        </div>

      </div>

      {/* ----------------- SECCIÓN 1: FORMULARIO PRINCIPAL ----------------- */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg border-t-4 border-t-rose-500 transition-all duration-300">
        
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
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-in slide-in-from-top-4 fade-in duration-300"
          >
            {/* Campo: Fecha */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Fecha
              </label>
              <input 
                type="date" 
                required 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"
              />
            </div>
            
            {/* Campo: Descripción */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Descripción
              </label>
              <input 
                type="text" 
                required 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                placeholder="Ej. Almuerzo, Pago de tarjeta..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"
              />
            </div>
            
            {/* Campo: Categoría */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Categoría
              </label>
              <select 
                required 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"
              >
                <option value="">Seleccione...</option>
                {categoriasMaestras.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo: Cuenta Origen */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                De dónde sale la plata
              </label>
              <select 
                required 
                value={cuentaId} 
                onChange={(e) => setCuentaId(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"
              >
                <option value="">Seleccione cuenta...</option>
                {cuentasActivas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'cash' ? '💵' : c.type === 'credit' ? '💳' : '🏦'} {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Campo: Abono a Deuda */}
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1">
                Abonar a Deuda (Opcional)
              </label>
              <select 
                value={deudaId} 
                onChange={(e) => setDeudaId(e.target.value)} 
                className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-lg px-3 py-2 mt-1 text-sm text-indigo-300 focus:border-indigo-500 outline-none"
              >
                <option value="">No es pago a deuda (Gasto normal)</option>
                {todasLasDeudas.map(d => (
                  <option key={d.id} value={d.id}>
                    Pagar: {d.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Campo: Monto */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Monto Total
              </label>
              <input 
                type="number" 
                required 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                placeholder="$ 0" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none font-bold"
              />
            </div>

            {/* Controles Finales del Formulario */}
            <div className="md:col-span-3 flex justify-between items-center mt-2 pt-4 border-t border-slate-800/50">
               
               {/* Toggle Fijo/Variable */}
               <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-1">
                  <button 
                    type="button" 
                    onClick={() => setTipo('Variable')} 
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      tipo === 'Variable' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Variable
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipo('Fijo')} 
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      tipo === 'Fijo' 
                        ? 'bg-orange-600 text-white' 
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Fijo
                  </button>
               </div>
              
              {/* Botón de Enviar */}
              <button 
                type="submit" 
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                <span className="text-lg leading-none">+</span> Registrar Movimiento
              </button>

            </div>
          </form>
        )}
      </div>

      {/* ----------------- SECCIÓN 2: PAGOS FIJOS (CHECKLIST) ----------------- */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg border-t-4 border-t-orange-500 flex flex-col transition-all duration-300">
        
        <div 
          className="flex justify-between items-center cursor-pointer select-none" 
          onClick={() => toggleSection('fijos')}
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400 text-xl">✅</span> 
            2. Pagos Fijos (Checklist)
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              {pagosFijos.filter(pf => checkPagoRealizado(pf.descripcion)).length} / {pagosFijos.length} Pagados
            </span>
            <button className="text-slate-400 hover:text-white transition-colors">
              {openSections.fijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.fijos && (
          <div className="mt-4 flex-1 overflow-y-auto max-h-[400px] pr-1 space-y-3 animate-in slide-in-from-top-4 fade-in duration-300">
            
            {pagosFijosOrdenados.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">
                No has configurado pagos fijos en Presupuestos.
              </p>
            ) : (
              pagosFijosOrdenados.map(pf => {
                const isPaid = checkPagoRealizado(pf.descripcion);
                
                return (
                  <div 
                    key={pf.id} 
                    className={`p-4 rounded-xl border flex flex-col transition-all gap-4 ${
                      isPaid 
                        ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60' 
                        : 'bg-slate-950 border-slate-800 hover:border-orange-500/30 shadow-md'
                    }`}
                  >
                    
                    {/* Parte Superior del Checklist */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => !isPaid && registrarPagoFijo(pf)} 
                          disabled={isPaid} 
                          className={`w-6 h-6 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            isPaid 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-slate-900 border-slate-600 text-transparent hover:border-orange-500'
                          }`}
                        >
                          <CheckIcon size={14} />
                        </button>
                        <div>
                          <p className={`text-base font-bold ${
                            isPaid ? 'text-emerald-400 line-through' : 'text-slate-200'
                          }`}>
                            {pf.descripcion}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Día sugerido de pago: {pf.diaPago || 1}
                          </p>
                        </div>
                      </div>
                      
                      {/* Si ya está pagado, muestra el valor aquí */}
                      {isPaid && (
                        <p className="text-lg font-black text-emerald-500/50 text-right">
                          {formatCOP(Number(pf.monto || pf.montoEstimado || 0))}
                        </p>
                      )}
                    </div>
                    
                    {/* Controles de Edición Rápida (Solo si no está pagado) */}
                    {!isPaid && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/50">
                        
                        {/* Selector: Cuenta */}
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">
                            Pagar desde:
                          </label>
                          <select 
                            value={getPfCuenta(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'cuentaId', e.target.value)} 
                            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg p-2 outline-none focus:border-orange-500 w-full"
                          >
                            <option value="">Seleccione cuenta...</option>
                            {cuentasActivas.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Selector: Deuda */}
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase text-indigo-400 font-bold mb-1">
                            Abonar a Deuda (Opcional):
                          </label>
                          <select 
                            value={getPfDeuda(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'deudaId', e.target.value)} 
                            className="bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 rounded-lg p-2 outline-none focus:border-indigo-500 w-full"
                          >
                            <option value="">No es deuda</option>
                            {todasLasDeudas.map(d => (
                              <option key={d.id} value={d.id}>
                                Pagar: {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Input: Monto Exacto */}
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">
                            Monto Exacto:
                          </label>
                          <input 
                            type="number" 
                            value={getPfMonto(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'monto', e.target.value)} 
                            className="bg-slate-900 border border-slate-700 text-sm font-bold text-orange-400 rounded-lg p-2 outline-none focus:border-orange-500 w-full text-right"
                          />
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ----------------- SECCIÓN 3: TABLA HISTORIAL ----------------- */}
      <div className="bg-slate-900/10 p-6 rounded-2xl border border-slate-800 border-t-4 border-t-slate-600 transition-all duration-300 mt-6">
        
        <div 
          className="flex justify-between items-center cursor-pointer select-none mb-2" 
          onClick={() => toggleSection('historial')}
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-slate-400 text-xl">📜</span> 
            3. Historial Completo de Egresos
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 border border-slate-700 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {egresosFiltrados.length} Movimientos
            </span>
            <button className="text-slate-400 hover:text-white transition-colors">
              {openSections.historial ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.historial && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 mt-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <table className="w-full text-left border-collapse min-w-[900px]">
              
              <thead>
                {/* --- Encabezados Principales --- */}
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/80">
                  <th className="p-4 font-bold w-[10%]">Fecha</th>
                  <th className="p-4 font-bold w-[25%]">Descripción</th>
                  <th className="p-4 font-bold w-[12%] text-center">Fijo/Var</th>
                  <th className="p-4 font-bold w-[15%]">Categoría</th>
                  <th className="p-4 font-bold w-[15%]">Cuenta</th>
                  <th className="p-4 font-bold w-[15%] text-right">Monto</th>
                  <th className="p-4 font-bold text-center w-[8%]">Acciones</th>
                </tr>
                
                {/* --- Fila de Filtros Dinámicos --- */}
                <tr className="border-b-2 border-slate-800 bg-slate-900/40">
                  <th className="p-2"></th>
                  <th className="p-2">
                    <input 
                      type="text" 
                      placeholder="Buscar descripción..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none placeholder:text-slate-600" 
                      value={filters.descripcion} 
                      onChange={e => setFilters({...filters, descripcion: e.target.value})}
                    />
                  </th>
                  <th className="p-2">
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none" 
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
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none" 
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
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none" 
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
                      className="text-[10px] uppercase font-black text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-3 py-1.5 rounded-lg w-full transition-all"
                    >
                      Limpiar
                    </button>
                  </th>
                </tr>
              </thead>

              {/* --- Cuerpo de la Tabla --- */}
              <tbody className="text-sm">
                
                {egresosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500 font-medium italic">
                      No se encontraron gastos con esos filtros.
                    </td>
                  </tr>
                ) : (
                  egresosFiltrados.map(egreso => {
                    const isEditing = editingId === egreso.id;
                    const cuentaName = cuentas.find(c => c.id === egreso.cuentaId)?.name || 'Cuenta eliminada';
                    
                    return (
                      <tr 
                        key={egreso.id} 
                        className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                      >
                        
                        {/* Celda: Fecha */}
                        <td className="p-4 text-slate-400 text-xs font-medium">
                          {isEditing ? (
                            <input 
                              type="date" 
                              value={editData.fecha} 
                              onChange={e => setEditData({...editData, fecha: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"
                            />
                          ) : (
                            egreso.fecha
                          )}
                        </td>

                        {/* Celda: Descripción */}
                        <td className="p-4 text-slate-200 font-bold text-[13px]">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editData.descripcion} 
                              onChange={e => setEditData({...editData, descripcion: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"
                            />
                          ) : (
                            egreso.descripcion
                          )}
                        </td>

                        {/* Celda: Tipo (Fijo/Variable) */}
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <select 
                              value={editData.tipo} 
                              onChange={e => setEditData({...editData, tipo: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"
                            >
                              <option value="Fijo">Fijo</option>
                              <option value="Variable">Variable</option>
                            </select>
                          ) : (
                            <span 
                              className={`px-2 py-1 text-[9px] font-bold rounded border uppercase tracking-wider ${
                                egreso.tipo === 'Fijo' 
                                  ? 'bg-[#431407]/40 text-orange-400 border-orange-500/20' 
                                  : 'bg-blue-900/20 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              {egreso.tipo || 'VARIABLE'}
                            </span>
                          )}
                        </td>

                        {/* Celda: Categoría */}
                        <td className="p-4">
                          {isEditing ? (
                            <select 
                              value={editData.categoria} 
                              onChange={e => setEditData({...editData, categoria: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"
                            >
                              {categoriasMaestras.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[11px] rounded-md font-medium">
                              {egreso.categoria}
                            </span>
                          )}
                        </td>

                        {/* Celda: Cuenta */}
                        <td className="p-4">
                          {isEditing ? (
                            <select 
                              value={editData.cuentaId} 
                              onChange={e => setEditData({...editData, cuentaId: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"
                            >
                              {cuentasActivas.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-[10px] text-blue-400 font-medium">
                              Pagado con: {cuentaName}
                            </p>
                          )}
                        </td>

                        {/* Celda: Monto */}
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editData.monto} 
                              onChange={e => setEditData({...editData, monto: e.target.value})} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-right text-white"
                            />
                          ) : (
                            <span className="font-black text-rose-400 text-[14px]">
                              {formatCOP(egreso.monto)}
                            </span>
                          )}
                        </td>

                        {/* Celda: Acciones */}
                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={saveEdit} 
                                className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-400/10 rounded transition-colors"
                              >
                                <CheckIcon size={16} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)} 
                                className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-400/10 rounded transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => startEditing(egreso)} 
                                className="text-slate-500 hover:text-indigo-400 transition-colors"
                              >
                                <span className="text-sm">✏️</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(egreso.id)} 
                                className="text-slate-500 hover:text-rose-500 transition-colors"
                              >
                                <span className="text-sm">🗑️</span>
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

      </div>
    </div>
  );
};
