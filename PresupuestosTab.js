const PresupuestosTab = ({ presupuestos, addPresupuesto, updatePresupuesto, removePresupuesto,
                        pagosFijos, addPagoFijo, updatePagoFijo, removePagoFijo,
                        egresos, selectedMonth, showToast, categoriasMaestras }) => {
  const [tipoForm, setTipoForm] = useState('variable'); 
  const [nuevoVar, setNuevoVar] = useState({ categoria: '', limite: '' });
  const [nuevoFijo, setNuevoFijo] = useState({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [filtroLista, setFiltroLista] = useState('Todos'); 
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- IMPORTAR / EXPORTAR INDIVIDUAL DE PRESUPUESTOS ---
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
        updatePresupuesto(editId, { categoria: nuevoVar.categoria, limite: Number(nuevoVar.limite) });
        setEditId(null);
        showToast("Límite actualizado.");
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
        updatePagoFijo(editId, { descripcion: nuevoFijo.descripcion, categoria: nuevoFijo.categoria, monto: Number(nuevoFijo.monto), diaPago: Number(nuevoFijo.diaPago) });
        setEditId(null);
        showToast("Gasto Fijo actualizado.");
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
    if (p.tipo === 'Fijo') {
      setTipoForm('fijo');
      setNuevoFijo({ descripcion: p.nombre, monto: p.limite.toString(), categoria: p.categoria, diaPago: (p.diaPago || 1).toString() });
    } else {
      setTipoForm('variable');
      setNuevoVar({ categoria: p.categoria, limite: p.limite.toString() });
    }
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  const cancelarEdicion = () => {
    setEditId(null);
    setNuevoVar({ categoria: '', limite: '' });
    setNuevoFijo({ descripcion: '', monto: '', categoria: categoriasMaestras[0] || 'Otros', diaPago: '' });
    setErrors({});
    setShowForm(false);
  }

  const egresosMes = egresos.filter(g => g.fecha.startsWith(selectedMonth));

  const totalFijo = pagosFijos.reduce((s, p) => s + p.monto, 0);
  const totalVar = presupuestos.reduce((s, p) => s + p.limite, 0);

  const items = useMemo(() => {
    const list = [];
    if (filtroLista === 'Todos' || filtroLista === 'Fijos') {
      pagosFijos.forEach(pf => {
        const gastado = egresosMes.filter(e => e.pagoFijoId === pf.id).reduce((s, e) => s + e.monto, 0);
        list.push({ id: pf.id, tipo: 'Fijo', nombre: pf.descripcion, categoria: pf.categoria, limite: pf.monto, gastado, diaPago: pf.diaPago });
      });
    }
    if (filtroLista === 'Todos' || filtroLista === 'Variables') {
      presupuestos.forEach(p => {
        const gastado = egresosMes.filter(e => e.categoria.toLowerCase() === p.categoria.toLowerCase() && e.tipo !== 'Fijo').reduce((s, e) => s + e.monto, 0);
        list.push({ id: p.id, tipo: 'Variable', nombre: p.categoria, categoria: p.categoria, limite: p.limite, gastado });
      });
    }
    return list.sort((a, b) => b.limite - a.limite);
  }, [pagosFijos, presupuestos, egresosMes, filtroLista]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2"><PieChart className="text-indigo-400 w-8 h-8"/> Presupuestos y Ejecución</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Controla cómo se está gastando el dinero vs lo que tenías planificado.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { cancelarEdicion(); setShowForm(!showForm); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus size={16}/> {showForm ? 'Ocultar' : 'Añadir presupuesto'}
          </button>
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Upload size={14}/> Importar</button>
          <button onClick={handleExport} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Download size={14}/> Exportar</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Presupuesto Gasto Fijo</p>
          <p className="text-lg font-bold text-slate-200">{formatCOP(totalFijo)}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Presupuesto Gasto Variable</p>
          <p className="text-lg font-bold text-slate-200">{formatCOP(totalVar)}</p>
        </div>
        <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
          <p className="text-[10px] text-indigo-400 uppercase font-bold mb-1">Total Presupuesto Egreso</p>
          <p className="text-lg font-bold text-indigo-400">{formatCOP(totalFijo + totalVar)}</p>
        </div>
      </div>

      {showForm && (
        <Card className={editId ? "border-t-4 border-t-amber-500 bg-amber-950/10" : "border-t-4 border-t-indigo-500 bg-slate-900/80"}>
          <div className="flex justify-between items-center mb-4" ref={formRef}>
            <div className="flex gap-4">
              <button 
                onClick={() => { if(!editId) setTipoForm('variable') }} 
                type="button"
                className={`text-sm md:text-lg font-semibold transition-colors ${tipoForm === 'variable' ? 'text-white' : 'text-slate-500 hover:text-slate-300'} ${editId && tipoForm !== 'variable' ? 'hidden' : ''}`}
              >
                {editId && tipoForm === 'variable' ? '✏️ Editar Límite Variable' : 'Añadir Límite Variable'}
              </button>
              {!editId && <span className="text-slate-700">|</span>}
              <button 
                onClick={() => { if(!editId) setTipoForm('fijo') }} 
                type="button"
                className={`text-sm md:text-lg font-semibold transition-colors ${tipoForm === 'fijo' ? 'text-white' : 'text-slate-500 hover:text-slate-300'} ${editId && tipoForm !== 'fijo' ? 'hidden' : ''}`}
              >
                {editId && tipoForm === 'fijo' ? '✏️ Editar Gasto Fijo' : 'Añadir Gasto Fijo'}
              </button>
            </div>
            {editId && <button onClick={cancelarEdicion} className="text-xs text-amber-400 hover:underline">Cancelar Edición</button>}
          </div>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {tipoForm === 'variable' ? (
              <React.Fragment>
                <Input label="Categoría Variable (Libre texto)" placeholder="Ej: Gasolina, Mercado..." value={nuevoVar.categoria} onChange={e=>setNuevoVar({...nuevoVar, categoria: e.target.value})} error={errors.categoria} disabled={!!editId} className="sm:col-span-5" />
                <Input type="number" label="Límite Mensual ($)" value={nuevoVar.limite} onChange={e=>setNuevoVar({...nuevoVar, limite: e.target.value})} error={errors.limite} className="sm:col-span-4" />
                <div className="sm:col-span-3 flex gap-2">
                   <button type="submit" className={`w-full ${editId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-medium py-2.5 md:py-2 rounded-lg transition-colors`}>{editId ? 'Actualizar' : 'Añadir Límite'}</button>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Input label="Descripción (Gasto Fijo)" placeholder="Ej: Internet" value={nuevoFijo.descripcion} onChange={e=>setNuevoFijo({...nuevoFijo, descripcion: e.target.value})} error={errors.descripcion} className="sm:col-span-4" />
                <Select label="Categoría Fija" options={categoriasMaestras.map(c=>({value:c, label:c}))} value={nuevoFijo.categoria} onChange={e=>setNuevoFijo({...nuevoFijo, categoria: e.target.value})} error={errors.categoria} className="sm:col-span-3" />
                <Input type="number" label="Monto Estimado ($)" value={nuevoFijo.monto} onChange={e=>setNuevoFijo({...nuevoFijo, monto: e.target.value})} error={errors.monto} className="sm:col-span-2" />
                <Input type="number" label="Día (1-31)" value={nuevoFijo.diaPago} onChange={e=>setNuevoFijo({...nuevoFijo, diaPago: e.target.value})} min="1" max="31" error={errors.diaPago} className="sm:col-span-1" />
                <div className="sm:col-span-2 flex gap-2">
                   <button type="submit" className={`w-full ${editId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-medium py-2.5 md:py-2 rounded-lg transition-colors`}>{editId ? 'Actualizar' : 'Añadir Fijo'}</button>
                </div>
              </React.Fragment>
            )}
          </form>
        </Card>
      )}

      <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-sm font-medium w-full md:w-max">
        <button onClick={()=>setFiltroLista('Todos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-colors ${filtroLista === 'Todos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
        <button onClick={()=>setFiltroLista('Fijos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-colors ${filtroLista === 'Fijos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Fijos</button>
        <button onClick={()=>setFiltroLista('Variables')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-colors ${filtroLista === 'Variables' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Variables</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map(p => {
          const porcentaje = Math.min((p.gastado / p.limite) * 100, 100);
          const diferencia = p.limite - p.gastado; // ✨ AQUÍ CALCULAMOS LA DIFERENCIA
          const isDanger = porcentaje > 90;
          const isWarning = porcentaje > 75 && !isDanger;
          const bgBar = p.tipo === 'Fijo' ? 'bg-amber-500' : (isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500');

          return (
            <Card key={p.id + p.tipo} className={`border-t-4 ${p.tipo === 'Fijo' ? 'border-t-amber-500/50' : (isDanger ? 'border-t-rose-500' : isWarning ? 'border-t-amber-500' : 'border-t-emerald-500')}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-base leading-tight pr-2">{p.nombre}</h3>
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${p.tipo === 'Fijo' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>{p.tipo}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => cargarParaEditar(p)} className="text-slate-600 hover:text-indigo-400 p-1"><Edit3 size={14}/></button>
                  <button onClick={() => {
                    if (p.tipo === 'Variable') {
                      removePresupuesto(p.id);
                      showToast("Presupuesto eliminado");
                    } else {
                      removePagoFijo(p.id);
                      showToast("Gasto Fijo eliminado de esta vista y de la pestaña Egresos.");
                    }
                  }} className="text-slate-600 hover:text-rose-400 p-1"><Trash2 size={14}/></button>
                </div>
              </div>

              {/* ✨ TEXTOS ACTUALIZADOS PARA MOSTRAR LA DIFERENCIA */}
              <div className="flex justify-between text-xs text-slate-400 mb-1 mt-4">
                <span>Gastado: <strong className="text-white">{formatCOP(p.gastado)}</strong></span>
                <span>{p.tipo === 'Fijo' ? 'Estimado' : 'Límite'}: {formatCOP(p.limite)}</span>
              </div>
              <div className="text-right mb-3">
                <span className={`text-[11px] font-bold ${diferencia >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {diferencia >= 0 ? 'Disponible: ' : 'Excedido: '} {formatCOP(Math.abs(diferencia))}
                </span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-3 mb-2 border border-slate-800">
                <div className={`h-full rounded-full transition-all duration-1000 ${bgBar}`} style={{ width: `${porcentaje}%` }}></div>
              </div>
              <p className={`text-xs text-right font-bold ${p.tipo === 'Fijo' ? 'text-amber-400' : (isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400')}`}>
                {porcentaje.toFixed(1)}% consumido
              </p>
            </Card>
          );
        })}
        {items.length === 0 && <p className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-xl">No hay elementos para mostrar en esta vista.</p>}
      </div>
    </div>
  );
};