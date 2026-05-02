const { useState, useMemo, useEffect, useRef } = React;

// ============================================================================
// ☁️ CONFIGURACIÓN DE FIREBASE (Global)
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

// ============================================================================
// --- UTILIDADES GLOBALES (Disponibles para todas las pestañas) ---
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
// ✨ DICCIONARIO MAESTRO DE CATEGORÍAS AUTOMATIZADO
// ============================================================================
const CATEGORIAS_CONFIG = {
  "🏠 Vivienda y Servicios": [
    { específico: "Arriendo", sub: "Hogar" },
    { específico: "Administración", sub: "Hogar" },
    { específico: "CENS (Luz)", sub: "Servicios Públicos" },
    { específico: "Gases del Oriente (Gas)", sub: "Servicios Públicos" },
    { específico: "Aqualia (Agua)", sub: "Servicios Públicos" },
    { específico: "Internet Hogar", sub: "Servicios Públicos" },
    { específico: "Mantenimiento", sub: "Hogar" }
  ],
  "🛒 Mercado y Aseo": [
    { específico: "Supermercado Único", sub: "Mercado" },
    { específico: "Supermercado / Tienda", sub: "Mercado" },
    { específico: "Aseo hogar", sub: "Aseo" },
    { específico: "Mercado Aseo", sub: "Aseo" },
    { específico: "Botellón Agua", sub: "Botellón Agua" }
  ],
  "🍔 Alimentación y Ocio": [
    { específico: "Restaurante & Otros", sub: "Alimentación" },
    { específico: "Panadería", sub: "Alimentación" },
    { específico: "Salidas", sub: "Ocio" }
  ],
  "🚗 Vehículo": [
    { específico: "Gasolina", sub: "Gasolina" },
    { específico: "Seguro vehículo", sub: "Seguro vehículo" },
    { específico: "Impuesto vehículo", sub: "Impuestos" },
    { específico: "Tecnomecánica / Mantenimiento", sub: "Mantenimiento" },
    { específico: "Lavado vehículo", sub: "Mantenimiento" },
    { específico: "Seguro Deudor Vehículo", sub: "Seguro vehículo" },
    { específico: "Parqueadero", sub: "Operativo" },
    { específico: "Otros", sub: "Otros" }
  ],
  "💳 Obligaciones (Deudas)": [
    { específico: "Rappicard Leo", sub: "Tarjeta de Crédito L" },
    { específico: "Falabella Leo", sub: "Tarjeta de Crédito L" },
    { específico: "Nu Bank Leo", sub: "Tarjeta de Crédito L" },
    { específico: "Intereses Leo", sub: "Tarjeta de Crédito L" },
    { específico: "Davibank Andre", sub: "Tarjeta de Crédito A" },
    { específico: "Banco de Bogotá Andre", sub: "Tarjeta de Crédito A" },
    { específico: "Nu Bank Andre", sub: "Tarjeta de Crédito A" },
    { específico: "Intereses Andre", sub: "Tarjeta de Crédito A" },
    { específico: "Lulo Bank Andre", sub: "Crédito" },
    { específico: "Crédito de vehículo Leo", sub: "Crédito" }
  ],
  "👥 Familia": [
    { específico: "Sura Andre", sub: "Seguro de Vida" },
    { específico: "Sura Leo", sub: "Seguro de Vida" },
    { específico: "Peluquería Andre", sub: "Cuidado personal" },
    { específico: "Barbería Leo", sub: "Cuidado personal" },
    { específico: "Celular Leo", sub: "Celular" },
    { específico: "Celular Andrea", sub: "Celular" },
    { específico: "Manicure / Pedicure", sub: "Cuidado personal" },
    { específico: "Snacks Andre", sub: "Gastos hormiga" },
    { específico: "Snacks Leo", sub: "Gastos hormiga" }
  ],
  "👧👦 Tobías y Salomé": [
    { específico: "Snacks hijos", sub: "Gastos hormiga" },
    { específico: "Colegio hijos", sub: "Educación" },
    { específico: "Deporte hijos", sub: "Extracurricular" },
    { específico: "Peluquería hijos", sub: "Cuidado personal" },
    { específico: "Otros", sub: "Otros" }
  ],
  "⚕️ Salud": [
    { específico: "Cita médica", sub: "Citas médicas" },
    { específico: "Droguería", sub: "Medicamentos y otros" }
  ],
  "💻 Digital": [
    { específico: "HBO Max", sub: "Suscripciones Digitales" },
    { específico: "Inteligencia Artificial", sub: "Suscripciones Digitales" },
    { específico: "Otros", sub: "Suscripciones Digitales" }
  ],
  "📈 Futuro": [
    { específico: "Inversión", sub: "Inversión" }
  ]
};

// ============================================================================
// 🛡️ CÁPSULA PRINCIPAL DE LA APLICACIÓN
// ============================================================================
const App = (() => {

  // --- ÍCONOS SVG ---
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

  const SearchIcon = (p) => <SvgWrapper {...p}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></SvgWrapper>;
  const ArrowLeftIcon = (p) => <SvgWrapper {...p}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></SvgWrapper>;
  const EyeIcon = ({ size=20, off=false, className="" }) => (
    off ? <SvgWrapper size={size} className={className}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></SvgWrapper>
        : <SvgWrapper size={size} className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></SvgWrapper>
  );

  // ✨ SISTEMA ANTICAÍDAS EXTRAÍDO Y BLINDADO
  class ErrorBoundary extends React.Component {
    constructor(props) { 
      super(props); 
      this.state = { hasError: false, error: null }; 
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("Error capturado por la Cápsula:", error, errorInfo); }
    render() {
      if (this.state.hasError) {
        return (
          <div className="p-6 bg-[#111222] shadow-neumorph-inset border-l-4 border-neonmagenta rounded-3xl m-4 md:m-8 text-white relative z-50">
            <h2 className="font-black text-xl mb-3 flex items-center gap-2 text-neonmagenta"><AlertCircle size={24} /> Sistema Protegido</h2>
            <p className="text-sm font-bold opacity-80 mb-6">El motor interceptó un error de renderizado y evitó que la aplicación colapsara.</p>
            <div className="bg-[#0b0c16] p-4 rounded-xl text-[10px] text-slate-500 font-mono overflow-auto max-h-32 mb-6">
              {this.state.error && this.state.error.toString()}
            </div>
            <button onClick={() => this.setState({hasError: false})} className="px-6 py-3 bg-neonmagenta hover:bg-[#ff1a8c] shadow-glow-magenta text-[#0b0c16] rounded-xl text-sm font-black transition-all tracking-widest uppercase">
              Recargar Vista
            </button>
          </div>
        );
      }
      return this.props.children; 
    }
  }

  const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    return (
      <div className={`fixed bottom-24 md:bottom-10 right-4 md:right-10 px-5 py-4 rounded-2xl shadow-neumorph z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-5 border ${toast.type === 'success' ? 'bg-appcard border-neoncyan/50 text-neoncyan' : 'bg-appcard border-neonmagenta/50 text-neonmagenta'}`}>
        {toast.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
        <span className="text-sm font-bold tracking-wide">{toast.msg}</span>
        <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"><XIconGlobal size={14}/></button>
      </div>
    );
  };

  // --- APLICACIÓN PRINCIPAL ---
  const AppComponent = () => {
    const { useState, useMemo, useEffect, useRef } = React;
    const [appCargando, setAppCargando] = useState(true);
    const [authUser, setAuthUser] = useState(null);
    const [authChecking, setAuthChecking] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedMonth, setSelectedMonth] = useState(() => {
      const d = new Date();
      const año = d.getFullYear(); 
      const mes = String(d.getMonth() + 1).padStart(2, '0'); 
      return `${año}-${mes}`; 
    });
    const [toast, setToast] = useState(null);
    const [filtroPersona, setFiltroPersona] = useState('Total');
    const [scoreHistory, setScoreHistory] = useState({});

    // Modo Privacidad y Buscador Global
    const [privacyMode, setPrivacyMode] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Wizard Registro Rápido
    const [quickEntryOpen, setQuickEntryOpen] = useState(false);
    const [qeStep, setQeStep] = useState(1);
    const [qeType, setQeType] = useState('');
    const [qeMonto, setQeMonto] = useState('');
    const [qeCategoria, setQeCategoria] = useState(''); 
    const [qeDescripcion, setQeDescripcion] = useState(''); 
    const [qeSubcategoria, setQeSubcategoria] = useState(''); 
    const [qeMethod, setQeMethod] = useState('');
    const [qeCuenta, setQeCuenta] = useState('');

    // DESHACER ELIMINACIÓN
    const [undoItem, setUndoItem] = useState(null);
    const undoTimerRef = useRef(null);

    useEffect(() => {
      const on = () => setIsOffline(false);
      const off = () => setIsOffline(true);
      window.addEventListener('online', on);
      window.addEventListener('offline', off);
      return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => { setAuthUser(user); setAuthChecking(false); });
      return () => unsubscribe();
    }, []);

    const showToast = (msg, type = 'success', undoData = null) => {
      setToast({ msg, type, undoData });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => { setToast(null); setUndoItem(null); }, 5000);
    };

    const changeMonth = (offset) => {
      const [y, m] = selectedMonth.split('-');
      const d = new Date(y, parseInt(m) - 1 + offset, 1);
      setSelectedMonth(d.toISOString().slice(0, 7));
    };
    const getMonthName = (ym) => {
      const [y, m] = ym.split('-');
      return new Date(y, parseInt(m) - 1, 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    };

    const currentRealMonth = new Date().toISOString().slice(0, 7);
    const isHistoricalMonth = selectedMonth !== currentRealMonth;

    const [cuentas, setCuentas] = useState([]);
    const [transferencias, setTransferencias] = useState([]);
    const [ingresos, setIngresos] = useState([]);
    const [egresos, setEgresos] = useState([]);
    const [comprasCuotas, setComprasCuotas] = useState([]);
    const [presupuestos, setPresupuestos] = useState([]);
    const [pagosFijos, setPagosFijos] = useState([]);
    const [ingresosFijos, setIngresosFijos] = useState([]);

    const loadedRef = useRef(0);
    const TOTAL_COL = 9;
    const markLoaded = () => { loadedRef.current += 1; if (loadedRef.current >= TOTAL_COL) setAppCargando(false); };

    useEffect(() => {
      if (!authUser) return;
      loadedRef.current = 0;
      setAppCargando(true);

      // ✨ LA VACUNA: Sanitizador Automático de Datos de Firebase
      const sanitizeData = (item) => {
        if (item.categoria && typeof item.categoria === 'object') {
           item.categoria = item.categoria.sub || item.categoria.específico || 'Otros';
        }
        if (item.subcategoria && typeof item.subcategoria === 'object') {
           item.subcategoria = item.subcategoria.sub || item.subcategoria.específico || 'Otros';
        }
        if (item.descripcion && typeof item.descripcion === 'object') {
           item.descripcion = item.descripcion.específico || item.descripcion.sub || 'Gasto no definido';
        }
        return item;
      };

      const col = (name, setter) => db.collection(name).onSnapshot(snap => { 
        setter(snap.docs.map(d => sanitizeData(d.data()))); 
        markLoaded(); 
      });

      const unsubs = [
        col('cuentas', setCuentas), col('transferencias', setTransferencias), col('ingresos', setIngresos),
        col('egresos', setEgresos), col('comprasCuotas', setComprasCuotas), col('presupuestos', setPresupuestos),
        col('pagosFijos', setPagosFijos), col('ingresosFijos', setIngresosFijos),
        db.collection('sistema').doc('scoreHistory').onSnapshot(snap => { if (snap.exists) setScoreHistory(snap.data()); markLoaded(); }),
      ];
      return () => unsubs.forEach(u => u());
    }, [authUser]);

    const fire = {
      add: (colName, data) => db.collection(colName).doc(data.id).set(data),
      update: (colName, id, data) => db.collection(colName).doc(id).set(data, { merge: true }),
      remove: (colName, id) => db.collection(colName).doc(id).delete(),
      bulkReplace: async (colName, newArray) => {
        const existing = await db.collection(colName).get();
        for (let i = 0; i < existing.docs.length; i += 450) {
          const batch = db.batch(); existing.docs.slice(i, i + 450).forEach(d => batch.delete(d.ref)); await batch.commit();
        }
        for (let i = 0; i < newArray.length; i += 450) {
          const batch = db.batch(); newArray.slice(i, i + 450).forEach(item => batch.set(db.collection(colName).doc(item.id), item)); await batch.commit();
        }
      },
    };

    const removeWithUndo = (colName, id, data, label) => {
      fire.remove(colName, id);
      setUndoItem({ colName, data });
      showToast(`${label} eliminado/a.`, 'error', { colName, data });
    };
    const handleUndo = () => {
      if (!undoItem) return;
      fire.add(undoItem.colName, undoItem.data);
      setUndoItem(null);
      setToast(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      showToast('¡Registro restaurado!', 'success');
    };

    const addCuenta = (d) => fire.add('cuentas', d);
    const updateCuenta = (id, d) => fire.update('cuentas', id, d);
    const removeCuenta = (id, data) => data ? removeWithUndo('cuentas', id, data, 'Cuenta') : fire.remove('cuentas', id);
    const addTransferencia = (d) => fire.add('transferencias', d);
    const removeTransferencia = (id, data) => data ? removeWithUndo('transferencias', id, data, 'Transferencia') : fire.remove('transferencias', id);
    const addEgreso = (d) => fire.add('egresos', d);
    const updateEgreso = (id, d) => fire.update('egresos', id, d);
    const removeEgreso = (id, data) => data ? removeWithUndo('egresos', id, data, 'Gasto') : fire.remove('egresos', id);
    const addIngreso = (d) => fire.add('ingresos', d);
    const updateIngreso = (id, d) => fire.update('ingresos', id, d);
    const removeIngreso = (id, data) => data ? removeWithUndo('ingresos', id, data, 'Ingreso') : fire.remove('ingresos', id);
    const addComprasCuotas = (d) => fire.add('comprasCuotas', d);
    const removeComprasCuotas = (id, data) => data ? removeWithUndo('comprasCuotas', id, data, 'Cuota') : fire.remove('comprasCuotas', id);
    const addPresupuesto = (d) => fire.add('presupuestos', d);
    const updatePresupuesto = (id, d) => fire.update('presupuestos', id, d);
    const removePresupuesto = (id) => fire.remove('presupuestos', id);
    const addPagoFijo = (d) => fire.add('pagosFijos', d);
    const updatePagoFijo = (id, d) => fire.update('pagosFijos', id, d);
    const removePagoFijo = (id) => fire.remove('pagosFijos', id);
    const addIngresoFijo = (d) => fire.add('ingresosFijos', d);
    const updateIngresoFijo = (id, d) => fire.update('ingresosFijos', id, d);
    const removeIngresoFijo = (id) => fire.remove('ingresosFijos', id);

    const importAllState = async (p) => {
      const cols = [['cuentas', p.cuentas], ['transferencias', p.transferencias], ['ingresos', p.ingresos], ['egresos', p.egresos], ['presupuestos', p.presupuestos], ['pagosFijos', p.pagosFijos], ['comprasCuotas', p.comprasCuotas], ['ingresosFijos', p.ingresosFijos]];
      for (const [n, a] of cols) { if (a && a.length) await fire.bulkReplace(n, a); }
    };

    const addPagoFijoToState = (pf) => addPagoFijo({ ...pf, id: generateId(), diaPago: pf.diaPago || 1, categoria: pf.categoria || 'Otros' });

    const categoriasMaestras = useMemo(() => {
      return Object.keys(CATEGORIAS_CONFIG);
    }, []);

    const calculatedAccounts = useMemo(() => {
      const accMap = {};
      cuentas.forEach(c => { accMap[c.id] = { ...c, currentBalance: Number(c.initialBalance) || 0, currentDebt: Number(c.initialDebt) || 0, montoPrestado: Number(c.montoPrestado) || Number(c.initialDebt) || 0, totalPagado: Number(c.totalPagadoPrevio) || 0, lastPaymentDate: c.lastPaymentDate || null }; });
      ingresos.forEach(i => { if (accMap[i.cuentaId]) accMap[i.cuentaId].currentBalance += Number(i.monto); });
      const sortedEgresos = [...egresos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      sortedEgresos.forEach(e => {
        if (accMap[e.cuentaId]) {
          if (['credit', 'loan'].includes(accMap[e.cuentaId].type)) accMap[e.cuentaId].currentDebt += Number(e.monto);
          else accMap[e.cuentaId].currentBalance -= Number(e.monto);
        }
        if (e.deudaId && accMap[e.deudaId]) {
          const account = accMap[e.deudaId]; account.totalPagado += Number(e.monto);
          if (account.type === 'loan') {
            let capital = Number(e.monto);
            if (account.lastPaymentDate) {
              const diffDays = Math.round(Math.abs(new Date(e.fecha) - new Date(account.lastPaymentDate)) / 86400000);
              const tasaDiaria = Math.pow(1 + account.tasaEA / 100, 1 / 360) - 1;
              capital = Number(e.monto) - account.currentDebt * tasaDiaria * diffDays;
            } else { capital = Number(e.monto) - account.currentDebt * getTasaMensual(account.tasaEA); }
            account.lastPaymentDate = e.fecha; account.currentDebt = Math.max(0, account.currentDebt - capital);
          } else { account.currentDebt = Math.max(0, account.currentDebt - Number(e.monto)); }
        }
      });
      transferencias.forEach(t => {
        if (accMap[t.fromId]) { if (['credit', 'loan'].includes(accMap[t.fromId].type)) accMap[t.fromId].currentDebt += Number(t.monto); else accMap[t.fromId].currentBalance -= Number(t.monto); }
        if (accMap[t.toId]) { if (['credit', 'loan'].includes(accMap[t.toId].type)) accMap[t.toId].currentDebt = Math.max(0, accMap[t.toId].currentDebt - Number(t.monto)); else accMap[t.toId].currentBalance += Number(t.monto); }
      });
      return Object.values(accMap);
    }, [cuentas, ingresos, egresos, transferencias]);

    const getOwnerFallback = (text) => {
      if (!text) return 'Shared'; const t = text.toUpperCase();
      const hasL = t.includes('LEO') || t.endsWith(' L') || t.includes(' L '); const hasA = t.includes('ANDRE') || t.includes('ANDRÉ') || t.endsWith(' A') || t.includes(' A ');
      if (hasL && !hasA) return 'Leo'; if (hasA && !hasL) return 'Andre'; return 'Shared';
    };
    const belongsToFilter = (owner) => filtroPersona === 'Total' || owner === 'Shared' || owner === filtroPersona;

    const activeCalculatedAccounts = useMemo(() => calculatedAccounts.filter(c => belongsToFilter(c.ownerId || getOwnerFallback(c.name))), [calculatedAccounts, filtroPersona]);
    const activeIngresos = useMemo(() => ingresos.filter(i => { const ownerAcc = cuentas.find(c => c.id === i.cuentaId); const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared'; return belongsToFilter(accOwner !== 'Shared' ? accOwner : (i.ownerId || getOwnerFallback(i.persona + ' ' + i.descripcion))); }), [ingresos, cuentas, filtroPersona]);
    const activeEgresos = useMemo(() => egresos.filter(e => { const ownerAcc = cuentas.find(c => c.id === e.cuentaId); const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared'; return belongsToFilter(accOwner !== 'Shared' ? accOwner : (e.ownerId || getOwnerFallback(e.descripcion + ' ' + e.categoria))); }), [egresos, cuentas, filtroPersona]);
    const activePagosFijos = useMemo(() => pagosFijos.filter(pf => belongsToFilter(pf.ownerId || getOwnerFallback(pf.descripcion + ' ' + pf.categoria))), [pagosFijos, filtroPersona]);

    const activeIngresosFijos = useMemo(() => {
      const currentMonthNum = selectedMonth.split('-')[1];
      return ingresosFijos.filter(inf => {
        const passFilter = belongsToFilter(inf.ownerId || getOwnerFallback(inf.descripcion + ' ' + inf.persona));
        let passMonth = true;
        if (inf.mesEspecifico) {
          passMonth = inf.mesEspecifico === currentMonthNum;
        } else {
          const descLower = (inf.descripcion || '').toLowerCase();
          if (descLower.includes('prima 1')) passMonth = currentMonthNum === '07';
          else if (descLower.includes('prima 2')) passMonth = currentMonthNum === '12';
        }
        return passFilter && passMonth;
      });
    }, [ingresosFijos, filtroPersona, selectedMonth]);

    const activePresupuestos = useMemo(() => presupuestos.filter(p => belongsToFilter(p.ownerId || getOwnerFallback(p.categoria))), [presupuestos, filtroPersona]);
    const activeComprasCuotas = useMemo(() => comprasCuotas.filter(c => { const ownerAcc = cuentas.find(acc => acc.id === c.tarjetaId); const accOwner = ownerAcc ? (ownerAcc.ownerId || getOwnerFallback(ownerAcc.name)) : 'Shared'; return belongsToFilter(accOwner !== 'Shared' ? accOwner : (c.ownerId || getOwnerFallback(c.descripcion))); }), [comprasCuotas, cuentas, filtroPersona]);
    const activeTransferencias = useMemo(() => transferencias.filter(t => { const ownerFrom = cuentas.find(c => c.id === t.fromId); const ownerTo = cuentas.find(c => c.id === t.toId); return belongsToFilter(ownerFrom ? (ownerFrom.ownerId || getOwnerFallback(ownerFrom.name)) : 'Shared') || belongsToFilter(ownerTo ? (ownerTo.ownerId || getOwnerFallback(ownerTo.name)) : 'Shared'); }), [transferencias, cuentas, filtroPersona]);

    const isThisMonth = (f) => f && f.startsWith(selectedMonth);
    const ingresosMesTotal = useMemo(() => activeIngresos.filter(i => isThisMonth(i.fecha)).reduce((s, i) => s + Number(i.monto), 0), [activeIngresos, selectedMonth]);
    const egresosMesTotal = useMemo(() => activeEgresos.filter(e => isThisMonth(e.fecha)).reduce((s, e) => s + Number(e.monto), 0), [activeEgresos, selectedMonth]);
    const egresosMes = useMemo(() => activeEgresos.filter(e => e.fecha.startsWith(selectedMonth)), [activeEgresos, selectedMonth]);
    const cuotasMesTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type) && c.currentDebt > 0).reduce((s, c) => s + Number(c.cuotaMinima), 0), [activeCalculatedAccounts]);
    const pagosDeCuotasEsteMes = useMemo(() => egresosMes.filter(e => e.tipo === 'Fijo' && (e.categoria.toLowerCase().includes('tarjeta') || e.categoria.toLowerCase().includes('crédito') || e.categoria.toLowerCase().includes('vehículo') || e.categoria.toLowerCase().includes('davibank'))).reduce((sum, e) => sum + e.monto, 0), [egresosMes]);
    const cuotasMesRestantes = Math.max(0, cuotasMesTotal - pagosDeCuotasEsteMes);
    const flujoNetoMes = ingresosMesTotal - egresosMesTotal - cuotasMesRestantes;
    const liquidezTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['bank', 'cash', 'pocket'].includes(c.type)).reduce((s, c) => s + c.currentBalance, 0), [activeCalculatedAccounts]);
    const deudaTotal = useMemo(() => activeCalculatedAccounts.filter(c => ['credit', 'loan'].includes(c.type)).reduce((s, c) => s + c.currentDebt, 0), [activeCalculatedAccounts]);

    const proyeccionLiquidez = useMemo(() => {
      const isPagoFijoRealizadoMes = (pf) => egresosMes.some(e => {
        if (e.tipo !== 'Fijo') return false;
        if (e.pagoFijoId) return e.pagoFijoId === pf.id;
        return e.descripcion.toLowerCase() === (pf.descripcion || '').toLowerCase();
      });
      const pendientesEste = activePagosFijos.filter(pf => !isPagoFijoRealizadoMes(pf)).reduce((s, pf) => s + pf.monto, 0);
      const ingresosFijosTotal = activeIngresosFijos.reduce((s, inf) => s + Number(inf.monto), 0);
      const totalFijosProx = activePagosFijos.reduce((s, pf) => s + pf.monto, 0);
      const liq30 = liquidezTotal + ingresosFijosTotal - pendientesEste - cuotasMesRestantes;
      const liq60 = liq30 + ingresosFijosTotal - totalFijosProx - cuotasMesTotal;
      const liq90 = liq60 + ingresosFijosTotal - totalFijosProx - cuotasMesTotal;
      return { liq30, liq60, liq90 };
    }, [liquidezTotal, activeIngresosFijos, activePagosFijos, egresosMes, cuotasMesRestantes, cuotasMesTotal]);

    const scoreData = useMemo(() => {
      if (ingresosMesTotal === 0 && egresosMesTotal === 0 && cuotasMesTotal === 0 && liquidezTotal === 0) return { score: 0, desglose: [{ text: 'Aún no hay datos.', pts: 0, type: 'neutral' }], recs: [{ico: '📝', title: 'Empieza tu registro', txt: 'Añade datos para evaluar tu salud.'}] };
      let scr = 100; const desgloseArr = [{ text: 'Puntaje Base Ideal', pts: 100, type: 'success' }]; const rr = [];
      if (flujoNetoMes < 0) { scr -= 40; desgloseArr.push({ text: 'Flujo negativo', pts: -40, type: 'danger' }); rr.push({ico: '⚠️', title: 'Flujo Crítico', txt: 'Gastas más de lo que ganas.'}); }
      if (cuotasMesTotal > ingresosMesTotal * 0.4 && ingresosMesTotal > 0) { scr -= 25; desgloseArr.push({ text: 'Deudas > 40%', pts: -25, type: 'danger' }); }
      if (scr === 100) desgloseArr.push({ text: '¡Sin penalizaciones!', pts: 0, type: 'success' });
      return { score: Math.max(0, scr), desglose: desgloseArr, recs: rr };
    }, [flujoNetoMes, cuotasMesTotal, ingresosMesTotal, liquidezTotal]);

    useEffect(() => {
      const cM = new Date().toISOString().slice(0, 7);
      if (selectedMonth === cM && !appCargando) {
        setScoreHistory(prev => {
          if (prev[selectedMonth] !== scoreData.score) {
            const next = { ...prev, [selectedMonth]: scoreData.score };
            db.collection('sistema').doc('scoreHistory').set(next, {merge: true});
            return next;
          }
          return prev;
        });
      }
    }, [scoreData.score, selectedMonth, appCargando]);

    // ============================================================================
    // ✨ WIZARD DE REGISTRO RÁPIDO (CASCADA INTELIGENTE)
    // ============================================================================
    const handleOpenWizard = () => {
      setQeStep(1); setQeType(''); setQeMonto(''); setQeCategoria(''); setQeDescripcion(''); setQeSubcategoria(''); setQeMethod(''); setQeCuenta('');
      setQuickEntryOpen(true);
    };
    
    const opcionesEspecificasWizard = useMemo(() => {
      return qeCategoria && qeType === 'egreso' ? CATEGORIAS_CONFIG[qeCategoria] : [];
    }, [qeCategoria, qeType]);

    const handleQuickSave = () => {
      if (!qeMonto || !qeCategoria || !qeCuenta) return;
      const today = getLocalToday();
      const montoNum = Number(qeMonto);
      
      if (qeType === 'egreso') {
        if (!qeDescripcion) return;
        addEgreso({ 
          id: generateId(), 
          fecha: today, 
          descripcion: qeDescripcion, 
          categoria: qeCategoria, 
          subcategoria: qeSubcategoria,
          monto: montoNum, 
          interesesOtros: 0, 
          cuentaId: qeCuenta, 
          tipo: 'Variable', 
          deudaId: null 
        });
        showToast("Gasto registrado al instante.");
      } else {
        addIngreso({ 
          id: generateId(), 
          fecha: today, 
          descripcion: qeDescripcion || `Ingreso rápido (${qeCategoria})`, 
          categoria: qeCategoria, 
          monto: montoNum, 
          cuentaId: qeCuenta, 
          persona: 'Total', 
          tipo: 'Variable' 
        });
        showToast("Ingreso registrado al instante.");
      }
      setQuickEntryOpen(false);
    };

    // ============================================================================
    // BUSCADOR GLOBAL Y PRIVACIDAD
    // ============================================================================
    const formatCOPPrivacy = (val) => {
      if (privacyMode) return '****';
      return formatCOP(val);
    };

    const searchResults = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const query = searchQuery.toLowerCase();
      
      const formatResult = (item, type, icon, color) => ({
        id: item.id,
        fecha: item.fecha || 'Sin fecha',
        descripcion: item.descripcion || item.name || item.categoria || 'Sin descripción',
        monto: item.monto || item.currentBalance || item.limite || 0,
        tipo: type,
        icon,
        color
      });

      const results = [
        ...activeEgresos.filter(e => (e.descripcion||'').toLowerCase().includes(query) || (e.categoria||'').toLowerCase().includes(query)).map(e => formatResult(e, 'Egreso', '📉', 'text-neonmagenta')),
        ...activeIngresos.filter(i => (i.descripcion||'').toLowerCase().includes(query) || (i.categoria||'').toLowerCase().includes(query)).map(i => formatResult(i, 'Ingreso', '📈', 'text-emerald-400')),
        ...activeTransferencias.filter(t => (t.descripcion||'').toLowerCase().includes(query)).map(t => formatResult(t, 'Transferencia', '🔄', 'text-amber-400')),
        ...activeCalculatedAccounts.filter(c => (c.name||'').toLowerCase().includes(query)).map(c => formatResult(c, 'Cuenta', '🏦', 'text-neoncyan'))
      ];

      return results.sort((a, b) => new Date(b.fecha === 'Sin fecha' ? 0 : b.fecha) - new Date(a.fecha === 'Sin fecha' ? 0 : a.fecha));
    }, [searchQuery, activeEgresos, activeIngresos, activeTransferencias, activeCalculatedAccounts]);

    if (authChecking) return (
      <div className="flex flex-col items-center justify-center h-screen bg-appbg">
        <div className="w-12 h-12 border-4 border-appcard border-t-neoncyan rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
        <p className="text-neoncyan font-bold tracking-widest text-sm uppercase">Validando Acceso...</p>
      </div>
    );
    if (!authUser) return <Login />;
    if (appCargando) return (
      <div className="flex flex-col items-center justify-center h-screen bg-appbg">
        <div className="w-12 h-12 border-4 border-appcard border-t-neonmagenta rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,0,122,0.4)]"></div>
        <p className="text-neonmagenta font-bold tracking-widest text-sm uppercase">Sincronizando Nube...</p>
      </div>
    );

    const navItems = [
      { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
      { id: 'ingresos', label: 'Ingresos', icon: Wallet },
      { id: 'egresos', label: 'Egresos', icon: Receipt },
      { id: 'cuentas', label: 'Cuentas', icon: Landmark },
      { id: 'deudas', label: 'Créditos', icon: ShieldAlert },
      { id: 'presupuestos', label: 'Presupuestos', icon: PieChart },
      { id: 'inversiones', label: 'Inversión y ahorro', icon: PiggyBank },
      { id: 'analitica', label: 'Analítica y Estrategia', icon: BarChart },
      { id: 'simulador', label: 'Simuladores', icon: Calculator },
      { id: 'settings', label: 'Ajustes', icon: Settings2 },
    ];

    return (
      <div className="min-h-screen bg-appbg text-slate-200 flex flex-col md:flex-row font-sans md:pt-0 pt-[24px] relative">

        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

        {/* BARRA LATERAL (PC) */}
        <aside className="hidden md:flex w-64 bg-appcard flex-shrink-0 flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
          <div className="p-6 border-b border-white/[0.02]">
            <h1 className="text-xl font-bold text-white flex items-center gap-3 tracking-wide">
              <img 
                src="logo.png" 
                alt="Logo Finanzas" 
                className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]"
              />
              FinanzasFamilia
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800">
            <div className="text-[10px] font-black text-[#8A92A6] uppercase px-4 mb-3 tracking-widest mt-2">Diario</div>
            {navItems.slice(0, 7).map(i => (
              <button key={i.id} onClick={() => setActiveTab(i.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                  activeTab === i.id 
                  ? 'bg-neoncyan text-[#0b0c16] font-bold shadow-glow-cyan' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 font-medium'
                }`}>
                <i.icon size={18}/> {i.label}
              </button>
            ))}
            
            <div className="text-[10px] font-black text-[#8A92A6] uppercase px-4 mt-8 mb-3 tracking-widest">Estrategia</div>
            {navItems.slice(7, 9).map(i => (
              <button key={i.id} onClick={() => setActiveTab(i.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                  activeTab === i.id 
                  ? 'bg-neoncyan text-[#0b0c16] font-bold shadow-glow-cyan' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 font-medium'
                }`}>
                <i.icon size={18}/> {i.label}
              </button>
            ))}
            
            <div className="text-[10px] font-black text-[#8A92A6] uppercase px-4 mt-8 mb-3 tracking-widest">Sistema</div>
            {navItems.slice(9).map(i => (
              <button key={i.id} onClick={() => setActiveTab(i.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                  activeTab === i.id 
                  ? 'bg-neoncyan text-[#0b0c16] font-bold shadow-glow-cyan' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 font-medium'
                }`}>
                <i.icon size={18}/> {i.label}
              </button>
            ))}
            
            <button onClick={() => auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neonmagenta hover:shadow-glow-magenta hover:-translate-y-0.5 transition-all mt-6 border border-neonmagenta/30 font-bold text-sm bg-[#111222]">
              Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden pb-[72px] md:pb-0 relative">
          
          <div className="bg-appcard border-b border-white/[0.02] p-3 md:p-4 flex justify-between items-center gap-4 z-10">
            <button onClick={() => auth.signOut()} className="md:hidden text-neonmagenta p-2 hover:shadow-glow-magenta rounded-full transition-all">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
            
            {['ingresos', 'deudas'].includes(activeTab) && (
              <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1 w-full md:w-auto border border-transparent">
                <button onClick={() => setFiltroPersona('Total')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${filtroPersona === 'Total' ? 'bg-neoncyan text-[#0b0c16] shadow-glow-cyan' : 'text-slate-500 hover:text-slate-300'}`}>TOTAL</button>
                <button onClick={() => setFiltroPersona('Andre')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${filtroPersona === 'Andre' ? 'bg-neonmagenta text-white shadow-glow-magenta' : 'text-slate-500 hover:text-slate-300'}`}>ANDRE</button>
                <button onClick={() => setFiltroPersona('Leo')} className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${filtroPersona === 'Leo' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}>LEO</button>
              </div>
            )}
            
            <div className="flex-1 flex justify-end w-full md:w-auto gap-3">
              <button onClick={() => setPrivacyMode(!privacyMode)} className="flex items-center justify-center w-[46px] h-[46px] bg-[#111222] shadow-neumorph-inset border border-transparent hover:border-neoncyan/30 rounded-xl text-slate-500 hover:text-neoncyan transition-all" title={privacyMode ? "Mostrar saldos" : "Ocultar saldos"}>
                <EyeIcon size={20} off={privacyMode} />
              </button>
              <button onClick={() => { setIsSearchOpen(true); setTimeout(() => document.getElementById('global-search-input')?.focus(), 100); }} className="flex items-center justify-center w-[46px] h-[46px] bg-[#111222] shadow-neumorph-inset border border-transparent hover:border-neoncyan/30 rounded-xl text-slate-500 hover:text-neoncyan transition-all" title="Buscar en todo el sistema">
                <SearchIcon size={20} />
              </button>
              <div className="flex items-center bg-[#111222] shadow-neumorph-inset rounded-xl p-1 w-full md:max-w-[240px] justify-between">
                <button onClick={() => changeMonth(-1)} className="p-2 text-slate-500 hover:text-neoncyan transition-colors"><ChevronLeft size={18}/></button>
                <span className="font-bold text-white capitalize text-sm tracking-wide">{getMonthName(selectedMonth)}</span>
                <button onClick={() => changeMonth(1)} className="p-2 text-slate-500 hover:text-neoncyan transition-colors"><ChevronRight size={18}/></button>
              </div>
            </div>
          </div>

          {isHistoricalMonth && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-amber-400 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <AlertCircle size={14}/>
              Estás viendo un mes histórico — nuevos registros van a la fecha de hoy
              <button onClick={() => setSelectedMonth(currentRealMonth)} className="ml-auto bg-[#111222] border border-amber-500/30 hover:shadow-glow-amber px-3 py-1 rounded-lg text-amber-300 transition-all font-bold">
                Ir al actual →
              </button>
            </div>
          )}

          <div className="p-4 md:p-8 overflow-y-auto flex-1 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#1c1e32] [&::-webkit-scrollbar-track]:bg-[#141526]">
            <div className="max-w-6xl mx-auto">
              {/* ✨ ESCUDO SEGURO */}
              <ErrorBoundary>
                {activeTab === 'dashboard' && <DashboardTab flujoNetoMes={flujoNetoMes} cuotasMesTotal={cuotasMesTotal} cuotasMesRestantes={cuotasMesRestantes} ingresosMesTotal={ingresosMesTotal} egresosMesTotal={egresosMesTotal} deudaTotal={deudaTotal} liquidezTotal={liquidezTotal} selectedMonth={selectedMonth} egresosMes={egresosMes} ingresos={activeIngresos} egresos={activeEgresos} presupuestos={activePresupuestos} pagosFijos={activePagosFijos} ingresosFijos={activeIngresosFijos} cuentas={activeCalculatedAccounts} proyeccionLiquidez={proyeccionLiquidez} privacyMode={privacyMode} />}
                {activeTab === 'analitica' && <AnaliticaTab ingresos={activeIngresos} egresos={activeEgresos} selectedMonth={selectedMonth} cuentas={activeCalculatedAccounts} scoreData={scoreData} scoreHistory={scoreHistory} proyeccionLiquidez={proyeccionLiquidez} privacyMode={privacyMode} />}
                {activeTab === 'cuentas' && <CuentasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} transferencias={activeTransferencias} addTransferencia={addTransferencia} removeTransferencia={removeTransferencia} addEgreso={addEgreso} showToast={showToast} privacyMode={privacyMode} />}
                {activeTab === 'ingresos' && <IngresosTab ingresos={activeIngresos} addIngreso={addIngreso} updateIngreso={updateIngreso} removeIngreso={removeIngreso} ingresosFijos={activeIngresosFijos} addIngresoFijo={addIngresoFijo} updateIngresoFijo={updateIngresoFijo} removeIngresoFijo={removeIngresoFijo} cuentas={activeCalculatedAccounts} selectedMonth={selectedMonth} showToast={showToast} filtroPersona={filtroPersona} privacyMode={privacyMode} />}
                {activeTab === 'egresos' && <EgresosTab egresos={activeEgresos} addEgreso={addEgreso} updateEgreso={updateEgreso} removeEgreso={removeEgreso} pagosFijos={activePagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} comprasCuotas={activeComprasCuotas} addComprasCuotas={addComprasCuotas} removeComprasCuotas={removeComprasCuotas} cuentas={activeCalculatedAccounts} updateCuenta={updateCuenta} removeCuenta={removeCuenta} selectedMonth={selectedMonth} presupuestos={activePresupuestos} categoriasMaestras={categoriasMaestras} showToast={showToast} privacyMode={privacyMode} />}
                {activeTab === 'presupuestos' && <PresupuestosTab presupuestos={activePresupuestos} addPresupuesto={addPresupuesto} updatePresupuesto={updatePresupuesto} removePresupuesto={removePresupuesto} pagosFijos={activePagosFijos} addPagoFijo={addPagoFijo} updatePagoFijo={updatePagoFijo} removePagoFijo={removePagoFijo} egresos={activeEgresos} selectedMonth={selectedMonth} showToast={showToast} categoriasMaestras={categoriasMaestras} privacyMode={privacyMode} />}
                {activeTab === 'deudas' && <DeudasTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} showToast={showToast} egresos={activeEgresos} selectedMonth={selectedMonth} privacyMode={privacyMode} />}
                {activeTab === 'inversiones' && <InversionesTab cuentas={activeCalculatedAccounts} addCuenta={addCuenta} updateCuenta={updateCuenta} removeCuenta={removeCuenta} ingresos={ingresos} addIngreso={addIngreso} egresos={egresos} transferencias={transferencias} selectedMonth={selectedMonth} showToast={showToast} getOwner={getOwnerFallback} privacyMode={privacyMode} />}
                {activeTab === 'simulador' && <SimuladorTab cuentas={activeCalculatedAccounts} addPagoFijo={addPagoFijoToState} showToast={showToast} privacyMode={privacyMode} />}
                {activeTab === 'settings' && <SettingsTab stateData={{cuentas, transferencias, ingresos, egresos, presupuestos, pagosFijos, comprasCuotas, ingresosFijos}} importAllState={importAllState} selectedMonth={selectedMonth} showToast={showToast} />}
              </ErrorBoundary>
            </div>
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-appcard/90 backdrop-blur-xl border-t border-white/[0.02] z-30 flex overflow-x-auto h-[72px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex px-2 min-w-max w-full">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="w-[76px] flex flex-col items-center justify-center p-2 relative group">
                {activeTab === item.id && <div className="absolute top-0 w-8 h-1 bg-neoncyan rounded-b-full shadow-glow-cyan"></div>}
                <item.icon size={22} className={`transition-all duration-300 ${activeTab === item.id ? 'mb-1 text-neoncyan' : 'mb-1 text-slate-500 group-hover:text-slate-300'}`}/>
                <span className={`text-[9px] font-bold tracking-wide truncate w-full text-center transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <button onClick={handleOpenWizard} className="fixed bottom-[90px] md:bottom-8 right-4 md:right-8 w-14 h-14 bg-neoncyan text-[#0b0c16] rounded-full shadow-glow-cyan flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95">
          <Plus size={28} strokeWidth="3" />
        </button>

        {quickEntryOpen && (
          <div className="fixed inset-0 bg-[#0b0c16]/80 backdrop-blur-md z-50 flex items-end md:items-center justify-center animate-in fade-in duration-300">
            <div className="bg-appcard w-full md:w-[420px] md:rounded-[30px] rounded-t-[30px] p-6 border border-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-10 min-h-[420px] flex flex-col relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-neoncyan/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                  {qeStep > 1 && <button onClick={() => setQeStep(qeStep - 1)} className="text-slate-400 hover:text-neoncyan transition-colors"><ArrowLeftIcon size={20}/></button>}
                  <div>
                    <h3 className="text-lg font-black text-white tracking-wide">Acción Rápida</h3>
                    <div className="flex gap-1.5 mt-2">
                      {[1,2,3,4,5].map(s => <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === qeStep ? 'bg-neoncyan w-6 shadow-glow-cyan' : s < qeStep ? 'bg-neoncyan/40 w-3' : 'bg-[#111222] w-3'}`}></div>)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setQuickEntryOpen(false)} className="text-slate-500 hover:text-rose-400 bg-[#111222] p-2.5 rounded-full transition-all hover:shadow-glow-magenta"><XIconGlobal size={18}/></button>
              </div>

              <div className="flex-1 flex flex-col justify-center relative z-10 animate-in fade-in slide-in-from-right-4 duration-300">
                {qeStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-center text-[#8A92A6] font-black uppercase tracking-widest text-xs mb-6">Selecciona el tipo de movimiento</h4>
                    <button onClick={() => { setQeType('egreso'); setQeStep(2); }} className="w-full flex items-center justify-center gap-3 p-5 bg-[#111222] border border-rose-500/20 hover:border-rose-500 hover:shadow-glow-magenta rounded-2xl text-rose-400 font-black text-lg transition-all hover:-translate-y-1">📉 Registrar Gasto</button>
                    <button onClick={() => { setQeType('ingreso'); setQeStep(2); }} className="w-full flex items-center justify-center gap-3 p-5 bg-[#111222] border border-emerald-500/20 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-2xl text-emerald-400 font-black text-lg transition-all hover:-translate-y-1">📈 Registrar Ingreso</button>
                  </div>
                )}
                {qeStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${qeType === 'egreso' ? 'text-rose-500' : 'text-emerald-500'}`}>Monto exacto</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600">$</span>
                        <input type="number" value={qeMonto} onChange={e=>setQeMonto(e.target.value)} className={`w-full bg-[#111222] shadow-neumorph-inset border border-transparent ${qeType === 'egreso' ? 'focus:border-rose-500 focus:shadow-glow-magenta text-rose-400' : 'focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-emerald-400'} rounded-2xl pl-10 pr-4 py-5 text-3xl font-black outline-none transition-all placeholder:text-slate-700`} placeholder="0" autoFocus />
                      </div>
                    </div>
                    {qeType === 'ingreso' && (
                      <div>
                        <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest block mb-2">Descripción (Opcional)</label>
                        <input type="text" value={qeDescripcion} onChange={e=>setQeDescripcion(e.target.value)} className="w-full bg-[#111222] shadow-neumorph-inset border border-transparent focus:border-neoncyan text-white rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-slate-600" placeholder="Ej: Pago quincena" />
                      </div>
                    )}
                    <button disabled={!qeMonto} onClick={() => setQeStep(3)} className="w-full py-4 rounded-xl font-black text-[#0b0c16] text-lg bg-neoncyan shadow-glow-cyan disabled:opacity-20 disabled:shadow-none transition-all">Siguiente Paso</button>
                  </div>
                )}
                {qeStep === 3 && (
                  <div className="h-full flex flex-col">
                    <h4 className="text-center text-[#8A92A6] font-black uppercase tracking-widest text-xs mb-4">Selecciona la Categoría Macro</h4>
                    <div className="flex-1 overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                      <div className="grid grid-cols-2 gap-2.5">
                        {(qeType === 'egreso' ? Object.keys(CATEGORIAS_CONFIG) : ['Salario', 'Honorarios', 'Transferencia', 'Inversión', 'Regalo', 'Otros']).map(cat => (
                          <button key={cat} onClick={() => { 
                            setQeCategoria(cat); 
                            if(qeType === 'ingreso') { setQeStep(4); }
                            else { setQeStep(3.5); }
                          }} className="p-3.5 rounded-xl text-xs font-bold text-left transition-all border border-white/[0.02] bg-[#111222] text-slate-300 hover:border-neoncyan hover:shadow-glow-cyan active:scale-95">{cat}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {qeStep === 3.5 && (
                  <div className="h-full flex flex-col">
                    <h4 className="text-center text-[#8A92A6] font-black uppercase tracking-widest text-xs mb-4">¿Qué pagaste exactamente?</h4>
                    <div className="flex-1 overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                      <div className="grid grid-cols-1 gap-2.5">
                        {opcionesEspecificasWizard.map(opt => (
                          <button key={opt.específico} onClick={() => { 
                            setQeDescripcion(opt.específico); 
                            setQeSubcategoria(opt.sub);
                            setQeStep(4); 
                          }} className="p-3.5 rounded-xl text-xs font-bold text-left transition-all border border-white/[0.02] bg-[#111222] text-slate-300 hover:border-neoncyan hover:shadow-glow-cyan active:scale-95">
                            {opt.específico}
                            <span className="block text-[9px] text-slate-500 mt-1 uppercase tracking-widest">↳ {opt.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {qeStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="text-center text-[#8A92A6] font-black uppercase tracking-widest text-xs mb-6">{qeType === 'egreso' ? '¿Cómo lo pagaste?' : '¿A dónde entró el dinero?'}</h4>
                    <button onClick={() => { setQeMethod('cash'); setQeStep(5); }} className="w-full p-4 rounded-xl text-sm font-bold text-left transition-all border border-white/[0.02] flex items-center gap-3 bg-[#111222] text-slate-300 hover:border-neoncyan hover:shadow-glow-cyan"><span className="text-xl">💵</span> Efectivo</button>
                    <button onClick={() => { setQeMethod('bank'); setQeStep(5); }} className="w-full p-4 rounded-xl text-sm font-bold text-left transition-all border border-white/[0.02] flex items-center gap-3 bg-[#111222] text-slate-300 hover:border-neoncyan hover:shadow-glow-cyan"><span className="text-xl">🏦</span> Cuenta Débito / Ahorros</button>
                    {qeType === 'egreso' && <button onClick={() => { setQeMethod('credit'); setQeStep(5); }} className="w-full p-4 rounded-xl text-sm font-bold text-left transition-all border border-white/[0.02] flex items-center gap-3 bg-[#111222] text-slate-300 hover:border-neoncyan hover:shadow-glow-cyan"><span className="text-xl">💳</span> Tarjeta de Crédito</button>}
                  </div>
                )}
                {qeStep === 5 && (
                  <div className="space-y-6">
                    <h4 className="text-center text-[#8A92A6] font-black uppercase tracking-widest text-xs mb-2">{qeType === 'egreso' ? '¿De cuál cuenta exactamente?' : '¿A qué cuenta exactamente?'}</h4>
                    <div className="grid grid-cols-1 gap-2.5 overflow-y-auto max-h-[250px] pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                      {activeCalculatedAccounts.filter(c => c.type === qeMethod).map(acc => (
                        <button key={acc.id} onClick={() => setQeCuenta(acc.id)} className={`p-4 rounded-xl text-sm font-bold text-left transition-all border flex justify-between items-center ${qeCuenta === acc.id ? 'bg-neoncyan/10 border-neoncyan text-neoncyan shadow-glow-cyan' : 'bg-[#111222] border-white/[0.02] text-slate-300 hover:border-slate-600'}`}>
                          <span>{acc.name}</span>
                          {qeCuenta === acc.id && <div className="w-2.5 h-2.5 bg-neoncyan rounded-full shadow-[0_0_8px_#00E5FF]"></div>}
                        </button>
                      ))}
                      {activeCalculatedAccounts.filter(c => c.type === qeMethod).length === 0 && <div className="text-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl"><p className="text-rose-400 text-xs font-bold">No tienes cuentas de este tipo registradas.</p></div>}
                    </div>
                    {qeCuenta && <button onClick={handleQuickSave} className={`w-full py-4 rounded-xl font-black text-lg transition-all hover:scale-[1.02] active:scale-95 ${qeType === 'egreso' ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 text-[#0b0c16] shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}>¡Confirmar y Guardar!</button>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✨ MODAL DEL BUSCADOR GLOBAL */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-[#0b0c16]/90 backdrop-blur-md z-[60] flex flex-col items-center pt-10 md:pt-20 px-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl flex flex-col relative animate-in slide-in-from-top-4">
              
              <div className="relative z-10">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neoncyan"><SearchIcon size={24}/></span>
                <input 
                  id="global-search-input"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca el nombre del colegio, un supermercado, una cuenta..."
                  className="w-full bg-appcard shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neoncyan/30 rounded-2xl pl-16 pr-12 py-5 text-lg font-black text-white outline-none focus:border-neoncyan focus:shadow-glow-cyan transition-all placeholder:text-slate-600 placeholder:font-medium"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 p-2 transition-colors">
                  <XIconGlobal size={20}/>
                </button>
              </div>

              {searchQuery.trim() !== '' && (
                <div className="mt-4 bg-appcard border border-white/[0.05] rounded-2xl p-2 max-h-[60vh] overflow-y-auto shadow-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700">
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {searchResults.map((res, i) => (
                        <div key={i} className="flex justify-between items-center p-4 hover:bg-white/[0.02] rounded-xl transition-colors cursor-default border border-transparent hover:border-white/[0.05]">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <span className="text-2xl shrink-0">{res.icon}</span>
                            <div className="truncate pr-2">
                              <p className="text-sm font-bold text-white tracking-wide truncate">{res.descripcion}</p>
                              <p className="text-[10px] text-[#8A92A6] font-black uppercase tracking-widest mt-0.5">{res.fecha} • {res.tipo}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-black tabular-nums shrink-0 drop-shadow-md ${res.color}`}>
                            {formatCOPPrivacy(res.monto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-[#8A92A6] text-sm font-bold tracking-wide">No se encontraron resultados para "<span className="text-white">{searchQuery}</span>"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return AppComponent;
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
