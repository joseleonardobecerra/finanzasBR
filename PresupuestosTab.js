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

  // ✨ PARCHE DE SEGURIDAD PARA SINCRONIZAR FIJOS Y VARIABLES
  const { fijosItems, varItems } = useMemo(() => {
    const fijos = [];
    const variables = [];

    pagosFijos.forEach(pf => {
      const gastado = egresosMes.filter(e => {
        if (e.tipo !== 'Fijo') return false;
        // ✨ CORRECCIÓN: Si el ID coincide, es un éxito directo. 
        if (e.pagoFijoId === pf.id) return true;
        // ✨ CORRECCIÓN: Si el ID no coincide (ej. se borró y se recreó), verificar por descripción como respaldo fuerte.
        return (e.descripcion || '').trim().toLowerCase() === (pf.descripcion || '').trim().toLowerCase();
      }).reduce((s, e) => s + e.monto, 0);
      
      fijos.push({ id: pf.id, tipo: 'Fijo', nombre: pf.descripcion, categoria: pf.categoria, limite: pf.monto, gastado, diaPago: pf.diaPago });
    });

    presupuestos.forEach(p => {
      // Blindamos las categorías variables contra espacios extra
      const gastado = egresosMes.filter(e => (e.categoria || '').trim().toLowerCase() === (p.categoria || '').trim().toLowerCase() && e.tipo !== 'Fijo').reduce((s, e) => s + e.monto, 0);
      variables.push({ id: p.id, tipo: 'Variable', nombre: p.categoria, categoria: p.categoria, limite: p.limite, gastado });
    });

    return { 
      fijosItems: fijos.sort((a, b) => b.limite - a.limite), 
      varItems: variables.sort((a, b) => b.limite - a.limite) 
    };
  }, [pagosFijos, presupuestos, egresosMes]);

  const totalGastadoFijo = useMemo(() => fijosItems.reduce((s, item) => s + item.gastado, 0), [fijosItems]);
  const totalGastadoVar = useMemo(() => varItems.reduce((s, item) => s + item.gastado, 0), [varItems]);
  const totalGastadoAmbos = totalGastadoFijo + totalGastadoVar;

  const difFijo = totalFijo - totalGastadoFijo;
  const difVar = totalVar - totalGastadoVar;
  const difTotal = (totalFijo + totalVar) - totalGastadoAmbos;

  const getColorDif = (val) => {
    if (val >= 0) return 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]';
    if (val < 0) return 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]';
    return 'text-amber-400'; 
  };

  const RenderCardCompacta = ({ p, themeColor }) => {
    const porcentaje = Math.min((p.gastado / p.limite) * 100, 100);
    const porcentajeReal = p.limite > 0 ? (p.gastado / p.limite) * 100 : 0;
    const diferencia = p.limite - p.gastado;
    const excede = diferencia < 0;

    const themeMap = {
      yellow: { 
         bar: excede ? 'bg-neonmagenta shadow-glow-magenta' : 'bg-amber-400 shadow-glow-amber', 
         text: excede ? 'text-neonmagenta' : 'text-amber-400', 
         border: 'border-amber-500/30', 
         bgEdit: 'bg-amber-900/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
      },
      blue: { 
         bar: excede ? 'bg-neonmagenta shadow-glow-magenta' : 'bg-neoncyan shadow-glow-cyan', 
         text: excede ? 'text-neonmagenta' : 'text-neoncyan', 
         border: 'border-neoncyan/30', 
         bgEdit: 'bg-cyan-900/20 border-neoncyan shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
      }
    };

    let t = themeMap[themeColor];

    return (
      <div key={p.id} className={`bg-appcard p-4 rounded-2xl border flex flex-col gap-3 hover:border-white/[0.05] transition-all shadow-neumorph ${editId === p.id ? `${t.border} ${t.bgEdit}` : 'border-white/[0.02]'}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col pr-2 overflow-hidden">
            <span className="font-black text-white text-sm leading-tight truncate tracking-wide">{p.nombre}</span>
            <span className="text-[10px] font-bold text-[#8A92A6] mt-1 uppercase tracking-widest">{p.tipo === 'Fijo' ? 'Estimado' : 'Límite'}: {formatCOP(p.limite)}</span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => cargarParaEditar(p)} className={`text-[#8A92A6] hover:${t.text} p-1.5 transition-colors`} title="Editar"><Edit3 size={14}/></button>
            <button onClick={() => {
              // ✨ NUEVO: Confirmación de eliminación con advertencia clara
              const isVar = p.tipo === 'Variable';
              if (window.confirm(`¿Estás seguro de que quieres eliminar el ${isVar ? 'presupuesto' : 'gasto fijo'} "${p.nombre}"?\n\n(Esto solo borrará el límite de la lista, los pagos que ya hayas realizado se mantendrán en el historial).`)) {
                if (isVar) { removePresupuesto(p.id); showToast("Presupuesto eliminado"); } 
                else { removePagoFijo(p.id); showToast("Gasto Fijo eliminado."); }
              }
            }} className="text-[#8A92A6] hover:text-neonmagenta p-1.5 transition-colors" title="Eliminar"><Trash2 size={14}/></button>
          </div>
        </div>

        <div className="w-full bg-[#0b0c16] shadow-neumorph-inset rounded-full h-1.5 border border-transparent overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${t.bar}`} style={{ width: `${porcentaje}%` }}></div>
        </div>

        <div className="flex justify-between items-end text-[10px]">
          <div className="flex flex-col gap-0.5">
             <span className="text-[#8A92A6] font-bold uppercase tracking-wider">Gastado: <span className="text-white font-black">{formatCOP(p.gastado)}</span></span>
             <span className={`font-black uppercase tracking-wider ${diferencia >= 0 ? 'text-emerald-400' : 'text-neonmagenta'}`}>
               {diferencia >= 0 ? 'Disponible: ' : 'Excedido: '} {formatCOP(Math.abs(diferencia))}
             </span>
          </div>
          <span className={`font-black ${t.text} text-xs drop-shadow-md`}>{porcentajeReal.toFixed(1)}%</span>
        </div>
      </div>
    );
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

      {/* TARJETAS RESUMEN (Neumorfismo Inset) */}
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

      {/* FILTROS */}
      <div className="flex bg-[#111222] shadow-neumorph-inset p-1.5 rounded-xl border border-transparent text-xs font-black uppercase tracking-widest w-full md:w-max mx-auto md:mx-0">
        <button onClick={()=>setFiltroLista('Todos')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all ${filtroLista === 'Todos' ? 'bg-appcard text-white shadow-neumorph' : 'text-[#8A92A6] hover:text-white'}`}>Todos</button>
        <button onClick={()=>setFiltroLista('Fijos')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all ${filtroLista === 'Fijos' ? 'bg-amber-400 text-[#0b0c16] shadow-glow-amber' : 'text-[#8A92A6] hover:text-white'}`}>Solo Fijos</button>
        <button onClick={()=>setFiltroLista('Variables')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all ${filtroLista === 'Variables' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-[#8A92A6] hover:text-white'}`}>Variables</button>
      </div>

      <div className="space-y-10">
        {(filtroLista === 'Todos' || filtroLista === 'Fijos') && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-sm font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.05] pb-3">
              <CheckSquare size={18} /> Gastos Fijos Estimados
            </h2>
            {fijosItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {fijosItems.map(p => <RenderCardCompacta key={p.id} p={p} themeColor="yellow" />)}
              </div>
            ) : (
              <div className="bg-[#111222] shadow-neumorph-inset p-8 rounded-3xl text-center">
                <p className="text-sm text-[#8A92A6] font-bold tracking-wide uppercase">No hay gastos fijos configurados.</p>
              </div>
            )}
          </div>
        )}

        {(filtroLista === 'Todos' || filtroLista === 'Variables') && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-sm font-black text-neoncyan drop-shadow-[0_0_5px_rgba(0,229,255,0.5)] uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.05] pb-3">
              <PieChart size={18} /> Límites de Gasto Variable
            </h2>
            {varItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {varItems.map(p => <RenderCardCompacta key={p.id} p={p} themeColor="blue" />)}
              </div>
            ) : (
              <div className="bg-[#111222] shadow-neumorph-inset p-8 rounded-3xl text-center">
                 <p className="text-sm text-[#8A92A6] font-bold tracking-wide uppercase">No hay presupuestos variables configurados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
