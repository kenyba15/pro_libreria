// maneFor.js
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.validated-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const errors = validarFormulario(this.id);
            
            // Depuración: mostrar errores en consola
            console.log("Errores encontrados al enviar:", errors);
            
            if (Object.keys(errors).length === 0) {
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Guardando...';

                console.log('Formulario válido, enviando datos...');
                
                this.submit();
            } else {
                mostrarErrores(errors); // ← Esto estaba faltando
            }

        
        // Limpiar errores al cambiar campos
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', function() {
                limpiarError(this.id);
            });
            
            // Validación al perder foco - PARA TODOS LOS CAMPOS
            input.addEventListener('blur', function() {
                const campoId = this.id;
                const formId = this.form.id;
                const valor = this.value;
                let error = '';
                
                // Validación específica por tipo de campo
                switch(campoId) {
                    case 'nombre':
                    case 'titulo':
                        error = validarRequerido(valor, campoId);
                        break;
                    case 'web_p':
                        error = validarURL(valor);
                        break;
                    case 'correo':
                        error = validarEmail(valor);
                        break;
                    case 'tipo':
                    case 'editorial':
                    case 'autor':
                    case 'idioma':
                    case 'genero':
                        error = validarSelect(valor, campoId);
                        break;
                    case 'edicion':
                        error = validarNumeroPositivo(valor, 'edición');
                        break;
                    case 'isbn':
                        error = validarISBN(valor);
                        break;
                }
                
                // Solo mostrar error si existe
                if (error) {
                    mostrarErrores({[campoId]: error});
                }
            });
        });
        
        // Para radios
        form.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                limpiarError('formato');
            });
        });
    });
});

function validarFormulario(formId) {
    const errors = {};
    console.log(`Validando formulario: ${formId}`);
    
    switch(formId) {
        case 'form-libro':
            errors.titulo = validarRequerido(
                document.getElementById('titulo').value, 
                'título'
            );
            
            // Validar ISBN
            const isbnValue = document.getElementById('isbn').value;
            errors.isbn = validarISBN(isbnValue);
            
            errors.editorial = validarSelect(
                document.getElementById('editorial').value,
                'editorial'
            );
            
            errors.autor = validarSelect(
                document.getElementById('autor').value,
                'autor'
            );
            
            errors.idioma = validarSelect(
                document.getElementById('idioma').value,
                'idioma'
            );
            errors.genero = validarSelect(
                document.getElementById('genero').value,
                'género'
            );
            
            errors.edicion = validarNumeroPositivo(
                document.getElementById('edicion').value, 
                'edición'
            );
            
            errors.formato = validarRadio('formato');
            break;
            
            case 'form-editorial':
            errors.nombre = validarNombre(document.getElementById('nombre').value, 
                'nombre'
            );
            
            errors.tipo = validarSelect(
                document.getElementById('tipo').value,
                'tipo'
            );
            
            // Validar URL
            const webPValue = document.getElementById('web_p').value;
            if (!webPValue) {
                errors.web_p = 'El sitio web es obligatorio.';
            } else {
                errors.web_p = validarURL(webPValue);
            }
            
            // Validar correo
            const correoValue2 = document.getElementById('correo').value;
            if (!correoValue2) {
                errors.correo = 'El correo es obligatorio.';
            } else {
                errors.correo = validarEmail(correoValue2);
            }
            break;
    
            
            case 'form-autor':
                errors.nombre = validarNombre(
                    document.getElementById('nombre').value, 
                    'nombre'
                );

                const correoValue = document.getElementById('correo').value;
                if (!correoValue) {
                    errors.correo = 'El correo es obligatorio.';
                } else {
                    errors.correo = validarEmail(correoValue);
                }
            }
    
    // Filtrar solo errores con mensaje
    const filteredErrors = {};
    for (const [key, value] of Object.entries(errors)) {
        if (value) {
            console.log(`Error en ${key}: ${value}`);
            filteredErrors[key] = value;
        }
    }
    
    return filteredErrors;
}

function mostrarErrores(errors) {
    console.log("Mostrando errores:", errors);
    
    // Limpiar todos los mensajes de error
    document.querySelectorAll('.error-msg').forEach(el => {
        el.textContent = '';
    });
    
    // Limpiar clases de error
    document.querySelectorAll('.invalid').forEach(el => {
        el.classList.remove('invalid');
    });
    
    // Mostrar nuevos errores
    for (const [campo, mensaje] of Object.entries(errors)) {
        const errorElement = document.getElementById(`error-${campo}`);
        const inputElement = document.getElementById(campo);
        
        if (errorElement) {
            errorElement.textContent = mensaje;
            errorElement.style.display = 'block';
            errorElement.style.color = '#d32f2f';
        }
        
        if (inputElement) {
            inputElement.classList.add('invalid');
        }
    }
    
    // Scroll al primer error
    const firstError = document.querySelector('.error-msg:not(:empty)');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function limpiarError(campoId) {
    const errorElement = document.getElementById(`error-${campoId}`);
    const inputElement = document.getElementById(campoId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('invalid');
    }
}