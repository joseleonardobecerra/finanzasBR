const RenderCardCompacta = ({ p, themeColor, editId, cargarParaEditar, removePresupuesto, removePagoFijo, formatCOP }) => {
  const porcentaje = Math.min((p.gastado / p.limite) * 100, 100);
  const porcentajeReal = p.limite > 0 ? (p.gastado / p.limite) * 100 : 0;
  const diferencia = p.limite - p.gastado;
  const excede = diferencia < 0;

  const themeMap = {
    yellow: { 
       line: excede ? 'bg-neonmagenta shadow-[0_0_10px_#FF007A]' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', 
       textMain: excede ? 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]' : 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]', 
       bgHover: 'hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]',
       bgEdit: 'bg-amber-900/10 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
    },
    blue: { 
       line: excede ? 'bg-neonmagenta shadow-[0_0_10px_#FF007A]' : 'bg-neoncyan shadow-[0_0_10px_#00E5FF]', 
       textMain: excede ? 'text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]' : 'text-neoncyan drop-shadow-[0_0_5px_rgba(0,229,255,0.3)]', 
       bgHover: 'hover:border-neoncyan/30 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]',
       bgEdit: 'bg-cyan-900/10 border-neoncyan shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
    }
  };

  let t = themeMap[themeColor];

  // Iconos locales para que el componente sea independiente
  const Edit3Icon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
  const Trash2Icon = ({ size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

  return (
    <div key={p.id} className={`relative bg-[#111222] shadow-neumorph-inset p-5 pb-6 rounded-[20px] flex flex-col justify-between border transition-all duration-300 ${editId === p.id ? t.bgEdit : `border-transparent ${t.bgHover}`} group overflow-hidden`}>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1c1e32]">
        <div className={`h-full transition-all duration-1000 ${t.line}`} style={{ width: `${porcentaje}%` }}></div>
      </div>
      <div className="flex justify-between items-start mb-4">
        <span className="font-black text-white text-sm uppercase tracking-widest truncate pr-2 leading-tight">{p.nombre}</span>
        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => cargarParaEditar(p)} className="text-[#8A92A6] hover:text-white transition-colors"><Edit3Icon size={14}/></button>
          <button onClick={() => {
            const isVar = p.tipo === 'Variable';
            if (window.confirm(`¿Seguro que quieres eliminar el ${isVar ? 'presupuesto' : 'gasto fijo'} "${p.nombre}"?\n(Los pagos ya registrados se mantendrán en el historial).`)) {
              if (isVar) removePresupuesto(p.id); else removePagoFijo(p.id);
            }
          }} className="text-[#8A92A6] hover:text-neonmagenta transition-colors"><Trash2Icon size={14}/></button>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
           <span className={`text-2xl md:text-3xl font-black tabular-nums leading-none ${t.textMain}`}>{formatCOP(p.gastado)}</span>
           <span className="text-[10px] text-[#8A92A6] font-bold mt-2 tracking-widest uppercase">De {formatCOP(p.limite)}</span>
        </div>
        <div className="text-right flex flex-col items-end">
           <span className={`text-sm font-black tabular-nums ${excede ? 'text-neonmagenta' : 'text-slate-300'}`}>{porcentajeReal.toFixed(1)}%</span>
           <span className={`text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md ${excede ? 'bg-neonmagenta/10 text-neonmagenta' : 'bg-emerald-500/10 text-emerald-400'}`}>
             {excede ? 'Excedido' : 'OK'}
           </span>
        </div>
      </div>
    </div>
  );
};