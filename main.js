document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initApp();
});

// ==========================================
// 1. BASES DE DATOS SIMULADAS
// ==========================================
const dbPagosFijos = [
    { id: 1, nombre: "Natación niños", subtitulo: "Tobías y Salomé", monto: 250000, estado: "pendiente" },
    { id: 2, nombre: "Celular Andrea", subtitulo: "Andre", monto: 75000, estado: "pendiente" },
    { id: 3, nombre: "HBO Max", subtitulo: "Hogar", monto: 15000, estado: "pendiente" },
    { id: 4, nombre: "Aqualia", subtitulo: "Servicios públicos", monto: 30000, estado: "pendiente" },
    { id: 5, nombre: "Arriendo", subtitulo: "Pagado con Bancolombia Leo", monto: 500000, estado: "pagado" },
    { id: 6, nombre: "Seguro de vida Leo", subtitulo: "Pagado con Bancolombia Leo", monto: 45000, estado: "pagado" }
];

const dbEgresos = [
    { id: 1, fecha: "2026-04-15", descripcion: "Pago aduanero Andre skincare", tipo: "Variable", categoria: "Andre", cuenta: "Nu Bank Leo", monto: 23312 },
    { id: 2, fecha: "2026-04-15", descripcion: "Supermercado único", tipo: "Variable", categoria: "Mercado", cuenta: "Nu Bank Leo", monto: 82614 },
    { id: 3, fecha: "2026-04-14", descripcion: "Aseo sra Alba", tipo: "Variable", categoria: "Aseo hogar", cuenta: "Bancolombia Leo", monto: 100000, int: 18000 },
    { id: 4, fecha: "2026-04-12", descripcion: "Arriendo", tipo: "Fijo", categoria: "Hogar", cuenta: "Bancolombia Leo", monto: 500000 },
    { id: 5, fecha: "2026-04-12", descripcion: "Donación Vaki", tipo: "Variable", categoria: "Leo", cuenta: "Bancolombia Leo", monto: 20400 },
    { id: 6, fecha: "2026-04-12", descripcion: "Donación", tipo: "Variable", categoria: "Leo", cuenta: "Efectivo Leo", monto: 3000 },
    { id: 7, fecha: "2026-04-08", descripcion: "Andre skincare", tipo: "Variable", categoria: "Andre", cuenta: "Banco de Bogotá Andre", monto: 232500 }
];

// ==========================================
// 2. ESTADOS DE LA UI
// ==========================================
let estadoFiltro = {
    tipo: 'Todos',
    categoria: 'Todas'
};

// Por defecto, ordenado por fecha de más reciente a más antigua
let estadoOrden = {
    columna: 'fecha',
    direccion: 'desc' 
};

// Formateador de moneda colombiana
const formatCOP = (numero) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(numero);
};

// ==========================================
// 3. RENDERIZADO: PAGOS FIJOS (COMPACTO)
// ==========================================
function renderPagosFijos() {
    const contenedor = document.getElementById('grid-pagos-fijos');
    
    contenedor.innerHTML = dbPagosFijos.map(pago => {
        const esPagado = pago.estado === 'pagado';
        
        // Clases dinámicas dependiendo de si está pagado o no
        const cardClasses = esPagado 
            ? "border-slate-800 bg-slate-900/30 opacity-60" 
            : "border-slate-700 bg-slate-900 shadow-lg";

        return `
            <div class="border rounded-lg p-3 flex flex-col justify-between ${cardClasses}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="text-sm font-bold text-white leading-tight ${esPagado ? 'line-through decoration-slate-500' : ''}">${pago.nombre}</h3>
                        <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">${pago.subtitulo}</p>
                    </div>
                    <span class="text-sm font-bold text-amber-500 shrink-0 ml-2">${formatCOP(pago.monto)}</span>
                </div>
                
                ${!esPagado ? `
                    <div class="flex items-center gap-2 mt-2">
                        <select class="w-full bg-slate-950 text-xs text-slate-300 p-1.5 rounded outline-none border border-slate-700 focus:border-indigo-500">
                            <option>Selecciona...</option>
                            <option>Bancolombia Leo</option>
                            <option>Nu Bank Leo</option>
                        </select>
                        <button class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold transition">OK</button>
                    </div>
                ` : `
                    <div class="flex justify-end mt-2">
                        <div class="w-6 h-6 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                            <i data-lucide="check" class="w-3 h-3"></i>
                        </div>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

// ==========================================
// 4. LÓGICA DE LA TABLA (FILTROS Y ORDEN)
// ==========================================
function procesarYRenderizarTabla() {
    // 1. Filtrar los datos
    let datosFiltrados = dbEgresos.filter(egreso => {
        const pasaFiltroTipo = (estadoFiltro.tipo === 'Todos') || (egreso.tipo === estadoFiltro.tipo);
        const pasaFiltroCategoria = (estadoFiltro.categoria === 'Todas') || (egreso.categoria === estadoFiltro.categoria);
        return pasaFiltroTipo && pasaFiltroCategoria;
    });

    // 2. Ordenar los datos
    datosFiltrados.sort((a, b) => {
        let valorA = a[estadoOrden.columna];
        let valorB = b[estadoOrden.columna];

        // Manejo de strings (nombres, fechas) y números (montos)
        if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
        }

        if (valorA < valorB) return estadoOrden.direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return estadoOrden.direccion === 'asc' ? 1 : -1;
        return 0;
    });

    // 3. Pintar la tabla
    renderFilasEgresos(datosFiltrados);
    
    // 4. Actualizar estado visual de los iconos de cabecera
    actualizarIconosOrden();
    actualizarIndicadorFiltro();
    lucide.createIcons();
}

function renderFilasEgresos(datos) {
    const tbody = document.getElementById('body-egresos');
    
    if (datos.length === 0) {
        tbody.innerHTML = `<div class="p-8 text-center text-slate-500 text-sm">No se encontraron registros con estos filtros.</div>`;
        return;
    }

    tbody.innerHTML = datos.map(egreso => `
        <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/40 transition-colors border-l-2 border-transparent hover:border-indigo-500">
            <div class="col-span-2 text-[11px] font-medium text-slate-400">${egreso.fecha}</div>
            
            <div class="col-span-3 text-sm font-bold text-white truncate pr-4" title="${egreso.descripcion}">${egreso.descripcion}</div>
            
            <div class="col-span-2 flex items-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${egreso.tipo === 'Fijo' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">
                    ${egreso.tipo}
                </span>
            </div>
            
            <div class="col-span-3 flex flex-col justify-center">
                <div class="inline-flex max-w-max px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-300 mb-1">${egreso.categoria}</div>
                <div class="text-[9px] text-indigo-400 font-medium">Pagado con: ${egreso.cuenta}</div>
            </div>
            
            <div class="col-span-2 text-right">
                <div class="text-sm font-black text-red-400">${formatCOP(egreso.monto)}</div>
                ${egreso.int ? `<div class="text-[10px] font-bold text-amber-500 mt-0.5">Int: ${formatCOP(egreso.int)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// 5. INTERACTIVIDAD DE ENCABEZADOS
// ==========================================

// Alterna la visualización del menú dropdown (Filtros)
window.toggleDropdown = function(idMenu) {
    // Cierra todos los demás menús primero
    document.querySelectorAll('[id^="menu-"]').forEach(menu => {
        if(menu.id !== idMenu) menu.classList.add('hidden');
    });
    const menu = document.getElementById(idMenu);
    menu.classList.toggle('hidden');
}

// Aplica el ordenamiento al hacer clic en un título
window.ordenarTabla = function(columna) {
    if (estadoOrden.columna === columna) {
        // Si es la misma columna, invierte la dirección
        estadoOrden.direccion = estadoOrden.direccion === 'asc' ? 'desc' : 'asc';
    } else {
        // Si es una columna nueva, por defecto ordena descendente
        estadoOrden.columna = columna;
        estadoOrden.direccion = 'desc';
    }
    procesarYRenderizarTabla();
}

// Aplica el filtro desde los dropdowns
window.aplicarFiltro = function(tipoFiltro, valor) {
    estadoFiltro[tipoFiltro] = valor;
    // Ocultar menús después de hacer clic
    document.querySelectorAll('[id^="menu-"]').forEach(menu => menu.classList.add('hidden'));
    procesarYRenderizarTabla();
}

// Cierra los dropdowns si haces clic fuera de ellos
document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
        document.querySelectorAll('[id^="menu-"]').forEach(menu => menu.classList.add('hidden'));
    }
});

window.limpiarFiltros = function() {
    estadoFiltro = { tipo: 'Todos', categoria: 'Todas' };
    procesarYRenderizarTabla();
}

// ==========================================
// 6. FUNCIONES DE APOYO VISUAL
// ==========================================
function actualizarIconosOrden() {
    // Reinicia todos los iconos a su estado por defecto
    const columnas = ['fecha', 'descripcion', 'tipo', 'categoria', 'monto'];
    columnas.forEach(col => {
        const iconElement = document.getElementById(`icon-sort-${col}`);
        if(iconElement) {
            // Regresa a chevrons-up-down y baja opacidad
            iconElement.setAttribute('data-lucide', 'chevrons-up-down');
            iconElement.classList.remove('text-indigo-400', 'opacity-100');
            iconElement.classList.add('opacity-30');
        }
    });

    // Activa el icono de la columna actual
    const activeIcon = document.getElementById(`icon-sort-${estadoOrden.columna}`);
    if (activeIcon) {
        const icono = estadoOrden.direccion === 'asc' ? 'arrow-up' : 'arrow-down';
        activeIcon.setAttribute('data-lucide', icono);
        activeIcon.classList.remove('opacity-30');
        activeIcon.classList.add('text-indigo-400', 'opacity-100');
    }
}

function actualizarIndicadorFiltro() {
    const indicador = document.getElementById('indicador-filtro');
    if (estadoFiltro.tipo !== 'Todos' || estadoFiltro.categoria !== 'Todas') {
        indicador.classList.remove('hidden');
        indicador.classList.add('flex');
    } else {
        indicador.classList.add('hidden');
        indicador.classList.remove('flex');
    }
}

function poblarFiltroCategorias() {
    // Extraer categorías únicas de la base de datos
    const categorias = [...new Set(dbEgresos.map(e => e.categoria))].sort();
    const menuCat = document.getElementById('menu-categoria');
    
    let htmlOpciones = `<button onclick="aplicarFiltro('categoria', 'Todas')" class="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 rounded text-white font-medium mb-1 border-b border-slate-700">Todas</button>`;
    
    categorias.forEach(cat => {
        htmlOpciones += `<button onclick="aplicarFiltro('categoria', '${cat}')" class="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 rounded text-white font-medium mb-1">${cat}</button>`;
    });
    
    menuCat.innerHTML = htmlOpciones;
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
function initApp() {
    renderPagosFijos();
    poblarFiltroCategorias();
    procesarYRenderizarTabla(); // Esto pinta la tabla la primera vez
}