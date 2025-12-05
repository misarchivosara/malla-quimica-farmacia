document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES ---
    const asignaturas = document.querySelectorAll('.asignatura');
    const semestres = document.querySelectorAll('.semestre'); 
    
    // Contadores visuales
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    const totalSCT = 300; 

    // --- INICIO ---
    // 1. Cargamos memoria
    cargarProgreso();
    
    // 2. Revisamos bloqueos INMEDIATAMENTE
    actualizarEstadoBloqueos();
    
    // 3. Calculamos barras
    actualizarProgreso();

    // --- EVENTOS CLICK ---
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            // Si está bloqueada, NO HACER NADA
            if (asignatura.classList.contains('bloqueada')) return;

            // Marcar / Desmarcar
            asignatura.classList.toggle('aprobada');
            
            // Guardar y Recalcular TODO
            guardarProgreso();
            actualizarEstadoBloqueos(); // <--- Aquí revisa si se abren los niveles
            actualizarProgreso();
        });
    });

    // --- LÓGICA DE REQUISITOS (EL CEREBRO) ---
    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            // Si no tiene requisitos, pasamos al siguiente
            if (!requisitos) {
                asignatura.classList.remove('bloqueada');
                return;
            }

            const listaRequisitos = requisitos.split(',');
            let cumpleTodo = true;

            listaRequisitos.forEach(req => {
                const idLimpio = req.trim();

                // CASO 1: REQUISITO DE NIVEL COMPLETO (Ej: "NIVEL_6")
                if (idLimpio.startsWith('NIVEL_')) {
                    const numeroNivel = parseInt(idLimpio.split('_')[1]);
                    // Si el nivel NO está completo, fallamos
                    if (!verificarNivelCompleto(numeroNivel)) {
                        cumpleTodo = false;
                    }
                } 
                // CASO 2: REQUISITO DE RAMO ESPECÍFICO (Ej: "DQUI1045")
                else {
                    const ramoReq = document.getElementById(idLimpio);
                    // Si el ramo no existe o no está aprobado, fallamos
                    if (!ramoReq || !ramoReq.classList.contains('aprobada')) {
                        cumpleTodo = false;
                    }
                }
            });

            // APLICAR RESULTADO
            if (!cumpleTodo) {
                asignatura.classList.add('bloqueada');
                asignatura.classList.remove('aprobada'); // Si se bloquea, se desmarca
            } else {
                asignatura.classList.remove('bloqueada');
            }
        });
    }

    // --- VERIFICADOR DE NIVELES (NUEVO Y MEJORADO) ---
    function verificarNivelCompleto(numeroNivel) {
        // En programación los arreglos empiezan en 0. 
        // Nivel 1 es el índice 0 del arreglo de semestres.
        const indiceSemestre = numeroNivel - 1;
        const semestreDiv = semestres[indiceSemestre];

        // Seguridad: Si el semestre no existe, devolvemos falso
        if (!semestreDiv) return false;

        // Buscamos TODOS los ramos dentro de ese semestre
        const ramosDelNivel = semestreDiv.querySelectorAll('.asignatura');
        
        let nivelEstaCompleto = true;

        // Revisamos uno por uno
        ramosDelNivel.forEach(ramo => {
            if (!ramo.classList.contains('aprobada')) {
                nivelEstaCompleto = false;
            }
        });

        return nivelEstaCompleto;
    }

    // --- MEMORIA (LocalStorage) ---
    function guardarProgreso() {
        const listaIDs = [];
        document.querySelectorAll('.asignatura.aprobada').forEach(elemento => {
            if (elemento.id) listaIDs.push(elemento.id);
        });
        localStorage.setItem('malla_ara_v3', JSON.stringify(listaIDs));
    }

    function cargarProgreso() {
        const datosGuardados = localStorage.getItem('malla_ara_v3');
        if (datosGuardados) {
            JSON.parse(datosGuardados).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.classList.add('aprobada');
            });
        }
    }

    // --- ESTADÍSTICAS VISUALES ---
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
