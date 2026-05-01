// ============================================================================
// COMPONENTES UI EXTERNOS
// ============================================================================
const Edit3 = ({ size = 16, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
const Trash2 = ({ size = 16, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const Plus = ({ size = 16, strokeWidth = "2", className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Upload = ({ size = 14, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const Download = ({ size = 14, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const Landmark = ({ size = 16, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>;
const Wallet = ({ size = 16, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const ArrowRightLeft = ({ size = 18, className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="17 11 21 7 17 3"></polyline><line x1="21" y1="7" x2="9" y2="7"></line><polyline points="7 21 3 17 7 13"></polyline><line x1="3" y1="17" x2="15" y2="17"></line></svg>;
const ShieldAlert = ({ size = 14, strokeWidth = "2", className = "" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

// --- Componentes Reutilizables ---
const Card = ({ children, className, refObj }) => <div ref={refObj} className={`bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 ${className}`}>{children}</div>;

const Input = ({ type="text", label, value, onChange, error, className, placeholder, min }) => (
  <div className={`relative ${className?.includes('col-span') ? className : 'w-full'}`}>
    <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block">{label}</label>
    <input type={type} min={min} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-[#111222] shadow-neumorph-inset border ${error ? 'border-rose-500' : 'border-transparent'} rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neoncyan transition-all duration-300 placeholder:text-slate-600 ${className}`} />
    {error && <p className="text-rose-500 text-[10px] mt-1 pl-1 font-bold absolute -bottom-4 left-0">{error}</p>}
  </div>
);

const Select = ({ label, options, value, onChange, error, className }) => (
  <div className={`w-full ${className}`}>
    <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block">{label}</label>
    <select value={value} onChange={onChange} className={`w-full bg-[#111222] shadow-neumorph-inset border ${error ? 'border-rose-500' : 'border-transparent'} rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neonmagenta transition-all duration-300 appearance-none cursor-pointer`}>
      <option value="" className="bg-[#111222]">Seleccione...</option>
      {options.map(o => <option key={o.value} value={o.value} className="bg-[#111222]">{o.label}</option>)}
    </select>
    {error && <p className="text-rose-500 text-[10px] mt-1 pl-1 font-bold">{error}</p>}
  </div>
);

// ✨ NUEVO COMPONENTE: Logos de Bancos Dinámicos (Búsqueda por palabra clave)
const BankLogo = ({ name, type, className = "w-6 h-6 rounded-full shrink-0" }) => {
  const { useState } = React;
  const [error, setError] = useState(false);
  
  // Convertimos a minúsculas para buscar fragmentos (ej: "Bancolombia Leo" -> "bancolombia leo")
  const lowerName = (name || '').toLowerCase();

  // Si es efectivo, siempre mostramos el emoji (no hay logo para el efectivo físico)
  if (type === 'cash') return <span className="text-lg shrink-0">💵</span>;

  // Diccionario inteligente para detectar el banco según si el nombre INCLUYE esa palabra
  let domain = null;
  if (lowerName.includes('bancolombia')) domain = 'bancolombia.com';
  else if (lowerName.includes('nequi')) domain = 'nequi.com.co';
  else if (lowerName.includes('daviplata') || lowerName.includes('davivienda') || lowerName.includes('davibank')) domain = 'davivienda.com'; // Redirige a la casita roja
  else if (lowerName.includes('nu bank') || lowerName.includes('nubank') || lowerName.includes('nu ')) domain = 'nubank.com.br'; // Dominio global de Nu
  else if (lowerName.includes('bogot')) domain = 'bancodebogota.com';
  else if (lowerName.includes('lulo')) domain = 'lulobank.com';
  else if (lowerName.includes('rappi')) domain = 'rappi.com';
  else if (lowerName.includes('falabella')) domain = 'falabella.com';
  else if (lowerName.includes('bbva')) domain = 'bbva.com';
  else if (lowerName.includes('colpatria') || lowerName.includes('scotia')) domain = 'scotiabank.com';
  else if (lowerName.includes('caja social')) domain = 'bancocajasocial.com';
  else if (lowerName.includes('av villas')) domain = 'bancoavvillas.com.co';
  else if (lowerName.includes('popular')) domain = 'bancopopular.com.co';
  else if (lowerName.includes('itau') || lowerName.includes('itaú')) domain = 'itau.co';
  else if (lowerName.includes('occidente')) domain = 'bancodeoccidente.com.co';

  // Si encontramos un dominio y la imagen carga bien
  if (domain && !error) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        className={`object-contain bg-white border border-white/[0.2] ${className}`}
        style={{ padding: '2px' }}
        onError={() => setError(true)} // Si falla el internet o la API, activa el error
      />
    );
  }

  // Fallbacks: Si no reconoce el nombre o falló la imagen, vuelve a los emojis seguros
  if (type === 'pocket') return <span className="text-lg shrink-0">📈</span>;
  if (type === 'credit') return <span className="text-lg shrink-0">💳</span>;
  return <span className="text-lg shrink-0">🏦</span>;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const CuentasTab = ({ cuentas, addCuenta, updateCuenta, removeCuenta,
                      transferencias, addTransferencia, removeTransferencia,
                      addEgreso, showToast, privacyMode }) => {
  const { useState, useRef } = React;
      
  const getLocalToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const formatCOP = (val) => {
    if (privacyMode) return '****';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', currency: 'COP', maximumFractionDigits: 0 
    }).format(val);
  };

  const getValueColor = (val) => {
    if (val > 0) return 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]';
    if (val < 0) return 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]';
    return 'text-[#8A92A6]';
  };

  const [cuentaEdit, setCuentaEdit] = useState({ id: null, name: '', type: 'bank', initialBalance: '' });
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
  
  const leoAccounts = [];
  const andreAccounts = [];
  const sharedAccounts = [];

  cuentas.forEach(c => {
    if (!['bank', 'cash', 'pocket'].includes(c.type) || c.name.toLowerCase().includes('rappi')) return;
    const owner = identifyOwner(c.name);
    
    if (owner === 'Leo') {
        if (c.type === 'cash') leoCash += c.currentBalance;
        else leoBank += c.currentBalance;
        leoAccounts.push(c);
    } else if (owner === 'Andre') {
        if (c.type === 'cash') andreCash += c.currentBalance;
        else andreBank += c.currentBalance;
        andreAccounts.push(c);
    } else {
        sharedAccounts.push(c);
    }
  });

  leoAccounts.sort((a,b) => a.name.localeCompare(b.name));
  andreAccounts.sort((a,b) => a.name.localeCompare(b.name));
  sharedAccounts.sort((a,b) => a.name.localeCompare(b.name));

  const transferenciasOrdenadas = [...(transferencias || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const guardarCuenta = (e) => {
    e.preventDefault();
    let errs = {};
    if (!cuentaEdit.name) errs.name = "Obligatorio";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const baseData = {
      name: cuentaEdit.name, 
      type: cuentaEdit.type,
      initialBalance: Number(cuentaEdit.initialBalance) || 0,
      initialDebt: 0,
      limit: 0,
      cuotaMinima: 0,
      tasaEA: 0,
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
    setCuentaEdit({ id: null, name: '', type: 'bank', initialBalance: '' });
    setErrors({});
    setShowForm(false);
  };

  const cargarParaEditar = (c) => {
    setCuentaEdit({ id: c.id, name: c.name, type: c.type, initialBalance: c.initialBalance });
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
      const dataCuentas = cuentas.filter(c => ['bank','cash','pocket'].includes(c.type)).map(c => ({ ID: c.id, Nombre: c.name, Tipo: c.type, SaldoBase: c.initialBalance }));
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
              if (i.Nombre && !cuentas.find(c => c.name === i.Nombre && ['bank','cash','pocket'].includes(c.type))) {
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
  const esAvance    = tipoOrigen === 'credit' && ['bank','cash','pocket'].includes(tipoDestino);

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

      {/* FORMULARIO CREAR/EDITAR CUENTA */}
      {showForm && (
        <Card className="!border-neoncyan/30 shadow-glow-cyan relative overflow-hidden" refObj={formRef}>
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
              <Input type="number" label="Saldo Base Inicial ($)" value={cuentaEdit.initialBalance} onChange={e=>setCuentaEdit({...cuentaEdit, initialBalance: e.target.value})} className="pl-10" placeholder="0" />
              <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
            </div>

            <button type="submit" className="col-span-2 md:col-span-4 w-full bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] font-black py-4 rounded-xl text-sm transition-all shadow-glow-cyan active:scale-95 uppercase tracking-widest mt-2">
              {cuentaEdit.id ? 'ACTUALIZAR DATOS' : 'GUARDAR NUEVA CUENTA'}
            </button>
          </form>
        </Card>
      )}

      {/* TRES COLUMNAS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">
        
        {/* --- COLUMNA 1: Liquidez Leo (Cyan Theme) --- */}
        <Card className="!border-transparent flex flex-col overflow-hidden relative h-full">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-neoncyan/10 blur-[50px] rounded-full pointer-events-none"></div>
          <h3 className="text-xs font-black text-neoncyan uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
            <Wallet size={16}/> Liquidez Leo
          </h3>
          
          <div className="space-y-3 relative z-10 flex-1 flex flex-col">
             <div className="flex-1 space-y-3">
               {leoAccounts.length === 0 ? (
                 <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl border border-transparent">Sin cuentas registradas</p>
               ) : (
                 leoAccounts.map(c => (
                   <div key={c.id} className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3.5 rounded-xl border border-transparent group transition-all hover:border-white/[0.05]">
                      <div className="flex items-center gap-3 pr-2 overflow-hidden">
                        <BankLogo name={c.name} type={c.type} />
                        <span className="text-white font-bold truncate text-[13px] tracking-wide">{c.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-black tabular-nums text-[13px] ${getValueColor(c.currentBalance)}`}>{formatCOP(c.currentBalance)}</span>
                        <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => cargarParaEditar(c)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={14}/></button>
                          <button onClick={() => { removeCuenta(c.id); showToast("Cuenta eliminada"); }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={14}/></button>
                        </div>
                      </div>
                   </div>
                 ))
               )}
             </div>
             
             <div className="pt-4 mt-4 px-1 border-t border-white/[0.05] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total Bancos</span>
                  <span className="font-bold text-white text-xs">{formatCOP(leoBank)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total Efectivo</span>
                  <span className="font-bold text-white text-xs">{formatCOP(leoCash)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/[0.02]">
                  <span className="text-white font-black uppercase tracking-widest text-[11px]">Total Disponible</span>
                  <span className={`font-black text-xl tabular-nums ${getValueColor(leoBank + leoCash)}`}>{formatCOP(leoBank + leoCash)}</span>
                </div>
             </div>
          </div>
        </Card>

        {/* --- COLUMNA 2: Liquidez Andre (Magenta Theme) --- */}
        <Card className="!border-transparent flex flex-col overflow-hidden relative h-full">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-neonmagenta/10 blur-[50px] rounded-full pointer-events-none"></div>
          <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
            <Wallet size={16}/> Liquidez Andre
          </h3>
          
          <div className="space-y-3 relative z-10 flex-1 flex flex-col">
             <div className="flex-1 space-y-3">
               {andreAccounts.length === 0 ? (
                 <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl border border-transparent">Sin cuentas registradas</p>
               ) : (
                 andreAccounts.map(c => (
                   <div key={c.id} className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3.5 rounded-xl border border-transparent group transition-all hover:border-white/[0.05]">
                      <div className="flex items-center gap-3 pr-2 overflow-hidden">
                        <BankLogo name={c.name} type={c.type} />
                        <span className="text-white font-bold truncate text-[13px] tracking-wide">{c.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-black tabular-nums text-[13px] ${getValueColor(c.currentBalance)}`}>{formatCOP(c.currentBalance)}</span>
                        <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => cargarParaEditar(c)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={14}/></button>
                          <button onClick={() => { removeCuenta(c.id); showToast("Cuenta eliminada"); }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={14}/></button>
                        </div>
                      </div>
                   </div>
                 ))
               )}
             </div>
             
             <div className="pt-4 mt-4 px-1 border-t border-white/[0.05] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total Bancos</span>
                  <span className="font-bold text-white text-xs">{formatCOP(andreBank)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total Efectivo</span>
                  <span className="font-bold text-white text-xs">{formatCOP(andreCash)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/[0.02]">
                  <span className="text-white font-black uppercase tracking-widest text-[11px]">Total Disponible</span>
                  <span className={`font-black text-xl tabular-nums ${getValueColor(andreBank + andreCash)}`}>{formatCOP(andreBank + andreCash)}</span>
                </div>
             </div>
          </div>
        </Card>

        {/* --- COLUMNA 3: FORMULARIO DE TRASLADOS --- */}
        <Card className="!border-transparent bg-gradient-to-b from-[#111222] to-appcard h-full flex flex-col">
          <h2 className="text-base font-black text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
            <ArrowRightLeft size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"/> 
            Traslado de Fondos
          </h2>
          <p className="text-[10px] text-[#8A92A6] font-bold uppercase tracking-widest mb-6">
            Mueve dinero sin afectar tus ingresos o egresos netos.
          </p>
          
          <form onSubmit={agregarTransferencia} className="space-y-5 flex-1 flex flex-col">
            <Select 
              label="Origen (Sale de)" 
              options={cuentas.filter(c=>['bank','cash','credit','pocket'].includes(c.type)).map(c => ({value: c.id, label: `${c.type==='credit'?'💳':c.type==='cash'?'💵':c.type==='pocket'?'📈':'🏦'} ${c.name}`}))} 
              value={nuevaTx.fromId} 
              onChange={e=>setNuevaTx({...nuevaTx, fromId: e.target.value})} 
              error={txErrors.fromId} 
            />
            <Select 
              label="Destino (Entra a)" 
              options={cuentas.filter(c=>['bank','cash','pocket'].includes(c.type)).map(c => ({value: c.id, label: `${c.type==='cash'?'💵':c.type==='pocket'?'📈':'🏦'} ${c.name}`}))} 
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
            
            <div className="flex-1 flex items-end mt-4">
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-[#0b0c16] font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 tracking-widest uppercase">
                Registrar Traslado
              </button>
            </div>
          </form>
        </Card>

      </div>

      {/* Backup por si existen cuentas sin asignar (Compartidas/Otros) */}
      {sharedAccounts.length > 0 && (
        <Card className="!border-transparent bg-[#111222] shadow-neumorph-inset mt-6">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-slate-400"/> Otras Cuentas (Compartidas)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {sharedAccounts.map(c => (
               <div key={c.id} className="flex justify-between items-center text-sm bg-appcard shadow-neumorph p-3.5 rounded-xl border border-white/[0.02] group transition-all hover:border-white/[0.05]">
                  <div className="flex items-center gap-3 pr-2 overflow-hidden">
                    <BankLogo name={c.name} type={c.type} />
                    <span className="text-white font-bold truncate text-[13px] tracking-wide">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-black tabular-nums text-[13px] ${getValueColor(c.currentBalance)}`}>{formatCOP(c.currentBalance)}</span>
                    <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => cargarParaEditar(c)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar"><Edit3 size={14}/></button>
                      <button onClick={() => { removeCuenta(c.id); showToast("Cuenta eliminada"); }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar"><Trash2 size={14}/></button>
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </Card>
      )}

      {/* HISTORIAL DE TRANSFERENCIAS */}
      <Card className="!border-transparent mt-6 flex flex-col">
        <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"/> 
          Historial de Transferencias
        </h2>
        
        <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
              <tr>
                <th className="px-5 py-4 w-[15%]">Fecha</th>
                <th className="px-5 py-4 w-[25%]">Origen</th>
                <th className="px-5 py-4 w-[25%]">Destino</th>
                <th className="px-5 py-4 w-[20%] text-right">Monto</th>
                <th className="px-5 py-4 w-[15%] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {transferenciasOrdenadas.map(t => {
                const origen = cuentas.find(c => c.id === t.fromId)?.name || 'Desconocido';
                const destino = cuentas.find(c => c.id === t.toId)?.name || 'Desconocido';
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-bold text-[#8A92A6] text-xs">{t.fecha}</td>
                    <td className="px-5 py-4 font-bold text-white tracking-wide">
                      <span className="flex items-center gap-2"><span className="text-rose-400">↗</span> {origen}</span>
                      {t.descripcion && <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest truncate">{t.descripcion}</p>}
                    </td>
                    <td className="px-5 py-4 font-bold text-white tracking-wide">
                      <span className="flex items-center gap-2"><span className="text-emerald-400">↘</span> {destino}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-amber-400 tabular-nums drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{formatCOP(t.monto)}</td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => {
                          if(window.confirm("¿Estás seguro de eliminar esta transferencia?\n(Esto afectará el saldo actual de las cuentas involucradas).")) {
                              if(removeTransferencia) {
                                  removeTransferencia(t.id);
                                  showToast("Transferencia eliminada correctamente.", "error");
                              } else {
                                  showToast("No se pudo eliminar la transferencia.", "error");
                              }
                          }
                      }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors p-1.5" title="Eliminar">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                )
              })}
              {transferenciasOrdenadas.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-[#8A92A6] font-bold italic">No hay transferencias registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
