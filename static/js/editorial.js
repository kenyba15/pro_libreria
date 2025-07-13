$(document).ready(function() {
    const $formContainer = $('#form-container-editorial');
    const $tablaEditoriales = $('#tabla-editoriales');
    const $btnCrear = $('#btn-crear-editorial');
    const $btnCancelar = $('#btn-cancelar-editorial');
    const $formEditorial = $('#form-editorial');

    // Mostrar formulario vacío para crear nueva editorial
    $btnCrear.click(function() {
        $formEditorial[0].reset();
        $('#input_id_editorial').val('');
        $formContainer.show();
        $tablaEditoriales.hide();
        clearErrors();
    });

    // Cancelar creación/edición
    $btnCancelar.click(function() {
        $formContainer.hide();
        $tablaEditoriales.show();
        clearErrors();
    });

    // Editar editorial (llenar formulario y mostrar)
    $('.editar-editorial').click(function(e) {
        e.preventDefault();

        const id = $(this).data('id');
        const nombre = $(this).data('nombre');
        const tipo = $(this).data('tipo');
        const sitio_web = $(this).data('sitio_web');
        const correo = $(this).data('correo');

        $('#input_id_editorial').val(id);
        $('#nombre').val(nombre);
        $('#tipo').val(tipo);
        $('#sitio_web').val(sitio_web);
        $('#correo').val(correo);

        $formContainer.show();
        $tablaEditoriales.hide();
        clearErrors();
    });

    function clearErrors() {
        $('#error-nombre').text('');
        $('#error-tipo').text('');
        $('#error-sitio_web').text('');
        $('#error-correo').text('');
    }
});

document.getElementById('busqueda-editorial').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('form-busqueda').submit();
  }
});