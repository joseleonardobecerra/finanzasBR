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
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
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

  const ListIcon = ({ size = 18, className = "" }) => (
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
  const [metodoPago, setMetodoPago] = useState(''); // NUEVO: cash, bank, credit
  const [cuentaId, setCuentaId] = useState('');
  const [deudaId, setDeudaId] = useState('');
  const [interesesOtros, setInteresesOtros] = useState(''); // NUEVO: Valor de intereses
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
  // 4. ESTADOS PARA COMPRAS A CUOTAS
  // ============================================================================
  const [showModalCuotas, setShowModalCuotas] = useState(false);
  const [cuotaData, setCuotaData] = useState({
    fecha: getLocalToday(),
    descripcion: '',
    categoria: '',
    montoTotal: '',
    numeroCuotas: '',
    tarjetaId: '',
    tasaMensual: ''
  });

  // ============================================================================
  // 5. ESTADOS PARA LOS ACORDEONES
  // ============================================================================
  const [openSections, setOpenSections] = useState({
    form: true,
    cuotas: false,
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
  // 6. ESTADOS PARA EDICIÓN RÁPIDA DE PAGOS FIJOS
  // ============================================================================
  const [pfState, setPfState] = useState({});

  // Listas de Cuentas Filtradas Globales
  const cuentasActivas = cuentas.filter(c => ['bank', 'cash', 'credit', 'pocket'].includes(c.type));
  const tarjetasCredito = cuentas.filter(c => c.type === 'credit');
  const todasLasDeudas = cuentas.filter(c => ['credit', 'loan'].includes(c.type));

  // NUEVO: Filtro dinámico de cuentas según el método de pago elegido
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
      interesesOtros: Number(interesesOtros) || 0, // NUEVO: Guardamos el interés
      cuentaId,
      tipo,
      deudaId: deudaId || null
    });
    
    // Limpiamos los campos
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
      monto: Number(editData.monto) 
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
  const checkPagoRealizado = (pf) => {
    return egresosMes.some(e => {
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

  const pagosFijosOrdenados = useMemo(() => {
    return [...pagosFijos].sort((a, b) => {
      const aPaid = checkPagoRealizado(a);
      const bPaid = checkPagoRealizado(b);
      if (aPaid && !bPaid) return 1;
      if (!aPaid && bPaid) return -1;
      return (a.diaPago || 1) - (b.diaPago || 1);
    });
  }, [pagosFijos, egresosMes]);

  // ============================================================================
  // FUNCIONES PARA COMPRAS A CUOTAS
  // ============================================================================
  const handleAddCuotas = (e) => {
    e.preventDefault();
    if (!cuotaData.descripcion || !cuotaData.montoTotal || !cuotaData.numeroCuotas || !cuotaData.tarjetaId || !cuotaData.categoria) {
      showToast('Faltan datos de la compra a cuotas', 'error');
      return;
    }
    const montoTotal = Number(cuotaData.montoTotal);
    const numeroCuotas = Number(cuotaData.numeroCuotas);
    const tasaMes = Number(cuotaData.tasaMensual) || 0;
    let valorCuota;
    if (tasaMes > 0) {
      const tm = tasaMes / 100;
      valorCuota = Math.round(montoTotal * (tm * Math.pow(1 + tm, numeroCuotas)) / (Math.pow(1 + tm, numeroCuotas) - 1));
    } else {
      valorCuota = Math.round(montoTotal / numeroCuotas);
    }
    addComprasCuotas({
      id: generateId(),
      fecha: cuotaData.fecha,
      descripcion: cuotaData.descripcion,
      categoria: cuotaData.categoria,
      montoTotal,
      numeroCuotas,
      tarjetaId: cuotaData.tarjetaId,
      tasaMensual: tasaMes,
      valorCuota,
      cuotasPagadas: 1,
      estado: 'Activa'
    });
    // Solo la primera cuota va al historial de egresos
    addEgreso({
      id: generateId(),
      fecha: cuotaData.fecha,
      descripcion: `Cuota 1/${numeroCuotas}: ${cuotaData.descripcion}`,
      categoria: cuotaData.categoria,
      monto: valorCuota,
      cuentaId: cuotaData.tarjetaId,
      tipo: 'Variable',
      esCuota: true,
      deudaId: null
    });
    setShowModalCuotas(false);
    setCuotaData({ fecha: getLocalToday(), descripcion: '', categoria: '', montoTotal: '', numeroCuotas: '', tarjetaId: '', tasaMensual: '' });
    showToast(`Compra registrada. Cuota mensual: ${formatCOP(valorCuota)}`);
  };

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
             <Receipt size={20} className="text-[#0b0c16]"/> 
          </div>
          Gestión de Egresos
        </h1>
        <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
          Registra tus gastos diarios, abonos a deudas, pagos fijos y compras a cuotas.
        </p>
      </header>

      {/* TARJETAS RESUMEN (Neumorfismo Inset) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
            Total Gastado/Pagado (Mes)
          </p>
          <p className="text-xl md:text-3xl font-black text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]">
            {formatCOP(totalMes)}
          </p>
        </div>
        
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
            Gastos/Pagos Fijos
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
              <label className={labelBaseClass}>
                Fecha
              </label>
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
              <label className={labelBaseClass}>
                Descripción
              </label>
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
              <label className={labelBaseClass}>
                Categoría
              </label>
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
              <label className={labelBaseClass}>
                Método de Pago
              </label>
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
              <label className={labelBaseClass}>
                De dónde sale la plata
              </label>
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
                <ShieldAlert size={12}/> Abonar a Deuda (Opcional)
              </label>
              <select 
                value={deudaId} 
                onChange={(e) => setDeudaId(e.target.value)} 
                className={`${inputBaseClass} !border-indigo-500/30 focus:!border-indigo-500 focus:!shadow-[0_0_15px_rgba(99,102,241,0.4)] appearance-none cursor-pointer`}
              >
                <option value="" className="bg-[#111222]">No es pago a deuda</option>
                {todasLasDeudas.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#111222]">
                    Pagar: {d.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Fila 3: Montos */}
            <div className="md:col-span-2 relative">
              <label className={labelBaseClass}>
                Monto Total Pagado
              </label>
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
                className="w-full md:w-auto bg-neonmagenta hover:bg-[#ff1a8c] text-[#0b0c16] font-black py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-magenta hover:scale-105 active:scale-95 tracking-wide"
              >
                <Plus size={20} strokeWidth={3} /> GUARDAR MOVIMIENTO
              </button>
            </div>
          </form>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ============================================================================ */}
        {/* 2. COMPRAS A CUOTAS (ACORDEÓN) */}
        {/* ============================================================================ */}
        <Card>
          <div 
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() => toggleSection('cuotas')}
          >
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
               <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">2</span>
               Compras a Cuotas
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowModalCuotas(true); 
                }} 
                className="bg-[#111222] border border-indigo-500/30 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] text-indigo-400 text-xs font-black py-1.5 px-4 rounded-lg flex items-center gap-1 transition-all uppercase tracking-widest"
              >
                <Plus size={14}/> Nueva
              </button>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openSections.cuotas ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {openSections.cuotas && (
            <div className="mt-6 flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32]">
              
              {comprasCuotas.filter(c => c.estado === 'Activa' || !c.estado).length === 0 ? (
                <p className="text-sm text-[#8A92A6] font-bold text-center py-10">
                  No tienes compras a cuotas activas.
                </p>
              ) : (
                comprasCuotas.filter(c => c.estado === 'Activa' || !c.estado).map(cuota => {
                  
                  const tarjetaAsociada = tarjetasCredito.find(t => t.id === cuota.tarjetaId);
                  const numCuotasSeguro = Number(cuota.numeroCuotas) || 1;
                  const montoTotalSeguro = Number(cuota.montoTotal) || Number(cuota.monto) || 0;
                  const valorCuotaAprox = montoTotalSeguro / numCuotasSeguro;

                  return (
                    <div 
                      key={cuota.id} 
                      className="bg-[#111222] shadow-neumorph-inset rounded-xl p-4 flex justify-between items-center relative overflow-hidden group border border-transparent hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                      
                      <div className="pl-3">
                         <p className="text-sm font-bold text-white">
                           {cuota.descripcion}
                         </p>
                         <p className="text-[10px] text-[#8A92A6] font-bold mt-1 tracking-wider uppercase">
                           {tarjetaAsociada?.name || 'Tarjeta'} • <span className="text-indigo-400">{cuota.cuotasPagadas || 0}/{cuota.numeroCuotas || '?'}</span> Pagadas
                         </p>
                      </div>
                      
                      <div className="text-right pr-2 group-hover:pr-10 transition-all">
                         <p className="text-sm font-black text-indigo-400">
                           {formatCOP(valorCuotaAprox)} 
                           <span className="text-[9px] text-[#8A92A6] font-bold uppercase">/mes</span>
                         </p>
                         <p className="text-[10px] text-[#8A92A6] font-bold mt-1 uppercase tracking-wider">
                           Total: {formatCOP(montoTotalSeguro)}
                         </p>
                      </div>
                      
                      <button 
                        onClick={() => removeComprasCuotas(cuota.id)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-rose-500 text-white p-2 rounded-lg shadow-glow-magenta transition-all hover:bg-rose-400"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </Card>

        {/* ============================================================================ */}
        {/* 3. PAGOS FIJOS (ACORDEÓN + EDICIÓN + CONEXIÓN A DEUDAS) */}
        {/* ============================================================================ */}
        <Card>
          <div 
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() => toggleSection('fijos')}
          >
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
               <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs">3</span>
               Checklist de Pagos
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest">
                 {pagosFijos.filter(pf => checkPagoRealizado(pf)).length} / {pagosFijos.length} Listo
              </span>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openSections.fijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {openSections.fijos && (
            <div className="mt-6 flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32]">
              
              {pagosFijosOrdenados.length === 0 ? (
                <p className="text-sm text-[#8A92A6] font-bold text-center py-10">
                  No has configurado pagos fijos en Presupuestos.
                </p>
              ) : (
                pagosFijosOrdenados.map(pf => {
                  const isPaid = checkPagoRealizado(pf);
                  
                  return (
                    <div 
                      key={pf.id} 
                      className={`p-4 rounded-xl flex flex-col transition-all gap-4 border ${
                        isPaid 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : 'bg-[#111222] shadow-neumorph-inset border-transparent hover:border-amber-500/30'
                      }`}
                    >
                      {/* Fila 1: Botón y Título */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => !isPaid && registrarPagoFijo(pf)} 
                            disabled={isPaid} 
                            className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                              isPaid 
                                ? 'bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                : 'bg-[#111222] border-slate-600 text-transparent hover:border-amber-500'
                            }`}
                          >
                            <CheckIcon size={14} />
                          </button>
                          
                          <div>
                            <p className={`text-sm font-bold tracking-wide ${isPaid ? 'text-emerald-500/70 line-through' : 'text-white'}`}>
                              {pf.descripcion}
                            </p>
                            <p className="text-[10px] text-[#8A92A6] font-black uppercase tracking-widest mt-0.5">
                              Día sugerido: {pf.diaPago || 1}
                            </p>
                          </div>
                        </div>

                        {/* Monto pagado si ya está checkeado */}
                        {isPaid && (
                          <p className="text-sm font-black text-emerald-500/50 text-right">
                            {formatCOP(Number(pf.monto || pf.montoEstimado || 0))}
                          </p>
                        )}
                      </div>
                      
                      {/* Fila 2: Controles de edición ANTES de pagar */}
                      {!isPaid && (
                        <div className="flex flex-col md:flex-row items-center gap-2 pl-9 pt-3 border-t border-white/[0.05]">
                          
                          {/* Origen del dinero */}
                          <select 
                            value={getPfCuenta(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'cuentaId', e.target.value)}
                            title="Cuenta desde la que pagas"
                            className="bg-appcard border border-white/[0.05] text-[10px] font-bold uppercase tracking-wider text-slate-300 rounded-lg p-2 outline-none focus:border-amber-500 flex-1 w-full appearance-none cursor-pointer shadow-sm"
                          >
                            <option value="">De dónde sale...</option>
                            {cuentasActivas.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>

                          {/* Selector de Abono a Deuda en Pagos Fijos */}
                          <select 
                            value={getPfDeuda(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'deudaId', e.target.value)}
                            title="Deuda a la que vas a abonar (Opcional)"
                            className="bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider text-indigo-300 rounded-lg p-2 outline-none focus:border-indigo-500 flex-1 w-full appearance-none cursor-pointer"
                          >
                            <option value="">No es pago a deuda</option>
                            {todasLasDeudas.map(d => (
                              <option key={d.id} value={d.id}>Pagar: {d.name}</option>
                            ))}
                          </select>
                          
                          {/* Monto exacto */}
                          <input 
                            type="number" 
                            value={getPfMonto(pf)} 
                            onChange={(e) => handlePfChange(pf.id, 'monto', e.target.value)}
                            title="Monto exacto a pagar"
                            className="bg-appcard border border-white/[0.05] text-[11px] font-black text-amber-400 rounded-lg p-2 outline-none focus:border-amber-500 w-full md:w-28 text-right shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ============================================================================ */}
      {/* 4. TABLA HISTORIAL COMPLETA (ACORDEÓN) */}
      {/* ============================================================================ */}
      <Card>
        <div 
          className="flex justify-between items-center cursor-pointer select-none mb-4"
          onClick={() => toggleSection('historial')}
        >
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-xs"><ListIcon size={14}/></span>
            Historial Completo de Egresos
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
                                <Edit3 size={16}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(egreso.id)} 
                                className="text-[#8A92A6] hover:text-rose-500 transition-colors" 
                                title="Eliminar"
                              >
                                <Trash2 size={16}/>
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

      {/* ============================================================================ */}
      {/* MODAL PARA AGREGAR NUEVA COMPRA A CUOTAS */}
      {/* ============================================================================ */}
      {showModalCuotas && (
        <div className="fixed inset-0 bg-[#0b0c16]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-appcard w-full max-w-md rounded-[30px] border border-white/[0.05] p-6 md:p-8 animate-in zoom-in-95 duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
            
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-xl font-black text-white tracking-wide">
                Nueva Compra a Cuotas
              </h3>
              <button 
                onClick={() => setShowModalCuotas(false)} 
                className="text-slate-500 hover:text-rose-400 bg-[#111222] p-2 rounded-full transition-all hover:shadow-glow-magenta"
              >
                <XIcon size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleAddCuotas} className="space-y-5 relative z-10">
              <div>
                <label className={labelBaseClass}>
                  Fecha de compra
                </label>
                <input 
                  type="date" 
                  required 
                  value={cuotaData.fecha} 
                  onChange={e => setCuotaData({...cuotaData, fecha: e.target.value})} 
                  className={`${inputBaseClass} [&::-webkit-calendar-picker-indicator]:invert-[0.8]`}
                />
              </div>
              
              <div>
                <label className={labelBaseClass}>
                  Descripción
                </label>
                <input 
                  type="text" 
                  required 
                  value={cuotaData.descripcion} 
                  onChange={e => setCuotaData({...cuotaData, descripcion: e.target.value})} 
                  placeholder="Ej. Computador, Viaje..." 
                  className={inputBaseClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBaseClass}>
                    Categoría
                  </label>
                  <select 
                    required 
                    value={cuotaData.categoria} 
                    onChange={e => setCuotaData({...cuotaData, categoria: e.target.value})} 
                    className={`${inputBaseClass} appearance-none`}
                  >
                    <option value="" className="bg-[#111222]">Sel...</option>
                    {categoriasMaestras.map(c => (
                      <option key={c} value={c} className="bg-[#111222]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelBaseClass}>
                    Tarjeta de Crédito
                  </label>
                  <select 
                    required 
                    value={cuotaData.tarjetaId} 
                    onChange={e => setCuotaData({...cuotaData, tarjetaId: e.target.value})} 
                    className={`${inputBaseClass} appearance-none`}
                  >
                    <option value="" className="bg-[#111222]">Sel...</option>
                    {tarjetasCredito.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#111222]">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBaseClass}>
                    Monto Total
                  </label>
                  <input 
                    type="number" 
                    required 
                    value={cuotaData.montoTotal} 
                    onChange={e => setCuotaData({...cuotaData, montoTotal: e.target.value})} 
                    placeholder="$ 0" 
                    className={`${inputBaseClass} font-black text-indigo-400`}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>
                    Número de Cuotas
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    value={cuotaData.numeroCuotas} 
                    onChange={e => setCuotaData({...cuotaData, numeroCuotas: e.target.value})} 
                    placeholder="Ej. 12" 
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-xl mt-4 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] active:scale-95 tracking-widest uppercase"
              >
                Guardar Compra a Cuotas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
