// Variables globales
let itemCount = 0;

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
        
        const total = quantity * price;
        subtotal += total;
        
        // Actualizar total del ítem
        item.querySelector('.item-total').textContent = '$' + total.toFixed(2);
    });
    
    const taxRate = parseFloat(document.getElementById('tax').value) / 100 || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;
    
    // Actualizar totales generales
    document.getElementById('subtotal').value = '$' + subtotal.toFixed(2);
    document.getElementById('total').value = '$' + total.toFixed(2);
    
    // Actualizar vista previa
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

// Guardar como borrador
function saveAsDraft() {
    alert('Factura guardada como borrador');
    // Aquí iría la lógica para guardar en base de datos/localStorage
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
    form.addEventListener('submit', function(e) {
        let hayErrores = false;

        // Limpiar mensajes previos
        document.querySelectorAll('.error-message').forEach(div => div.textContent = '');

        // Validar cliente
        const customer = document.getElementById('customer').value;
        const newCustomerFields = document.getElementById('newCustomerFields');
        if (newCustomerFields && !newCustomerFields.classList.contains('hidden')) {
            // Validar nuevo cliente
            const nombre = document.getElementById('newCustomerName').value;
            if (!nombre || nombre.trim() === "") {
                document.getElementById('error-newCustomerName').textContent = "El nombre del nuevo cliente es obligatorio.";
                hayErrores = true;
            }
        } else {
            if (!customer) {
                document.getElementById('error-customer').textContent = "Debe seleccionar un cliente.";
                hayErrores = true;
            }
        }

        // Validar dirección
        const direccion = document.getElementById('shippingAddress').value;
        if (!direccion || direccion.trim() === "") {
            document.getElementById('error-shippingAddress').textContent = "La dirección es obligatoria.";
            hayErrores = true;
        }

        // Validar método de pago
        const metodoPago = document.querySelector('input[name="paymentMethod"]:checked');
        if (!metodoPago) {
            document.getElementById('error-paymentMethod').textContent = "Debe seleccionar un método de pago.";
            hayErrores = true;
        }

        if (hayErrores) {
            e.preventDefault();
        }
    });
    
    // Agregar un ítem inicial
    document.getElementById('addItemBtn').click();
    
    // Event listeners para los controles
    document.getElementById('customer').addEventListener('change', updatePreview);
    document.getElementById('shippingAddress').addEventListener('input', updatePreview);
    document.getElementById('tax').addEventListener('input', updateTotals);
    document.getElementById('discount').addEventListener('input', updateTotals);
    document.getElementById('notes').addEventListener('input', updatePreview);
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });
    
    // Agregar ítem
    document.getElementById('addItemBtn').addEventListener('click', function() {
        itemCount++;
        document.getElementById('invoiceItems').insertAdjacentHTML('beforeend', getInvoiceItemTemplate(itemCount));
        updateTotals();
        
        // Agregar event listeners a los inputs del nuevo ítem
        const newItem = document.querySelector(`.invoice-item[data-id="${itemCount}"]`);
        newItem.querySelector('.item-quantity').addEventListener('input', updateTotals);
        newItem.querySelector('.item-price').addEventListener('input', updateTotals);
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
        document.getElementById('newCustomerFields').classList.toggle('hidden');
        this.querySelector('i').classList.toggle('fa-plus');
        this.querySelector('i').classList.toggle('fa-minus');
    });
    
    // Alternar vista previa
    document.getElementById('togglePreview').addEventListener('click', function() {
        document.getElementById('previewContainer').classList.toggle('hidden');
    });
    
    // Enviar formulario
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Factura generada con éxito');
        // Aquí iría la lógica para enviar la factura
    });
});
