const SettingsTab = ({ stateData, importAllState, selectedMonth, showToast }) => {
      const { useRef } = React;
      const fileInputRef = useRef(null);
      const fileExcelMasterRef = useRef(null);

      const handleExportJSON = () => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateData)); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", `respaldo_finanzas_${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); };
      const handleImportJSON = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const parsed = JSON.parse(event.target.result); importAllState(parsed).then(() => showToast("¡Respaldo JSON restaurado con éxito!")).catch(() => showToast("Error al restaurar.", "error")); } catch (err) { showToast("Error al leer JSON.", "error"); } }; reader.readAsText(file); e.target.value = ''; };

      // --- EXPORTADOR MAESTRO DE TODA LA BASE DE DATOS (CON PLANTILLAS EN BLANCO) ---
      const handleExportExcelMaster = async () => {
        try {
          const xlsx = await loadSheetJS();
          const wb = xlsx.utils.book_new();

          // ✨ Función mágica para forzar encabezados siempre
          const crearHojaConEncabezados = (data, headers) => {
            const exportData = data.length > 0 ? data : [{}];
            return xlsx.utils.json_to_sheet(exportData, { header: headers });
          };

          // 1. Ingresos
          const ingresosHeaders = ["ID", "Fecha", "Descripcion", "Persona", "Tipo", "Cuenta", "Monto"];
          const ingresosData = stateData.ingresos.map(i => ({ ID: i.id, Fecha: i.fecha, Descripcion: i.descripcion, Persona: i.persona, Tipo: i.tipo, Cuenta: stateData.cuentas.find(c=>c.id===i.cuentaId)?.name || i.cuentaId, Monto: i.monto }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(ingresosData, ingresosHeaders), "Ingresos");
          
          // 2. Egresos
          const egresosHeaders = ["ID", "Fecha", "Descripcion", "Categoria", "Tipo", "Cuenta", "Monto", "DeudaPagada"];
          const egresosData = stateData.egresos.map(e => ({ ID: e.id, Fecha: e.fecha, Descripcion: e.descripcion, Categoria: e.categoria, Tipo: e.tipo, Cuenta: stateData.cuentas.find(c=>c.id===e.cuentaId)?.name || e.cuentaId, Monto: e.monto, DeudaPagada: e.deudaId ? stateData.cuentas.find(c=>c.id===e.deudaId)?.name : '' }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(egresosData, egresosHeaders), "Egresos");
          
          // 3. Cuentas y Bancos
          const cuentasHeaders = ["ID", "Nombre", "Tipo", "SaldoBase"];
          const cuentasData = stateData.cuentas.filter(c => ['bank','cash'].includes(c.type)).map(c => ({ ID: c.id, Nombre: c.name, Tipo: c.type, SaldoBase: c.initialBalance }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(cuentasData, cuentasHeaders), "Cuentas_Bancos");

          // 4. Transferencias
          const transHeaders = ["ID", "Fecha", "Origen", "Destino", "Monto", "CostoAvance", "Descripcion"];
          const transData = stateData.transferencias.map(t => ({ ID: t.id, Fecha: t.fecha, Origen: stateData.cuentas.find(c=>c.id===t.fromId)?.name || '', Destino: stateData.cuentas.find(c=>c.id===t.toId)?.name || '', Monto: t.monto, CostoAvance: t.costoAvance || 0, Descripcion: t.descripcion }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(transData, transHeaders), "Transferencias");

          // 5. Deudas
          const deudasHeaders = ["ID", "Nombre", "Tipo", "DeudaInicial", "Limite", "MontoPrestado", "TasaEA", "CuotaMinima", "CuotasTotales", "CuotasPagadas"];
          const deudasAnalizadas = stateData.cuentas.filter(c => ['credit', 'loan'].includes(c.type));
          const deudasData = deudasAnalizadas.map(c => ({ ID: c.id, Nombre: c.name, Tipo: c.type, DeudaInicial: c.initialDebt, Limite: c.limit, MontoPrestado: c.montoPrestado || '', TasaEA: c.tasaEA, CuotaMinima: c.cuotaMinima, CuotasTotales: c.cuotasTotales || '', CuotasPagadas: c.cuotasPagadas || '' }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(deudasData, deudasHeaders), "Deudas");

          // 6. Inversiones
          const invHeaders = ["ID", "Nombre", "SaldoBase", "TasaEA"];
          const invCts = stateData.cuentas.filter(c => c.type === 'pocket' || (!['credit', 'loan'].includes(c.type) && c.tasaEA > 0));
          const invData = invCts.map(c => ({ ID: c.id, Nombre: c.name, SaldoBase: c.initialBalance, TasaEA: c.tasaEA }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(invData, invHeaders), "Inversiones");

          // 7. Pagos Fijos
          const fijosHeaders = ["ID", "Descripcion", "Categoria", "Monto", "DiaPago"];
          const pagosFijosData = stateData.pagosFijos.map(f => ({ ID: f.id, Descripcion: f.descripcion, Categoria: f.categoria, Monto: f.monto, DiaPago: f.diaPago }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(pagosFijosData, fijosHeaders), "Pagos_Fijos");

          // 8. Presupuestos Variables
          const presHeaders = ["ID", "Categoria", "Limite"];
          const presData = stateData.presupuestos.map(p => ({ ID: p.id, Categoria: p.categoria, Limite: p.limite }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(presData, presHeaders), "Presupuestos_Variables");

          // 9. Ingresos Fijos (Para que aparezcan las pastillas)
          const ingresosFijosHeaders = ["ID", "Descripcion", "Persona", "Tipo", "CuentaName", "Monto"];
          const ingresosFijosData = (stateData.ingresosFijos || []).map(f => ({ ID: f.id, Descripcion: f.descripcion, Persona: f.persona, Tipo: f.tipo, CuentaName: f.cuentaName, Monto: f.monto }));
          xlsx.utils.book_append_sheet(wb, crearHojaConEncabezados(ingresosFijosData, ingresosFijosHeaders), "Ingresos_Fijos");

          xlsx.writeFile(wb, `FinanzasFamilia_MasterDB_${new Date().toISOString().split('T')[0]}.xlsx`);
          showToast("Plantilla Base exportada con éxito.");
        } catch (e) { showToast("Hubo un error al generar Excel Maestro.", "error"); }
      };

      // --- IMPORTADOR MAESTRO DE TODA LA BASE DE DATOS ---
      const handleImportExcelMaster = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const xlsx = await loadSheetJS();
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const wb = xlsx.read(evt.target.result, { type: 'binary' });
              
              // Clones del estado actual para operar sobre ellos
              let newIngresos = [...stateData.ingresos];
              let newEgresos = [...stateData.egresos];
              let newCuentas = [...stateData.cuentas];
              let newTransferencias = [...stateData.transferencias];
              let newPagosFijos = [...stateData.pagosFijos];
              let newPresupuestos = [...stateData.presupuestos];
              let newIngresosFijos = [...(stateData.ingresosFijos || [])];
              
              let totalImportados = 0;

              if (wb.Sheets["Cuentas_Bancos"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Cuentas_Bancos"]).forEach(i => {
                   if(i.Nombre) {
                       const exists = newCuentas.some(c => c.name === i.Nombre && ['bank','cash'].includes(c.type));
                       if(!exists) { newCuentas.push({ id: i.ID || generateId(), name: i.Nombre, type: i.Tipo || 'bank', initialBalance: Number(i.SaldoBase)||0, initialDebt:0, limit:0, tasaEA:0, cuotaMinima:0 }); totalImportados++; }
                   }
                });
              }

              if (wb.Sheets["Deudas"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Deudas"]).forEach(i => {
                   if(i.Nombre && (i.Tipo === 'credit' || i.Tipo === 'loan')) {
                       const exists = newCuentas.some(c => c.name === i.Nombre && c.type === i.Tipo);
                       if(!exists) { newCuentas.push({ id: i.ID || generateId(), name: i.Nombre, type: i.Tipo, initialBalance: 0, currentDebt: Number(i.DeudaInicial) || 0, initialDebt: Number(i.DeudaInicial) || 0, limit: Number(i.Limite) || 0, montoPrestado: Number(i.MontoPrestado) || 0, tasaEA: Number(i.TasaEA) || 0, cuotaMinima: Number(i.CuotaMinima) || 0, cuotasTotales: Number(i.CuotasTotales) || 0, cuotasPagadas: Number(i.CuotasPagadas) || 0 }); totalImportados++; }
                   }
                });
              }

              if (wb.Sheets["Inversiones"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Inversiones"]).forEach(i => {
                   if(i.Nombre) {
                       const exists = newCuentas.some(c => c.name === i.Nombre && c.type === 'pocket');
                       if(!exists) { newCuentas.push({ id: i.ID || generateId(), name: i.Nombre, type: 'pocket', initialBalance: Number(i.SaldoBase) || 0, currentDebt: 0, limit: 0, tasaEA: Number(i.TasaEA) || 0, cuotaMinima: 0 }); totalImportados++; }
                   }
                });
              }

              if (wb.Sheets["Ingresos"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Ingresos"]).filter(i=>i.Monto).forEach(i => {
                  const fecha = i.Fecha || new Date().toISOString().split('T')[0];
                  const desc = i.Descripcion || 'Importado';
                  const monto = Number(i.Monto) || 0;
                  const exists = newIngresos.some(existing => existing.fecha === fecha && existing.descripcion === desc && existing.monto === monto);
                  if (!exists) { newIngresos.push({ id: i.ID || generateId(), fecha, descripcion: desc, persona: i.Persona || '', tipo: i.Tipo || 'Variable', monto, cuentaId: newCuentas.find(c => c.name === i.Cuenta)?.id || newCuentas[0]?.id }); totalImportados++; }
                });
              }

              if (wb.Sheets["Egresos"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Egresos"]).filter(i=>i.Monto).forEach(i => {
                  const fecha = i.Fecha || new Date().toISOString().split('T')[0];
                  const desc = i.Descripcion || 'Importado';
                  const monto = Number(i.Monto) || 0;
                  const exists = newEgresos.some(existing => existing.fecha === fecha && existing.descripcion === desc && existing.monto === monto);
                  if (!exists) { newEgresos.push({ id: i.ID || generateId(), fecha, descripcion: desc, categoria: i.Categoria || 'Otros', tipo: i.Tipo || 'Variable', monto, cuentaId: newCuentas.find(c => c.name === i.Cuenta)?.id || newCuentas[0]?.id, deudaId: i.DeudaPagada ? newCuentas.find(c => c.name === i.DeudaPagada)?.id : null }); totalImportados++; }
                });
              }

              if (wb.Sheets["Transferencias"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Transferencias"]).filter(i=>i.Monto).forEach(i => {
                   const exists = newTransferencias.some(t => t.fecha === i.Fecha && t.monto === Number(i.Monto) && t.descripcion === i.Descripcion);
                   if(!exists) { newTransferencias.push({ id: i.ID || generateId(), fecha: i.Fecha || getLocalToday(), fromId: newCuentas.find(c=>c.name===i.Origen)?.id || newCuentas[0]?.id, toId: newCuentas.find(c=>c.name===i.Destino)?.id || newCuentas[1]?.id, monto: Number(i.Monto)||0, costoAvance: Number(i.CostoAvance)||0, descripcion: i.Descripcion || '' }); totalImportados++; }
                });
              }

              if (wb.Sheets["Pagos_Fijos"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Pagos_Fijos"]).filter(i=>i.Monto).forEach(i => {
                    const exists = newPagosFijos.some(pf => pf.descripcion === i.Descripcion && pf.categoria === i.Categoria && pf.monto === Number(i.Monto));
                    if(!exists) { newPagosFijos.push({ id: i.ID || generateId(), descripcion: i.Descripcion || 'Fijo Importado', categoria: i.Categoria || 'Otros', monto: Number(i.Monto) || 0, diaPago: Number(i.DiaPago) || 1 }); totalImportados++; }
                });
              }

              if (wb.Sheets["Presupuestos_Variables"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Presupuestos_Variables"]).filter(i=>i.Limite).forEach(i => {
                    const exists = newPresupuestos.some(p => p.categoria === i.Categoria);
                    if(!exists) { newPresupuestos.push({ id: i.ID || generateId(), categoria: i.Categoria || 'Otros', limite: Number(i.Limite) || 0 }); totalImportados++; }
                });
              }

              if (wb.Sheets["Ingresos_Fijos"]) {
                xlsx.utils.sheet_to_json(wb.Sheets["Ingresos_Fijos"]).filter(i=>i.Monto).forEach(i => {
                    const exists = newIngresosFijos.some(inf => inf.descripcion === i.Descripcion && inf.monto === Number(i.Monto));
                    if(!exists) { newIngresosFijos.push({ id: i.ID || generateId(), descripcion: i.Descripcion || 'Ingreso Fijo', persona: i.Persona || '', tipo: i.Tipo || 'Fijo', cuentaName: i.CuentaName || '', monto: Number(i.Monto) || 0 }); totalImportados++; }
                });
              }

              importAllState({
                  ingresos: newIngresos, egresos: newEgresos,
                  cuentas: newCuentas, transferencias: newTransferencias,
                  pagosFijos: newPagosFijos, presupuestos: newPresupuestos,
                  ingresosFijos: newIngresosFijos
              }).then(() => {}).catch(err => console.error('Error importando:', err));
              
              showToast(totalImportados > 0 ? `Importación Maestra completada: ${totalImportados} registros nuevos agregados.` : "No se detectaron cambios/registros nuevos.");
            } catch(err) { showToast("Error procesando la Plantilla Maestra.", "error"); console.error(err); }
          };
          reader.readAsBinaryString(file);
        } catch (err) { showToast("No se pudo cargar la herramienta de Excel.", "error"); }
        e.target.value = '';
      };

      return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-6 pb-20 md:pb-0">
          <header>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111222] shadow-neumorph-inset flex items-center justify-center border border-white/[0.05]">
                 <Settings2 className="h-5 w-5 md:h-6 md:w-6 text-[#8A92A6]" /> 
              </div>
              Sistema y Ajustes
            </h1>
            <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
              Exporta toda tu base de datos a Excel, o carga una plantilla completa con todas las pestañas.
            </p>
          </header>
          
          <h2 className="text-sm font-black text-emerald-400 mt-10 mb-4 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
            <FileSpreadsheet size={16}/> Plantilla Maestra (Excel)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card className="!border-transparent flex flex-col justify-between">
              <div className="flex gap-4 items-center mb-6">
                <div className="w-12 h-12 bg-[#111222] shadow-neumorph-inset text-emerald-400 rounded-xl flex items-center justify-center border border-transparent hover:border-emerald-500/30 transition-colors shrink-0">
                  <Download className="h-6 w-6 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]"/>
                </div>
                <div>
                  <h3 className="font-black text-white tracking-wide">Exportar Base Total</h3>
                  <p className="text-xs font-medium text-[#8A92A6] mt-1">Descarga un Excel con múltiples hojas para toda la app.</p>
                </div>
              </div>
              <button onClick={handleExportExcelMaster} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95">
                Descargar Plantilla (.XLSX)
              </button>
            </Card>

            <Card className="!border-transparent flex flex-col justify-between">
              <div className="flex gap-4 items-center mb-6">
                <div className="w-12 h-12 bg-[#111222] shadow-neumorph-inset text-emerald-400 rounded-xl flex items-center justify-center border border-transparent hover:border-emerald-500/30 transition-colors shrink-0">
                  <Upload className="h-6 w-6 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]"/>
                </div>
                <div>
                  <h3 className="font-black text-white tracking-wide">Importación Maestra</h3>
                  <p className="text-xs font-medium text-[#8A92A6] mt-1">Sube la plantilla de Excel. El sistema evitará duplicados.</p>
                </div>
              </div>
              <input type="file" accept=".xlsx, .xls" ref={fileExcelMasterRef} onChange={handleImportExcelMaster} className="hidden" />
              <button onClick={()=>fileExcelMasterRef.current.click()} className="w-full py-3.5 bg-[#111222] border border-emerald-500/30 text-emerald-400 hover:text-[#0b0c16] hover:bg-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-neumorph hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                Subir Plantilla Master
              </button>
            </Card>
          </div>

          <h2 className="text-sm font-black text-[#8A92A6] mt-12 mb-4 uppercase tracking-widest flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg> 
            Respaldo para Desarrolladores (JSON)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card className="!border-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-[#111222] shadow-neumorph-inset text-neoncyan rounded-xl flex items-center justify-center shrink-0 border border-neoncyan/20">
                  <Download className="h-5 w-5 drop-shadow-[0_0_5px_rgba(0,229,255,0.4)]"/>
                </div>
                <h3 className="font-black text-white tracking-wide">Respaldar Sistema</h3>
              </div>
              <button onClick={handleExportJSON} className="w-full py-3 bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-glow-cyan active:scale-95">
                Descargar JSON
              </button>
            </Card>

            <Card className="!border-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-[#111222] shadow-neumorph-inset text-neonmagenta rounded-xl flex items-center justify-center shrink-0 border border-neonmagenta/20">
                  <Upload className="h-5 w-5 drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]"/>
                </div>
                <h3 className="font-black text-white tracking-wide">Restaurar Sistema</h3>
              </div>
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} className="hidden" />
              <button onClick={()=>fileInputRef.current.click()} className="w-full py-3 bg-[#111222] border border-neonmagenta/30 text-neonmagenta hover:bg-neonmagenta hover:text-[#0b0c16] rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-neumorph hover:shadow-glow-magenta">
                Cargar JSON
              </button>
            </Card>
          </div>
        </div>
      );
    };
