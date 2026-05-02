(() => {
  // ============================================================================
  // CUENTAS TAB - VERSIÓN CORREGIDA
  // Cambios:
  // 1. Liquidez solo bank + cash
  // 2. Inversión / ahorro separado = investment + pocket
  // 3. Transferencias permiten bank/cash/pocket/investment y avance desde credit
  // 4. Import/export incluye investment
  // 5. Sin window.confirm(): usa modal propio
  // 6. Eliminar cuenta y transferencia con opción compatible con deshacer en App.js
  // ============================================================================

  // ============================================================================
  // ICONOS PRIVADOS
  // ============================================================================
  const Edit3 = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );

  const Trash2 = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const Plus = ({ size = 16, strokeWidth = "2", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const Upload = ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );

  const Download = ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const Landmark = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );

  const Wallet = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );

  const ArrowRightLeft = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="17 11 21 7 17 3" />
      <line x1="21" y1="7" x2="9" y2="7" />
      <polyline points="7 21 3 17 7 13" />
      <line x1="3" y1="17" x2="15" y2="17" />
    </svg>
  );

  const ShieldAlert = ({ size = 14, strokeWidth = "2", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  const CheckIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const XIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  // ============================================================================
  // COMPONENTES UI PRIVADOS
  // ============================================================================
  const Card = ({ children, className = "", refObj }) => (
    <div ref={refObj} className={`bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 ${className}`}>
      {children}
    </div>
  );

  const Input = ({
    type = "text",
    label,
    value,
    onChange,
    error,
    className = "",
    placeholder = "",
    min,
    required = false,
    disabled = false
  }) => (
    <div className={`relative ${className.includes("col-span") ? className : "w-full"}`}>
      {label && (
        <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block">
          {label}
        </label>
      )}

      <input
        type={type}
        min={min}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#111222] shadow-neumorph-inset border ${error ? "border-rose-500" : "border-transparent"} rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neoncyan transition-all duration-300 placeholder:text-slate-600 disabled:opacity-50 ${className}`}
      />

      {error && (
        <p className="text-rose-500 text-[10px] mt-1 pl-1 font-bold absolute -bottom-4 left-0">
          {error}
        </p>
      )}
    </div>
  );

  const Select = ({
    label,
    options = [],
    value,
    onChange,
    error,
    className = "",
    disabled = false
  }) => (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-[#111222] shadow-neumorph-inset border ${error ? "border-rose-500" : "border-transparent"} rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neonmagenta transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50`}
      >
        <option value="" className="bg-[#111222]">
          Seleccione...
        </option>

        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[#111222]">
            {o.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-rose-500 text-[10px] mt-1 pl-1 font-bold">
          {error}
        </p>
      )}
    </div>
  );

  // ============================================================================
  // LOGOS / ICONOS DE CUENTAS
  // ============================================================================
  const BankLogo = ({ name, type, className = "w-6 h-6 rounded-full shrink-0" }) => {
    const { useState } = React;
    const [attempt, setAttempt] = useState(0);

    const lowerName = String(name || "").toLowerCase();

    if (type === "cash") return <span className="text-lg shrink-0">💵</span>;
    if (type === "investment") return <span className="text-lg shrink-0">📈</span>;
    if (type === "pocket") return <span className="text-lg shrink-0">🎯</span>;
    if (type === "credit") return <span className="text-lg shrink-0">💳</span>;

    let domain = null;

    if (lowerName.includes("bancolombia")) domain = "grupobancolombia.com";
    else if (lowerName.includes("nequi")) domain = "nequi.com.co";
    else if (lowerName.includes("daviplata") || lowerName.includes("davivienda") || lowerName.includes("davibank")) domain = "davivienda.com";
    else if (lowerName.includes("nu bank") || lowerName.includes("nubank") || lowerName.includes("nu ")) domain = "nu.com.co";
    else if (lowerName.includes("bogot")) domain = "bancodebogota.com";
    else if (lowerName.includes("lulo")) domain = "lulobank.com";
    else if (lowerName.includes("rappi")) domain = "rappi.com";
    else if (lowerName.includes("falabella")) domain = "falabella.com";
    else if (lowerName.includes("bbva")) domain = "bbva.com";
    else if (lowerName.includes("colpatria") || lowerName.includes("scotia")) domain = "scotiabank.com";
    else if (lowerName.includes("caja social")) domain = "bancocajasocial.com";
    else if (lowerName.includes("av villas")) domain = "bancoavvillas.com.co";
    else if (lowerName.includes("popular")) domain = "bancopopular.com.co";
    else if (lowerName.includes("itau") || lowerName.includes("itaú")) domain = "itau.co";
    else if (lowerName.includes("occidente")) domain = "bancodeoccidente.com.co";

    if (domain && attempt < 2) {
      const src = attempt === 0
        ? `https://logo.clearbit.com/${domain}`
        : `https://icon.horse/icon/${domain}`;

      return (
        <img
          src={src}
          alt={name}
          className={`object-contain bg-white border border-white/[0.2] ${className}`}
          style={{ padding: "2px" }}
          onError={() => setAttempt(prev => prev + 1)}
        />
      );
    }

    return <span className="text-lg shrink-0">🏦</span>;
  };

  // ============================================================================
  // COMPONENTE PRINCIPAL
  // ============================================================================
  const CuentasTab = ({
    cuentas = [],
    addCuenta,
    updateCuenta,
    removeCuenta,
    transferencias = [],
    addTransferencia,
    removeTransferencia,
    addEgreso,
    showToast,
    privacyMode
  }) => {
    const { useState, useRef, useMemo } = React;

    // ============================================================================
    // HELPERS
    // ============================================================================
    const asArray = (value) => Array.isArray(value) ? value : [];

    const toNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const toText = (value) => {
      if (value === null || value === undefined) return "";
      return String(value);
    };

    const safeShowToast = (msg, type = "success") => {
      if (typeof showToast === "function") showToast(msg, type);
    };

    const safeGenerateId = () => {
      try {
        if (typeof generateId === "function") return generateId();
      } catch (e) {}

      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();

      return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
    };

    const safeLoadSheetJS = async () => {
      try {
        if (typeof loadSheetJS === "function") return await loadSheetJS();
      } catch (e) {}

      if (window.XLSX) return window.XLSX;
      throw new Error("SheetJS no está disponible.");
    };

    const getLocalToday = () => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    };

    const formatCOP = (val) => {
      if (privacyMode) return "****";

      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }).format(toNumber(val));
    };

    const getValueColor = (val) => {
      const n = toNumber(val);

      if (n > 0) return "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]";
      if (n < 0) return "text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]";

      return "text-[#8A92A6]";
    };

    const identifyOwner = (name) => {
      const t = toText(name).toUpperCase();

      const hasL = t.includes("LEO") || t.endsWith(" L") || t.includes(" L ");
      const hasA = t.includes("ANDRE") || t.includes("ANDRÉ") || t.endsWith(" A") || t.includes(" A ");

      if (hasL && !hasA) return "Leo";
      if (hasA && !hasL) return "Andre";

      return "Shared";
    };

    const getTypeLabel = (type) => {
      if (type === "bank") return "🏦 Cuenta bancaria";
      if (type === "cash") return "💵 Efectivo";
      if (type === "pocket") return "🎯 Bolsillo / ahorro";
      if (type === "investment") return "📈 Inversión";
      if (type === "credit") return "💳 Tarjeta de crédito";
      if (type === "loan") return "🏦 Crédito / préstamo";
      return "Cuenta";
    };

    const getTypeEmoji = (type) => {
      if (type === "bank") return "🏦";
      if (type === "cash") return "💵";
      if (type === "pocket") return "🎯";
      if (type === "investment") return "📈";
      if (type === "credit") return "💳";
      if (type === "loan") return "🏦";
      return "🏦";
    };

    const accountLabel = (c) => `${getTypeEmoji(c.type)} ${c.name}`;

    const cuentasSafe = asArray(cuentas);
    const transferenciasSafe = asArray(transferencias);

    // ============================================================================
    // ESTADOS
    // ============================================================================
    const [cuentaEdit, setCuentaEdit] = useState({
      id: null,
      name: "",
      type: "bank",
      initialBalance: ""
    });

    const [nuevaTx, setNuevaTx] = useState({
      fecha: getLocalToday(),
      fromId: "",
      toId: "",
      monto: "",
      costoAvance: "0",
      descripcion: ""
    });

    const [errors, setErrors] = useState({});
    const [txErrors, setTxErrors] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);

    const formRef = useRef(null);
    const fileInputRef = useRef(null);

    const openConfirmModal = ({ title, message, detail, actions = [] }) => {
      setConfirmModal({ title, message, detail, actions });
    };

    const closeConfirmModal = () => setConfirmModal(null);

    // ============================================================================
    // CLASIFICACIÓN DE CUENTAS
    // ============================================================================
    const cuentasLiquidez = useMemo(() => {
      return cuentasSafe
        .filter(c => c && ["bank", "cash"].includes(c.type))
        .sort((a, b) => toText(a.name).localeCompare(toText(b.name)));
    }, [cuentasSafe]);

    const cuentasInversion = useMemo(() => {
      return cuentasSafe
        .filter(c => c && ["investment", "pocket"].includes(c.type))
        .sort((a, b) => toText(a.name).localeCompare(toText(b.name)));
    }, [cuentasSafe]);

    const cuentasCredito = useMemo(() => {
      return cuentasSafe
        .filter(c => c && c.type === "credit")
        .sort((a, b) => toText(a.name).localeCompare(toText(b.name)));
    }, [cuentasSafe]);

    const cuentasTransferOrigen = useMemo(() => {
      return cuentasSafe
        .filter(c => c && ["bank", "cash", "pocket", "investment", "credit"].includes(c.type))
        .sort((a, b) => toText(a.name).localeCompare(toText(b.name)));
    }, [cuentasSafe]);

    const cuentasTransferDestino = useMemo(() => {
      return cuentasSafe
        .filter(c => c && ["bank", "cash", "pocket", "investment"].includes(c.type))
        .sort((a, b) => toText(a.name).localeCompare(toText(b.name)));
    }, [cuentasSafe]);

    const leoLiquidityAccounts = [];
    const andreLiquidityAccounts = [];
    const sharedLiquidityAccounts = [];

    const leoInvestmentAccounts = [];
    const andreInvestmentAccounts = [];
    const sharedInvestmentAccounts = [];

    let leoBank = 0;
    let leoCash = 0;
    let andreBank = 0;
    let andreCash = 0;
    let sharedBank = 0;
    let sharedCash = 0;

    let leoInvestment = 0;
    let andreInvestment = 0;
    let sharedInvestment = 0;

    cuentasLiquidez.forEach(c => {
      const owner = identifyOwner(c.name);
      const balance = toNumber(c.currentBalance);

      if (owner === "Leo") {
        if (c.type === "cash") leoCash += balance;
        else leoBank += balance;
        leoLiquidityAccounts.push(c);
      } else if (owner === "Andre") {
        if (c.type === "cash") andreCash += balance;
        else andreBank += balance;
        andreLiquidityAccounts.push(c);
      } else {
        if (c.type === "cash") sharedCash += balance;
        else sharedBank += balance;
        sharedLiquidityAccounts.push(c);
      }
    });

    cuentasInversion.forEach(c => {
      const owner = identifyOwner(c.name);
      const balance = toNumber(c.currentBalance);

      if (owner === "Leo") {
        leoInvestment += balance;
        leoInvestmentAccounts.push(c);
      } else if (owner === "Andre") {
        andreInvestment += balance;
        andreInvestmentAccounts.push(c);
      } else {
        sharedInvestment += balance;
        sharedInvestmentAccounts.push(c);
      }
    });

    const totalLiquidez = leoBank + leoCash + andreBank + andreCash + sharedBank + sharedCash;
    const totalInversion = leoInvestment + andreInvestment + sharedInvestment;

    const transferenciasOrdenadas = useMemo(() => {
      return [...transferenciasSafe].sort((a, b) => {
        const db = new Date(b && b.fecha ? b.fecha : 0).getTime() || 0;
        const da = new Date(a && a.fecha ? a.fecha : 0).getTime() || 0;
        return db - da;
      });
    }, [transferenciasSafe]);

    const tipoOrigen = cuentasSafe.find(c => c.id === nuevaTx.fromId)?.type;
    const tipoDestino = cuentasSafe.find(c => c.id === nuevaTx.toId)?.type;

    const esAvance = tipoOrigen === "credit" && ["bank", "cash", "pocket", "investment"].includes(tipoDestino);

    // ============================================================================
    // MODAL
    // ============================================================================
    const ConfirmModal = () => {
      if (!confirmModal) return null;

      return (
        <div className="fixed inset-0 bg-[#0b0c16]/80 backdrop-blur-md z-[999] flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-appcard w-full max-w-md rounded-t-[28px] md:rounded-[28px] border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-6 animate-in slide-in-from-bottom-6 duration-300">
            <div className="mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_15px_rgba(251,191,36,0.35)]">
                <ShieldAlert size={22} strokeWidth="2.5" />
              </div>

              <h3 className="text-xl font-black text-white tracking-wide">
                {confirmModal.title}
              </h3>

              {confirmModal.message && (
                <p className="text-sm text-[#8A92A6] font-bold mt-2 leading-relaxed">
                  {confirmModal.message}
                </p>
              )}

              {confirmModal.detail && (
                <div className="mt-4 bg-[#111222] shadow-neumorph-inset rounded-2xl p-4 border border-white/[0.03]">
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">
                    {confirmModal.detail}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {confirmModal.actions.map((action, index) => {
                const variantClass =
                  action.variant === "danger"
                    ? "bg-neonmagenta text-[#0b0c16] shadow-glow-magenta hover:bg-[#ff1a8c]"
                    : action.variant === "warning"
                      ? "bg-amber-400 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.45)] hover:bg-amber-300"
                      : action.variant === "success"
                        ? "bg-emerald-400 text-[#0b0c16] shadow-[0_0_15px_rgba(52,211,153,0.45)] hover:bg-emerald-300"
                        : "bg-[#111222] text-slate-300 border border-white/[0.05] hover:border-neoncyan/40 hover:text-neoncyan";

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (typeof action.onClick === "function") action.onClick();
                      closeConfirmModal();
                    }}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] ${variantClass}`}
                  >
                    {action.label}
                  </button>
                );
              })}

              <button
                onClick={closeConfirmModal}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black uppercase tracking-widest bg-transparent text-[#8A92A6] hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    };

    // ============================================================================
    // CUENTAS CRUD
    // ============================================================================
    const guardarCuenta = (e) => {
      e.preventDefault();

      const errs = {};

      if (!toText(cuentaEdit.name).trim()) errs.name = "Obligatorio";

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }

      const baseData = {
        name: toText(cuentaEdit.name).trim(),
        type: cuentaEdit.type,
        initialBalance: toNumber(cuentaEdit.initialBalance),
        initialDebt: 0,
        limit: 0,
        cuotaMinima: 0,
        tasaEA: 0
      };

      if (cuentaEdit.id) {
        updateCuenta(cuentaEdit.id, baseData);
        safeShowToast("Cuenta actualizada correctamente.");
      } else {
        addCuenta({
          id: safeGenerateId(),
          ...baseData
        });

        safeShowToast("Cuenta creada correctamente.");
      }

      limpiarFormCuenta();
    };

    const limpiarFormCuenta = () => {
      setCuentaEdit({
        id: null,
        name: "",
        type: "bank",
        initialBalance: ""
      });

      setErrors({});
      setShowForm(false);
    };

    const cargarParaEditar = (c) => {
      setCuentaEdit({
        id: c.id,
        name: c.name,
        type: c.type || "bank",
        initialBalance: c.initialBalance || ""
      });

      setErrors({});
      setShowForm(true);

      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    };

    const confirmarEliminarCuenta = (c) => {
      openConfirmModal({
        title: `Eliminar ${c.name}`,
        message: "Esta acción eliminará la cuenta seleccionada.",
        detail: "Si esta cuenta tiene movimientos asociados, los saldos y reportes pueden cambiar. Si tu App.js tiene deshacer activo, podrás restaurarla desde el aviso inferior.",
        actions: [
          {
            label: "Eliminar cuenta",
            variant: "danger",
            onClick: () => {
              if (removeCuenta) removeCuenta(c.id, c);
              safeShowToast("Cuenta eliminada.", "error");
            }
          }
        ]
      });
    };

    // ============================================================================
    // TRANSFERENCIAS
    // ============================================================================
    const agregarTransferencia = (e) => {
      e.preventDefault();

      const errs = {};

      const montoNum = toNumber(nuevaTx.monto);
      const costoAvanceNum = toNumber(nuevaTx.costoAvance);

      if (!nuevaTx.fromId) errs.fromId = "Obligatorio";
      if (!nuevaTx.toId) errs.toId = "Obligatorio";
      if (!nuevaTx.fecha) errs.fecha = "Obligatorio";
      if (!nuevaTx.monto) errs.monto = "Obligatorio";
      if (montoNum <= 0) errs.monto = "Debe ser mayor a cero";
      if (nuevaTx.fromId === nuevaTx.toId && nuevaTx.fromId) errs.toId = "Destino distinto";

      if (Object.keys(errs).length > 0) {
        setTxErrors(errs);
        return;
      }

      const tx = {
        ...nuevaTx,
        id: safeGenerateId(),
        monto: montoNum,
        costoAvance: costoAvanceNum,
        descripcion: toText(nuevaTx.descripcion).trim()
      };

      addTransferencia(tx);

      if (esAvance && costoAvanceNum > 0) {
        addEgreso({
          id: safeGenerateId(),
          fecha: nuevaTx.fecha,
          descripcion: `Comisión avance: ${nuevaTx.descripcion || "Transferencia"}`,
          gastoEspecifico: "Otros",
          descripcionOpcional: `Comisión avance: ${nuevaTx.descripcion || "Transferencia"}`,
          categoria: "💳 Obligaciones (Deudas)",
          subcategoria: "Otros",
          tipo: "Variable",
          monto: costoAvanceNum,
          cuentaId: nuevaTx.fromId
        });

        safeShowToast("Transferencia y comisión registradas.");
      } else {
        safeShowToast("Transferencia registrada exitosamente.");
      }

      setNuevaTx({
        fecha: getLocalToday(),
        fromId: "",
        toId: "",
        monto: "",
        costoAvance: "0",
        descripcion: ""
      });

      setTxErrors({});
    };

    const confirmarEliminarTransferencia = (t) => {
      const origen = cuentasSafe.find(c => c.id === t.fromId)?.name || "Origen desconocido";
      const destino = cuentasSafe.find(c => c.id === t.toId)?.name || "Destino desconocido";

      openConfirmModal({
        title: "Eliminar transferencia",
        message: `Se eliminará el traslado de ${origen} hacia ${destino}.`,
        detail: "Esto afectará el saldo actual de las cuentas involucradas porque las cuentas se recalculan con base en los movimientos restantes.",
        actions: [
          {
            label: "Eliminar transferencia",
            variant: "danger",
            onClick: () => {
              if (removeTransferencia) {
                removeTransferencia(t.id, t);
                safeShowToast("Transferencia eliminada correctamente.", "error");
              } else {
                safeShowToast("No se pudo eliminar la transferencia.", "error");
              }
            }
          }
        ]
      });
    };

    // ============================================================================
    // EXPORTAR / IMPORTAR
    // ============================================================================
    const handleExport = async () => {
      try {
        const xlsx = await safeLoadSheetJS();
        const wb = xlsx.utils.book_new();

        const tiposExportables = ["bank", "cash", "pocket", "investment"];

        const dataCuentas = cuentasSafe
          .filter(c => c && tiposExportables.includes(c.type))
          .map(c => ({
            ID: c.id,
            Nombre: c.name,
            Tipo: c.type,
            SaldoBase: c.initialBalance
          }));

        xlsx.utils.book_append_sheet(
          wb,
          xlsx.utils.json_to_sheet(
            dataCuentas.length > 0 ? dataCuentas : [{}],
            { header: ["ID", "Nombre", "Tipo", "SaldoBase"] }
          ),
          "Cuentas_Bancos"
        );

        const dataTrans = transferenciasSafe.map(t => ({
          ID: t.id,
          Fecha: t.fecha,
          Origen: cuentasSafe.find(c => c.id === t.fromId)?.name || "",
          Destino: cuentasSafe.find(c => c.id === t.toId)?.name || "",
          Monto: t.monto,
          CostoAvance: t.costoAvance || 0,
          Descripcion: t.descripcion || ""
        }));

        xlsx.utils.book_append_sheet(
          wb,
          xlsx.utils.json_to_sheet(
            dataTrans.length > 0 ? dataTrans : [{}],
            { header: ["ID", "Fecha", "Origen", "Destino", "Monto", "CostoAvance", "Descripcion"] }
          ),
          "Transferencias"
        );

        xlsx.writeFile(wb, `Cuentas_y_Transferencias_${new Date().toISOString().split("T")[0]}.xlsx`);

        safeShowToast("Exportadas con éxito.");
      } catch (e) {
        console.error(e);
        safeShowToast("Error al exportar.", "error");
      }
    };

    const handleImport = async (e) => {
      const file = e.target.files[0];

      if (!file) return;

      try {
        const xlsx = await safeLoadSheetJS();
        const reader = new FileReader();

        reader.onload = (evt) => {
          try {
            const wb = xlsx.read(evt.target.result, { type: "binary" });
            let importados = 0;
            let omitidos = 0;

            const currentCuentas = [...cuentasSafe];

            if (wb.Sheets["Cuentas_Bancos"]) {
              xlsx.utils.sheet_to_json(wb.Sheets["Cuentas_Bancos"]).forEach(i => {
                if (!i.Nombre) return;

                const tipo = i.Tipo || "bank";
                const tiposValidos = ["bank", "cash", "pocket", "investment"];

                if (!tiposValidos.includes(tipo)) {
                  omitidos++;
                  return;
                }

                const exists = currentCuentas.find(c =>
                  toText(c.name).toLowerCase() === toText(i.Nombre).toLowerCase() &&
                  c.type === tipo
                );

                if (!exists) {
                  const newAccount = {
                    id: i.ID || safeGenerateId(),
                    name: i.Nombre,
                    type: tipo,
                    initialBalance: toNumber(i.SaldoBase),
                    initialDebt: 0,
                    limit: 0,
                    tasaEA: 0,
                    cuotaMinima: 0
                  };

                  addCuenta(newAccount);
                  currentCuentas.push(newAccount);
                  importados++;
                }
              });
            }

            if (wb.Sheets["Transferencias"]) {
              xlsx.utils.sheet_to_json(wb.Sheets["Transferencias"]).forEach(i => {
                if (!i.Monto) return;

                const originAccount = currentCuentas.find(c => toText(c.name).toLowerCase() === toText(i.Origen).toLowerCase());
                const destinationAccount = currentCuentas.find(c => toText(c.name).toLowerCase() === toText(i.Destino).toLowerCase());

                if (!originAccount || !destinationAccount) {
                  omitidos++;
                  return;
                }

                const duplicated = transferenciasSafe.find(t =>
                  t.fecha === i.Fecha &&
                  toNumber(t.monto) === toNumber(i.Monto) &&
                  toText(t.descripcion) === toText(i.Descripcion)
                );

                if (!duplicated) {
                  addTransferencia({
                    id: i.ID || safeGenerateId(),
                    fecha: i.Fecha || getLocalToday(),
                    fromId: originAccount.id,
                    toId: destinationAccount.id,
                    monto: toNumber(i.Monto),
                    costoAvance: toNumber(i.CostoAvance),
                    descripcion: i.Descripcion || ""
                  });

                  importados++;
                }
              });
            }

            if (importados > 0 && omitidos > 0) {
              safeShowToast(`Se importaron ${importados} registros. ${omitidos} fueron omitidos.`);
            } else if (importados > 0) {
              safeShowToast(`Se importaron ${importados} registros.`);
            } else {
              safeShowToast("No se encontraron registros nuevos.");
            }
          } catch (err) {
            console.error(err);
            safeShowToast("Error procesando el archivo.", "error");
          }
        };

        reader.readAsBinaryString(file);
      } catch (err) {
        console.error(err);
        safeShowToast("Error al abrir herramienta de Excel.", "error");
      }

      e.target.value = "";
    };

    // ============================================================================
    // COMPONENTE TARJETA DE CUENTA
    // ============================================================================
    const AccountRow = ({ c }) => (
      <div className="flex justify-between items-center text-sm bg-[#111222] shadow-neumorph-inset p-3.5 rounded-xl border border-transparent group transition-all hover:border-white/[0.05]">
        <div className="flex items-center gap-3 pr-2 overflow-hidden">
          <BankLogo name={c.name} type={c.type} />
          <div className="overflow-hidden">
            <span className="text-white font-bold truncate text-[13px] tracking-wide block">
              {c.name}
            </span>
            <span className="text-[9px] font-black text-[#8A92A6] uppercase tracking-widest">
              {getTypeLabel(c.type)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`font-black tabular-nums text-[13px] ${getValueColor(c.currentBalance)}`}>
            {formatCOP(c.currentBalance)}
          </span>

          <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button onClick={() => cargarParaEditar(c)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar">
              <Edit3 size={14} />
            </button>

            <button onClick={() => confirmarEliminarCuenta(c)} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
        <ConfirmModal />

        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Landmark className="text-[#0b0c16] w-5 h-5" />
              </div>
              Cuentas y Transferencias
            </h1>

            <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
              Gestiona liquidez, inversión/ahorro separado y traslados sin inflar ingresos ni egresos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                limpiarFormCuenta();
                setShowForm(!showForm);
              }}
              className="bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-glow-cyan active:scale-95"
            >
              <Plus size={16} strokeWidth="3" /> {showForm ? "Ocultar" : "Nueva cuenta"}
            </button>

            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] shadow-neumorph"
            >
              <Upload size={14} /> Importar
            </button>

            <button
              onClick={handleExport}
              className="bg-[#111222] hover:bg-[#1c1e32] text-amber-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)] shadow-neumorph"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        {/* FORMULARIO CREAR / EDITAR CUENTA */}
        {showForm && (
          <Card className="!border-neoncyan/30 shadow-glow-cyan relative overflow-hidden" refObj={formRef}>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                {cuentaEdit.id ? <Edit3 size={16} className="text-neoncyan" /> : <Plus size={16} className="text-neoncyan" />}
                {cuentaEdit.id ? "Editar Cuenta" : "Crear Nueva Cuenta"}
              </h2>

              {cuentaEdit.id && (
                <button
                  onClick={limpiarFormCuenta}
                  className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-white transition-colors bg-rose-500/10 px-3 py-1.5 rounded-lg"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={guardarCuenta} className="grid grid-cols-2 md:grid-cols-4 gap-5 items-end relative z-10 animate-in slide-in-from-top-4 fade-in duration-300">
              <Input
                label="Nombre de la cuenta"
                value={cuentaEdit.name}
                onChange={e => setCuentaEdit({ ...cuentaEdit, name: e.target.value })}
                error={errors.name}
                className="col-span-2 md:col-span-1"
                placeholder="Ej. Bancolombia Leo"
              />

              <Select
                label="Tipo de cuenta"
                options={[
                  { value: "bank", label: "🏦 Cuenta bancaria" },
                  { value: "cash", label: "💵 Efectivo" },
                  { value: "pocket", label: "🎯 Bolsillo / ahorro" },
                  { value: "investment", label: "📈 Inversión" }
                ]}
                value={cuentaEdit.type}
                onChange={e => setCuentaEdit({ ...cuentaEdit, type: e.target.value })}
                className="col-span-2 md:col-span-1"
              />

              <div className="col-span-2 md:col-span-2 relative">
                <Input
                  type="number"
                  label="Saldo base inicial"
                  value={cuentaEdit.initialBalance}
                  onChange={e => setCuentaEdit({ ...cuentaEdit, initialBalance: e.target.value })}
                  className="pl-10"
                  placeholder="0"
                />
                <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
              </div>

              <button
                type="submit"
                className="col-span-2 md:col-span-4 w-full bg-neoncyan hover:bg-[#00cce6] text-[#0b0c16] font-black py-4 rounded-xl text-sm transition-all shadow-glow-cyan active:scale-95 uppercase tracking-widest mt-2"
              >
                {cuentaEdit.id ? "Actualizar datos" : "Guardar nueva cuenta"}
              </button>
            </form>
          </Card>
        )}

        {/* RESUMEN GENERAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
              Liquidez total
            </p>
            <p className="text-2xl font-black text-emerald-400">
              {formatCOP(totalLiquidez)}
            </p>
            <p className="text-[10px] text-[#8A92A6] font-bold mt-1">
              Solo bancos y efectivo.
            </p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
              Inversión / ahorro
            </p>
            <p className="text-2xl font-black text-amber-400">
              {formatCOP(totalInversion)}
            </p>
            <p className="text-[10px] text-[#8A92A6] font-bold mt-1">
              Bolsillos e inversiones separados de liquidez.
            </p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">
              Patrimonio operativo
            </p>
            <p className="text-2xl font-black text-neoncyan">
              {formatCOP(totalLiquidez + totalInversion)}
            </p>
            <p className="text-[10px] text-[#8A92A6] font-bold mt-1">
              Liquidez + inversión/ahorro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6 items-start">
          {/* COLUMNA 1: Liquidez Leo */}
          <Card className="!border-transparent flex flex-col overflow-hidden relative h-full">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-neoncyan/10 blur-[50px] rounded-full pointer-events-none"></div>

            <h3 className="text-xs font-black text-neoncyan uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
              <Wallet size={16} /> Liquidez Leo
            </h3>

            <div className="space-y-3 relative z-10 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                {leoLiquidityAccounts.length === 0 ? (
                  <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl border border-transparent">
                    Sin cuentas de liquidez
                  </p>
                ) : (
                  leoLiquidityAccounts.map(c => <AccountRow key={c.id} c={c} />)
                )}
              </div>

              <div className="pt-4 mt-4 px-1 border-t border-white/[0.05] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total bancos</span>
                  <span className="font-bold text-white text-xs">{formatCOP(leoBank)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total efectivo</span>
                  <span className="font-bold text-white text-xs">{formatCOP(leoCash)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/[0.02]">
                  <span className="text-white font-black uppercase tracking-widest text-[11px]">Total disponible</span>
                  <span className={`font-black text-xl tabular-nums ${getValueColor(leoBank + leoCash)}`}>
                    {formatCOP(leoBank + leoCash)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* COLUMNA 2: Liquidez Andre */}
          <Card className="!border-transparent flex flex-col overflow-hidden relative h-full">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-neonmagenta/10 blur-[50px] rounded-full pointer-events-none"></div>

            <h3 className="text-xs font-black text-neonmagenta uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
              <Wallet size={16} /> Liquidez Andre
            </h3>

            <div className="space-y-3 relative z-10 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                {andreLiquidityAccounts.length === 0 ? (
                  <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl border border-transparent">
                    Sin cuentas de liquidez
                  </p>
                ) : (
                  andreLiquidityAccounts.map(c => <AccountRow key={c.id} c={c} />)
                )}
              </div>

              <div className="pt-4 mt-4 px-1 border-t border-white/[0.05] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total bancos</span>
                  <span className="font-bold text-white text-xs">{formatCOP(andreBank)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Total efectivo</span>
                  <span className="font-bold text-white text-xs">{formatCOP(andreCash)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/[0.02]">
                  <span className="text-white font-black uppercase tracking-widest text-[11px]">Total disponible</span>
                  <span className={`font-black text-xl tabular-nums ${getValueColor(andreBank + andreCash)}`}>
                    {formatCOP(andreBank + andreCash)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* COLUMNA 3: Transferencias */}
          <Card className="!border-transparent bg-gradient-to-b from-[#111222] to-appcard h-full flex flex-col">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
              <ArrowRightLeft size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              Traslado de fondos
            </h2>

            <p className="text-[10px] text-[#8A92A6] font-bold uppercase tracking-widest mb-6">
              Mueve dinero sin afectar ingresos o egresos netos.
            </p>

            <form onSubmit={agregarTransferencia} className="space-y-5 flex-1 flex flex-col">
              <Select
                label="Origen / sale de"
                options={cuentasTransferOrigen.map(c => ({
                  value: c.id,
                  label: accountLabel(c)
                }))}
                value={nuevaTx.fromId}
                onChange={e => setNuevaTx({ ...nuevaTx, fromId: e.target.value })}
                error={txErrors.fromId}
              />

              <Select
                label="Destino / entra a"
                options={cuentasTransferDestino.map(c => ({
                  value: c.id,
                  label: accountLabel(c)
                }))}
                value={nuevaTx.toId}
                onChange={e => setNuevaTx({ ...nuevaTx, toId: e.target.value })}
                error={txErrors.toId}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="number"
                    label="Monto"
                    value={nuevaTx.monto}
                    onChange={e => setNuevaTx({ ...nuevaTx, monto: e.target.value })}
                    error={txErrors.monto}
                    min="1"
                    className="pl-8 font-black text-amber-400"
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
                </div>

                <Input
                  type="date"
                  label="Fecha"
                  value={nuevaTx.fecha}
                  onChange={e => setNuevaTx({ ...nuevaTx, fecha: e.target.value })}
                  error={txErrors.fecha}
                  className="[&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                />
              </div>

              {esAvance && (
                <div className="p-4 bg-neonmagenta/5 border border-neonmagenta/30 rounded-2xl shadow-neumorph-inset mt-2 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] text-neonmagenta mb-3 font-black uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,0,122,0.4)]">
                    <ShieldAlert size={14} strokeWidth="3" /> Detectado avance de tarjeta
                  </p>

                  <Input
                    type="number"
                    label="Costo de transacción"
                    value={nuevaTx.costoAvance}
                    onChange={e => setNuevaTx({ ...nuevaTx, costoAvance: e.target.value })}
                    min="0"
                    placeholder="Ej. 6500"
                  />
                </div>
              )}

              <Input
                label="Descripción opcional"
                placeholder="Ej. Traslado a inversión"
                value={nuevaTx.descripcion}
                onChange={e => setNuevaTx({ ...nuevaTx, descripcion: e.target.value })}
              />

              <div className="flex-1 flex items-end mt-4">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-[#0b0c16] font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 tracking-widest uppercase"
                >
                  Registrar traslado
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* INVERSIÓN / AHORRO SEPARADO */}
        <Card className="!border-transparent mt-6 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none"></div>

          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
            📈 Inversión / Ahorro separado
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-black text-neoncyan uppercase tracking-widest">Leo</h4>
                <span className="text-sm font-black text-amber-400">{formatCOP(leoInvestment)}</span>
              </div>

              {leoInvestmentAccounts.length === 0 ? (
                <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl">
                  Sin inversiones / bolsillos
                </p>
              ) : (
                leoInvestmentAccounts.map(c => <AccountRow key={c.id} c={c} />)
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-black text-neonmagenta uppercase tracking-widest">Andre</h4>
                <span className="text-sm font-black text-amber-400">{formatCOP(andreInvestment)}</span>
              </div>

              {andreInvestmentAccounts.length === 0 ? (
                <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl">
                  Sin inversiones / bolsillos
                </p>
              ) : (
                andreInvestmentAccounts.map(c => <AccountRow key={c.id} c={c} />)
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Compartido</h4>
                <span className="text-sm font-black text-amber-400">{formatCOP(sharedInvestment)}</span>
              </div>

              {sharedInvestmentAccounts.length === 0 ? (
                <p className="text-xs text-[#8A92A6] italic text-center py-5 bg-[#111222] shadow-neumorph-inset rounded-xl">
                  Sin inversiones / bolsillos
                </p>
              ) : (
                sharedInvestmentAccounts.map(c => <AccountRow key={c.id} c={c} />)
              )}
            </div>
          </div>
        </Card>

        {/* CUENTAS COMPARTIDAS DE LIQUIDEZ */}
        {sharedLiquidityAccounts.length > 0 && (
          <Card className="!border-transparent bg-[#111222] shadow-neumorph-inset mt-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-slate-400" /> Otras cuentas de liquidez
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sharedLiquidityAccounts.map(c => <AccountRow key={c.id} c={c} />)}
            </div>

            <div className="pt-4 mt-4 px-1 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Bancos</span>
                <span className="font-bold text-white text-xs">{formatCOP(sharedBank)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8A92A6] font-bold text-[10px] uppercase tracking-wider">Efectivo</span>
                <span className="font-bold text-white text-xs">{formatCOP(sharedCash)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white font-black uppercase tracking-widest text-[11px]">Total</span>
                <span className={`font-black text-lg tabular-nums ${getValueColor(sharedBank + sharedCash)}`}>
                  {formatCOP(sharedBank + sharedCash)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* HISTORIAL DE TRANSFERENCIAS */}
        <Card className="!border-transparent mt-6 flex flex-col">
          <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            Historial de transferencias
          </h2>

          <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
            <table className="w-full text-sm text-left min-w-[760px]">
              <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                <tr>
                  <th className="px-5 py-4 w-[12%]">Fecha</th>
                  <th className="px-5 py-4 w-[25%]">Origen</th>
                  <th className="px-5 py-4 w-[25%]">Destino</th>
                  <th className="px-5 py-4 w-[16%] text-right">Monto</th>
                  <th className="px-5 py-4 w-[12%] text-right">Costo</th>
                  <th className="px-5 py-4 w-[10%] text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.02]">
                {transferenciasOrdenadas.map(t => {
                  const origenObj = cuentasSafe.find(c => c.id === t.fromId);
                  const destinoObj = cuentasSafe.find(c => c.id === t.toId);

                  const origen = origenObj?.name || "Desconocido";
                  const destino = destinoObj?.name || "Desconocido";

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-bold text-[#8A92A6] text-xs">
                        {t.fecha || "Sin fecha"}
                      </td>

                      <td className="px-5 py-4 font-bold text-white tracking-wide">
                        <span className="flex items-center gap-2">
                          <span className="text-rose-400">↗</span>
                          {getTypeEmoji(origenObj?.type)} {origen}
                        </span>

                        {t.descripcion && (
                          <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest truncate">
                            {t.descripcion}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-bold text-white tracking-wide">
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-400">↘</span>
                          {getTypeEmoji(destinoObj?.type)} {destino}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right font-black text-amber-400 tabular-nums drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                        {formatCOP(t.monto)}
                      </td>

                      <td className="px-5 py-4 text-right font-black text-rose-400 tabular-nums">
                        {toNumber(t.costoAvance) > 0 ? formatCOP(t.costoAvance) : "—"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => confirmarEliminarTransferencia(t)}
                          className="text-[#8A92A6] hover:text-neonmagenta transition-colors p-1.5"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {transferenciasOrdenadas.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-[#8A92A6] font-bold italic">
                      No hay transferencias registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  window.CuentasTab = CuentasTab;
})();
