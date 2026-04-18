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
  // ÍCONOS SVG NATIVOS (Solución definitiva para ReferenceError: X is not defined)
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

  // ============================================================================
  // 1. ESTADOS DEL FORMULARIO PRINCIPAL
  // ============================================================================
  const [fecha, setFecha] = useState(getLocalToday());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cuentaId, setCuentaId] = useState('');
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

  const cuentasActivas = cuentas.filter(c => ['bank', 'cash', 'credit', 'pocket'].includes(c.type));
  const tarjetasCredito = cuentas.filter(c => c.type === 'credit');

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
      showToast('Por favor completa todos los campos.', 'error');
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
      deudaId: null
    });
    
    setDescripcion('');
    setMonto('');
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
  const registrarPagoFijo = (pf) => {
    const defaultCuenta = cuentasActivas.length > 0 ? cuentasActivas[0].id : '';
    // ✨ FIX: Soporta datos viejos (monto) o nuevos (montoEstimado)
    const valorPago = Number(pf.monto || pf.montoEstimado || 0); 
    
    addEgreso({
      id: generateId(),
      fecha: getLocalToday(),
      descripcion: pf.descripcion,
      categoria: pf.categoria || 'Otros',
      monto: valorPago,
      cuentaId: defaultCuenta,
      tipo: 'Fijo',
      deudaId: null
    });
    showToast(`Pago de ${pf.descripcion} registrado.`);
  };

  const checkPagoRealizado = (pfDesc) => {
    return egresosMes.some(e => e.tipo === 'Fijo' && e.descripcion.toLowerCase().includes(pfDesc.toLowerCase()));
  };

  // ============================================================================
  // FUNCIONES PARA COMPRAS A CUOTAS
  // ============================================================================
  const handleAddCuotas = (e) => {
    e.preventDefault();
    if (!cuotaData.descripcion || !cuotaData.montoTotal || !cuotaData.numeroCuotas || !cuotaData.tarjetaId || !cuotaData.categoria) {
      showToast('Faltan datos de la compra a cuotas', 'error');
      return;
    }

    addComprasCuotas({
      id: generateId(),
      fecha: cuotaData.fecha,
      descripcion: cuotaData.descripcion,
      categoria: cuotaData.categoria,
      montoTotal: Number(cuotaData.montoTotal),
      numeroCuotas: Number(cuotaData.numeroCuotas),
      tarjetaId: cuotaData.tarjetaId,
      tasaMensual: Number(cuotaData.tasaMensual) || 0,
      cuotasPagadas: 0,
      estado: 'Activa'
    });

    addEgreso({
      id: generateId(),
      fecha: cuotaData.fecha,
      descripcion: `Compra a cuotas: ${cuotaData.descripcion}`,
      categoria: cuotaData.categoria,
      monto: Number(cuotaData.montoTotal),
      cuentaId: cuotaData.tarjetaId,
      tipo: 'Variable',
      esCuota: true
    });

    setShowModalCuotas(false);
    setCuotaData({ fecha: getLocalToday(), descripcion: '', categoria: '', montoTotal: '', numeroCuotas: '', tarjetaId: '', tasaMensual: '' });
    showToast('Compra a cuotas registrada exitosamente.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Receipt className="text-rose-400 w-8 h-8"/> 
          Gestión de Egresos
        </h1>
        <p className="text-sm text-slate-400 mt-1">Registra tus gastos diarios, pagos fijos y compras a cuotas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-t-4 border-t-rose-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Gastado (Mes)</p>
          <p className="text-xl md:text-2xl font-black text-rose-400">{formatCOP(totalMes)}</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-orange-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Gastos Fijos</p>
          <p className="text-xl md:text-2xl font-black text-orange-400">{formatCOP(totalFijos)}</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-blue-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Gastos Variables</p>
          <p className="text-xl md:text-2xl font-black text-blue-400">{formatCOP(totalVariables)}</p>
        </Card>
      </div>

      <Card className="border-t-4 border-t-rose-500">
        <h2 className="text-lg font-bold text-white mb-4">1. Registrar Gasto Individual</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
            <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
            <input type="text" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Almuerzo, Recibo luz..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"/>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
            <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none">
              <option value="">Seleccione...</option>
              {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Cuenta de Pago</label>
            <select required value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none">
              <option value="">Seleccione...</option>
              {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.type === 'cash' ? '💵' : c.type === 'credit' ? '💳' : '🏦'} {c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Monto</label>
            <input type="number" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$ 0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-rose-500 outline-none"/>
          </div>

          <div className="md:col-span-6 flex justify-between items-center mt-2">
             <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-1">
                <button type="button" onClick={() => setTipo('Variable')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${tipo === 'Variable' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}>Variable</button>
                <button type="button" onClick={() => setTipo('Fijo')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${tipo === 'Fijo' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}>Fijo</button>
             </div>
            <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20 active:scale-95">
              <Plus size={18} /> Agregar Gasto
            </button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============================================================================ */}
        {/* 2. COMPRAS A CUOTAS (TARJETAS DE CRÉDITO) */}
        {/* ============================================================================ */}
        <Card className="border-t-4 border-t-indigo-500 flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <CreditCard size={20} className="text-indigo-400"/>
               2. Compras a Cuotas
            </h2>
            <button onClick={() => setShowModalCuotas(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors">
              <Plus size={14}/> Nueva
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* ✨ FIX: Acepta las que dicen 'Activa' o las antiguas que no tienen estado (!c.estado) */}
            {comprasCuotas.filter(c => c.estado === 'Activa' || !c.estado).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">No tienes compras a cuotas activas.</p>
            ) : (
              comprasCuotas.filter(c => c.estado === 'Activa' || !c.estado).map(cuota => {
                const tarjetaAsociada = tarjetasCredito.find(t => t.id === cuota.tarjetaId);
                const valorCuotaAprox = cuota.montoTotal / cuota.numeroCuotas;

                return (
                  <div key={cuota.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500"></div>
                    <div className="pl-3">
                       <p className="text-sm font-bold text-white">{cuota.descripcion}</p>
                       <p className="text-[10px] text-slate-400 mt-0.5">
                         {tarjetaAsociada?.name || 'Tarjeta'} • {cuota.cuotasPagadas || 0}/{cuota.numeroCuotas} Cuotas
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-indigo-400">{formatCOP(valorCuotaAprox)} <span className="text-[9px] text-slate-500 font-normal">/mes</span></p>
                       <p className="text-[10px] text-slate-500 mt-0.5">Total: {formatCOP(cuota.montoTotal)}</p>
                    </div>
                    <button onClick={() => removeComprasCuotas(cuota.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-rose-500 text-white p-2 rounded-lg shadow-lg transition-all hover:bg-rose-400">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* ============================================================================ */}
        {/* 3. PAGOS FIJOS (CHECKLIST DEL MES) */}
        {/* ============================================================================ */}
        <Card className="border-t-4 border-t-orange-500 flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <CheckSquare size={20} className="text-orange-400"/>
               3. Pagos Fijos (Checklist)
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
               {pagosFijos.filter(pf => checkPagoRealizado(pf.descripcion)).length} / {pagosFijos.length} Pagados
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {pagosFijos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">No has configurado pagos fijos en la pestaña Presupuestos.</p>
            ) : (
              pagosFijos.sort((a,b) => a.diaPago - b.diaPago).map(pf => {
                const isPaid = checkPagoRealizado(pf.descripcion);
                // ✨ FIX: Soporta datos viejos (monto) o nuevos (montoEstimado) para evitar el $ NaN
                const valorPagoFijo = Number(pf.monto || pf.montoEstimado || 0);

                return (
                  <div key={pf.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${isPaid ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60' : 'bg-slate-950 border-slate-800 hover:border-orange-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => !isPaid && registrarPagoFijo(pf)} disabled={isPaid} className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isPaid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-900 border-slate-600 text-transparent hover:border-orange-500'}`}>
                        <CheckIcon size={14} />
                      </button>
                      <div>
                        <p className={`text-sm font-bold ${isPaid ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>{pf.descripcion}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Día sugerido: {pf.diaPago || 1}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${isPaid ? 'text-emerald-500/50' : 'text-orange-400'}`}>
                      {formatCOP(valorPagoFijo)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* ============================================================================ */}
      {/* 4. TABLA HISTORIAL COMPLETA CON FILTROS DIVIDIDOS */}
      {/* ============================================================================ */}
      <Card className="flex flex-col border-t-4 border-t-slate-600 mt-6 bg-slate-900/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            4. Historial Completo de Egresos
          </h2>
          <span className="bg-slate-900 border border-slate-700 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {egresosFiltrados.length} Movimientos
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/80">
                <th className="p-4 font-bold w-[10%]">Fecha</th>
                <th className="p-4 font-bold w-[25%]">Descripción</th>
                <th className="p-4 font-bold w-[12%] text-center">Fijo/Var</th>
                <th className="p-4 font-bold w-[15%]">Categoría</th>
                <th className="p-4 font-bold w-[15%]">Cuenta</th>
                <th className="p-4 font-bold w-[15%] text-right">Monto</th>
                <th className="p-4 font-bold text-center w-[8%]">Acciones</th>
              </tr>
              
              <tr className="border-b-2 border-slate-800 bg-slate-900/40">
                <th className="p-2"></th>
                <th className="p-2">
                  <input type="text" placeholder="Buscar descripción..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none placeholder:text-slate-600" value={filters.descripcion} onChange={e => setFilters({...filters, descripcion: e.target.value})}/>
                </th>
                <th className="p-2">
                  <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none" value={filters.tipo} onChange={e => setFilters({...filters, tipo: e.target.value})}>
                    <option value="Ambos">Ambos</option><option value="Fijo">Fijo</option><option value="Variable">Variable</option>
                  </select>
                </th>
                <th className="p-2">
                  <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none" value={filters.categoria} onChange={e => setFilters({...filters, categoria: e.target.value})}>
                    <option value="">Categorías (Todas)</option>
                    {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </th>
                <th className="p-2">
                  <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-rose-500 outline-none" value={filters.cuenta} onChange={e => setFilters({...filters, cuenta: e.target.value})}>
                    <option value="">Cuentas (Todas)</option>
                    {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </th>
                <th className="p-2"></th>
                <th className="p-2 text-center">
                  <button onClick={limpiarFiltros} className="text-[10px] uppercase font-black text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-3 py-1.5 rounded-lg w-full transition-all">Limpiar</button>
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
                    <tr key={egreso.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-slate-400 text-xs font-medium">
                        {isEditing ? <input type="date" value={editData.fecha} onChange={e => setEditData({...editData, fecha: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"/> : egreso.fecha}
                      </td>

                      <td className="p-4 text-slate-200 font-bold text-[13px]">
                        {isEditing ? <input type="text" value={editData.descripcion} onChange={e => setEditData({...editData, descripcion: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white"/> : egreso.descripcion}
                      </td>

                      <td className="p-4 text-center">
                        {isEditing ? (
                          <select value={editData.tipo} onChange={e => setEditData({...editData, tipo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white">
                            <option value="Fijo">Fijo</option><option value="Variable">Variable</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-[9px] font-bold rounded border uppercase tracking-wider ${egreso.tipo === 'Fijo' ? 'bg-[#431407]/40 text-orange-400 border-orange-500/20' : 'bg-blue-900/20 text-blue-400 border-blue-500/20'}`}>
                            {egreso.tipo || 'VARIABLE'}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <select value={editData.categoria} onChange={e => setEditData({...editData, categoria: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white">
                            {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[11px] rounded-md font-medium">{egreso.categoria}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <select value={editData.cuentaId} onChange={e => setEditData({...editData, cuentaId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-white">
                            {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <p className="text-[10px] text-blue-400 font-medium">Pagado con: {cuentaName}</p>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {isEditing ? (
                          <input type="number" value={editData.monto} onChange={e => setEditData({...editData, monto: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none text-right text-white"/>
                        ) : (
                          <span className="font-black text-rose-400 text-[14px]">{formatCOP(egreso.monto)}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-400/10 rounded transition-colors" title="Confirmar"><CheckIcon size={16}/></button>
                            <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-400/10 rounded transition-colors" title="Cancelar"><XIcon size={16}/></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => startEditing(egreso)} className="text-slate-500 hover:text-indigo-400 transition-colors" title="Editar"><Edit3 size={14}/></button>
                            <button onClick={() => handleDelete(egreso.id)} className="text-slate-500 hover:text-rose-500 transition-colors" title="Eliminar"><Trash2 size={14}/></button>
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
      </Card>

      {/* ============================================================================ */}
      {/* MODAL PARA AGREGAR NUEVA COMPRA A CUOTAS */}
      {/* ============================================================================ */}
      {showModalCuotas && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-[#17171a] w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Nueva Compra a Cuotas</h3>
              <button onClick={() => setShowModalCuotas(false)} className="text-slate-500 hover:text-rose-400 transition-colors">
                <XIcon size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleAddCuotas} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Fecha de compra</label>
                <input type="date" required value={cuotaData.fecha} onChange={e => setCuotaData({...cuotaData, fecha: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-indigo-500 outline-none"/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                <input type="text" required value={cuotaData.descripcion} onChange={e => setCuotaData({...cuotaData, descripcion: e.target.value})} placeholder="Ej. Computador, Viaje..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-indigo-500 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                  <select required value={cuotaData.categoria} onChange={e => setCuotaData({...cuotaData, categoria: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-indigo-500 outline-none">
                    <option value="">Seleccione...</option>
                    {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Tarjeta de Crédito</label>
                  <select required value={cuotaData.tarjetaId} onChange={e => setCuotaData({...cuotaData, tarjetaId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-indigo-500 outline-none">
                    <option value="">Seleccione...</option>
                    {tarjetasCredito.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Monto Total</label>
                  <input type="number" required value={cuotaData.montoTotal} onChange={e => setCuotaData({...cuotaData, montoTotal: e.target.value})} placeholder="$ 0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-indigo-500 outline-none"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Número de Cuotas</label>
                  <input type="number" required min="1" max="72" value={cuotaData.numeroCuotas} onChange={e => setCuotaData({...cuotaData, numeroCuotas: e.target.value})} placeholder="Ej. 12" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-indigo-500 outline-none"/>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-6 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
                Guardar Compra a Cuotas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
