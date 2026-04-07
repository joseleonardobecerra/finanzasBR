const InversionesTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta,
                           ingresos, addIngreso,
                           egresos, transferencias, selectedMonth, showToast, getOwner }) => {
      const [showForm, setShowForm] = useState(false);
      const [editId, setEditId] = useState(null);
      const [editData, setEditData] = useState({});
      const [gananciaId, setGananciaId] = useState(null);
      const [gananciaMonto, setGananciaMonto] = useState('');
      const fileInputRef = useRef(null);
      
      const [nuevo, setNuevo] = useState({ name: '', initialBalance: '', tasaEA: '' });

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

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3"><PiggyBank className="text-emerald-400 w-6 h-6 md:w-8 md:h-8"/> Inversión y ahorro</h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">Sigue el crecimiento de tus cuentas de ahorro e inversiones.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setShowForm(!showForm); setEditId(null); setGananciaId(null); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus size={16}/> {showForm ? 'Ocultar' : 'Agregar'}
              </button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Upload size={14}/> Importar</button>
              <button onClick={handleExport} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"><Download size={14}/> Exportar</button>
            </div>
          </header>

          {showForm && (
            <Card className="border-t-4 border-t-emerald-500 bg-emerald-950/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-white">✨ Nueva Inversión o Ahorro</h2>
                <button onClick={() => setShowForm(false)} className="text-xs text-emerald-400 hover:underline">Cancelar</button>
              </div>
              <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <Input label="Nombre de la Cuenta" value={nuevo.name} onChange={e=>setNuevo({...nuevo, name: e.target.value})} className="col-span-2 md:col-span-2" />
                <Input type="number" label="Saldo Base/Inicial ($)" value={nuevo.initialBalance} onChange={e=>setNuevo({...nuevo, initialBalance: e.target.value})} className="col-span-1 md:col-span-1" />
                <Input type="number" step="0.01" label="Tasa E.A. (%)" value={nuevo.tasaEA} onChange={e=>setNuevo({...nuevo, tasaEA: e.target.value})} className="col-span-1 md:col-span-1" />
                <button type="submit" className="col-span-2 md:col-span-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-colors mt-2">Guardar Nueva Cuenta</button>
              </form>
            </Card>
          )}

          <Card className="border-t-4 border-t-emerald-500">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/50">
                  <tr>
                    <th className="px-3 py-3 rounded-tl-lg">CUENTA</th>
                    <th className="px-3 py-3 text-right">Saldo inicial mes</th>
                    <th className="px-3 py-3 text-right">Ganancia mes</th>
                    <th className="px-3 py-3 text-right">Saldo Total mes</th>
                    <th className="px-3 py-3 text-center">% E.A</th>
                    <th className="px-3 py-3 text-center rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tablaData.map(c => {
                    const isEditing = editId === c.id;
                    const isAddingGanancia = gananciaId === c.id;
                    const owner = getOwner(c.name);

                    if (isEditing) {
                       return (
                         <tr key={c.id} className="bg-emerald-950/40">
                           <td className="px-2 py-2"><input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="w-full bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Nombre" /></td>
                           <td className="px-2 py-2"><input type="number" value={editData.initialBalance} onChange={e=>setEditData({...editData, initialBalance: e.target.value})} className="w-full bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs text-white outline-none text-right" placeholder="Saldo Inicial Fijo" title="Ajusta el saldo base original" /></td>
                           <td className="px-2 py-2 text-right text-slate-500">-</td>
                           <td className="px-2 py-2 text-right text-slate-500">-</td>
                           <td className="px-2 py-2">
                              <input type="number" value={editData.tasaEA} onChange={e=>setEditData({...editData, tasaEA: e.target.value})} step="0.01" className="w-16 bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs text-white outline-none text-center mx-auto block" title="Tasa E.A." />
                           </td>
                           <td className="px-2 py-2 text-center flex justify-center gap-1">
                             <button onClick={saveEdit} className="text-emerald-400 p-1.5 bg-slate-900 rounded border border-slate-700 hover:border-emerald-500/50" title="Guardar Cambios"><Check size={14}/></button>
                             <button onClick={() => setEditId(null)} className="text-rose-400 p-1.5 bg-slate-900 rounded border border-slate-700 hover:border-rose-500/50" title="Cancelar"><Minus size={14}/></button>
                           </td>
                         </tr>
                       )
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-3 py-3 font-medium text-slate-200">
                           {c.name}
                           {owner !== 'Shared' && <span className="ml-2 text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{owner}</span>}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-300">{formatCOP(c.sInicial)}</td>
                        <td className="px-3 py-3 text-right font-bold text-emerald-400">
                           {isAddingGanancia ? (
                             <div className="flex justify-end gap-1 items-center">
                               <input type="number" value={gananciaMonto} onChange={e=>setGananciaMonto(e.target.value)} className="w-20 bg-slate-900 border border-emerald-500 rounded px-1 py-0.5 text-xs text-white outline-none text-right" autoFocus placeholder="Monto"/>
                               <button onClick={() => guardarGanancia(c)} className="text-emerald-400 hover:text-emerald-300 p-0.5 bg-slate-800 rounded"><Check size={14}/></button>
                               <button onClick={() => setGananciaId(null)} className="text-rose-400 hover:text-rose-300 p-0.5 bg-slate-800 rounded"><Minus size={14}/></button>
                             </div>
                           ) : (
                             <span className="cursor-pointer hover:underline flex items-center justify-end gap-1" onClick={()=>{setGananciaId(c.id); setEditId(null);}} title="Registrar Ganancia">
                               {c.ganancia > 0 ? `+ ${formatCOP(c.ganancia)}` : '$ -'}
                             </span>
                           )}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-slate-200">{formatCOP(c.saldoTotal)}</td>
                        <td className="px-3 py-3 text-center text-indigo-400 font-bold">{c.tasaEA}%</td>
                        <td className="px-3 py-3 text-center flex justify-center gap-2">
                          <button onClick={() => startEdit(c)} className="text-slate-400 hover:text-indigo-400 p-1 bg-slate-900 rounded transition-colors" title="Editar"><Edit3 size={14}/></button>
                          <button onClick={() => {removeCuenta(c.id); showToast("Cuenta eliminada");}} className="text-slate-400 hover:text-rose-400 p-1 bg-slate-900 rounded transition-colors" title="Eliminar"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-950 font-bold text-white border-t-2 border-slate-800">
                    <td className="px-3 py-4">TOTAL</td>
                    <td className="px-3 py-4 text-right">{formatCOP(totalSInicial)}</td>
                    <td className="px-3 py-4 text-right text-emerald-400">+ {formatCOP(totalGanancia)}</td>
                    <td className="px-3 py-4 text-right">{formatCOP(totalSaldoTotal)}</td>
                    <td className="px-3 py-4 text-center">-</td>
                    <td className="px-3 py-4 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      );
    };
