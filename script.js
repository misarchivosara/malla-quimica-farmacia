document.addEventListener('DOMContentLoaded', () => {
    // 1. Definimos las variables principales
    const asignaturas = document.querySelectorAll('.asignatura');
    const contadorSCT = document.getElementById('contador-sct');
    const barraSCT = document.getElementById('progreso-sct');
    const contadorPorcentaje = document.getElementById('contador-porcentaje');
    const barraMalla = document.getElementById('progreso-malla');
    const ramosAprobadosTexto = document.getElementById('ramos-aprobados');
    
    const totalSCT = 300; // Ajusta este número si tu malla tiene otro total

    // 2. ¡IMPORTANTE! Primero cargamos la memoria
    cargarProgreso();

    // 3. Calculamos todo lo demás
    actualizarEstadoBloqueos();
    actualizarProgreso();

    // 4. Asignamos los clicks
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            // Si tiene candado, no hacemos nada
            if (asignatura.classList.contains('bloqueada')) return;

            // Marcamos o desmarcamos
            asignatura.classList.toggle('aprobada');
            
            // GUARDAMOS INMEDIATAMENTE
            guardarProgreso();
            
            // Actualizamos visuales
            actualizarEstadoBloqueos();
            actualizarProgreso();
        });
    });

    // --- FUNCIONES DE MEMORIA (MAGIA) ---

    function guardarProgreso() {
        const listaIDs = [];
        const asignaturasAprobadas = document.querySelectorAll('.asignatura.aprobada');

        asignaturasAprobadas.forEach(elemento => {
            // Solo guardamos si tiene ID (Evita errores)
            if (elemento.id) {
                listaIDs.push(elemento.id);
            }
        });

        // Guardamos en la memoria del navegador
        localStorage.setItem('malla_ara_v1', JSON.stringify(listaIDs));
        console.log("Progreso guardado:", listaIDs); // Para verificar en consola
    }

    function cargarProgreso() {
        // Buscamos si hay algo guardado
        const datosGuardados = localStorage.getItem('malla_ara_v1');
        
        if (datosGuardados) {
            const listaIDs = JSON.parse(datosGuardados);
            
            // Recorremos la lista guardada y marcamos los ramos
            listaIDs.forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.classList.add('aprobada');
                }
            });
        }
    }

    // --- FUNCIONES DE LÓGICA ---

    function actualizarEstadoBloqueos() {
        asignaturas.forEach(asignatura => {
            const requisitos = asignatura.getAttribute('data-requisito');

            if (requisitos) {
                const listaRequisitos = requisitos.split(',');
                let requisitosCumplidos = true;

                listaRequisitos.forEach(reqID => {
                    const idLimpio = reqID.trim(); // Quitamos espacios extra
                    const asignaturaRequisito = document.getElementById(idLimpio);
                    
                    // Si el requisito no existe o no está aprobado
                    if (!asignaturaRequisito || !asignaturaRequisito.classList.contains('aprobada')) {
                        requisitosCumplidos = false;
                    }
                });

                if (!requisitosCumplidos) {
                    asignatura.classList.add('bloqueada');
                    asignatura.classList.remove('aprobada'); // Si se bloquea, se desmarca
                } else {
                    asignatura.classList.remove('bloqueada');
                }
            }
        });
    }

    function actualizarProgreso() {
        let sctAprobados = 0;
        const asignaturasAprobadas = document.querySelectorAll('.asignatura.aprobada');
        
        asignaturasAprobadas.forEach(asignatura => {
            // Verificamos que el data-sct exista para que no de error
            const sct = parseInt(asignatura.getAttribute('data-sct'));
            if (!isNaN(sct)) {
                sctAprobados += sct;
            }
        });
        
        // Animación y Barras
        if(contadorSCT) contadorSCT.innerText = sctAprobados;
        
        const porcentajeSCT = (sctAprobados / totalSCT) * 100;
        if(barraSCT) barraSCT.style.width = porcentajeSCT + "%";

        const totalRamos = asignaturas.length;
        const ramosAprobados = asignaturasAprobadas.length;
        const porcentajeMalla = totalRamos > 0 ? (ramosAprobados / totalRamos) * 100 : 0;

        if(contadorPorcentaje) contadorPorcentaje.innerText = porcentajeMalla.toFixed(1) + "%";
        if(ramosAprobadosTexto) ramosAprobadosTexto.innerText = ramosAprobados;
        if(barraMalla) barraMalla.style.width = porcentajeMalla + "%";
    }
});
