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
    const taxRate = IVA_PORCENTAJE / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    document.getElementById('subtotal').textContent = "$" + subtotal.toFixed(2);
    document.getElementById('tax').textContent = IVA_PORCENTAJE;
    document.getElementById('total').textContent = "$" + total.toFixed(2);
    updatePreview();
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

// Enviar factura
async function submitInvoice() {
    const customerSelect = document.getElementById('customer');
    const customerId = customerSelect.value;
    const customerName = customerSelect.options[customerSelect.selectedIndex].text;
    const address = document.getElementById('shippingAddress').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const notes = document.getElementById('notes').value;

    const invoiceData = {
        cliente: {
            nombre: customerName,
            email: document.getElementById('newCustomerEmail').value,
            telefono: document.getElementById('newCustomerPhone').value,
            direccion: address,
            cedula: document.getElementById('newCustomerCedula').value
        },
        factura: {
            fecha: new Date().toISOString().split('T')[0],
            descuento: 0,
            impuesto: IVA_PORCENTAJE,
            metodo_pago: paymentMethod,
            notas: notes
        },
        detalles: Array.from(document.querySelectorAll('.invoice-item')).map(item => ({
            id_libro: item.querySelector('.item-description').value, // Cambia esto según tu lógica
            cantidad: parseFloat(item.querySelector('.item-quantity').value) || 0,
            precio_unitario: parseFloat(item.querySelector('.item-price').value) || 0
        }))
    };

    try {
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
        showMessage('Factura creada exitosamente con ID: ' + result.id_factura);
        resetForm();
    } catch (error) {
        showMessage('Error: ' + error.message);
    }
}

// Mostrar mensajes en la interfaz
function showMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
}

// Limpiar el formulario
function resetForm() {
    document.getElementById('facturaForm').reset();
    document.getElementById('invoiceItems').innerHTML = '';
    itemCount = 0;
    updateTotals();
    document.querySelector('.preview-content').innerHTML = '';
}

// Validar que el cliente esté seleccionado o que los datos del nuevo cliente sean válidos
function validarClienteSeleccionado(cliente, camposNuevoCliente) {
    if (!cliente && !camposNuevoCliente) {
        return "Debe seleccionar un cliente o ingresar los datos de un nuevo cliente.";
    }
    return "";
}

function validarNuevoCliente(nombre, email) {
    const errores = [];
    if (!nombre || nombre.trim() === "") {
        errores.push("El nombre del nuevo cliente es obligatorio.");
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
        errores.push("El nombre del cliente solo puede contener letras y espacios.");
    }
    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errores.push("El correo electrónico del cliente no es válido.");
    }
    return errores;
}

// Validar dirección de envío
function validarDireccion(direccion) {
    if (!direccion || direccion.trim() === "") {
        return "La dirección es obligatoria.";
    }
    return "";
}

// Validar que haya al menos un artículo
function validarArticulos(articulos) {
    if (!articulos || articulos.length === 0) {
        return "Debe agregar al menos un artículo a la factura.";
    }
    return "";
}

// Validar cada artículo (nombre, cantidad, precio)
function validarArticulo(item) {
    const errores = [];
    if (!item.nombre || item.nombre.trim() === "") {
        errores.push("El nombre del artículo es obligatorio.");
    }
    if (!item.cantidad || isNaN(item.cantidad) || Number(item.cantidad) <= 0) {
        errores.push("La cantidad del artículo debe ser un número positivo.");
    }
    if (!item.precio || isNaN(item.precio) || Number(item.precio) <= 0) {
        errores.push("El precio del artículo debe ser un número positivo.");
    }
    return errores;
}

// Validar método de pago
function validarMetodoPago(metodo) {
    if (!metodo) {
        return "Debe seleccionar un método de pago.";
    }
    return "";
}

// Inicializar la factura
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('facturaForm');

    // Asigna el valor del impuesto al campo correspondiente
    document.getElementById('tax').value = IVA_PORCENTAJE;

    // Agregar un ítem inicial
    document.getElementById('addItemBtn').click();

    // Event listeners para los controles
    document.getElementById('customer').addEventListener('change', updatePreview);
    document.getElementById('shippingAddress').addEventListener('input', updatePreview);
    document.getElementById('notes').addEventListener('input', updatePreview);
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });

    // Agregar ítem
    document.getElementById('addItemBtn').addEventListener('click', function() {
        itemCount++;
        document.getElementById('invoiceItems').insertAdjacentHTML('beforeend', getInvoiceItemTemplate(itemCount));
        const newItem = document.querySelector(`.invoice-item[data-id="${itemCount}"]`);
        addProductListeners(newItem);
        updateTotals();
    });

    // Eliminar ítem (usando delegación de eventos)
    document.getElementById('invoiceItems').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            e.target.closest('.invoice-item').remove();
            updateTotals();
        }
    });

    // Enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitInvoice();
    });

    // Inicializar la vista previa
    updatePreview();
});

// Llama a esta función después de agregar un nuevo producto
function addProductListeners(itemRow) {
    itemRow.querySelector('.item-quantity').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-price').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-description').addEventListener('input', updateTotals);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar libros disponibles
    await cargarLibros();
    
    // Configurar el formulario
    const form = document.getElementById('facturaForm');
    document.getElementById('tax').value = IVA_PORCENTAJE;

    // Event listeners para los controles
    document.getElementById('customer').addEventListener('change', updatePreview);
    document.getElementById('shippingAddress').addEventListener('input', updatePreview);
    document.getElementById('notes').addEventListener('input', updatePreview);
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });

    // Eliminar ítem (usando delegación de eventos)
    document.getElementById('invoiceItems').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            e.target.closest('.invoice-item').remove();
            updateTotals();
        }
    });

    // Enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitInvoice();
    });

    // Inicializar vista previa
    updatePreview();
});

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
    } 
    else if (selectedOption.text === 'Datos') {
        // Limpiar y habilitar campos cuando se selecciona "Datos"
        ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress', 'newCustomerCedula'].forEach(id => {
            const field = document.getElementById(id);
            field.value = '';  // Limpiar el valor
        });
        document.getElementById('newCustomerCedula').disabled = false; // Aseg
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
    }

    if (!telefono) {
        errorTelefono.textContent = 'Se debe ingresar datos';
        errorTelefono.style.display = 'block';
        valid = false;
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
    } else if (cedula.length !== 10) {
        errorCedula.textContent = 'La cédula debe tener 10 dígitos';
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
        showMessage('Cliente agregado exitosamente con ID: ' + result.id_cliente);
        resetForm(); // Limpiar el formulario después de agregar el cliente

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message);
    }
});

function resetForm() {
    // Limpiar los campos
    document.getElementById('newCustomerName').value = '';
    document.getElementById('newCustomerEmail').value = '';
    document.getElementById('newCustomerPhone').value = '';
    document.getElementById('shippingAddress').value = '';
    document.getElementById('newCustomerCedula').value = '';

    // Habilitar el campo de cédula
    document.getElementById('newCustomerCedula').disabled = false;

    // Deshabilitar los demás campos
    ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
        document.getElementById(id).disabled = true;
    });

    // Limpiar mensajes de error
    ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress', 'newCustomerCedula'].forEach(id => {
        const errorMessageContainer = document.getElementById('error-' + id.replace('newCustomer', '').toLowerCase());
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
    });
}
document.querySelector('.btn-secondary').addEventListener('click', function() {
    // Limpiar todos los campos
    document.getElementById('newCustomerName').value = '';
    document.getElementById('newCustomerEmail').value = '';
    document.getElementById('newCustomerPhone').value = '';
    document.getElementById('shippingAddress').value = '';
    document.getElementById('newCustomerCedula').value = '';

    // Deshabilitar todos los campos excepto el de cédula
    ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress'].forEach(id => {
        document.getElementById(id).disabled = true;
    });
    document.getElementById('newCustomerCedula').disabled = false; // Habilitar solo cédula

    // Restablecer el combobox a su posición inicial
    document.getElementById('customer').selectedIndex = 0;

    // Eliminar todos los artículos
    document.getElementById('invoiceItems').innerHTML = '';

    // Desmarcar todos los radio buttons
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.checked = false;
    });

    // Limpiar mensajes de error
    ['newCustomerName', 'newCustomerEmail', 'newCustomerPhone', 'shippingAddress', 'newCustomerCedula'].forEach(id => {
        const errorMessageContainer = document.getElementById('error-' + id.replace('newCustomer', '').toLowerCase());
        errorMessageContainer.style.display = 'none';
        errorMessageContainer.textContent = '';
    });

    // Resetear los spans de subtotal y total
    document.getElementById('subtotal').textContent = '$0.00';
    document.getElementById('total').textContent = '$0.00';
});

async function submitInvoice() {
    const customerSelect = document.getElementById('customer');
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
        showMessage('Error al buscar el cliente: ' + error.message);
        return; // Salir si no se encuentra el cliente
    }

    // Recoger detalles de la factura
    const detalles = Array.from(document.querySelectorAll('.invoice-item')).map(item => ({
        id_libro: item.querySelector('.item-description').value, // ID del libro
        cantidad: parseFloat(item.querySelector('.item-quantity').value) || 0,
        precio_unitario: parseFloat(item.querySelector('.item-price').textContent.replace('$', '')) || 0
    }));

    // Recoger otros datos
    const descuento = 0; // Puedes modificar esto si tienes un campo de descuento
    const impuesto = IVA_PORCENTAJE; // Usar el porcentaje de IVA definido
    const fecha = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

    const invoiceData = {
        cliente: {
            id_cliente: customerId,
            cedula: customerCedula,
            direccion: address
        },
        factura: {
            fecha: fecha,
            descuento: descuento,
            impuesto: impuesto,
            metodo_pago: paymentMethod,
            notas: notes
        },
        detalles: detalles
    };

    try {
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
        showMessage('Factura creada exitosamente con ID: ' + result.id_factura);
        resetForm(); // Limpiar el formulario después de agregar la factura

    } catch (error) {
        showMessage('Error: ' + error.message);
    }
}
