// Variables globales
let itemCount = 0;
const IVA_PORCENTAJE = 15; // Valor estático del impuesto

// Plantilla para un item de factura
function getInvoiceItemTemplate(id) {
    return `
        <div class="invoice-item" data-id="${id}">
            <div class="item-row">
                <div>
                    <input type="text" placeholder="Descripción" class="item-description">
                </div>
                <div>
                    <input type="number" placeholder="Cantidad" min="1" value="1" class="item-quantity">
                </div>
                <div>
                    <input type="number" placeholder="Precio" min="0" step="0.01" class="item-price">
                </div>
                <div>
                    <span class="item-total">$0.00</span>
                </div>
                <div>
                    <i class="fas fa-trash remove-item"></i>
                </div>
            </div>
        </div>
    `;
}

// Actualizar totales de la factura
function updateTotals() {
    let subtotal = 0;
    const items = document.querySelectorAll('.invoice-item');
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        const totalItem = quantity * price;
        subtotal += totalItem;
        item.querySelector('.item-total').textContent = '$' + totalItem.toFixed(2);
    });

    // Usa el IVA fijo y descuento fijo
    const taxRate = IVA_PORCENTAJE / 100;
    const discount = 0; // O usa una variable si tienes lógica para descuento
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;

    // Actualiza los <span>
    document.getElementById('subtotal').textContent = "$" + subtotal.toFixed(2);
    document.getElementById('tax').textContent = IVA_PORCENTAJE;
    document.getElementById('discount').textContent = "$" + discount.toFixed(2);
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
        const description = item.querySelector('.item-description').value || 'Artículo sin descripción';
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
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

    // Función genérica para validar campos vacíos o sin seleccionar
    function validarCampo(input, errorLabel, tipo = "texto") {
        let valor = input.value ? input.value.trim() : "";
        let mostrar = false;
        let mensaje = "Este campo no debe estar vacío";
        if (tipo === "select") {
            if (!valor) {
                mensaje = "Seleccione una opción";
                mostrar = true;
            }
        } else if (tipo === "radio") {
            const checked = document.querySelector('input[name="' + input.name + '"]:checked');
            if (!checked) {
                mensaje = "Seleccione una opción";
                mostrar = true;
            }
        } else {
            if (!valor) {
                mostrar = true;
            }
        }
        errorLabel.textContent = mostrar ? mensaje : "";
        errorLabel.style.display = mostrar ? "block" : "none";

        // Resaltar campo con error
        if (tipo === "radio") {
            document.querySelectorAll('input[name="' + input.name + '"]').forEach(radio => {
                if (mostrar) {
                    radio.classList.add('input-error');
                } else {
                    radio.classList.remove('input-error');
                }
            });
        } else {
            if (mostrar) {
                input.classList.add('input-error');
            } else {
                input.classList.remove('input-error');
            }
        }
        return !mostrar;
    }

    form.addEventListener('submit', function(e) {
        let valido = true;

        // Limpiar todos los mensajes de error y resaltados
        document.querySelectorAll('.error-message').forEach(div => {
            div.textContent = '';
            div.style.display = 'none';
        });
        document.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
        });

        // Cliente
        const cliente = document.getElementById('customer');
        const errorCliente = document.getElementById('error-customer');
        if (!validarCampo(cliente, errorCliente, "select")) {
            cliente.classList.add('input-error');
            valido = false;
        } else {
            cliente.classList.remove('input-error');
        }

        // Nuevo cliente (siempre visible)
        const nombre = document.getElementById('newCustomerName');
        const errorNombre = document.getElementById('error-newCustomerName');
        if (!validarCampo(nombre, errorNombre)) valido = false;

        const email = document.getElementById('newCustomerEmail');
        const errorEmail = document.getElementById('error-newCustomerEmail');
        if (!validarCampo(email, errorEmail)) valido = false;

        const telefono = document.getElementById('newCustomerPhone');
        const errorTelefono = document.getElementById('error-newCustomerPhone');
        if (!validarCampo(telefono, errorTelefono)) valido = false;

        // Dirección
        const direccion = document.getElementById('shippingAddress');
        const errorDireccion = document.getElementById('error-shippingAddress');
        if (!validarCampo(direccion, errorDireccion)) valido = false;

        // Método de pago
        const metodoPago = document.querySelector('input[name="paymentMethod"]');
        const errorMetodo = document.getElementById('error-paymentMethod');
        if (!validarCampo(metodoPago, errorMetodo, "radio")) valido = false;

        // Validar que haya al menos 1 artículo
        const invoiceItems = document.querySelectorAll('.invoice-item');
        const errorInvoiceItems = document.getElementById('error-invoiceItems');
        if (invoiceItems.length === 0) {
            errorInvoiceItems.textContent = "Agregue al menos 1 artículo";
            errorInvoiceItems.style.display = "block";
            valido = false;
        } else {
            errorInvoiceItems.textContent = "";
            errorInvoiceItems.style.display = "none";
        }

        if (!valido) {
            e.preventDefault();
            return;
        }

        // Si todo es válido, mostrar mensaje de éxito y limpiar todo
        e.preventDefault();
        alert('Factura generada exitosamente');

        // Limpiar campos del formulario
        form.reset();

        // Limpiar campos manualmente si reset no los cubre
        document.getElementById('customer').value = '';
        document.getElementById('newCustomerName').value = '';
        document.getElementById('newCustomerEmail').value = '';
        document.getElementById('newCustomerPhone').value = '';
        document.getElementById('shippingAddress').value = '';
        document.getElementById('notes').value = '';
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => radio.checked = false);

        // Limpiar lista de artículos
        document.getElementById('invoiceItems').innerHTML = '';
        itemCount = 0;
        // document.getElementById('addItemBtn').click(); // Elimina o comenta esta línea si no quieres ningún ítem al limpiar

        // Limpiar totales
        document.getElementById('subtotal').textContent = "$0.00";
        document.getElementById('tax').textContent = IVA_PORCENTAJE;
        document.getElementById('discount').textContent = "$0.00";
        document.getElementById('total').textContent = "$0.00";

        // Limpiar vista previa
        document.querySelector('.preview-content').innerHTML = '';

        // Ocultar vista previa si está visible
        const preview = document.getElementById('previewContainer');
        if (!preview.classList.contains('hidden')) {
            preview.classList.add('hidden');
            document.querySelector('.factura-content').classList.remove('solo-form');
            // Cambiar icono del botón si es necesario
            const icon = document.querySelector('#togglePreview i');
            if (icon) {
                icon.classList.add('fa-eye');
                icon.classList.remove('fa-eye-slash');
            }
        }
    });

    // Opcional: Ocultar mensajes al escribir o seleccionar
    function ocultarErrorAlCambiar(input, errorLabel, tipo = "texto") {
        if (tipo === "radio") {
            document.querySelectorAll('input[name="' + input.name + '"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    errorLabel.style.display = "none";
                    radio.classList.remove('input-error');
                });
            });
        } else {
            input.addEventListener('input', () => {
                errorLabel.style.display = "none";
                input.classList.remove('input-error');
            });
        }
    }

    ocultarErrorAlCambiar(document.getElementById('customer'), document.getElementById('error-customer'), "select");
    if (document.getElementById('newCustomerName')) ocultarErrorAlCambiar(document.getElementById('newCustomerName'), document.getElementById('error-newCustomerName'));
    if (document.getElementById('newCustomerEmail')) ocultarErrorAlCambiar(document.getElementById('newCustomerEmail'), document.getElementById('error-newCustomerEmail'));
    if (document.getElementById('newCustomerPhone')) ocultarErrorAlCambiar(document.getElementById('newCustomerPhone'), document.getElementById('error-newCustomerPhone'));
    ocultarErrorAlCambiar(document.getElementById('shippingAddress'), document.getElementById('error-shippingAddress'));
    ocultarErrorAlCambiar(document.querySelector('input[name="paymentMethod"]'), document.getElementById('error-paymentMethod'), "radio");
    
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
    
    // Alternar campos de nuevo cliente
    document.getElementById('toggleNewCustomer').addEventListener('click', function() {
        const fields = document.getElementById('newCustomerFields');
        const isHidden = fields.classList.toggle('hidden');
        this.querySelector('i').classList.toggle('fa-plus');
        this.querySelector('i').classList.toggle('fa-minus');

        // Limpiar errores y valores al ocultar
        if (isHidden) {
            document.getElementById('newCustomerName').value = '';
            document.getElementById('newCustomerEmail').value = '';
            document.getElementById('newCustomerPhone').value = '';
            document.getElementById('error-newCustomerName').textContent = '';
            document.getElementById('error-newCustomerEmail').textContent = '';
            document.getElementById('error-newCustomerPhone').textContent = '';
        }
    });
    
    // Alternar vista previa
    document.getElementById('togglePreview').addEventListener('click', function() {
        const preview = document.getElementById('previewContainer');
        const content = document.querySelector('.factura-content');
        preview.classList.toggle('hidden');
        content.classList.toggle('solo-form');
        // Opcional: Cambia el icono del botón
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    // Enviar formulario
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Factura generada con éxito');
        // Aquí iría la lógica para enviar la factura
    });

    updatePreview();
});

// Llama a esta función después de agregar un nuevo producto
function addProductListeners(itemRow) {
    itemRow.querySelector('.item-quantity').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-price').addEventListener('input', updateTotals);
    itemRow.querySelector('.item-description').addEventListener('input', updateTotals);
}

// Si ya tienes una función para agregar productos dinámicamente, llama a addProductListeners(itemRow) después de agregar el producto

// Para los productos ya existentes al cargar la página:
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.invoice-item').forEach(addProductListeners);
});

// Botón cancelar: limpiar todo el formulario, artículos, totales y vista previa
document.querySelector('.btn-secondary').addEventListener('click', function(e) {
    e.preventDefault();

    // Limpiar campos del formulario
    form.reset();

    // Limpiar campos manualmente si reset no los cubre
    document.getElementById('customer').value = '';
    document.getElementById('newCustomerName').value = '';
    document.getElementById('newCustomerEmail').value = '';
    document.getElementById('newCustomerPhone').value = '';
    document.getElementById('shippingAddress').value = '';
    document.getElementById('notes').value = '';
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => radio.checked = false);

    // Limpiar lista de artículos
    document.getElementById('invoiceItems').innerHTML = '';
    itemCount = 0;

    // Limpiar totales
    document.getElementById('subtotal').textContent = "$0.00";
    document.getElementById('tax').textContent = IVA_PORCENTAJE;
    document.getElementById('discount').textContent = "$0.00";
    document.getElementById('total').textContent = "$0.00";

    // Limpiar vista previa
    document.querySelector('.preview-content').innerHTML = '';

    // Ocultar vista previa si está visible
    const preview = document.getElementById('previewContainer');
    if (!preview.classList.contains('hidden')) {
        preview.classList.add('hidden');
        document.querySelector('.factura-content').classList.remove('solo-form');
        const icon = document.querySelector('#togglePreview i');
        if (icon) {
            icon.classList.add('fa-eye');
            icon.classList.remove('fa-eye-slash');
        }
    }

    // Limpiar mensajes de error y resaltados
    document.querySelectorAll('.error-message').forEach(div => {
        div.textContent = '';
        div.style.display = 'none';
    });
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
    });
});
