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
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const { fijosItems, varItems } = useMemo(() => {
    const fijos = [];
    const variables = [];

    pagosFijos.forEach(pf => {
      const gastado = egresosMes.filter(e => e.pagoFijoId === pf.id).reduce((s, e) => s + e.monto, 0);
      fijos.push({ id: pf.id, tipo: 'Fijo', nombre: pf.descripcion, categoria: pf.categoria, limite: pf.monto, gastado, diaPago: pf.diaPago });
    });

    presupuestos.forEach(p => {
      const gastado = egresosMes.filter(e => e.categoria.toLowerCase() === p.categoria.toLowerCase() && e.tipo !== 'Fijo').reduce((s, e) => s + e.monto, 0);
      variables.push({ id: p.id, tipo: 'Variable', nombre: p.categoria, categoria: p.categoria, limite: p.limite, gastado });
    });

    return { 
      fijosItems: fijos.sort((a, b) => b.limite - a.limite), 
      varItems: variables.sort((a, b) => b.limite - a.limite) 
    };
  }, [pagosFijos, presupuestos, egresosMes]);

  // Cálculos de Totales y Diferencias
  const totalGastadoFijo = useMemo(() => fijosItems.reduce((s, item) => s + item.gastado, 0), [fijosItems]);
  const totalGastadoVar = useMemo(() => varItems.reduce((s, item) => s + item.gastado, 0), [varItems]);
  const totalGastadoAmbos = totalGastadoFijo + totalGastadoVar;

  const difFijo = totalFijo - totalGastadoFijo;
  const difVar = totalVar - totalGastadoVar;
  const difTotal = (totalFijo + totalVar) - totalGastadoAmbos;

  // Función para determinar el color de la diferencia
  const getColorDif = (val) => {
    if (val > 0) return 'text-emerald-400';
    if (val < 0) return 'text-rose-500';
    return 'text-orange-400'; // Exactamente 0
  };

  const RenderCardCompacta = ({ p, themeColor }) => {
    const porcentaje = Math.min((p.gastado / p.limite) * 100, 100);
    const porcentajeReal = p.limite > 0 ? (p.gastado / p.limite) * 100 : 0;
    const diferencia = p.limite - p.gastado;

    const themeMap = {
      yellow: { bar: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-500', bgEdit: 'bg-yellow-950/10' },
      blue: { bar: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', bgEdit: 'bg-blue-950/10' }
    };

    let t = themeMap[themeColor];

    return (
      <div key={p.id} className={`bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5 hover:border-slate-700 transition-colors ${editId === p.id ? `${t.border} ${t.bgEdit}` : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col pr-2">
            <span className="font-bold text-slate-200 text-sm leading-tight truncate">{p.nombre}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{p.tipo === 'Fijo' ? 'Estimado' : 'Límite'}: {formatCOP(p.limite)}</span>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <button onClick={() => cargarParaEditar(p)} className={`text-slate-600 hover:${t.text} p-1`}><Edit3 size={14}/></button>
            <button onClick={() => {
              if (p.tipo === 'Variable') { removePresupuesto(p.id); showToast("Presupuesto eliminado"); } 
              else { removePagoFijo(p.id); showToast("Gasto Fijo eliminado."); }
            }} className="text-slate-600 hover:text-rose-400 p-1"><Trash2 size={14}/></button>
          </div>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${t.bar}`} style={{ width: `${porcentaje}%` }}></div>
        </div>

        <div className="flex justify-between items-end text-[10px]">
          <div className="flex flex-col">
             <span className="text-slate-400">Gastado: <span className="text-white font-bold">{formatCOP(p.gastado)}</span></span>
             <span className={`font-medium ${diferencia >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
               {diferencia >= 0 ? 'Disponible: ' : 'Excedido: '} {formatCOP(Math.abs(diferencia))}
             </span>
          </div>
          <span className={`font-bold ${t.text} text-xs`}>{porcentajeReal.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2"><PieChart className="text-blue-400 w-8 h-8"/> Presupuestos y Ejecución</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Controla cómo se está gastando el dinero vs lo que tenías planificado.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { cancelarEdicion(); setShowForm(!showForm); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus size={16}/> {showForm ? 'Ocultar' : 'Añadir presupuesto'}
          </button>
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Upload size={14}/> Importar</button>
          <button onClick={handleExport} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Download size={14}/> Exportar</button>
        </div>
      </header>

      {/* ✨ TARJETAS ACTUALIZADAS CON ANÁLISIS DE DIFERENCIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tarjeta Fijos */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-yellow-400 uppercase font-bold mb-1">Presupuesto Gasto Fijo</p>
            <p className="text-lg font-bold text-slate-200">{formatCOP(totalFijo)}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-orange-400 font-bold">Gastado:</span>
              <span className="font-bold text-white">{formatCOP(totalGastadoFijo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{difFijo >= 0 ? 'Restante:' : 'Excedido:'}</span>
              <span className={`font-bold ${getColorDif(difFijo)}`}>{formatCOP(difFijo)}</span>
            </div>
          </div>
        </div>
        
        {/* Tarjeta Variables */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Presupuesto Gasto Variable</p>
            <p className="text-lg font-bold text-slate-200">{formatCOP(totalVar)}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-bold">Gastado:</span>
              <span className="font-bold text-white">{formatCOP(totalGastadoVar)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{difVar >= 0 ? 'Restante:' : 'Excedido:'}</span>
              <span className={`font-bold ${getColorDif(difVar)}`}>{formatCOP(difVar)}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Total Consolidado */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-slate-300 uppercase font-bold mb-1">Total Presupuestado</p>
            <p className="text-lg font-bold text-white">{formatCOP(totalFijo + totalVar)}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-600/50 flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-bold">Total Gastado:</span>
              <span className="font-bold text-white">{formatCOP(totalGastadoAmbos)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{difTotal >= 0 ? 'Restante:' : 'Excedido:'}</span>
              <span className={`font-bold ${getColorDif(difTotal)}`}>{formatCOP(difTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <Card className={editId ? "border-t-4 border-t-yellow-500 bg-yellow-950/10" : "border-t-4 border-t-slate-500 bg-slate-900/80"}>
          <div className="flex justify-between items-center mb-4" ref={formRef}>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setTipoForm('variable')} 
                type="button"
                className={`text-sm md:text-lg font-semibold transition-colors ${tipoForm === 'variable' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {editId ? (editOriginalType === 'variable' ? '✏️ Editando Límite Variable' : '🔄 Convertir a Variable') : 'Añadir Límite Variable'}
              </button>
              <span className="text-slate-700">|</span>
              <button 
                onClick={() => setTipoForm('fijo')} 
                type="button"
                className={`text-sm md:text-lg font-semibold transition-colors ${tipoForm === 'fijo' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {editId ? (editOriginalType === 'fijo' ? '✏️ Editando Gasto Fijo' : '🔄 Convertir a Fijo') : 'Añadir Gasto Fijo'}
              </button>
            </div>
            
            {editId && <button onClick={cancelarEdicion} className="text-xs text-yellow-400 hover:underline bg-slate-950 px-2 py-1 rounded">Cancelar Edición</button>}
          </div>
          
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end mt-2">
            {tipoForm === 'variable' ? (
              <React.Fragment>
                <Input label="Categoría Variable (Libre texto)" placeholder="Ej: Gasolina, Mercado..." value={nuevoVar.categoria} onChange={e=>setNuevoVar({...nuevoVar, categoria: e.target.value})} error={errors.categoria} className="sm:col-span-5" />
                <Input type="number" label="Límite Mensual ($)" value={nuevoVar.limite} onChange={e=>setNuevoVar({...nuevoVar, limite: e.target.value})} error={errors.limite} className="sm:col-span-4" />
                <div className="sm:col-span-3 flex gap-2">
                   <button type="submit" className={`w-full ${editId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2.5 md:py-2 rounded-lg transition-colors`}>{editId ? (editOriginalType === 'variable' ? 'Actualizar' : 'Convertir') : 'Añadir Límite'}</button>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Input label="Descripción (Gasto Fijo)" placeholder="Ej: Internet" value={nuevoFijo.descripcion} onChange={e=>setNuevoFijo({...nuevoFijo, descripcion: e.target.value})} error={errors.descripcion} className="sm:col-span-4" />
                <Select label="Categoría Fija" options={categoriasMaestras.map(c=>({value:c, label:c}))} value={nuevoFijo.categoria} onChange={e=>setNuevoFijo({...nuevoFijo, categoria: e.target.value})} error={errors.categoria} className="sm:col-span-3" />
                <Input type="number" label="Monto Estimado ($)" value={nuevoFijo.monto} onChange={e=>setNuevoFijo({...nuevoFijo, monto: e.target.value})} error={errors.monto} className="sm:col-span-2" />
                <Input type="number" label="Día (1-31)" value={nuevoFijo.diaPago} onChange={e=>setNuevoFijo({...nuevoFijo, diaPago: e.target.value})} min="1" max="31" error={errors.diaPago} className="sm:col-span-1" />
                <div className="sm:col-span-2 flex gap-2">
                   <button type="submit" className={`w-full ${editId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-slate-900 font-bold py-2.5 md:py-2 rounded-lg transition-colors`}>{editId ? (editOriginalType === 'fijo' ? 'Actualizar' : 'Convertir') : 'Añadir Fijo'}</button>
                </div>
              </React.Fragment>
            )}
          </form>
        </Card>
      )}

      <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-sm font-medium w-full md:w-max">
        <button onClick={()=>setFiltroLista('Todos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-colors ${filtroLista === 'Todos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
        <button onClick={()=>setFiltroLista('Fijos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-colors ${filtroLista === 'Fijos' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>Solo Fijos</button>
        <button onClick={()=>setFiltroLista('Variables')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg transition-colors ${filtroLista === 'Variables' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Solo Variables</button>
      </div>

      <div className="space-y-8">
        {(filtroLista === 'Todos' || filtroLista === 'Fijos') && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <CheckSquare size={16} /> Gastos Fijos Estimados
            </h2>
            {fijosItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {fijosItems.map(p => <RenderCardCompacta key={p.id} p={p} themeColor="yellow" />)}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay gastos fijos configurados.</p>
            )}
          </div>
        )}

        {(filtroLista === 'Todos' || filtroLista === 'Variables') && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <PieChart size={16} /> Límites de Gasto Variable
            </h2>
            {varItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {varItems.map(p => <RenderCardCompacta key={p.id} p={p} themeColor="blue" />)}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay presupuestos variables configurados.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
