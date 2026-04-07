const EgresosTab = ({ egresos, addEgreso, updateEgreso, removeEgreso,
                       pagosFijos, addPagoFijo, updatePagoFijo, removePagoFijo,
                       comprasCuotas, addComprasCuotas, removeComprasCuotas,
                       cuentas, selectedMonth, presupuestos, categoriasMaestras, showToast }) => {
      const todayStr = getLocalToday();
      const [gastoForm, setGastoForm] = useState({ id: null, editSource: null, fecha: todayStr, descripcion: '', categoria: categoriasMaestras[0] || 'Otros', metodoPago: '', cuentaId: '', monto: '', cuotas: '', tasaEA: '', esPagoDeuda: false, deudaDestinoId: '' });
      const [errorsVar, setErrorsVar] = useState({});
      const varRef = useRef(null);
      const fileInputRef = useRef(null);

      const isCreditCard = gastoForm.metodoPago === 'credit';

      const cuotaMensual = useMemo(() => {
        if (!isCreditCard) return 0;
        const p = Number(gastoForm.monto) || 0;
        const n = Number(gastoForm.cuotas) || 1;
        const ea = Number(gastoForm.tasaEA) || 0;
        const tm = Math.pow(1 + ea/100, 1/12) - 1;
        if (p <= 0 || n <= 0) return 0;
        if (tm === 0) return p / n;
        return (p * tm) / (1 - Math.pow(1 + tm, -n));
      }, [isCreditCard, gastoForm.monto, gastoForm.cuotas, gastoForm.tasaEA]);

      const handleMetodoChange = (e) => {
        setGastoForm(prev => ({...prev, metodoPago: e.target.value, cuentaId: '', cuotas: '', tasaEA: ''}));
      };

      const handleCuentaChange = (e) => {
        const cId = e.target.value;
        const card = cuentas.find(c => c.id === cId);
        setGastoForm(prev => ({
            ...prev,
            cuentaId: cId,
            tasaEA: card?.type === 'credit' ? (card.tasaEA || 0) : '',
            cuotas: card?.type === 'credit' ? (prev.cuotas || '1') : ''
        }));
      };

      const guardarGasto = (e) => {
        e.preventDefault();
        let errs = {};
        if(!gastoForm.descripcion) errs.descripcion = "Obligatorio";
        if(!gastoForm.monto) errs.monto = "Obligatorio";
        if(!gastoForm.metodoPago) errs.metodoPago = "Obligatorio";
        if(!gastoForm.cuentaId) errs.cuentaId = "Obligatorio";
        if(gastoForm.editSource !== 'cuotas' && !gastoForm.fecha) errs.fecha = "Obligatorio";
        if(isCreditCard && !gastoForm.cuotas) errs.cuotas = "Obligatorio";
        if(gastoForm.esPagoDeuda && !gastoForm.deudaDestinoId) errs.deudaDestinoId = "Obligatorio";
        
        if(Object.keys(errs).length > 0) { setErrorsVar(errs); return; }

        if (gastoForm.editSource === 'cuotas') {
            // update compra a cuotas — one doc write
            const cc = comprasCuotas.find(c => c.id === gastoForm.id);
            if (cc) {
              const updated = { ...cc, tarjetaId: gastoForm.cuentaId, descripcion: gastoForm.descripcion, montoTotal: Number(gastoForm.monto), cuotasTotales: Number(gastoForm.cuotas), valorMensual: Math.round(cuotaMensual) };
              // fire.update not available here; use removeComprasCuotas + addComprasCuotas as atomic replace
              removeComprasCuotas(cc.id);
              addComprasCuotas(updated);
            }
            showToast("Compra a cuotas actualizada");
        } else if (gastoForm.editSource === 'historial') {
            const eg = egresos.find(e => e.id === gastoForm.id);
            if (eg) updateEgreso(gastoForm.id, {
                ...eg,
                fecha: gastoForm.fecha,
                descripcion: gastoForm.descripcion,
                categoria: gastoForm.categoria,
                monto: Number(gastoForm.monto),
                cuentaId: gastoForm.cuentaId,
                deudaId: gastoForm.esPagoDeuda ? gastoForm.deudaDestinoId : (eg.deudaId || null)
            });
            showToast("Gasto actualizado.");
        } else {
            const nuevoEgreso = {
                id: generateId(),
                fecha: gastoForm.fecha || todayStr,
                descripcion: gastoForm.descripcion,
                categoria: gastoForm.categoria,
                monto: Number(gastoForm.monto),
                cuentaId: gastoForm.cuentaId,
                tipo: 'Variable',
                deudaId: gastoForm.esPagoDeuda ? gastoForm.deudaDestinoId : null
            };
            addEgreso(nuevoEgreso);

            if (isCreditCard) {
                addComprasCuotas({ id: generateId(), tarjetaId: gastoForm.cuentaId, descripcion: gastoForm.descripcion, montoTotal: Number(gastoForm.monto), cuotasTotales: Number(gastoForm.cuotas), valorMensual: Math.round(cuotaMensual), cuotasPagadas: 0 });
                showToast('Gasto y Compra a cuotas registrados.');
            } else {
                showToast("Gasto registrado exitosamente.");
            }
        }
        cancelarEdicion();
      };

      const cargarParaEditarVariable = (egreso) => {
        const cuenta = cuentas.find(c => c.id === egreso.cuentaId);
        const metodo = cuenta ? (cuenta.type === 'credit' ? 'credit' : cuenta.type === 'cash' ? 'cash' : 'bank') : '';
        setGastoForm({ 
            id: egreso.id, editSource: 'historial', fecha: egreso.fecha, descripcion: egreso.descripcion, 
            categoria: egreso.categoria, metodoPago: metodo, cuentaId: egreso.cuentaId, monto: egreso.monto.toString(), 
            cuotas: '', tasaEA: '', esPagoDeuda: !!egreso.deudaId, deudaDestinoId: egreso.deudaId || '' 
        });
        setErrorsVar({});
        varRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const cargarParaEditarCuota = (c) => {
        const card = cuentas.find(acc => acc.id === c.tarjetaId);
        setGastoForm({ id: c.id, editSource: 'cuotas', fecha: todayStr, descripcion: c.descripcion, categoria: categoriasMaestras[0] || 'Otros', metodoPago: 'credit', cuentaId: c.tarjetaId, monto: c.montoTotal.toString(), cuotas: c.cuotasTotales.toString(), tasaEA: card ? card.tasaEA : 0, esPagoDeuda: false, deudaDestinoId: '' });
        setErrorsVar({});
        varRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      const cancelarEdicion = () => {
        setGastoForm({ id: null, editSource: null, fecha: todayStr, descripcion: '', categoria: categoriasMaestras[0] || 'Otros', metodoPago: '', cuentaId: '', monto: '', cuotas: '', tasaEA: '', esPagoDeuda: false, deudaDestinoId: '' });
        setErrorsVar({});
      }

      const procesarPagoFijo = (pagoFijoId, cuentaId, montoFinal) => {
        if(!cuentaId) { showToast("Selecciona de dónde vas a pagar.", "error"); return; }
        const pf = pagosFijos.find(p => p.id === pagoFijoId);
        const fechaActual = new Date();
        const isCurrentMonth = selectedMonth === fechaActual.toISOString().slice(0, 7);
        const diaStr = isCurrentMonth ? fechaActual.getDate().toString().padStart(2, '0') : '01';
        const fechaPago = `${selectedMonth}-${diaStr}`; 
        
        let deudaIdDetectada = null;
        const posiblesDeudas = cuentas.filter(c => ['credit', 'loan'].includes(c.type));
        for (const pd of posiblesDeudas) {
            if (pf.descripcion.toLowerCase().includes(pd.name.toLowerCase()) || pf.categoria.toLowerCase().includes(pd.name.toLowerCase())) {
                deudaIdDetectada = pd.id; break;
            }
        }

        const nuevoEgreso = { 
          id: generateId(), fecha: fechaPago, descripcion: pf.descripcion, 
          categoria: pf.categoria, monto: Number(montoFinal) || pf.monto, 
          cuentaId: cuentaId, pagoFijoId: pf.id, tipo: 'Fijo',
          deudaId: deudaIdDetectada
        };
        addEgreso(nuevoEgreso);
        showToast(`Pago de ${pf.descripcion} registrado.`);
      };

      const avanzarCuota = (c) => {
        removeComprasCuotas(c.id);
        addComprasCuotas({ ...c, cuotasPagadas: c.cuotasPagadas + 1 });
        addEgreso({
            id: generateId(),
            fecha: getLocalToday(),
            descripcion: `Cuota ${c.cuotasPagadas + 1}/${c.cuotasTotales}: ${c.descripcion}`,
            categoria: 'Tarjeta de crédito',
            monto: c.valorMensual,
            cuentaId: c.tarjetaId,
            tipo: 'Variable',
            deudaId: c.tarjetaId
        });
        showToast("Cuota sumada y gasto registrado en el historial.");
      };

      // ✨ AQUÍ EL CAMBIO: Ordenamos cronológicamente de menor a mayor (Día 1 al 31)
      const egresosMes = egresos
        .filter(d => d.fecha.startsWith(selectedMonth))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      const pagosPendientes = pagosFijos.map(pf => {
        const egresoEsteMes = egresosMes.find(e => e.pagoFijoId === pf.id);
        return { ...pf, pagado: !!egresoEsteMes, egresoInfo: egresoEsteMes };
      }).sort((a, b) => a.pagado - b.pagado);

      const totalCompromisoCuotas = comprasCuotas.filter(c => c.cuotasPagadas < c.cuotasTotales).reduce((s, c) => s + c.valorMensual, 0);
      const cuentasPermitidasPago = cuentas.filter(c => ['bank', 'cash', 'credit'].includes(c.type)).map(c => ({value: c.id, label: c.name}));

      const cuentasFiltradas = useMemo(() => {
        if(gastoForm.metodoPago === 'cash') return cuentas.filter(c => c.type === 'cash');
        if(gastoForm.metodoPago === 'bank') return cuentas.filter(c => c.type === 'bank');
        if(gastoForm.metodoPago === 'credit') return cuentas.filter(c => c.type === 'credit');
        return [];
      }, [cuentas, gastoForm.metodoPago]);

      // --- IMPORTAR / EXPORTAR INDIVIDUAL DE EGRESOS ---
      const handleExport = async () => {
        try {
          const xlsx = await loadSheetJS();
          const wb = xlsx.utils.book_new();
          const headers = ["ID", "Fecha", "Descripcion", "Categoria", "Tipo", "Cuenta", "Monto", "DeudaPagada"];
          const data = egresos.map(e => ({ ID: e.id, Fecha: e.fecha, Descripcion: e.descripcion, Categoria: e.categoria, Tipo: e.tipo, Cuenta: cuentas.find(c=>c.id===e.cuentaId)?.name || e.cuentaId, Monto: e.monto, DeudaPagada: e.deudaId ? cuentas.find(c=>c.id===e.deudaId)?.name : '' }));
          
          const ws = xlsx.utils.json_to_sheet(data.length > 0 ? data : [{}], { header: headers });
          xlsx.utils.book_append_sheet(wb, ws, "Egresos");
          xlsx.writeFile(wb, `Egresos_Historial_${new Date().toISOString().split('T')[0]}.xlsx`);
          showToast("Historial de Egresos exportado con éxito.");
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
              const sheetName = wb.Sheets["Egresos"] ? "Egresos" : wb.SheetNames[0];
              const importedData = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
              let importados = 0;

              importedData.filter(i=>i.Monto).forEach(i => {
                  const fecha = i.Fecha || new Date().toISOString().split('T')[0];
                  const desc  = i.Descripcion || 'Egreso Importado';
                  const monto = Number(i.Monto) || 0;
                  const exists = egresos.some(ex => ex.fecha === fecha && ex.descripcion === desc && ex.monto === monto);
                  if (!exists) {
                      addEgreso({ id: i.ID || generateId(), fecha, descripcion: desc, categoria: i.Categoria || 'Otros', tipo: i.Tipo || 'Variable', monto, cuentaId: cuentas.find(c=>c.name===i.Cuenta)?.id || cuentas[0]?.id, deudaId: cuentas.find(c=>c.name===i.DeudaPagada)?.id || null });
                      importados++;
                  }
              });
              showToast(importados > 0 ? `Se importaron ${importados} egresos nuevos.` : "No hay egresos nuevos.");
            } catch(err) { showToast("Error procesando los datos del archivo.", "error"); }
          };
          reader.readAsBinaryString(file);
        } catch(err) { showToast("Error al abrir herramienta de Excel.", "error"); }
        e.target.value = '';
      };

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3"><Receipt className="text-rose-500 w-6 h-6 md:w-8 md:h-8" /> Egresos</h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">Tus gastos fijos y variables unificados.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-500/30"><Upload size={14}/> Importar Egresos</button>
              <button onClick={handleExport} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-500/30"><Download size={14}/> Exportar Egresos</button>
            </div>
          </header>

          <Card className={`border-t-4 ${gastoForm.id ? 'border-t-amber-500 bg-amber-950/10' : 'border-t-rose-500 bg-slate-900/80'}`}>
            <div className="flex justify-between items-center mb-4" ref={varRef}>
              <h2 className="text-lg font-semibold text-white">
                {gastoForm.id 
                  ? (gastoForm.editSource === 'cuotas' ? '✏️ Editar Compra a Cuotas' : '✏️ Editar Gasto Variable') 
                  : '1. Registrar Gasto o Compra a Cuotas'}
              </h2>
              {gastoForm.id && <button onClick={cancelarEdicion} className="text-xs text-amber-400 hover:underline">Cancelar Edición</button>}
            </div>
            <form onSubmit={guardarGasto} className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
              
              {gastoForm.editSource !== 'cuotas' && (
                <React.Fragment>
                  <Input type="date" label="Fecha" value={gastoForm.fecha} onChange={e=>setGastoForm({...gastoForm, fecha: e.target.value})} error={errorsVar.fecha} className="col-span-1 md:col-span-2"/>
                  <Select label="Categoría" options={categoriasMaestras.map(c=>({value:c, label:c}))} value={gastoForm.categoria} onChange={e=>setGastoForm({...gastoForm, categoria: e.target.value})} required className="col-span-1 md:col-span-2" />
                </React.Fragment>
              )}
              
              <Input label="Descripción del Gasto / Compra" placeholder="Ej: Supermercado o Televisor" value={gastoForm.descripcion} onChange={e=>setGastoForm({...gastoForm, descripcion: e.target.value})} error={errorsVar.descripcion} className={`col-span-2 ${gastoForm.editSource === 'cuotas' ? 'md:col-span-4' : 'md:col-span-3'}`} />
              
              <Select label="Método de pago" options={[{value: 'cash', label: 'Efectivo'}, {value: 'bank', label: 'Débito'}, {value: 'credit', label: 'Crédito'}]} value={gastoForm.metodoPago} onChange={handleMetodoChange} error={errorsVar.metodoPago} required className={`col-span-1 ${gastoForm.editSource === 'cuotas' ? 'md:col-span-3' : 'md:col-span-2'}`} />
              
              <Select label={gastoForm.metodoPago === 'credit' ? 'Tarjeta' : 'Cuenta / Bolsillo'} options={cuentasFiltradas.map(c=>({value:c.id, label:c.name}))} value={gastoForm.cuentaId} onChange={handleCuentaChange} error={errorsVar.cuentaId} disabled={!gastoForm.metodoPago} className={`col-span-1 ${gastoForm.editSource === 'cuotas' ? 'md:col-span-3' : 'md:col-span-2'}`} />
              
              <Input type="number" label="Monto ($)" value={gastoForm.monto} onChange={e=>setGastoForm({...gastoForm, monto: e.target.value})} error={errorsVar.monto} className={`col-span-2 ${gastoForm.editSource === 'cuotas' ? 'md:col-span-2' : 'md:col-span-1'}`} />

              {!isCreditCard && gastoForm.editSource !== 'cuotas' && (
                 <div className="col-span-2 md:col-span-12 flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
                      <input type="checkbox" checked={gastoForm.esPagoDeuda} onChange={(e) => setGastoForm({...gastoForm, esPagoDeuda: e.target.checked})} className="form-checkbox text-indigo-500 rounded border-slate-700 bg-slate-900" />
                      ¿Este gasto es el pago de un préstamo/tarjeta?
                    </label>
                    {gastoForm.esPagoDeuda && (
                        <Select label="¿Qué deuda estás pagando?" options={cuentas.filter(c=>['credit','loan'].includes(c.type)).map(c=>({value:c.id, label:c.name}))} value={gastoForm.deudaDestinoId} onChange={e=>setGastoForm({...gastoForm, deudaDestinoId: e.target.value})} error={errorsVar.deudaDestinoId} className="flex-1" />
                    )}
                 </div>
              )}

              {isCreditCard && (
                <div className="col-span-2 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg">
                  <Input type="number" label="Nº Cuotas" value={gastoForm.cuotas} onChange={e=>setGastoForm({...gastoForm, cuotas: e.target.value})} error={errorsVar.cuotas} className="col-span-1" />
                  <Input type="number" label="Tasa E.A. (%)" value={gastoForm.tasaEA} onChange={e=>setGastoForm({...gastoForm, tasaEA: e.target.value})} step="0.01" className="col-span-1 bg-slate-900" />
                  <div className="flex flex-col gap-1.5 col-span-2 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Valor Mensual</label>
                    <div className="bg-slate-950 border border-indigo-500 rounded-lg px-3 py-2.5 md:py-2 text-sm text-indigo-400 font-bold h-full flex items-center">
                      {formatCOP(Math.round(cuotaMensual))}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-2 md:col-span-12 mt-2 flex gap-2">
                <button type="submit" className={`flex-1 ${gastoForm.id ? 'bg-amber-600 hover:bg-amber-700' : (isCreditCard ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700')} text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors`}>
                  {gastoForm.id ? 'Actualizar Registro' : <><Plus size={18} /> Registrar {isCreditCard ? 'Compra a Cuotas' : 'Gasto'}</>}
                </button>
                {gastoForm.id && <button type="button" onClick={cancelarEdicion} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Cancelar</button>}
              </div>
            </form>
          </Card>

          {/* SECCIÓN 2: LISTA DE COMPRAS A CUOTAS */}
          <Card className="border-t-4 border-t-indigo-500 bg-slate-900/80">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart size={20} className="text-indigo-400"/> 
                2. Compras a Cuotas Activas
              </h2>
              <div className="flex gap-2 items-center">
                <p className="hidden md:block text-xs font-bold text-indigo-400 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/20">Compromiso Mensual Cuotas: {formatCOP(totalCompromisoCuotas)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comprasCuotas.filter(c => c.cuotasPagadas < c.cuotasTotales).map(c => {
                const progreso = (c.cuotasPagadas / c.cuotasTotales) * 100;
                return (
                  <div key={c.id} className={`bg-slate-950 border rounded-lg p-4 relative group transition-colors ${gastoForm.id === c.id && gastoForm.editSource === 'cuotas' ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'}`}>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => cargarParaEditarCuota(c)} className="text-slate-600 hover:text-indigo-400 p-1"><Edit3 size={14}/></button>
                      <button onClick={() => {removeComprasCuotas(c.id); showToast("Compra a cuotas eliminada");}} className="text-slate-600 hover:text-rose-400 p-1"><Trash2 size={14}/></button>
                    </div>
                    <p className="font-bold text-slate-200">{c.descripcion}</p>
                    <p className="text-[10px] text-indigo-400 mb-2">{cuentas.find(acc=>acc.id===c.tarjetaId)?.name}</p>
                    
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Pagadas: {c.cuotasPagadas}</span>
                      <span>Faltan: {c.cuotasTotales - c.cuotasPagadas}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{width: `${progreso}%`}}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-300">{formatCOP(c.valorMensual)}/mes</span>
                      <button onClick={() => avanzarCuota(c)} className="text-[10px] bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-2 py-1 rounded font-bold">+1 Pagada</button>
                    </div>
                  </div>
                )
              })}
              {comprasCuotas.filter(c => c.cuotasPagadas < c.cuotasTotales).length === 0 && <p className="text-slate-500 text-sm">No hay compras a cuotas activas.</p>}
            </div>
          </Card>

          {/* SECCIÓN 3: PAGOS FIJOS */}
          <div className="flex justify-between items-end mt-8">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><CheckSquare size={20} className="text-amber-400"/> 3. Pagos Fijos (Checklist de {selectedMonth})</h2>
          </div>

          {pagosFijos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagosPendientes.map(pf => {
                if (pf.pagado) {
                  return (
                    <div key={pf.id} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3 flex justify-between items-center opacity-70">
                      <div><p className="font-bold text-emerald-400 line-through">{pf.descripcion}</p><p className="text-[10px] text-emerald-500/70">Pagado con {cuentas.find(c=>c.id===pf.egresoInfo.cuentaId)?.name}</p></div>
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                  );
                }
                return <PagoFijoCard key={pf.id} pf={pf} cuentasPermitidas={cuentasPermitidasPago} onPay={(cuentaId, monto) => procesarPagoFijo(pf.id, cuentaId, monto)} />;
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4">No has configurado pagos fijos. Abre "Editar Plantillas Fijas" en la pestaña Presupuestos.</p>
          )}

          {/* SECCIÓN 4: TABLA DE HISTORIAL */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Historial Completo de Egresos (Fijos y Variables)</h3>
            </div>
            <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950">
                  <tr><th className="px-4 py-4 rounded-tl-lg">Fecha</th><th className="px-4 py-4">Descripción</th><th className="px-4 py-4">Categoría/Cuenta</th><th className="px-4 py-4 text-right">Monto</th><th className="px-4 py-4 rounded-tr-lg"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {egresosMes.map(g => (
                    <tr key={g.id} className={`transition-colors ${gastoForm.id === g.id && gastoForm.editSource === 'historial' ? 'bg-amber-900/20' : 'hover:bg-slate-800/20'}`}>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{g.fecha}</td>
                      <td className="px-4 py-3 text-slate-300 font-medium">
                        {g.descripcion}
                        {g.tipo === 'Fijo' && <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Fijo</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <span className="bg-slate-800 px-2 py-1 rounded-md text-xs block w-max mb-1">{g.categoria}</span>
                        <span className="text-[10px] text-indigo-400/80">Pagado con: {cuentas.find(c => c.id === g.cuentaId)?.name || '?'}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-400">{formatCOP(g.monto)}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button onClick={() => cargarParaEditarVariable(g)} className="text-slate-500 hover:text-indigo-400 p-1.5" title="Editar Gasto"><Edit3 size={16} /></button>
                        <button onClick={() => {removeEgreso(g.id); showToast("Gasto eliminado");}} className="text-slate-500 hover:text-rose-400 p-1.5" title="Eliminar"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {egresosMes.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-500">No hay egresos registrados este mes.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };
