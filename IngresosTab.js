(() => {
  // ============================================================================
  // ICONOS PRIVADOS PARA INGRESOS
  // ============================================================================
  const CheckIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const XIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const ChevronDownIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const ChevronUpIcon = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );

  const ListIcon = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );

  const Edit3Icon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );

  const Trash2Icon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const PlusIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  // ============================================================================
  // COMPONENTE PRINCIPAL
  // ============================================================================
  const IngresosTab = ({
    ingresos = [],
    addIngreso,
    updateIngreso,
    removeIngreso,
    ingresosFijos = [],
    addIngresoFijo,
    updateIngresoFijo,
    removeIngresoFijo,
    cuentas = [],
    selectedMonth = "",
    showToast,
    privacyMode
  }) => {
    const { useState, useMemo } = React;

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
      if (typeof value === "object") {
        if (value.descripcion !== undefined) return String(value.descripcion || "");
        if (value.name !== undefined) return String(value.name || "");
        if (value.tipo !== undefined) return String(value.tipo || "");
        return "";
      }
      return String(value);
    };

    const safeShowToast = (msg, type = "success") => {
      if (typeof showToast === "function") showToast(msg, type);
    };

    const safeGenerateId = () => {
      if (typeof generateId === "function") return generateId();
      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
      return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
    };

    const getLocalToday = () => {
      const d = new Date();
      const año = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    };

    const formatCOP = (val) => {
      if (privacyMode) return "****";
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }).format(toNumber(val));
    };

    const getCuentaName = (id) => {
      const c = asArray(cuentas).find(x => x && x.id === id);
      return c ? c.name : "Cuenta eliminada";
    };

    const getCuentaIcon = (cuenta) => {
      if (!cuenta) return "❌";
      if (cuenta.type === "cash") return "💵";
      if (cuenta.type === "investment") return "📈";
      if (cuenta.type === "pocket") return "🎯";
      return "🏦";
    };

    const getCuentaColor = (cuenta) => {
      if (!cuenta) return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
      if (cuenta.type === "investment") return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]";
      if (cuenta.type === "pocket") return "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]";
      if (cuenta.type === "cash") return "bg-neoncyan shadow-[0_0_8px_rgba(0,229,255,0.8)]";
      return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]";
    };

    const normalizeMonth = (value) => toText(value).slice(0, 7);

    // ============================================================================
    // ESTADOS GENERALES
    // ============================================================================
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isFijosOpen, setIsFijosOpen] = useState(false);
    const [isHistorialOpen, setIsHistorialOpen] = useState(true);

    // ============================================================================
    // FORMULARIO NUEVO INGRESO
    // ============================================================================
    const [fecha, setFecha] = useState(getLocalToday());
    const [descripcion, setDescripcion] = useState("");
    const [monto, setMonto] = useState("");
    const [cuentaId, setCuentaId] = useState("");
    const [tipo, setTipo] = useState("Fijo");

    // ============================================================================
    // EDICIÓN HISTORIAL
    // ============================================================================
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // ============================================================================
    // FILTROS HISTORIAL
    // ============================================================================
    const [filters, setFilters] = useState({
      descripcion: "",
      tipo: "",
      cuenta: ""
    });

    // ============================================================================
    // INGRESOS FIJOS PROGRAMADOS
    // ============================================================================
    const [ifState, setIfState] = useState({});
    const [editingIfId, setEditingIfId] = useState(null);
    const [ifEditData, setIfEditData] = useState({});

    const [nuevoIngresoFijo, setNuevoIngresoFijo] = useState({
      descripcion: "",
      monto: "",
      cuentaId: "",
      tipo: "Fijo",
      diaIngreso: "1"
    });

    // ============================================================================
    // MODAL DE CONFIRMACIÓN
    // ============================================================================
    const [confirmModal, setConfirmModal] = useState(null);

    const closeConfirmModal = () => setConfirmModal(null);

    const openConfirmModal = ({
      title,
      message,
      detail,
      actions = []
    }) => {
      setConfirmModal({
        title,
        message,
        detail,
        actions
      });
    };

    // ============================================================================
    // CUENTAS DISPONIBLES
    // ============================================================================
    const cuentasSafe = asArray(cuentas);
    const ingresosSafe = asArray(ingresos);
    const ingresosFijosSafe = asArray(ingresosFijos);

    const cuentasActivas = useMemo(() => {
      return cuentasSafe.filter(c => c && !["credit", "loan"].includes(c.type));
    }, [cuentasSafe]);

    // ============================================================================
    // INGRESOS DEL MES
    // ============================================================================
    const ingresosMes = useMemo(() => {
      return ingresosSafe
        .filter(i => normalizeMonth(i && i.fecha) === selectedMonth)
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    }, [ingresosSafe, selectedMonth]);

    const totalMes = ingresosMes.reduce((s, i) => s + toNumber(i && i.monto), 0);
    const totalFijos = ingresosMes.filter(i => i && i.tipo === "Fijo").reduce((s, i) => s + toNumber(i && i.monto), 0);
    const totalVariables = ingresosMes.filter(i => i && i.tipo === "Variable").reduce((s, i) => s + toNumber(i && i.monto), 0);
    const totalRendimientos = ingresosMes.filter(i => i && i.tipo === "Rendimiento").reduce((s, i) => s + toNumber(i && i.monto), 0);

    const ingresosFiltrados = useMemo(() => {
      return ingresosMes.filter(ingreso => {
        const desc = toText(ingreso && ingreso.descripcion).toLowerCase();
        const filtroDesc = toText(filters.descripcion).toLowerCase();

        const matchDesc = desc.includes(filtroDesc);
        const matchTipo = filters.tipo === "" || ingreso.tipo === filters.tipo;
        const matchCuenta = filters.cuenta === "" || ingreso.cuentaId === filters.cuenta;

        return matchDesc && matchTipo && matchCuenta;
      });
    }, [ingresosMes, filters]);

    const totalFiltrado = ingresosFiltrados.reduce((sum, i) => sum + toNumber(i && i.monto), 0);

    // ============================================================================
    // CRUD INGRESO NORMAL
    // ============================================================================
    const handleSubmit = (e) => {
      e.preventDefault();

      if (!descripcion || !monto || !cuentaId) {
        safeShowToast("Por favor completa descripción, monto y cuenta destino.", "error");
        return;
      }

      const montoNum = toNumber(monto);

      if (montoNum <= 0) {
        safeShowToast("El monto debe ser mayor a cero.", "error");
        return;
      }

      addIngreso({
        id: safeGenerateId(),
        fecha,
        descripcion: descripcion.trim(),
        monto: montoNum,
        cuentaId,
        tipo
      });

      setDescripcion("");
      setMonto("");
      safeShowToast("Ingreso registrado correctamente.");
    };

    const startEditing = (ingreso) => {
      const cuentaExiste = cuentasActivas.some(c => c.id === ingreso.cuentaId);

      setEditingId(ingreso.id);
      setEditData({
        ...ingreso,
        cuentaId: cuentaExiste ? ingreso.cuentaId : ""
      });
    };

    const saveEdit = async () => {
      if (!editData.descripcion || !editData.monto || !editData.cuentaId) {
        safeShowToast("Faltan datos en la edición. Verifica descripción, monto y cuenta.", "error");
        return;
      }

      const montoNum = toNumber(editData.monto);

      if (montoNum <= 0) {
        safeShowToast("El monto editado debe ser mayor a cero.", "error");
        return;
      }

      await updateIngreso(editingId, {
        ...editData,
        descripcion: toText(editData.descripcion).trim(),
        monto: montoNum
      });

      setEditingId(null);
      setEditData({});
      safeShowToast("Ingreso actualizado.");
    };

    const handleDelete = (ingreso) => {
      if (!ingreso || !ingreso.id) return;

      openConfirmModal({
        title: "Eliminar ingreso",
        message: `Se eliminará "${ingreso.descripcion || "este ingreso"}".`,
        detail: "Si este ingreso afectaba una cuenta, el saldo se recalculará automáticamente con los datos restantes.",
        actions: [
          {
            label: "Eliminar definitivamente",
            variant: "danger",
            onClick: () => {
              removeIngreso(ingreso.id);
              safeShowToast("Ingreso eliminado.", "error");
            }
          }
        ]
      });
    };

    const limpiarFiltros = () => {
      setFilters({ descripcion: "", tipo: "", cuenta: "" });
    };

    // ============================================================================
    // INGRESOS FIJOS PROGRAMADOS - LÓGICA
    // ============================================================================
    const getIngresoFijoRealizado = (inf) => {
      if (!inf) return null;

      return ingresosMes.find(i => {
        if (!i) return false;
        if (i.ingresoFijoId === inf.id) return true;

        const descIngreso = toText(i.descripcion).toLowerCase();
        const descFijo = toText(inf.descripcion).toLowerCase();

        return descIngreso && descFijo && descIngreso === descFijo && i.tipo === inf.tipo;
      }) || null;
    };

    const ingresosFijosVisibles = useMemo(() => {
      return ingresosFijosSafe
        .filter(inf => {
          const isHidden = (inf.skippedMonths || []).includes(selectedMonth);
          const isDifferentMonth = inf.mesEspecifico && inf.mesEspecifico !== selectedMonth;
          return !isHidden && !isDifferentMonth;
        })
        .sort((a, b) => {
          const aReceived = !!getIngresoFijoRealizado(a);
          const bReceived = !!getIngresoFijoRealizado(b);

          if (aReceived && !bReceived) return 1;
          if (!aReceived && bReceived) return -1;

          return (toNumber(a.diaIngreso) || 1) - (toNumber(b.diaIngreso) || 1);
        });
    }, [ingresosFijosSafe, ingresosMes, selectedMonth]);

    const ingresosFijosOcultos = useMemo(() => {
      return ingresosFijosSafe.filter(inf => {
        return (inf.skippedMonths || []).includes(selectedMonth) ||
               (inf.mesEspecifico && inf.mesEspecifico !== selectedMonth);
      });
    }, [ingresosFijosSafe, selectedMonth]);

    const getIfMonto = (inf) => {
      return ifState[inf.id]?.monto !== undefined ? ifState[inf.id].monto : toNumber(inf.monto);
    };

    const getIfCuenta = (inf) => {
      return ifState[inf.id]?.cuentaId !== undefined ? ifState[inf.id].cuentaId : (inf.cuentaId || "");
    };

    const handleIfChange = (id, field, value) => {
      setIfState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value
        }
      }));
    };

    const registrarIngresoFijo = (inf) => {
      const cuentaFinal = getIfCuenta(inf);
      const montoFinal = toNumber(getIfMonto(inf));

      if (!cuentaFinal) {
        safeShowToast("Selecciona la cuenta destino del ingreso programado.", "error");
        return;
      }

      if (montoFinal <= 0) {
        safeShowToast("El monto del ingreso debe ser mayor a cero.", "error");
        return;
      }

      addIngreso({
        id: safeGenerateId(),
        fecha: getLocalToday(),
        descripcion: inf.descripcion,
        monto: montoFinal,
        cuentaId: cuentaFinal,
        tipo: inf.tipo || "Fijo",
        ingresoFijoId: inf.id
      });

      safeShowToast(`Ingreso de ${inf.descripcion} registrado.`);
    };

    const deshacerIngresoFijo = (inf) => {
      const ingresoRegistrado = getIngresoFijoRealizado(inf);

      if (!ingresoRegistrado) return;

      openConfirmModal({
        title: `Revertir ${inf.descripcion}`,
        message: "Se eliminará el ingreso asociado a este ingreso programado.",
        detail: "La configuración del ingreso fijo no se borra. Solo se revierte el ingreso registrado este mes.",
        actions: [
          {
            label: "Revertir ingreso",
            variant: "warning",
            onClick: () => {
              removeIngreso(ingresoRegistrado.id);
              safeShowToast(`Se revirtió el ingreso de ${inf.descripcion}.`, "error");
            }
          }
        ]
      });
    };

    const startEditIngresoFijo = (inf) => {
      setEditingIfId(inf.id);
      setIfEditData({
        descripcion: inf.descripcion || "",
        monto: inf.monto || "",
        cuentaId: inf.cuentaId || "",
        tipo: inf.tipo || "Fijo",
        diaIngreso: inf.diaIngreso || 1
      });
    };

    const saveEditIngresoFijo = () => {
      if (!ifEditData.descripcion || !ifEditData.monto || !ifEditData.cuentaId) {
        safeShowToast("Completa descripción, monto y cuenta del ingreso fijo.", "error");
        return;
      }

      const montoNum = toNumber(ifEditData.monto);

      if (montoNum <= 0) {
        safeShowToast("El monto debe ser mayor a cero.", "error");
        return;
      }

      updateIngresoFijo(editingIfId, {
        descripcion: ifEditData.descripcion.trim(),
        monto: montoNum,
        cuentaId: ifEditData.cuentaId,
        tipo: ifEditData.tipo || "Fijo",
        diaIngreso: toNumber(ifEditData.diaIngreso) || 1
      });

      setEditingIfId(null);
      setIfEditData({});
      safeShowToast("Ingreso fijo actualizado.");
    };

    const handleDeleteIngresoFijo = (inf) => {
      openConfirmModal({
        title: `Gestionar ${inf.descripcion}`,
        message: "Elige qué quieres hacer con este ingreso programado.",
        detail: "Ocultarlo este mes no borra la configuración. Eliminarlo definitivamente lo quitará del sistema, pero no borra ingresos históricos ya registrados.",
        actions: [
          {
            label: "Ocultar este mes",
            variant: "warning",
            onClick: () => {
              const skipped = inf.skippedMonths || [];

              updateIngresoFijo(inf.id, {
                skippedMonths: [...new Set([...skipped, selectedMonth])]
              });

              safeShowToast(`Ingreso fijo oculto en ${selectedMonth}.`);
            }
          },
          {
            label: "Eliminar definitivamente",
            variant: "danger",
            onClick: () => {
              removeIngresoFijo(inf.id);
              safeShowToast("Ingreso fijo eliminado del sistema.", "error");
            }
          }
        ]
      });
    };

    const restoreIngresoFijo = (id) => {
      if (!id) return;

      const inf = ingresosFijosSafe.find(x => x.id === id);
      if (!inf) return;

      const skipped = (inf.skippedMonths || []).filter(m => m !== selectedMonth);

      updateIngresoFijo(id, {
        skippedMonths: skipped,
        mesEspecifico: null
      });

      safeShowToast("Ingreso fijo restaurado.");
    };

    const crearIngresoFijoBase = (isRecurrente) => {
      addIngresoFijo({
        id: safeGenerateId(),
        descripcion: nuevoIngresoFijo.descripcion.trim(),
        monto: toNumber(nuevoIngresoFijo.monto),
        cuentaId: nuevoIngresoFijo.cuentaId,
        tipo: nuevoIngresoFijo.tipo || "Fijo",
        diaIngreso: toNumber(nuevoIngresoFijo.diaIngreso) || 1,
        mesEspecifico: isRecurrente ? null : selectedMonth
      });

      setNuevoIngresoFijo({
        descripcion: "",
        monto: "",
        cuentaId: "",
        tipo: "Fijo",
        diaIngreso: "1"
      });

      safeShowToast(isRecurrente ? "Nuevo ingreso fijo agregado." : "Ingreso programado solo para este mes.");
    };

    const handleCreateNuevoIngresoFijo = () => {
      if (!nuevoIngresoFijo.descripcion || !nuevoIngresoFijo.monto || !nuevoIngresoFijo.cuentaId) {
        safeShowToast("Completa descripción, monto y cuenta destino.", "error");
        return;
      }

      const montoNum = toNumber(nuevoIngresoFijo.monto);

      if (montoNum <= 0) {
        safeShowToast("El monto debe ser mayor a cero.", "error");
        return;
      }

      openConfirmModal({
        title: "Tipo de ingreso programado",
        message: `¿Cómo quieres guardar "${nuevoIngresoFijo.descripcion}"?`,
        detail: "Recurrente aparecerá todos los meses. Solo este mes se mostrará únicamente en el mes activo.",
        actions: [
          {
            label: "Recurrente todos los meses",
            variant: "success",
            onClick: () => crearIngresoFijoBase(true)
          },
          {
            label: "Solo este mes",
            variant: "warning",
            onClick: () => crearIngresoFijoBase(false)
          }
        ]
      });
    };

    const totalProgramadoBase = ingresosFijosVisibles.reduce((s, inf) => s + toNumber(inf.monto), 0);

    const totalProgramadoRecibido = ingresosFijosVisibles.reduce((s, inf) => {
      const real = getIngresoFijoRealizado(inf);
      return s + (real ? toNumber(real.monto) : 0);
    }, 0);

    const totalProgramadoPendiente = Math.max(0, totalProgramadoBase - totalProgramadoRecibido);

    // ============================================================================
    // MODAL DE CONFIRMACIÓN
    // ============================================================================
    const ConfirmModal = () => {
      if (!confirmModal) return null;

      return (
        <div className="fixed inset-0 bg-[#0b0c16]/80 backdrop-blur-md z-[999] flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-appcard w-full max-w-md rounded-t-[28px] md:rounded-[28px] border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-6 animate-in slide-in-from-bottom-6 duration-300">
            <div className="mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.35)]">
                <ListIcon size={22} />
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
    // ESTILOS BASE
    // ============================================================================
    const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 placeholder:text-slate-600";
    const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
        <ConfirmModal />

        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b0c16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            Gestión de Ingresos
          </h1>

          <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
            Registra ingresos reales, rendimientos e ingresos fijos programados hacia cuentas, bolsillos o inversiones.
          </p>
        </header>

        {/* RESUMEN */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Total Ingresado</p>
            <p className="text-xl md:text-3xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">{formatCOP(totalMes)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Ingresos Fijos</p>
            <p className="text-xl md:text-3xl font-black text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">{formatCOP(totalFijos)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Ingresos Variables</p>
            <p className="text-xl md:text-3xl font-black text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">{formatCOP(totalVariables)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Rendimientos</p>
            <p className="text-xl md:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{formatCOP(totalRendimientos)}</p>
          </div>
        </div>

        {/* FORMULARIO NUEVO INGRESO */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
          <div
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
              Registrar Nuevo Ingreso
            </h2>

            <button className="text-slate-500 hover:text-white transition-colors">
              {isFormOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-5 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="md:col-span-1">
                <label className={labelBaseClass}>Fecha</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`${inputBaseClass} cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.8]`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelBaseClass}>Descripción</label>
                <input
                  type="text"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Salario, rendimiento, devolución..."
                  className={inputBaseClass}
                />
              </div>

              <div className="md:col-span-1">
                <label className={labelBaseClass}>Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className={`${inputBaseClass} appearance-none cursor-pointer`}
                >
                  <option value="Fijo" className="bg-[#111222]">Fijo</option>
                  <option value="Variable" className="bg-[#111222]">Variable</option>
                  <option value="Rendimiento" className="bg-[#111222]">Rendimiento</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className={labelBaseClass}>Destino</label>
                <select
                  required
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  className={`${inputBaseClass} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#111222]">Seleccione...</option>
                  {cuentasActivas.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#111222]">
                      {getCuentaIcon(c)} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 relative">
                <label className={labelBaseClass}>Monto</label>
                <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
                <input
                  type="number"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                  className={`${inputBaseClass} pl-8 font-black text-lg text-emerald-400`}
                />
              </div>

              <div className="md:col-span-6 flex justify-end mt-2 pt-4 border-t border-white/[0.05]">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#0b0c16] font-black py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 tracking-wide uppercase"
                >
                  <PlusIcon size={18} /> Registrar ingreso
                </button>
              </div>
            </form>
          )}
        </div>

        {/* INGRESOS FIJOS PROGRAMADOS */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
          <div
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsFijosOpen(!isFijosOpen)}
          >
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">2</span>
              Ingresos Fijos Programados
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest">
                {ingresosFijosVisibles.filter(inf => !!getIngresoFijoRealizado(inf)).length} / {ingresosFijosVisibles.length} recibidos
              </span>

              <button className="text-slate-500 hover:text-white transition-colors">
                {isFijosOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {isFijosOpen && (
            <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111222] shadow-neumorph-inset rounded-2xl p-4">
                  <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest">Programado</p>
                  <p className="text-xl font-black text-indigo-400">{formatCOP(totalProgramadoBase)}</p>
                </div>

                <div className="bg-[#111222] shadow-neumorph-inset rounded-2xl p-4">
                  <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest">Recibido</p>
                  <p className="text-xl font-black text-emerald-400">{formatCOP(totalProgramadoRecibido)}</p>
                </div>

                <div className="bg-[#111222] shadow-neumorph-inset rounded-2xl p-4">
                  <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest">Pendiente</p>
                  <p className="text-xl font-black text-amber-400">{formatCOP(totalProgramadoPendiente)}</p>
                </div>
              </div>

              {ingresosFijosOcultos.length > 0 && (
                <div className="flex justify-end">
                  <select
                    onChange={(e) => restoreIngresoFijo(e.target.value)}
                    className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-full sm:w-max shadow-neumorph"
                  >
                    <option value="">+ Restaurar ingreso fijo...</option>
                    {ingresosFijosOcultos.map(inf => (
                      <option key={inf.id} value={inf.id}>{inf.descripcion}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
                <table className="w-full text-sm text-left min-w-[980px]">
                  <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-5 py-4 text-center">Estado</th>
                      <th className="px-5 py-4">Nombre</th>
                      <th className="px-5 py-4">Tipo</th>
                      <th className="px-5 py-4 text-center">Día</th>
                      <th className="px-5 py-4">Destino</th>
                      <th className="px-5 py-4 text-right">Monto</th>
                      <th className="px-5 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.02]">
                    <tr className="bg-indigo-500/5 border-b-2 border-indigo-500/20">
                      <td className="px-3 py-3 text-center">
                        <PlusIcon size={16} className="text-indigo-400 mx-auto" />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={nuevoIngresoFijo.descripcion}
                          onChange={e => setNuevoIngresoFijo({ ...nuevoIngresoFijo, descripcion: e.target.value })}
                          className="w-full bg-[#111222] border border-indigo-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500"
                          placeholder="Ej. Salario, arriendo recibido..."
                        />
                      </td>

                      <td className="px-3 py-3">
                        <select
                          value={nuevoIngresoFijo.tipo}
                          onChange={e => setNuevoIngresoFijo({ ...nuevoIngresoFijo, tipo: e.target.value })}
                          className="w-full bg-[#111222] border border-indigo-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Fijo">Fijo</option>
                          <option value="Variable">Variable</option>
                          <option value="Rendimiento">Rendimiento</option>
                        </select>
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={nuevoIngresoFijo.diaIngreso}
                          onChange={e => setNuevoIngresoFijo({ ...nuevoIngresoFijo, diaIngreso: e.target.value })}
                          className="w-full bg-[#111222] border border-indigo-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-indigo-500"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <select
                          value={nuevoIngresoFijo.cuentaId}
                          onChange={e => setNuevoIngresoFijo({ ...nuevoIngresoFijo, cuentaId: e.target.value })}
                          className="w-full bg-[#111222] border border-indigo-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="">Cuenta destino...</option>
                          {cuentasActivas.map(c => (
                            <option key={c.id} value={c.id}>
                              {getCuentaIcon(c)} {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={nuevoIngresoFijo.monto}
                          onChange={e => setNuevoIngresoFijo({ ...nuevoIngresoFijo, monto: e.target.value })}
                          className="w-full bg-[#111222] border border-indigo-500/30 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-indigo-500"
                          placeholder="Monto"
                        />
                      </td>

                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={handleCreateNuevoIngresoFijo}
                          className="text-[#0b0c16] px-3 py-1.5 bg-indigo-400 rounded hover:bg-indigo-300 transition-colors text-[10px] font-black uppercase tracking-widest w-full"
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>

                    {ingresosFijosVisibles.map(inf => {
                      const ingresoRealizado = getIngresoFijoRealizado(inf);
                      const isReceived = !!ingresoRealizado;
                      const isEditingBase = editingIfId === inf.id;
                      const cuentaObj = cuentasActivas.find(c => c.id === inf.cuentaId);

                      if (isEditingBase) {
                        return (
                          <tr key={inf.id} className="bg-indigo-900/10">
                            <td className="px-3 py-3 text-center">-</td>

                            <td className="px-3 py-3">
                              <input
                                type="text"
                                value={ifEditData.descripcion}
                                onChange={e => setIfEditData({ ...ifEditData, descripcion: e.target.value })}
                                className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500"
                              />
                            </td>

                            <td className="px-3 py-3">
                              <select
                                value={ifEditData.tipo}
                                onChange={e => setIfEditData({ ...ifEditData, tipo: e.target.value })}
                                className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="Fijo">Fijo</option>
                                <option value="Variable">Variable</option>
                                <option value="Rendimiento">Rendimiento</option>
                              </select>
                            </td>

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={ifEditData.diaIngreso}
                                onChange={e => setIfEditData({ ...ifEditData, diaIngreso: e.target.value })}
                                className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-indigo-500"
                              />
                            </td>

                            <td className="px-3 py-3">
                              <select
                                value={ifEditData.cuentaId}
                                onChange={e => setIfEditData({ ...ifEditData, cuentaId: e.target.value })}
                                className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="">Cuenta destino...</option>
                                {cuentasActivas.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {getCuentaIcon(c)} {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={ifEditData.monto}
                                onChange={e => setIfEditData({ ...ifEditData, monto: e.target.value })}
                                className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-indigo-500"
                              />
                            </td>

                            <td className="px-3 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEditIngresoFijo} className="text-[#0b0c16] p-1.5 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors">
                                  <CheckIcon size={14} />
                                </button>

                                <button onClick={() => setEditingIfId(null)} className="text-rose-400 p-1.5 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors border border-rose-500/30">
                                  <XIcon size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={inf.id} className={`transition-colors ${isReceived ? "bg-emerald-900/10 opacity-60" : "hover:bg-white/[0.02]"}`}>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => isReceived ? deshacerIngresoFijo(inf) : registrarIngresoFijo(inf)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 mx-auto transition-all ${
                                isReceived
                                  ? "bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer hover:bg-rose-500 hover:border-rose-500"
                                  : "bg-[#111222] border-slate-600 text-transparent hover:border-emerald-500 cursor-pointer"
                              }`}
                            >
                              {isReceived && <CheckIcon size={14} />}
                            </button>
                          </td>

                          <td className={`px-5 py-3 font-bold tracking-wide ${isReceived ? "line-through text-emerald-500/70" : "text-white"}`}>
                            {inf.descripcion}
                          </td>

                          <td className="px-5 py-3 text-center">
                            <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-md uppercase tracking-widest ${
                              inf.tipo === "Fijo"
                                ? "bg-indigo-500/10 text-indigo-400"
                                : inf.tipo === "Rendimiento"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-neoncyan/10 text-neoncyan"
                            }`}>
                              {inf.tipo || "Fijo"}
                            </span>
                          </td>

                          <td className="px-5 py-3 text-center text-[#8A92A6] font-black">
                            {inf.diaIngreso || 1}
                          </td>

                          <td className="px-5 py-3">
                            {!isReceived ? (
                              <select
                                value={getIfCuenta(inf)}
                                onChange={(e) => handleIfChange(inf.id, "cuentaId", e.target.value)}
                                className="w-full bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-emerald-500 cursor-pointer"
                              >
                                <option value="">Seleccione cuenta...</option>
                                {cuentasActivas.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {getCuentaIcon(c)} {c.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                {getCuentaName(ingresoRealizado.cuentaId)}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3 text-right">
                            {!isReceived ? (
                              <input
                                type="number"
                                placeholder={inf.monto}
                                value={ifState[inf.id]?.monto !== undefined ? ifState[inf.id].monto : inf.monto}
                                onChange={(e) => handleIfChange(inf.id, "monto", e.target.value)}
                                className="w-28 bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-black outline-none text-right shadow-neumorph-inset focus:border-emerald-500 ml-auto"
                              />
                            ) : (
                              <span className="font-black text-emerald-500 tabular-nums">{formatCOP(ingresoRealizado.monto)}</span>
                            )}
                          </td>

                          <td className="px-5 py-3 text-center">
                            {!isReceived ? (
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => startEditIngresoFijo(inf)} className="text-[#8A92A6] hover:text-indigo-400 transition-colors" title="Editar ingreso fijo">
                                  <Edit3Icon size={16} />
                                </button>

                                <button onClick={() => handleDeleteIngresoFijo(inf)} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Ocultar / eliminar">
                                  <Trash2Icon size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-black">Recibido</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {ingresosFijosVisibles.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-[#8A92A6] font-bold">
                          No tienes ingresos fijos programados visibles este mes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* HISTORIAL */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
          <div
            className="flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsHistorialOpen(!isHistorialOpen)}
          >
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                <ListIcon size={14} />
              </span>
              Historial Completo de Ingresos
            </h2>

            <div className="flex items-center gap-3">
              <span className="bg-[#111222] shadow-neumorph-inset text-[#8A92A6] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                {ingresosFiltrados.length} movimientos
              </span>

              <button className="text-slate-500 hover:text-white transition-colors">
                {isHistorialOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {isHistorialOpen && (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.05] bg-[#111222] mt-6 shadow-neumorph-inset animate-in slide-in-from-top-4 fade-in duration-300">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-widest text-[#8A92A6] bg-[#0b0c16]/50">
                    <th className="p-4 font-black w-[12%]">Fecha</th>
                    <th className="p-4 font-black w-[28%]">Descripción</th>
                    <th className="p-4 font-black w-[15%] text-center">Tipo</th>
                    <th className="p-4 font-black w-[20%]">Destino</th>
                    <th className="p-4 font-black w-[15%] text-right">Monto</th>
                    <th className="p-4 font-black text-center w-[10%]">Acciones</th>
                  </tr>

                  <tr className="border-b-2 border-white/[0.05] bg-appcard/30">
                    <th className="p-2"></th>

                    <th className="p-2">
                      <input
                        type="text"
                        placeholder="Buscar descripción..."
                        className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-emerald-500 outline-none placeholder:text-slate-600"
                        value={filters.descripcion}
                        onChange={e => setFilters({ ...filters, descripcion: e.target.value })}
                      />
                    </th>

                    <th className="p-2">
                      <select
                        className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-emerald-500 outline-none appearance-none"
                        value={filters.tipo}
                        onChange={e => setFilters({ ...filters, tipo: e.target.value })}
                      >
                        <option value="">Tipos todos</option>
                        <option value="Fijo">Fijo</option>
                        <option value="Variable">Variable</option>
                        <option value="Rendimiento">Rendimiento</option>
                      </select>
                    </th>

                    <th className="p-2">
                      <select
                        className="w-full bg-[#111222] border border-transparent rounded-lg p-2 text-[11px] text-white focus:border-emerald-500 outline-none appearance-none"
                        value={filters.cuenta}
                        onChange={e => setFilters({ ...filters, cuenta: e.target.value })}
                      >
                        <option value="">Cuentas todas</option>
                        {cuentasActivas.map(c => (
                          <option key={c.id} value={c.id}>
                            {getCuentaIcon(c)} {c.name}
                          </option>
                        ))}
                      </select>
                    </th>

                    <th className="p-2"></th>

                    <th className="p-2 text-center">
                      <button
                        onClick={limpiarFiltros}
                        className="text-[10px] uppercase font-black text-emerald-400 hover:text-[#0b0c16] bg-emerald-500/10 hover:bg-emerald-500 px-3 py-1.5 rounded-lg w-full transition-all tracking-widest"
                      >
                        Limpiar
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {ingresosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-[#8A92A6] font-bold italic">
                        No se encontraron registros que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    ingresosFiltrados.map(ingreso => {
                      const isEditing = editingId === ingreso.id;
                      const cuentaObj = cuentasSafe.find(c => c.id === ingreso.cuentaId);
                      const cuentaName = cuentaObj?.name || "Cuenta eliminada";

                      return (
                        <tr key={ingreso.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-[#8A92A6] text-xs font-bold">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editData.fecha || ""}
                                onChange={e => setEditData({ ...editData, fecha: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                              />
                            ) : ingreso.fecha || "Sin fecha"}
                          </td>

                          <td className="p-4 text-white font-bold text-[13px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editData.descripcion || ""}
                                onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none"
                              />
                            ) : (
                              <div>
                                <span>{ingreso.descripcion || "Sin descripción"}</span>
                                {ingreso.ingresoFijoId && (
                                  <span className="block text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">
                                    Programado
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            {isEditing ? (
                              <select
                                value={editData.tipo || "Variable"}
                                onChange={e => setEditData({ ...editData, tipo: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none appearance-none cursor-pointer"
                              >
                                <option value="Fijo">Fijo</option>
                                <option value="Variable">Variable</option>
                                <option value="Rendimiento">Rendimiento</option>
                              </select>
                            ) : (
                              <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-md uppercase tracking-widest ${
                                ingreso.tipo === "Fijo"
                                  ? "bg-indigo-500/10 text-indigo-400"
                                  : ingreso.tipo === "Rendimiento"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-neoncyan/10 text-neoncyan"
                              }`}>
                                {ingreso.tipo || "Variable"}
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-[#8A92A6] text-xs font-bold uppercase tracking-wider">
                            {isEditing ? (
                              <select
                                value={editData.cuentaId || ""}
                                onChange={e => setEditData({ ...editData, cuentaId: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-white outline-none appearance-none cursor-pointer"
                              >
                                <option value="">Seleccione cuenta...</option>
                                {cuentasActivas.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {getCuentaIcon(c)} {c.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getCuentaColor(cuentaObj)}`}></div>
                                <span className={cuentaName === "Cuenta eliminada" ? "text-rose-400" : "text-[#8A92A6]"}>
                                  {cuentaName.substring(0, 22)}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="p-4 font-black text-emerald-400 text-right text-[14px]">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editData.monto || ""}
                                onChange={e => setEditData({ ...editData, monto: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-1 text-xs text-right text-emerald-400 font-black outline-none"
                              />
                            ) : formatCOP(ingreso.monto)}
                          </td>

                          <td className="p-4">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-400/10 rounded transition-colors" title="Confirmar">
                                  <CheckIcon size={18} />
                                </button>

                                <button onClick={() => setEditingId(null)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-400/10 rounded transition-colors" title="Cancelar">
                                  <XIcon size={18} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-4">
                                <button onClick={() => startEditing(ingreso)} className="text-[#8A92A6] hover:text-emerald-400 transition-colors" title="Editar">
                                  <Edit3Icon size={16} />
                                </button>

                                <button onClick={() => handleDelete(ingreso)} className="text-[#8A92A6] hover:text-rose-500 transition-colors" title="Eliminar">
                                  <Trash2Icon size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {ingresosFiltrados.length > 0 && (
                    <tr className="bg-[#0b0c16]/50 border-t border-white/[0.05]">
                      <td colSpan="4" className="px-4 py-4 text-[10px] font-black text-[#8A92A6] uppercase tracking-widest text-right">
                        Total en pantalla
                      </td>

                      <td className="p-4 font-black text-emerald-400 text-right text-[14px] drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] tabular-nums">
                        {formatCOP(totalFiltrado)}
                      </td>

                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  window.IngresosTab = IngresosTab;
})();
