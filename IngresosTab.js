// ============================================================================
// COMPONENTES UI EXTERNOS (Soluciona el bug de pérdida de foco al escribir)
// ============================================================================
const CheckIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
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
// COMPONENTE PRINCIPAL
// ============================================================================
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
  filtroPersona,
  privacyMode // ✨ MODO PRIVACIDAD AÑADIDO A LAS PROPS
}) => {
  const { useState, useMemo } = React;

  // --- FORMATEADORES ---
  // ✨ MODO PRIVACIDAD APLICADO
  const formatCOP = (val) => {
    if (privacyMode) return '****';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // ✨ FUNCIÓN A PRUEBA DE BALAS PARA LA FECHA LOCAL
  const getLocalToday = () => {
    const d = new Date();
    const año = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

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
  // ESTILOS BASE UI NEON & NEUMORPHISM
  // ============================================================================
  const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 placeholder:text-slate-600";
  const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

  // ============================================================================
  // 4. ESTRUCTURA VISUAL (JSX)
  // ============================================================================

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* --- ENCABEZADO --- */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)]">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b0c16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          Gestión de Ingresos
        </h1>
        <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
          Registra y administra todo el dinero que entra a tus cuentas, bolsillos e inversiones.
        </p>
      </header>

      {/* --- TARJETAS DE RESUMEN (Neumorfismo Inset) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Total Ingresado</p>
          <p className="text-xl md:text-3xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">{formatCOP(totalMes)}</p>
        </div>
        
        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Ingresos Fijos</p>
          <p className="text-xl md:text-3xl font-black text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">{formatCOP(totalFijos)}</p>
        </div>

        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Ingresos Variables</p>
          <p className="text-xl md:text-3xl font-black text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">{formatCOP(totalVariables)}</p>
        </div>

        <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
          <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Rendimientos</p>
          <p className="text-xl md:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{formatCOP(totalRendimientos)}</p>
        </div>
      </div>

      {/* --- SECCIÓN 1: FORMULARIO --- */}
      <Card>
        <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide mb-6">
          <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
          Registrar Nuevo Ingreso
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-5 animate-in slide-in-from-top-4 fade-in duration-300">
          
          <div className="md:col-span-1">
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
          
          <div className="md:col-span-2">
            <label className={labelBaseClass}>Descripción</label>
            <input 
              type="text" 
              required 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              placeholder="Ej. Salario, Rendimientos..." 
              className={inputBaseClass}
            />
          </div>
          
          <div className="md:col-span-1">
            <label className={labelBaseClass}>Tipo</label>
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)} 
              className={`${inputBaseClass} appearance-none cursor-pointer`}
            >
              <option value="Fijo" className="bg-[#111222]">Fijo (Salario)</option>
              <option value="Variable" className="bg-[#111222]">Variable (Bono/Venta)</option>
              <option value="Rendimiento" className="bg-[#111222]">Rendimiento (Interés)</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className={labelBaseClass}>Destino</label>
            <select 
              required 
              value={cuentaId} 
              onChange={(e) => setCuentaId(e.target.value)} 
              className={`${inputBaseClass} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-[#111222]">Seleccione...</option>
              {cuentasActivas.map(c => (
                <option key={c.id} value={c.id} className="bg-[#111222]">
                  {c.type === 'cash' ? '💵' : (c.type === 'pocket' || c.type === 'investment') ? '📈' : '🏦'} {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-1 relative">
            <label className={labelBaseClass}>Monto</label>
            <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
            <input 
              type="number" 
              required 
              value={monto} 
              onChange={(e) => setMonto(e.target.value)} 
              placeholder="0" 
              className={`${inputBaseClass} pl-8 font-black text-lg text-emerald-400`}
            />
          </div>

          <div className="md:col-span-6 flex justify-end mt-2 pt-4 border-t border-white/[0.05]">
            <button 
              type="submit" 
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] font-black py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 tracking-wide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg> REGISTRAR INGRESO
            </button>
          </div>
        </form>
      </Card>

      {/* --- SECCIÓN 2: TABLA HISTORIAL --- */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-xs"><ListIcon size={14} /></span>
            Historial Completo de Ingresos
          </h2>
          <span className="bg-[#111222] shadow-neumorph-inset text-[#8A92A6] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
            {ingresosFiltrados.length} Movimientos
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.05] bg-[#111222] mt-6 shadow-neumorph-inset">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              {/* Encabezados de Columna */}
              <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-widest text-[#8A92A6] bg-[#0b0c16]/50">
                <th className="p-4 font-black w-[12%]">Fecha</th>
                <th className="p-4 font-black w-[28%]">Descripción</th>
                <th className="p-4 font-black w-[15%] text-center">Tipo</th>
                <th className="p-4 font-black w-[20%]">Destino</th>
                <th className="p-4 font-black w-[15%] text-right">Monto</th>
                <th className="p-4 font-black text-center w-[10%]">Acciones</th>
              </tr>
              
              {/* ✨ Fila de Filtros (Estilo Inset) */}
              <tr className="border-b-2 border-white/[0.05] bg-appcard/30">
                <th className="p-2"></th>
                <th className="p-2">
                  <input 
                    type="text" 
                    placeholder="Buscar descripción..." 
                    className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-emerald-500 outline-none placeholder:text-slate-600"
                    value={filters.descripcion} 
                    onChange={e => setFilters({...filters, descripcion: e.target.value})}
                  />
                </th>
                <th className="p-2">
                  <select 
                    className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-emerald-500 outline-none appearance-none"
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
                    className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-emerald-500 outline-none appearance-none"
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
                    className="text-[10px] uppercase font-black text-emerald-400 hover:text-[#0b0c16] bg-emerald-500/10 hover:bg-emerald-500 px-3 py-1.5 rounded-lg w-full transition-all tracking-widest"
                  >
                    Limpiar
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {ingresosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-[#8A92A6] font-bold italic">
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
                    <tr key={ingreso.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      
                      {/* --- COLUMNA FECHA --- */}
                      <td className="p-4 text-[#8A92A6] text-xs font-bold">
                        {isEditing ? (
                          <input 
                            type="date" 
                            value={editData.fecha} 
                            onChange={e => setEditData({...editData, fecha: e.target.value})} 
                            className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                          />
                        ) : ingreso.fecha}
                      </td>

                      {/* --- COLUMNA DESCRIPCIÓN --- */}
                      <td className="p-4 text-white font-bold text-[13px]">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editData.descripcion} 
                            onChange={e => setEditData({...editData, descripcion: e.target.value})} 
                            className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none"
                          />
                        ) : ingreso.descripcion}
                      </td>

                      {/* --- COLUMNA TIPO --- */}
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <select 
                            value={editData.tipo} 
                            onChange={e => setEditData({...editData, tipo: e.target.value})} 
                            className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none appearance-none"
                          >
                            <option value="Fijo">Fijo</option>
                            <option value="Variable">Variable</option>
                            <option value="Rendimiento">Rendimiento</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-md uppercase tracking-widest ${
                            ingreso.tipo === 'Fijo' ? 'bg-indigo-500/10 text-indigo-400' :
                            ingreso.tipo === 'Rendimiento' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-neoncyan/10 text-neoncyan'
                          }`}>
                            {ingreso.tipo || 'VAR'}
                          </span>
                        )}
                      </td>

                      {/* --- COLUMNA DESTINO --- */}
                      <td className="p-4 text-[#8A92A6] text-xs font-bold uppercase tracking-wider">
                        {isEditing ? (
                          <select 
                            value={editData.cuentaId} 
                            onChange={e => setEditData({...editData, cuentaId: e.target.value})} 
                            className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none appearance-none"
                          >
                            {cuentasActivas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isPocket ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`}></div>
                            {cuentaName.substring(0, 18)}
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
                            className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-right text-emerald-400 font-black outline-none"
                          />
                        ) : formatCOP(ingreso.monto)}
                      </td>

                      {/* --- COLUMNA ACCIONES --- */}
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
                            <button onClick={() => startEditing(ingreso)} className="text-[#8A92A6] hover:text-emerald-400 transition-colors" title="Editar">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(ingreso.id)} className="text-[#8A92A6] hover:text-rose-500 transition-colors" title="Eliminar">
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
      </Card>
    </div>
  );
};
