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

  // --- FORMATEADORES ---
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

  // --- ÍCONOS SVG NATIVOS (Prevención de errores de referencia) ---
  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
  
  const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const ListIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );

  // ============================================================================
  // 1. ESTADOS DEL COMPONENTE
  // ============================================================================
  
  // Formulario Nuevo Ingreso
  const [fecha, setFecha] = useState(getLocalToday());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [tipo, setTipo] = useState('Fijo');
  const [persona, setPersona] = useState('Total');

  // Edición de Registros
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Filtros de la Tabla
  const [filters, setFilters] = useState({
    descripcion: '',
    tipo: '',
    cuenta: ''
  });

  // Cuentas Disponibles (Cualquiera que no sea deuda)
  const cuentasActivas = cuentas.filter(c => !['credit', 'loan'].includes(c.type));

  // ============================================================================
  // 2. LÓGICA DE CÁLCULO Y FILTRADO
  // ============================================================================
  
  // Filtrar ingresos por el mes seleccionado
  const ingresosMes = useMemo(() => {
    return ingresos
      .filter(i => i.fecha.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ingresos, selectedMonth]);

  // Totales para las tarjetas de resumen
  const totalMes = ingresosMes.reduce((s, i) => s + Number(i.monto), 0);
  const totalFijos = ingresosMes.filter(i => i.tipo === 'Fijo').reduce((s, i) => s + Number(i.monto), 0);
  const totalVariables = ingresosMes.filter(i => i.tipo === 'Variable').reduce((s, i) => s + Number(i.monto), 0);
  const totalRendimientos = ingresosMes.filter(i => i.tipo === 'Rendimiento').reduce((s, i) => s + Number(i.monto), 0);

  // Aplicación de los filtros de la tabla
  const ingresosFiltrados = useMemo(() => {
    return ingresosMes.filter(ingreso => {
      const matchDesc = ingreso.descripcion.toLowerCase().includes(filters.descripcion.toLowerCase());
      const matchTipo = filters.tipo === '' || ingreso.tipo === filters.tipo;
      const matchCuenta = filters.cuenta === '' || ingreso.cuentaId === filters.cuenta;

      return matchDesc && matchTipo && matchCuenta;
    });
  }, [ingresosMes, filters]);

  // ============================================================================
  // 3. FUNCIONES DE MANEJO DE EVENTOS (CRUD)
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
    setFilters({ descripcion: '', tipo: '', cuenta: '' });
  };

  // ============================================================================
  // 4. ESTRUCTURA VISUAL (JSX)
  // ============================================================================

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* --- ENCABEZADO --- */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Wallet className="text-emerald-400 w-8 h-8"/> 
          Gestión de Ingresos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registra y administra todo el dinero que entra a tus cuentas, bolsillos e inversiones.
        </p>
      </header>

      {/* --- TARJETAS DE RESUMEN --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-t-4 border-t-emerald-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Ingresado</p>
          <p className="text-xl md:text-2xl font-black text-emerald-400">{formatCOP(totalMes)}</p>
        </Card>
        
        <Card className="p-4 border-t-4 border-t-indigo-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Ingresos Fijos</p>
          <p className="text-xl md:text-2xl font-black text-indigo-400">{formatCOP(totalFijos)}</p>
        </Card>

        <Card className="p-4 border-t-4 border-t-blue-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Ingresos Variables</p>
          <p className="text-xl md:text-2xl font-black text-blue-400">{formatCOP(totalVariables)}</p>
        </Card>

        <Card className="p-4 border-t-4 border-t-amber-500 bg-slate-900/30">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Rendimientos</p>
          <p className="text-xl md:text-2xl font-black text-amber-400">{formatCOP(totalRendimientos)}</p>
        </Card>
      </div>

      {/* --- SECCIÓN 1: FORMULARIO --- */}
      <Card className="border-t-4 border-t-emerald-500">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">1</div>
          Registrar Nuevo Ingreso
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
            <input 
              type="date" 
              required 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
            <input 
              type="text" 
              required 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              placeholder="Ej. Salario, Rendimientos..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"
            >
              <option value="Fijo">Fijo (Salario)</option>
              <option value="Variable">Variable (Bono/Venta)</option>
              <option value="Rendimiento">Rendimiento (Interés)</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Destino</label>
            <select 
              required 
              value={cuentaId} 
              onChange={(e) => setCuentaId(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"
            >
              <option value="">Seleccione...</option>
              {cuentasActivas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.type === 'cash' ? '💵' : (c.type === 'pocket' || c.type === 'investment') ? '📈' : '🏦'} {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Monto</label>
            <input 
              type="number" 
              required 
              value={monto} 
              onChange={(e) => setMonto(e.target.value)} 
              placeholder="$ 0" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-6 flex justify-end mt-2">
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus size={18} /> Agregar Ingreso
            </button>
          </div>
        </form>
      </Card>

      {/* --- SECCIÓN 2: TABLA HISTORIAL --- */}
      <Card className="flex flex-col border-t-4 border-t-slate-600 bg-slate-900/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListIcon />
            Historial Completo de Ingresos
          </h2>
          <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {ingresosFiltrados.length} Movimientos
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              {/* Encabezados de Columna */}
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/80">
                <th className="p-4 font-bold w-[12%]">Fecha</th>
                <th className="p-4 font-bold w-[28%]">Descripción</th>
                <th className="p-4 font-bold w-[15%]">Tipo</th>
                <th className="p-4 font-bold w-[20%]">Destino</th>
                <th className="p-4 font-bold w-[15%] text-right">Monto</th>
                <th className="p-4 font-bold text-center w-[10%]">Acciones</th>
              </tr>
              
              {/* ✨ Fila de Filtros (Igual que Egresos) */}
              <tr className="border-b-2 border-slate-800 bg-slate-900/40">
                <th className="p-2"></th>
                <th className="p-2">
                  <input 
                    type="text" 
                    placeholder="Buscar descripción..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-emerald-500 outline-none placeholder:text-slate-600"
                    value={filters.descripcion} 
                    onChange={e => setFilters({...filters, descripcion: e.target.value})}
                  />
                </th>
                <th className="p-2">
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-emerald-500 outline-none"
                    value={filters.tipo} 
                    onChange={e => setFilters({...filters, tipo: e.target.value})}
                  >
                    <option value="">Tipos (Todos)</option>
                    <option value="Fijo">Fijo</option>
                    <option value="Variable">Variable</option>
                    <option value="Rendimiento">Rendimiento</option>
                  </select>
                </th>
                <th className="p-2">
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] text-white focus:border-emerald-500 outline-none"
                    value={filters.cuenta} 
                    onChange={e => setFilters({...filters, cuenta: e.target.value})}
                  >
                    <option value="">Cuentas (Todas)</option>
                    {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </th>
                <th className="p-2"></th>
                <th className="p-2 text-center">
                  <button 
                    onClick={limpiarFiltros} 
                    className="text-[10px] uppercase font-black text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 px-3 py-1.5 rounded-lg w-full transition-all"
                  >
                    Limpiar
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {ingresosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500 font-medium italic">
                    No se encontraron registros que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                ingresosFiltrados.map(ingreso => {
                  const isEditing = editingId === ingreso.id;
                  const cuentaObj = cuentas.find(c => c.id === ingreso.cuentaId);
                  const cuentaName = cuentaObj?.name || 'Cuenta eliminada';
                  const isPocket = cuentaObj?.type === 'pocket' || cuentaObj?.type === 'investment';
                  
                  return (
                    <tr key={ingreso.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      
                      {/* --- COLUMNA FECHA --- */}
                      <td className="p-4 text-slate-400 text-xs font-medium">
                        {isEditing ? (
                          <input 
                            type="date" 
                            value={editData.fecha} 
                            onChange={e => setEditData({...editData, fecha: e.target.value})} 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                          />
                        ) : ingreso.fecha}
                      </td>

                      {/* --- COLUMNA DESCRIPCIÓN --- */}
                      <td className="p-4 text-slate-200 font-bold text-[13px]">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editData.descripcion} 
                            onChange={e => setEditData({...editData, descripcion: e.target.value})} 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                          />
                        ) : ingreso.descripcion}
                      </td>

                      {/* --- COLUMNA TIPO --- */}
                      <td className="p-4">
                        {isEditing ? (
                          <select 
                            value={editData.tipo} 
                            onChange={e => setEditData({...editData, tipo: e.target.value})} 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                          >
                            <option value="Fijo">Fijo</option>
                            <option value="Variable">Variable</option>
                            <option value="Rendimiento">Rendimiento</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 text-[9px] font-bold rounded border uppercase tracking-wider ${
                            ingreso.tipo === 'Fijo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                            ingreso.tipo === 'Rendimiento' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {ingreso.tipo || 'VARIABLE'}
                          </span>
                        )}
                      </td>

                      {/* --- COLUMNA DESTINO --- */}
                      <td className="p-4 text-slate-400 text-xs">
                        {isEditing ? (
                          <select 
                            value={editData.cuentaId} 
                            onChange={e => setEditData({...editData, cuentaId: e.target.value})} 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none"
                          >
                            {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isPocket ? 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]' : 'bg-emerald-500'}`}></div>
                            {cuentaName}
                          </div>
                        )}
                      </td>

                      {/* --- COLUMNA MONTO --- */}
                      <td className="p-4 font-black text-emerald-400 text-right text-[14px]">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editData.monto} 
                            onChange={e => setEditData({...editData, monto: e.target.value})} 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-right text-white outline-none"
                          />
                        ) : formatCOP(ingreso.monto)}
                      </td>

                      {/* --- COLUMNA ACCIONES --- */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-400/10 rounded transition-colors" title="Confirmar">
                              <CheckIcon />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-400/10 rounded transition-colors" title="Cancelar">
                              <XIcon />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => startEditing(ingreso)} className="text-slate-500 hover:text-indigo-400 transition-colors" title="Editar">
                              <Edit3 size={14}/>
                            </button>
                            <button onClick={() => handleDelete(ingreso.id)} className="text-slate-500 hover:text-rose-500 transition-colors" title="Eliminar">
                              <Trash2 size={14}/>
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
      </Card>
    </div>
  );
};
