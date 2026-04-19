    const SimuladorTab = ({ cuentas, addPagoFijo, showToast }) => {
      const [activeSim, setActiveSim] = useState('acelerado'); 
      const [s1, setS1] = useState({ deudaId: '', extra: 200000 });
      const dSeleccionada = cuentas.find(c => c.id === s1.deudaId);
      const s1Saldo = dSeleccionada ? dSeleccionada.currentDebt : 0;
      const s1Tasa = dSeleccionada ? dSeleccionada.tasaEA : 0;
      const s1Cuota = dSeleccionada ? dSeleccionada.cuotaMinima : 0;

      const calcSim1 = () => {
        if (s1Saldo <= 0) return { error: "Selecciona una obligación con deuda actual para simular." };
        // FIX: Cuota 0 causa loop hasta 600 meses sin mensaje de error visible
        if (s1Cuota <= 0) return { error: "Esta obligación no tiene cuota mínima registrada. Actualízala en la pestaña Deudas." };
        const tm = getTasaMensual(s1Tasa); const intMesActual = s1Saldo * tm;
        if (s1Cuota <= intMesActual) return { error: "La cuota actual no cubre ni los intereses mensuales. Incrementa la cuota base en la pestaña Deudas." };
        
        const simular = (pagoMensual) => { 
          let saldoRemanente = s1Saldo; let meses = 0; let intTotal = 0; 
          while(saldoRemanente > 0 && meses < 600) { 
            const int = saldoRemanente * tm; 
            intTotal += int; 
            saldoRemanente = saldoRemanente + int - pagoMensual; 
            meses++; 
          } 
          return { meses, intTotal }; 
        };
        const escenarioNormal = simular(s1Cuota); 
        const escenarioAcelerado = simular(s1Cuota + s1.extra);
        
        return { 
          mesesNormal: escenarioNormal.meses, intNormal: Math.round(escenarioNormal.intTotal), 
          mesesAcelerado: escenarioAcelerado.meses, intAcelerado: Math.round(escenarioAcelerado.intTotal), 
          ahorroInt: Math.round(escenarioNormal.intTotal - escenarioAcelerado.intTotal), 
          ahorroMeses: escenarioNormal.meses - escenarioAcelerado.meses 
        };
      };
      const resS1 = s1Saldo > 0 ? calcSim1() : null;

      const asumirAcelerado = () => {
        if (!dSeleccionada) { showToast("Selecciona una deuda primero", "error"); return; }
        addPagoFijo({ descripcion: `Abono Acelerado: ${dSeleccionada.name}`, categoria: 'Deudas', monto: s1Cuota + s1.extra, diaPago: 1 });
        showToast(`Simulación guardada! Abono de ${formatCOP(s1Cuota + s1.extra)} en Pagos Fijos.`);
      };

      const [s2, setS2] = useState({ nombre: '', objetivo: 5000000, ahorrado: 0, meses: 12, tasaEA: 5 });
      
      const calcSim2 = () => {
        if (s2.objetivo <= 0 || s2.meses <= 0) return null;
        const tm = getTasaMensual(s2.tasaEA);
        let reqMensual = 0;
        
        if (tm === 0) {
          reqMensual = (s2.objetivo - s2.ahorrado) / s2.meses;
        } else {
          const factor = Math.pow(1 + tm, s2.meses);
          const futuroAhorrado = s2.ahorrado * factor;
          const restante = s2.objetivo - futuroAhorrado;
          if (restante > 0) reqMensual = (restante * tm) / (factor - 1);
        }
        
        reqMensual = Math.max(0, reqMensual);
        const totalAportado = s2.ahorrado + (reqMensual * s2.meses);
        const rendimientos = s2.objetivo - totalAportado;
        
        return { aporteMensual: Math.round(reqMensual), totalAportado: Math.round(totalAportado), rendimientos: Math.round(rendimientos) };
      };
      const resS2 = calcSim2();

      const asumirAhorro = () => {
        if (!s2.nombre) { showToast("Escribe un nombre para tu Plan de Ahorro.", "error"); return; }
        addPagoFijo({ descripcion: `Ahorro: ${s2.nombre}`, categoria: 'Inversión', monto: resS2.aporteMensual, diaPago: 1 });
        showToast(`Plan activado. Cuota de ${formatCOP(resS2.aporteMensual)} en Pagos Fijos.`);
      };

      const [s3, setS3] = useState({ invId: 'otra', capital: 0, tasa: 10, anos: 5, aporte: 200000 });
      
      const handleInvChange = (e) => {
        const val = e.target.value;
        if (val === 'otra' || val === '') {
          setS3({...s3, invId: val, capital: 0, tasa: 10});
        } else {
          const inv = cuentas.find(c => c.id === val);
          if (inv) setS3({...s3, invId: val, capital: inv.currentBalance, tasa: inv.tasaEA});
        }
      }

      const calcSim3 = () => {
        const tm = getTasaMensual(s3.tasa); 
        const meses = s3.anos * 12; 
        let vf = s3.capital * Math.pow(1 + tm, meses);
        if (tm === 0) {
           vf = s3.capital + (s3.aporte * meses);
        } else if (s3.aporte > 0) {
           vf += s3.aporte * ((Math.pow(1 + tm, meses) - 1) / tm);
        }
        const capitalInvertido = s3.capital + (s3.aporte * meses); 
        return { vf, capitalInvertido, rendimientos: vf - capitalInvertido };
      };
      const resS3 = calcSim3();

      const asumirInversion = () => {
        const iSeleccionada = cuentas.find(c => c.id === s3.invId);
        const nombreDesc = iSeleccionada ? iSeleccionada.name : 'Nueva Inversión';
        addPagoFijo({ descripcion: `Aporte a Inversión: ${nombreDesc}`, categoria: 'Inversión', monto: s3.aporte, diaPago: 1 });
        showToast(`Aporte programado de ${formatCOP(s3.aporte)} en Pagos Fijos.`);
      };

      return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0 max-w-4xl mx-auto">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Simuladores y Proyecciones</h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">Conecta con tus datos reales y "Asume el gasto" para integrarlo a tus pagos mensuales.</p>
          </header>

          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-sm font-medium">
            <button onClick={()=>setActiveSim('acelerado')} className={`flex-1 py-2.5 rounded-lg transition-colors ${activeSim === 'acelerado' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Pago Acelerado</button>
            <button onClick={()=>setActiveSim('ahorro')} className={`flex-1 py-2.5 rounded-lg transition-colors ${activeSim === 'ahorro' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Plan de Ahorro</button>
            <button onClick={()=>setActiveSim('inversion')} className={`flex-1 py-2.5 rounded-lg transition-colors ${activeSim === 'inversion' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Int. Compuesto</button>
          </div>

          {activeSim === 'acelerado' && (
            <Card className="border-t-4 border-t-rose-500 animate-in slide-in-from-bottom-4">
              <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2"><TrendingUp size={20} className="text-rose-400"/> Pago Acelerado (Deudas)</h2>
              <p className="text-sm text-slate-400 mb-6">Proyecta cuánto tiempo y dinero ahorras si aumentas la cuota de tus obligaciones actuales.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Select label="Elige tu crédito o tarjeta" options={cuentas.filter(c=>['credit','loan'].includes(c.type)).map(c=>({value:c.id,label:`${c.name} (Deuda: ${formatCOP(c.currentDebt)})`}))} value={s1.deudaId} onChange={e=>setS1({...s1, deudaId: e.target.value})} className="sm:col-span-2" />
                <Input type="number" label="Abono EXTRA mensual ($)" value={s1.extra} onChange={e=>setS1({...s1, extra: Number(e.target.value)})} className="bg-slate-900 sm:col-span-2" />
              </div>

              {resS1 && resS1.error ? (
                <div className="p-4 bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium">{resS1.error}</div>
              ) : resS1 ? (
                <div className="bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div className="text-center w-1/2 border-r border-slate-800 pr-2">
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Pagando lo actual</p>
                      <p className="text-lg md:text-xl font-bold text-slate-300">{resS1.mesesNormal} meses</p>
                      <p className="text-xs text-rose-400 mt-1">{formatCOP(resS1.intNormal)} intereses</p>
                    </div>
                    <div className="text-center w-1/2 pl-2">
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Abonando el Extra</p>
                      <p className="text-lg md:text-xl font-bold text-indigo-400">{resS1.mesesAcelerado} meses</p>
                      <p className="text-xs text-amber-400 mt-1">{formatCOP(resS1.intAcelerado)} intereses</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20 text-center">
                    <p className="text-sm text-emerald-400 font-medium">✨ Con este abono, te ahorras <span className="font-bold text-lg">{formatCOP(resS1.ahorroInt)}</span> y terminas {resS1.ahorroMeses} meses antes.</p>
                  </div>
                  <button onClick={asumirAcelerado} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 size={18}/> Asumir Gasto Fijo: {formatCOP(s1Cuota + s1.extra)} / mes
                  </button>
                </div>
              ) : null}
            </Card>
          )}

          {activeSim === 'ahorro' && (
            <Card className="border-t-4 border-t-emerald-500 animate-in slide-in-from-bottom-4">
              <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2"><Target size={20} className="text-emerald-400"/> Plan de Ahorro</h2>
              <p className="text-sm text-slate-400 mb-6">Define un objetivo de dinero y tiempo. El sistema calculará la cuota mensual exacta requerida.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Input label="Nombre del Plan (Ej: Viaje, Carro)" placeholder="Escribe tu meta..." value={s2.nombre} onChange={e=>setS2({...s2, nombre: e.target.value})} className="sm:col-span-2" />
                <Input type="number" label="¿Cuánto dinero necesitas? ($)" value={s2.objetivo} onChange={e=>setS2({...s2, objetivo: Number(e.target.value)})} />
                <Input type="number" label="¿En cuántos meses? (Ej: 12)" value={s2.meses} onChange={e=>setS2({...s2, meses: Number(e.target.value)})} />
                <Input type="number" label="Rendimiento del banco E.A. (%)" value={s2.tasaEA} onChange={e=>setS2({...s2, tasaEA: Number(e.target.value)})} />
                <Input type="number" label="Dinero ya ahorrado ($)" value={s2.ahorrado} onChange={e=>setS2({...s2, ahorrado: Number(e.target.value)})} />
              </div>

              {resS2 && (
                <div className="bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800 space-y-6">
                  <div className="text-center pb-4 border-b border-slate-800">
                     <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Debes ahorrar mensualmente:</p>
                     <p className="text-4xl font-black text-emerald-400">{formatCOP(resS2.aporteMensual)}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Dinero aportado por ti:</span>
                    <span className="font-bold text-white">{formatCOP(resS2.totalAportado)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Intereses ganados:</span>
                    <span className="font-bold text-emerald-400">+{formatCOP(resS2.rendimientos)}</span>
                  </div>
                  <button onClick={asumirAhorro} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 size={18}/> Asumir Gasto Fijo: {formatCOP(resS2.aporteMensual)} / mes
                  </button>
                </div>
              )}
            </Card>
          )}

          {activeSim === 'inversion' && (
            <Card className="border-t-4 border-t-amber-500 animate-in slide-in-from-bottom-4">
              <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2"><PiggyBank size={20} className="text-amber-400"/> Proyección de Interés Compuesto</h2>
              <p className="text-sm text-slate-400 mb-6">Observa cómo crece el dinero de un bolsillo real o simula una inversión externa.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Select label="Seleccionar Inversión" className="sm:col-span-2" 
                  options={[{value: 'otra', label: 'Otra (Ingreso manual)'}, ...cuentas.filter(c=>c.type === 'pocket').map(c=>({value:c.id,label:`${c.name} (${formatCOP(c.currentBalance)})`}))]} 
                  value={s3.invId} onChange={handleInvChange} />
                <Input type="number" label="Capital Inicial ($)" value={s3.capital} onChange={e=>setS3({...s3, capital: Number(e.target.value)})} disabled={s3.invId !== 'otra'} />
                <Input type="number" label="Tasa E.A. (%)" value={s3.tasa} onChange={e=>setS3({...s3, tasa: Number(e.target.value)})} disabled={s3.invId !== 'otra'} />
                <Input type="number" label="Tiempo (Años)" value={s3.anos} onChange={e=>setS3({...s3, anos: Number(e.target.value)})} />
                <Input type="number" label="Aporte Adicional Mensual ($)" value={s3.aporte} onChange={e=>setS3({...s3, aporte: Number(e.target.value)})} className="bg-amber-950/20" />
              </div>

              <div className="bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800 space-y-6">
                <div className="flex justify-between items-end pb-4 border-b border-slate-800">
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Capital aportado</p><p className="text-lg md:text-xl font-medium text-slate-300">{formatCOP(resS3.capitalInvertido)}</p></div>
                  <div className="text-right"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rendimientos</p><p className="text-lg md:text-xl font-bold text-amber-400">+{formatCOP(resS3.rendimientos)}</p></div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Valor Final Proyectado</p>
                  <p className="text-3xl md:text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-emerald-400">{formatCOP(resS3.vf)}</p>
                </div>
                {s3.aporte > 0 && 
                  <button onClick={asumirInversion} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 size={18}/> Asumir Aporte: {formatCOP(s3.aporte)} / mes
                  </button>
                }
              </div>
            </Card>
          )}
        </div>
      );
    };

