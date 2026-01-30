// SISTEMA VETERINARIO 

// Datos hipotéticos precargados
let baseDeDatos = {
    dueños: [
        { id: 1, nombre: "Jessica Pérez", telefono: "+56 9 8765 4321", email: "jessica@email.com" },
        { id: 2, nombre: "Alejandro González", telefono: "+56 9 1234 5678", email: "alejandro@email.com" },
        { id: 3, nombre: "María López", telefono: "+56 9 5555 6666", email: "maria@email.com" }
    ],
    
    mascotas: [
        { 
            id: 101, 
            nombre: "Mishi", 
            tipo: "Gato", 
            tamaño: "Mediano", 
            edad: 3, 
            pesoActual: 5.2,
            dueñoId: 1,
            historialPesos: [3.1, 4.5, 6.8, 5.2] // Delgado → Mejorando → Gordo → Ideal
        },
        { 
            id: 102, 
            nombre: "Rex", 
            tipo: "Perro", 
            tamaño: "Grande", 
            edad: 5, 
            pesoActual: 35.0,
            dueñoId: 2,
            historialPesos: [30.0, 32.5, 35.0, 35.0] // Bajo peso → Ganancia → Ideal → Mantenimiento
        },
        { 
            id: 103, 
            nombre: "Bugs", 
            tipo: "Conejo", 
            tamaño: "Mediano", 
            edad: 2, 
            pesoActual: 3.8,
            dueñoId: 3,
            historialPesos: [3.8, 3.9]
        }
    ]
};

// Variables para datos nuevos
let nuevoDueño = null;
let nuevaMascota = null;

// FUNCIONES BÁSICAS 

// 1. Registrar Dueño
function registrarDueño() {
    const nombre = document.getElementById("nombreDueño").value.trim();
    const telefono = document.getElementById("telefonoDueño").value.trim();
    const email = document.getElementById("emailDueño").value.trim();
    
    if (!nombre || !telefono) {
        alert("Nombre y teléfono son obligatorios");
        return;
    }
    
    nuevoDueño = {
        id: baseDeDatos.dueños.length + 1,
        nombre: nombre,
        telefono: telefono,
        email: email || "Sin email"
    };
    
    // Agregar a la base
    baseDeDatos.dueños.push(nuevoDueño);
    
    // Mostrar mensaje
    document.getElementById("mensajeDueño").style.display = "block";
    document.getElementById("mensajeDueño").innerHTML = `
        <h3>Dueño registrado</h3>
        <p><strong>Nombre:</strong> ${nuevoDueño.nombre}</p>
        <p><strong>Teléfono:</strong> ${nuevoDueño.telefono}</p>
        <p><strong>Email:</strong> ${nuevoDueño.email}</p>
    `;
    
    // Limpiar formulario
    document.getElementById("nombreDueño").value = "";
    document.getElementById("telefonoDueño").value = "";
    document.getElementById("emailDueño").value = "";
    
    console.log("Dueño registrado:", nuevoDueño);
    actualizarListaPacientes();
}

// 2. Registrar Mascota
function registrarMascota() {
    if (baseDeDatos.dueños.length === 0) {
        alert("Primero registra al menos un dueño");
        return;
    }
    
    const nombre = document.getElementById("nombreMascota").value.trim();
    const tipo = document.getElementById("tipoMascota").value;
    const tamaño = document.getElementById("tamañoMascota").value;
    const edad = parseInt(document.getElementById("edadMascota").value);
    const peso = parseFloat(document.getElementById("pesoMascota").value);
    
    if (!nombre || !tipo || !tamaño || !edad || !peso) {
        alert("Completa todos los campos");
        return;
    }
    
    // Usar el último dueño registrado o el primero de los hipotéticos
    const dueñoId = nuevoDueño ? nuevoDueño.id : 1;
    const dueñoNombre = nuevoDueño ? nuevoDueño.nombre : baseDeDatos.dueños[0].nombre;
    
    nuevaMascota = {
        id: baseDeDatos.mascotas.length + 101,
        nombre: nombre,
        tipo: tipo,
        tamaño: tamaño,
        edad: edad,
        pesoActual: peso,
        dueñoId: dueñoId,
        dueñoNombre: dueñoNombre,
        historialPesos: [peso] // Primer peso
    };
    
    // Agregar a la base
    baseDeDatos.mascotas.push(nuevaMascota);
    
    // Mostrar mensaje
    document.getElementById("resultadoMascota").style.display = "block";
    document.getElementById("resultadoMascota").innerHTML = `
        <h3>Mascota registrada</h3>
        <p><strong>Nombre:</strong> ${nuevaMascota.nombre}</p>
        <p><strong>Tipo:</strong> ${nuevaMascota.tipo}</p>
        <p><strong>Tamaño:</strong> ${nuevaMascota.tamaño}</p>
        <p><strong>Edad:</strong> ${nuevaMascota.edad} años</p>
        <p><strong>Peso:</strong> ${nuevaMascota.pesoActual} kg</p>
        <p><strong>Dueño:</strong> ${nuevaMascota.dueñoNombre}</p>
    `;
    
    // Limpiar formulario
    document.getElementById("nombreMascota").value = "";
    document.getElementById("edadMascota").value = "";
    document.getElementById("pesoMascota").value = "";
    
    console.log("Mascota registrada:", nuevaMascota);
    actualizarListaPacientes();
}

// 3. Calcular IMC según tamaño
function calcularIMC() {
    if (baseDeDatos.mascotas.length === 0) {
        alert("Primero registra una mascota");
        return;
    }
    
    // Usar la última mascota registrada o la primera hipotética
    const mascota = nuevaMascota || baseDeDatos.mascotas[0];
    
    // Función para determinar peso ideal según tipo y tamaño
    function obtenerPesoIdeal(tipo, tamaño) {
        const pesosIdeales = {
            "Perro": {
                "Toy": { min: 1, max: 4, ideal: 2.5 },
                "Pequeño": { min: 5, max: 10, ideal: 7.5 },
                "Mediano": { min: 11, max: 25, ideal: 18 },
                "Grande": { min: 26, max: 45, ideal: 35.5 },
                "Gigante": { min: 46, max: 70, ideal: 58 }
            },
            "Gato": {
                "Pequeño": { min: 2, max: 4, ideal: 3 },
                "Mediano": { min: 4, max: 6, ideal: 5 },
                "Grande": { min: 6, max: 9, ideal: 7.5 }
            },
            "Conejo": {
                "Enano": { min: 1, max: 1.5, ideal: 1.25 },
                "Pequeño": { min: 1.5, max: 3, ideal: 2.25 },
                "Mediano": { min: 3, max: 5, ideal: 4 },
                "Gigante": { min: 5, max: 8, ideal: 6.5 }
            }
        };
        
        return pesosIdeales[tipo]?.[tamaño] || { min: 1, max: 10, ideal: 5 };
    }
    
    const pesoIdeal = obtenerPesoIdeal(mascota.tipo, mascota.tamaño);
    const pesoActual = mascota.pesoActual;
    
    // Determinar estado
    let estado = "";
    let color = "";
    
    if (pesoActual < pesoIdeal.min) {
        estado = "BAJO PESO";
        color = "blue";
    } else if (pesoActual > pesoIdeal.max) {
        estado = "SOBREPESO";
        color = "orange";
    } else if (pesoActual >= pesoIdeal.min && pesoActual <= pesoIdeal.max) {
        estado = "PESO IDEAL";
        color = "green";
    }
    
    // Calcular diferencia porcentual
    const diferencia = pesoActual - pesoIdeal.ideal;
    const porcentaje = ((diferencia / pesoIdeal.ideal) * 100).toFixed(1);
    
    // Mostrar resultado
    document.getElementById("resultadosCalculos").style.display = "block";
    document.getElementById("resultadosCalculos").innerHTML = `
        <h3>Análisis de Peso - ${mascota.nombre}</h3>
        <p><strong>Tipo:</strong> ${mascota.tipo} ${mascota.tamaño}</p>
        <p><strong>Peso actual:</strong> ${pesoActual} kg</p>
        <p><strong>Rango ideal:</strong> ${pesoIdeal.min}-${pesoIdeal.max} kg</p>
        <p><strong>Peso ideal:</strong> ${pesoIdeal.ideal} kg</p>
        <p><strong>Diferencia:</strong> ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(1)} kg (${porcentaje > 0 ? '+' : ''}${porcentaje}%)</p>
        <p><strong style="color: ${color}">ESTADO: ${estado}</strong></p>
        <p><small>Basado en estándares veterinarios para ${mascota.tipo}s ${mascota.tamaño.toLowerCase()}</small></p>
    `;
}

// 4. Calcular peso promedio del historial
function calcularPesoPromedio() {
    if (baseDeDatos.mascotas.length === 0) {
        alert("No hay mascotas registradas");
        return;
    }
    
    // Usar la última mascota registrada o la primera hipotética
    const mascota = nuevaMascota || baseDeDatos.mascotas[0];
    
    if (!mascota.historialPesos || mascota.historialPesos.length === 0) {
        alert("No hay historial de pesos");
        return;
    }
    
    const pesos = mascota.historialPesos;
    const suma = pesos.reduce((total, peso) => total + peso, 0);
    const promedio = suma / pesos.length;
    const minimo = Math.min(...pesos);
    const maximo = Math.max(...pesos);
    const cambios = pesos.length - 1;
    
    // Mostrar resultado
    document.getElementById("resultadosCalculos").style.display = "block";
    document.getElementById("resultadosCalculos").innerHTML = `
        <h3>Estadísticas de Peso - ${mascota.nombre}</h3>
        <p><strong>Registros totales:</strong> ${pesos.length}</p>
        <p><strong>Peso promedio:</strong> ${promedio.toFixed(2)} kg</p>
        <p><strong>Peso mínimo:</strong> ${minimo.toFixed(2)} kg</p>
        <p><strong>Peso máximo:</strong> ${maximo.toFixed(2)} kg</p>
        <p><strong>Cambios registrados:</strong> ${cambios}</p>
        
        <h4>Historial completo:</h4>
        <ul>
            ${pesos.map((peso, index) => `
                <li>Registro ${index + 1}: ${peso.toFixed(2)} kg</li>
            `).join('')}
        </ul>
        
        <p><small>Datos de ${mascota.dueñoNombre}</small></p>
    `;
}

// 5. Agregar nuevo peso al historial
function agregarNuevoPeso() {
    if (baseDeDatos.mascotas.length === 0) {
        alert("Primero registra una mascota");
        return;
    }
    
    const nuevoPeso = parseFloat(prompt("Ingresa el nuevo peso en kg:"));
    
    if (!nuevoPeso || nuevoPeso <= 0) {
        alert("Peso inválido");
        return;
    }
    
    // Usar la última mascota registrada o la primera hipotética
    const mascota = nuevaMascota || baseDeDatos.mascotas[0];
    
    // Agregar al historial
    mascota.historialPesos.push(nuevoPeso);
    mascota.pesoActual = nuevoPeso;
    
    alert(`Nuevo peso registrado: ${nuevoPeso} kg\nTotal registros: ${mascota.historialPesos.length}`);
    console.log("Nuevo peso agregado:", nuevoPeso);
    
    // Actualizar la lista de pacientes
    actualizarListaPacientes();
}

function actualizarTamañoOpciones() {
    const tipo = document.getElementById("tipoMascota").value;
    const tamañoSelect = document.getElementById("tamañoMascota");
    
    tamañoSelect.innerHTML = '<option value="">Selecciona tamaño...</option>';
    
    if (!tipo) return;
    
    let tamaños = [];
    
    if (tipo === "Perro") {
        tamaños = ["Toy", "Pequeño", "Mediano", "Grande", "Gigante"];
    } else if (tipo === "Gato") {
        tamaños = ["Pequeño", "Mediano", "Grande"];
    } else if (tipo === "Conejo") {
        tamaños = ["Enano", "Pequeño", "Mediano", "Gigante"];
    } else if (tipo === "Hámster") {
        tamaños = ["Enano", "Sirio", "Roborovski"];
    }
    
    tamaños.forEach(tamaño => {
        const option = document.createElement("option");
        option.value = tamaño;
        option.textContent = tamaño;
        tamañoSelect.appendChild(option);
    });
}

// 7. Mostrar todos los pacientes esto lo hice investigando un poco acerca de como mostrar BBDD
function mostrarTodosPacientes() {
    const listaDiv = document.getElementById("listaPacientes");
    listaDiv.style.display = "block";
    
    let html = "<h3>Todos los Pacientes Registrados</h3>";
    
    // Mostrar mascotas hipotéticas primero
    html += "<h4>📋 Pacientes Pre-registrados:</h4>";
    baseDeDatos.mascotas.slice(0, 3).forEach(mascota => {
        const dueño = baseDeDatos.dueños.find(d => d.id === mascota.dueñoId);
        html += `
            <div class="ficha">
                <p><strong>${mascota.nombre}</strong> (${mascota.tipo} ${mascota.tamaño})</p>
                <p>Edad: ${mascota.edad} años | Peso: ${mascota.pesoActual} kg</p>
                <p>Dueño: ${dueño?.nombre || "Desconocido"}</p>
                <p>Historial de pesos: ${mascota.historialPesos.join(" kg → ")} kg</p>
            </div>
        `;
    });
    
    // Mostrar mascotas nuevas si existen
    if (baseDeDatos.mascotas.length > 3) {
        html += "<h4>📝 Pacientes Nuevos:</h4>";
        baseDeDatos.mascotas.slice(3).forEach(mascota => {
            const dueño = baseDeDatos.dueños.find(d => d.id === mascota.dueñoId);
            html += `
                <div class="ficha">
                    <p><strong>${mascota.nombre}</strong> (${mascota.tipo} ${mascota.tamaño})</p>
                    <p>Edad: ${mascota.edad} años | Peso: ${mascota.pesoActual} kg</p>
                    <p>Dueño: ${dueño?.nombre || "Desconocido"}</p>
                    <p>Registros: ${mascota.historialPesos.length}</p>
                </div>
            `;
        });
    }
    
    // Mostrar dueños
    html += "<h4>👤 Dueños Registrados:</h4>";
    baseDeDatos.dueños.forEach(dueño => {
        const mascotasDelDueño = baseDeDatos.mascotas.filter(m => m.dueñoId === dueño.id);
        html += `
            <div class="ficha">
                <p><strong>${dueño.nombre}</strong></p>
                <p>Tel: ${dueño.telefono} | Email: ${dueño.email}</p>
                <p>Mascotas: ${mascotasDelDueño.map(m => m.nombre).join(", ")}</p>
            </div>
        `;
    });
    
    // Estadísticas generales solo para probar funciones 
    html += "<h4>📊 Estadísticas Generales:</h4>";
    html += `
        <div class="ficha">
            <p><strong>Total dueños:</strong> ${baseDeDatos.dueños.length}</p>
            <p><strong>Total mascotas:</strong> ${baseDeDatos.mascotas.length}</p>
            <p><strong>Tipos de mascotas:</strong> ${[...new Set(baseDeDatos.mascotas.map(m => m.tipo))].join(", ")}</p>
            <p><strong>Peso promedio general:</strong> ${calcularPesoPromedioGeneral().toFixed(2)} kg</p>
        </div>
    `;
    
    listaDiv.innerHTML = html;
}

// Función auxiliar para calcular peso promedio general
function calcularPesoPromedioGeneral() {
    if (baseDeDatos.mascotas.length === 0) return 0;
    const total = baseDeDatos.mascotas.reduce((sum, mascota) => sum + mascota.pesoActual, 0);
    return total / baseDeDatos.mascotas.length;
}

// 8. Actualizar lista de pacientes (usada internamente)
function actualizarListaPacientes() {
    // Esta función se llama automáticamente cuando se agregan datos
    console.log("Base actualizada:");
    console.log("- Dueños:", baseDeDatos.dueños.length);
    console.log("- Mascotas:", baseDeDatos.mascotas.length);
}

// 9. Inicializar sistema con datos hipotéticos
function inicializarSistema() {
    console.log("Sistema veterinario iniciado con casos de ejemplo:");
    console.log("1. Mishi (gato mediano): 3.1kg → 4.5kg → 6.8kg → 5.2kg");
    console.log("2. Rex (perro grande): 30kg → 32.5kg → 35kg → 35kg");
    console.log("3. Bugs (conejo mediano): 3.8kg → 3.9kg");
    
    // Mostrar mensaje inicial
    setTimeout(() => {
        alert("¡Bienvenido al sistema veterinario!\n\nYa hay 3 pacientes pre-registrados de muestra:\n1. Mishi (gato de Jessica)\n2. Rex (perro de Alejandro)\n3. Bugs (conejo de María)\n\nPuedes agregar nuevos pacientes o trabajar con los existentes.");
    }, 500);
}

// Ejecutar inicialización cuando se carga la página
window.onload = inicializarSistema;