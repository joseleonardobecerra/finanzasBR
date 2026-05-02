(() => {
  // ============================================================================
  // GLOBALS LIMPIO - SIN FIREBASE
  // Este archivo solo contiene utilidades, componentes UI e íconos compartidos.
  // No inicializa Firebase, no crea db, no crea auth.
  // ============================================================================

  // ============================================================================
  // UTILIDADES
  // ============================================================================
  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const toText = (value) => {
    if (value === null || value === undefined) return "";

    if (typeof value === "object") {
      if (value.específico !== undefined) return String(value.específico || "");
      if (value.especifico !== undefined) return String(value.especifico || "");
      if (value.sub !== undefined) return String(value.sub || "");
      if (value.descripcion !== undefined) return String(value.descripcion || "");
      if (value.name !== undefined) return String(value.name || "");
      return "";
    }

    return String(value);
  };

  const asArray = (value) => Array.isArray(value) ? value : [];

  const formatCOP = (value, privacyMode = false) => {
    if (privacyMode) return "****";

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(toNumber(value));
  };

  const getTasaMensual = (tasaEA) => {
    return Math.pow(1 + toNumber(tasaEA) / 100, 1 / 12) - 1;
  };

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  };

  const getLocalToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const loadSheetJS = async () => {
    if (window.XLSX) return window.XLSX;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => reject(new Error("No se pudo cargar SheetJS"));
      document.head.appendChild(script);
    });
  };

  // ============================================================================
  // ÍCONOS
  // ============================================================================
  const SvgWrapper = ({
    size = 18,
    className = "",
    children,
    strokeWidth = 2
  }) => (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );

  const Activity = (p) => (
    <SvgWrapper {...p}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </SvgWrapper>
  );

  const ShieldAlert = (p) => (
    <SvgWrapper {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </SvgWrapper>
  );

  const PiggyBank = (p) => (
    <SvgWrapper {...p}>
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.5L20 8.5c0-2.5-1.5-3.5-1-3.5z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <path d="M16 11h.01" />
    </SvgWrapper>
  );

  const Info = (p) => (
    <SvgWrapper {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </SvgWrapper>
  );

  const ArrowUpRight = (p) => (
    <SvgWrapper {...p}>
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </SvgWrapper>
  );

  const ArrowDownRight = (p) => (
    <SvgWrapper {...p}>
      <path d="M7 7l10 10" />
      <path d="M17 7v10H7" />
    </SvgWrapper>
  );

  const Minus = (p) => (
    <SvgWrapper {...p}>
      <path d="M5 12h14" />
    </SvgWrapper>
  );

  const Target = (p) => (
    <SvgWrapper {...p}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </SvgWrapper>
  );

  const AlertCircle = (p) => (
    <SvgWrapper {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </SvgWrapper>
  );

  const TrendingUp = (p) => (
    <SvgWrapper {...p}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </SvgWrapper>
  );

  const CheckCircle2 = (p) => (
    <SvgWrapper {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </SvgWrapper>
  );

  const ListIcon = (p) => (
    <SvgWrapper {...p}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </SvgWrapper>
  );

  const Edit3 = (p) => (
    <SvgWrapper {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </SvgWrapper>
  );

  const Trash2 = (p) => (
    <SvgWrapper {...p}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </SvgWrapper>
  );

  // ============================================================================
  // COMPONENTES UI BASE
  // ============================================================================
  const Card = ({ children, className = "", onClick }) => {
    const baseClass =
      "bg-appcard rounded-[20px] shadow-neumorph border border-white/[0.02] p-4 md:p-6 transition-all duration-300";

    const interactiveClass = onClick
      ? "cursor-pointer hover:shadow-glow-cyan hover:-translate-y-1 active:translate-y-0 active:shadow-neumorph-inset"
      : "";

    return (
      <div onClick={onClick} className={`${baseClass} ${interactiveClass} ${className}`}>
        {children}
      </div>
    );
  };

  const Input = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    className = "",
    min,
    max,
    step,
    disabled,
    error,
    title,
    required,
    autoFocus
  }) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${error ? "text-neonmagenta" : "text-[#8A92A6]"}`}>
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        title={title}
        required={required}
        autoFocus={autoFocus}
        className={`w-full bg-[#111222] shadow-neumorph-inset border ${
          error
            ? "border-neonmagenta focus:shadow-glow-magenta"
            : "border-transparent focus:border-neoncyan focus:shadow-glow-cyan"
        } rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 disabled:opacity-50`}
      />

      {error && (
        <span className="text-[10px] text-neonmagenta pl-1 font-bold tracking-wide">
          {error}
        </span>
      )}
    </div>
  );

  const Select = ({
    label,
    value,
    onChange,
    options = [],
    className = "",
    required,
    error,
    disabled,
    title,
    placeholder = "Seleccione..."
  }) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${error ? "text-neonmagenta" : "text-[#8A92A6]"}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          title={title}
          className={`w-full bg-[#111222] shadow-neumorph-inset border ${
            error
              ? "border-neonmagenta focus:shadow-glow-magenta"
              : "border-transparent focus:border-neoncyan focus:shadow-glow-cyan"
          } rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50`}
        >
          <option value="" className="bg-[#111222] text-slate-500">
            {placeholder}
          </option>

          {options.map((opt, i) => {
            const val = typeof opt === "object" && opt !== null ? opt.value : opt;
            const lbl = typeof opt === "object" && opt !== null ? opt.label : opt;

            return (
              <option key={`${val}-${i}`} value={val} className="bg-[#111222]">
                {lbl}
              </option>
            );
          })}
        </select>
      </div>

      {error && (
        <span className="text-[10px] text-neonmagenta pl-1 font-bold tracking-wide">
          {error}
        </span>
      )}
    </div>
  );

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, info) {
      console.error("Error capturado:", error, info);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-6 bg-[#111222] shadow-neumorph-inset border-l-4 border-neonmagenta rounded-3xl m-4 md:m-8 text-white">
            <h2 className="font-black text-xl mb-2 flex items-center gap-2 text-neonmagenta">
              <AlertCircle size={24} /> Error protegido
            </h2>

            <p className="text-sm text-[#8A92A6] font-bold mb-4">
              Se evitó que la app completa se cayera.
            </p>

            <pre className="bg-[#0b0c16] p-4 rounded-xl text-[10px] text-slate-500 overflow-auto max-h-40">
              {this.state.error ? this.state.error.toString() : "Error desconocido"}
            </pre>

            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-5 py-2.5 bg-[#111222] hover:shadow-glow-magenta text-neonmagenta rounded-xl text-sm font-bold transition-all border border-neonmagenta/30"
            >
              Intentar cargar de nuevo
            </button>
          </div>
        );
      }

      return this.props.children;
    }
  }

  // ============================================================================
  // EXPORT ÚNICO SEGURO
  // ============================================================================
  window.AppShared = {
    utils: {
      toNumber,
      toText,
      asArray,
      formatCOP,
      getTasaMensual,
      generateId,
      getLocalToday,
      loadSheetJS
    },
    icons: {
      SvgWrapper,
      Activity,
      ShieldAlert,
      PiggyBank,
      Info,
      ArrowUpRight,
      ArrowDownRight,
      Minus,
      Target,
      AlertCircle,
      TrendingUp,
      CheckCircle2,
      ListIcon,
      Edit3,
      Trash2
    },
    ui: {
      Card,
      Input,
      Select,
      ErrorBoundary
    }
  };
})();
