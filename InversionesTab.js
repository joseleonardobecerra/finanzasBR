(() => {
  // ============================================================================
  // INVERSIONES TAB - VERSIÓN CORREGIDA
  // Cambios:
  // 1. investment + pocket = inversión / ahorro separado
  // 2. Ya no guarda persona en ingresos por rendimiento
  // 3. Tabla separa: saldo inicial, aportes/retiros, rendimiento y saldo total
  // 4. Crear cuenta permite elegir investment o pocket
  // 5. Import/export incluye Tipo
  // 6. Eliminar usa modal propio y pasa el objeto completo a removeCuenta
  // ============================================================================

  // ============================================================================
  // ICONOS PRIVADOS
  // ============================================================================
  const CheckIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const XIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const Edit3 = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );

  const Trash2 = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const Plus = ({ size = 16, strokeWidth = "3", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
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

  const PiggyBank = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.5L22 12c0-4-3-7-3-7z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <path d="M16 11h.01" />
    </svg>
  );

  const TrendingUp = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );

  const ShieldAlert = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  // ============================================================================
  // COMPONENTES UI PRIVADOS
  // ============================================================================
  const Card = ({ children, className = "" }) => (
    <div className={`bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8 ${className}`}>
      {children}
    </div>
  );

  const InputUI = ({
    type = "text",
    label,
    value,
    onChange,
    className = "",
    placeholder = "",
    step,
    required,
    min,
    disabled
  }) => (
    <div className={`relative ${className && className.includes("col-span") ? className : "w-full"}`}>
      {label && (
        <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block">
          {label}
        </label>
      )}

      <input
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all duration-300 placeholder:text-slate-600 disabled:opacity-50 ${className}`}
      />
    </div>
  );

  const SelectUI = ({
    label,
    value,
    onChange,
    options = [],
    className = "",
    required,
    disabled
  }) => (
    <div className={`relative ${className && className.includes("col-span") ? className : "w-full"}`}>
      {label && (
        <label className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all duration-300 appearance-none cursor-pointer disabled:opacity-50"
      >
        <option value="" className="bg-[#111222]">Seleccione...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#111222]">
            {opt.label}
          </option>
        ))}
      </select>
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
  const InversionesTab = ({
    cuentas = [],
    addCuenta,
    updateCuenta,
    removeCuenta,
    ingresos = [],
    addIngreso,
    egresos = [],
    transferencias = [],
    selectedMonth = "",
    showToast,
    getOwner,
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
      const año = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    };

    const activeMonth = selectedMonth || getLocalToday().slice(0, 7);
    const firstDayOfMonth = `${activeMonth}-01`;

    const formatCOP = (val) => {
      if (privacyMode) return "****";

      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }).format(toNumber(val));
    };

    const getTypeLabel = (type) => {
      if (type === "investment") return "📈 Inversión";
      if (type === "pocket") return "🎯 Bolsillo / ahorro";
      return "Ahorro separado";
    };

    const getValueColor = (val) => {
      const n = toNumber(val);

      if (n > 0) return "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]";
      if (n < 0) return "text-neonmagenta drop-shadow-[0_0_5px_rgba(255,0,122,0.5)]";

      return "text-[#8A92A6]";
    };

    const cuentasSafe = asArray(cuentas);
    const ingresosSafe = asArray(ingresos);
    const egresosSafe = asArray(egresos);
    const transferenciasSafe = asArray(transferencias);

    // ============================================================================
    // ESTADOS
    // ============================================================================
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [gananciaId, setGananciaId] = useState(null);
    const [gananciaMonto, setGananciaMonto] = useState("");
    const [confirmModal, setConfirmModal] = useState(null);

    const fileInputRef = useRef(null);

    const [nuevo, setNuevo] = useState({
      name: "",
      type: "investment",
      initialBalance: "",
      tasaEA: ""
    });

    // ============================================================================
    // MODAL
    // ============================================================================
    const openConfirmModal = ({ title, message, detail, actions = [] }) => {
      setConfirmModal({ title, message, detail, actions });
    };

    const closeConfirmModal = () => setConfirmModal(null);

    const ConfirmModal = () => {
      if (!confirmModal) return null;

      return (
        <div className="fixed inset-0 bg-[#0b0c16]/80 backdrop-blur-md z-[999] flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-appcard w-full max-w-md rounded-t-[28px] md:rounded-[28px] border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-6 animate-in slide-in-from-bottom-6 duration-300">
            <div className="mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_15px_rgba(251,191,36,0.35)]">
                <ShieldAlert size={22} />
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
    // CRUD CUENTAS DE INVERSIÓN / AHORRO
    // ============================================================================
    const limpiarForm = () => {
      setNuevo({
        name: "",
        type: "investment",
        initialBalance: "",
        tasaEA: ""
      });

      setShowForm(false);
    };

    const handleAdd = (e) => {
      e.preventDefault();

      if (!toText(nuevo.name).trim()) {
        safeShowToast("El nombre es obligatorio.", "error");
        return;
      }

      addCuenta({
        id: safeGenerateId(),
        name: toText(nuevo.name).trim(),
        type: nuevo.type || "investment",
        initialBalance: toNumber(nuevo.initialBalance),
        initialDebt: 0,
        currentDebt: 0,
        limit: 0,
        tasaEA: toNumber(nuevo.tasaEA),
        cuotaMinima: 0
      });

      safeShowToast(nuevo.type === "investment" ? "Inversión creada." : "Bolsillo / ahorro creado.");
      limpiarForm();
    };

    const startEdit = (c) => {
      setEditId(c.id);
      setEditData({
        name: c.name || "",
        type: c.type || "investment",
        initialBalance: c.initialBalance || "",
        tasaEA: c.tasaEA || ""
      });

      setGananciaId(null);
    };

    const saveEdit = () => {
      if (!toText(editData.name).trim()) {
        safeShowToast("El nombre es obligatorio.", "error");
        return;
      }

      if (!["investment", "pocket"].includes(editData.type)) {
        safeShowToast("Tipo de cuenta inválido.", "error");
        return;
      }

      updateCuenta(editId, {
        name: toText(editData.name).trim(),
        type: editData.type,
        initialBalance: toNumber(editData.initialBalance),
        tasaEA: toNumber(editData.tasaEA)
      });

      setEditId(null);
      setEditData({});
      safeShowToast("Cuenta actualizada.");
    };

    const confirmarEliminar = (c) => {
      openConfirmModal({
        title: `Eliminar ${c.name}`,
        message: "Esta acción eliminará la inversión o bolsillo seleccionado.",
        detail: "Si esta cuenta tiene ingresos, egresos o transferencias asociadas, los saldos y reportes pueden cambiar. Si tu App.js tiene deshacer activo, podrás restaurarla desde el aviso inferior.",
        actions: [
          {
            label: "Eliminar definitivamente",
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
    // RENDIMIENTOS
    // ============================================================================
    const guardarGanancia = (c) => {
      const montoNum = toNumber(gananciaMonto);

      if (montoNum <= 0) {
        safeShowToast("El rendimiento debe ser mayor a cero.", "error");
        return;
      }

      const fechaActual = getLocalToday();
      const isCurrentMonth = activeMonth === fechaActual.slice(0, 7);

      const diaStr = isCurrentMonth ? fechaActual.slice(8, 10) : "28";
      const fechaIngreso = `${activeMonth}-${diaStr}`;

      addIngreso({
        id: safeGenerateId(),
        fecha: fechaIngreso,
        descripcion: `Rendimientos ${c.name}`,
        tipo: "Rendimiento",
        monto: montoNum,
        cuentaId: c.id
      });

      safeShowToast(`Rendimiento registrado en ${c.name}.`);
      setGananciaId(null);
      setGananciaMonto("");
    };

    // ============================================================================
    // IMPORTAR / EXPORTAR
    // ============================================================================
    const handleExport = async () => {
      try {
        const xlsx = await safeLoadSheetJS();
        const wb = xlsx.utils.book_new();

        const headers = ["ID", "Nombre", "Tipo", "SaldoBase", "TasaEA"];

        const invCts = cuentasSafe.filter(c => c && ["investment", "pocket"].includes(c.type));

        const data = invCts.map(c => ({
          ID: c.id,
          Nombre: c.name,
          Tipo: c.type,
          SaldoBase: c.initialBalance,
          TasaEA: c.tasaEA
        }));

        const ws = xlsx.utils.json_to_sheet(
          data.length > 0 ? data : [{}],
          { header: headers }
        );

        xlsx.utils.book_append_sheet(wb, ws, "Inversiones");
        xlsx.writeFile(wb, `Inversiones_${new Date().toISOString().split("T")[0]}.xlsx`);

        safeShowToast("Inversiones exportadas con éxito.");
      } catch (e) {
        console.error(e);
        safeShowToast("Error al exportar a Excel.", "error");
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
            const sheetName = wb.Sheets["Inversiones"] ? "Inversiones" : wb.SheetNames[0];
            const importedData = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

            let importados = 0;
            let omitidos = 0;

            importedData.forEach(i => {
              if (!i.Nombre) return;

              const tipo = ["investment", "pocket"].includes(i.Tipo) ? i.Tipo : "investment";

              const exists = cuentasSafe.some(c =>
                toText(c.name).toLowerCase() === toText(i.Nombre).toLowerCase() &&
                c.type === tipo
              );

              if (exists) {
                omitidos++;
                return;
              }

              addCuenta({
                id: i.ID || safeGenerateId(),
                name: i.Nombre,
                type: tipo,
                initialBalance: toNumber(i.SaldoBase),
                currentDebt: 0,
                initialDebt: 0,
                limit: 0,
                tasaEA: toNumber(i.TasaEA),
                cuotaMinima: 0
              });

              importados++;
            });

            if (importados > 0 && omitidos > 0) {
              safeShowToast(`Se importaron ${importados} cuentas. ${omitidos} ya existían.`);
            } else if (importados > 0) {
              safeShowToast(`Se importaron ${importados} cuentas.`);
            } else {
              safeShowToast("No hay inversiones nuevas.");
            }
          } catch (err) {
            console.error(err);
            safeShowToast("Error procesando los datos del archivo.", "error");
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
    // DATOS DE TABLA
    // ============================================================================
    const invCuentas = useMemo(() => {
      return cuentasSafe
        .filter(c => c && ["investment", "pocket"].includes(c.type))
        .sort((a, b) => toText(a.name).localeCompare(toText(b.name)));
    }, [cuentasSafe]);

    const tablaData = useMemo(() => {
      return invCuentas.map(c => {
        let sInicial = toNumber(c.initialBalance);

        ingresosSafe
          .filter(i => i && i.cuentaId === c.id && toText(i.fecha) < firstDayOfMonth)
          .forEach(i => {
            sInicial += toNumber(i.monto);
          });

        egresosSafe
          .filter(e => e && e.cuentaId === c.id && toText(e.fecha) < firstDayOfMonth)
          .forEach(e => {
            sInicial -= toNumber(e.monto);
          });

        transferenciasSafe
          .filter(t => t && toText(t.fecha) < firstDayOfMonth)
          .forEach(t => {
            if (t.toId === c.id) sInicial += toNumber(t.monto);
            if (t.fromId === c.id) sInicial -= toNumber(t.monto);
          });

        const ingresosMesCuenta = ingresosSafe.filter(i =>
          i &&
          i.cuentaId === c.id &&
          toText(i.fecha).startsWith(activeMonth)
        );

        const egresosMesCuenta = egresosSafe.filter(e =>
          e &&
          e.cuentaId === c.id &&
          toText(e.fecha).startsWith(activeMonth)
        );

        const transferenciasMesCuenta = transferenciasSafe.filter(t =>
          t &&
          toText(t.fecha).startsWith(activeMonth)
        );

        const rendimientoMes = ingresosMesCuenta
          .filter(i => i.tipo === "Rendimiento")
          .reduce((sum, i) => sum + toNumber(i.monto), 0);

        let aportesRetirosMes = 0;

        ingresosMesCuenta
          .filter(i => i.tipo !== "Rendimiento")
          .forEach(i => {
            aportesRetirosMes += toNumber(i.monto);
          });

        egresosMesCuenta.forEach(e => {
          aportesRetirosMes -= toNumber(e.monto);
        });

        transferenciasMesCuenta.forEach(t => {
          if (t.toId === c.id) aportesRetirosMes += toNumber(t.monto);
          if (t.fromId === c.id) aportesRetirosMes -= toNumber(t.monto);
        });

        const saldoTotal = sInicial + aportesRetirosMes + rendimientoMes;

        return {
          ...c,
          sInicial,
          aportesRetirosMes,
          rendimientoMes,
          saldoTotal
        };
      });
    }, [
      invCuentas,
      ingresosSafe,
      egresosSafe,
      transferenciasSafe,
      activeMonth,
      firstDayOfMonth
    ]);

    const totalSInicial = tablaData.reduce((s, c) => s + toNumber(c.sInicial), 0);
    const totalAportesRetiros = tablaData.reduce((s, c) => s + toNumber(c.aportesRetirosMes), 0);
    const totalRendimiento = tablaData.reduce((s, c) => s + toNumber(c.rendimientoMes), 0);
    const totalSaldoTotal = tablaData.reduce((s, c) => s + toNumber(c.saldoTotal), 0);

    const totalInvestment = tablaData
      .filter(c => c.type === "investment")
      .reduce((s, c) => s + toNumber(c.saldoTotal), 0);

    const totalPocket = tablaData
      .filter(c => c.type === "pocket")
      .reduce((s, c) => s + toNumber(c.saldoTotal), 0);

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
        <ConfirmModal />

        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                <PiggyBank className="text-[#0b0c16] w-5 h-5" />
              </div>
              Inversión y ahorro
            </h1>

            <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
              Sigue el crecimiento de tus inversiones y bolsillos separados de la liquidez diaria.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditId(null);
                setGananciaId(null);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
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
              className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 shadow-neumorph hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Upload size={14} /> Importar
            </button>

            <button
              onClick={handleExport}
              className="bg-[#111222] hover:bg-[#1c1e32] text-emerald-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/30 shadow-neumorph hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </header>

        {/* RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Total portafolio</p>
            <p className="text-2xl font-black text-emerald-400">{formatCOP(totalSaldoTotal)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Inversiones</p>
            <p className="text-2xl font-black text-amber-400">{formatCOP(totalInvestment)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Bolsillos / ahorro</p>
            <p className="text-2xl font-black text-indigo-400">{formatCOP(totalPocket)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Rendimiento mes</p>
            <p className="text-2xl font-black text-emerald-400">+ {formatCOP(totalRendimiento)}</p>
          </div>
        </div>

        {/* FORMULARIO NUEVA CUENTA */}
        {showForm && (
          <Card className="!border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-4 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <PiggyBank size={16} /> Nueva inversión o bolsillo
              </h2>

              <button
                onClick={limpiarForm}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-5 gap-5 items-end">
              <div className="col-span-2">
                <InputUI
                  required
                  label="Nombre de la cuenta"
                  value={nuevo.name}
                  onChange={e => setNuevo({ ...nuevo, name: e.target.value })}
                  placeholder="Ej. FIC, CDT, Bolsillo vacaciones..."
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <SelectUI
                  required
                  label="Tipo"
                  value={nuevo.type}
                  onChange={e => setNuevo({ ...nuevo, type: e.target.value })}
                  options={[
                    { value: "investment", label: "📈 Inversión" },
                    { value: "pocket", label: "🎯 Bolsillo / ahorro" }
                  ]}
                />
              </div>

              <div className="col-span-1 relative">
                <InputUI
                  type="number"
                  label="Saldo base inicial"
                  value={nuevo.initialBalance}
                  onChange={e => setNuevo({ ...nuevo, initialBalance: e.target.value })}
                  className="pl-8"
                  placeholder="0"
                />
                <span className="absolute left-4 top-[38px] text-base font-black text-slate-600">$</span>
              </div>

              <div className="col-span-1 relative">
                <InputUI
                  type="number"
                  step="0.01"
                  label="Tasa E.A. opcional"
                  value={nuevo.tasaEA}
                  onChange={e => setNuevo({ ...nuevo, tasaEA: e.target.value })}
                  className="pr-8 font-bold text-amber-400"
                  placeholder="0.0"
                />
                <span className="absolute right-4 top-[38px] text-base font-black text-slate-600">%</span>
              </div>

              <div className="col-span-2 md:col-span-5 mt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  Guardar nueva cuenta
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* TABLA */}
        <Card className="!border-transparent flex flex-col">
          <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            Portafolio de inversión / ahorro
          </h2>

          <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
            <table className="w-full text-sm text-left min-w-[1040px]">
              <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                <tr>
                  <th className="px-5 py-4 w-[20%]">Cuenta</th>
                  <th className="px-5 py-4 w-[12%] text-center">Tipo</th>
                  <th className="px-5 py-4 w-[15%] text-right">Saldo inicial mes</th>
                  <th className="px-5 py-4 w-[15%] text-right">Aportes / retiros</th>
                  <th className="px-5 py-4 w-[15%] text-right">Rendimiento mes</th>
                  <th className="px-5 py-4 w-[15%] text-right">Saldo total mes</th>
                  <th className="px-5 py-4 w-[8%] text-center">% E.A.</th>
                  <th className="px-5 py-4 w-[10%] text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.02]">
                {tablaData.map(c => {
                  const isEditing = editId === c.id;
                  const isAddingGanancia = gananciaId === c.id;

                  if (isEditing) {
                    return (
                      <tr key={c.id} className="bg-emerald-950/20">
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                            className="w-full bg-[#111222] border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none shadow-neumorph-inset focus:border-emerald-500"
                            placeholder="Nombre"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <select
                            value={editData.type}
                            onChange={e => setEditData({ ...editData, type: e.target.value })}
                            className="w-full bg-[#111222] border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none shadow-neumorph-inset focus:border-emerald-500 appearance-none cursor-pointer"
                          >
                            <option value="investment">📈 Inversión</option>
                            <option value="pocket">🎯 Bolsillo / ahorro</option>
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={editData.initialBalance}
                            onChange={e => setEditData({ ...editData, initialBalance: e.target.value })}
                            className="w-full bg-[#111222] border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none text-right shadow-neumorph-inset focus:border-emerald-500"
                            placeholder="Saldo inicial"
                          />
                        </td>

                        <td className="px-3 py-3 text-right text-slate-500">—</td>
                        <td className="px-3 py-3 text-right text-slate-500">—</td>
                        <td className="px-3 py-3 text-right text-slate-500">—</td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={editData.tasaEA}
                            onChange={e => setEditData({ ...editData, tasaEA: e.target.value })}
                            step="0.01"
                            className="w-20 bg-[#111222] border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-amber-400 font-bold outline-none text-center mx-auto block shadow-neumorph-inset focus:border-amber-500"
                          />
                        </td>

                        <td className="px-3 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={saveEdit}
                              className="text-[#0b0c16] p-2 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                              title="Guardar cambios"
                            >
                              <CheckIcon size={14} />
                            </button>

                            <button
                              onClick={() => setEditId(null)}
                              className="text-rose-400 p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/30"
                              title="Cancelar"
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-bold text-white tracking-wide">
                        <div className="flex items-center gap-3">
                          <BankLogo name={c.name} type={c.type} />
                          <div>
                            <span className="block">{c.name}</span>
                            <span className="text-[9px] text-[#8A92A6] font-black uppercase tracking-widest">
                              {c.type === "investment" ? "Inversión" : "Bolsillo / ahorro"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          c.type === "investment"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-indigo-500/10 text-indigo-400"
                        }`}>
                          {getTypeLabel(c.type)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right text-[#8A92A6] tabular-nums">
                        {formatCOP(c.sInicial)}
                      </td>

                      <td className={`px-5 py-4 text-right font-black tabular-nums ${getValueColor(c.aportesRetirosMes)}`}>
                        {c.aportesRetirosMes > 0 ? "+" : ""}
                        {formatCOP(c.aportesRetirosMes)}
                      </td>

                      <td className="px-5 py-4 text-right font-black text-emerald-400 tabular-nums">
                        {isAddingGanancia ? (
                          <div className="flex justify-end gap-2 items-center">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">$</span>
                              <input
                                type="number"
                                value={gananciaMonto}
                                onChange={e => setGananciaMonto(e.target.value)}
                                className="w-24 bg-[#111222] border border-emerald-500/50 shadow-neumorph-inset rounded-lg pl-6 pr-2 py-1 text-xs text-white outline-none text-right focus:border-emerald-400"
                                autoFocus
                                placeholder="Monto"
                              />
                            </div>

                            <button
                              onClick={() => guardarGanancia(c)}
                              className="text-[#0b0c16] bg-emerald-400 hover:bg-emerald-300 p-1.5 rounded-md shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-colors"
                            >
                              <CheckIcon size={14} />
                            </button>

                            <button
                              onClick={() => {
                                setGananciaId(null);
                                setGananciaMonto("");
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-md transition-colors"
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-white flex items-center justify-end gap-1.5 transition-colors"
                            onClick={() => {
                              setGananciaId(c.id);
                              setEditId(null);
                            }}
                            title="Registrar rendimiento"
                          >
                            {c.rendimientoMes > 0 ? (
                              <>
                                <span className="text-[10px] text-emerald-500 font-bold">+</span>
                                {formatCOP(c.rendimientoMes)}
                              </>
                            ) : (
                              <span className="text-slate-500 hover:text-emerald-400">+ $0</span>
                            )}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-black text-white tabular-nums">
                        {formatCOP(c.saldoTotal)}
                      </td>

                      <td className="px-5 py-4 text-center text-amber-400 font-bold tabular-nums">
                        {toNumber(c.tasaEA)}%
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => startEdit(c)}
                            className="text-[#8A92A6] hover:text-neoncyan transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => confirmarEliminar(c)}
                            className="text-[#8A92A6] hover:text-neonmagenta transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {tablaData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-[#8A92A6] font-bold italic">
                      No hay cuentas de inversión o bolsillos registrados.
                    </td>
                  </tr>
                )}

                {tablaData.length > 0 && (
                  <tr className="bg-[#0b0c16]/50 font-black text-white border-t border-white/[0.05]">
                    <td className="px-5 py-5 uppercase tracking-widest text-[11px] text-[#8A92A6]">
                      Total portafolio
                    </td>

                    <td className="px-5 py-5 text-center text-[10px] text-[#8A92A6] uppercase tracking-widest">
                      {tablaData.length} cuentas
                    </td>

                    <td className="px-5 py-5 text-right tabular-nums">
                      {formatCOP(totalSInicial)}
                    </td>

                    <td className={`px-5 py-5 text-right tabular-nums ${getValueColor(totalAportesRetiros)}`}>
                      {totalAportesRetiros > 0 ? "+" : ""}
                      {formatCOP(totalAportesRetiros)}
                    </td>

                    <td className="px-5 py-5 text-right text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] tabular-nums">
                      + {formatCOP(totalRendimiento)}
                    </td>

                    <td className="px-5 py-5 text-right tabular-nums">
                      {formatCOP(totalSaldoTotal)}
                    </td>

                    <td colSpan="2" className="px-5 py-5 text-center"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-[#111222] shadow-neumorph-inset rounded-2xl p-4 border border-white/[0.03]">
            <p className="text-[11px] text-[#8A92A6] font-bold leading-relaxed">
              Nota: los aportes y retiros incluyen transferencias hacia/desde estas cuentas, ingresos directos no marcados como rendimiento y egresos pagados desde la cuenta. Los rendimientos se muestran aparte para no confundir plata aportada con ganancia real.
            </p>
          </div>
        </Card>
      </div>
    );
  };

  window.InversionesTab = InversionesTab;
})();
