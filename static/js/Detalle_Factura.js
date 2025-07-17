document.addEventListener('DOMContentLoaded', () => {
    if (typeof FACTURA_ID === 'undefined' || FACTURA_ID === null) {
        console.error("FACTURA_ID no está definido o es nulo.");
        alert("ID de factura inválido. Recarga la página.");
        return;
    }

    const apiUrl = `/api/factura/${FACTURA_ID}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Factura no encontrada.");
                }
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then(facturaData => {
            mostrarFactura(facturaData);
        })
        .catch(error => {
            console.error(error);
            resetFacturaDisplay(error.message);
        });
});

function mostrarFactura(facturaData) {
    document.getElementById('factura-numero').innerText = facturaData.id_factura || 'N/A';
    document.getElementById('factura-fecha').innerText = facturaData.fecha ? new Date(facturaData.fecha).toLocaleDateString() : 'N/A';
    document.getElementById('cliente-nombre').innerText = facturaData.cliente || 'N/A';
    document.getElementById('cliente-direccion').innerText = facturaData.direccion || 'N/A';
    document.getElementById('metodo-pago').innerText = facturaData.metodo_pago || 'N/A';
    document.getElementById('factura-notas').innerText = facturaData.notas || 'Sin notas';

    const detallesBody = document.getElementById('detalles-factura-body');
    detallesBody.innerHTML = '';

    if (facturaData.detalles && facturaData.detalles.length > 0) {
        let subtotalCalculado = 0;
        facturaData.detalles.forEach(detalle => {
            const totalLinea = (detalle.cantidad || 0) * (detalle.precio_unitario || 0);
            subtotalCalculado += totalLinea;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${detalle.descripcion || 'N/A'}</td>
                <td>${detalle.cantidad || 0}</td>
                <td>$ ${parseFloat(detalle.precio_unitario || 0).toFixed(2)}</td>
                <td>$ ${totalLinea.toFixed(2)}</td>
            `;
            detallesBody.appendChild(row);
        });

        const impuesto = parseFloat(facturaData.impuesto || 0);
        const descuento = parseFloat(facturaData.descuento || 0);
        const subtotalFinal = parseFloat(facturaData.subtotal) || subtotalCalculado;
        const totalFinal = (subtotalFinal - descuento) + impuesto;

        document.getElementById('detalle-subtotal').innerText = `$ ${subtotalFinal.toFixed(2)}`;
        document.getElementById('detalle-impuesto').innerText = `$ ${impuesto.toFixed(2)}`;
        document.getElementById('detalle-descuento').innerText = `$ ${descuento.toFixed(2)}`;
        document.getElementById('detalle-total-final').innerText = `$ ${totalFinal.toFixed(2)}`;
    } else {
        detallesBody.innerHTML = `<tr><td colspan="4">No hay detalles de libros para esta factura.</td></tr>`;
        document.getElementById('detalle-subtotal').innerText = '$ 0.00';
        document.getElementById('detalle-impuesto').innerText = '$ 0.00';
        document.getElementById('detalle-descuento').innerText = '$ 0.00';
        document.getElementById('detalle-total-final').innerText = '$ 0.00';
    }
}

function resetFacturaDisplay(msg) {
    document.getElementById('factura-numero').innerText = '';
    document.getElementById('factura-fecha').innerText = '';
    document.getElementById('cliente-nombre').innerText = '';
    document.getElementById('cliente-direccion').innerText = '';
    document.getElementById('metodo-pago').innerText = '';
    document.getElementById('factura-notas').innerText = '';
    document.getElementById('detalles-factura-body').innerHTML = `<tr><td colspan="4">${msg}</td></tr>`;
    document.getElementById('detalle-subtotal').innerText = '$ 0.00';
    document.getElementById('detalle-impuesto').innerText = '$ 0.00';
    document.getElementById('detalle-descuento').innerText = '$ 0.00';
    document.getElementById('detalle-total-final').innerText = '$ 0.00';
}
