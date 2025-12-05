document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES ---
    const asignaturas = document.querySelectorAll('.asignatura');
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    const totalSCT = 300; 

    // --- INICIO ---
    cargarProgreso();
    actualizarEstadoBloqueos();
    actualizarProgreso();

    // --- EVENTOS CLICK ---
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            if (asignatura.classList.contains('bloqueada')) return;

            asignatura.classList.toggle('aprobada');
            
            guardarProgreso();
            actualizarEstadoBloqueos();
            actualizarProgreso();
        });
    });

    // --- LÓGICA DE REQUISITOS (SOLUCIÓN MANUAL SEGURA) ---
    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            // Si no tiene requisitos, lo dejamos libre
            if (!requisitos) {
                asignatura.classList.remove('bloqueada');
                return;
            }

            // Convertimos la lista larga de IDs en un array
            const listaRequisitos = requisitos.split(',');
            let cumpleTodo = true;

            listaRequisitos.forEach(reqID => {
                const idLimpio = reqID.trim();
                const ramoRequerido = document.getElementById(idLimpio);

                // Si el ramo requerido NO existe o NO está aprobado, fallamos
                if (!ramoRequerido || !ramoRequerido.classList.contains('aprobada')) {
                    cumpleTodo = false;
                }
            });

            // Aplicar el candado
            if (!cumpleTodo) {
                asignatura.classList.add('bloqueada');
                asignatura.classList.remove('aprobada'); 
            } else {
                asignatura.classList.remove('bloqueada');
            }
        });
    }

    // --- MEMORIA ---
    function guardarProgreso() {
        const listaIDs = [];
        document.querySelectorAll('.asignatura.aprobada').forEach(elemento => {
            if (elemento.id) listaIDs.push(elemento.id);
        });
        localStorage.setItem('malla_ara_manual', JSON.stringify(listaIDs));
    }

    function cargarProgreso() {
        const datosGuardados = localStorage.getItem('malla_ara_manual');
        if (datosGuardados) {
            JSON.parse(datosGuardados).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.classList.add('aprobada');
            });
        }
    }

    // --- ESTADÍSTICAS ---
    function actualizarProgreso() {
        let sctAprobados = 0;
        const aprobadas = document.querySelectorAll('.asignatura.aprobada');
        
        aprobadas.forEach(asig => {
            const val = parseInt(asig.getAttribute('data-sct'));
            if (!isNaN(val)) sctAprobados += val;
        });
        
        if(contadorSCT) contadorSCT.innerText = sctAprobados;
        const pctSCT = (sctAprobados / totalSCT) * 100;
        if(barraSCT) barraSCT.style.width = pctSCT + "%";

        const totalRamos = asignaturas.length;
        const numAprobados = aprobadas.length;
        const pctMalla = totalRamos > 0 ? (numAprobados / totalRamos) * 100 : 0;

        if(contadorPorcentaje) contadorPorcentaje.innerText = pctMalla.toFixed(1) + "%";
        if(ramosAprobadosTexto) ramosAprobadosTexto.innerText = numAprobados;
        if(barraMalla) barraMalla.style.width = pctMalla + "%";
    }
});
