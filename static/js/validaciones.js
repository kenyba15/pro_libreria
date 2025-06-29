// validaciones.js

// Validar campos requeridos
function validarRequerido(valor, campo) {
    if (!valor || valor.trim() === '') {
        return `El campo ${campo} es obligatorio`;
    }
    return '';
}

function validarNombre(nombre) {
    // Acepta letras (mayúsculas y minúsculas), espacios, tildes y ñ
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (nombre.trim() === "") {
        return "El nombre no puede estar vacío.";
    }

    if (!regex.test(nombre)) {
        return "El nombre solo puede contener letras y espacios.";
    }

    return "";
}


// Validar selects
function validarSelect(valor, campo) {
    if (!valor || valor === '') {
        return `Debe seleccionar un ${campo}`;
    }
    return '';
}

// Validar números positivos
function validarNumeroPositivo(valor, campo) {
    if (valor === '' || valor === null) {
        return '';
    }
    
    if (isNaN(valor) || parseFloat(valor) <= 0) {
        return `${campo} debe ser un número positivo`;
    }
    return '';
}

// Validar ISBN (13 dígitos)
function validarISBN(isbn) {
    if (!isbn || isbn.trim() === '') {
        return ''; // Campo opcional
    }
    
    if (!/^\d{13}$/.test(isbn)) {
        return 'ISBN inválido (debe tener exactamente 13 dígitos numéricos)';
    }
    return '';
}

// Validar opciones de radio
function validarRadio(nombre) {
    const radios = document.querySelectorAll(`input[name="${nombre}"]:checked`);
    if (radios.length === 0) {
        return 'Debe seleccionar un formato';
    }
    return '';
}

// Validar URL (sitio web) - VERSIÓN MEJORADA
function validarURL(url) {
    if (!url || url.trim() === '') {
        return ''; // Campo opcional
    }
    
    // Aceptar URLs con o sin http/https
    const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
    return urlPattern.test(url) ? '' : 'URL inválida. Ejemplo válido: https://www.ejemplo.com';
}


// Validar email - VERSIÓN MEJORADA
function validarEmail(email) {
    if (!email || email.trim() === '') {
        return ''; // Campo opcional
    }
    
    // Expresión regular mejorada
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!re.test(email)) {
        return 'Correo electrónico inválido. Ejemplo válido: usuario@dominio.com';
    }
    return '';
}