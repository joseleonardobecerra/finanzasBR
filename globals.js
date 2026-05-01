const { useState, useMemo, useEffect, useRef } = React;

// ============================================================================
// ☁️ CONFIGURACIÓN DE FIREBASE (Intacta)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDRreZW3bVZG7h7frWeOy0jqrgqLpTw6cw",
  authDomain: "finanzasbr2026.firebaseapp.com",
  projectId: "finanzasbr2026",
  storageBucket: "finanzasbr2026.firebasestorage.app",
  messagingSenderId: "718446857856",
  appId: "1:718446857856:web:9720f19c580a464d616065",
  measurementId: "G-8XXLCBGP0Z"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

db.enablePersistence().catch((err) => {
    console.warn("Error habilitando persistencia offline:", err.code);
});

const cloudDocRef = db.collection('finanzas').doc('datos_familia');

// ============================================================================
// --- ÍCONOS SVG ---
// ============================================================================
const SvgWrapper = ({ size=18, className="", children }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const LayoutDashboard = (p) => <SvgWrapper {...p}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></SvgWrapper>;
const Wallet = (p) => <SvgWrapper {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></SvgWrapper>;
const Receipt = (p) => <SvgWrapper {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></SvgWrapper>;
const ShieldAlert = (p) => <SvgWrapper {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></SvgWrapper>;
const Target = (p) => <SvgWrapper {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></SvgWrapper>;
const TrendingUp = (p) => <SvgWrapper {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></SvgWrapper>;
const TrendingDown = (p) => <SvgWrapper {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></SvgWrapper>;
const Calculator = (p) => <SvgWrapper {...p}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></SvgWrapper>;
const Plus = (p) => <SvgWrapper {...p}><path d="M5 12h14"/><path d="M12 5v14"/></SvgWrapper>;
const Trash2 = (p) => <SvgWrapper {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></SvgWrapper>;
const AlertCircle = (p) => <SvgWrapper {...p}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></SvgWrapper>;
const CheckCircle2 = (p) => <SvgWrapper {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></SvgWrapper>;
const Info = (p) => <SvgWrapper {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></SvgWrapper>;
const Settings2 = (p) => <SvgWrapper {...p}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></SvgWrapper>;
const Download = (p) => <SvgWrapper {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></SvgWrapper>;
const Upload = (p) => <SvgWrapper {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></SvgWrapper>;
const Landmark = (p) => <SvgWrapper {...p}><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></SvgWrapper>;
const ArrowRightLeft = (p) => <SvgWrapper {...p}><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></SvgWrapper>;
const ChevronLeft = (p) => <SvgWrapper {...p}><path d="m15 18-6-6 6-6"/></SvgWrapper>;
const ChevronRight = (p) => <SvgWrapper {...p}><path d="m9 18 6-6-6-6"/></SvgWrapper>;
const ChevronDownIcon = (p) => <SvgWrapper {...p}><polyline points="6 9 12 15 18 9"/></SvgWrapper>;
const ChevronUpIcon = (p) => <SvgWrapper {...p}><polyline points="18 15 12 9 6 15"/></SvgWrapper>;
const Calendar = (p) => <SvgWrapper {...p}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></SvgWrapper>;
const ShoppingCart = (p) => <SvgWrapper {...p}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></SvgWrapper>;
const Check = (p) => <SvgWrapper {...p}><path d="M20 6 9 17l-5-5"/></SvgWrapper>;
const FileSpreadsheet = (p) => <SvgWrapper {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></SvgWrapper>;
const Activity = (p) => <SvgWrapper {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></SvgWrapper>;
const Edit3 = (p) => <SvgWrapper {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></SvgWrapper>;
const BarChart3 = (p) => <SvgWrapper {...p}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></SvgWrapper>;
const CreditCard = (p) => <SvgWrapper {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></SvgWrapper>;
const PiggyBank = (p) => <SvgWrapper {...p}><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.5L20 8.5c0-2.5-1.5-3.5-1-3.5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></SvgWrapper>;
const PieChart = (p) => <SvgWrapper {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></SvgWrapper>;
const CheckSquare = (p) => <SvgWrapper {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></SvgWrapper>;
const MoreHorizontal = (p) => <SvgWrapper {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></SvgWrapper>;
const ArrowUpRight = (p) => <SvgWrapper {...p}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></SvgWrapper>;
const ArrowDownRight = (p) => <SvgWrapper {...p}><path d="M7 17h10V7"/><path d="M7 7l10 10"/></SvgWrapper>;
const Minus = (p) => <SvgWrapper {...p}><path d="M5 12h14"/></SvgWrapper>;
const BarChart = (p) => <SvgWrapper {...p}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></SvgWrapper>;
const XIconGlobal = (p) => <SvgWrapper {...p}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></SvgWrapper>;

// ============================================================================
// --- Sistema Anticaídas de React ---
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Error en pestaña:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-appcard shadow-neumorph-inset border-l-4 border-neonmagenta rounded-2xl m-4 md:m-8 text-neonmagenta">
          <h2 className="font-black text-lg mb-2 flex items-center gap-2"><AlertCircle size={20} /> Error en esta sección</h2>
          <p className="text-sm opacity-80">{this.state.error.toString()}</p>
          <button onClick={() => this.setState({hasError: false})} className="mt-4 px-5 py-2.5 bg-[#111222] hover:shadow-glow-magenta text-neonmagenta rounded-xl text-sm font-bold transition-all border border-neonmagenta/30">Intentar cargar de nuevo</button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// ============================================================================
// --- UTILIDADES GLOBALES ---
// ============================================================================
const formatCOP = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const getTasaMensual = (tasaEA) => Math.pow(1 + tasaEA / 100, 1 / 12) - 1;
const deleteItem = (setter, id) => setter(prev => prev.filter(item => item.id !== id));

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
};

const getLocalToday = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const loadSheetJS = async () => {
  if (window.XLSX) return window.XLSX;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('No se pudo cargar SheetJS'));
    document.head.appendChild(script);
  });
};

// ============================================================================
// 💎 COMPONENTES UI BASE (DISEÑO DARK NEUMORPHISM & NEON)
// ============================================================================

// ✨ 1. TARJETA BASE (Card 3D)
const Card = ({ children, className = "", onClick }) => {
  const baseClass = "bg-appcard rounded-[20px] shadow-neumorph border border-white/[0.02] p-4 md:p-6 transition-all duration-300";
  const interactiveClass = onClick ? "cursor-pointer hover:shadow-glow-cyan hover:-translate-y-1 active:translate-y-0 active:shadow-neumorph-inset" : "";
  return (
    <div onClick={onClick} className={`${baseClass} ${interactiveClass} ${className}`}>
      {children}
    </div>
  );
};

// ✨ 2. ENTRADA DE TEXTO (Input Hundido Neón)
const Input = ({ label, type = "text", value, onChange, placeholder, className="", min, max, step, disabled, error, title, required, autoFocus }) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && (
      <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${error ? 'text-neonmagenta' : 'text-[#8A92A6]'}`}>
        {label}
      </label>
    )}
    <input 
      type={type} value={value} onChange={onChange} placeholder={placeholder} 
      min={min} max={max} step={step} disabled={disabled} title={title} required={required} autoFocus={autoFocus}
      className={`w-full bg-[#111222] shadow-neumorph-inset border ${error ? 'border-neonmagenta focus:shadow-glow-magenta' : 'border-transparent focus:border-neoncyan focus:shadow-glow-cyan'} rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 disabled:opacity-50`}
    />
    {error && <span className="text-[10px] text-neonmagenta pl-1 font-bold tracking-wide">{error}</span>}
  </div>
);

// ✨ 3. MENÚ DESPLEGABLE (Select Hundido Neón)
const Select = ({ label, value, onChange, options, className="", required, error, disabled, title }) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${error ? 'text-neonmagenta' : 'text-[#8A92A6]'}`}>{label}</label>}
    <div className="relative">
      <select 
        value={value} onChange={onChange} required={required} disabled={disabled} title={title}
        className={`w-full bg-[#111222] shadow-neumorph-inset border ${error ? 'border-neonmagenta focus:shadow-glow-magenta' : 'border-transparent focus:border-neoncyan focus:shadow-glow-cyan'} rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50`}
      >
        <option value="" className="bg-[#111222] text-slate-500">Seleccione...</option>
        {options.map((opt, i) => {
          const val = typeof opt === 'object' && opt !== null ? opt.value : opt;
          const lbl = typeof opt === 'object' && opt !== null ? opt.label : opt;
          return <option key={i} value={val} className="bg-[#111222] text-white">{lbl}</option>;
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <ChevronDownIcon size={16} />
      </div>
    </div>
    {error && <span className="text-[10px] text-neonmagenta pl-1 font-bold tracking-wide">{error}</span>}
  </div>
);

// ✨ 4. ALERTAS FLOTANTES (Toast Neón)
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-24 md:bottom-10 right-4 md:right-10 px-5 py-4 rounded-2xl shadow-neumorph z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 border ${toast.type === 'success' ? 'bg-appcard border-neoncyan/50 text-neoncyan' : 'bg-appcard border-neonmagenta/50 text-neonmagenta'}`}>
      {toast.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
      <span className="text-sm font-bold tracking-wide">{toast.msg}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"><XIconGlobal size={14}/></button>
    </div>
  );
};

// ============================================================================
// --- COMPONENTES EXTRAS (TARJETAS DE PAGOS FIJOS/INGRESOS RÁPIDOS) ---
// ============================================================================
const PagoFijoCard = ({ pf, cuentasPermitidas, onPay }) => {
  const [cuentaId, setCuentaId] = useState('');
  const [montoCustom, setMontoCustom] = useState(pf.monto);
  const [editMonto, setEditMonto] = useState(false);

  return (
    <div className="bg-appcard shadow-neumorph border border-white/[0.02] rounded-2xl p-4 flex flex-col gap-3 transition-colors hover:shadow-glow-magenta">
      <div className="flex justify-between items-start">
        <div className="overflow-hidden pr-2 flex-1">
          <p className="font-bold text-white text-sm truncate leading-tight">{pf.descripcion}</p>
          <p className="text-[10px] font-bold tracking-widest text-[#8A92A6] truncate uppercase mt-1">{pf.categoria}</p>
        </div>
        <div className="shrink-0 text-right">
          {!editMonto ? (
            <p className="font-black text-neonmagenta text-sm cursor-pointer flex items-center justify-end gap-1.5 hover:text-white" onClick={() => setEditMonto(true)} title="Modificar monto">
              {formatCOP(montoCustom)} <Edit3 size={12} className="opacity-70"/>
            </p>
          ) : (
            <input type="number" value={montoCustom} onChange={(e) => setMontoCustom(e.target.value)} onBlur={() => setEditMonto(false)} className="w-24 text-sm font-bold bg-[#111222] shadow-neumorph-inset text-neonmagenta rounded-lg p-1.5 text-right outline-none" autoFocus />
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center mt-2 border-t border-white/[0.05] pt-3">
        <select value={cuentaId} onChange={e=>setCuentaId(e.target.value)} className="flex-1 bg-[#111222] shadow-neumorph-inset border-transparent rounded-xl px-2 py-2 text-[11px] text-white outline-none focus:border-neoncyan cursor-pointer h-9 appearance-none">
          <option value="">Medio de pago...</option>
          {cuentasPermitidas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button onClick={() => onPay(cuentaId, montoCustom)} className="bg-appcard shadow-neumorph text-neoncyan hover:shadow-glow-cyan hover:-translate-y-0.5 active:shadow-neumorph-inset px-4 rounded-xl font-bold flex items-center justify-center transition-all h-9 text-xs">
          PAGAR
        </button>
      </div>
    </div>
  );
};

const IngresoFijoCard = ({ inc, cuentasPermitidas, onReceive, cuentas }) => {
  const defaultCuenta = cuentas.find(c => c.name.includes(inc.cuentaName));
  const [cuentaId, setCuentaId] = useState(defaultCuenta ? defaultCuenta.id : '');
  const [montoCustom, setMontoCustom] = useState(inc.monto);
  const [editMonto, setEditMonto] = useState(false);

  return (
    <div className="bg-appcard shadow-neumorph border border-white/[0.02] rounded-2xl p-5 flex flex-col justify-between hover:shadow-glow-cyan transition-colors">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-bold text-white text-base">{inc.descripcion}</p>
            <p className="text-[10px] font-bold tracking-widest text-[#8A92A6] uppercase mt-1">{inc.persona ? `${inc.persona} • ` : ''}{inc.tipo}</p>
          </div>
          <div className="text-right">
            {!editMonto ? (
              <p className="font-black text-neoncyan cursor-pointer flex items-center gap-1.5 hover:text-white transition-colors" onClick={() => setEditMonto(true)} title="Clic para modificar monto">
                {formatCOP(montoCustom)} <Edit3 size={14}/>
              </p>
            ) : (
              <input type="number" value={montoCustom} onChange={(e) => setMontoCustom(e.target.value)} onBlur={() => setEditMonto(false)} className="w-28 text-sm font-bold bg-[#111222] shadow-neumorph-inset text-neoncyan rounded-lg p-2 text-right outline-none" autoFocus />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/[0.05]">
        <label className="text-[10px] text-[#8A92A6] font-bold uppercase tracking-widest">Destino de los fondos</label>
        <div className="flex gap-2">
          <select value={cuentaId} onChange={e=>setCuentaId(e.target.value)} className="flex-1 bg-[#111222] shadow-neumorph-inset border-transparent rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-neoncyan appearance-none cursor-pointer">
            <option value="">Selecciona...</option>
            {cuentasPermitidas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button onClick={() => onReceive(cuentaId, montoCustom)} className="bg-appcard shadow-neumorph text-neoncyan hover:shadow-glow-cyan hover:-translate-y-0.5 active:shadow-neumorph-inset px-5 rounded-xl font-bold flex items-center justify-center transition-all">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
