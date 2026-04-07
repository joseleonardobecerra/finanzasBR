const CuentasTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta,
                          transferencias, addTransferencia, removeTransferencia,
                          addEgreso, showToast }) => {
      const [cuentaEdit, setCuentaEdit] = useState({ id: null, name: '', type: 'bank', initialBalance: '', initialDebt: '', limit: '', tasaEA: '', cuotaMinima: '' });
      const [nuevaTx, setNuevaTx] = useState({ fecha: getLocalToday(), fromId: '', toId: '', monto: '', costoAvance: '0', descripcion: '' });
      const [errors, setErrors] = useState({});
      const [txErrors, setTxErrors] = useState({});
      const [showForm, setShowForm] = useState(false);
      const formRef = useRef(null);
      const fileInputRef = useRef(null);

      // --- CÁLCULOS DE LIQUIDEZ POR PERSONA ---
      const identifyOwner = (name) => {
        const t = (name || '').toUpperCase();
        const hasL = t.includes('LEO') || t.endsWith(' L') || t.includes(' L ');
        const hasA = t.includes('ANDRE') || t.includes('ANDRÉ') || t.endsWith(' A') || t.includes(' A ');
        if (hasL && !hasA) return 'Leo';
        if (hasA && !hasL) return 'Andre';
        return 'Shared';
      };

      let leoBank = 0, leoCash = 0;
      let andreBank = 0, andreCash = 0;

      cuentas.forEach(c => {
        if (!['bank', 'cash'].includes(c.type) || c.name.toLowerCase().includes('rappi')) return;
        const owner = identifyOwner(c.name);
        if (owner === 'Leo') {
            if (c.type === 'cash') leoCash += c.currentBalance;
            else leoBank += c.currentBalance;
        } else if (owner === 'Andre') {
            if (c.type === 'cash') andreCash += c.currentBalance;
            else andreBank += c.currentBalance;
        }
      });

      const guardarCuenta = (e) => {
        e.preventDefault();
        let errs = {};
        if (!cuentaEdit.name) errs.name = "Obligatorio";
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        const baseData = {
          name: cuentaEdit.name, type: cuentaEdit.type,
          initialBalance: Number(cuentaEdit.initialBalance) || 0,
          initialDebt: Number(cuentaEdit.initialDebt) || 0,
          limit: Number(cuentaEdit.limit) || 0,
          cuotaMinima: Number(cuentaEdit.cuotaMinima) || 0,
          tasaEA: Number(cuentaEdit.tasaEA) || 0,
        };

        if (cuentaEdit.id) {
          updateCuenta(cuentaEdit.id, baseData);
          showToast("Cuenta actualizada correctamente.");
        } else {
          addCuenta({ id: generateId(), ...baseData });
          showToast("Cuenta creada correctamente.");
        }
        limpiarFormCuenta();
      };

      const limpiarFormCuenta = () => {
        setCuentaEdit({ id: null, name: '', type: 'bank', initialBalance: '', initialDebt: '', limit: '', tasaEA: '', cuotaMinima: '' });
        setErrors({});
        setShowForm(false);
      };

      const cargarParaEditar = (c) => {
        setCuentaEdit({ id: c.id, name: c.name, type: c.type, initialBalance: c.initialBalance, initialDebt: c.currentDebt, limit: c.limit, tasaEA: c.tasaEA, cuotaMinima: c.cuotaMinima });
        setErrors({});
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      };

      const agregarTransferencia = (e) => {
        e.preventDefault();
        let errs = {};
        if (!nuevaTx.fromId) errs.fromId = "Obligatorio";
        if (!nuevaTx.toId)   errs.toId   = "Obligatorio";
        if (!nuevaTx.monto)  errs.monto  = "Obligatorio";
        if (!nuevaTx.fecha)  errs.fecha  = "Obligatorio";
        if (nuevaTx.fromId === nuevaTx.toId && nuevaTx.fromId) errs.toId = "Destino debe ser distinto al origen";
        if (Object.keys(errs).length > 0) { setTxErrors(errs); return; }

        addTransferencia({ ...nuevaTx, id: generateId(), monto: Number(nuevaTx.monto) });
        if (Number(nuevaTx.costoAvance) > 0) {
          addEgreso({ id: generateId(), fecha: nuevaTx.fecha, descripcion: `Comisión Transferencia: ${nuevaTx.descripcion}`, categoria: 'Otros', tipo: 'Variable', monto: Number(nuevaTx.costoAvance), cuentaId: nuevaTx.fromId });
          showToast("Transferencia y comisión registradas.");
        } else {
          showToast("Transferencia registrada exitosamente.");
        }
        setNuevaTx({ fecha: getLocalToday(), fromId: '', toId: '', monto: '', costoAvance: '0', descripcion: '' });
        setTxErrors({});
      };

      // --- EXPORTAR ---
      const handleExport = async () => {
        try {
          const xlsx = await loadSheetJS();
          const wb = xlsx.utils.book_new();
          const dataCuentas = cuentas.filter(c => ['bank','cash'].includes(c.type)).map(c => ({ ID: c.id, Nombre: c.name, Tipo: c.type, SaldoBase: c.initialBalance }));
          xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(dataCuentas.length > 0 ? dataCuentas : [{}], { header: ["ID","Nombre","Tipo","SaldoBase"] }), "Cuentas_Bancos");
          const dataTrans = transferencias.map(t => ({ ID: t.id, Fecha: t.fecha, Origen: cuentas.find(c=>c.id===t.fromId)?.name||'', Destino: cuentas.find(c=>c.id===t.toId)?.name||'', Monto: t.monto, CostoAvance: t.costoAvance||0, Descripcion: t.descripcion }));
          xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(dataTrans.length > 0 ? dataTrans : [{}], { header: ["ID","Fecha","Origen","Destino","Monto","CostoAvance","Descripcion"] }), "Transferencias");
          xlsx.writeFile(wb, `Cuentas_y_Transferencias_${new Date().toISOString().split('T')[0]}.xlsx`);
          showToast("Exportadas con éxito.");
        } catch(e) { showToast("Error al exportar.", "error"); }
      };

      // --- IMPORTAR ---
      const handleImport = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const xlsx = await loadSheetJS();
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const wb = xlsx.read(evt.target.result, { type: 'binary' });
              let importados = 0;
              if (wb.Sheets["Cuentas_Bancos"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Cuentas_Bancos"]).forEach(i => {
                  if (i.Nombre && !cuentas.find(c => c.name === i.Nombre && ['bank','cash'].includes(c.type))) {
                    addCuenta({ id: i.ID || generateId(), name: i.Nombre, type: i.Tipo || 'bank', initialBalance: Number(i.SaldoBase)||0, initialDebt:0, limit:0, tasaEA:0, cuotaMinima:0 });
                    importados++;
                  }
                });
              }
              if (wb.Sheets["Transferencias"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Transferencias"]).forEach(i => {
                  if (i.Monto && !transferencias.find(t => t.fecha === i.Fecha && t.monto === Number(i.Monto) && t.descripcion === i.Descripcion)) {
                    addTransferencia({ id: i.ID || generateId(), fecha: i.Fecha || getLocalToday(), fromId: cuentas.find(c=>c.name===i.Origen)?.id || cuentas[0]?.id, toId: cuentas.find(c=>c.name===i.Destino)?.id || cuentas[1]?.id, monto: Number(i.Monto)||0, costoAvance: Number(i.CostoAvance)||0, descripcion: i.Descripcion || '' });
                    importados++;
                  }
                });
              }
              showToast(importados > 0 ? `Se importaron ${importados} registros.` : "No se encontraron registros nuevos.");
            } catch(err) { showToast("Error procesando el archivo.", "error"); }
          };
          reader.readAsBinaryString(file);
        } catch(err) { showToast("Error al abrir herramienta de Excel.", "error"); }
        e.target.value = '';
      };

      const tipoOrigen  = cuentas.find(c=>c.id===nuevaTx.fromId)?.type;
      const tipoDestino = cuentas.find(c=>c.id===nuevaTx.toId)?.type;
      const esAvance    = tipoOrigen === 'credit' && ['bank','cash'].includes(tipoDestino);
      
      // Excluyendo rappicuenta de la vista principal de ahorros
      const c_ahorros   = cuentas.filter(c => ['bank', 'cash'].includes(c.type) && !c.name.toLowerCase().includes('rappi'));

      const renderCuentaCard = (c, colorClass) => (
        <div key={c.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-200">{c.name}</p>
            <p className="text-[10px] text-slate-500">Saldo real: {formatCOP(c.currentBalance)}</p>
          </div>
          <div className="text-right flex items-center gap-2 md:gap-3">
            <p className={`text-sm font-bold ${colorClass}`}>{formatCOP(c.currentBalance)}</p>
            <button onClick={() => cargarParaEditar(c)} className="text-slate-600 hover:text-indigo-400 p-1"><Edit3 size={14}/></button>
            <button onClick={() => { removeCuenta(c.id); showToast("Cuenta eliminada"); }} className="text-slate-600 hover:text-rose-400 p-1"><Trash2 size={14}/></button>
          </div>
        </div>
      );

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3"><Landmark className="text-indigo-400 w-6 h-6 md:w-8 md:h-8"/> Cuentas y Transferencias</h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">Gestiona tu capital en bancos y traslados.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { limpiarFormCuenta(); setShowForm(!showForm); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus size={16}/> {showForm ? 'Ocultar' : 'Agregar Cuenta'}
              </button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Upload size={14}/> Importar</button>
              <button onClick={handleExport} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Download size={14}/> Exportar</button>
            </div>
          </header>

          {/* ✨ NUEVO: TARJETAS DE RESUMEN DE LIQUIDEZ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta Leo */}
            <Card className="border-t-4 border-t-emerald-500 flex flex-col justify-between bg-slate-900/80">
              <h3 className="text-sm font-bold text-emerald-500 uppercase mb-3 flex items-center gap-2"><Wallet size={16}/> Liquidez Leo</h3>
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Cuentas (Bancos)</span>
                    <span className="font-bold text-slate-200">{formatCOP(leoBank)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Efectivo</span>
                    <span className="font-bold text-slate-200">{formatCOP(leoCash)}</span>
                 </div>
                 <div className="flex justify-between items-center text-base border-t border-slate-800 pt-2 mt-2">
                    <span className="text-slate-300 font-bold uppercase text-xs">Total Disponible</span>
                    <span className="font-black text-emerald-400">{formatCOP(leoBank + leoCash)}</span>
                 </div>
              </div>
            </Card>

            {/* Tarjeta Andre */}
            <Card className="border-t-4 border-t-rose-500 flex flex-col justify-between bg-slate-900/80">
              <h3 className="text-sm font-bold text-rose-500 uppercase mb-3 flex items-center gap-2"><Wallet size={16}/> Liquidez Andre</h3>
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Cuentas (Bancos)</span>
                    <span className="font-bold text-slate-200">{formatCOP(andreBank)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Efectivo</span>
                    <span className="font-bold text-slate-200">{formatCOP(andreCash)}</span>
                 </div>
                 <div className="flex justify-between items-center text-base border-t border-slate-800 pt-2 mt-2">
                    <span className="text-slate-300 font-bold uppercase text-xs">Total Disponible</span>
                    <span className="font-black text-rose-400">{formatCOP(andreBank + andreCash)}</span>
                 </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {showForm && (
              <Card className="lg:col-span-3 border-t-4 border-t-indigo-500 bg-indigo-950/10 mb-2">
                <div className="flex justify-between items-center mb-4" ref={formRef}>
                  <h2 className="text-base font-semibold text-white">{cuentaEdit.id ? '✏️ Editar Cuenta' : '✨ Crear Nueva Cuenta'}</h2>
                  {cuentaEdit.id && <button onClick={limpiarFormCuenta} className="text-xs text-indigo-400 hover:underline">Cancelar Edición</button>}
                </div>
                <form onSubmit={guardarCuenta} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <Input label="Nombre" value={cuentaEdit.name} onChange={e=>setCuentaEdit({...cuentaEdit, name: e.target.value})} error={errors.name} className="col-span-2 md:col-span-1" />
                  <Select label="Tipo" options={[{value:'bank', label:'Cuenta Ahorro'}, {value:'cash', label:'Efectivo'}, {value:'pocket', label:'Inversión / Bolsillo'}]} value={cuentaEdit.type} onChange={e=>setCuentaEdit({...cuentaEdit, type: e.target.value})} className="col-span-2 md:col-span-1" />
                  <Input type="number" label="Saldo Base/Inicial ($)" value={cuentaEdit.initialBalance} onChange={e=>setCuentaEdit({...cuentaEdit, initialBalance: e.target.value})} className="col-span-2 md:col-span-2" />
                  <button type="submit" className="col-span-2 md:col-span-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors mt-2">{cuentaEdit.id ? 'Actualizar Datos' : 'Guardar Nueva Cuenta'}</button>
                </form>
              </Card>
            )}
            
            <div className="lg:col-span-2 grid grid-cols-1 gap-4">
              <Card>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Landmark size={16}/> Cuentas de Ahorro / Retiros</h3>
                <div className="space-y-2">{c_ahorros.map(c=>renderCuentaCard(c, 'text-emerald-400'))}</div>
                {c_ahorros.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay cuentas bancarias o efectivo registrado.</p>}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-t-4 border-t-amber-500">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2"><ArrowRightLeft size={16} className="text-amber-400"/> Traslado de Fondos</h2>
                <p className="text-xs text-slate-400 mb-4">Mueve dinero de una cuenta a otra.</p>
                <form onSubmit={agregarTransferencia} className="space-y-3">
                  <Select label="Origen (Sale de)" options={cuentas.filter(c=>['bank','cash','credit'].includes(c.type)).map(c => ({value: c.id, label: c.name}))} value={nuevaTx.fromId} onChange={e=>setNuevaTx({...nuevaTx, fromId: e.target.value})} error={txErrors.fromId} />
                  <Select label="Destino (Entra a)" options={cuentas.filter(c=>['bank','cash'].includes(c.type)).map(c => ({value: c.id, label: c.name}))} value={nuevaTx.toId} onChange={e=>setNuevaTx({...nuevaTx, toId: e.target.value})} error={txErrors.toId} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" label="Monto ($)" value={nuevaTx.monto} onChange={e=>setNuevaTx({...nuevaTx, monto: e.target.value})} error={txErrors.monto} min="1" />
                    <Input type="date" label="Fecha" value={nuevaTx.fecha} onChange={e=>setNuevaTx({...nuevaTx, fecha: e.target.value})} error={txErrors.fecha} />
                  </div>
                  {esAvance && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                      <p className="text-[10px] text-rose-400 mb-2 font-bold uppercase">Detectado Avance desde Tarjeta</p>
                      <Input type="number" label="Costo de transacción ($)" value={nuevaTx.costoAvance} onChange={e=>setNuevaTx({...nuevaTx, costoAvance: e.target.value})} required min="0" />
                    </div>
                  )}
                  <Input label="Descripción (Opcional)" placeholder="Ej: Traslado a bolsillo" value={nuevaTx.descripcion} onChange={e=>setNuevaTx({...nuevaTx, descripcion: e.target.value})} />
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">Registrar Traslado</button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      );
    };
