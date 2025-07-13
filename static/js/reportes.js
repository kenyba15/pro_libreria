const form = document.getElementById('pdfForm');
const tipoSelect = document.getElementById('tipoPdf');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', function(e) {
    if (tipoSelect.value === '') {
        e.preventDefault();
        errorMsg.textContent = 'Por favor seleccione un tipo de reporte antes de generar el PDF.';
        errorMsg.style.display = 'block';
    }
});