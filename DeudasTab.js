const DeudasTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta, showToast, egresos }) => {
  const { useState, useRef } = React;
  const [showNewCard, setShowNewCard] = useState(false);
  const [showNewLoan, setShowNewLoan] = useState(false);
  
  const [newCardData, setNewCardData] = useState({ name: '', limit: '', initialDebt: '', tasaEA: '', cuotaMinima: '' });
  const [newLoanData, setNewLoanData] = useState({ name: '', montoPrestado: '', initialDebt: '', totalPagadoPrevio: '', tasaEA: '', cuotaMinima: '', cuotasTotales: '', cuotasPagadas: '', hasIBR: false, ibrValue: '', ibrPuntos: '' });
  
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);

  // ============================================================================
  // ÍCONOS SVG NATIVOS 
  // ============================================================================
  const CheckIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
  );
  
  const XIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );

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

  // Estilos UI Base para Neumorfismo Oscuro
  const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neonmagenta focus:shadow-glow-magenta transition-all duration-300 placeholder:text-slate-600";
  const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonmagenta to-rose-600 flex items-center justify-center shadow-glow-magenta">
               <ShieldAlert className="text-[#0b0c16] w-5 h-5"/>
            </div>
            Tarjetas y Créditos
          </h1>
          <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
            Estrategia Avalancha y detalle de tus deudas y préstamos.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => {setShowNewCard(!showNewCard); setShowNewLoan(false);}} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95">
            <Plus size={16} strokeWidth="3"/> {showNewCard ? 'Ocultar' : 'Tarjeta'}
          </button>
          <button onClick={() => {setShowNewLoan(!showNewLoan); setShowNewCard(false);}} className="bg-neonmagenta hover:bg-[#ff1a8c] text-[#0b0c16] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-glow-magenta active:scale-95">
            <Plus size={16} strokeWidth="3"/> {showNewLoan ? 'Ocultar' : 'Préstamo'}
          </button>
          
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-[#111222] hover:bg-[#1c1e32] text-rose-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-rose-500/30 shadow-neumorph hover:shadow-glow-magenta">
            <Upload size={14}/> Importar
          </button>
          <button onClick={handleExport} className="bg-[#111222] hover:bg-[#1c1e32] text-rose-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-rose-500/30 shadow-neumorph hover:shadow-glow-magenta">
            <Download size={14}/> Exportar
          </button>
        </div>
      </header>

      {/* FORMULARIO NUEVA TARJETA DE CRÉDITO */}
      {showNewCard && (
        <Card className="!border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] mb-4 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
               <CreditCard size={16}/> Nueva Tarjeta de Crédito
            </h3>
            <button onClick={() => setShowNewCard(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
              Cerrar
            </button>
          </div>
          
          <form onSubmit={handleAddCard} className="grid grid-cols-2 md:grid-cols-6 gap-5 items-end">
            <div className="col-span-2">
              <label className={labelBaseClass}>Nombre de Tarjeta</label>
              <input type="text" required value={newCardData.name} onChange={e=>setNewCardData({...newCardData, name: e.target.value})} className={inputBaseClass} placeholder="Ej. Visa Bancolombia" />
            </div>
            <div className="col-span-1 relative">
              <label className={labelBaseClass}>Cupo Total ($)</label>
              <input type="number" value={newCardData.limit} onChange={e=>setNewCardData({...newCardData, limit: e.target.value})} className={`${inputBaseClass} pl-8`} placeholder="0" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            <div className="col-span-1 relative">
              <label className={labelBaseClass}>Deuda Actual ($)</label>
              <input type="number" value={newCardData.initialDebt} onChange={e=>setNewCardData({...newCardData, initialDebt: e.target.value})} className={`${inputBaseClass} pl-8 text-rose-400 font-bold`} placeholder="0" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            <div className="col-span-1 relative">
              <label className={labelBaseClass}>Tasa E.A. (%)</label>
              <input type="number" value={newCardData.tasaEA} onChange={e=>setNewCardData({...newCardData, tasaEA: e.target.value})} step="0.01" className={`${inputBaseClass} pr-8 font-bold text-amber-400`} placeholder="0.0" />
              <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
            </div>
            <div className="col-span-1 relative">
              <label className={labelBaseClass}>Cuota Mín. Estimada</label>
              <input type="number" value={newCardData.cuotaMinima} onChange={e=>setNewCardData({...newCardData, cuotaMinima: e.target.value})} className={`${inputBaseClass} pl-8`} placeholder="0" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            
            <div className="col-span-2 md:col-span-6 mt-2 flex justify-end">
              <button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95">
                CREAR TARJETA
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* FORMULARIO NUEVO PRÉSTAMO */}
      {showNewLoan && (
        <Card className="!border-neonmagenta/30 shadow-[0_0_20px_rgba(255,0,122,0.2)] mb-4 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-4">
            <h3 className="text-sm font-black text-neonmagenta uppercase tracking-widest flex items-center gap-2">
               <Landmark size={16}/> Nuevo Préstamo / Crédito
            </h3>
            <button onClick={() => setShowNewLoan(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
              Cerrar
            </button>
          </div>
          
          <form onSubmit={handleAddLoan} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-end">
            <div className="sm:col-span-2">
              <label className={labelBaseClass}>Banco / Entidad (Nombre)</label>
              <input type="text" required value={newLoanData.name} onChange={e=>setNewLoanData({...newLoanData, name: e.target.value})} className={inputBaseClass} placeholder="Ej. Crédito Vehículo BBVA" />
            </div>
            
            <div className="sm:col-span-1 relative">
              <label className={labelBaseClass}>Monto Inicial Prestado</label>
              <input type="number" value={newLoanData.montoPrestado} onChange={e=>setNewLoanData({...newLoanData, montoPrestado: e.target.value})} className={`${inputBaseClass} pl-8`} placeholder="0" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            
            <div className="sm:col-span-1 relative">
              <label className={labelBaseClass}>Deuda Restante Actual</label>
              <input type="number" required value={newLoanData.initialDebt} onChange={e=>setNewLoanData({...newLoanData, initialDebt: e.target.value})} className={`${inputBaseClass} pl-8 font-black text-rose-400`} placeholder="0" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            
            <div className="sm:col-span-1 relative">
              <label className={labelBaseClass}>Total Pagado Previo</label>
              <input type="number" value={newLoanData.totalPagadoPrevio} onChange={e=>setNewLoanData({...newLoanData, totalPagadoPrevio: e.target.value})} className={`${inputBaseClass} pl-8`} placeholder="Abonado antes de usar la app" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            
            <div className="sm:col-span-1 relative">
              <label className={labelBaseClass}>Valor Cuota Fija Mensual</label>
              <input type="number" required value={newLoanData.cuotaMinima} onChange={e=>setNewLoanData({...newLoanData, cuotaMinima: e.target.value})} className={`${inputBaseClass} pl-8 font-bold text-white`} placeholder="0" />
              <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
            </div>
            
            <div className="sm:col-span-2 flex gap-4 bg-[#111222] shadow-neumorph-inset p-3 rounded-xl border border-transparent">
               <div className="w-full">
                  <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1 block">Cuotas Pagadas</label>
                  <input type="number" value={newLoanData.cuotasPagadas} onChange={e=>setNewLoanData({...newLoanData, cuotasPagadas: e.target.value})} className="w-full bg-transparent text-white font-bold text-sm outline-none px-2 py-1 placeholder:text-slate-700" placeholder="Ej. 12" />
               </div>
               <div className="w-px bg-white/10 h-10 self-center"></div>
               <div className="w-full">
                  <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1 block">Cuotas Totales</label>
                  <input type="number" value={newLoanData.cuotasTotales} onChange={e=>setNewLoanData({...newLoanData, cuotasTotales: e.target.value})} className="w-full bg-transparent text-white font-bold text-sm outline-none px-2 py-1 placeholder:text-slate-700" placeholder="Ej. 60" />
               </div>
            </div>

            <div className="sm:col-span-4 bg-appcard border border-white/[0.05] p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-neumorph">
              <label className="flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-widest text-indigo-400 w-full md:w-auto">
                <input type="checkbox" checked={newLoanData.hasIBR} onChange={(e) => setNewLoanData({...newLoanData, hasIBR: e.target.checked})} className="form-checkbox w-5 h-5 text-indigo-500 rounded bg-[#111222] border-transparent shadow-neumorph-inset focus:ring-0 focus:ring-offset-0" />
                ¿Tiene Tasa Variable (IBR)?
              </label>
              
              {newLoanData.hasIBR ? (
                <div className="flex w-full gap-4">
                  <div className="flex-1 relative">
                    <label className={labelBaseClass}>IBR Actual (%)</label>
                    <input type="number" step="0.01" value={newLoanData.ibrValue} onChange={e=>setNewLoanData({...newLoanData, ibrValue: e.target.value})} className={`${inputBaseClass} pr-8 font-bold text-amber-400`} placeholder="0.0" />
                    <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
                  </div>
                  <div className="flex-1">
                    <label className={labelBaseClass}>Puntos Adicionales</label>
                    <input type="number" step="0.01" value={newLoanData.ibrPuntos} onChange={e=>setNewLoanData({...newLoanData, ibrPuntos: e.target.value})} className={inputBaseClass} placeholder="+ Pts" />
                  </div>
                </div>
              ) : (
                <div className="w-full md:w-1/3 relative">
                  <label className={labelBaseClass}>Tasa Interés (E.A. %)</label>
                  <input type="number" step="0.01" value={newLoanData.tasaEA} onChange={e=>setNewLoanData({...newLoanData, tasaEA: e.target.value})} className={`${inputBaseClass} pr-8 font-bold text-amber-400`} placeholder="0.0" />
                  <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-4 mt-4 flex justify-end pt-4 border-t border-white/[0.05]">
              <button type="submit" className="w-full md:w-auto bg-neonmagenta hover:bg-[#ff1a8c] text-[#0b0c16] font-black uppercase tracking-widest px-10 py-4 rounded-xl transition-all shadow-glow-magenta active:scale-95">
                CREAR PRÉSTAMO
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* TABLA TARJETAS DE CRÉDITO */}
      <Card className="!border-transparent flex flex-col">
        <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
          <CreditCard size={18} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"/> 
          Tarjetas de Crédito
        </h2>
        
        <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
              <tr>
                <th className="px-5 py-4">Tarjeta</th>
                <th className="px-5 py-4 text-right">Cupo Total</th>
                <th className="px-5 py-4 text-right">Cupo Disp.</th>
                <th className="px-5 py-4 text-right">Deuda Base Actual</th>
                <th className="px-5 py-4 text-center">Tasa M.V.</th>
                <th className="px-5 py-4 text-center">Tasa E.A.</th>
                <th className="px-5 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {todasLasTC.map(d => {
                const isEditing = editId === d.id;
                const tasaMV = getTasaMensual(d.tasaEA) * 100;
                
                if (isEditing) {
                   return (
                     <tr key={d.id} className="bg-indigo-950/20">
                       <td className="px-2 py-2"><input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500" placeholder="Nombre" /></td>
                       <td className="px-2 py-2"><input type="number" value={editData.limit} onChange={e=>setEditData({...editData, limit: e.target.value})} className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none text-right shadow-neumorph-inset" placeholder="Cupo" /></td>
                       <td className="px-2 py-2 text-right text-slate-500">-</td>
                       <td className="px-2 py-2"><input type="number" value={editData.initialDebt} onChange={e=>setEditData({...editData, initialDebt: e.target.value})} className="w-full bg-[#111222] border border-rose-500/50 rounded-lg px-3 py-2 text-xs text-rose-400 font-bold outline-none text-right shadow-neumorph-inset" placeholder="Deuda" title="Ajusta la deuda base" /></td>
                       <td className="px-2 py-2 text-center text-slate-500">-</td>
                       <td className="px-2 py-2">
                         <div className="flex justify-center">
                            <input type="number" value={editData.tasaEA} onChange={e=>setEditData({...editData, tasaEA: e.target.value})} step="0.01" className="w-20 bg-[#111222] border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-amber-400 font-bold outline-none text-center shadow-neumorph-inset" title="Tasa E.A." />
                         </div>
                       </td>
                       <td className="px-2 py-2 text-center flex justify-center gap-2">
                         <button onClick={saveInlineEdit} className="text-[#0b0c16] p-2 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors shadow-glow-cyan" title="Guardar Cambios"><CheckIcon size={14}/></button>
                         <button onClick={() => setEditId(null)} className="text-rose-400 p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/30" title="Cancelar"><XIcon size={14}/></button>
                       </td>
                     </tr>
                   )
                }

                return (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-bold text-white tracking-wide">{d.name}</td>
                    <td className="px-5 py-4 text-right text-[#8A92A6] tabular-nums">{formatCOP(d.limit)}</td>
                    <td className="px-5 py-4 text-right font-black text-emerald-400 tabular-nums drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">{formatCOP(Math.max(0, d.limit - d.currentDebt))}</td>
                    <td className="px-5 py-4 text-right font-black text-neonmagenta tabular-nums drop-shadow-[0_0_5px_rgba(255,0,122,0.3)]">{formatCOP(d.currentDebt)}</td>
                    <td className="px-5 py-4 text-center text-amber-400 font-bold tabular-nums">{tasaMV.toFixed(2)}%</td>
                    <td className="px-5 py-4 text-center text-white font-bold tabular-nums">{d.tasaEA}%</td>
                    <td className="px-5 py-4 text-center flex justify-center gap-3">
                      <button onClick={() => startEdit(d)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={16}/></button>
                      <button onClick={() => {removeCuenta(d.id); showToast("Tarjeta eliminada");}} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                )
              })}
              {todasLasTC.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-[#8A92A6] font-bold italic">No hay tarjetas de crédito registradas.</td></tr>
              )}
              {/* ✨ NUEVO: FILA DE TOTALES PARA TARJETAS DE CRÉDITO */}
              {todasLasTC.length > 0 && (
                <tr className="bg-[#0b0c16]/50 font-black text-white border-t border-white/[0.05]">
                  <td className="px-5 py-5 uppercase tracking-widest text-[11px] text-[#8A92A6]">TOTAL TC</td>
                  <td className="px-5 py-5 text-right tabular-nums">{formatCOP(totalCupoTC)}</td>
                  <td className="px-5 py-5 text-right text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] tabular-nums">{formatCOP(totalDispTC)}</td>
                  <td className="px-5 py-5 text-right text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)] tabular-nums">{formatCOP(totalDeudaTC)}</td>
                  <td colSpan="3" className="px-5 py-5 text-center"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LISTA DE PRÉSTAMOS DETALLADOS */}
      <Card className="!border-transparent flex flex-col">
        <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
          <Landmark size={18} className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"/> 
          Créditos y Préstamos Detallados
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deudasAnalizadas.filter(d=>d.type==='loan').map(d => {
            const isEditing = editId === d.id;

            if (isEditing) {
               return (
                  <div key={d.id} className="bg-[#111222] shadow-neumorph-inset p-5 rounded-2xl border border-rose-500/50 flex flex-col gap-4 animate-in zoom-in-95">
                     <div className="flex justify-between items-center mb-2 border-b border-rose-500/30 pb-4">
                       <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                         <Edit3 size={16}/> Editando Préstamo
                       </h3>
                       <div className="flex gap-2">
                         <button onClick={saveInlineEdit} className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-glow-cyan">Guardar</button>
                         <button onClick={() => setEditId(null)} className="bg-appcard hover:bg-white/[0.05] text-[#8A92A6] border border-white/[0.02] shadow-neumorph px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all">Cancelar</button>
                       </div>
                     </div>
                     
                     <Input label="Banco / Entidad (Nombre)" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} />
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div className="relative">
                         <Input type="number" label="Préstamo Inicial" value={editData.montoPrestado} onChange={e=>setEditData({...editData, montoPrestado: e.target.value})} className="pl-8" />
                         <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                       </div>
                       <div className="relative">
                         <Input type="number" label="Deuda Restante Base" value={editData.initialDebt} onChange={e=>setEditData({...editData, initialDebt: e.target.value})} className="pl-8 font-black text-rose-400" />
                         <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div className="relative">
                         <Input type="number" label="Total Pagado Previo" value={editData.totalPagadoPrevio} onChange={e=>setEditData({...editData, totalPagadoPrevio: e.target.value})} className="pl-8" />
                         <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                       </div>
                       <div className="relative">
                         <Input type="number" label="Valor Cuota Fija" value={editData.cuotaMinima} onChange={e=>setEditData({...editData, cuotaMinima: e.target.value})} className="pl-8 font-bold" />
                         <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 bg-appcard p-3 rounded-xl shadow-neumorph border border-white/[0.02]">
                        <Input type="number" label="Cuotas Pagadas" value={editData.cuotasPagadas} onChange={e=>setEditData({...editData, cuotasPagadas: e.target.value})} />
                        <Input type="number" label="Cuotas Totales" value={editData.cuotasTotales} onChange={e=>setEditData({...editData, cuotasTotales: e.target.value})} />
                     </div>
                     
                     <div className="bg-appcard p-4 rounded-xl shadow-neumorph border border-white/[0.02] mt-2">
                       <label className="flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">
                         <input type="checkbox" checked={editData.hasIBR} onChange={(e) => setEditData({...editData, hasIBR: e.target.checked})} className="form-checkbox w-5 h-5 text-indigo-500 rounded bg-[#111222] border-transparent shadow-neumorph-inset focus:ring-0 focus:ring-offset-0" />
                         ¿Tiene Tasa Variable (IBR)?
                       </label>
                       
                       {editData.hasIBR ? (
                         <div className="flex w-full gap-4">
                           <div className="flex-1 relative">
                             <Input type="number" step="0.01" label="IBR Actual (%)" value={editData.ibrValue} onChange={e=>setEditData({...editData, ibrValue: e.target.value})} className="pr-8 font-bold text-amber-400" />
                             <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
                           </div>
                           <div className="flex-1">
                             <Input type="number" step="0.01" label="Puntos Adicionales" value={editData.ibrPuntos} onChange={e=>setEditData({...editData, ibrPuntos: e.target.value})} placeholder="+ Pts" />
                           </div>
                         </div>
                       ) : (
                         <div className="w-1/2 relative">
                           <Input type="number" step="0.01" label="Tasa Interés (E.A. %)" value={editData.tasaEA} onChange={e=>setEditData({...editData, tasaEA: e.target.value})} className="pr-8 font-bold text-amber-400" />
                           <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
                         </div>
                       )}
                     </div>
                  </div>
               )
            }

            const capitalPagado = (d.montoPrestado || 0) - d.currentDebt;
            const totalIntereses = (d.totalPagado || 0) - capitalPagado;

            return (
              <div key={d.id} className="bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent flex flex-col gap-5 p-5 md:p-6 hover:border-rose-500/20 transition-all">
                <div className="flex justify-between items-start border-b border-white/[0.05] pb-4">
                  <div>
                    <p className="font-black text-white text-lg tracking-wide">{d.name}</p>
                    <p className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest mt-1">Banco / Entidad</p>
                    {d.hasIBR && <span className="mt-3 inline-block text-[9px] text-[#0b0c16] bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">Tasa Variable (IBR)</span>}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(d)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar préstamo"><Edit3 size={18}/></button>
                    <button onClick={() => {removeCuenta(d.id); showToast("Préstamo eliminado");}} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={18}/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Préstamo</p>
                    <p className="text-sm md:text-base font-bold text-white tabular-nums">{formatCOP(d.montoPrestado)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Deuda Restante</p>
                    <p className="text-base md:text-xl font-black text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)] tabular-nums">{formatCOP(d.currentDebt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Cuota Mes</p>
                    <p className="text-sm md:text-base font-bold text-white tabular-nums">{formatCOP(d.cuotaMinima)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-2 bg-appcard p-5 rounded-xl shadow-neumorph border border-white/[0.02]">
                  <div>
                    <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1.5" title="Monto Original - Deuda Restante">Pago a Capital</p>
                    <p className="text-base font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)] tabular-nums">{formatCOP(Math.max(0, capitalPagado))}</p>
                  </div>
                  <div className="text-right border-l border-white/[0.05] pl-5">
                    <p className="text-[10px] text-amber-400 uppercase font-black tracking-widest mb-1.5" title="Total Histórico Pagado - Capital Pago">Pago Intereses</p>
                    <p className="text-base font-black text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)] tabular-nums">{formatCOP(Math.max(0, totalIntereses))}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-end gap-5 mt-3 pt-5 border-t border-white/[0.05]">
                   
                   {/* Progreso Cuotas */}
                   <div className="flex flex-col gap-2 flex-1 w-full">
                     <span className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest">Progreso Cuotas</span>
                     
                     <div className="flex items-center gap-2 bg-appcard px-3 py-2 rounded-xl shadow-neumorph border border-white/[0.02] w-max mb-1">
                       <input type="number" value={d.cuotasPagadas || 0} onChange={(e)=>actualizarCampo(d.id, 'cuotasPagadas', e.target.value)} className="w-10 bg-transparent text-emerald-400 text-sm font-black outline-none text-right placeholder:text-slate-700" placeholder="0" title="Edición rápida" />
                       <span className="text-[#8A92A6] text-[10px] font-black">/</span>
                       <input type="number" value={d.cuotasTotales || 0} onChange={(e)=>actualizarCampo(d.id, 'cuotasTotales', e.target.value)} className="w-10 bg-transparent text-white text-sm font-black outline-none placeholder:text-slate-700" placeholder="0" title="Edición rápida" />
                     </div>
                     
                     {/* ✨ BARRAS DE PROGRESO */}
                     <div className="flex flex-col gap-3 mt-1 w-full pr-4">
                       {d.cuotasTotales > 0 && (
                         <div className="w-full">
                           <div className="flex justify-between mb-1.5">
                             <span className="text-[9px] text-[#8A92A6] uppercase font-bold tracking-wider">Tiempo</span>
                             <span className="text-[9px] text-emerald-400 font-black">{Math.round(((d.cuotasPagadas || 0) / d.cuotasTotales) * 100)}%</span>
                           </div>
                           <div className="w-full bg-[#0b0c16] shadow-neumorph-inset rounded-full h-1.5 overflow-hidden">
                             <div className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-1000" style={{ width: `${Math.min(((d.cuotasPagadas || 0) / d.cuotasTotales) * 100, 100)}%` }}></div>
                           </div>
                         </div>
                       )}
                       
                       {d.montoPrestado > 0 && (
                         <div className="w-full">
                           <div className="flex justify-between mb-1.5">
                             <span className="text-[9px] text-[#8A92A6] uppercase font-bold tracking-wider">Capital</span>
                             <span className="text-[9px] text-indigo-400 font-black">{Math.round((Math.max(0, d.montoPrestado - d.currentDebt) / d.montoPrestado) * 100)}%</span>
                           </div>
                           <div className="w-full bg-[#0b0c16] shadow-neumorph-inset rounded-full h-1.5 overflow-hidden">
                             <div className="h-full rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-all duration-1000" style={{ width: `${Math.min((Math.max(0, d.montoPrestado - d.currentDebt) / d.montoPrestado) * 100, 100)}%` }}></div>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                   
                   {/* Tasas (Edición en línea) */}
                   <div className="flex-1 w-full flex justify-start md:justify-end">
                      {d.hasIBR ? (
                         <div className="flex flex-col md:items-end">
                           <span className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-2">IBR Actual (%) + Puntos</span>
                           <div className="flex items-center gap-2">
                             <input type="number" step="0.01" value={d.ibrValue} onChange={(e)=>actualizarIBR(d.id, e.target.value, d.ibrPuntos)} className="w-20 bg-appcard shadow-neumorph border border-white/[0.02] text-amber-400 text-sm font-black px-3 py-2 rounded-xl outline-none text-center focus:border-amber-500/50 transition-colors" title="Editar IBR" />
                             <span className="text-sm text-[#8A92A6] font-black uppercase tracking-wider">+{d.ibrPuntos}</span>
                           </div>
                           <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-3 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">Tasa E.A: {d.tasaEA.toFixed(2)}%</span>
                         </div>
                      ) : (
                         <div className="flex flex-col md:items-end">
                           <span className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-2">Tasa Interés (E.A.)</span>
                           <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={d.tasaEA.toFixed(2)} onChange={(e)=>actualizarCampo(d.id, 'tasaEA', e.target.value)} className="w-24 bg-appcard shadow-neumorph border border-white/[0.02] text-amber-400 text-sm font-black px-3 py-2 rounded-xl outline-none text-center focus:border-amber-500/50 transition-colors" title="Editar Tasa" />
                              <span className="text-[#8A92A6] font-black">%</span>
                           </div>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            )
          })}
          {deudasAnalizadas.filter(d=>d.type==='loan').length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-12 bg-[#111222] shadow-neumorph-inset rounded-3xl border border-transparent">
              <p className="text-[#8A92A6] text-sm font-bold uppercase tracking-widest">No hay préstamos configurados.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
