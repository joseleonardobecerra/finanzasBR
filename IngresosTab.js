    const IngresosTab = ({ ingresos, addIngreso, updateIngreso, removeIngreso,
                        ingresosFijos, addIngresoFijo, updateIngresoFijo, removeIngresoFijo,
                        cuentas, selectedMonth, showToast, filtroPersona }) => {
      const todayStr = getLocalToday();
      const defaultPersona = filtroPersona === 'Leo' ? 'L' : (filtroPersona === 'Andre' ? 'A' : '');
      const [nuevo, setNuevo] = useState({ fecha: todayStr, descripcion: '', persona: defaultPersona, tipo: 'Fijo', monto: '', cuentaId: '', plantilla: 'otro' });
      const [editId, setEditId] = useState(null);
      const [errors, setErrors] = useState({});
      const [showForm, setShowForm] = useState(false);
      const formRef = useRef(null);
      const fileInputRef = useRef(null);

      // --- IMPORTAR / EXPORTAR INDIVIDUAL DE INGRESOS ---
      const handleExport = async () => {
        try {
          const xlsx = await loadSheetJS();
          const wb = xlsx.utils.book_new();
          const headers = ["ID", "Fecha", "Descripcion", "Persona", "Tipo", "Cuenta", "Monto"];
          const data = ingresos.map(i => ({ ID: i.id, Fecha: i.fecha, Descripcion: i.descripcion, Persona: i.persona, Tipo: i.tipo, Cuenta: cuentas.find(c=>c.id===i.cuentaId)?.name || i.cuentaId, Monto: i.monto }));
          const ws = xlsx.utils.json_to_sheet(data.length > 0 ? data : [{}], { header: headers });
          xlsx.utils.book_append_sheet(wb, ws, "Ingresos");
          xlsx.writeFile(wb, `Ingresos_Historial_${new Date().toISOString().split('T')[0]}.xlsx`);
          showToast("Historial exportado con éxito.");
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
              const sheetName = wb.Sheets["Ingresos"] ? "Ingresos" : wb.SheetNames[0];
              const importedData = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
              let importados = 0;
              
              importedData.filter(i=>i.Monto).forEach(i => {
                  const fecha = i.Fecha || new Date().toISOString().split('T')[0];
                  const desc  = i.Descripcion || 'Ingreso Importado';
                  const monto = Number(i.Monto) || 0;
                  const exists = ingresos.some(ex => ex.fecha === fecha && ex.descripcion === desc && ex.monto === monto);
                  if (!exists) {
                      addIngreso({ id: i.ID || generateId(), fecha, descripcion: desc, persona: i.Persona || '', tipo: i.Tipo || 'Variable', monto, cuentaId: cuentas.find(c => c.name === i.Cuenta)?.id || cuentas[0]?.id });
                      importados++;
                  }
              });
              showToast(importados > 0 ? `Se importaron ${importados} ingresos.` : "No hay ingresos nuevos.");
            } catch(err) { showToast("Error procesando los datos del archivo.", "error"); }
          };
          reader.readAsBinaryString(file);
        } catch(err) { showToast("Error al abrir herramienta de Excel.", "error"); }
        e.target.value = '';
      };

      const currentMonthNum = selectedMonth.split('-')[1];
      const opcionesPlantillas = [
        { value: 'otro', label: 'Otro (Ingreso manual)' },
        { value: 'Salario L', label: 'Salario Leo' },
        { value: 'Salario A (Q1)', label: 'Salario Andre (Q1)' },
        { value: 'Salario A (Q2)', label: 'Salario Andre (Q2)' },
        { value: 'Bono Salario A', label: 'Bono Salario Andre' }
      ];
      
      if (currentMonthNum === '07') {
        opcionesPlantillas.push({ value: 'Prima 1 L', label: 'Prima 1 Leo' });
        opcionesPlantillas.push({ value: 'Prima 1 A', label: 'Prima 1 Andre' });
      } else if (currentMonthNum === '12') {
        opcionesPlantillas.push({ value: 'Prima 2 L', label: 'Prima 2 Leo' });
        opcionesPlantillas.push({ value: 'Prima 2 A', label: 'Prima 2 Andre' });
      }

      const handlePlantillaChange = (e) => {
        const val = e.target.value;
        if (val === 'otro' || val === '') {
          setNuevo({...nuevo, plantilla: val, descripcion: ''});
          return;
        }
        let baseMonto = 0; let cuentaName = ''; let persona = ''; let tipo = 'Fijo';
        const currentYear = new Date().getFullYear();
        const currentMonth = selectedMonth.split('-')[1];
        let dia = '01';

        if (val === 'Salario L') {
           baseMonto = 5765251; cuentaName = 'Bancolombia Leo'; persona = 'L'; 
           const endOfMonth = new Date(currentYear, currentMonth, 0).getDate();
           dia = endOfMonth <= 30 ? '27' : '28'; 
        } else if (val === 'Salario A (Q1)') {
           baseMonto = 1200000; cuentaName = 'Banco de Bogotá Andre'; persona = 'A'; dia = '14';
        } else if (val === 'Salario A (Q2)') {
           baseMonto = 1200000; cuentaName = 'Banco de Bogotá Andre'; persona = 'A'; dia = '28';
        } else if (val === 'Bono Salario A') {
           baseMonto = 500000; cuentaName = 'Banco de Bogotá Andre'; persona = 'A'; tipo = 'Variable'; dia = '28';
        } else if (val === 'Prima 1 L' || val === 'Prima 2 L') {
           baseMonto = 2800000; cuentaName = 'Bancolombia Leo'; persona = 'L'; tipo = 'Bono';
        } else if (val === 'Prima 1 A' || val === 'Prima 2 A') {
           baseMonto = 1200000; cuentaName = 'Banco de Bogotá Andre'; persona = 'A'; tipo = 'Bono';
        }
        const cuentaEncontrada = cuentas.find(c => c.name.includes(cuentaName))?.id || cuentas[0]?.id;

        setNuevo({ fecha: `${selectedMonth}-${dia}`, descripcion: val, persona: persona, tipo: tipo, monto: baseMonto.toString(), cuentaId: cuentaEncontrada || '', plantilla: val });
        setErrors({});
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      const guardar = (e) => { 
        e.preventDefault();
        let errs = {};
        if(!nuevo.descripcion) errs.descripcion = "Obligatorio";
        if(!nuevo.monto) errs.monto = "Obligatorio";
        if(!nuevo.cuentaId) errs.cuentaId = "Obligatorio";
        if(!nuevo.fecha) errs.fecha = "Obligatorio";
        if(Object.keys(errs).length > 0) { setErrors(errs); return; }
        
        if (editId) {
          updateIngreso(editId, { ...nuevo, monto: Number(nuevo.monto) });
          setEditId(null);
          showToast("Ingreso actualizado.");
        } else {
          addIngreso({ ...nuevo, id: generateId(), monto: Number(nuevo.monto) }); 
          showToast("Ingreso guardado correctamente.");
        }
        setNuevo({ fecha: todayStr, descripcion: '', persona: defaultPersona, tipo: 'Fijo', monto: '', cuentaId: '', plantilla: 'otro' }); 
        setErrors({});
      };

      const procesarIngresoFijo = (ingFijoId, cuentaId, montoFinal) => {
        if(!cuentaId) { showToast("Selecciona a qué cuenta ingresó el dinero.", "error"); return; }
        const inf = ingresosFijos.find(i => i.id === ingFijoId);
        const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7);
        const diaStr = isCurrentMonth ? new Date().getDate().toString().padStart(2, '0') : '01';
        const fechaIngreso = `${selectedMonth}-${diaStr}`; 
        
        const nuevoIngreso = { 
          id: generateId(), fecha: fechaIngreso, descripcion: inf.descripcion, 
          persona: inf.persona, tipo: inf.tipo, monto: Number(montoFinal) || inf.monto, 
          cuentaId: cuentaId, ingresoFijoId: inf.id 
        };
        addIngreso(nuevoIngreso);
        showToast(`Ingreso de ${inf.descripcion} registrado.`);
      };

      const cargarParaEditar = (ing) => {
        setNuevo({ fecha: ing.fecha, descripcion: ing.descripcion, persona: ing.persona || '', tipo: ing.tipo || 'Variable', monto: ing.monto.toString(), cuentaId: ing.cuentaId, plantilla: 'otro' });
        setEditId(ing.id);
        setErrors({});
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }

      const cancelarEdicion = () => {
        setEditId(null);
        setNuevo({ fecha: todayStr, descripcion: '', persona: defaultPersona, tipo: 'Fijo', monto: '', cuentaId: '', plantilla: 'otro' });
        setErrors({});
        setShowForm(false);
      }
      
      const ingresosMes = ingresos.filter(i => i.fecha.startsWith(selectedMonth));
      const optionsCuentas = cuentas.filter(c => ['bank', 'cash', 'pocket'].includes(c.type)).map(c => ({value: c.id, label: c.name}));

      const ingresosPendientes = ingresosFijos.map(inf => {
        const ingresoEsteMes = ingresosMes.find(i => i.ingresoFijoId === inf.id);
        const cuentaDefault = cuentas.find(c => c.name.includes(inf.cuentaName));
        return { ...inf, recibido: !!ingresoEsteMes, ingresoInfo: ingresoEsteMes, defaultCuentaId: cuentaDefault ? cuentaDefault.id : '' };
      }).sort((a, b) => a.recibido - b.recibido);

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3"><Wallet className="text-emerald-400 w-6 h-6 md:w-8 md:h-8"/> Ingresos</h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">Registra tus ingresos de forma manual o utiliza la lista de fijos esperados.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { cancelarEdicion(); setShowForm(!showForm); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus size={16}/> {showForm ? 'Ocultar' : 'Nuevo Ingreso'}
              </button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Upload size={14}/> Importar</button>
              <button onClick={handleExport} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Download size={14}/> Exportar</button>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {showForm && (
              <Card className={editId ? "border-t-4 border-t-amber-500 bg-amber-950/10" : "border-t-4 border-t-emerald-500 bg-slate-900/80"}>
                <div className="flex justify-between items-center mb-4" ref={formRef}>
                  <h2 className="text-lg font-semibold text-white">{editId ? '✏️ Editar Ingreso' : '1. Registrar Ingreso Manual'}</h2>
                  {editId && <button onClick={cancelarEdicion} className="text-xs text-amber-400 hover:underline">Cancelar Edición</button>}
                </div>
                <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-2 items-end">
                  {!editId && (
                    <Select label="Plantilla Rápida" options={opcionesPlantillas} value={nuevo.plantilla} onChange={handlePlantillaChange} className="col-span-1 sm:col-span-2 md:col-span-4" />
                  )}
                  {nuevo.plantilla === 'otro' || editId ? (
                     <Input label="Descripción del Ingreso" placeholder="Ej: Venta extra" value={nuevo.descripcion} onChange={e=>setNuevo({...nuevo, descripcion: e.target.value})} error={errors.descripcion} className="col-span-1 sm:col-span-2" />
                  ) : null}
                  
                  <Input type="date" label="Fecha" value={nuevo.fecha} onChange={e=>setNuevo({...nuevo, fecha: e.target.value})} error={errors.fecha} className="col-span-1" />
                  <Select label="Destino (Cuenta)" options={optionsCuentas} value={nuevo.cuentaId} onChange={e=>setNuevo({...nuevo, cuentaId: e.target.value})} error={errors.cuentaId} className="col-span-1" />
                  <Input type="number" label="Monto ($)" value={nuevo.monto} onChange={e=>setNuevo({...nuevo, monto: e.target.value})} error={errors.monto} className="col-span-1" />
                  <Input label="Persona (Opcional)" placeholder="Ej: L o A" value={nuevo.persona} onChange={e=>setNuevo({...nuevo, persona: e.target.value})} className="col-span-1" />
                  <Select label="Tipo" options={[{value:'Fijo',label:'Fijo'}, {value:'Variable',label:'Variable'}, {value:'Bono',label:'Bono'}, {value:'Freelance',label:'Freelance'}, {value:'Rendimiento',label:'Rendimiento'}]} value={nuevo.tipo} onChange={e=>setNuevo({...nuevo, tipo: e.target.value})} className="col-span-1 sm:col-span-2" />
                  
                  <div className="flex gap-2 col-span-1 sm:col-span-2 md:col-span-4 mt-2">
                    <button type="submit" className={`flex-1 ${editId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors`}>
                      {editId ? 'Actualizar Ingreso' : <><Plus size={18} /> Guardar Ingreso</>}
                    </button>
                    {editId && <button type="button" onClick={cancelarEdicion} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Cancelar</button>}
                  </div>
                </form>
              </Card>
            )}

            <Card className="h-full border-t-4 border-t-emerald-500/50">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><CheckSquare size={20} className="text-emerald-400"/> 2. Ingresos Fijos Esperados</h2>
              </div>
              {ingresosFijos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingresosPendientes.map(inc => {
                    if (inc.recibido) {
                      return (
                        <div key={inc.id} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3 flex justify-between items-center opacity-70">
                          <div><p className="font-bold text-emerald-400 line-through">{inc.descripcion}</p><p className="text-[10px] text-emerald-500/70">Recibido en {cuentas.find(c=>c.id===inc.ingresoInfo.cuentaId)?.name}</p></div>
                          <CheckCircle2 size={24} className="text-emerald-500" />
                        </div>
                      );
                    }
                    return <IngresoFijoCard key={inc.id} inc={inc} cuentasPermitidas={optionsCuentas} onReceive={(cuentaId, monto) => procesarIngresoFijo(inc.id, cuentaId, monto)} cuentas={cuentas} />;
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4">No hay ingresos fijos configurados.</p>
              )}
            </Card>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Historial Completo de Ingresos</h3>
            </div>
            <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950">
                  <tr><th className="px-4 py-4 rounded-tl-lg">Fecha</th><th className="px-4 py-4">Descripción</th><th className="px-4 py-4">Destino/Tipo</th><th className="px-4 py-4 text-right">Monto</th><th className="px-4 py-4 rounded-tr-lg"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {ingresosMes.map(ing => (
                    <tr key={ing.id} className={`transition-colors ${editId === ing.id ? 'bg-amber-900/20' : 'hover:bg-slate-800/20'}`}>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{ing.fecha}</td>
                      <td className="px-4 py-3 text-slate-300 font-medium">{ing.descripcion}</td>
                      <td className="px-4 py-3 text-slate-400">
                        <span className="bg-slate-800 px-2 py-1 rounded-md text-xs block w-max mb-1">{ing.tipo}</span>
                        <span className="text-[10px] text-emerald-400/80">Entró a: {cuentas.find(c => c.id === ing.cuentaId)?.name || '?'}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">{formatCOP(ing.monto)}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button onClick={() => cargarParaEditar(ing)} className="text-slate-500 hover:text-indigo-400 p-1.5" title="Editar Ingreso"><Edit3 size={16} /></button>
                        <button onClick={() => {removeIngreso(ing.id); showToast("Ingreso eliminado");}} className="text-slate-500 hover:text-rose-400 p-1.5" title="Eliminar"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {ingresosMes.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-500">No hay ingresos registrados este mes.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };
