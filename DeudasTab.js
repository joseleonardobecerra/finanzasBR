const DeudasTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta, showToast, egresos }) => {
  const { useState, useRef } = React;
  const [showNewCard, setShowNewCard] = useState(false);
  const [showNewLoan, setShowNewLoan] = useState(false);
  
  const [newCardData, setNewCardData] = useState({ name: '', limit: '', initialDebt: '', tasaEA: '', cuotaMinima: '' });
  const [newLoanData, setNewLoanData] = useState({ name: '', montoPrestado: '', initialDebt: '', totalPagadoPrevio: '', tasaEA: '', cuotaMinima: '', cuotasTotales: '', cuotasPagadas: '', hasIBR: false, ibrValue: '', ibrPuntos: '' });
  
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);

  const deudasAnalizadas = cuentas
    .filter(c => ['credit', 'loan'].includes(c.type))
    .map(d => {
      const tasaMes = getTasaMensual(d.tasaEA);
      const interesMes = d.currentDebt * tasaMes;
      return { ...d, tasaMes, interesMes };
    })
    .sort((a, b) => b.tasaEA - a.tasaEA);

  // ✨ CÁLCULOS PARA LA FILA DE TOTALES DE TARJETAS
  const todasLasTC = deudasAnalizadas.filter(d => d.type === 'credit');
  const totalCupoTC = todasLasTC.reduce((sum, d) => sum + (Number(d.limit) || 0), 0);
  const totalDeudaTC = todasLasTC.reduce((sum, d) => sum + (Number(d.currentDebt) || 0), 0);
  const totalDispTC = todasLasTC.reduce((sum, d) => sum + Math.max(0, (Number(d.limit) || 0) - (Number(d.currentDebt) || 0)), 0);

  const handleAddCard = (e) => {
    e.preventDefault();
    if(!newCardData.name) return showToast("El nombre es obligatorio", "error");

    addCuenta({
      id: generateId(), name: newCardData.name, type: 'credit',
      initialBalance: 0, initialDebt: Number(newCardData.initialDebt) || 0,
      limit: Number(newCardData.limit) || 0, cuotaMinima: Number(newCardData.cuotaMinima) || 0,
      tasaEA: Number(newCardData.tasaEA) || 0
    });
    showToast("Tarjeta creada correctamente.");
    setShowNewCard(false);
    setNewCardData({ name: '', limit: '', initialDebt: '', tasaEA: '', cuotaMinima: '' });
  };

  const handleAddLoan = (e) => {
    e.preventDefault();
    if(!newLoanData.name) return showToast("El nombre es obligatorio", "error");

    let tasaFinal = Number(newLoanData.tasaEA) || 0;
    if(newLoanData.hasIBR) {
        const namv = Number(newLoanData.ibrValue) + Number(newLoanData.ibrPuntos);
        tasaFinal = (Math.pow(1 + (namv/100)/12, 12) - 1) * 100;
    }

    addCuenta({
      id: generateId(), name: newLoanData.name, type: 'loan', initialBalance: 0,
      montoPrestado: Number(newLoanData.montoPrestado) || 0, initialDebt: Number(newLoanData.initialDebt) || 0,
      totalPagadoPrevio: Number(newLoanData.totalPagadoPrevio) || 0, tasaEA: tasaFinal,
      cuotaMinima: Number(newLoanData.cuotaMinima) || 0, cuotasTotales: Number(newLoanData.cuotasTotales) || 0,
      cuotasPagadas: Number(newLoanData.cuotasPagadas) || 0, hasIBR: newLoanData.hasIBR,
      ibrValue: Number(newLoanData.ibrValue) || 0, ibrPuntos: Number(newLoanData.ibrPuntos) || 0
    });
    showToast("Préstamo creado.");
    setShowNewLoan(false);
    setNewLoanData({ name: '', montoPrestado: '', initialDebt: '', totalPagadoPrevio: '', tasaEA: '', cuotaMinima: '', cuotasTotales: '', cuotasPagadas: '', hasIBR: false, ibrValue: '', ibrPuntos: '' });
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setEditData({ ...c, montoPrestado: c.montoPrestado || c.initialDebt || 0, totalPagadoPrevio: c.totalPagadoPrevio || 0, ibrValue: c.ibrValue || 0, ibrPuntos: c.ibrPuntos || 0 });
  };

  const saveInlineEdit = () => {
    if (!editData.name) return showToast("El nombre es obligatorio", "error");
    
    let dataToSave = { ...editData };
    if (dataToSave.type === 'loan' && dataToSave.hasIBR) {
        const namv = Number(dataToSave.ibrValue) + Number(dataToSave.ibrPuntos);
        dataToSave.tasaEA = (Math.pow(1 + (namv/100)/12, 12) - 1) * 100;
    }

    updateCuenta(editId, {
        name: dataToSave.name, limit: Number(dataToSave.limit) || 0,
        initialDebt: Number(dataToSave.initialDebt) || 0, montoPrestado: Number(dataToSave.montoPrestado) || 0,
        totalPagadoPrevio: Number(dataToSave.totalPagadoPrevio) || 0, tasaEA: Number(dataToSave.tasaEA) || 0,
        cuotaMinima: Number(dataToSave.cuotaMinima) || 0, cuotasTotales: Number(dataToSave.cuotasTotales) || 0,
        cuotasPagadas: Number(dataToSave.cuotasPagadas) || 0, hasIBR: dataToSave.hasIBR || false,
        ibrValue: Number(dataToSave.ibrValue) || 0, ibrPuntos: Number(dataToSave.ibrPuntos) || 0
    });
    setEditId(null);
    showToast("Registro actualizado correctamente.");
  };

  const actualizarCampo = (id, field, val) => updateCuenta(id, { [field]: Number(val) });
  
  const actualizarIBR = (id, ibrValue, ibrPuntos) => {
    const val = Number(ibrValue); const pts = Number(ibrPuntos); const namv = val + pts;
    const nuevaEA = (Math.pow(1 + (namv/100)/12, 12) - 1) * 100;
    updateCuenta(id, { ibrValue: val, ibrPuntos: pts, tasaEA: nuevaEA });
  };

  const handleExport = async () => {
    try {
      const xlsx = await loadSheetJS();
      const wb = xlsx.utils.book_new();
      const headers = ["ID", "Nombre", "Tipo", "DeudaInicial", "Limite", "MontoPrestado", "TasaEA", "CuotaMinima", "CuotasTotales", "CuotasPagadas"];
      const data = cuentas.filter(c => ['credit', 'loan'].includes(c.type)).map(c => ({
          ID: c.id, Nombre: c.name, Tipo: c.type, DeudaInicial: c.initialDebt, Limite: c.limit, 
          MontoPrestado: c.montoPrestado || '', TasaEA: c.tasaEA, CuotaMinima: c.cuotaMinima, 
          CuotasTotales: c.cuotasTotales || '', CuotasPagadas: c.cuotasPagadas || ''
      }));
      const ws = xlsx.utils.json_to_sheet(data.length > 0 ? data : [{}], { header: headers });
      xlsx.utils.book_append_sheet(wb, ws, "Deudas");
      xlsx.writeFile(wb, `Deudas_y_Prestamos_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("Deudas exportadas con éxito.");
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
          const sheetName = wb.Sheets["Deudas"] ? "Deudas" : wb.SheetNames[0];
          const importedData = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
          let importados = 0;

          importedData.forEach(i => {
              if(i.Nombre && (i.Tipo === 'credit' || i.Tipo === 'loan')) {
                  const exists = cuentas.some(c => c.name === i.Nombre && c.type === i.Tipo);
                  if (!exists) {
                      addCuenta({
                          id: i.ID || generateId(), name: i.Nombre, type: i.Tipo,
                          initialBalance: 0, currentDebt: Number(i.DeudaInicial) || 0, initialDebt: Number(i.DeudaInicial) || 0,
                          limit: Number(i.Limite) || 0, montoPrestado: Number(i.MontoPrestado) || 0,
                          tasaEA: Number(i.TasaEA) || 0, cuotaMinima: Number(i.CuotaMinima) || 0,
                          cuotasTotales: Number(i.CuotasTotales) || 0, cuotasPagadas: Number(i.CuotasPagadas) || 0
                      });
                      importados++;
                  }
              }
          });
          showToast(importados > 0 ? `Se importaron ${importados} deudas.` : "No hay deudas nuevas.");
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
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3"><ShieldAlert className="text-rose-500 w-6 h-6 md:w-8 md:h-8"/> Tarjetas y Créditos</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Estrategia Avalancha y detalle de tus deudas y préstamos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => {setShowNewCard(!showNewCard); setShowNewLoan(false);}} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus size={16}/> {showNewCard ? 'Ocultar' : 'Tarjeta'}
          </button>
          <button onClick={() => {setShowNewLoan(!showNewLoan); setShowNewCard(false);}} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus size={16}/> {showNewLoan ? 'Ocultar' : 'Préstamo'}
          </button>
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-500/30"><Upload size={14}/> Importar</button>
          <button onClick={handleExport} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-500/30"><Download size={14}/> Exportar</button>
        </div>
      </header>

      {showNewCard && (
        <div className="bg-slate-950 border border-indigo-500/50 p-4 rounded-xl mb-4 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-indigo-400">Nueva Tarjeta de Crédito</h3>
            <button onClick={() => setShowNewCard(false)} className="text-xs text-slate-400 hover:text-slate-200">Cerrar</button>
          </div>
          <form onSubmit={handleAddCard} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
            <Input label="Nombre de Tarjeta" value={newCardData.name} onChange={e=>setNewCardData({...newCardData, name: e.target.value})} className="col-span-2" />
            <Input type="number" label="Cupo Total ($)" value={newCardData.limit} onChange={e=>setNewCardData({...newCardData, limit: e.target.value})} className="col-span-1" />
            <Input type="number" label="Deuda Actual ($)" value={newCardData.initialDebt} onChange={e=>setNewCardData({...newCardData, initialDebt: e.target.value})} className="col-span-1" />
            <Input type="number" label="Tasa E.A. (%)" value={newCardData.tasaEA} onChange={e=>setNewCardData({...newCardData, tasaEA: e.target.value})} step="0.01" className="col-span-1" />
            <Input type="number" label="Cuota Mín. Estimada" value={newCardData.cuotaMinima} onChange={e=>setNewCardData({...newCardData, cuotaMinima: e.target.value})} className="col-span-1" />
            <div className="col-span-2 md:col-span-6 mt-1 flex justify-end">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors">Crear Tarjeta</button>
            </div>
          </form>
        </div>
      )}

      {showNewLoan && (
        <div className="bg-slate-950 border border-rose-500/50 p-4 md:p-6 rounded-xl mb-4 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-rose-400">Nuevo Préstamo / Crédito</h3>
            <button onClick={() => setShowNewLoan(false)} className="text-xs text-slate-400 hover:text-slate-200">Cerrar</button>
          </div>
          <form onSubmit={handleAddLoan} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <Input label="Banco / Entidad (Nombre)" value={newLoanData.name} onChange={e=>setNewLoanData({...newLoanData, name: e.target.value})} className="sm:col-span-2" />
            <Input type="number" label="Monto Inicial Prestado ($)" value={newLoanData.montoPrestado} onChange={e=>setNewLoanData({...newLoanData, montoPrestado: e.target.value})} className="sm:col-span-1" />
            <Input type="number" label="Deuda Restante Actual ($)" value={newLoanData.initialDebt} onChange={e=>setNewLoanData({...newLoanData, initialDebt: e.target.value})} className="sm:col-span-1" />
            
            <Input type="number" label="Total Pagado Previo ($)" placeholder="Dinero abonado antes de usar la app" value={newLoanData.totalPagadoPrevio} onChange={e=>setNewLoanData({...newLoanData, totalPagadoPrevio: e.target.value})} className="sm:col-span-1" />
            <Input type="number" label="Valor Cuota Fija ($)" value={newLoanData.cuotaMinima} onChange={e=>setNewLoanData({...newLoanData, cuotaMinima: e.target.value})} className="sm:col-span-1" />
            <div className="sm:col-span-2 flex gap-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
               <Input type="number" label="Cuotas Pagadas" value={newLoanData.cuotasPagadas} onChange={e=>setNewLoanData({...newLoanData, cuotasPagadas: e.target.value})} className="w-full" />
               <Input type="number" label="Cuotas Totales" value={newLoanData.cuotasTotales} onChange={e=>setNewLoanData({...newLoanData, cuotasTotales: e.target.value})} className="w-full" />
            </div>

            <div className="sm:col-span-4 bg-indigo-950/20 p-4 rounded-lg border border-indigo-500/30 flex flex-col md:flex-row gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-indigo-300 w-full md:w-auto">
                <input type="checkbox" checked={newLoanData.hasIBR} onChange={(e) => setNewLoanData({...newLoanData, hasIBR: e.target.checked})} className="form-checkbox text-indigo-500 rounded border-slate-700 bg-slate-900" />
                ¿Tiene Tasa Variable (IBR)?
              </label>
              {newLoanData.hasIBR ? (
                <div className="flex w-full gap-3">
                  <Input type="number" step="0.01" label="IBR Actual (%)" value={newLoanData.ibrValue} onChange={e=>setNewLoanData({...newLoanData, ibrValue: e.target.value})} className="flex-1" />
                  <Input type="number" step="0.01" label="Puntos Adicionales" value={newLoanData.ibrPuntos} onChange={e=>setNewLoanData({...newLoanData, ibrPuntos: e.target.value})} className="flex-1" />
                </div>
              ) : (
                <Input type="number" step="0.01" label="Tasa de Interés (E.A. %)" value={newLoanData.tasaEA} onChange={e=>setNewLoanData({...newLoanData, tasaEA: e.target.value})} className="w-full md:w-1/3" />
              )}
            </div>

            <div className="sm:col-span-4 mt-2 flex justify-end">
              <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-lg transition-colors w-full md:w-auto">Crear Préstamo</button>
            </div>
          </form>
        </div>
      )}

      <Card className="border-t-4 border-t-indigo-500">
        <h2 className="text-lg font-bold text-white mb-4">Tarjetas de Crédito Registradas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/50">
              <tr>
                <th className="px-3 py-3 rounded-tl-lg">Tarjeta</th>
                <th className="px-3 py-3 text-right">Cupo Total</th>
                <th className="px-3 py-3 text-right">Cupo Disp.</th>
                <th className="px-3 py-3 text-right">Deuda Base Actual</th>
                <th className="px-3 py-3 text-center">Tasa M.V.</th>
                <th className="px-3 py-3 text-center">Tasa E.A.</th>
                <th className="px-3 py-3 text-center rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {todasLasTC.map(d => {
                const isEditing = editId === d.id;
                const tasaMV = getTasaMensual(d.tasaEA) * 100;
                
                if (isEditing) {
                   return (
                     <tr key={d.id} className="bg-indigo-950/40">
                       <td className="px-2 py-2"><input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="w-full bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Nombre" /></td>
                       <td className="px-2 py-2"><input type="number" value={editData.limit} onChange={e=>setEditData({...editData, limit: e.target.value})} className="w-full bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none text-right" placeholder="Cupo" /></td>
                       <td className="px-2 py-2 text-right text-slate-500">-</td>
                       <td className="px-2 py-2"><input type="number" value={editData.initialDebt} onChange={e=>setEditData({...editData, initialDebt: e.target.value})} className="w-full bg-slate-900 border border-rose-500 rounded px-2 py-1 text-xs text-white outline-none text-right" placeholder="Deuda" title="Ajusta la deuda base" /></td>
                       <td className="px-2 py-2 text-center text-slate-500">-</td>
                       <td className="px-2 py-2">
                         <div className="flex gap-1 items-center">
                            <input type="number" value={editData.tasaEA} onChange={e=>setEditData({...editData, tasaEA: e.target.value})} step="0.01" className="w-16 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none text-center" title="Tasa E.A." />
                            <input type="number" value={editData.cuotaMinima} onChange={e=>setEditData({...editData, cuotaMinima: e.target.value})} className="hidden" />
                         </div>
                       </td>
                       <td className="px-2 py-2 text-center flex justify-center gap-1">
                         <button onClick={saveInlineEdit} className="text-emerald-400 p-1.5 bg-slate-900 rounded border border-slate-700 hover:border-emerald-500/50" title="Guardar Cambios"><Check size={14}/></button>
                         <button onClick={() => setEditId(null)} className="text-rose-400 p-1.5 bg-slate-900 rounded border border-slate-700 hover:border-rose-500/50" title="Cancelar"><Minus size={14}/></button>
                       </td>
                     </tr>
                   )
                }

                return (
                  <tr key={d.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 py-3 font-medium text-slate-200">{d.name}</td>
                    <td className="px-3 py-3 text-right text-slate-300">{formatCOP(d.limit)}</td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-400">{formatCOP(Math.max(0, d.limit - d.currentDebt))}</td>
                    <td className="px-3 py-3 text-right font-bold text-rose-400">{formatCOP(d.currentDebt)}</td>
                    <td className="px-3 py-3 text-center text-amber-400">{tasaMV.toFixed(2)}%</td>
                    <td className="px-3 py-3 text-center text-slate-300">{d.tasaEA}%</td>
                    <td className="px-3 py-3 text-center flex justify-center gap-2">
                      <button onClick={() => startEdit(d)} className="text-slate-400 hover:text-indigo-400 p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-indigo-500/50 transition-colors"><Edit3 size={14}/></button>
                      <button onClick={() => {removeCuenta(d.id); showToast("Tarjeta eliminada");}} className="text-slate-400 hover:text-rose-400 p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-rose-500/50 transition-colors"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                )
              })}
              {todasLasTC.length === 0 && (
                <tr><td colSpan="7" className="px-3 py-6 text-center text-slate-500">No hay tarjetas de crédito registradas.</td></tr>
              )}
              {/* ✨ NUEVO: FILA DE TOTALES PARA TARJETAS DE CRÉDITO */}
              {todasLasTC.length > 0 && (
                <tr className="bg-slate-950 font-bold text-white border-t-2 border-slate-800">
                  <td className="px-3 py-4">TOTAL</td>
                  <td className="px-3 py-4 text-right">{formatCOP(totalCupoTC)}</td>
                  <td className="px-3 py-4 text-right text-emerald-400">{formatCOP(totalDispTC)}</td>
                  <td className="px-3 py-4 text-right text-rose-400">{formatCOP(totalDeudaTC)}</td>
                  <td className="px-3 py-4 text-center">-</td>
                  <td className="px-3 py-4 text-center">-</td>
                  <td className="px-3 py-4 text-center"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-t-4 border-t-rose-500">
        <h2 className="text-lg font-bold text-white mb-6">Créditos y Préstamos Detallados</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deudasAnalizadas.filter(d=>d.type==='loan').map(d => {
            const isEditing = editId === d.id;

            if (isEditing) {
               return (
                  <div key={d.id} className="bg-slate-950 p-5 rounded-xl border border-indigo-500 shadow-xl flex flex-col gap-4">
                     <div className="flex justify-between items-center mb-2 border-b border-indigo-500/30 pb-3">
                       <h3 className="font-bold text-indigo-400 flex items-center gap-2"><Edit3 size={16}/> Editando Préstamo</h3>
                       <div className="flex gap-2">
                         <button onClick={saveInlineEdit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">Guardar</button>
                         <button onClick={() => setEditId(null)} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-3 py-1.5 rounded text-xs font-bold transition-colors">Cancelar</button>
                       </div>
                     </div>
                     <Input label="Banco / Entidad (Nombre)" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} />
                     <div className="grid grid-cols-2 gap-4">
                       <Input type="number" label="Préstamo Inicial ($)" value={editData.montoPrestado} onChange={e=>setEditData({...editData, montoPrestado: e.target.value})} />
                       <Input type="number" label="Deuda Restante Base ($)" value={editData.initialDebt} onChange={e=>setEditData({...editData, initialDebt: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <Input type="number" label="Total Pagado Previo ($)" value={editData.totalPagadoPrevio} onChange={e=>setEditData({...editData, totalPagadoPrevio: e.target.value})} />
                       <Input type="number" label="Valor Cuota Fija ($)" value={editData.cuotaMinima} onChange={e=>setEditData({...editData, cuotaMinima: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input type="number" label="Cuotas Pagadas" value={editData.cuotasPagadas} onChange={e=>setEditData({...editData, cuotasPagadas: e.target.value})} />
                        <Input type="number" label="Cuotas Totales" value={editData.cuotasTotales} onChange={e=>setEditData({...editData, cuotasTotales: e.target.value})} />
                     </div>
                     <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/30 mt-2">
                       <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-indigo-300 mb-3">
                         <input type="checkbox" checked={editData.hasIBR} onChange={(e) => setEditData({...editData, hasIBR: e.target.checked})} className="form-checkbox text-indigo-500 rounded border-slate-700 bg-slate-900" />
                         ¿Tiene Tasa Variable (IBR)?
                       </label>
                       {editData.hasIBR ? (
                         <div className="flex w-full gap-3">
                           <Input type="number" step="0.01" label="IBR Actual (%)" value={editData.ibrValue} onChange={e=>setEditData({...editData, ibrValue: e.target.value})} className="flex-1" />
                           <Input type="number" step="0.01" label="Puntos Adicionales" value={editData.ibrPuntos} onChange={e=>setEditData({...editData, ibrPuntos: e.target.value})} className="flex-1" />
                         </div>
                       ) : (
                         <Input type="number" step="0.01" label="Tasa de Interés (E.A. %)" value={editData.tasaEA} onChange={e=>setEditData({...editData, tasaEA: e.target.value})} className="w-1/2" />
                       )}
                     </div>
                  </div>
               )
            }

            const capitalPagado = (d.montoPrestado || 0) - d.currentDebt;
            const totalIntereses = (d.totalPagado || 0) - capitalPagado;

            return (
              <div key={d.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-md flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <p className="font-bold text-slate-200 text-lg md:text-xl">{d.name}</p>
                    <p className="text-xs text-slate-500 uppercase font-medium">Banco / Entidad</p>
                    {d.hasIBR && <span className="mt-2 inline-block text-[9px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-400/10 px-2 py-1 rounded border border-indigo-500/20">Tasa Variable (IBR)</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(d)} className="text-slate-400 hover:text-indigo-400 p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-indigo-500/50 transition-colors" title="Editar préstamo"><Edit3 size={16}/></button>
                    <button onClick={() => {removeCuenta(d.id); showToast("Préstamo eliminado");}} className="text-slate-400 hover:text-rose-400 p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-rose-500/50 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Préstamo Inicial</p>
                    <p className="text-base md:text-lg font-bold text-slate-300">{formatCOP(d.montoPrestado)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Deuda Restante</p>
                    <p className="text-lg md:text-xl font-black text-rose-400">{formatCOP(d.currentDebt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Valor Cuota</p>
                    <p className="text-base md:text-lg font-bold text-slate-200">{formatCOP(d.cuotaMinima)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2 bg-slate-900 p-4 rounded-lg border border-slate-800/50">
                  <div>
                    <p className="text-[10px] text-emerald-500/80 uppercase font-bold mb-1" title="Monto Original - Deuda Restante">Total Pago a Capital</p>
                    <p className="text-base font-bold text-emerald-400">{formatCOP(Math.max(0, capitalPagado))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-amber-500/80 uppercase font-bold mb-1" title="Total Histórico Pagado - Capital Pago">Total Pago Intereses y Otros</p>
                    <p className="text-base font-bold text-amber-400">{formatCOP(Math.max(0, totalIntereses))}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-4 border-t border-slate-800">
                   <div className="flex flex-col gap-1 w-1/2">
                     <span className="text-[10px] text-slate-500 uppercase font-bold">Progreso Cuotas</span>
                     <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-lg border border-slate-700 w-max">
                       <input type="number" value={d.cuotasPagadas || 0} onChange={(e)=>actualizarCampo(d.id, 'cuotasPagadas', e.target.value)} className="w-10 bg-transparent text-emerald-400 text-sm font-bold outline-none text-right" title="Edición rápida" />
                       <span className="text-slate-500 text-[10px]">/</span>
                       <input type="number" value={d.cuotasTotales || 0} onChange={(e)=>actualizarCampo(d.id, 'cuotasTotales', e.target.value)} className="w-10 bg-transparent text-slate-300 text-sm font-bold outline-none" title="Edición rápida" />
                     </div>
                     {/* ✨ BARRA DE PROGRESO DE DEUDA */}
                     {d.cuotasTotales > 0 && (
                       <div className="mt-1.5 w-full max-w-[160px]">
                         <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                           <div
                             className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                             style={{ width: `${Math.min(((d.cuotasPagadas || 0) / d.cuotasTotales) * 100, 100)}%` }}
                           ></div>
                         </div>
                         <p className="text-[9px] text-slate-500 mt-0.5">{Math.round(((d.cuotasPagadas || 0) / d.cuotasTotales) * 100)}% pagado</p>
                       </div>
                     )}
                     {/* ✨ BARRA DE PROGRESO POR CAPITAL cuando hay montoPrestado */}
                     {d.montoPrestado > 0 && (
                       <div className="mt-1.5 w-full max-w-[160px]">
                         <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                           <div
                             className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                             style={{ width: `${Math.min((Math.max(0, d.montoPrestado - d.currentDebt) / d.montoPrestado) * 100, 100)}%` }}
                           ></div>
                         </div>
                         <p className="text-[9px] text-slate-500 mt-0.5">{Math.round((Math.max(0, d.montoPrestado - d.currentDebt) / d.montoPrestado) * 100)}% capital pagado</p>
                       </div>
                     )}
                   </div>
                   
                   <div className="text-right w-1/2">
                      {d.hasIBR ? (
                         <div className="flex flex-col items-end">
                           <span className="text-[10px] text-slate-500 uppercase font-bold">IBR Actual (%) + Puntos</span>
                           <div className="flex items-center gap-1 mt-1">
                             <input type="number" step="0.01" value={d.ibrValue} onChange={(e)=>actualizarIBR(d.id, e.target.value, d.ibrPuntos)} className="w-16 bg-slate-950 border border-slate-700 text-white text-sm font-bold px-2 py-1.5 rounded outline-none text-center focus:border-indigo-500" title="Edición rápida" />
                             <span className="text-sm text-slate-400 font-bold">+{d.ibrPuntos}</span>
                           </div>
                           <span className="text-[10px] text-indigo-400 mt-2 block font-medium">Tasa E.A: {d.tasaEA.toFixed(2)}%</span>
                         </div>
                      ) : (
                         <div className="flex flex-col items-end">
                           <span className="text-[10px] text-slate-500 uppercase font-bold">Tasa Interés (E.A.)</span>
                           <div className="flex items-center gap-1 mt-1">
                              <input type="number" step="0.1" value={d.tasaEA.toFixed(2)} onChange={(e)=>actualizarCampo(d.id, 'tasaEA', e.target.value)} className="w-20 bg-slate-950 border border-slate-700 text-white text-sm font-bold px-2 py-1.5 rounded outline-none text-center focus:border-indigo-500" title="Edición rápida" />
                              <span className="text-slate-400 font-bold">%</span>
                           </div>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            )
          })}
          {deudasAnalizadas.filter(d=>d.type==='loan').length === 0 && <p className="text-slate-500 text-sm col-span-1 lg:col-span-2 text-center py-6">No hay préstamos configurados.</p>}
        </div>
      </Card>
    </div>
  );
};
