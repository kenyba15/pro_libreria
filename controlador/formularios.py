from flask import Blueprint, render_template, request, redirect, url_for
from modelo.autorDAO import obtener_autores, insertar_autor, actualizar_autor, eliminar_autor, obtener_autor_por_id
from modelo.editorialDAO import obtener_editoriales, insertar_editorial, actualizar_editorial, eliminar_editorial, obtener_editorial_por_id
from modelo.libroDAO import obtener_libros, insertar_libro, actualizar_libro, eliminar_libro, obtener_libro_por_id, insertar_autores_libro, actualizar_autores_libro

form_bp = Blueprint('form_bp', __name__)

@form_bp.route('/')
def inicio():
    return render_template('inicio.html')


@form_bp.route('/autor', methods=['GET', 'POST'])
def autor():
    if request.method == 'POST':
        id_autor = request.form.get('id_autor')
        nombre = request.form.get('nombre')
        correo = request.form.get('correo')
        if id_autor:  # Editar
            actualizar_autor(id_autor, nombre, correo)
        else:  # Nuevo
            insertar_autor(nombre, correo)
        return redirect(url_for('form_bp.autor'))

    autores = obtener_autores()
    return render_template('autor.html', autores=autores)

@form_bp.route('/autor/editar/<int:id_autor>')
def editar_autor(id_autor):
    autor = obtener_autor_por_id(id_autor)
    autores = obtener_autores()
    return render_template('autor.html', autor=autor, autores=autores)

@form_bp.route('/autor/eliminar/<int:id_autor>')
def eliminar_autor_ruta(id_autor):
    eliminar_autor(id_autor)
    return redirect(url_for('form_bp.autor'))

@form_bp.route('/libro', methods=['GET', 'POST'])
def libro():
    if request.method == 'POST':
        id_libro = request.form.get('id_libro')
        titulo = request.form.get('titulo')
        isbn = request.form.get('isbn')
        editorial = request.form.get('editorial')
        autores = request.form.getlist('autor')  # Aquí recibes lista (multiple)
        idioma = request.form.get('idioma')
        genero = request.form.get('genero')
        edicion = request.form.get('edicion')
        formato = request.form.get('formato')
        best_seller = 1 if request.form['bestSeller'] == 'true' else 0


        if id_libro:  # Editar
            actualizar_libro(id_libro, titulo, isbn, editorial, idioma, genero, edicion, formato, best_seller)
            actualizar_autores_libro(id_libro, autores)
        else:  # Nuevo
            nuevo_id = insertar_libro(titulo, isbn, editorial, idioma, genero, edicion, formato, best_seller)
            insertar_autores_libro(nuevo_id, autores)

        return redirect(url_for('form_bp.libro'))

    libros = obtener_libros()
    editoriales = obtener_editoriales()
    autores = obtener_autores()
    return render_template('libro.html', libros=libros, editoriales=editoriales, autores=autores)


@form_bp.route('/libro/eliminar/<int:id_libro>')
def eliminar_libro_ruta(id_libro):
    eliminar_libro(id_libro)
    return redirect(url_for('form_bp.libro'))

@form_bp.route('/editorial', methods=['GET', 'POST'])
def editorial():
    if request.method == 'POST':
        id_editorial = request.form.get('id_editorial')
        nombre = request.form.get('nombre')
        tipo = request.form.get('tipo')
        sitio_web = request.form.get('sitio_web')
        correo = request.form.get('correo')
        if id_editorial and id_editorial.strip() != '':
            actualizar_editorial(id_editorial, nombre, tipo, sitio_web, correo)
        else:  # Nuevo
            insertar_editorial(nombre, tipo, sitio_web, correo)
        return redirect(url_for('form_bp.editorial'))

    editoriales = obtener_editoriales()
    return render_template('editorial.html', editoriales=editoriales)

@form_bp.route('/editorial/editar/<int:id_editorial>')
def editar_editorial(id_editorial):
    editorial = obtener_editorial_por_id(id_editorial)
    editoriales = obtener_editoriales()
    return render_template('editorial.html', editorial=editorial, editoriales=editoriales)

@form_bp.route('/editorial/eliminar/<int:id_editorial>')
def eliminar_editorial_ruta(id_editorial):
    eliminar_editorial(id_editorial)
    return redirect(url_for('form_bp.editorial'))

@form_bp.route('/uiFactura')
def ui_factura():
    return render_template('uiFactura.html')

@form_bp.route('/Detalle_Factura')
def detalle_f():
    return render_template('Detalle_Factura.html')
