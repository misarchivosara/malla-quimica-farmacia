document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES ---
    const asignaturas = document.querySelectorAll('.asignatura');
    const semestres = document.querySelectorAll('.semestre'); // Para leer niveles
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    const totalSCT = 300; 

    // --- INICIALIZACIÓN ---
    cargarProgreso();            // 1. Recuperar memoria
    actualizarEstadoBloqueos();  // 2. Revisar candados
    actualizarProgreso();        // 3. Calcular barras

    // --- EVENTOS CLICK ---
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            if (asignatura.classList.contains('bloqueada')) return;

            asignatura.classList.toggle('aprobada');
            
            // Guardar y Actualizar todo
            guardarProgreso();
            actualizarEstadoBloqueos();
            actualizarProgreso();
        });
    });

    // --- MEMORIA (LocalStorage) ---
    function guardarProgreso() {
        const listaIDs = [];
        document.querySelectorAll('.asignatura.aprobada').forEach(elemento => {
            if (elemento.id) listaIDs.push(elemento.id);
        });
        localStorage.setItem('malla_ara_final', JSON.stringify(listaIDs));
    }

    function cargarProgreso() {
        const datosGuardados = localStorage.getItem('malla_ara_final');
        if (datosGuardados) {
            JSON.parse(datosGuardados).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.classList.add('aprobada');
            });
        }
    }

    // --- LÓGICA DE REQUISITOS ---
    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            if (requisitos) {
                const listaRequisitos = requisitos.split(',');
                let requisitosCumplidos = true;

                listaRequisitos.forEach(reqID => {
                    const idLimpio = reqID.trim();

                    // CASO ESPECIAL: "NIVEL_X"
                    if (idLimpio.startsWith('NIVEL_')) {
                        const numeroNivel = parseInt(idLimpio.split('_')[1]); 
                        if (!verificarNivelCompleto(numeroNivel)) {
                            requisitosCumplidos = false;
                        }
                    } 
                    // CASO NORMAL: ID DE RAMO
                    else {
                        const asignaturaRequisito = document.getElementById(idLimpio);
                        if (!asignaturaRequisito || !asignaturaRequisito.classList.contains('aprobada')) {
                            requisitosCumplidos = false;
                        }
                    }
                });

                if (!requisitosCumplidos) {
                    asignatura.classList.add('bloqueada');
                    asignatura.classList.remove('aprobada');
                } else {
                    asignatura.classList.remove('bloqueada');
                }
            }
        });
    }

    // --- VERIFICADOR DE NIVELES ---
    function verificarNivelCompleto(numeroNivel) {
        // Nivel 1 = índice 0
        const indice = numeroNivel - 1; 
        
        if (semestres[indice]) {
            const ramosDelSemestre = semestres[indice].querySelectorAll('.asignatura');
            let todoAprobado = true;
            
            ramosDelSemestre.forEach(ramo => {
                if (!ramo.classList.contains('aprobada')) {
                    todoAprobado = false;
                }
            });
            return todoAprobado;
        }
        return false;
    }

    // --- ESTADÍSTICAS ---
    function actualizarProgreso() {
        let sctAprobados = 0;
        const asignaturasAprobadas = document.querySelectorAll('.asignatura.aprobada');
        
        asignaturasAprobadas.forEach(asignatura => {
            const sct = parseInt(asignatura.getAttribute('data-sct'));
            if (!isNaN(sct)) sctAprobados += sct;
        });
        
        if(contadorSCT) animateValue(contadorSCT, parseInt(contadorSCT.innerText), sctAprobados, 400);
        
        const porcentajeSCT = (sctAprobados / totalSCT) * 100;
        if(barraSCT) barraSCT.style.width = porcentajeSCT + "%";

        const totalRamos = asignaturas.length;
        const ramosAprobados = asignaturasAprobadas.length;
        const porcentajeMalla = totalRamos > 0 ? (ramosAprobados / totalRamos) * 100 : 0;

        if(contadorPorcentaje) contadorPorcentaje.innerText = porcentajeMalla.toFixed(1) + "%";
        if(ramosAprobadosTexto) ramosAprobadosTexto.innerText = ramosAprobados;
        if(barraMalla) barraMalla.style.width = porcentajeMalla + "%";
    }

    function animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
