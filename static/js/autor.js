$(document).ready(function() {
    const $formContainer = $('#form-container');
    const $tablaAutores = $('#tabla-autores');
    const $btnCrear = $('#btn-crear-autor');
    const $btnCancelar = $('#btn-cancelar');
    const $formAutor = $('#form-autor');
    const $idDisplay = $('#id_autor');
    const $inputId = $('#input_id_autor');
    const $nombre = $('#nombre');
    const $correo = $('#correo');

    // Mostrar formulario vacío para crear nuevo autor
    $btnCrear.click(function() {
        $formAutor[0].reset();
        $idDisplay.text('{{ nuevo_id }}');
        $inputId.val('');
        $formContainer.show();
        $tablaAutores.hide();
    });

    // Cancelar creación/edición
    $btnCancelar.click(function() {
        $formContainer.hide();
        $tablaAutores.show();
        clearErrors();
    });

    // Editar autor - llena formulario con datos y muestra
    $('.editar-autor').click(function(e) {
        e.preventDefault();

        const id = $(this).data('id');
        const nombre = $(this).data('nombre');
        const correo = $(this).data('correo');

        $idDisplay.text(id);
        $inputId.val(id);
        $nombre.val(nombre);
        $correo.val(correo);

        $formContainer.show();
        $tablaAutores.hide();
        clearErrors();
    });

    function clearErrors() {
        $('#error-nombre').text('');
        $('#error-correo').text('');
    }
});

document.getElementById('busqueda-autor').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('form-busqueda').submit();
  }
});