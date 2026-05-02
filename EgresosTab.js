(() => {
  // ============================================================================
  // ICONOS PRIVADOS PARA EGRESOS
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
  // DICCIONARIO MAESTRO DE CATEGORÍAS
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
  // COMPONENTE PRINCIPAL
  // ============================================================================
  const EgresosTab = ({
    egresos = [],
    addEgreso,
    updateEgreso,
    removeEgreso,
    pagosFijos = [],
    addPagoFijo,
    updatePagoFijo,
    removePagoFijo,
    comprasCuotas = [],
    addComprasCuotas,
    removeComprasCuotas,
    cuentas = [],
    updateCuenta,
    removeCuenta,
    selectedMonth,
    presupuestos = [],
    categoriasMaestras = [],
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
        if (value.específico !== undefined) return String(value.específico || "");
        if (value.especifico !== undefined) return String(value.especifico || "");
        if (value.sub !== undefined) return String(value.sub || "");
        if (value.descripcion !== undefined) return String(value.descripcion || "");
        if (value.name !== undefined) return String(value.name || "");
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

    const getCategoriaOptions = () => Object.keys(CATEGORIAS_CONFIG);

    const findConfig = (categoria, especifico) => {
      const lista = CATEGORIAS_CONFIG[toText(categoria)] || [];
      return lista.find(i => i.específico === especifico) || null;
    };

    const getSubcategoria = (categoria, especifico, fallback = "Otros") => {
      const config = findConfig(categoria, especifico);
      return config ? config.sub : fallback;
    };

    const getCuentaName = (id) => {
      const c = asArray(cuentas).find(x => x && x.id === id);
      return c ? c.name : "Sin cuenta";
    };

    // ============================================================================
    // ESTADOS FORMULARIO PRINCIPAL
    // ============================================================================
    const [fecha, setFecha] = useState(getLocalToday());
    const [monto, setMonto] = useState("");
    const [metodoPago, setMetodoPago] = useState("");
    const [cuentaId, setCuentaId] = useState("");
    const [deudaId, setDeudaId] = useState("");
    const [interesesOtros, setInteresesOtros] = useState("");
    const [tipo, setTipo] = useState("Variable");

    const [catSeleccionada, setCatSeleccionada] = useState("");
    const [gastoEspecifico, setGastoEspecifico] = useState("");
    const [descripcionOpcional, setDescripcionOpcional] = useState("");

    // ============================================================================
    // ESTADOS EDICIÓN HISTORIAL
    // ============================================================================
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // ============================================================================
    // ESTADOS FILTROS
    // ============================================================================
    const [filters, setFilters] = useState({
      descripcion: "",
      tipo: "Ambos",
      categoria: "",
      cuenta: ""
    });

    // ============================================================================
    // ACORDEONES
    // ============================================================================
    const [openSections, setOpenSections] = useState({
      form: false,
      tc: false,
      fijos: false,
      historial: true
    });

    const toggleSection = (sec) => {
      setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
    };

    // ============================================================================
    // ESTADOS CHECKLISTS
    // ============================================================================
    const [pfState, setPfState] = useState({});
    const [tcState, setTcState] = useState({});

    const [editingPfId, setEditingPfId] = useState(null);
    const [pfEditData, setPfEditData] = useState({});

    const [editingTcId, setEditingTcId] = useState(null);
    const [tcEditData, setTcEditData] = useState({});

    const [nuevoPf, setNuevoPf] = useState({
      descripcion: "",
      monto: "",
      categoria: getCategoriaOptions()[0] || "",
      gastoEspecifico: "",
      descripcionOpcional: "",
      diaPago: "1"
    });

    // ============================================================================
    // CUENTAS
    // ============================================================================
    const cuentasSafe = asArray(cuentas);
    const egresosSafe = asArray(egresos);
    const pagosFijosSafe = asArray(pagosFijos);

    const cuentasActivas = useMemo(() => {
      return cuentasSafe.filter(c => c && ["bank", "cash", "pocket"].includes(c.type));
    }, [cuentasSafe]);

    const todasLasDeudas = useMemo(() => {
      return cuentasSafe.filter(c => c && ["credit", "loan"].includes(c.type));
    }, [cuentasSafe]);

    const tarjetasCredito = useMemo(() => {
      return cuentasSafe.filter(c => c && c.type === "credit");
    }, [cuentasSafe]);

    const cuentasFiltradas = useMemo(() => {
      if (!metodoPago) return [];
      if (metodoPago === "cash") return cuentasActivas.filter(c => c.type === "cash");
      if (metodoPago === "bank") return cuentasActivas.filter(c => c.type === "bank" || c.type === "pocket");
      if (metodoPago === "credit") return tarjetasCredito;
      return [];
    }, [metodoPago, cuentasActivas, tarjetasCredito]);

    // ============================================================================
    // EGRESOS DEL MES
    // ============================================================================
    const egresosMes = useMemo(() => {
      return egresosSafe
        .filter(e => toText(e && e.fecha).startsWith(selectedMonth))
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    }, [egresosSafe, selectedMonth]);

    const totalMes = egresosMes.reduce((s, e) => s + toNumber(e.monto), 0);
    const totalFijos = egresosMes.filter(e => e.tipo === "Fijo").reduce((s, e) => s + toNumber(e.monto), 0);
    const totalVariables = egresosMes.filter(e => e.tipo !== "Fijo").reduce((s, e) => s + toNumber(e.monto), 0);

    const egresosFiltrados = useMemo(() => {
      return egresosMes.filter(egreso => {
        const descripcionBusqueda = `${toText(egreso.descripcion)} ${toText(egreso.gastoEspecifico)} ${toText(egreso.subcategoria)}`.toLowerCase();
        const matchDesc = descripcionBusqueda.includes(toText(filters.descripcion).toLowerCase());
        const matchTipo = filters.tipo === "Ambos" || egreso.tipo === filters.tipo;
        const matchCat = filters.categoria === "" || egreso.categoria === filters.categoria;
        const matchCuenta = filters.cuenta === "" || egreso.cuentaId === filters.cuenta;
        return matchDesc && matchTipo && matchCat && matchCuenta;
      });
    }, [egresosMes, filters]);

    const opcionesEspecificas = useMemo(() => {
      return catSeleccionada ? (CATEGORIAS_CONFIG[catSeleccionada] || []) : [];
    }, [catSeleccionada]);

    // ============================================================================
    // FORMULARIO PRINCIPAL
    // ============================================================================
    const handleSubmit = (e) => {
      e.preventDefault();

      if (!catSeleccionada || !gastoEspecifico || !monto || !cuentaId) {
        safeShowToast("Por favor completa categoría, gasto específico, monto y cuenta.", "error");
        return;
      }

      const montoNum = toNumber(monto);
      if (montoNum <= 0) {
        safeShowToast("El monto debe ser mayor a cero.", "error");
        return;
      }

      const descripcionLimpia = descripcionOpcional.trim();
      const subcat = getSubcategoria(catSeleccionada, gastoEspecifico);

      addEgreso({
        id: safeGenerateId(),
        fecha,
        descripcion: descripcionLimpia || gastoEspecifico,
        gastoEspecifico,
        descripcionOpcional: descripcionLimpia,
        categoria: catSeleccionada,
        subcategoria: subcat,
        monto: montoNum,
        interesesOtros: toNumber(interesesOtros),
        cuentaId,
        tipo,
        deudaId: deudaId || null
      });

      setGastoEspecifico("");
      setDescripcionOpcional("");
      setMonto("");
      setInteresesOtros("");
      setDeudaId("");

      safeShowToast("Gasto registrado correctamente.");
    };

    // ============================================================================
    // EDICIÓN HISTORIAL
    // ============================================================================
    const startEditing = (egreso) => {
      const categoria = egreso.categoria || "";
      const gastoBase = egreso.gastoEspecifico || egreso.descripcion || "";
      const descripcionOpc = egreso.descripcionOpcional || (
        egreso.gastoEspecifico && egreso.descripcion !== egreso.gastoEspecifico ? egreso.descripcion : ""
      );

      setEditingId(egreso.id);
      setEditData({
        ...egreso,
        categoria,
        gastoEspecifico: gastoBase,
        descripcionOpcional: descripcionOpc
      });
    };

    const saveEdit = async () => {
      if (!editData || !editingId) return;

      if (!editData.categoria || !editData.gastoEspecifico || !editData.monto || !editData.cuentaId) {
        safeShowToast("Faltan datos en la edición.", "error");
        return;
      }

      const montoNum = toNumber(editData.monto);
      if (montoNum <= 0) {
        safeShowToast("El monto editado debe ser mayor a cero.", "error");
        return;
      }

      const gastoBase = editData.gastoEspecifico || editData.descripcion;
      const descripcionLimpia = toText(editData.descripcionOpcional).trim();
      const subcat = getSubcategoria(editData.categoria, gastoBase, editData.subcategoria || "Otros");

      await updateEgreso(editingId, {
        ...editData,
        gastoEspecifico: gastoBase,
        descripcion: descripcionLimpia || gastoBase,
        descripcionOpcional: descripcionLimpia,
        subcategoria: subcat,
        monto: montoNum,
        interesesOtros: toNumber(editData.interesesOtros),
        deudaId: editData.deudaId || null
      });

      setEditingId(null);
      setEditData({});
      safeShowToast("Gasto actualizado.");
    };

    const handleDelete = (id) => {
      if (!id) return;
      if (window.confirm("¿Estás seguro de eliminar este gasto?")) {
        removeEgreso(id);
        safeShowToast("Gasto eliminado.", "error");
      }
    };

    const limpiarFiltros = () => {
      setFilters({ descripcion: "", tipo: "Ambos", categoria: "", cuenta: "" });
    };

    // ============================================================================
    // TARJETAS DE CRÉDITO
    // ============================================================================
    const getTCPagada = (tc) => {
      const pagosAsociados = egresosMes.filter(e => {
        if (!e || !tc) return false;
        if (e.pagoTarjetaId === tc.id) return true;
        if (e.deudaId === tc.id) return true;

        const catLow = toText(e.categoria).toLowerCase();
        const descLow = toText(e.descripcion).toLowerCase();
        const espLow = toText(e.gastoEspecifico).toLowerCase();
        const tcNameLow = toText(tc.name).toLowerCase();

        const parecePagoTC =
          catLow.includes("tarjet") ||
          catLow.includes("crédito") ||
          catLow.includes("credito") ||
          catLow.includes("deuda") ||
          catLow.includes("obligaciones");

        return parecePagoTC && (descLow.includes(tcNameLow) || espLow.includes(tcNameLow));
      });

      const montoTotal = pagosAsociados.reduce((sum, p) => sum + toNumber(p.monto), 0);

      return {
        isPaid: montoTotal > 0,
        monto: montoTotal,
        pagos: pagosAsociados
      };
    };

    const handleTcChange = (id, field, value) => {
      setTcState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value
        }
      }));
    };

    const registrarPagoTC = (tc) => {
      const cuentaSale = tcState[tc.id]?.cuentaId || "";
      const montoPago = toNumber(tcState[tc.id]?.monto);

      if (!cuentaSale) return safeShowToast("Selecciona desde qué cuenta pagarás la tarjeta.", "error");
      if (montoPago <= 0) return safeShowToast("Debes ingresar un monto a pagar mayor a 0.", "error");

      addEgreso({
        id: safeGenerateId(),
        fecha: getLocalToday(),
        descripcion: `Pago Tarjeta: ${tc.name}`,
        gastoEspecifico: tc.name,
        descripcionOpcional: `Pago Tarjeta: ${tc.name}`,
        categoria: "💳 Obligaciones (Deudas)",
        subcategoria: toText(tc.name).toLowerCase().includes("andre") ? "Tarjeta de Crédito A" : "Tarjeta de Crédito L",
        monto: montoPago,
        cuentaId: cuentaSale,
        tipo: "Fijo",
        deudaId: tc.id,
        pagoTarjetaId: tc.id
      });

      setTcState(prev => {
        const n = { ...prev };
        if (n[tc.id]) n[tc.id].monto = "";
        return n;
      });

      safeShowToast(`Pago de tarjeta ${tc.name} registrado por ${formatCOP(montoPago)}.`);
    };

    const deshacerPagoTC = (tc) => {
      const datosPago = getTCPagada(tc);

      if (datosPago.pagos.length > 0) {
        if (window.confirm(`Se encontraron ${datosPago.pagos.length} pagos este mes sumando ${formatCOP(datosPago.monto)}.\n¿Deseas revertirlos todos?`)) {
          datosPago.pagos.forEach(p => removeEgreso(p.id));
          safeShowToast("Pagos de tarjeta revertidos.", "error");
        }
      }
    };

    const handleDeleteTc = (tc) => {
      const action = window.prompt(
        `¿Qué deseas hacer con la tarjeta "${tc.name}" en este checklist?\n\n1. Ocultar SOLO este mes\n2. Ocultar para SIEMPRE\n\nEscribe 1 o 2:`
      );

      if (action === "1") {
        const skipped = tc.skippedMonths || [];
        if (updateCuenta) updateCuenta(tc.id, { skippedMonths: [...skipped, selectedMonth] });
        safeShowToast(`Tarjeta oculta en ${selectedMonth}.`);
      } else if (action === "2") {
        if (updateCuenta) updateCuenta(tc.id, { hideFromChecklist: true });
        safeShowToast("Tarjeta oculta permanentemente.", "error");
      }
    };

    const startEditTc = (tc) => {
      setEditingTcId(tc.id);
      setTcEditData({
        name: tc.name || "",
        currentDebt: tc.currentDebt || "",
        diaPago: tc.diaPago || 1
      });
    };

    const saveEditTc = () => {
      if (!tcEditData.name) return safeShowToast("El nombre es requerido.", "error");

      if (updateCuenta) {
        updateCuenta(editingTcId, {
          name: tcEditData.name,
          currentDebt: toNumber(tcEditData.currentDebt),
          diaPago: toNumber(tcEditData.diaPago) || 1
        });
      }

      setEditingTcId(null);
      safeShowToast("Tarjeta actualizada.");
    };

    // ============================================================================
    // PAGOS FIJOS
    // ============================================================================
    const getPagoRealizado = (pf) => {
      return egresosMes.find(e => {
        if (!e || !pf) return false;
        if (e.pagoFijoId === pf.id) return true;

        const descE = toText(e.descripcion).toLowerCase();
        const descP = toText(pf.descripcion).toLowerCase();

        return e.tipo === "Fijo" && descE && descP && descE === descP;
      });
    };

    const getPfMonto = (pf) => {
      return pfState[pf.id]?.monto !== undefined ? pfState[pf.id].monto : toNumber(pf.monto);
    };

    const getPfCuenta = (pf) => {
      return pfState[pf.id]?.cuentaId !== undefined ? pfState[pf.id].cuentaId : "";
    };

    const handlePfChange = (id, field, value) => {
      setPfState(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value
        }
      }));
    };

    const registrarPagoFijo = (pf) => {
      const cuentaFinal = getPfCuenta(pf);
      const montoFinal = toNumber(getPfMonto(pf));

      if (!cuentaFinal) return safeShowToast("Selecciona desde qué cuenta vas a pagar.", "error");
      if (montoFinal <= 0) return safeShowToast("El monto del pago debe ser mayor a cero.", "error");

      const gastoBase = pf.gastoEspecifico || pf.descripcion;
      const subcat = getSubcategoria(pf.categoria, gastoBase, pf.subcategoria || "Otros");

      addEgreso({
        id: safeGenerateId(),
        fecha: getLocalToday(),
        descripcion: pf.descripcion,
        gastoEspecifico: gastoBase,
        descripcionOpcional: pf.descripcionOpcional || "",
        categoria: pf.categoria || "Otros",
        subcategoria: subcat,
        monto: montoFinal,
        cuentaId: cuentaFinal,
        tipo: "Fijo",
        pagoFijoId: pf.id
      });

      safeShowToast(`Pago de ${pf.descripcion} registrado.`);
    };

    const deshacerPagoFijo = (pf) => {
      const egresoAEliminar = getPagoRealizado(pf);

      if (egresoAEliminar) {
        removeEgreso(egresoAEliminar.id);
        safeShowToast(`Se ha revertido el pago de ${pf.descripcion}.`, "error");
      }
    };

    const handleDeletePf = (pf) => {
      const action = window.prompt(
        `¿Qué deseas hacer con el pago fijo "${pf.descripcion}"?\n\n1. Ocultar SOLO este mes\n2. Eliminar del sistema para SIEMPRE\n\nEscribe 1 o 2:`
      );

      if (action === "1") {
        const skipped = pf.skippedMonths || [];
        updatePagoFijo(pf.id, { skippedMonths: [...skipped, selectedMonth] });
        safeShowToast(`Pago fijo oculto en ${selectedMonth}.`);
      } else if (action === "2") {
        if (window.confirm(`¿Seguro que quieres eliminar "${pf.descripcion}" para siempre? Los pagos viejos no se borran.`)) {
          removePagoFijo(pf.id);
          safeShowToast("Pago fijo eliminado del sistema.", "error");
        }
      }
    };

    const startEditPf = (pf) => {
      setEditingPfId(pf.id);
      setPfEditData({
        descripcion: pf.descripcion || "",
        categoria: pf.categoria || getCategoriaOptions()[0] || "",
        gastoEspecifico: pf.gastoEspecifico || pf.descripcion || "",
        descripcionOpcional: pf.descripcionOpcional || "",
        monto: pf.monto || "",
        diaPago: pf.diaPago || 1
      });
    };

    const saveEditPf = () => {
      if (!pfEditData.descripcion || !pfEditData.monto) {
        return safeShowToast("El nombre y el monto son obligatorios.", "error");
      }

      const gastoBase = pfEditData.gastoEspecifico || pfEditData.descripcion;
      const subcat = getSubcategoria(pfEditData.categoria, gastoBase, "Otros");

      updatePagoFijo(editingPfId, {
        descripcion: pfEditData.descripcion,
        categoria: pfEditData.categoria,
        gastoEspecifico: gastoBase,
        descripcionOpcional: pfEditData.descripcionOpcional || "",
        subcategoria: subcat,
        monto: toNumber(pfEditData.monto),
        diaPago: toNumber(pfEditData.diaPago) || 1
      });

      setEditingPfId(null);
      safeShowToast("Pago fijo base actualizado.");
    };

    const handleCreateNuevoPf = () => {
      if (!nuevoPf.descripcion || !nuevoPf.monto) {
        return safeShowToast("Escribe un nombre y un monto.", "error");
      }

      const isRecurrente = window.confirm(
        "¿Este pago fijo es RECURRENTE?\n\n[Aceptar] = Sí, todos los meses\n[Cancelar] = No, SOLO este mes"
      );

      const gastoBase = nuevoPf.gastoEspecifico || nuevoPf.descripcion;
      const subcat = getSubcategoria(nuevoPf.categoria, gastoBase, "Otros");

      addPagoFijo({
        id: safeGenerateId(),
        descripcion: nuevoPf.descripcion,
        categoria: nuevoPf.categoria,
        gastoEspecifico: gastoBase,
        descripcionOpcional: nuevoPf.descripcionOpcional || "",
        subcategoria: subcat,
        monto: toNumber(nuevoPf.monto),
        diaPago: toNumber(nuevoPf.diaPago) || 1,
        mesEspecifico: isRecurrente ? null : selectedMonth
      });

      setNuevoPf({
        descripcion: "",
        monto: "",
        categoria: getCategoriaOptions()[0] || "",
        gastoEspecifico: "",
        descripcionOpcional: "",
        diaPago: "1"
      });

      safeShowToast(isRecurrente ? "Nuevo pago fijo agregado." : "Pago programado solo para este mes.");
    };

    // ============================================================================
    // VISIBILIDAD CHECKLISTS
    // ============================================================================
    const pagosFijosVisibles = useMemo(() => {
      return pagosFijosSafe
        .filter(pf => {
          const cat = toText(pf.categoria).toLowerCase();
          const desc = toText(pf.descripcion).toLowerCase();

          const isTC = cat.includes("tarjet") || desc.includes("tarjeta de cr");
          const isHidden = (pf.skippedMonths || []).includes(selectedMonth);
          const isDifferentMonth = pf.mesEspecifico && pf.mesEspecifico !== selectedMonth;

          return !isTC && !isHidden && !isDifferentMonth;
        })
        .sort((a, b) => {
          const aPaid = !!getPagoRealizado(a);
          const bPaid = !!getPagoRealizado(b);

          if (aPaid && !bPaid) return 1;
          if (!aPaid && bPaid) return -1;

          return (toNumber(a.diaPago) || 1) - (toNumber(b.diaPago) || 1);
        });
    }, [pagosFijosSafe, egresosMes, selectedMonth]);

    const tarjetasCreditoVisibles = useMemo(() => {
      return tarjetasCredito.filter(c => !(c.skippedMonths || []).includes(selectedMonth) && !c.hideFromChecklist);
    }, [tarjetasCredito, selectedMonth]);

    const hiddenTCs = tarjetasCredito.filter(c => (c.skippedMonths || []).includes(selectedMonth) || c.hideFromChecklist);

    const hiddenPFs = pagosFijosSafe.filter(pf => {
      const cat = toText(pf.categoria).toLowerCase();
      const desc = toText(pf.descripcion).toLowerCase();
      const isTC = cat.includes("tarjet") || desc.includes("tarjeta de cr");

      return !isTC && (
        (pf.skippedMonths || []).includes(selectedMonth) ||
        (pf.mesEspecifico && pf.mesEspecifico !== selectedMonth)
      );
    });

    const restoreTC = (id) => {
      if (!id) return;

      const tc = cuentasSafe.find(c => c.id === id);
      if (!tc) return;

      const skipped = (tc.skippedMonths || []).filter(m => m !== selectedMonth);
      if (updateCuenta) updateCuenta(id, { skippedMonths: skipped, hideFromChecklist: false });

      safeShowToast("Tarjeta restaurada.");
    };

    const restorePF = (id) => {
      if (!id) return;

      const pf = pagosFijosSafe.find(p => p.id === id);
      if (!pf) return;

      const skipped = (pf.skippedMonths || []).filter(m => m !== selectedMonth);
      updatePagoFijo(id, { skippedMonths: skipped, mesEspecifico: null });

      safeShowToast("Pago fijo restaurado.");
    };

    const tcTotalDeuda = tarjetasCreditoVisibles.reduce((s, tc) => s + toNumber(tc.currentDebt), 0);

    const tcTotalPagar = tarjetasCreditoVisibles.reduce((sum, tc) => {
      const data = getTCPagada(tc);
      if (data.isPaid) return sum + data.monto;
      return sum + toNumber(tcState[tc.id]?.monto);
    }, 0);

    const pfTotalBase = pagosFijosVisibles.reduce((s, pf) => s + toNumber(pf.monto), 0);

    const pfTotalPagar = pagosFijosVisibles.reduce((sum, pf) => {
      const data = getPagoRealizado(pf);
      if (data) return sum + toNumber(data.monto);

      return sum + (
        pfState[pf.id]?.monto !== undefined
          ? toNumber(pfState[pf.id].monto)
          : toNumber(pf.monto)
      );
    }, 0);

    // ============================================================================
    // CLASES UI
    // ============================================================================
    const inputBaseClass = "w-full bg-[#111222] shadow-neumorph-inset border border-transparent rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-neonmagenta focus:shadow-glow-magenta transition-all duration-300 placeholder:text-slate-600";
    const labelBaseClass = "text-[10px] font-black text-[#8A92A6] uppercase tracking-widest pl-1 mb-1.5 block";

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonmagenta to-purple-600 flex items-center justify-center shadow-glow-magenta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b0c16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 17.5v-11" />
              </svg>
            </div>
            Gestión de Egresos
          </h1>

          <p className="text-sm md:text-base text-[#8A92A6] mt-2 font-medium tracking-wide">
            Registra gastos diarios, pagos fijos, abonos a deudas y movimientos con categoría/subcategoría.
          </p>
        </header>

        {/* RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Total Gastado Mes</p>
            <p className="text-xl md:text-3xl font-black text-neonmagenta drop-shadow-[0_0_8px_rgba(255,0,122,0.4)]">{formatCOP(totalMes)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Gastos Fijos</p>
            <p className="text-xl md:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{formatCOP(totalFijos)}</p>
          </div>

          <div className="p-5 bg-[#111222] shadow-neumorph-inset rounded-[20px] border border-transparent flex flex-col justify-center">
            <p className="text-[10px] text-[#8A92A6] uppercase font-black tracking-widest mb-1">Gastos Variables</p>
            <p className="text-xl md:text-3xl font-black text-neoncyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">{formatCOP(totalVariables)}</p>
          </div>
        </div>

        {/* FORMULARIO PRINCIPAL */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
          <div className="flex justify-between items-center cursor-pointer mb-2 select-none" onClick={() => toggleSection("form")}>
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-6 h-6 rounded-md bg-neonmagenta/20 text-neonmagenta flex items-center justify-center text-xs">1</span>
              Registrar Gasto o Pago Libre
            </h2>

            <button className="text-slate-500 hover:text-white transition-colors">
              {openSections.form ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>

          {openSections.form && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <div>
                <label className={labelBaseClass}>1. Área de gasto</label>
                <select
                  required
                  value={catSeleccionada}
                  onChange={(e) => {
                    setCatSeleccionada(e.target.value);
                    setGastoEspecifico("");
                    setDescripcionOpcional("");
                  }}
                  className={`${inputBaseClass} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#111222]">Seleccione categoría...</option>
                  {getCategoriaOptions().map(cat => (
                    <option key={cat} value={cat} className="bg-[#111222]">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelBaseClass}>2. Gasto específico</label>
                <select
                  required
                  disabled={!catSeleccionada}
                  value={gastoEspecifico}
                  onChange={(e) => {
                    setGastoEspecifico(e.target.value);
                    setDescripcionOpcional("");
                  }}
                  className={`${inputBaseClass} disabled:opacity-30 appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#111222]">Seleccione detalle...</option>
                  {opcionesEspecificas.map(opt => (
                    <option key={opt.específico} value={opt.específico} className="bg-[#111222]">
                      {opt.específico}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelBaseClass}>3. Subcategoría automática</label>
                <div className="w-full bg-[#0b0c16] shadow-neumorph-inset border border-white/5 rounded-xl px-4 py-3.5 text-xs text-neoncyan font-bold uppercase tracking-widest opacity-80 flex items-center min-h-[46px]">
                  {gastoEspecifico ? getSubcategoria(catSeleccionada, gastoEspecifico) : "---"}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className={labelBaseClass}>Descripción opcional</label>
                <input
                  type="text"
                  value={descripcionOpcional}
                  onChange={(e) => setDescripcionOpcional(e.target.value)}
                  placeholder={
                    gastoEspecifico
                      ? `Ej: ${gastoEspecifico} - detalle adicional`
                      : "Ej: almuerzo, compra rápida, pago parcial..."
                  }
                  className={`${inputBaseClass} text-white`}
                />
                <p className="text-[10px] text-[#8A92A6] font-bold mt-1 pl-1">
                  Si la dejas vacía, se guardará como: {gastoEspecifico || "gasto específico seleccionado"}.
                </p>
              </div>

              <div>
                <label className={labelBaseClass}>Método de pago</label>
                <select
                  required
                  value={metodoPago}
                  onChange={(e) => {
                    setMetodoPago(e.target.value);
                    setCuentaId("");
                  }}
                  className={`${inputBaseClass} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#111222]">Seleccione...</option>
                  <option value="cash" className="bg-[#111222]">💵 Efectivo</option>
                  <option value="bank" className="bg-[#111222]">🏦 Débito / Ahorro</option>
                  <option value="credit" className="bg-[#111222]">💳 Tarjeta de Crédito</option>
                </select>
              </div>

              <div>
                <label className={labelBaseClass}>De dónde sale la plata</label>
                <select
                  required
                  disabled={!metodoPago}
                  value={cuentaId}
                  onChange={(e) => setCuentaId(e.target.value)}
                  className={`${inputBaseClass} appearance-none cursor-pointer disabled:opacity-30`}
                >
                  <option value="" className="bg-[#111222]">{metodoPago ? "Seleccione cuenta..." : "Elija método de pago"}</option>
                  {cuentasFiltradas.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#111222]">
                      {c.type === "cash" ? "💵" : c.type === "credit" ? "💳" : "🏦"} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
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

              <div className="md:col-span-2 relative">
                <label className={labelBaseClass}>Monto total pagado</label>
                <span className="absolute left-4 top-[38px] text-lg font-black text-slate-600">$</span>
                <input
                  type="number"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                  className={`${inputBaseClass} pl-8 font-black text-lg text-neonmagenta`}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1 mb-1.5 flex items-center gap-1">
                  Abonar a deuda opcional
                </label>
                <select
                  value={deudaId}
                  onChange={(e) => setDeudaId(e.target.value)}
                  className={`${inputBaseClass} !border-indigo-500/30 focus:!border-indigo-500 focus:!shadow-[0_0_15px_rgba(99,102,241,0.4)] appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#111222]">No es pago a deuda</option>
                  {todasLasDeudas.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#111222]">Pagar: {d.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 flex flex-col md:flex-row justify-between items-center mt-4 pt-6 border-t border-white/[0.05] gap-4">
                <div className="flex bg-[#111222] shadow-neumorph-inset rounded-xl p-1 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setTipo("Variable")}
                    className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${tipo === "Variable" ? "bg-neoncyan text-[#0b0c16] shadow-glow-cyan" : "text-[#8A92A6] hover:text-white"}`}
                  >
                    Variable
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipo("Fijo")}
                    className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${tipo === "Fijo" ? "bg-amber-500 text-[#0b0c16] shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "text-[#8A92A6] hover:text-white"}`}
                  >
                    Fijo
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-neonmagenta hover:bg-[#ff1a8c] text-[#0b0c16] font-black py-3.5 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-magenta hover:scale-105 active:scale-95 tracking-wide uppercase"
                >
                  <PlusIcon size={18} /> Guardar movimiento
                </button>
              </div>
            </form>
          )}
        </div>

        {/* CHECKLIST TARJETAS */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
          <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => toggleSection("tc")}>
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
              <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">2</span>
              Pagos a Tarjetas de Crédito
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest">
                {tarjetasCreditoVisibles.filter(tc => getTCPagada(tc).isPaid).length} / {tarjetasCreditoVisibles.length} listas
              </span>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openSections.tc ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {openSections.tc && (
            <div className="mt-8 space-y-8 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-end sm:items-end mb-4 gap-3">
                {hiddenTCs.length > 0 ? (
                  <select
                    onChange={(e) => restoreTC(e.target.value)}
                    className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-full sm:w-max shadow-neumorph"
                  >
                    <option value="">+ Agregar tarjeta...</option>
                    {hiddenTCs.map(tc => (
                      <option key={tc.id} value={tc.id}>{tc.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Todas las tarjetas agregadas</span>
                )}
              </div>

              <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
                <table className="w-full text-sm text-left min-w-[780px]">
                  <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-5 py-4 text-center">Estado</th>
                      <th className="px-5 py-4">Tarjeta</th>
                      <th className="px-5 py-4 text-center">Día</th>
                      <th className="px-5 py-4 text-right">Deuda total</th>
                      <th className="px-5 py-4">Pagar desde</th>
                      <th className="px-5 py-4 text-right">Monto</th>
                      <th className="px-5 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.02]">
                    {tarjetasCreditoVisibles.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-[#8A92A6] font-bold italic">
                          No tienes tarjetas visibles.
                        </td>
                      </tr>
                    ) : (
                      tarjetasCreditoVisibles.map(tc => {
                        const datosPago = getTCPagada(tc);
                        const isPaid = datosPago.isPaid;
                        const isEditingBase = editingTcId === tc.id;

                        if (isEditingBase) {
                          return (
                            <tr key={tc.id} className="bg-indigo-900/10">
                              <td className="px-3 py-3 text-center">-</td>
                              <td className="px-3 py-3">
                                <input
                                  type="text"
                                  value={tcEditData.name}
                                  onChange={e => setTcEditData({ ...tcEditData, name: e.target.value })}
                                  className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="number"
                                  value={tcEditData.diaPago}
                                  onChange={e => setTcEditData({ ...tcEditData, diaPago: e.target.value })}
                                  className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-indigo-500"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="number"
                                  value={tcEditData.currentDebt}
                                  onChange={e => setTcEditData({ ...tcEditData, currentDebt: e.target.value })}
                                  className="w-full bg-[#111222] border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-rose-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-indigo-500"
                                />
                              </td>
                              <td className="px-3 py-3 text-slate-500">-</td>
                              <td className="px-3 py-3 text-right text-slate-500">-</td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={saveEditTc} className="text-[#0b0c16] p-1.5 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors" title="Guardar">
                                    <CheckIcon size={14} />
                                  </button>
                                  <button onClick={() => setEditingTcId(null)} className="text-rose-400 p-1.5 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors border border-rose-500/30" title="Cancelar">
                                    <XIcon size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={tc.id} className={`transition-colors ${isPaid ? "bg-emerald-900/10 opacity-60" : "hover:bg-white/[0.02]"}`}>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => isPaid ? deshacerPagoTC(tc) : registrarPagoTC(tc)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center border-2 mx-auto transition-all ${
                                  isPaid
                                    ? "bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer hover:bg-rose-500 hover:border-rose-500"
                                    : "bg-[#111222] border-slate-600 text-transparent hover:border-indigo-500 cursor-pointer"
                                }`}
                              >
                                {isPaid && <CheckIcon size={14} />}
                              </button>
                            </td>

                            <td className={`px-5 py-3 font-bold tracking-wide ${isPaid ? "line-through text-emerald-500/70" : "text-white"}`}>
                              {tc.name}
                              {datosPago.pagos.length > 1 && (
                                <span className="block text-[9px] text-emerald-400 font-black uppercase tracking-widest no-underline mt-1">
                                  ({datosPago.pagos.length} pagos sumados)
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3 text-center text-[#8A92A6] font-black">
                              {tc.diaPago || 1}
                            </td>

                            <td className="px-5 py-3 text-right font-black text-rose-400 tabular-nums">
                              {formatCOP(tc.currentDebt)}
                            </td>

                            <td className="px-5 py-3">
                              {!isPaid ? (
                                <select
                                  value={tcState[tc.id]?.cuentaId || ""}
                                  onChange={(e) => handleTcChange(tc.id, "cuentaId", e.target.value)}
                                  className="w-full bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-indigo-500 cursor-pointer"
                                >
                                  <option value="">Seleccione cuenta...</option>
                                  {cuentasActivas.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-black">Monto pagado</span>
                              )}
                            </td>

                            <td className="px-5 py-3 text-right">
                              {!isPaid ? (
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={tcState[tc.id]?.monto || ""}
                                  onChange={(e) => handleTcChange(tc.id, "monto", e.target.value)}
                                  className="w-24 bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-black outline-none text-right shadow-neumorph-inset focus:border-emerald-500 ml-auto"
                                />
                              ) : (
                                <span className="font-black text-emerald-500 tabular-nums">{formatCOP(datosPago.monto)}</span>
                              )}
                            </td>

                            <td className="px-5 py-3 text-center">
                              {!isPaid ? (
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => startEditTc(tc)} className="text-[#8A92A6] hover:text-indigo-400 transition-colors" title="Editar tarjeta">
                                    <Edit3Icon size={16} />
                                  </button>
                                  <button onClick={() => handleDeleteTc(tc)} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Ocultar tarjeta">
                                    <Trash2Icon size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-black">Listo</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}

                    {tarjetasCreditoVisibles.length > 0 && (
                      <tr className="bg-[#0b0c16]/50 border-t border-white/[0.05]">
                        <td colSpan="3" className="px-5 py-4 text-[10px] font-black text-[#8A92A6] uppercase tracking-widest text-right">
                          Totales tarjetas
                        </td>
                        <td className="px-5 py-4 text-right font-black text-rose-400 tabular-nums">{formatCOP(tcTotalDeuda)}</td>
                        <td className="px-5 py-4 text-right text-[#8A92A6] text-[10px] font-bold uppercase tracking-widest">A pagar:</td>
                        <td className="px-5 py-4 text-right font-black text-emerald-400 tabular-nums">{formatCOP(tcTotalPagar)}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* CHECKLIST PAGOS FIJOS */}
        <div className="bg-appcard shadow-neumorph rounded-[30px] border border-white/[0.02] p-5 md:p-8">
          <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => toggleSection("fijos")}>
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs">3</span>
              Pagos Fijos
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest">
                {pagosFijosVisibles.filter(pf => !!getPagoRealizado(pf)).length} / {pagosFijosVisibles.length} listos
              </span>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openSections.fijos ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {openSections.fijos && (
            <div className="mt-8 space-y-8 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-end sm:items-end mb-4 gap-3">
                {hiddenPFs.length > 0 && (
                  <select
                    onChange={(e) => restorePF(e.target.value)}
                    className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-full sm:w-max shadow-neumorph"
                  >
                    <option value="">+ Restaurar pago fijo...</option>
                    {hiddenPFs.map(pf => (
                      <option key={pf.id} value={pf.id}>{pf.descripcion}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="overflow-x-auto bg-[#111222] shadow-neumorph-inset rounded-2xl border border-transparent">
                <table className="w-full text-sm text-left min-w-[950px]">
                  <thead className="text-[10px] font-black text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/50 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-5 py-4 text-center">Estado</th>
                      <th className="px-5 py-4">Nombre</th>
                      <th className="px-5 py-4">Categoría</th>
                      <th className="px-5 py-4">Gasto específico</th>
                      <th className="px-5 py-4 text-center">Día</th>
                      <th className="px-5 py-4">Pagar desde</th>
                      <th className="px-5 py-4 text-right">Monto</th>
                      <th className="px-5 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.02]">
                    <tr className="bg-amber-500/5 border-b-2 border-amber-500/20">
                      <td className="px-3 py-3 text-center">
                        <PlusIcon size={16} className="text-amber-500 mx-auto" />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={nuevoPf.descripcion}
                          onChange={e => setNuevoPf({ ...nuevoPf, descripcion: e.target.value })}
                          className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500"
                          placeholder="Nuevo pago fijo..."
                        />
                      </td>

                      <td className="px-3 py-3">
                        <select
                          value={nuevoPf.categoria}
                          onChange={e => setNuevoPf({ ...nuevoPf, categoria: e.target.value, gastoEspecifico: "" })}
                          className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer"
                        >
                          {getCategoriaOptions().map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3">
                        <select
                          value={nuevoPf.gastoEspecifico}
                          onChange={e => {
                            const gasto = e.target.value;
                            setNuevoPf({
                              ...nuevoPf,
                              gastoEspecifico: gasto,
                              descripcion: nuevoPf.descripcion || gasto
                            });
                          }}
                          className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer"
                        >
                          <option value="">Detalle...</option>
                          {(CATEGORIAS_CONFIG[nuevoPf.categoria] || []).map(opt => (
                            <option key={opt.específico} value={opt.específico}>{opt.específico}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={nuevoPf.diaPago}
                          onChange={e => setNuevoPf({ ...nuevoPf, diaPago: e.target.value })}
                          className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-amber-500"
                        />
                      </td>

                      <td className="px-3 py-3 text-center text-slate-500">-</td>

                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={nuevoPf.monto}
                          onChange={e => setNuevoPf({ ...nuevoPf, monto: e.target.value })}
                          className="w-full bg-[#111222] border border-amber-500/30 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-amber-500"
                          placeholder="Monto"
                        />
                      </td>

                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={handleCreateNuevoPf}
                          className="text-[#0b0c16] px-3 py-1.5 bg-amber-400 rounded hover:bg-amber-300 transition-colors text-[10px] font-black uppercase tracking-widest w-full"
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>

                    {pagosFijosVisibles.map(pf => {
                      const egresoRealizado = getPagoRealizado(pf);
                      const isPaid = !!egresoRealizado;
                      const isEditingBase = editingPfId === pf.id;

                      if (isEditingBase) {
                        return (
                          <tr key={pf.id} className="bg-amber-900/10">
                            <td className="px-3 py-3 text-center">-</td>

                            <td className="px-3 py-3">
                              <input
                                type="text"
                                value={pfEditData.descripcion}
                                onChange={e => setPfEditData({ ...pfEditData, descripcion: e.target.value })}
                                className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500"
                              />
                            </td>

                            <td className="px-3 py-3">
                              <select
                                value={pfEditData.categoria}
                                onChange={e => setPfEditData({ ...pfEditData, categoria: e.target.value, gastoEspecifico: "" })}
                                className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer"
                              >
                                {getCategoriaOptions().map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-3 py-3">
                              <select
                                value={pfEditData.gastoEspecifico}
                                onChange={e => setPfEditData({ ...pfEditData, gastoEspecifico: e.target.value })}
                                className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer"
                              >
                                <option value="">Detalle...</option>
                                {(CATEGORIAS_CONFIG[pfEditData.categoria] || []).map(opt => (
                                  <option key={opt.específico} value={opt.específico}>{opt.específico}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={pfEditData.diaPago}
                                onChange={e => setPfEditData({ ...pfEditData, diaPago: e.target.value })}
                                className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center shadow-neumorph-inset focus:border-amber-500"
                              />
                            </td>

                            <td className="px-3 py-3 text-center text-slate-500">-</td>

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={pfEditData.monto}
                                onChange={e => setPfEditData({ ...pfEditData, monto: e.target.value })}
                                className="w-full bg-[#111222] border border-amber-500/50 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold outline-none text-right shadow-neumorph-inset focus:border-amber-500"
                              />
                            </td>

                            <td className="px-3 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEditPf} className="text-[#0b0c16] p-1.5 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors">
                                  <CheckIcon size={14} />
                                </button>
                                <button onClick={() => setEditingPfId(null)} className="text-rose-400 p-1.5 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors border border-rose-500/30">
                                  <XIcon size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={pf.id} className={`transition-colors ${isPaid ? "bg-emerald-900/10 opacity-60" : "hover:bg-white/[0.02]"}`}>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => isPaid ? deshacerPagoFijo(pf) : registrarPagoFijo(pf)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 mx-auto transition-all ${
                                isPaid
                                  ? "bg-emerald-500 border-emerald-500 text-[#0b0c16] shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer hover:bg-rose-500 hover:border-rose-500"
                                  : "bg-[#111222] border-slate-600 text-transparent hover:border-amber-500 cursor-pointer"
                              }`}
                            >
                              {isPaid && <CheckIcon size={14} />}
                            </button>
                          </td>

                          <td className={`px-5 py-3 font-bold tracking-wide ${isPaid ? "line-through text-emerald-500/70" : "text-white"}`}>
                            {pf.descripcion}
                          </td>

                          <td className="px-5 py-3 text-xs text-[#8A92A6] font-bold uppercase tracking-wider">
                            {pf.categoria}
                          </td>

                          <td className="px-5 py-3 text-xs text-neoncyan font-bold">
                            {pf.gastoEspecifico || pf.descripcion}
                          </td>

                          <td className="px-5 py-3 text-center text-[#8A92A6] font-black">
                            {pf.diaPago || 1}
                          </td>

                          <td className="px-5 py-3">
                            {!isPaid ? (
                              <select
                                value={getPfCuenta(pf)}
                                onChange={(e) => handlePfChange(pf.id, "cuentaId", e.target.value)}
                                className="w-full bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-white outline-none shadow-neumorph-inset focus:border-amber-500 cursor-pointer"
                              >
                                <option value="">Seleccione cuenta...</option>
                                {cuentasActivas.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                {getCuentaName(egresoRealizado.cuentaId)}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3 text-right">
                            {!isPaid ? (
                              <input
                                type="number"
                                placeholder={pf.monto}
                                value={pfState[pf.id]?.monto !== undefined ? pfState[pf.id].monto : pf.monto}
                                onChange={(e) => handlePfChange(pf.id, "monto", e.target.value)}
                                className="w-24 bg-[#0b0c16] border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs text-amber-400 font-black outline-none text-right shadow-neumorph-inset focus:border-amber-500 ml-auto"
                              />
                            ) : (
                              <span className="font-black text-emerald-500 tabular-nums">{formatCOP(egresoRealizado.monto)}</span>
                            )}
                          </td>

                          <td className="px-5 py-3 text-center">
                            {!isPaid ? (
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => startEditPf(pf)} className="text-[#8A92A6] hover:text-amber-400 transition-colors" title="Editar base">
                                  <Edit3Icon size={16} />
                                </button>
                                <button onClick={() => handleDeletePf(pf)} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Ocultar / eliminar">
                                  <Trash2Icon size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-black">Listo</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {pagosFijosVisibles.length > 0 && (
                      <tr className="bg-[#0b0c16]/50 border-t border-white/[0.05]">
                        <td colSpan="5" className="px-5 py-4 text-[10px] font-black text-[#8A92A6] uppercase tracking-widest text-right">
                          Totales pagos fijos
                        </td>
                        <td className="px-5 py-4 text-right font-black text-slate-400 tabular-nums">{formatCOP(pfTotalBase)}</td>
                        <td className="px-5 py-4 text-right font-black text-amber-400 tabular-nums">{formatCOP(pfTotalPagar)}</td>
                        <td></td>
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
          <div className="flex justify-between items-center cursor-pointer select-none mb-4" onClick={() => toggleSection("historial")}>
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                <ListIcon size={14} />
              </span>
              4. Historial Completo de Egresos
            </h2>

            <div className="flex items-center gap-3">
              <span className="bg-[#111222] shadow-neumorph-inset text-[#8A92A6] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                {egresosFiltrados.length} movimientos
              </span>
              <button className="text-slate-500 hover:text-white transition-colors">
                {openSections.historial ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>

          {openSections.historial && (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.03] bg-[#111222] shadow-neumorph-inset animate-in slide-in-from-top-4 fade-in duration-300">
              <table className="w-full text-sm text-left min-w-[1050px]">
                <thead className="text-[10px] text-[#8A92A6] uppercase tracking-widest bg-[#0b0c16]/60 border-b border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Descripción / Detalle</th>
                    <th className="px-5 py-4">Fijo / Var</th>
                    <th className="px-5 py-4">Categoría / Sub</th>
                    <th className="px-5 py-4">Cuenta</th>
                    <th className="px-5 py-4 text-right">Monto</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>

                  <tr className="bg-[#111222] border-b border-white/[0.05]">
                    <th className="px-5 py-3 text-[#8A92A6]">—</th>

                    <th className="px-5 py-3">
                      <input
                        type="text"
                        value={filters.descripcion}
                        onChange={e => setFilters({ ...filters, descripcion: e.target.value })}
                        placeholder="Buscar descripción..."
                        className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                      />
                    </th>

                    <th className="px-5 py-3">
                      <select
                        value={filters.tipo}
                        onChange={e => setFilters({ ...filters, tipo: e.target.value })}
                        className="bg-transparent text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Ambos" className="bg-[#111222]">Ambos</option>
                        <option value="Fijo" className="bg-[#111222]">Fijo</option>
                        <option value="Variable" className="bg-[#111222]">Variable</option>
                      </select>
                    </th>

                    <th className="px-5 py-3">
                      <select
                        value={filters.categoria}
                        onChange={e => setFilters({ ...filters, categoria: e.target.value })}
                        className="bg-transparent text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#111222]">Categorías todas</option>
                        {getCategoriaOptions().map(c => (
                          <option key={c} value={c} className="bg-[#111222]">{c}</option>
                        ))}
                      </select>
                    </th>

                    <th className="px-5 py-3">
                      <select
                        value={filters.cuenta}
                        onChange={e => setFilters({ ...filters, cuenta: e.target.value })}
                        className="bg-transparent text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#111222]">Cuentas todas</option>
                        {cuentasSafe.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#111222]">{c.name}</option>
                        ))}
                      </select>
                    </th>

                    <th className="px-5 py-3 text-right text-[#8A92A6]">—</th>

                    <th className="px-5 py-3 text-center">
                      <button
                        onClick={limpiarFiltros}
                        className="bg-neonmagenta/10 hover:bg-neonmagenta/20 border border-neonmagenta/20 text-neonmagenta px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Limpiar
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.02]">
                  {egresosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-[#8A92A6] font-bold">
                        No hay egresos que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    egresosFiltrados.map(egreso => {
                      const isEditing = editingId === egreso.id;
                      const opcionesEdit = CATEGORIAS_CONFIG[editData.categoria] || [];

                      if (isEditing) {
                        return (
                          <tr key={egreso.id} className="bg-neoncyan/5">
                            <td className="px-5 py-4">
                              <input
                                type="date"
                                value={editData.fecha || ""}
                                onChange={e => setEditData({ ...editData, fecha: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-2 text-xs outline-none text-white"
                              />
                            </td>

                            <td className="px-5 py-4">
                              <div className="space-y-2">
                                <select
                                  value={editData.gastoEspecifico || ""}
                                  onChange={e => {
                                    const nuevoGasto = e.target.value;
                                    const descripcionLimpia = toText(editData.descripcionOpcional).trim();

                                    setEditData({
                                      ...editData,
                                      gastoEspecifico: nuevoGasto,
                                      descripcion: descripcionLimpia || nuevoGasto
                                    });
                                  }}
                                  className="w-full bg-[#111222] rounded px-2 py-2 text-xs outline-none text-white appearance-none cursor-pointer"
                                >
                                  <option value="">Seleccione detalle...</option>
                                  {opcionesEdit.map(opt => (
                                    <option key={opt.específico} value={opt.específico}>
                                      {opt.específico}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  value={editData.descripcionOpcional || ""}
                                  onChange={e => {
                                    const texto = e.target.value;
                                    setEditData({
                                      ...editData,
                                      descripcionOpcional: texto,
                                      descripcion: texto.trim() || editData.gastoEspecifico || ""
                                    });
                                  }}
                                  placeholder="Descripción opcional..."
                                  className="w-full bg-[#111222] rounded px-2 py-2 text-xs outline-none text-white placeholder:text-slate-600"
                                />
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <select
                                value={editData.tipo || "Variable"}
                                onChange={e => setEditData({ ...editData, tipo: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-2 text-xs outline-none text-white"
                              >
                                <option value="Variable">Variable</option>
                                <option value="Fijo">Fijo</option>
                              </select>
                            </td>

                            <td className="px-5 py-4">
                              <div className="space-y-2">
                                <select
                                  value={editData.categoria || ""}
                                  onChange={e => {
                                    setEditData({
                                      ...editData,
                                      categoria: e.target.value,
                                      gastoEspecifico: "",
                                      descripcionOpcional: "",
                                      descripcion: ""
                                    });
                                  }}
                                  className="w-full bg-[#111222] rounded px-2 py-2 text-xs outline-none text-white"
                                >
                                  <option value="">Categoría...</option>
                                  {getCategoriaOptions().map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>

                                <div className="text-[10px] text-neoncyan font-black uppercase tracking-widest">
                                  {editData.gastoEspecifico ? getSubcategoria(editData.categoria, editData.gastoEspecifico) : "---"}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <select
                                value={editData.cuentaId || ""}
                                onChange={e => setEditData({ ...editData, cuentaId: e.target.value })}
                                className="w-full bg-[#111222] rounded px-2 py-2 text-xs outline-none text-white"
                              >
                                <option value="">Cuenta...</option>
                                {cuentasSafe.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <input
                                type="number"
                                value={editData.monto || ""}
                                onChange={e => setEditData({ ...editData, monto: e.target.value })}
                                className="w-28 bg-[#111222] rounded px-2 py-2 text-xs outline-none text-neonmagenta font-black text-right"
                              />
                            </td>

                            <td className="px-5 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEdit} className="bg-emerald-400 text-[#0b0c16] p-2 rounded-lg hover:bg-emerald-300 transition-colors" title="Guardar">
                                  <CheckIcon size={14} />
                                </button>

                                <button onClick={() => setEditingId(null)} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2 rounded-lg hover:bg-rose-500/20 transition-colors" title="Cancelar">
                                  <XIcon size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={egreso.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 font-black text-[#8A92A6] text-xs">
                            {egreso.fecha || "Sin fecha"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-[260px]">
                              <span className="truncate block text-white font-black">
                                {egreso.descripcion || "Sin descripción"}
                              </span>

                              {egreso.gastoEspecifico && egreso.gastoEspecifico !== egreso.descripcion && (
                                <span className="text-[9px] font-black text-[#8A92A6] mt-1 block uppercase tracking-widest">
                                  Tipo: {egreso.gastoEspecifico}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              egreso.tipo === "Fijo"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-neoncyan/10 text-neoncyan"
                            }`}>
                              {egreso.tipo || "Variable"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <span className="px-3 py-1 rounded-lg border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-slate-300">
                                {egreso.categoria || "Sin categoría"}
                              </span>

                              <span className="block text-[9px] text-[#8A92A6] mt-2 uppercase tracking-widest font-black">
                                ↳ {egreso.subcategoria || "Otros"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-[#8A92A6] font-black uppercase tracking-widest">
                            {getCuentaName(egreso.cuentaId)}
                          </td>

                          <td className="px-5 py-4 text-right text-neonmagenta font-black text-base tabular-nums">
                            {formatCOP(egreso.monto)}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button onClick={() => startEditing(egreso)} className="text-[#8A92A6] hover:text-neoncyan transition-colors" title="Editar">
                                <Edit3Icon size={16} />
                              </button>

                              <button onClick={() => handleDelete(egreso.id)} className="text-[#8A92A6] hover:text-neonmagenta transition-colors" title="Eliminar">
                                <Trash2Icon size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  window.EgresosTab = EgresosTab;
})();
