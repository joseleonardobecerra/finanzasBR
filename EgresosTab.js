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
  showToast,
  privacyMode 
}) => {
  const { useState, useMemo } = React;

  // ============================================================================
  // UTILIDADES
  // ============================================================================
  
  const formatCOP = (val) => {
    if (privacyMode) return '****';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Función de fecha local (Colombia) para registro automático
  const getLocalToday = () => {
    const d = new Date();
    const bogotaOffset = -5 * 60; 
    const localTime = new Date(d.getTime() + (bogotaOffset + d.getTimezoneOffset()) * 60000);
    return localTime.toISOString().slice(0, 10);
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
  const Edit3 = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  );
  const Trash2 = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  );
  const Plus = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
  // 4. ESTADOS PARA LOS ACORDEONES Y TABLAS
  // ============================================================================
  const [openSections, setOpenSections] = useState({
    form: true,
    fijos: true, 
    historial: false
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [pfState, setPfState] = useState({});
  const [tcState, setTcState] = useState({});
  
  const [editingPfId, setEditingPfId] = useState(null);
  const [pfEditData, setPfEditData] = useState({});
  
  const [nuevoPf, setNuevoPf] = useState({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '1' });

  const cuentasActivas = cuentas.filter(c => ['bank', 'cash', 'pocket'].includes(c.type));
  const todasLasDeudas = cuentas.filter(c => ['credit', 'loan'].includes(c.type));
  const tarjetasCredito = cuentas.filter(c => c.type === 'credit');

  const cuentasFiltradas = useMemo(() => {
    if (!metodoPago) return [];
    if (metodoPago === 'cash') return cuentasActivas.filter(c => c.type === 'cash');
    if (metodoPago === 'bank') return cuentasActivas.filter(c => c.type === 'bank' || c.type === 'pocket');
    if (metodoPago === 'credit') return tarjetasCredito;
    return [];
  }, [metodoPago, cuentasActivas, tarjetasCredito]);

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
  // FUNCIONES PARA TARJETAS DE CRÉDITO (CHECKLIST)
  // ============================================================================
  const getTCPagada = (tc) => egresosMes.find(e => e.pagoTarjetaId === tc.id);

  const handleTcChange = (id, field, value) => {
    setTcState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const registrarPagoTC = (tc) => {
    const cuentaSale = tcState[tc.id]?.cuentaId || '';
    const montoPago = Number(tcState[tc.id]?.monto) || 0;
    
    if (!cuentaSale) return showToast("Selecciona desde qué cuenta vas a pagar.", "error");
    if (montoPago <= 0) return showToast("Debes ingresar un monto a pagar mayor a 0.", "error");

    addEgreso({
      id: generateId(),
      fecha: getLocalToday(), // ✨ Automáticamente pone la fecha del día en que pagas
      descripcion: `Pago Tarjeta: ${tc.name}`,
      categoria: 'Tarjetas y Créditos',
      monto: montoPago,
      cuentaId: cuentaSale,
      tipo: 'Fijo',
      deudaId: tc.id,
      pagoTarjetaId: tc.id, 
    });
    
    showToast(`Pago de Tarjeta ${tc.name} registrado por ${formatCOP(montoPago)}.`);
  };

  const deshacerPagoTC = (tc) => {
    const egreso = getTCPagada(tc);
    if (egreso) {
      removeEgreso(egreso.id);
      showToast(`Pago de Tarjeta revertido.`, 'error');
    }
  };


  // ============================================================================
  // FUNCIONES PARA PAGOS FIJOS REGULARES (CHECKLIST)
  // ============================================================================
  const getPagoRealizado = (pf) => {
    return egresosMes.find(e => {
      if (e.tipo !== 'Fijo') return false;
      if (e.pagoFijoId) return e.pagoFijoId === pf.id;
      return e.descripcion.toLowerCase() === (pf.descripcion || '').toLowerCase();
    });
  };

  const getPfMonto = (pf) => pfState[pf.id]?.monto !== undefined 
    ? pfState[pf.id].monto 
    : Number(pf.monto || 0);

  // ✨ Ahora por defecto no pre-selecciona ninguna, te obliga a elegirla
  const getPfCuenta = (pf) => pfState[pf.id]?.cuentaId !== undefined 
    ? pfState[pf.id].cuentaId 
    : '';

  const handlePfChange = (id, field, value) => {
    setPfState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const registrarPagoFijo = (pf) => {
    const cuentaFinal = getPfCuenta(pf);
    const montoFinal = Number(getPfMonto(pf));
    
    // Validaciones de seguridad
    if (!cuentaFinal) return showToast('Por favor selecciona desde qué cuenta vas a pagar.', 'error');
    if (montoFinal <= 0) return showToast('El monto del pago debe ser mayor a 0.', 'error');

    addEgreso({
      id: generateId(),
      fecha: getLocalToday(), // ✨ Automáticamente pone la fecha del día en que pagas
      descripcion: pf.descripcion,
      categoria: pf.categoria || 'Otros',
      monto: montoFinal,
      cuentaId: cuentaFinal,
      tipo: 'Fijo',
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

  const startEditPf = (pf) => {
    setEditingPfId(pf.id);
    setPfEditData({ descripcion: pf.descripcion, categoria: pf.categoria, monto: pf.monto, diaPago: pf.diaPago });
  };

  const saveEditPf = () => {
    if (!pfEditData.descripcion || !pfEditData.monto) return showToast('El nombre y el monto son obligatorios.', 'error');
    updatePagoFijo(editingPfId, {
      descripcion: pfEditData.descripcion,
      categoria: pfEditData.categoria,
      monto: Number(pfEditData.monto),
      diaPago: Number(pfEditData.diaPago)
    });
    setEditingPfId(null);
    showToast("Pago Fijo base actualizado.");
  };

  const handleDeletePf = (pf) => {
    if(window.confirm(`¿Seguro que quieres eliminar la configuración de "${pf.descripcion}"?\n(Los pagos ya registrados este mes no se borrarán).`)) {
      removePagoFijo(pf.id);
      showToast("Gasto Fijo eliminado de la lista.", "error");
    }
  };

  const handleCreateNuevoPf = () => {
    if (!nuevoPf.descripcion || !nuevoPf.monto) return showToast('Escribe un nombre y un monto.', 'error');
    addPagoFijo({
      id: generateId(),
      descripcion: nuevoPf.descripcion,
      categoria: nuevoPf.categoria,
      monto: Number(nuevoPf.monto),
      diaPago: Number(nuevoPf.diaPago)
    });
    setNuevoPf({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '1' });
    showToast("Nuevo Pago Fijo agregado exitosamente.");
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

  const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neonmagenta focus:shadow-glow-magenta transition-all duration-300 placeholder:text-slate-600";
  const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

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
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Total Gastado (Mes)</p>
          <p className="text-xl md:text-3xl font-black text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]">{formatCOP(totalMes)}</p>
        </div>
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Gastos Fijos</p>
          <p className="text-xl md:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{formatCOP(totalFijos)}</p>
        </div>
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Gastos Variables</p>
          <p className="text-xl md:text-3xl font-black text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">{formatCOP(totalVariables)}</p>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 1. FORMULARIO REGISTRO NORMAL (ACORDEÓN) */}
      {/* ============================================================================ */}
      <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2 select-none"
          onClick={() => toggleSection('form')}
        >
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
            <span className="w-6 h-6 rounded-md bg-neonmagenta/20 text-neonmagenta flex items-center justify-center text-xs">1</span>
            Registrar Gasto o Pago Libre
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
              <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className={`${inputBaseClass} cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.8]`} />
            </div>
            <div>
              <label className={labelBaseClass}>Descripción</label>
              <input type="text" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Almuerzo, Pago libre..." className={inputBaseClass} />
            </div>
            <div>
              <label className={labelBaseClass}>Categoría</label>
              <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`${inputBaseClass} appearance-none cursor-pointer`}>
                <option value="" className="bg-[#111222]">Seleccione...</option>
                {categoriasMaestras.map(c => <option key={c} value={c} className="bg-[#111222]">{c}</option>)}
                {!categoriasMaestras.includes('Intereses y otros') && <option value="Intereses y otros" className="bg-[#111222]">Intereses y otros</option>}
              </select>
            </div>

            {/* Fila 2 */}
            <div>
              <label className={labelBaseClass}>Método de Pago</label>
              <select required value={metodoPago} onChange={(e) => { setMetodoPago(e.target.value); setCuentaId(''); }} className={`${inputBaseClass} appearance-none cursor-pointer`}>
                <option value="" className="bg-[#111222]">Seleccione...</option>
                <option value="cash" className="bg-[#111222]">💵 Efectivo (Leo/Andre)</option>
                <option value="bank" className="bg-[#111222]">🏦 Débito / Ahorro</option>
                <option value="credit" className="bg-[#111222]">💳 Tarjeta de Crédito</option>
              </select>
            </div>
            <div>
              <label className={labelBaseClass}>De dónde sale la plata</label>
              <select required disabled={!metodoPago} value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} className={`${inputBaseClass} appearance-none cursor-pointer disabled:opacity-30`}>
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
              <select value={deudaId} onChange={(e) => setDeudaId(e.target.value)} className={`${inputBaseClass} !border-indigo-500/30 focus:!border-indigo-500 focus:!shadow-[0_0_15px_rgba(99,102,241,0.4)] appearance-none cursor-pointer`}>
                <option value="" className="bg-[#111222]">No es pago a deuda</option>
                {todasLasDeudas.map(d => <option key={d.id} value={d.id} className="bg-[#111222]">Pagar: {d.name}</option>)}
              </select>
            </div>
            
            {/* Fila 3: Montos */}
            <div className="md:col-span-2 relative">
              <label className={labelBaseClass}>Monto Total Pagado</label>
              <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
              <input type="number" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" className={`${inputBaseClass} pl-8 font-black text-lg text-neonmagenta`} />
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest pl-1 mb-1.5 flex items-center gap-1">Pago de Intereses (Opcional)</label>
              <input type="number" value={interesesOtros} onChange={(e) => setInteresesOtros(e.target.value)} placeholder="$ 0 (Extra/Interés)" className={`${inputBaseClass} !border-amber-500/30 focus:!border-amber-500 focus:!shadow-[0_0_15px_rgba(251,191,36,0.4)] font-bold text-amber-400`} />
            </div>

            {/* Fila 4: Controles */}
            <div className="md:col-span-3 flex flex-col md:flex-row justify-between items-center mt-4 pt-6 border-t border-white/[0.05] gap-4">
               <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1 w-full md:w-auto">
                  <button type="button" onClick={() => setTipo('Variable')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${tipo === 'Variable' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-[#8A92A6] hover:text-white'}`}>Variable</button>
                  <button type="button" onClick={() => setTipo('Fijo')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${tipo === 'Fijo' ? 'bg-amber-500 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-[#8A92A6] hover:text-white'}`}>Fijo</button>
               </div>
              <button type="submit" className="w-full md:w-auto bg-neonmagenta hover:bg-[#ff1a8c] text-[#0b0c16] font-black py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-magenta hover:scale-105 active:scale-95 tracking-wide uppercase">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg> GUARDAR MOVIMIENTO
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ============================================================================ */}
      {/* 2. PAGOS FIJOS (NUEVAS TABLAS SEPARADAS: TC Y FIJOS) */}
      {/* ============================================================================ */}
      <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
        <div 
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => toggleSection('fijos')}
        >
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
             <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs">2</span>
             Checklist Mensual
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest">
               {pagosFijos.filter(pf => !!getPagoRealizado(pf)).length + tarjetasCredito.filter(tc => !!getTCPagada(tc)).length} Listos
            </span>
            <button className="text-slate-500 hover:text-white transition-colors">
              {openSections.fijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {openSections.fijos && (
          <div className="mt-8 space-y-8 animate-in slide-in-from-top-4 fade-in duration-300">
            
            {/* --- TABLA 2A: TARJETAS DE CRÉDITO --- */}
            <div>
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Pagar Tarjetas de Crédito
              </h3>
              <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
                <table className="w-full text-sm text-left min-w-[700px]">
                  <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-5 py-4 w-[10%] text-center">Estado</th>
                      <th className="px-5 py-4 w-[25%]">Tarjeta</th>
                      <th className="px-5 py-4 w-[20%] text-right">Deuda Total</th>
                      <th className="px-5 py-4 w-[25%]">Pagar desde...</th>
                      <th className="px-5 py-4 w-[20%] text-right">Monto a pagar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {tarjetasCredito.length === 0 ? (
                      <tr><td colSpan="5" className="p-6 text-center text-[#8A92A6] font-bold italic">No hay tarjetas de crédito registradas en la pestaña Créditos.</td></tr>
                    ) : (
                      tarjetasCredito.map(tc => {
                        const isPaid = !!getTCPagada(tc);
                        const egresoTc = getTCPagada(tc);
                        
                        return (
                          <tr key={tc.id} className={`transition-colors ${isPaid ? 'bg-emerald-900/10 opacity-60' : 'hover:bg-white/[0.02]'}`}>
                            
                            <td className="px-5 py-3 text-center">
                              <button 
                                onClick={() => isPaid ? deshacerPagoTC(tc) : registrarPagoTC(tc)} 
                                className={`w-6 h-6 rounded-md flex items-center justify-center border-2 mx-auto transition-all ${
                                  isPaid 
                                    ? 'bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer hover:bg-rose-500 hover:border-rose-500' 
                                    : 'bg-[#111222] border-slate-600 text-transparent hover:border-indigo-500 cursor-pointer'
                                }`}
                              >
                                {isPaid ? <CheckIcon size={14} className="hover:hidden block"/> : null}
                                {isPaid ? <XIcon size={14} className="hidden hover:block"/> : null}
                              </button>
                            </td>
                            
                            <td className={`px-5 py-3 font-bold tracking-wide ${isPaid ? 'line-through text-emerald-500/70' : 'text-white'}`}>
                              {tc.name}
                            </td>
                            
                            <td className="px-5 py-3 text-right font-black text-rose-400 tabular-nums">
                              {formatCOP(tc.currentDebt)}
                            </td>
                            
                            <td className="px-5 py-3">
                              {!isPaid ? (
                                <select 
                                  value={tcState[tc.id]?.cuentaId || ''} 
                                  onChange={(e) => handleTcChange(tc.id, 'cuentaId', e.target.value)} 
                                  className="w-full bg-[#0b0c16] border border-white/[0.05] rounded-lg px-3 py-2 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500 cursor-pointer"
                                >
                                  <option value="">Seleccione cuenta...</option>
                                  {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              ) : (
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                   {cuentas.find(c => c.id === egresoTc.cuentaId)?.name || 'Pagada'}
                                </span>
                              )}
                            </td>
                            
                            <td className="px-5 py-3 text-right">
                              {!isPaid ? (
                                <input 
                                  type="number" 
                                  placeholder="0" 
                                  value={tcState[tc.id]?.monto || ''} 
                                  onChange={(e) => handleTcChange(tc.id, 'monto', e.target.value)} 
                                  className="w-24 bg-[#0b0c16] border border-white/[0.05] rounded-lg px-3 py-2 text-xs text-emerald-400 font-black outline-none text-right shadow-neumorph-inset focus:border-emerald-500 ml-auto" 
                                />
                              ) : (
                                <span className="font-black text-emerald-500 tabular-nums">
                                  {formatCOP(egresoTc.monto)}
                                </span>
                              )}
                            </td>
                            
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- TABLA 2B: PAGOS FIJOS REGULARES --- */}
            <div>
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckIcon size={18} />
                Pagos Fijos (Servicios, Suscripciones, etc.)
              </h3>
              
              <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
                <table className="w-full text-sm text-left min-w-[900px]">
                  <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-5 py-4 w-[8%] text-center">Estado</th>
                      <th className="px-5 py-4 w-[20%]">Nombre</th>
                      <th className="px-5 py-4 w-[15%]">Categoría</th>
                      <th className="px-5 py-4 w-[8%] text-center">Día</th>
                      <th className="px-5 py-4 w-[20%]">Pagar desde...</th>
                      <th className="px-5 py-4 w-[15%] text-right">Monto</th>
                      <th className="px-5 py-4 w-[14%] text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    
                    {/* Filas de Pagos Fijos Existentes */}
                    {pagosFijosOrdenados.map(pf => {
                      const isPaid = !!getPagoRealizado(pf);
                      const isEditingBase = editingPfId === pf.id;

                      if (isEditingBase) {
                        return (
                          <tr key={pf.id} className="bg-amber-900/10">
                            <td className="px-3 py-3 text-center">-</td>
                            <td className="px-3 py-3">
                              <input type="text" value={pfEditData.descripcion} onChange={e=>setPfEditData({...pfEditData, descripcion: e.target.value})} className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500" placeholder="Nombre" />
                            </td>
                            <td className="px-3 py-3">
                              <select value={pfEditData.categoria} onChange={e=>setPfEditData({...pfEditData, categoria: e.target.value})} className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer">
                                {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <input type="number" value={pfEditData.diaPago} onChange={e=>setPfEditData({...pfEditData, diaPago: e.target.value})} className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-amber-500" placeholder="1" />
                            </td>
                            <td className="px-3 py-3 text-center text-slate-500">-</td>
                            <td className="px-3 py-3">
                              <input type="number" value={pfEditData.monto} onChange={e=>setPfEditData({...pfEditData, monto: e.target.value})} className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-amber-500" placeholder="Monto" />
                            </td>
                            <td className="px-3 py-3 text-center flex justify-center gap-2 mt-1">
                              <button onClick={saveEditPf} className="text-[#0b0c16] p-1.5 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors shadow-glow-cyan" title="Guardar"><CheckIcon size={14}/></button>
                              <button onClick={() => setEditingPfId(null)} className="text-rose-400 p-1.5 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors border border-rose-500/30" title="Cancelar"><XIcon size={14}/></button>
                            </td>
                          </tr>
                        )
                      }

                      return (
                        <tr key={pf.id} className={`transition-colors ${isPaid ? 'bg-emerald-900/10 opacity-60' : 'hover:bg-white/[0.02]'}`}>
                          
                          <td className="px-5 py-3 text-center">
                            <button 
                              onClick={() => isPaid ? deshacerPagoFijo(pf) : registrarPagoFijo(pf)} 
                              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 mx-auto transition-all ${
                                isPaid 
                                  ? 'bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer hover:bg-rose-500 hover:border-rose-500 hover:shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                                  : 'bg-[#111222] border-slate-600 text-transparent hover:border-amber-500 cursor-pointer'
                              }`}
                            >
                              {isPaid ? <CheckIcon size={14} className="hover:hidden block"/> : null}
                              {isPaid ? <XIcon size={14} className="hidden hover:block"/> : null}
                            </button>
                          </td>
                          
                          <td className={`px-5 py-3 font-bold tracking-wide ${isPaid ? 'line-through text-emerald-500/70' : 'text-white'}`}>
                            {pf.descripcion}
                          </td>
                          
                          <td className="px-5 py-3 text-xs text-[#8A92A6] font-bold uppercase tracking-wider">
                            {pf.categoria}
                          </td>
                          
                          <td className="px-5 py-3 text-center text-[#8A92A6] font-black">
                            {pf.diaPago || 1}
                          </td>

                          {/* ✨ NUEVO: Selector de cuenta para Pagos Fijos */}
                          <td className="px-5 py-3">
                            {!isPaid ? (
                              <select 
                                value={getPfCuenta(pf)} 
                                onChange={(e) => handlePfChange(pf.id, 'cuentaId', e.target.value)} 
                                className="w-full bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer"
                              >
                                <option value="">Seleccione cuenta...</option>
                                {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            ) : (
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                {cuentas.find(c => c.id === getPagoRealizado(pf)?.cuentaId)?.name || 'Pagado'}
                              </span>
                            )}
                          </td>
                          
                          <td className="px-5 py-3 text-right">
                            {!isPaid ? (
                              <input 
                                type="number" 
                                placeholder={pf.monto} 
                                value={pfState[pf.id]?.monto !== undefined ? pfState[pf.id].monto : pf.monto} 
                                onChange={(e) => handlePfChange(pf.id, 'monto', e.target.value)} 
                                className="w-24 bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-amber-400 font-black outline-none text-right shadow-neumorph-inset focus:border-amber-500 ml-auto" 
                                title="Monto a pagar este mes" 
                              />
                            ) : (
                              <span className="font-black text-emerald-500 tabular-nums">{formatCOP(getPagoRealizado(pf).monto)}</span>
                            )}
                          </td>
                          
                          <td className="px-5 py-3 text-center">
                            {!isPaid ? (
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => startEditPf(pf)} className="text-[#8A92A6] hover:text-amber-400 transition-colors" title="Editar base"><Edit3 size={16}/></button>
                                <button onClick={() => handleDeletePf(pf)} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar base"><Trash2 size={16}/></button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-black">Listo</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}

                    {/* Fila Fija al final para CREAR uno nuevo rápidamente */}
                    <tr className="bg-amber-500/5 border-t-2 border-amber-500/20">
                      <td className="px-3 py-3 text-center">
                        <Plus size={16} className="text-amber-500 mx-auto" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="text" value={nuevoPf.descripcion} onChange={e=>setNuevoPf({...nuevoPf, descripcion: e.target.value})} className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500" placeholder="Nuevo Pago Fijo..." />
                      </td>
                      <td className="px-3 py-3">
                        <select value={nuevoPf.categoria} onChange={e=>setNuevoPf({...nuevoPf, categoria: e.target.value})} className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer">
                          {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" value={nuevoPf.diaPago} onChange={e=>setNuevoPf({...nuevoPf, diaPago: e.target.value})} className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-amber-500" placeholder="1" />
                      </td>
                      <td className="px-3 py-3 text-center text-slate-500">-</td>
                      <td className="px-3 py-3">
                        <input type="number" value={nuevoPf.monto} onChange={e=>setNuevoPf({...nuevoPf, monto: e.target.value})} className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-amber-500" placeholder="Monto base" />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={handleCreateNuevoPf} className="text-[#0b0c16] px-3 py-1.5 bg-amber-400 rounded hover:bg-amber-300 transition-colors shadow-glow-amber text-[10px] font-black uppercase tracking-widest" title="Guardar nuevo">AGREGAR</button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ============================================================================ */}
      {/* 3. TABLA HISTORIAL COMPLETA (ACORDEÓN) */}
      {/* ============================================================================ */}
      <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
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
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none appearance-none cursor-pointer" 
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
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none appearance-none cursor-pointer" 
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
                      className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-neoncyan outline-none appearance-none cursor-pointer" 
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
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
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
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white appearance-none cursor-pointer"
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
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white appearance-none cursor-pointer"
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
                              className="w-full bg-[#111222] rounded px-2 py-1 text-xs outline-none text-white appearance-none cursor-pointer"
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
                              <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-400/10 rounded transition-colors" title="Confirmar">
                                <CheckIcon size={18} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-400/10 rounded transition-colors" title="Cancelar">
                                <XIcon size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-4">
                              <button onClick={() => startEditing(egreso)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                              </button>
                              <button onClick={() => handleDelete(egreso.id)} className="text-[#8A92A6] hover:text-rose-500 transition-colors" title="Eliminar">
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
      </div>
    </div>
  );
};
