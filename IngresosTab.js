const IngresosTab = ({ 
  ingresos, 
  addIngreso, 
  updateIngreso, 
  removeIngreso, 
  ingresosFijos, 
  addIngresoFijo, 
  updateIngresoFijo, 
  removeIngresoFijo, 
  cuentas, 
  selectedMonth, 
  showToast, 
  filtroPersona 
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
  // ESTADOS DEL FORMULARIO DE NUEVO INGRESO
  // ============================================================================
  const [fecha, setFecha] = useState(getLocalToday());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [tipo, setTipo] = useState('Fijo'); // Fijo, Variable, Rendimiento
  const [persona, setPersona] = useState('Total'); // Total, Leo, Andre

  // ============================================================================
  // ESTADOS DE EDICIÓN EN LÍNEA
  // ============================================================================
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ============================================================================
  // ESTADOS DE LOS FILTROS DE LA TABLA
  // ============================================================================
  const [filters, setFilters] = useState({
    fecha: '',
    descripcion: '',
    tipo: '',
    destino: '',
    monto: ''
  });

  const cuentasActivas = cuentas.filter(c => ['bank', 'cash', 'pocket'].includes(c.type));

  // ============================================================================
  // CÁLCULOS Y DATOS DEL MES
  // ============================================================================
  const ingresosMes = useMemo(() => {
    return ingresos
      .filter(i => i.fecha.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ingresos, selectedMonth]);

  const totalMes = ingresosMes.reduce((s, i) => s + Number(i.monto), 0);
  const totalFijos = ingresosMes.filter(i => i.tipo === 'Fijo').reduce((s, i) => s + Number(i.monto), 0);
  const totalVariables = ingresosMes.filter(i => i.tipo === 'Variable').reduce((s, i) => s + Number(i.monto), 0);
  const totalRendimientos = ingresosMes.filter(i => i.tipo === 'Rendimiento').reduce((s, i) => s + Number(i.monto), 0);

  // ============================================================================
  // APLICACIÓN DE FILTROS A LA TABLA
  // ============================================================================
  const ingresosFiltrados = useMemo(() => {
    return ingresosMes.filter(ingreso => {
      // Buscar el nombre de la cuenta para el filtro de destino
      const cuenta = cuentas.find(c => c.id === ingreso.cuentaId);
      const nombreCuenta = cuenta ? cuenta.name.toLowerCase() : '?';

      const matchFecha = ingreso.fecha.includes(filters.fecha);
      const matchDesc = ingreso.descripcion.toLowerCase().includes(filters.descripcion.toLowerCase());
      const matchTipo = filters.tipo === '' || ingreso.tipo === filters.tipo;
      const matchDestino = filters.destino === '' || nombreCuenta.includes(filters.destino.toLowerCase());
      const matchMonto = ingreso.monto.toString().includes(filters.monto);

      return matchFecha && matchDesc && matchTipo && matchDestino && matchMonto;
    });
  }, [ingresosMes, filters, cuentas]);

  // ============================================================================
  // FUNCIONES DE ACCIÓN (Guardar, Editar, Eliminar)
  // ============================================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion || !monto || !cuentaId) {
      showToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }
    
    addIngreso({
      id: generateId(),
      fecha,
      descripcion,
      monto: Number(monto),
      cuentaId,
      tipo,
      persona
    });
    
    setDescripcion('');
    setMonto('');
    showToast('Ingreso registrado correctamente.');
  };

  const startEditing = (ingreso) => {
    setEditingId(ingreso.id);
    setEditData({ ...ingreso });
  };

  const saveEdit = async () => {
    if (!editData.descripcion || !editData.monto || !editData.cuentaId) {
      showToast('Faltan datos en la edición', 'error');
      return;
    }
    await updateIngreso(editingId, { ...editData, monto: Number(editData.monto) });
    setEditingId(null);
    showToast('Ingreso actualizado.');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este ingreso?')) {
      removeIngreso(id);
      showToast('Ingreso eliminado.', 'error');
    }
  };

  const limpiarFiltros = () => {
    setFilters({ fecha: '', descripcion: '', tipo: '', destino: '', monto: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* ENCABEZADO */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Wallet className="text-emerald-400 w-8 h-8"/> 
          Gestión de Ingresos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registra y administra todo el dinero que entra a tus cuentas.
        </p>
      </header>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-t-4 border-t-emerald-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Ingresado</p>
          <p className="text-xl md:text-2xl font-black text-emerald-400">{formatCOP(totalMes)}</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-indigo-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Ingresos Fijos</p>
          <p className="text-xl md:text-2xl font-black text-indigo-400">{formatCOP(totalFijos)}</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-blue-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Ingresos Variables</p>
          <p className="text-xl md:text-2xl font-black text-blue-400">{formatCOP(totalVariables)}</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-amber-500">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Rendimientos</p>
          <p className="text-xl md:text-2xl font-black text-amber-400">{formatCOP(totalRendimientos)}</p>
        </Card>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      <Card className="border-t-4 border-t-emerald-500">
        <h2 className="text-lg font-bold text-white mb-4">1. Registrar Nuevo Ingreso</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
            <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"/>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
            <input type="text" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Salario, Venta, etc." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"/>
          </div>
          
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none">
              <option value="Fijo">Fijo (Salario)</option>
              <option value="Variable">Variable (Bono/Venta)</option>
              <option value="Rendimiento">Rendimiento (Interés)</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Destino</label>
            <select required value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none">
              <option value="">Seleccione...</option>
              {cuentasActivas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.type === 'cash' ? '💵' : c.type === 'pocket' ? '📈' : '🏦'} {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Monto</label>
            <input type="number" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$ 0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"/>
          </div>

          <div className="md:col-span-6 flex justify-end mt-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-colors">
              <Plus size={18} /> Agregar Ingreso
            </button>
          </div>
        </form>
      </Card>

      {/* TABLA HISTORIAL COMPLETA CON FILTROS */}
      <Card className="flex flex-col border-t-4 border-t-slate-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Historial Completo de Ingresos
          </h2>
          <span className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
            {ingresosFiltrados.length} registros
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              {/* ENCABEZADOS PRINCIPALES */}
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900">
                <th className="p-4 font-bold w-[12%]">Fecha</th>
                <th className="p-4 font-bold w-[30%]">Descripción</th>
                <th className="p-4 font-bold w-[15%]">Tipo</th>
                <th className="p-4 font-bold w-[20%]">Destino (Cuenta)</th>
                <th className="p-4 font-bold w-[15%]">Monto</th>
                <th className="p-4 font-bold text-center w-[8%]">Acciones</th>
              </tr>
              
              {/* FILA DE FILTROS INTELIGENTES */}
              <tr className="border-b-2 border-slate-700 bg-slate-900/50">
                <th className="p-2">
                  <input 
                    type="text" 
                    placeholder="Buscar fecha..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                    value={filters.fecha} 
                    onChange={e => setFilters({...filters, fecha: e.target.value})}
                  />
                </th>
                <th className="p-2">
                  <input 
                    type="text" 
                    placeholder="Buscar descripción..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                    value={filters.descripcion} 
                    onChange={e => setFilters({...filters, descripcion: e.target.value})}
                  />
                </th>
                <th className="p-2">
                  <select 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                    value={filters.tipo} 
                    onChange={e => setFilters({...filters, tipo: e.target.value})}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Fijo">Fijo</option>
                    <option value="Variable">Variable</option>
                    <option value="Rendimiento">Rendimiento</option>
                  </select>
                </th>
                <th className="p-2">
                  <input 
                    type="text" 
                    placeholder="Buscar cuenta..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                    value={filters.destino} 
                    onChange={e => setFilters({...filters, destino: e.target.value})}
                  />
                </th>
                <th className="p-2">
                  <input 
                    type="text" 
                    placeholder="Buscar monto..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                    value={filters.monto} 
                    onChange={e => setFilters({...filters, monto: e.target.value})}
                  />
                </th>
                <th className="p-2 text-center">
                  <button 
                    onClick={limpiarFiltros} 
                    className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded w-full transition-colors"
                  >
                    Limpiar
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {ingresosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                    No se encontraron ingresos con esos filtros.
                  </td>
                </tr>
              ) : (
                ingresosFiltrados.map(ingreso => {
                  const isEditing = editingId === ingreso.id;
                  const cuentaObj = cuentas.find(c => c.id === ingreso.cuentaId);
                  const cuentaName = cuentaObj?.name || 'Cuenta eliminada';
                  const isPocket = cuentaObj?.type === 'pocket';
                  
                  return (
                    <tr key={ingreso.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      
                      {/* FECHA */}
                      <td className="p-4 text-slate-300 font-medium">
                        {isEditing ? (
                          <input type="date" value={editData.fecha} onChange={e => setEditData({...editData, fecha: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none"/>
                        ) : ingreso.fecha}
                      </td>

                      {/* DESCRIPCIÓN */}
                      <td className="p-4 text-white font-bold">
                        {isEditing ? (
                          <input type="text" value={editData.descripcion} onChange={e => setEditData({...editData, descripcion: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none"/>
                        ) : ingreso.descripcion}
                      </td>

                      {/* TIPO */}
                      <td className="p-4">
                        {isEditing ? (
                          <select value={editData.tipo} onChange={e => setEditData({...editData, tipo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none">
                            <option value="Fijo">Fijo</option>
                            <option value="Variable">Variable</option>
                            <option value="Rendimiento">Rendimiento</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                            ingreso.tipo === 'Fijo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                            ingreso.tipo === 'Rendimiento' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {ingreso.tipo || 'Variable'}
                          </span>
                        )}
                      </td>

                      {/* DESTINO */}
                      <td className="p-4 text-slate-400 text-xs">
                        {isEditing ? (
                          <select value={editData.cuentaId} onChange={e => setEditData({...editData, cuentaId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none">
                            {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isPocket ? 'bg-indigo-500/50' : 'bg-emerald-500/50'}`}></div>
                            {cuentaName}
                          </div>
                        )}
                      </td>

                      {/* MONTO */}
                      <td className="p-4 font-black text-emerald-400">
                        {isEditing ? (
                          <input type="number" value={editData.monto} onChange={e => setEditData({...editData, monto: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none"/>
                        ) : formatCOP(ingreso.monto)}
                      </td>

                      {/* ACCIONES */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 p-1 bg-emerald-400/10 rounded"><Check size={16}/></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300 p-1 bg-slate-800 rounded"><X size={16}/></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => startEditing(ingreso)} className="text-slate-500 hover:text-indigo-400 transition-colors" title="Editar"><Edit3 size={16}/></button>
                            <button onClick={() => handleDelete(ingreso.id)} className="text-slate-500 hover:text-rose-500 transition-colors" title="Eliminar"><Trash2 size={16}/></button>
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
    </div>
  );
};
