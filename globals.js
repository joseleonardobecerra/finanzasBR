const { useState, useMemo, useEffect, useRef } = React;

// ============================================================================
// ☁️ CONFIGURACIÓN DE FIREBASE (Con tus credenciales)
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

// ✨ NUEVO: Inicializar Autenticación de Firebase
const auth = firebase.auth();

// ✨ ACTIVAR MODO OFFLINE
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

// ============================================================================
// --- Sistema Anticaídas de React ---
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error, errorInfo) { 
    console.error("Error en pestaña:", error, errorInfo); 
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-950/30 border border-rose-500 rounded-xl m-4 md:m-8 text-rose-400">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <AlertCircle size={20} /> Error en esta sección
          </h2>
          <p className="text-sm opacity-80">{this.state.error.toString()}</p>
          <button onClick={() => this.setState({hasError: false})} className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-sm font-bold">
            Intentar cargar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// ============================================================================
// --- UTILIDADES ---
// ============================================================================
const formatCOP = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const getTasaMensual = (tasaEA) => Math.pow(1 + tasaEA / 100, 1 / 12) - 1;
const deleteItem = (setter, id) => setter(prev => prev.filter(item => item.id !== id));

// Fallback robusto para generación de IDs
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
// --- Componentes UI Base ---
// ============================================================================
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-4 md:p-5 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder, className="", min, max, step, disabled, error, title }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className={`text-xs font-medium ${error ? 'text-rose-400' : 'text-slate-400'}`}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step} disabled={disabled} title={title}
      className={`bg-slate-950 border ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'} rounded-lg px-3 py-2.5 md:py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50`} />
    {error && <span className="text-[10px] text-rose-400 mt-0.5">{error}</span>}
  </div>
);

const Select = ({ label, value, onChange, options, className="", required, error, disabled }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className={`text-xs font-medium ${error ? 'text-rose-400' : 'text-slate-400'}`}>{label}</label>
    <select value={value} onChange={onChange} required={required} disabled={disabled}
      className={`bg-slate-950 border ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'} rounded-lg px-3 py-2.5 md:py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50`}>
      <option value="">Seleccione...</option>
      {options.map((opt, i) => {
        const val = typeof opt === 'object' && opt !== null ? opt.value : opt;
        const lbl = typeof opt === 'object' && opt !== null ? opt.label : opt;
        return <option key={i} value={val}>{lbl}</option>;
      })}
    </select>
    {error && <span className="text-[10px] text-rose-400 mt-0.5">{error}</span>}
  </div>
);

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-24 md:bottom-10 right-4 md:right-10 px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
      {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
      <span className="text-sm font-medium">{toast.msg}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><Trash2 size={14} className="hidden"/></button>
    </div>
  );
};

const PagoFijoCard = ({ pf, cuentasPermitidas, onPay }) => {
  const [cuentaId, setCuentaId] = useState('');
  const [montoCustom, setMontoCustom] = useState(pf.monto);
  const [editMonto, setEditMonto] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-white text-base">{pf.descripcion}</p>
            <p className="text-xs text-slate-400">{pf.categoria}</p>
          </div>
          <div className="text-right">
            {!editMonto ? (
              <p className="font-bold text-amber-400 cursor-pointer flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 hover:border-amber-500/50 transition-colors" onClick={() => setEditMonto(true)} title="Clic para modificar monto">
                {formatCOP(montoCustom)} <Edit3 size={12}/>
              </p>
            ) : (
              <input type="number" value={montoCustom} onChange={(e) => setMontoCustom(e.target.value)} onBlur={() => setEditMonto(false)} className="w-24 text-sm bg-slate-950 text-white border border-indigo-500 rounded p-1.5 text-right outline-none shadow-inner" autoFocus />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-800">
        <label className="text-[10px] text-slate-500 font-bold uppercase">Medio de pago</label>
        <div className="flex gap-2">
          <select value={cuentaId} onChange={e=>setCuentaId(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500">
            <option value="">Selecciona...</option>
            {cuentasPermitidas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button onClick={() => onPay(cuentaId, montoCustom)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-lg font-bold flex items-center justify-center transition-colors shadow-md">
            OK
          </button>
        </div>
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
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-white text-base">{inc.descripcion}</p>
            <p className="text-xs text-slate-400">{inc.persona ? `Persona: ${inc.persona} • ` : ''}{inc.tipo}</p>
          </div>
          <div className="text-right">
            {!editMonto ? (
              <p className="font-bold text-emerald-400 cursor-pointer flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 hover:border-emerald-500/50 transition-colors" onClick={() => setEditMonto(true)} title="Clic para modificar monto">
                {formatCOP(montoCustom)} <Edit3 size={12}/>
              </p>
            ) : (
              <input type="number" value={montoCustom} onChange={(e) => setMontoCustom(e.target.value)} onBlur={() => setEditMonto(false)} className="w-24 text-sm bg-slate-950 text-white border border-emerald-500 rounded p-1.5 text-right outline-none shadow-inner" autoFocus />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-800">
        <label className="text-[10px] text-slate-500 font-bold uppercase">Destino de los fondos</label>
        <div className="flex gap-2">
          <select value={cuentaId} onChange={e=>setCuentaId(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500">
            <option value="">Selecciona...</option>
            {cuentasPermitidas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button onClick={() => onReceive(cuentaId, montoCustom)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-lg font-bold flex items-center justify-center transition-colors shadow-md">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
