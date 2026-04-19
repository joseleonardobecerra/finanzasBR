const PresupuestosTab = ({ 
  presupuestos, addPresupuesto, updatePresupuesto, removePresupuesto,
  pagosFijos, addPagoFijo, updatePagoFijo, removePagoFijo,
  egresos, selectedMonth, showToast, categoriasMaestras 
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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ============================================================================
  // ÍCONOS SVG NATIVOS (Para evitar errores ReferenceError)
  // ============================================================================
  const CheckSquareIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
  );
  
  const PieChartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
  );

  const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  );

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  );

  const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  );

  // ============================================================================
  // ESTADOS DEL COMPONENTE
  // ============================================================================
  const [tipoForm, setTipoForm] = useState('variable'); 
  const [nuevoVar, setNuevoVar] = useState({ categoria: '', limite: '' });
  const [nuevoFijo, setNuevoFijo] = useState({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
  
  const [filtroLista, setFiltroLista] = useState('Todos'); 
  
  const [editId, setEditId] = useState(null);
  const [editOriginalType, setEditOriginalType] = useState(null);

  // ============================================================================
  // MOTOR DE CÁLCULO (Sincronizado con Egresos)
  // ============================================================================
  const egresosMes = useMemo(() => {
    return egresos.filter(e => e.fecha.startsWith(selectedMonth));
  }, [egresos, selectedMonth]);

  // ✨ FIX: Ahora suma el "Ejecutado" usando la misma regla de texto del Checklist
  const fijosItems = useMemo(() => {
    return pagosFijos.map(pf => {
      const ejecutado = egresosMes
        .filter(e => e.tipo === 'Fijo' && e.descripcion.toLowerCase().includes(pf.descripcion.toLowerCase()))
        .reduce((sum, e) => sum + Number(e.monto), 0);
      
      const limite = Number(pf.monto || pf.montoEstimado || 0);
      const disponible = limite - ejecutado;
      const porcentaje = limite > 0 ? (ejecutado / limite) * 100 : 0;
      
      return { ...pf, limite, ejecutado, disponible, porcentaje };
    });
  }, [pagosFijos, egresosMes]);

  const varItems = useMemo(() => {
    return presupuestos.map(p => {
      const ejecutado = egresosMes
        .filter(e => e.tipo !== 'Fijo' && e.categoria === p.categoria)
        .reduce((sum, e) => sum + Number(e.monto), 0);
      
      const limite = Number(p.limite || 0);
      const disponible = limite - ejecutado;
      const porcentaje = limite > 0 ? (ejecutado / limite) * 100 : 0;
      
      return { ...p, limite, ejecutado, disponible, porcentaje };
    });
  }, [presupuestos, egresosMes]);

  // ============================================================================
  // MANEJADORES DE SUBMIT (GUARDAR Y EDITAR)
  // ============================================================================
  const handleAddVar = (e) => {
    e.preventDefault();
    if (!nuevoVar.categoria || !nuevoVar.limite) {
      showToast('Completa los campos de Gasto Variable', 'error');
      return;
    }

    if (editId && editOriginalType === 'variable') {
       updatePresupuesto(editId, { 
         categoria: nuevoVar.categoria, 
         limite: Number(nuevoVar.limite) 
       });
       setEditId(null); 
       setEditOriginalType(null);
       showToast('Presupuesto variable actualizado');
    } else {
       addPresupuesto({ 
         id: generateId(), 
         categoria: nuevoVar.categoria, 
         limite: Number(nuevoVar.limite) 
       });
       showToast('Presupuesto variable agregado');
    }
    setNuevoVar({ categoria: '', limite: '' });
  };

  const handleAddFijo = (e) => {
    e.preventDefault();
    if (!nuevoFijo.descripcion || !nuevoFijo.monto || !nuevoFijo.categoria) {
      showToast('Completa los campos obligatorios del Gasto Fijo', 'error');
      return;
    }

    if (editId && editOriginalType === 'fijo') {
       updatePagoFijo(editId, { 
         descripcion: nuevoFijo.descripcion, 
         monto: Number(nuevoFijo.monto), 
         categoria: nuevoFijo.categoria, 
         diaPago: Number(nuevoFijo.diaPago) 
       });
       setEditId(null); 
       setEditOriginalType(null);
       showToast('Pago fijo actualizado');
    } else {
       addPagoFijo({ 
         id: generateId(), 
         descripcion: nuevoFijo.descripcion, 
         monto: Number(nuevoFijo.monto), 
         categoria: nuevoFijo.categoria, 
         diaPago: Number(nuevoFijo.diaPago) 
       });
       showToast('Pago fijo agregado al checklist');
    }
    setNuevoFijo({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
  };

  // ============================================================================
  // CONTROL DE EDICIÓN
  // ============================================================================
  const startEditVar = (p) => {
    setTipoForm('variable');
    setEditId(p.id);
    setEditOriginalType('variable');
    setNuevoVar({ categoria: p.categoria, limite: p.limite });
  };

  const startEditFijo = (p) => {
    setTipoForm('fijo');
    setEditId(p.id);
    setEditOriginalType('fijo');
    setNuevoFijo({ 
      descripcion: p.descripcion, 
      monto: p.limite, 
      categoria: p.categoria, 
      diaPago: p.diaPago || '' 
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditOriginalType(null);
    setNuevoVar({ categoria: '', limite: '' });
    setNuevoFijo({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
  };

  // ============================================================================
  // SUB-COMPONENTE: TARJETA COMPACTA DE PRESUPUESTO
  // ============================================================================
  const RenderCardCompacta = ({ p, themeColor, isFijo }) => {
    const colorClass = themeColor === 'yellow' ? 'text-amber-400' : 'text-blue-400';
    const bgBarClass = themeColor === 'yellow' ? 'bg-amber-500' : 'bg-blue-500';
    
    const progress = Math.min(p.porcentaje, 100);
    const overLimit = p.ejecutado > p.limite;
    const finalBarColor = overLimit ? 'bg-rose-500' : bgBarClass;

    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-600 transition-colors shadow-lg">
        <div className={`absolute top-0 left-0 right-0 h-1 ${themeColor === 'yellow' ? 'bg-amber-500/30' : 'bg-blue-500/30'}`}></div>
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-slate-200 text-sm pr-6 truncate">
            {isFijo ? p.descripcion : p.categoria}
          </h3>
          <div className="flex gap-2 absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => isFijo ? startEditFijo(p) : startEditVar(p)} 
              className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded transition-colors"
            >
              <EditIcon/>
            </button>
            <button 
              onClick={() => isFijo ? removePagoFijo(p.id) : removePresupuesto(p.id)} 
              className="text-slate-400 hover:text-rose-400 bg-slate-800 p-1.5 rounded transition-colors"
            >
              <TrashIcon/>
            </button>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Límite Estimado: <span className="font-bold text-slate-300">{formatCOP(p.limite)}</span></span>
        </div>

        <div className="flex justify-between items-end mb-2 mt-2">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Ejecutado</p>
            <p className={`font-black text-sm ${overLimit ? 'text-rose-400' : colorClass}`}>
              {formatCOP(p.ejecutado)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Disponible</p>
            <p className={`font-bold text-xs ${p.disponible < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCOP(p.disponible)}
            </p>
          </div>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-auto border border-slate-800/50">
          <div className={`h-1.5 rounded-full ${finalBarColor} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right text-[9px] text-slate-500 mt-1 font-bold">
          {p.porcentaje.toFixed(1)}% consumido
        </p>
      </div>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL DE LA PESTAÑA
  // ============================================================================
  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-500">
      
      {/* ENCABEZADO */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <PieChartIcon /> 
            Presupuestos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configura tus límites de gasto variable y tu checklist de pagos fijos.
          </p>
        </div>
      </header>

      {/* TARJETA DE FORMULARIO DUAL */}
      <Card className={`border-t-4 ${tipoForm === 'variable' ? 'border-t-blue-500' : 'border-t-amber-500'} transition-colors duration-300`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {editId ? 'Editando Presupuesto' : 'Crear Nuevo Límite'}
          </h2>
          
          <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-1 self-start sm:self-auto">
            <button 
              onClick={() => {setTipoForm('variable'); cancelEdit();}} 
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${tipoForm === 'variable' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Gasto Variable
            </button>
            <button 
              onClick={() => {setTipoForm('fijo'); cancelEdit();}} 
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${tipoForm === 'fijo' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Pago Fijo (Checklist)
            </button>
          </div>
        </div>

        {/* MODO: VARIABLE */}
        {tipoForm === 'variable' ? (
          <form onSubmit={handleAddVar} className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-left-4 duration-300">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
              <select 
                required 
                value={nuevoVar.categoria} 
                onChange={(e) => setNuevoVar({...nuevoVar, categoria: e.target.value})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-blue-500 outline-none"
              >
                <option value="">Seleccione categoría...</option>
                {categoriasMaestras.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Límite Mensual ($)</label>
              <input 
                type="number" 
                required 
                value={nuevoVar.limite} 
                onChange={(e) => setNuevoVar({...nuevoVar, limite: e.target.value})} 
                placeholder="Ej. 500000" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <div className="flex gap-2 w-full">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                  {editId ? <CheckSquareIcon/> : <PlusIcon/>}
                  {editId ? 'Guardar' : 'Agregar'}
                </button>
                {editId && (
                  <button type="button" onClick={cancelEdit} className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-xl transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          /* MODO: FIJO */
          <form onSubmit={handleAddFijo} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-right-4 duration-300">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Pago</label>
              <input 
                type="text" 
                required 
                value={nuevoFijo.descripcion} 
                onChange={(e) => setNuevoFijo({...nuevoFijo, descripcion: e.target.value})} 
                placeholder="Ej. Arriendo, Internet..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Valor ($)</label>
              <input 
                type="number" 
                required 
                value={nuevoFijo.monto} 
                onChange={(e) => setNuevoFijo({...nuevoFijo, monto: e.target.value})} 
                placeholder="0" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Día Pago</label>
              <input 
                type="number" 
                min="1" max="31" 
                value={nuevoFijo.diaPago} 
                onChange={(e) => setNuevoFijo({...nuevoFijo, diaPago: e.target.value})} 
                placeholder="Ej. 15" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-sm text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div className="md:col-span-1 flex items-end">
               <div className="flex gap-2 w-full">
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                    {editId ? <CheckSquareIcon/> : <PlusIcon/>}
                    {editId ? 'Guardar' : 'Agregar'}
                  </button>
                  {editId && (
                    <button type="button" onClick={cancelEdit} className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-xl transition-colors">
                      Cancelar
                    </button>
                  )}
               </div>
            </div>
          </form>
        )}
      </Card>

      {/* FILTROS VISUALES */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Todos', 'Fijos', 'Variables'].map(f => (
          <button
            key={f}
            onClick={() => setFiltroLista(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filtroLista === f ? 'bg-slate-200 text-slate-900 border-slate-200' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LISTADO DE TARJETAS */}
      <div className="space-y-8 mt-6">
        
        {/* BLOQUE: FIJOS */}
        {(filtroLista === 'Todos' || filtroLista === 'Fijos') && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <CheckSquareIcon /> Gastos Fijos Estimados
            </h2>
            {fijosItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {fijosItems.map(p => (
                  <RenderCardCompacta key={p.id} p={p} themeColor="yellow" isFijo={true} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No hay gastos fijos configurados.</p>
            )}
          </div>
        )}

        {/* BLOQUE: VARIABLES */}
        {(filtroLista === 'Todos' || filtroLista === 'Variables') && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <PieChartIcon /> Límites de Gasto Variable
            </h2>
            {varItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {varItems.map(p => (
                  <RenderCardCompacta key={p.id} p={p} themeColor="blue" isFijo={false} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No hay límites variables configurados.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
