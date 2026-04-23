const PresupuestosTab = ({ presupuestos, addPresupuesto, updatePresupuesto, removePresupuesto,
                        pagosFijos, addPagoFijo, updatePagoFijo, removePagoFijo,
                        egresos, selectedMonth, showToast, categoriasMaestras }) => {
  const { useState, useRef, useMemo } = React;
  const [tipoForm, setTipoForm] = useState('variable'); 
  const [nuevoVar, setNuevoVar] = useState({ categoria: '', limite: '' });
  const [nuevoFijo, setNuevoFijo] = useState({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
  const [editId, setEditId] = useState(null);
  
  const [editOriginalType, setEditOriginalType] = useState(null); 
  
  const [errors, setErrors] = useState({});
  const [filtroLista, setFiltroLista] = useState('Todos'); 
  const [showForm, setShowForm] = useState(false);
  
  const [openFijos, setOpenFijos] = useState(true);
  const [openVariables, setOpenVariables] = useState(true);

  // ✨ NUEVO: Estados para manejar el ordenamiento de las tablas
  const [sortFijos, setSortFijos] = useState({ key: 'limite', direction: 'desc' });
  const [sortVar, setSortVar] = useState({ key: 'limite', direction: 'desc' });

  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const ChevronDownIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
  );
  const ChevronUpIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="18 15 12 9 6 15"></polyline></svg>
  );

  // Icono para indicar el ordenamiento actual
  const SortIcon = ({ columnKey, currentSort }) => {
    if (currentSort.key !== columnKey) return <span className="opacity-20 ml-1 text-[10px]">↕</span>;
    return currentSort.direction === 'asc' 
      ? <span className="ml-1 text-[10px] text-neoncyan">↑</span> 
      : <span className="ml-1 text-[10px] text-neoncyan">↓</span>;
  };

  const handleExport = async () => {
    try {
      const xlsx = await loadSheetJS();
      const wb = xlsx.utils.book_new();
      
      const headersFijos = ["ID", "Descripcion", "Categoria", "Monto", "DiaPago"];
      const dataFijos = pagosFijos.map(f => ({ ID: f.id, Descripcion: f.descripcion, Categoria: f.categoria, Monto: f.monto, DiaPago: f.diaPago }));
      const wsFijos = xlsx.utils.json_to_sheet(dataFijos.length > 0 ? dataFijos : [{}], { header: headersFijos });
      xlsx.utils.book_append_sheet(wb, wsFijos, "Pagos_Fijos");
      
      const headersVar = ["ID", "Categoria", "Limite"];
      const dataVar = presupuestos.map(p => ({ ID: p.id, Categoria: p.categoria, Limite: p.limite }));
      const wsVar = xlsx.utils.json_to_sheet(dataVar.length > 0 ? dataVar : [{}], { header: headersVar });
      xlsx.utils.book_append_sheet(wb, wsVar, "Presupuestos_Variables");
      
      xlsx.writeFile(wb, `Presupuestos_y_Fijos_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("Presupuestos exportados con éxito.");
    } catch(e) { showToast("Error al exportar a Excel.", "error"); }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    try {
      const xlsx = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = xlsx.read(evt.target.result, { type: 'binary' });
          let importadosFijos = 0;
          let importadosVar = 0;

          if (wb.Sheets["Pagos_Fijos"]) {
            const dataFijos = xlsx.utils.sheet_to_json(wb.Sheets["Pagos_Fijos"]);
            dataFijos.filter(i=>i.Monto).forEach(i => {
                const exists = pagosFijos.some(pf => pf.descripcion === i.Descripcion && pf.categoria === i.Categoria && pf.monto === Number(i.Monto));
                if (!exists) {
                    addPagoFijo({ id: i.ID || generateId(), descripcion: i.Descripcion || 'Fijo Importado', categoria: i.Categoria || 'Otros', monto: Number(i.Monto) || 0, diaPago: Number(i.DiaPago) || 1 });
                    importadosFijos++;
                }
            });
          }
          if (wb.Sheets["Presupuestos_Variables"]) {
            const dataVar = xlsx.utils.sheet_to_json(wb.Sheets["Presupuestos_Variables"]);
            dataVar.filter(i=>i.Limite).forEach(i => {
                const exists = presupuestos.some(p => p.categoria === i.Categoria);
                if (!exists) {
                    addPresupuesto({ id: i.ID || generateId(), categoria: i.Categoria || 'Otros', limite: Number(i.Limite) || 0 });
                    importadosVar++;
                }
            });
          }
          showToast(`Se importaron ${importadosFijos} fijos y ${importadosVar} variables.`);
        } catch(err) { showToast("Error procesando los datos del archivo.", "error"); }
      };
      reader.readAsBinaryString(file);
    } catch(err) { showToast("Error al abrir herramienta de Excel.", "error"); }
    e.target.value = '';
  };

  const guardar = (e) => {
    e.preventDefault();
    let errs = {};
    
    if (tipoForm === 'variable') {
      if(!nuevoVar.categoria) errs.categoria = "Requerido";
      if(!nuevoVar.limite) errs.limite = "Requerido";
      if(Object.keys(errs).length > 0) { setErrors(errs); return; }
      
      if (editId) {
        if (editOriginalType === 'variable') {
            updatePresupuesto(editId, { categoria: nuevoVar.categoria, limite: Number(nuevoVar.limite) });
            showToast("Límite Variable actualizado.");
        } else {
            removePagoFijo(editId);
            addPresupuesto({ id: editId, categoria: nuevoVar.categoria, limite: Number(nuevoVar.limite) });
            showToast("Convertido a Límite Variable.");
        }
        setEditId(null);
        setEditOriginalType(null);
      } else {
        addPresupuesto({ id: generateId(), categoria: nuevoVar.categoria, limite: Number(nuevoVar.limite) });
        showToast("Presupuesto agregado.");
      }
      setNuevoVar({ categoria: '', limite: '' });
      
    } else {
      if(!nuevoFijo.descripcion) errs.descripcion = "Requerido";
      if(!nuevoFijo.categoria) errs.categoria = "Requerido";
      if(!nuevoFijo.monto) errs.monto = "Requerido";
      if(!nuevoFijo.diaPago) errs.diaPago = "Requerido";
      if(Object.keys(errs).length > 0) { setErrors(errs); return; }

      if (editId) {
        if (editOriginalType === 'fijo') {
            updatePagoFijo(editId, { descripcion: nuevoFijo.descripcion, categoria: nuevoFijo.categoria, monto: Number(nuevoFijo.monto), diaPago: Number(nuevoFijo.diaPago) });
            showToast("Gasto Fijo actualizado.");
        } else {
            removePresupuesto(editId);
            addPagoFijo({ id: editId, descripcion: nuevoFijo.descripcion, categoria: nuevoFijo.categoria, monto: Number(nuevoFijo.monto), diaPago: Number(nuevoFijo.diaPago) });
            showToast("Convertido a Gasto Fijo.");
        }
        setEditId(null);
        setEditOriginalType(null);
      } else {
        addPagoFijo({ id: generateId(), descripcion: nuevoFijo.descripcion, categoria: nuevoFijo.categoria, monto: Number(nuevoFijo.monto), diaPago: Number(nuevoFijo.diaPago) });
        showToast("Gasto Fijo agregado.");
      }
      setNuevoFijo({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
    }
    setErrors({});
  };

  const cargarParaEditar = (p) => {
    setEditId(p.id);
    setErrors({});
    
    const isFijo = p.tipo === 'Fijo';
    setEditOriginalType(isFijo ? 'fijo' : 'variable');
    setTipoForm(isFijo ? 'fijo' : 'variable');
    
    setNuevoFijo({ descripcion: isFijo ? p.nombre : (p.categoria + ' Fijo'), monto: p.limite.toString(), categoria: p.categoria, diaPago: (p.diaPago || 1).toString() });
    setNuevoVar({ categoria: p.categoria, limite: p.limite.toString() });

    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  const cancelarEdicion = () => {
    setEditId(null);
    setEditOriginalType(null);
    setNuevoVar({ categoria: '', limite: '' });
    setNuevoFijo({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
    setErrors({});
    setShowForm(false);
  }

  const egresosMes = egresos.filter(g => g.fecha.startsWith(selectedMonth));

  const totalFijo = pagosFijos.reduce((s, p) => s + p.monto, 0);
  const totalVar = presupuestos.reduce((s, p) => s + p.limite, 0);

  // Procesamiento base
  const { fijosBase, varBase } = useMemo(() => {
    const fijos = [];
    const variables = [];

    pagosFijos.forEach(pf => {
      const gastado = egresosMes.filter(e => {
        if (e.tipo !== 'Fijo') return false;
        if (e.pagoFijoId === pf.id) return true;
        return (e.descripcion || '').trim().toLowerCase() === (pf.descripcion || '').trim().toLowerCase();
      }).reduce((s, e) => s + e.monto, 0);
      
      fijos.push({ id: pf.id, tipo: 'Fijo', nombre: pf.descripcion, categoria: pf.categoria, limite: pf.monto, gastado, diaPago: pf.diaPago });
    });

    presupuestos.forEach(p => {
      const gastado = egresosMes.filter(e => (e.categoria || '').trim().toLowerCase() === (p.categoria || '').trim().toLowerCase() && e.tipo !== 'Fijo').reduce((s, e) => s + e.monto, 0);
      variables.push({ id: p.id, tipo: 'Variable', nombre: p.categoria, categoria: p.categoria, limite: p.limite, gastado });
    });

    return { fijosBase: fijos, varBase: variables };
  }, [pagosFijos, presupuestos, egresosMes]);

  // ✨ Función maestra para ordenar las tablas
  const sortData = (data, config) => {
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];

      // Cálculo en tiempo real para ordenar por porcentaje
      if (config.key === 'porcentaje') {
        aVal = a.limite > 0 ? (a.gastado / a.limite) : 0;
        bVal = b.limite > 0 ? (b.gastado / b.limite) : 0;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
        if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        return config.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  };

  const fijosItems = useMemo(() => sortData(fijosBase, sortFijos), [fijosBase, sortFijos]);
  const varItems = useMemo(() => sortData(varBase, sortVar), [varBase, sortVar]);

  // Controles de clic en encabezados
  const requestSortFijos = (key) => {
    let direction = 'asc';
    if (sortFijos.key === key && sortFijos.direction === 'asc') direction = 'desc';
    setSortFijos({ key, direction });
  };

  const requestSortVar = (key) => {
    let direction = 'asc';
    if (sortVar.key === key && sortVar.direction === 'asc') direction = 'desc';
    setSortVar({ key, direction });
  };

  const totalGastadoFijo = fijosBase.reduce((s, item) => s + item.gastado, 0);
  const totalGastadoVar = varBase.reduce((s, item) => s + item.gastado, 0);
  const totalGastadoAmbos = totalGastadoFijo + totalGastadoVar;

  const difFijo = totalFijo - totalGastadoFijo;
  const difVar = totalVar - totalGastadoVar;
  const difTotal = (totalFijo + totalVar) - totalGastadoAmbos;

  const getColorDif = (val) => {
    if (val >= 0) return 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]';
    if (val < 0) return 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]';
    return 'text-amber-400'; 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neoncyan to-blue-600 flex items-center justify-center shadow-glow-cyan">
               <PieChart className="text-[#0b0c16] w-5 h-5"/>
            </div>
            Presupuestos y Ejecución
          </h1>
          <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
            Controla cómo se está gastando el dinero vs lo que tenías planificado.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { cancelarEdicion(); setShowForm(!showForm); }} className="bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-glow-cyan active:scale-95">
            <Plus size={16} strokeWidth="3"/> {showForm ? 'OCULTAR' : 'PRESUPUESTO'}
          </button>
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 shadow-neumorph hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Upload size={14}/> Importar
          </button>
          <button onClick={handleExport} className="bg-[#111222] hover:bg-[#1c1e32] text-amber-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-amber-500/30 shadow-neumorph hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Download size={14}/> Exportar
          </button>
        </div>
      </header>

      {/* TARJETAS RESUMEN GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-[20px] border border-transparent flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-amber-400 uppercase font-black tracking-widest mb-1 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">Presupuesto Gasto Fijo</p>
            <p className="text-xl md:text-2xl font-black text-white">{formatCOP(totalFijo)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05] flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Gastado:</span>
              <span className="font-black text-white tabular-nums">{formatCOP(totalGastadoFijo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A92A6] font-bold uppercase tracking-wider text-[10px]">{difFijo >= 0 ? 'Restante:' : 'Excedido:'}</span>
              <span className={`font-black tabular-nums ${getColorDif(difFijo)}`}>{formatCOP(difFijo)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#111222] shadow-neumorph-inset p-5 rounded-[20px] border border-transparent flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-neoncyan uppercase font-black tracking-widest mb-1 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">Presupuesto Variable</p>
            <p className="text-xl md:text-2xl font-black text-white">{formatCOP(totalVar)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05] flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neoncyan font-bold uppercase tracking-wider text-[10px]">Gastado:</span>
              <span className="font-black text-white tabular-nums">{formatCOP(totalGastadoVar)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A92A6] font-bold uppercase tracking-wider text-[10px]">{difVar >= 0 ? 'Restante:' : 'Excedido:'}</span>
              <span className={`font-black tabular-nums ${getColorDif(difVar)}`}>{formatCOP(difVar)}</span>
            </div>
          </div>
        </div>

        <div className="bg-appcard shadow-neumorph p-5 rounded-[20px] border border-white/[0.02] flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Total Presupuestado</p>
            <p className="text-xl md:text-2xl font-black text-white">{formatCOP(totalFijo + totalVar)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05] flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#8A92A6] font-bold uppercase tracking-wider text-[10px]">Total Gastado:</span>
              <span className="font-black text-white tabular-nums">{formatCOP(totalGastadoAmbos)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8A92A6] font-bold uppercase tracking-wider text-[10px]">{difTotal >= 0 ? 'Restante:' : 'Excedido:'}</span>
              <span className={`font-black tabular-nums ${getColorDif(difTotal)}`}>{formatCOP(difTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <Card className={`animate-in slide-in-from-top-4 ${editId ? (editOriginalType === 'variable' ? '!border-neoncyan/30 shadow-glow-cyan' : '!border-amber-500/30 shadow-glow-amber') : '!border-transparent'}`}>
          <div className="flex justify-between items-center mb-6 relative" ref={formRef}>
            
            <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1 w-full md:w-auto">
              <button onClick={() => setTipoForm('variable')} type="button" className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tipoForm === 'variable' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-[#8A92A6] hover:text-white'}`}>
                {editId ? (editOriginalType === 'variable' ? '✏️ Editando Variable' : '🔄 A Variable') : 'Límite Variable'}
              </button>
              <button onClick={() => setTipoForm('fijo')} type="button" className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tipoForm === 'fijo' ? 'bg-amber-400 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-[#8A92A6] hover:text-white'}`}>
                {editId ? (editOriginalType === 'fijo' ? '✏️ Editando Fijo' : '🔄 A Fijo') : 'Gasto Fijo'}
              </button>
            </div>
            
            {editId && (
              <button onClick={cancelarEdicion} className="text-[10px] uppercase font-black tracking-widest text-rose-400 hover:text-white transition-colors bg-rose-500/10 px-3 py-1.5 rounded-lg absolute right-0">
                Cancelar
              </button>
            )}
          </div>
          
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end mt-4">
            {tipoForm === 'variable' ? (
              <React.Fragment>
                <div className="sm:col-span-5">
                  <Input label="Categoría Variable (Libre texto)" placeholder="Ej: Gasolina, Mercado..." value={nuevoVar.categoria} onChange={e=>setNuevoVar({...nuevoVar, categoria: e.target.value})} error={errors.categoria} />
                </div>
                <div className="sm:col-span-4 relative">
                  <Input type="number" label="Límite Mensual ($)" value={nuevoVar.limite} onChange={e=>setNuevoVar({...nuevoVar, limite: e.target.value})} error={errors.limite} className="pl-8 font-black text-neoncyan" placeholder="0"/>
                  <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                </div>
                <div className="sm:col-span-3">
                   <button type="submit" className={`w-full ${editId ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-neoncyan hover:bg-[#00cce6] shadow-glow-cyan'} text-[#0b0c16] font-black tracking-widest uppercase py-3.5 rounded-xl transition-all active:scale-95`}>
                     {editId ? (editOriginalType === 'variable' ? 'ACTUALIZAR' : 'CONVERTIR') : 'GUARDAR LÍMITE'}
                   </button>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="sm:col-span-4">
                  <Input label="Descripción (Gasto Fijo)" placeholder="Ej: Internet" value={nuevoFijo.descripcion} onChange={e=>setNuevoFijo({...nuevoFijo, descripcion: e.target.value})} error={errors.descripcion} />
                </div>
                <div className="sm:col-span-3">
                  <Select label="Categoría" options={categoriasMaestras.map(c=>({value:c, label:c}))} value={nuevoFijo.categoria} onChange={e=>setNuevoFijo({...nuevoFijo, categoria: e.target.value})} error={errors.categoria} />
                </div>
                <div className="sm:col-span-2 relative">
                  <Input type="number" label="Monto Estimado" value={nuevoFijo.monto} onChange={e=>setNuevoFijo({...nuevoFijo, monto: e.target.value})} error={errors.monto} className="pl-8 font-black text-amber-400" placeholder="0"/>
                  <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                </div>
                <div className="sm:col-span-1">
                  <Input type="number" label="Día (1-31)" value={nuevoFijo.diaPago} onChange={e=>setNuevoFijo({...nuevoFijo, diaPago: e.target.value})} min="1" max="31" error={errors.diaPago} placeholder="15" className="text-center font-bold"/>
                </div>
                <div className="sm:col-span-2">
                   <button type="submit" className={`w-full ${editId ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]'} text-[#0b0c16] font-black tracking-widest uppercase py-3.5 rounded-xl transition-all active:scale-95`}>
                     {editId ? (editOriginalType === 'fijo' ? 'ACTUALIZAR' : 'CONVERTIR') : 'GUARDAR FIJO'}
                   </button>
                </div>
              </React.Fragment>
            )}
          </form>
        </Card>
      )}

      {/* FILTROS GENERALES */}
      <div className="flex bg-[#111222] shadow-neumorph-inset p-1.5 rounded-xl border border-transparent text-xs font-black uppercase tracking-widest w-full md:w-max mx-auto md:mx-0">
        <button onClick={()=>setFiltroLista('Todos')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all ${filtroLista === 'Todos' ? 'bg-appcard text-white shadow-neumorph' : 'text-[#8A92A6] hover:text-white'}`}>Todos</button>
        <button onClick={()=>setFiltroLista('Fijos')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all ${filtroLista === 'Fijos' ? 'bg-amber-400 text-[#0b0c16] shadow-glow-amber' : 'text-[#8A92A6] hover:text-white'}`}>Solo Fijos</button>
        <button onClick={()=>setFiltroLista('Variables')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all ${filtroLista === 'Variables' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-[#8A92A6] hover:text-white'}`}>Variables</button>
      </div>

      {/* SECCIÓN DE TABLAS COLAPSABLES */}
      <div className="space-y-6">
        
        {/* TABLA: GASTOS FIJOS ESTIMADOS */}
        {(filtroLista === 'Todos' || filtroLista === 'Fijos') && (
          <Card className="!border-transparent p-0 overflow-hidden flex flex-col">
            <div 
              className="flex justify-between items-center cursor-pointer select-none p-5 md:p-6 border-b border-white/[0.05]"
              onClick={() => setOpenFijos(!openFijos)}
            >
              <h2 className="text-sm font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] uppercase tracking-widest flex items-center gap-2">
                <CheckSquare size={18} /> Gastos Fijos Estimados
              </h2>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openFijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>

            {openFijos && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-300 p-5 md:p-6 pt-0">
                {fijosItems.length > 0 ? (
                  <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent mt-4">
                    <table className="w-full text-sm text-left min-w-[800px]">
                      <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                        <tr>
                          <th className="px-4 py-4 w-[25%] cursor-pointer hover:text-white transition-colors" onClick={() => requestSortFijos('nombre')}>
                            <div className="flex items-center">Nombre <SortIcon columnKey="nombre" currentSort={sortFijos} /></div>
                          </th>
                          <th className="px-4 py-4 w-[20%] cursor-pointer hover:text-white transition-colors" onClick={() => requestSortFijos('categoria')}>
                            <div className="flex items-center">Categoría <SortIcon columnKey="categoria" currentSort={sortFijos} /></div>
                          </th>
                          <th className="px-4 py-4 w-[15%] text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSortFijos('limite')}>
                            <div className="flex items-center justify-end">Presupuesto <SortIcon columnKey="limite" currentSort={sortFijos} /></div>
                          </th>
                          <th className="px-4 py-4 w-[15%] text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSortFijos('gastado')}>
                            <div className="flex items-center justify-end">Gastado <SortIcon columnKey="gastado" currentSort={sortFijos} /></div>
                          </th>
                          <th className="px-4 py-4 w-[8%] text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSortFijos('porcentaje')}>
                            <div className="flex items-center justify-center">% <SortIcon columnKey="porcentaje" currentSort={sortFijos} /></div>
                          </th>
                          <th className="px-4 py-4 w-[7%] text-center">Estatus</th>
                          <th className="px-4 py-4 w-[10%] text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {fijosItems.map(p => {
                          const porcentaje = p.limite > 0 ? (p.gastado / p.limite) * 100 : 0;
                          const excede = p.gastado > p.limite;
                          
                          return (
                            <tr key={p.id} className={`transition-colors ${editId === p.id ? 'bg-amber-900/10 border-amber-500/30' : 'hover:bg-white/[0.02]'}`}>
                              <td className="px-4 py-4 font-bold text-white tracking-wide truncate max-w-[150px]" title={p.nombre}>{p.nombre}</td>
                              <td className="px-4 py-4">
                                <span className="px-2 py-1 bg-white/[0.05] text-[#8A92A6] rounded text-[10px] uppercase font-bold tracking-widest truncate inline-block max-w-full" title={p.categoria}>
                                  {p.categoria}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right text-slate-400 tabular-nums">{formatCOP(p.limite)}</td>
                              <td className="px-4 py-4 text-right font-black text-amber-400 tabular-nums">{formatCOP(p.gastado)}</td>
                              <td className={`px-4 py-4 text-center font-black tabular-nums ${excede ? 'text-neonmagenta' : 'text-slate-300'}`}>
                                {porcentaje.toFixed(1)}%
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${excede ? 'bg-neonmagenta/10 text-neonmagenta' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                  {excede ? 'Excedido' : 'OK'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center flex justify-center gap-3">
                                <button onClick={() => cargarParaEditar(p)} className="text-[#8A92A6] hover:text-amber-400 transition-colors" title="Editar"><Edit3 size={16}/></button>
                                <button onClick={() => {
                                  if (window.confirm(`¿Seguro que quieres eliminar el gasto fijo "${p.nombre}"?\n(Los pagos ya registrados se mantendrán en el historial).`)) {
                                    removePagoFijo(p.id); showToast("Gasto Fijo eliminado", "error");
                                  }
                                }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-[#111222] shadow-neumorph-inset p-8 rounded-3xl text-center mt-4">
                    <p className="text-sm text-[#8A92A6] font-bold tracking-wide uppercase">No hay gastos fijos configurados.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* TABLA: LÍMITES DE GASTO VARIABLE */}
        {(filtroLista === 'Todos' || filtroLista === 'Variables') && (
          <Card className="!border-transparent p-0 overflow-hidden flex flex-col">
            <div 
              className="flex justify-between items-center cursor-pointer select-none p-5 md:p-6 border-b border-white/[0.05]"
              onClick={() => setOpenVariables(!openVariables)}
            >
              <h2 className="text-sm font-black text-neoncyan drop-shadow-[0_0_5px_rgba(0,229,255,0.5)] uppercase tracking-widest flex items-center gap-2">
                <PieChart size={18} /> Límites de Gasto Variable
              </h2>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openVariables ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>

            {openVariables && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-300 p-5 md:p-6 pt-0">
                {varItems.length > 0 ? (
                  <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent mt-4">
                    <table className="w-full text-sm text-left min-w-[800px]">
                      <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                        <tr>
                          <th className="px-4 py-4 w-[25%] cursor-pointer hover:text-white transition-colors" onClick={() => requestSortVar('nombre')}>
                            <div className="flex items-center">Nombre (Cat) <SortIcon columnKey="nombre" currentSort={sortVar} /></div>
                          </th>
                          <th className="px-4 py-4 w-[20%] cursor-pointer hover:text-white transition-colors" onClick={() => requestSortVar('categoria')}>
                            <div className="flex items-center">Categoría <SortIcon columnKey="categoria" currentSort={sortVar} /></div>
                          </th>
                          <th className="px-4 py-4 w-[15%] text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSortVar('limite')}>
                            <div className="flex items-center justify-end">Presupuesto <SortIcon columnKey="limite" currentSort={sortVar} /></div>
                          </th>
                          <th className="px-4 py-4 w-[15%] text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSortVar('gastado')}>
                            <div className="flex items-center justify-end">Gastado <SortIcon columnKey="gastado" currentSort={sortVar} /></div>
                          </th>
                          <th className="px-4 py-4 w-[8%] text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSortVar('porcentaje')}>
                            <div className="flex items-center justify-center">% <SortIcon columnKey="porcentaje" currentSort={sortVar} /></div>
                          </th>
                          <th className="px-4 py-4 w-[7%] text-center">Estatus</th>
                          <th className="px-4 py-4 w-[10%] text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {varItems.map(p => {
                          const porcentaje = p.limite > 0 ? (p.gastado / p.limite) * 100 : 0;
                          const excede = p.gastado > p.limite;
                          
                          return (
                            <tr key={p.id} className={`transition-colors ${editId === p.id ? 'bg-cyan-900/10 border-neoncyan/30' : 'hover:bg-white/[0.02]'}`}>
                              <td className="px-4 py-4 font-bold text-white tracking-wide truncate max-w-[150px]" title={p.nombre}>{p.nombre}</td>
                              <td className="px-4 py-4">
                                <span className="px-2 py-1 bg-white/[0.05] text-[#8A92A6] rounded text-[10px] uppercase font-bold tracking-widest truncate inline-block max-w-full" title={p.categoria}>
                                  {p.categoria}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right text-slate-400 tabular-nums">{formatCOP(p.limite)}</td>
                              <td className="px-4 py-4 text-right font-black text-neoncyan tabular-nums">{formatCOP(p.gastado)}</td>
                              <td className={`px-4 py-4 text-center font-black tabular-nums ${excede ? 'text-neonmagenta' : 'text-slate-300'}`}>
                                {porcentaje.toFixed(1)}%
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${excede ? 'bg-neonmagenta/10 text-neonmagenta' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                  {excede ? 'Excedido' : 'OK'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center flex justify-center gap-3">
                                <button onClick={() => cargarParaEditar(p)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={16}/></button>
                                <button onClick={() => {
                                  if (window.confirm(`¿Seguro que quieres eliminar el presupuesto variable "${p.nombre}"?\n(Los pagos ya registrados se mantendrán en el historial).`)) {
                                    removePresupuesto(p.id); showToast("Presupuesto eliminado", "error");
                                  }
                                }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-[#111222] shadow-neumorph-inset p-8 rounded-3xl text-center mt-4">
                     <p className="text-sm text-[#8A92A6] font-bold tracking-wide uppercase">No hay presupuestos variables configurados.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
