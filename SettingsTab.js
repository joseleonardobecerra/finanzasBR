    const SettingsTab = ({ stateData, importAllState, selectedMonth, showToast }) => {
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
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-6 pb-20 md:pb-0">
          <header><h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3"><Settings2 className="h-6 w-6 md:h-8 md:w-8 text-slate-400" /> Sistema y Ajustes</h1><p className="text-sm md:text-base text-slate-400 mt-1">Exporta toda tu base de datos a Excel, o carga una plantilla completa con todas las pestañas.</p></header>
          
          <h2 className="text-lg font-bold text-white mt-8 mb-2">Plantilla Maestra (Excel)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Card className="border-t-4 border-t-emerald-500 flex flex-col items-start gap-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center"><FileSpreadsheet className="h-5 w-5 md:h-6 md:w-6"/></div>
                <div><h3 className="font-bold text-white">Exportar Base Total</h3><p className="text-xs text-slate-400">Descarga un Excel con múltiples hojas para toda la app.</p></div>
              </div>
              <button onClick={handleExportExcelMaster} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors">Descargar Plantilla (.XLSX)</button>
            </Card>
            <Card className="border-t-4 border-t-emerald-500 flex flex-col items-start gap-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-800 text-emerald-400 rounded-xl flex items-center justify-center"><Upload className="h-5 w-5"/></div>
                <div><h3 className="font-bold text-white">Importación Maestra</h3><p className="text-xs text-slate-400">Sube la plantilla de Excel. El sistema evitará duplicados.</p></div>
              </div>
              <input type="file" accept=".xlsx, .xls" ref={fileExcelMasterRef} onChange={handleImportExcelMaster} className="hidden" />
              <button onClick={()=>fileExcelMasterRef.current.click()} className="w-full py-2.5 bg-slate-800 border border-emerald-500/50 text-emerald-400 hover:bg-slate-700 rounded-lg font-bold text-xs shadow-sm transition-colors">Subir Plantilla Master</button>
            </Card>
          </div>

          <h2 className="text-lg font-bold text-white mt-10 mb-2">Respaldo Bruto para Desarrolladores (JSON)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Card><div className="space-y-4"><div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center"><Download className="h-5 w-5"/></div><h3 className="font-bold text-white">Respaldar Sistema</h3><button onClick={handleExportJSON} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm">Descargar JSON</button></div></Card>
            <Card><div className="space-y-4"><div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center"><Upload className="h-5 w-5"/></div><h3 className="font-bold text-white">Restaurar Sistema</h3><input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} className="hidden" /><button onClick={()=>fileInputRef.current.click()} className="w-full py-2.5 bg-slate-800 border border-rose-500/50 text-rose-400 hover:bg-slate-700 rounded-xl font-bold text-sm">Cargar JSON</button></div></Card>
          </div>
        </div>
      );
    };

