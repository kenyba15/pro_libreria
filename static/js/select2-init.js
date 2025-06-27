$(document).ready(function() {
    $('.select-search').select2({
        placeholder: "Seleccione una opción",
        allowClear: false
    });

    // Disparar evento de cambio para integración con validación
    $('.select-search').on('change', function(e) {
        // Disparar evento nativo para que nuestra validación lo capture
        const event = new Event('change', {
            bubbles: true,
            cancelable: true
        });
        this.dispatchEvent(event);
    });
});