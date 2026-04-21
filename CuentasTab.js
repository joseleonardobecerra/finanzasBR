const CuentasTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta,
                          transferencias, addTransferencia, removeTransferencia,
                          addEgreso, showToast }) => {
      const { useState, useRef } = React;
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
        <div key={c.id} className="flex justify-between items-center p-4 bg-[#111222] shadow-neumorph-inset rounded-xl border border-transparent hover:border-white/[0.05] transition-colors group">
          <div>
            <p className="text-sm font-black text-white tracking-wide">{c.name}</p>
            <p className="text-[10px] text-[#8A92A6] font-bold tracking-widest uppercase mt-0.5">Saldo real: {formatCOP(c.currentBalance)}</p>
          </div>
          <div className="text-right flex items-center gap-3">
            <p className={`text-base font-black tabular-nums ${colorClass}`}>{formatCOP(c.currentBalance)}</p>
            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => cargarParaEditar(c)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={16}/></button>
              <button onClick={() => { removeCuenta(c.id); showToast("Cuenta eliminada"); }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={16}/></button>
            </div>
          </div>
        </div>
      );

      // ✨ Helper para colores dinámicos basados en el valor
      const getValueColor = (val) => {
        if (val > 0) return 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]';
        if (val < 0) return 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]';
        return 'text-[#8A92A6]';
      };

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                   <Landmark className="text-[#0b0c16] w-5 h-5"/>
                </div>
                Cuentas y Transferencias
              </h1>
              <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
                Gestiona tu capital en bancos y traslados.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { limpiarFormCuenta(); setShowForm(!showForm); }} className="bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-glow-cyan active:scale-95">
                <Plus size={16} strokeWidth="3"/> {showForm ? 'OCULTAR' : 'NUEVA CUENTA'}
              </button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] shadow-neumorph">
                <Upload size={14}/> Importar
              </button>
              <button onClick={handleExport} className="bg-[#111222] hover:bg-[#1c1e32] text-amber-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)] shadow-neumorph">
                <Download size={14}/> Exportar
              </button>
            </div>
          </header>

          {/* ✨ ACTUALIZADO: TARJETAS DE RESUMEN DE LIQUIDEZ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Tarjeta Leo (Cyan Theme) */}
            <Card className="!border-transparent flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-neoncyan/10 blur-[50px] rounded-full pointer-events-none"></div>
              <h3 className="text-xs font-black text-neoncyan uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                <Wallet size={16}/> Liquidez Leo
              </h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3 rounded-xl border border-transparent">
                    <span className="text-[#8A92A6] font-bold">Cuentas (Bancos)</span>
                    <span className={`font-black tabular-nums ${getValueColor(leoBank)}`}>{formatCOP(leoBank)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3 rounded-xl border border-transparent">
                    <span className="text-[#8A92A6] font-bold">Efectivo</span>
                    <span className={`font-black tabular-nums ${getValueColor(leoCash)}`}>{formatCOP(leoCash)}</span>
                 </div>
                 <div className="flex justify-between items-center text-base pt-3 mt-1 px-1">
                    <span className="text-white font-black uppercase tracking-widest text-[11px]">Total Disponible</span>
                    <span className={`font-black text-lg tabular-nums ${getValueColor(leoBank + leoCash)}`}>{formatCOP(leoBank + leoCash)}</span>
                 </div>
              </div>
            </Card>

            {/* Tarjeta Andre (Magenta Theme) */}
            <Card className="!border-transparent flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-neonmagenta/10 blur-[50px] rounded-full pointer-events-none"></div>
              <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                <Wallet size={16}/> Liquidez Andre
              </h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3 rounded-xl border border-transparent">
                    <span className="text-[#8A92A6] font-bold">Cuentas (Bancos)</span>
                    <span className={`font-black tabular-nums ${getValueColor(andreBank)}`}>{formatCOP(andreBank)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3 rounded-xl border border-transparent">
                    <span className="text-[#8A92A6] font-bold">Efectivo</span>
                    <span className={`font-black tabular-nums ${getValueColor(andreCash)}`}>{formatCOP(andreCash)}</span>
                 </div>
                 <div className="flex justify-between items-center text-base pt-3 mt-1 px-1">
                    <span className="text-white font-black uppercase tracking-widest text-[11px]">Total Disponible</span>
                    <span className={`font-black text-lg tabular-nums ${getValueColor(andreBank + andreCash)}`}>{formatCOP(andreBank + andreCash)}</span>
                 </div>
              </div>
            </Card>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FORMULARIO CREAR/EDITAR CUENTA */}
            {showForm && (
              <Card className="lg:col-span-3 !border-neoncyan/30 shadow-glow-cyan relative overflow-hidden" ref={formRef}>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    {cuentaEdit.id ? <Edit3 size={16} className="text-neoncyan"/> : <Plus size={16} className="text-neoncyan"/>} 
                    {cuentaEdit.id ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}
                  </h2>
                  {cuentaEdit.id && (
                    <button onClick={limpiarFormCuenta} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-white transition-colors bg-rose-500/10 px-3 py-1.5 rounded-lg">
                      Cancelar Edición
                    </button>
                  )}
                </div>
                
                <form onSubmit={guardarCuenta} className="grid grid-cols-2 md:grid-cols-4 gap-5 items-end relative z-10 animate-in slide-in-from-top-4 fade-in duration-300">
                  <Input label="Nombre de la Cuenta" value={cuentaEdit.name} onChange={e=>setCuentaEdit({...cuentaEdit, name: e.target.value})} error={errors.name} className="col-span-2 md:col-span-1" placeholder="Ej. Ahorros Bancolombia" />
                  <Select label="Tipo de Cuenta" options={[{value:'bank', label:'🏦 Cuenta Ahorro'}, {value:'cash', label:'💵 Efectivo'}, {value:'pocket', label:'📈 Inversión / Bolsillo'}]} value={cuentaEdit.type} onChange={e=>setCuentaEdit({...cuentaEdit, type: e.target.value})} className="col-span-2 md:col-span-1" />
                  <div className="col-span-2 md:col-span-2 relative">
                    <Input type="number" label="Saldo Base/Inicial ($)" value={cuentaEdit.initialBalance} onChange={e=>setCuentaEdit({...cuentaEdit, initialBalance: e.target.value})} className="pl-10" placeholder="0" />
                    <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
                  </div>
                  <button type="submit" className="col-span-2 md:col-span-4 w-full bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] font-black py-4 rounded-xl text-sm transition-all shadow-glow-cyan active:scale-95 uppercase tracking-widest mt-2">
                    {cuentaEdit.id ? 'ACTUALIZAR DATOS' : 'GUARDAR NUEVA CUENTA'}
                  </button>
                </form>
              </Card>
            )}
            
            {/* LISTA DE CUENTAS DE AHORRO */}
            <div className="lg:col-span-2 flex flex-col">
              <Card className="flex-1 flex flex-col !border-transparent">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Landmark size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"/> 
                  Cuentas de Ahorro / Retiros
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32]">
                  {c_ahorros.map(c => renderCuentaCard(c, 'text-white'))}
                  {c_ahorros.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-sm text-[#8A92A6] font-bold">No hay cuentas bancarias o efectivo registrado.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* FORMULARIO DE TRASLADOS */}
            <div className="flex flex-col">
              <Card className="flex-1 !border-transparent bg-gradient-to-b from-[#111222] to-appcard">
                <h2 className="text-base font-black text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <ArrowRightLeft size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"/> 
                  Traslado de Fondos
                </h2>
                <p className="text-[10px] text-[#8A92A6] font-bold uppercase tracking-widest mb-6">
                  Mueve dinero sin afectar tus ingresos o egresos netos.
                </p>
                
                <form onSubmit={agregarTransferencia} className="space-y-5">
                  <Select 
                    label="Origen (Sale de)" 
                    options={cuentas.filter(c=>['bank','cash','credit','pocket'].includes(c.type)).map(c => ({value: c.id, label: `${c.type==='credit'?'💳':c.type==='cash'?'💵':c.type==='pocket'?'📈':'🏦'} ${c.name}`}))} 
                    value={nuevaTx.fromId} 
                    onChange={e=>setNuevaTx({...nuevaTx, fromId: e.target.value})} 
                    error={txErrors.fromId} 
                  />
                  <Select 
                    label="Destino (Entra a)" 
                    options={cuentas.filter(c=>['bank','cash'].includes(c.type)).map(c => ({value: c.id, label: `${c.type==='cash'?'💵':'🏦'} ${c.name}`}))} 
                    value={nuevaTx.toId} 
                    onChange={e=>setNuevaTx({...nuevaTx, toId: e.target.value})} 
                    error={txErrors.toId} 
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Input type="number" label="Monto ($)" value={nuevaTx.monto} onChange={e=>setNuevaTx({...nuevaTx, monto: e.target.value})} error={txErrors.monto} min="1" className="pl-8 font-black text-amber-400" placeholder="0" />
                      <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                    </div>
                    <Input type="date" label="Fecha" value={nuevaTx.fecha} onChange={e=>setNuevaTx({...nuevaTx, fecha: e.target.value})} error={txErrors.fecha} className="[&::-webkit-calendar-picker-indicator]:invert-[0.8]" />
                  </div>
                  
                  {esAvance && (
                    <div className="p-4 bg-neonmagenta/5 border border-neonmagenta/30 rounded-2xl shadow-neumorph-inset mt-2 animate-in fade-in zoom-in-95">
                      <p className="text-[10px] text-neonmagenta mb-3 font-black uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]">
                        <ShieldAlert size={14} strokeWidth="3" /> Detectado Avance Tarjeta
                      </p>
                      <Input type="number" label="Costo de transacción ($)" value={nuevaTx.costoAvance} onChange={e=>setNuevaTx({...nuevaTx, costoAvance: e.target.value})} required min="0" placeholder="Ej. 6500" />
                    </div>
                  )}
                  
                  <Input label="Descripción (Opcional)" placeholder="Ej: Traslado a bolsillo" value={nuevaTx.descripcion} onChange={e=>setNuevaTx({...nuevaTx, descripcion: e.target.value})} />
                  
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-[#0b0c16] font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 tracking-widest uppercase mt-4">
                    Registrar Traslado
                  </button>
                </form>
              </Card>
            </div>
            
          </div>
        </div>
      );
    };
