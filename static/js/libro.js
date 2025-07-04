// libro.js

$(document).ready(function() {
  // Mostrar formulario vacío para crear libro
  $('#btn-crear-libro').click(function() {
      $('#form-libro')[0].reset();
      $('#input_id_libro').val('');
      $('#form-container-libro').show();
      $('#tabla-libros').hide();
      clearErrors();
  });

  // Cancelar creación/edición
  $('#btn-cancelar-libro').click(function() {
      $('#form-container-libro').hide();
      $('#tabla-libros').show();
      clearErrors();
  });

$('.editar-libro').click(function(e) {
    e.preventDefault();

    const id = $(this).data('id');
    const titulo = $(this).data('titulo');
    const isbn = $(this).data('isbn');
    const editorial = $(this).data('editorial');
    const autores = $(this).data('autores').toString().split(','); // lista ids
    const idioma = $(this).data('idioma');
    const genero = $(this).data('genero');
    const edicion = $(this).data('edicion');
    const formato = $(this).data('formato');
    const bestSeller = $(this).data('best_seller');

    $('#input_id_libro').val(id);
    $('#titulo').val(titulo);
    $('#isbn').val(isbn);
    $('#editorial').val(editorial);
    $('#idioma').val(idioma);
    $('#genero').val(genero);
    $('#edicion').val(edicion);
    $('input[name="formato"][value="' + formato + '"]').prop('checked', true);
    $('input[name="bestSeller"][value="' + bestSeller + '"]').prop('checked', true);

    // Limpiar y seleccionar autores
    $('#autor option').prop('selected', false);
    autores.forEach(function(id_autor) {
        $('#autor option[value="' + id_autor.trim() + '"]').prop('selected', true);
    });

    $('#form-container-libro').show();
    $('#tabla-libros').hide();
});


  function clearErrors() {
      $('.error-msg').text('');
  }
});
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.editar-libro').forEach(boton => {
        boton.addEventListener('click', function () {
            const idLibro = this.dataset.id;
            const titulo = this.dataset.titulo;
            const isbn = this.dataset.isbn;
            const editorial = this.dataset.editorial;
            const idioma = this.dataset.idioma;
            const genero = this.dataset.genero;
            const edicion = this.dataset.edicion;
            const formato = this.dataset.formato;
            const bestSeller = this.dataset.best_seller === 'True' ? 'true' : 'false';
            const autores = this.dataset.autores_ids ? this.dataset.autores_ids.split(',') : [];

            // Mostrar formulario
            document.getElementById('form-container').style.display = 'block';
            window.scrollTo(0, 0);

            // Llenar los campos
            document.getElementById('id_libro').value = idLibro;
            document.getElementById('titulo').value = titulo;
            document.getElementById('isbn').value = isbn;
            document.getElementById('editorial').value = editorial;
            document.getElementById('idioma').value = idioma;
            document.getElementById('genero').value = genero;
            document.getElementById('edicion').value = edicion;

            // Formato
            document.querySelectorAll('input[name="formato"]').forEach(radio => {
                radio.checked = radio.value === formato;
            });

            // Best seller
            document.querySelectorAll('input[name="bestSeller"]').forEach(radio => {
                radio.checked = radio.value === bestSeller;
            });

            // Autores (Select2)
            $('#autor').val(autores).trigger('change');
        });
    });
});
$(document).ready(function() {
    $('#autor').select2({ placeholder: 'Seleccione autor(es)' });

    $('#btn-crear-libro').click(function() {
        $('#form-libro')[0].reset();
        $('#input_id_libro').val('');
        $('#form-container-libro').show();
        $('#tabla-libros').hide();
        $('#autor').val(null).trigger('change');
    });

    $('#btn-cancelar-libro').click(function() {
        $('#form-container-libro').hide();
        $('#tabla-libros').show();
    });

    $('.editar-libro').click(function(e) {
        e.preventDefault();
        const data = $(this).data();

        $('#input_id_libro').val(data.id);
        $('#titulo').val(data.titulo);
        $('#isbn').val(data.isbn);
        $('#editorial').val(data.editorial);
        $('#idioma').val(data.idioma);
        $('#genero').val(data.genero);
        $('#edicion').val(data.edicion);
        $('input[name="formato"][value="' + data.formato + '"]').prop('checked', true);
        const bestSeller = data.best_seller ? "true" : "false";
        $('input[name="bestSeller"][value="' + bestSeller + '"]').prop('checked', true);


        // autores separados por coma
        let autoresArray = data.autores.toString().split(',');
        $('#autor').val(autoresArray).trigger('change');

        $('#form-container-libro').show();
        $('#tabla-libros').hide();
    });
});