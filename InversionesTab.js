const InversionesTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta,
                           ingresos, addIngreso,
                           egresos, transferencias, selectedMonth, showToast, getOwner,
                           privacyMode // ✨ MODO PRIVACIDAD AÑADIDO A LAS PROPS
                         }) => {
      const { useState, useRef } = React;
      const [showForm, setShowForm] = useState(false);
      const [editId, setEditId] = useState(null);
      const [editData, setEditData] = useState({});
      const [gananciaId, setGananciaId] = useState(null);
      const [gananciaMonto, setGananciaMonto] = useState('');
      const fileInputRef = useRef(null);
      
      const [nuevo, setNuevo] = useState({ name: '', initialBalance: '', tasaEA: '' });

      // ✨ MODO PRIVACIDAD APLICADO
      const formatCOP = (val) => {
        if (privacyMode) return '****';
        return new Intl.NumberFormat('es-CO', { 
          style: 'currency', currency: 'COP', maximumFractionDigits: 0 
        }).format(val);
      };

      // ============================================================================
      // ÍCONOS SVG NATIVOS (Prevención de ReferenceError)
      // ============================================================================
      const CheckIcon = ({ size = 16, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
      );
      const XIcon = ({ size = 16, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      );

      const handleAdd = (e) => {
        e.preventDefault();
        if(!nuevo.name) return showToast("El nombre es obligatorio", "error");
        addCuenta({
          id: generateId(), name: nuevo.name, type: 'pocket',
          initialBalance: Number(nuevo.initialBalance) || 0,
          currentDebt: 0, limit: 0, tasaEA: Number(nuevo.tasaEA) || 0, cuotaMinima: 0
        });
        showToast("Cuenta de Inversión/Ahorro creada.");
        setShowForm(false);
        setNuevo({ name: '', initialBalance: '', tasaEA: '' });
      };

      const startEdit = (c) => {
        setEditId(c.id);
        setEditData({ name: c.name, initialBalance: c.initialBalance, tasaEA: c.tasaEA });
        setGananciaId(null);
      };

      const saveEdit = () => {
        if (!editData.name) return showToast("El nombre es obligatorio", "error");
        updateCuenta(editId, {
          name: editData.name,
          initialBalance: Number(editData.initialBalance) || 0,
          tasaEA: Number(editData.tasaEA) || 0
        });
        setEditId(null);
        showToast("Cuenta actualizada.");
      };

      const guardarGanancia = (c) => {
        if (!gananciaMonto || Number(gananciaMonto) <= 0) return;
        const fechaActual = new Date();
        const isCurrentMonth = selectedMonth === fechaActual.toISOString().slice(0, 7);
        const diaStr = isCurrentMonth ? fechaActual.getDate().toString().padStart(2, '0') : '28';
        const fechaIngreso = `${selectedMonth}-${diaStr}`; 

        addIngreso({
          id: generateId(),
          fecha: fechaIngreso,
          descripcion: `Rendimientos ${c.name}`,
          persona: getOwner(c.name) === 'Shared' ? '' : (getOwner(c.name) === 'Leo' ? 'L' : 'A'),
          tipo: 'Rendimiento',
          monto: Number(gananciaMonto),
          cuentaId: c.id
        });
        showToast(`Ganancia registrada en ${c.name}.`);
        setGananciaId(null);
        setGananciaMonto('');
      };

      const handleExport = async () => {
        try {
          const xlsx = await loadSheetJS();
          const wb = xlsx.utils.book_new();
          const headers = ["ID", "Nombre", "SaldoBase", "TasaEA"];
          const invCts = cuentas.filter(c => c.type === 'pocket' || (!['credit', 'loan'].includes(c.type) && c.tasaEA > 0));
          const data = invCts.map(c => ({ ID: c.id, Nombre: c.name, SaldoBase: c.initialBalance, TasaEA: c.tasaEA }));
          
          const ws = xlsx.utils.json_to_sheet(data.length > 0 ? data : [{}], { header: headers });
          xlsx.utils.book_append_sheet(wb, ws, "Inversiones");
          xlsx.writeFile(wb, `Inversiones_${new Date().toISOString().split('T')[0]}.xlsx`);
          showToast("Inversiones exportadas con éxito.");
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
              const sheetName = wb.Sheets["Inversiones"] ? "Inversiones" : wb.SheetNames[0];
              const importedData = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
              let importados = 0;

              importedData.forEach(i => {
                  if (i.Nombre && !cuentas.some(c => c.name === i.Nombre && c.type === 'pocket')) {
                      addCuenta({ id: i.ID || generateId(), name: i.Nombre, type: 'pocket', initialBalance: Number(i.SaldoBase) || 0, currentDebt: 0, limit: 0, tasaEA: Number(i.TasaEA) || 0, cuotaMinima: 0 });
                      importados++;
                  }
              });
              showToast(importados > 0 ? `Se importaron ${importados} inversiones.` : "No hay inversiones nuevas.");
            } catch(err) { showToast("Error procesando los datos del archivo.", "error"); }
          };
          reader.readAsBinaryString(file);
        } catch(err) { showToast("Error al abrir herramienta de Excel.", "error"); }
        e.target.value = '';
      };

      // ✨ INCLUIMOS EXPLÍCITAMENTE RAPPICUENTA EN ESTA PESTAÑA
      const invCuentas = cuentas.filter(c => !['credit', 'loan'].includes(c.type) && (c.type === 'pocket' || c.tasaEA > 0 || c.name.toLowerCase().includes('rappi')));

      const tablaData = invCuentas.map(c => {
         let sInicial = Number(c.initialBalance) || 0;
         ingresos.filter(i => i.cuentaId === c.id && i.fecha < `${selectedMonth}-01`).forEach(i => sInicial += i.monto);
         egresos.filter(e => e.cuentaId === c.id && e.fecha < `${selectedMonth}-01`).forEach(e => sInicial -= e.monto);
         transferencias.filter(t => t.fecha < `${selectedMonth}-01`).forEach(t => {
            if (t.toId === c.id) sInicial += t.monto;
            if (t.fromId === c.id) sInicial -= t.monto;
         });

         const ganancia = ingresos.filter(i => i.cuentaId === c.id && i.tipo === 'Rendimiento' && i.fecha.startsWith(selectedMonth)).reduce((sum, i) => sum + i.monto, 0);

         let variacionMes = 0;
         ingresos.filter(i => i.cuentaId === c.id && i.fecha.startsWith(selectedMonth)).forEach(i => variacionMes += i.monto);
         egresos.filter(e => e.cuentaId === c.id && e.fecha.startsWith(selectedMonth)).forEach(e => variacionMes -= e.monto);
         transferencias.filter(t => t.fecha.startsWith(selectedMonth)).forEach(t => {
            if (t.toId === c.id) variacionMes += t.monto;
            if (t.fromId === c.id) variacionMes -= t.monto;
         });

         const saldoTotal = sInicial + variacionMes;

         return { ...c, sInicial, ganancia, saldoTotal };
      });

      const totalSInicial = tablaData.reduce((s, c) => s + c.sInicial, 0);
      const totalGanancia = tablaData.reduce((s, c) => s + c.ganancia, 0);
      const totalSaldoTotal = tablaData.reduce((s, c) => s + c.saldoTotal, 0);

      const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 placeholder:text-slate-600";
      const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                   <PiggyBank className="text-[#0b0c16] w-5 h-5"/>
                </div>
                Inversión y ahorro
              </h1>
              <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">Sigue el crecimiento de tus cuentas de ahorro e inversiones.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { setShowForm(!showForm); setEditId(null); setGananciaId(null); }} className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95">
                <Plus size={16} strokeWidth="3"/> {showForm ? 'OCULTAR' : 'NUEVA CUENTA'}
              </button>
              
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 shadow-neumorph hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Upload size={14}/> Importar
              </button>
              <button onClick={handleExport} className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 shadow-neumorph hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Download size={14}/> Exportar
              </button>
            </div>
          </header>

          {showForm && (
            <Card className="!border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-4 animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                   <PiggyBank size={16}/> Nueva Inversión o Ahorro
                </h2>
                <button onClick={() => setShowForm(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                  Cerrar
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-5 items-end">
                <div className="col-span-2">
                  <label className={labelBaseClass}>Nombre de la Cuenta</label>
                  <input type="text" required value={nuevo.name} onChange={e=>setNuevo({...nuevo, name: e.target.value})} className={inputBaseClass} placeholder="Ej. Ficción, CDT..." />
                </div>
                
                <div className="col-span-1 relative">
                  <label className={labelBaseClass}>Saldo Base/Inicial</label>
                  <input type="number" value={nuevo.initialBalance} onChange={e=>setNuevo({...nuevo, initialBalance: e.target.value})} className={`${inputBaseClass} pl-8`} placeholder="0" />
                  <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                </div>
                
                <div className="col-span-1 relative">
                  <label className={labelBaseClass}>Tasa E.A. (%)</label>
                  <input type="number" step="0.01" value={nuevo.tasaEA} onChange={e=>setNuevo({...nuevo, tasaEA: e.target.value})} className={`${inputBaseClass} pr-8 font-bold text-amber-400`} placeholder="0.0" />
                  <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
                </div>
                
                <div className="col-span-2 md:col-span-4 mt-2 flex justify-end">
                  <button type="submit" className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95">
                    GUARDAR NUEVA CUENTA
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card className="!border-transparent flex flex-col">
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"/> 
              Portafolio de Inversiones
            </h2>
            
            <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-4 w-[25%]">CUENTA</th>
                    <th className="px-5 py-4 w-[20%] text-right">Saldo inicial mes</th>
                    <th className="px-5 py-4 w-[15%] text-right">Ganancia mes</th>
                    <th className="px-5 py-4 w-[20%] text-right">Saldo Total mes</th>
                    <th className="px-5 py-4 w-[10%] text-center">% E.A</th>
                    <th className="px-5 py-4 w-[10%] text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {tablaData.map(c => {
                    const isEditing = editId === c.id;
                    const isAddingGanancia = gananciaId === c.id;

                    if (isEditing) {
                       return (
                         <tr key={c.id} className="bg-emerald-950/20">
                           <td className="px-3 py-3"><input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="w-full bg-[#111222] border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none shadow-neumorph-inset focus:border-emerald-500" placeholder="Nombre" /></td>
                           <td className="px-3 py-3"><input type="number" value={editData.initialBalance} onChange={e=>setEditData({...editData, initialBalance: e.target.value})} className="w-full bg-[#111222] border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none text-right shadow-neumorph-inset focus:border-emerald-500" placeholder="Saldo Inicial" title="Ajusta el saldo base original" /></td>
                           <td className="px-3 py-3 text-right text-slate-500">-</td>
                           <td className="px-3 py-3 text-right text-slate-500">-</td>
                           <td className="px-3 py-3">
                              <input type="number" value={editData.tasaEA} onChange={e=>setEditData({...editData, tasaEA: e.target.value})} step="0.01" className="w-20 bg-[#111222] border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-amber-400 font-bold outline-none text-center mx-auto block shadow-neumorph-inset focus:border-amber-500" title="Tasa E.A." />
                           </td>
                           <td className="px-3 py-3 text-center flex justify-center gap-2">
                             <button onClick={saveEdit} className="text-[#0b0c16] p-2 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(52,211,153,0.5)]" title="Guardar Cambios"><CheckIcon size={14}/></button>
                             <button onClick={() => setEditId(null)} className="text-rose-400 p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/30" title="Cancelar"><XIcon size={14}/></button>
                           </td>
                         </tr>
                       )
                    }

                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-bold text-white tracking-wide">
                           {c.name}
                        </td>
                        <td className="px-5 py-4 text-right text-[#8A92A6] tabular-nums">{formatCOP(c.sInicial)}</td>
                        <td className="px-5 py-4 text-right font-black text-emerald-400 tabular-nums">
                           {isAddingGanancia ? (
                             <div className="flex justify-end gap-2 items-center">
                               <div className="relative">
                                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">$</span>
                                 <input type="number" value={gananciaMonto} onChange={e=>setGananciaMonto(e.target.value)} className="w-24 bg-[#111222] border border-emerald-500/50 shadow-neumorph-inset rounded-lg pl-6 pr-2 py-1 text-xs text-white outline-none text-right focus:border-emerald-400" autoFocus placeholder="Monto"/>
                               </div>
                               <button onClick={() => guardarGanancia(c)} className="text-[#0b0c16] bg-emerald-400 hover:bg-emerald-300 p-1.5 rounded-md shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-colors"><CheckIcon size={14}/></button>
                               <button onClick={() => setGananciaId(null)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-md transition-colors"><XIcon size={14}/></button>
                             </div>
                           ) : (
                             <span className="cursor-pointer hover:text-white flex items-center justify-end gap-1.5 transition-colors" onClick={()=>{setGananciaId(c.id); setEditId(null);}} title="Registrar Ganancia">
                               {c.ganancia > 0 ? <><span className="text-[10px] text-emerald-500 font-bold">+</span> {formatCOP(c.ganancia)}</> : <span className="text-slate-500 hover:text-emerald-400">+$ 0</span>}
                             </span>
                           )}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-white tabular-nums">{formatCOP(c.saldoTotal)}</td>
                        <td className="px-5 py-4 text-center text-amber-400 font-bold tabular-nums">{c.tasaEA}%</td>
                        <td className="px-5 py-4 text-center flex justify-center gap-3">
                          <button onClick={() => startEdit(c)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={16}/></button>
                          
                          {/* ✨ Botón de Eliminar directo y funcionando */}
                          <button onClick={() => {
                            if(window.confirm(`¿Estás seguro de que quieres eliminar la inversión "${c.name}"?`)) {
                               removeCuenta(c.id); 
                               showToast("Inversión eliminada", "error");
                            }
                          }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                        
                        </td>
                      </tr>
                    );
                  })}
                  {invCuentas.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-10 text-center text-[#8A92A6] font-bold italic">No hay cuentas de inversión o bolsillos registrados.</td></tr>
                  )}
                  {invCuentas.length > 0 && (
                    <tr className="bg-[#0b0c16]/50 font-black text-white border-t border-white/[0.05]">
                      <td className="px-5 py-5 uppercase tracking-widest text-[11px] text-[#8A92A6]">TOTAL PORTAFOLIO</td>
                      <td className="px-5 py-5 text-right tabular-nums">{formatCOP(totalSInicial)}</td>
                      <td className="px-5 py-5 text-right text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] tabular-nums">+ {formatCOP(totalGanancia)}</td>
                      <td className="px-5 py-5 text-right tabular-nums">{formatCOP(totalSaldoTotal)}</td>
                      <td colSpan="2" className="px-5 py-5 text-center"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      );
    };
