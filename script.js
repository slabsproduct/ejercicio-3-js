// ============================================
// SISTEMA VETERINARIO ROYAL PETS
// ============================================

// Lección 1: Introducción a JavaScript
let dueño = {
    nombre: "",
    telefono: "",
    email: "",
    fechaRegistro: ""
};

function registrarDueño() {
    const nombre = document.getElementById("nombreDueño").value.trim();
    const telefono = document.getElementById("telefonoDueño").value.trim();
    const email = document.getElementById("emailDueño").value.trim();
    
    if (nombre === "" || telefono === "" || email === "") {
        mostrarError("Por favor, completa todos los campos del dueño");
        return;
    }
    
    if (!email.includes("@") || !email.includes(".")) {
        mostrarError("Por favor, ingresa un email válido");
        return;
    }
    
    // Asignar valores al objeto dueño
    dueño.nombre = nombre;
    dueño.telefono = telefono;
    dueño.email = email;
    dueño.fechaRegistro = new Date().toLocaleDateString('es-CL');
    
    // Mostrar mensaje de bienvenida
    const mensajeDiv = document.getElementById("mensajeBienvenida");
    mensajeDiv.style.display = "block";
    mensajeDiv.innerHTML = `
        <h3>¡Registro exitoso! ✅</h3>
        <p><strong>Dueño registrado:</strong> ${dueño.nombre}</p>
        <p><strong>Teléfono:</strong> ${dueño.telefono}</p>
        <p><strong>Email:</strong> ${dueño.email}</p>
        <p><strong>Fecha de registro:</strong> ${dueño.fechaRegistro}</p>
        <p class="exito">Puedes continuar con el registro de la mascota</p>
    `;
    
    escribirConsola(`Dueño registrado: ${dueño.nombre}`);
    escribirConsola(`Contacto: ${dueño.telefono} | ${dueño.email}`);
    
    // Resaltar la siguiente sección
    document.getElementById("leccion2").classList.add("highlight");
    setTimeout(() => {
        document.getElementById("leccion2").classList.remove("highlight");
    }, 1500);
}

// Lección 2: Variables, operadores y condicionales
let mascota = {
    nombre: "",
    tipo: "",
    edad: 0,
    peso: 0,
    raza: "",
    fechaRegistro: ""
};

function registrarMascota() {
    if (dueño.nombre === "") {
        mostrarError("Primero debes registrar al dueño");
        return;
    }
    
    // Obtener valores
    mascota.nombre = document.getElementById("nombreMascota").value.trim();
    mascota.tipo = document.getElementById("tipoMascota").value;
    mascota.edad = parseInt(document.getElementById("edadMascota").value) || 0;
    mascota.peso = parseFloat(document.getElementById("pesoMascota").value) || 0;
    mascota.raza = document.getElementById("razaMascota").value.trim();
    mascota.fechaRegistro = new Date().toLocaleDateString('es-CL');
    
    // Validaciones
    if (mascota.nombre === "" || mascota.tipo === "" || mascota.edad <= 0 || mascota.peso <= 0) {
        mostrarError("Por favor, completa los datos obligatorios de la mascota");
        return;
    }
    
    // Determinar categoría por edad usando if/else
    let categoriaEdad = "";
    if (mascota.edad < 1) {
        categoriaEdad = "Cachorro/Gatito";
    } else if (mascota.edad >= 1 && mascota.edad < 7) {
        categoriaEdad = "Adulto joven";
    } else if (mascota.edad >= 7 && mascota.edad < 12) {
        categoriaEdad = "Adulto mayor";
    } else {
        categoriaEdad = "Senior";
    }
    
    // Determinar estado de peso usando operadores
    let estadoPeso = "";
    const imcBase = mascota.peso / mascota.edad;
    if (imcBase < 2) {
        estadoPeso = "Bajo peso";
    } else if (imcBase >= 2 && imcBase < 4) {
        estadoPeso = "Peso ideal";
    } else {
        estadoPeso = "Sobrepeso";
    }
    
    // Mostrar resultado
    const resultadoDiv = document.getElementById("resultadoMascota");
    resultadoDiv.style.display = "block";
    resultadoDiv.innerHTML = `
        <h3>Mascota registrada con éxito 🎉</h3>
        <p><strong>Nombre:</strong> ${mascota.nombre}</p>
        <p><strong>Tipo:</strong> ${mascota.tipo} ${mascota.raza ? `(${mascota.raza})` : ''}</p>
        <p><strong>Edad:</strong> ${mascota.edad} años - ${categoriaEdad}</p>
        <p><strong>Peso:</strong> ${mascota.peso} kg - ${estadoPeso}</p>
        <p><strong>Dueño:</strong> ${dueño.nombre}</p>
        <p><strong>Fecha registro:</strong> ${mascota.fechaRegistro}</p>
    `;
    
    escribirConsola(`Mascota registrada: ${mascota.nombre} (${mascota.tipo})`);
    escribirConsola(`Edad: ${mascota.edad}a | Peso: ${mascota.peso}kg`);
    
    // Resaltar siguiente sección
    document.getElementById("leccion3").classList.add("highlight");
    setTimeout(() => {
        document.getElementById("leccion3").classList.remove("highlight");
    }, 1500);
}

// Lección 3: Arreglos y bucles
let visitas = [];

function agregarVisita() {
    if (mascota.nombre === "") {
        mostrarError("Primero registra una mascota");
        return;
    }
    
    const descripcion = document.getElementById("nuevaVisita").value.trim();
    const fechaInput = document.getElementById("fechaVisita").value;
    
    if (descripcion === "") {
        mostrarError("Por favor, describe la visita");
        return;
    }
    
    const fecha = fechaInput ? new Date(fechaInput).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL');
    
    // Crear objeto de visita
    const nuevaVisita = {
        id: visitas.length + 1,
        fecha: fecha,
        descripcion: descripcion,
        mascota: mascota.nombre
    };
    
    // Agregar al arreglo
    visitas.push(nuevaVisita);
    
    // Actualizar lista
    actualizarListaVisitas();
    
    escribirConsola(`Visita #${nuevaVisita.id} registrada: ${descripcion}`);
    
    // Limpiar campos
    document.getElementById("nuevaVisita").value = "";
    document.getElementById("fechaVisita").value = "";
}

function actualizarListaVisitas() {
    const listaUl = document.getElementById("listaVisitasUl");
    const resumenDiv = document.getElementById("resumenVisitas");
    
    // Limpiar lista
    listaUl.innerHTML = "";
    
    // Recorrer arreglo con for
    for (let i = 0; i < visitas.length; i++) {
        const visita = visitas[i];
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>#${visita.id}</strong> - ${visita.fecha}<br>
            ${visita.descripcion}
        `;
        listaUl.appendChild(li);
    }
    
    // Mostrar resumen
    if (visitas.length > 0) {
        resumenDiv.style.display = "block";
        document.getElementById("totalVisitas").textContent = visitas.length;
        document.getElementById("ultimaVisita").textContent = visitas[visitas.length - 1].fecha;
    }
}

function limpiarHistorial() {
    if (visitas.length === 0) {
        mostrarError("No hay visitas para limpiar");
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar las ${visitas.length} visitas registradas?`)) {
        visitas = [];
        actualizarListaVisitas();
        document.getElementById("resumenVisitas").style.display = "none";
        escribirConsola("Historial de visitas limpiado");
    }
}

// Lección 4: Funciones
function calcularDosis() {
    if (mascota.peso <= 0) {
        mostrarError("Primero registra el peso de la mascota");
        return;
    }
    
    // Función que recibe parámetros y retorna valor
    function calcularDosisMedicamento(peso, mgPorKg) {
        return peso * mgPorKg;
    }
    
    // Función que llama a otra función
    function calcularDosisAjustada(peso, mgPorKg, factorAjuste) {
        const dosisBase = calcularDosisMedicamento(peso, mgPorKg);
        return dosisBase * factorAjuste;
    }
    
    let dosis = 0;
    let medicamento = "";
    
    // Usar switch para diferentes medicamentos
    switch(mascota.tipo) {
        case "Perro":
            dosis = calcularDosisAjustada(mascota.peso, 10, 1.0);
            medicamento = "Antiparasitario";
            break;
        case "Gato":
            dosis = calcularDosisAjustada(mascota.peso, 8, 0.9);
            medicamento = "Antipulgas";
            break;
        case "Conejo":
            dosis = calcularDosisAjustada(mascota.peso, 5, 0.8);
            medicamento = "Vitaminas";
            break;
        default:
            dosis = calcularDosisMedicamento(mascota.peso, 7);
            medicamento = "Medicamento general";
    }
    
    mostrarResultadoCalculo(
        "Cálculo de Dosis",
        `Para ${mascota.nombre} (${mascota.peso} kg):<br>
        <strong>Medicamento:</strong> ${medicamento}<br>
        <strong>Dosis recomendada:</strong> ${dosis.toFixed(2)} mg<br>
        <strong>Frecuencia:</strong> Cada 24 horas`
    );
    
    escribirConsola(`Dosis calculada: ${dosis.toFixed(2)}mg de ${medicamento}`);
}

function calcularIMC() {
    if (mascota.peso <= 0 || mascota.edad <= 0) {
        mostrarError("Primero registra peso y edad de la mascota");
        return;
    }
    
    // Función para calcular IMC
    function calcularIMCMascota(peso, edad, tipo) {
        let imcBase = peso / (edad * 0.5);
        
        // Ajustar según tipo de mascota
        if (tipo === "Perro") imcBase *= 0.9;
        if (tipo === "Gato") imcBase *= 1.1;
        if (tipo === "Conejo") imcBase *= 0.8;
        
        return imcBase;
    }
    
    const imc = calcularIMCMascota(mascota.peso, mascota.edad, mascota.tipo);
    const imcFormateado = imc.toFixed(2);
    
    // Determinar estado
    let estado = "";
    let recomendacion = "";
    
    if (imc < 15) {
        estado = "Bajo peso";
        recomendacion = "Aumentar cantidad de alimento";
    } else if (imc < 25) {
        estado = "Peso ideal";
        recomendacion = "Mantener dieta actual";
    } else if (imc < 30) {
        estado = "Sobrepeso";
        recomendacion = "Reducir alimento y aumentar ejercicio";
    } else {
        estado = "Obeso";
        recomendacion = "Consulta con veterinario para plan de dieta";
    }
    
    mostrarResultadoCalculo(
        "Índice de Masa Corporal",
        `IMC de ${mascota.nombre}: <strong>${imcFormateado}</strong><br>
        <strong>Estado:</strong> ${estado}<br>
        <strong>Recomendación:</strong> ${recomendacion}`
    );
    
    escribirConsola(`IMC calculado: ${imcFormateado} (${estado})`);
}

function calcularEdadHumana() {
    if (mascota.edad <= 0) {
        mostrarError("Primero registra la edad de la mascota");
        return;
    }
    
    // Función para convertir edad a humana
    function convertirEdadHumana(edadMascota, tipoMascota) {
        let factor = 7; // Factor base para perros
        
        switch(tipoMascota) {
            case "Perro":
                if (edadMascota <= 2) factor = 12;
                else if (edadMascota <= 5) factor = 9;
                else factor = 7;
                break;
            case "Gato":
                if (edadMascota === 1) factor = 15;
                else if (edadMascota === 2) factor = 10;
                else factor = 4;
                break;
            case "Conejo":
                factor = 8;
                break;
            case "Hámster":
                factor = 25;
                break;
            default:
                factor = 6;
        }
        
        return Math.round(edadMascota * factor);
    }
    
    const edadHumana = convertirEdadHumana(mascota.edad, mascota.tipo);
    
    mostrarResultadoCalculo(
        "Edad Equivalente Humana",
        `${mascota.nombre} tiene ${mascota.edad} años (${mascota.tipo})<br>
        <strong>Equivalente humano:</strong> ${edadHumana} años<br>
        <em>Nota: Cálculo aproximado basado en factores de conversión</em>`
    );
    
    escribirConsola(`Edad humana calculada: ${edadHumana} años`);
}

function mostrarResultadoCalculo(titulo, contenido) {
    const resultadosDiv = document.getElementById("resultadosCalculos");
    resultadosDiv.style.display = "block";
    
    const nuevoResultado = document.createElement("div");
    nuevoResultado.className = "ficha";
    nuevoResultado.style.marginTop = "15px";
    nuevoResultado.innerHTML = `
        <h4>${titulo}</h4>
        ${contenido}
    `;
    
    resultadosDiv.appendChild(nuevoResultado);
}

// Lección 5: Objetos
function mostrarFichaCompleta() {
    if (dueño.nombre === "" || mascota.nombre === "") {
        mostrarError("Primero registra dueño y mascota");
        return;
    }
    
    // Crear objeto paciente completo
    const pacienteCompleto = {
        // Propiedades
        id