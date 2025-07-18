let itemCount = 0;
const IVA_PORCENTAJE = 15;
let librosDisponibles = []; // Almacenará los libros cargados desde la API

// Función para cargar libros desde la API
async function cargarLibros() {
    try {
        const response = await fetch('/api/libros');  // Asegúrate de que esta ruta sea correcta
        if (!response.ok) throw new Error('Error al cargar libros');
        librosDisponibles = await response.json();
        console.log(librosDisponibles); // Muestra la lista de libros en la consola
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al cargar la lista de libros');
    }
}

// Plantilla para un item de factura con combobox de libros
function getInvoiceItemTemplate(id) {
    // Generar opciones para el select
    let options = '<option value="">Seleccione un libro</option>';
    librosDisponibles.forEach(libro => {
        options += `
            <option value="${libro.id_libro}" data-precio="${libro.precio|| 0}">
                ${libro.titulo}
            </option>
        `;
    });
    return `
        <div class="invoice-item" data-id="${id}">
            <div class="item-row">
                <div>
                    <select class="item-description" onchange="updateItemPrice(this)">
                        ${options}
                    </select>
                </div>
                <div>
                    <input type="number" placeholder="Cantidad" min="1" value="1" class="item-quantity">
                </div>
                <div>
                    <span class="item-price">$0.00</span>
                </div>
                <div>
                    <span class="item-total">$0.00</span>
                </div>
                <div>
                    <button type="button" class="remove-item"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;
}
// Función para actualizar el precio cuando se selecciona un libro
function updateItemPrice(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const priceSpan = selectElement.closest('.item-row').querySelector('.item-price');
    const precio = selectedOption.dataset.precio || 0;
    priceSpan.textContent = '$' + parseFloat(precio).toFixed(2);
    updateTotals();
}

// Actualizar totales de la factura
function updateTotals() {
    let subtotal = 0;
    const items = document.querySelectorAll('.invoice-item');
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', '')) || 0; // Cambiado para obtener el precio del span
        const totalItem = quantity * price;
        subtotal += totalItem;
        item.querySelector('.item-total').textContent = '$' + totalItem.toFixed(2);
    });
    // Calcular impuesto
    const taxRate = IVA_PORCENTAJE / 100;
    const tax = subtotal * taxRate; // Calcular el impuesto basado en el subtotal
    const total = subtotal + tax; // Calcular el total
    // Actualizar los elementos de la interfaz
    document.getElementById('subtotal').textContent = "$" + subtotal.toFixed(2);
    document.getElementById('tax').textContent = "$" + tax.toFixed(2); // Mostrar el cálculo del impuesto
    document.getElementById('total').textContent = "$" + total.toFixed(2);
    
    updatePreview(); // Actualizar la vista previa
}


// Actualizar vista previa de la factura
function updatePreview() {
    // Datos del cliente
    const customerSelect = document.getElementById('customer');
    const customerName = customerSelect.options[customerSelect.selectedIndex].text;
    
    // Dirección
    const address = document.getElementById('shippingAddress').value || '[Dirección no especificada]';
    
    // Método de pago
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    let paymentText = '';
    
    switch(paymentMethod) {
        case 'efectivo': paymentText = 'Efectivo'; break;
        case 'tarjeta': paymentText = 'Tarjeta'; break;
        case 'transferencia': paymentText = 'Transferencia'; break;
    }
    
    // Notas
    const notes = document.getElementById('notes').value || 'Sin notas adicionales';
    
    // Generar HTML para los ítems
    let itemsHTML = '';
    let previewSubtotal = 0;
    
    document.querySelectorAll('.invoice-item').forEach(item => {
        // Obtener el texto del option seleccionado (título del libro)
        const select = item.querySelector('.item-description');
        const description = select.options[select.selectedIndex].text || 'Artículo sin descripción';
        
        // Si el select tiene un placeholder, quitamos el texto "(Seleccione un libro)"
        if (description.includes("Seleccione un libro")) {
            description = "Artículo sin descripción";
        }
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', '')) || 0;
        const itemTotal = quantity * price;
        
        previewSubtotal += itemTotal;
        
        itemsHTML += `
            <tr>
                <td>${description}</td>
                <td>${quantity}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Calcular impuestos y total
    const taxRate = parseFloat(document.getElementById('tax').value) / 100 || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const tax = previewSubtotal * taxRate;
    const total = previewSubtotal + tax - discount;
    
    // Actualizar vista previa
    const previewContainer = document.querySelector('.preview-content');
    previewContainer.innerHTML = `
        <div class="preview-header">
            <div>
                <h3>Factura #001</h3>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
                <h3>Total</h3>
                <h2 class="highlight">$${total.toFixed(2)}</h2>
            </div>
        </div>
        
        <div class="preview-info">
            <div>
                <h4>Cliente</h4>
                <p>${customerName === 'Seleccione un cliente' ? '[Cliente no seleccionado]' : customerName}</p>
            </div>
            <div>
                <h4>Dirección</h4>
                <p>${address}</p>
            </div>
            <div>
                <h4>Método de Pago</h4>
                <p>${paymentText}</p>
            </div>
        </div>
        
        <table class="preview-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML || '<tr><td colspan="4">No hay artículos agregados</td></tr>'}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">Subtotal</td>
                    <td>$${previewSubtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3">Impuesto (${(taxRate * 100).toFixed(0)}%)</td>
                    <td>$${tax.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3">Descuento</td>
                    <td>$${discount.toFixed(2)}</td>
                </tr>
                <tr style="font-weight: 600;">
                    <td colspan="3">Total</td>
                    <td>$${total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        
        <div class="preview-notes">
            <h4>Notas</h4>
            <p>${notes}</p>
        </div>
    `;
}


// Mostrar mensajes en la interfaz
function showMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async function () {
    // Cargar libros disponibles desde la base de datos
    await cargarLibros();

    const form = document.getElementById('facturaForm');

    // Asigna el valor del impuesto al campo y al texto visible
    document.getElementById('tax').value = IVA_PORCENTAJE;
    document.getElementById('tax-percentage').textContent = IVA_PORCENTAJE + '%';

    // Agrega un ítem inicial automáticamente
    document.getElementById('addItemBtn').click();

    document.querySelector('.btn-secondary').addEventListener('click', resetForm);


    // Event listener para agregar un nuevo ítem
    document.getElementById('addItemBtn').addEventListener('click', function () {
        itemCount++;
        document.getElementById('invoiceItems').insertAdjacentHTML('beforeend', getInvoiceItemTemplate(itemCount));
        const newItem = document.querySelector(`.invoice-item[data-id="${itemCount}"]`);
        addProductListeners(newItem);
        updateTotals();
    });

    // Delegación para eliminar ítems
    document.getElementById('invoiceItems').addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            e.target.closest('.invoice-item').remove();
            updateTotals();
        }
    });

    // Event listeners generales para actualizar vista previa
    document.getElementById('customer').addEventListener('change', updatePreview);
    document.getElementById('shippingAddress').addEventListener('input', updatePreview);
    document.getElementById('notes').addEventListener('input', updatePreview);
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });
});


// Llama a esta función después de agregar un nuevo producto
function addProductListeners(itemRow) {
    itemRow.querySelector('.item-quantity').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-price').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-description').addEventListener('input', updateTotals);
}

// Función para agregar listeners a los productos
function addProductListeners(itemRow) {
    const quantityInput = itemRow.querySelector('.item-quantity');
    
    // Listener para el campo de cantidad
    quantityInput.addEventListener('input', function() {
        // Verifica si el valor es vacío o 0
        if (quantityInput.value === '' || parseInt(quantityInput.value) <= 0) {
            quantityInput.value = 1; // Cambia a 1 si está vacío o es 0
        }
        updateTotals(); // Actualiza los totales después de cambiar la cantidad
    });
    // Otros listeners
    itemRow.querySelector('.item-price').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-description').addEventListener('input', updateTotals);
}

document.getElementById('customer').addEventListener('change', async function() {
    const selectedOption = this.options[this.selectedIndex];
    
    if (selectedOption.text === 'Consumidor final') {
        // Bloquear botones de buscar y agregar cliente
        document.getElementById('btnBuscarCliente').disabled = true;
        document.getElementById('btnNuevoCliente').disabled = true;

        const customerCedula = '9999999999'; // Aquí deberías usar la cédula correcta
        try {
            const response = await fetch(`/api/clientes/cedula/${customerCedula}`);
            if (!response.ok) throw new Error('Cliente no encontrado');
            const cliente = await response.json();

            if (cliente) {
                document.getElementById('newCustomerName').value = cliente.nombre || '';
                document.getElementById('newCustomerEmail').value = cliente.email || '';
                document.getElementById('newCustomerPhone').value = cliente.telefono || '';
                document.getElementById('shippingAddress').value = cliente.direccion || ''; // Asegúrate de que este ID sea correcto
                document.getElementById('newCustomerCedula').value = cliente.cedula || '';

                // Deshabilitar campos
                ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress', 'newCustomerCedula'].forEach(id => {
                    document.getElementById(id).disabled = true;
                });
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al buscar el cliente: ' + error.message);
        }
    } else if (selectedOption.text === 'Datos') {
        // Limpiar y habilitar campos cuando se selecciona "Datos"
        ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress', 'newCustomerCedula'].forEach(id => {
            const field = document.getElementById(id);
            field.value = '';  // Limpiar el valor
        });
        document.getElementById('newCustomerCedula').disabled = false; // Habilitar solo cédula

        // Habilitar botones de buscar y agregar cliente
        document.getElementById('btnBuscarCliente').disabled = false;
        document.getElementById('btnNuevoCliente').disabled = false;
    }
});

document.getElementById('btnBuscarCliente').addEventListener('click', async function() {
    const cedulaInput = document.getElementById('newCustomerCedula');
    const cedula = cedulaInput.value.trim();
    const errorMessageContainer = document.getElementById('error-newCustomerCedula');

    // Limpiar mensajes de error anteriores
    errorMessageContainer.style.display = 'none';
    errorMessageContainer.textContent = '';

    // Validar cédula
    if (!cedula) {
        errorMessageContainer.textContent = 'Debe ingresar datos';
        errorMessageContainer.style.display = 'block';
        return;
    }

    if (cedula.length > 10) {
        errorMessageContainer.textContent = 'La cédula debe tener 10 dígitos';
        errorMessageContainer.style.display = 'block';
        return;
    }
    if (cedula.length < 10) {
        errorMessageContainer.textContent = 'La cédula debe tener 10 dígitos';
        errorMessageContainer.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`/api/clientes/cedula/${cedula}`);
        if (!response.ok) throw new Error('Cliente no encontrado');
        const cliente = await response.json();

        // Llenar los campos con los datos del cliente
        document.getElementById('newCustomerName').value = cliente.nombre || '';
        document.getElementById('newCustomerEmail').value = cliente.email || '';
        document.getElementById('newCustomerPhone').value = cliente.telefono || '';
        document.getElementById('shippingAddress').value = cliente.direccion || '';
        document.getElementById('newCustomerCedula').value = cliente.cedula || '';

        // Deshabilitar campos
        ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
            document.getElementById(id).disabled = true;
        });

    } catch (error) {
        console.error('Error:', error);
        errorMessageContainer.textContent = 'Cliente inexistente';
        errorMessageContainer.style.display = 'block';

        // Habilitar campos para que el usuario pueda ingresar datos manualmente
        ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
            document.getElementById(id).disabled = false;
        });
    }
});

// Limpiar mensajes de error al interactuar con los campos
['newCustomerCedula', 'newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        const errorMessageContainer = document.getElementById('error-newCustomerCedula');
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
    });
});

document.getElementById('btnNuevoCliente').addEventListener('click', async function() {
    // Obtener valores de los campos
    const nombre = document.getElementById('newCustomerName').value.trim();
    const email = document.getElementById('newCustomerEmail').value.trim();
    const telefono = document.getElementById('newCustomerPhone').value.trim();
    const direccion = document.getElementById('shippingAddress').value.trim();
    const cedula = document.getElementById('newCustomerCedula').value.trim();

    // Obtener contenedores de mensajes de error
    const errorNombre = document.getElementById('error-newCustomerName');
    const errorEmail = document.getElementById('error-newCustomerEmail');
    const errorTelefono = document.getElementById('error-newCustomerPhone');
    const errorDireccion = document.getElementById('error-shippingAddress');
    const errorCedula = document.getElementById('error-newCustomerCedula');

    // Limpiar mensajes de error anteriores
    [errorNombre, errorEmail, errorTelefono, errorDireccion, errorCedula].forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });

    // Validaciones
    let valid = true;

    if (!nombre) {
        errorNombre.textContent = 'Se debe ingresar datos';
        errorNombre.style.display = 'block';
        valid = false;
    }

    if (!email) {
        errorEmail.textContent = 'Se debe ingresar datos';
        errorEmail.style.display = 'block';
        valid = false;
    } else if (!validarEmail(email)) {
        errorEmail.textContent = 'Ingrese un correo válido';
        errorEmail.style.display = 'block';
        valid = false;
    }

    if (!telefono) {
        errorTelefono.textContent = 'Se debe ingresar datos';
        errorTelefono.style.display = 'block';
        valid = false;
    } else if (!await validarTelefonoCompleto(telefono)) {
        errorTelefono.textContent = 'Número no registrado o inválido. Ecuador: 09XXXXXXX. Extranjero: +CCXXXXXXX';
        errorTelefono.style.display = 'block';
        return;
    }

    if (!direccion) {
        errorDireccion.textContent = 'Se debe ingresar datos';
        errorDireccion.style.display = 'block';
        valid = false;
    }

    if (!cedula) {
        errorCedula.textContent = 'Se debe ingresar datos';
        errorCedula.style.display = 'block';
        valid = false;
    } else if (!validarCedula(cedula)) {
        errorCedula.textContent = 'La cédula ingresada no es válida';
        errorCedula.style.display = 'block';
        valid = false;
    }

    // Si hay errores, no continuar
    if (!valid) return;

    // Si todas las validaciones son correctas, enviar datos a la base de datos
    const clienteData = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        direccion: direccion,
        cedula: cedula
    };

    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        });

        if (!response.ok) throw new Error('Error al agregar el cliente');

        const result = await response.json();
        alert('Cliente agregado exitosamente con ID: ' + result.id_cliente); // Ventana emergente

    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message); // Ventana emergente para errores
    }
});


function resetForm() {
    // Resetear el formulario
    document.getElementById('facturaForm').reset();

    // Limpiar y deshabilitar campos del cliente
    ['newCustomerCedula', 'newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
        const el = document.getElementById(id);
        el.value = '';
        el.disabled = id !== 'newCustomerCedula'; // Solo cédula habilitada
    });

    // Resetear mensajes de error
    ['newCustomerCedula', 'newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
        const errorContainer = document.getElementById('error-' + id);
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }
    });

    // Resetear selección del cliente
    document.getElementById('customer').selectedIndex = 0;

    // Limpiar totales (spans)
    document.getElementById('subtotal').textContent = '$0.00';
    document.getElementById('tax').textContent = '$0.00';
    document.getElementById('discount').textContent = '$0.00';
    document.getElementById('total').textContent = '$0.00';

    // Limpiar artículos y reiniciar contador
    document.getElementById('invoiceItems').innerHTML = '';
    itemCount = 0;

    // Ocultar y limpiar vista previa
    document.querySelector('.preview-content').innerHTML = '';

    // Limpiar notas
    document.getElementById('notes').value = '';

    // Limpiar selección de método de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(el => el.checked = false);

    // Recalcular totales
    updateTotals();

    updatePreview
}


function addItem() {
    itemCount++;
    document.getElementById('invoiceItems').insertAdjacentHTML('beforeend', getInvoiceItemTemplate(itemCount));
    const newItem = document.querySelector(`.invoice-item[data-id="${itemCount}"]`);
    addProductListeners(newItem);
    updateTotals();
}

// Enviar factura
async function submitInvoice() {
    if (isSubmitting) return; // Si ya se está enviando, salir
    isSubmitting = true; // Marcar como en proceso

    const customerCedula = document.getElementById('newCustomerCedula').value.trim();
    const address = document.getElementById('shippingAddress').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const notes = document.getElementById('notes').value.trim();

    // Buscar cliente por cédula
    let customerId;
    try {
        const response = await fetch(`/api/clientes/cedula/${customerCedula}`);
        if (!response.ok) throw new Error('Cliente no encontrado');
        const cliente = await response.json();
        customerId = cliente.id_cliente; // Extraer el ID del cliente
    } catch (error) {
        alert('Error al buscar el cliente: ' + error.message);
        isSubmitting = false; // Restablecer la bandera
        return; // Salir si no se encuentra el cliente
    }

    // Recoger detalles de la factura
    const detalles = Array.from(document.querySelectorAll('.invoice-item')).map(item => ({
        id_libro: item.querySelector('.item-description').value,
        cantidad: parseFloat(item.querySelector('.item-quantity').value) || 0,
        precio_unitario: parseFloat(item.querySelector('.item-price').textContent.replace('$', '')) || 0
    }));

    // Crear objeto de factura
    const invoiceData = {
        cliente: {
            id_cliente: customerId,
            cedula: customerCedula,
            direccion: address
        },
        factura: {
            fecha: new Date().toISOString().split('T')[0],
            descuento: 0,
            impuesto: IVA_PORCENTAJE,
            metodo_pago: paymentMethod,
            notas: notes
        },
        detalles: detalles
    };

    try {
        // Enviar la factura a la API
        const response = await fetch('/api/factura', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });

        if (!response.ok) {
            throw new Error('Error al crear la factura');
        }

        const result = await response.json();
        alert('Factura creada exitosamente con ID: ' + result.id_factura);
        resetForm(); // Limpiar el formulario después de agregar la factura

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        isSubmitting = false; // Restablecer la bandera al final
    }
}




let isSubmitting = false; // Bandera para evitar envíos múltiples

document.getElementById('facturaForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevenir el envío del formulario
    submitInvoice();    // Llamar a la función para enviar la factura
});


function validarCedula(cedula) {
    // Verificar que la cédula tenga exactamente 10 dígitos
    if (cedula.length !== 10 || isNaN(cedula)) {
        return false;
    }

    // Convertir la cédula a un número
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
        return false; // La provincia debe estar entre 1 y 24
    }

    // Cálculo del dígito de verificación
    const digitos = cedula.split('').map(Number);
    const suma = digitos.slice(0, 9).reduce((acc, val, index) => {
        // Aplicar el algoritmo de validación
        if (index % 2 === 0) { // Posiciones impares (0, 2, 4, 6, 8)
            val *= 2;
            if (val > 9) val -= 9; // Si el resultado es mayor a 9, restar 9
        }
        return acc + val;
    }, 0);

    const digitoVerificacion = (10 - (suma % 10)) % 10; // Cálculo del dígito de verificación
    return digitoVerificacion === digitos[9]; // Comparar con el dígito de verificación de la cédula
}

function validarEmail(email) {
    // Verificar que el email no esté vacío y que contenga @
    if (!email || !email.includes('@')) {
        return false;
    }
    return true;
}

// Función para formatear automáticamente números ecuatorianos
function formatearTelefono(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Formatear números ecuatorianos
    if (value.startsWith('09') && value.length <= 10) {
        if (value.length > 2) {
            input.value = value.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
        } else {
            input.value = value;
        }
    } 
    // No formatear números extranjeros (permitir +)
    else if (value.startsWith('+')) {
        input.value = value;
    }
}
// Asignar evento de formateo
document.getElementById('newCustomerPhone').addEventListener('input', function() {
    formatearTelefono(this);
});

function validarExistenciaNumeroEcuatoriano(telefono) {
    // Limpiar y verificar formato básico
    telefono = telefono.replace(/\D/g, '');
    if (!/^09\d{8}$/.test(telefono)) return false;
    // Extraer dígitos importantes
    const segundoDigito = telefono.charAt(1);
    const tercerDigito = telefono.charAt(2);
    
    // Validar según operadora
    if (segundoDigito >= '0' && segundoDigito <= '4') {
        // Movistar
        return true;
    } else if (segundoDigito >= '5' && segundoDigito <= '8') {
        // Claro
        return true;
    } else if (segundoDigito === '9') {
        if (tercerDigito === '8') {
            // CNT
            return true;
        } else if (tercerDigito === '9') {
            // Tuenti
            return true;
        }
    }
    
    return false;
}

async function validarTelefonoCompleto(telefono) {
    // Limpieza inicial
    telefono = telefono.replace(/\D/g, '');
    
    // Verificar si es número extranjero
    if (telefono.startsWith('593') && telefono.length === 12) {
        telefono = '0' + telefono.substring(3); // Convertir +593 a formato local
    }
    
    // Validar formato ecuatoriano
    if (!validarExistenciaNumeroEcuatoriano(telefono)) {
        return false;
    }
    
    // (Opcional) Verificación con API de operadora
    try {
        const response = await fetch(`https://api.operadora.com/validar/${telefono}`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.activo === true;
    } catch (error) {
        console.error("Error al verificar número", error);
        // Si falla la API, confiar en la validación de formato
        return true;
    }
}