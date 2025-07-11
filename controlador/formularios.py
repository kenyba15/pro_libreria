from flask import jsonify
from flask import Blueprint, render_template, request, redirect, url_for
from modelo.autorDAO import obtener_autores, insertar_autor, actualizar_autor, eliminar_autor, obtener_autor_por_id
from modelo.editorialDAO import obtener_editoriales, insertar_editorial, actualizar_editorial, eliminar_editorial, obtener_editorial_por_id
from modelo.libroDAO import obtener_libros, insertar_libro, actualizar_libro, eliminar_libro, obtener_libro_por_id, insertar_autores_libro, actualizar_autores_libro, obtener_libros_factura
from modelo.facturaDAO import insertar_cliente, insertar_factura, insertar_detalles_factura
from modelo.clienteDAO import insertar_cliente, obtener_clientes, actualizar_cliente, eliminar_cliente, buscar_cliente_por_cedula, obtener_cliente_por_id


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

    busqueda = request.args.get('busqueda', '')
    autores = obtener_autores(busqueda)
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
        autores = request.form.getlist('autor')
        idioma = request.form.get('idioma')
        genero = request.form.get('genero')
        edicion = request.form.get('edicion')
        formato = request.form.get('formato')
        precio = request.form.get('precio')
        best_seller = 1 if request.form['bestSeller'] == 'true' else 0

        if id_libro:
            actualizar_libro(id_libro, titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller)
            actualizar_autores_libro(id_libro, autores)
        else:
            nuevo_id = insertar_libro(titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller)
            insertar_autores_libro(nuevo_id, autores)

        return redirect(url_for('form_bp.libro'))

    busqueda = request.args.get('busqueda', '')  # texto a filtrar
    libros = obtener_libros(busqueda)
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

    busqueda = request.args.get('busqueda', '')
    editoriales = obtener_editoriales(busqueda)
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

@form_bp.route('/api/factura', methods=['POST'])
def api_factura():
    data = request.get_json()

    try:
        cliente_data = data['cliente']
        factura_data = data['factura']
        detalles = data['detalles']

        # 1. Insertar cliente
        id_cliente = insertar_cliente(
            cliente_data['nombre'],
            cliente_data['email'],
            cliente_data['telefono'],
            cliente_data['direccion'],
            cliente_data['cedula']
        )

        # 2. Insertar factura
        id_factura = insertar_factura(
            id_cliente,
            factura_data['fecha'],
            factura_data['descuento'],
            factura_data['impuesto'],
            factura_data['metodo_pago'],
            factura_data['notas']
        )

        # 3. Insertar detalles de la factura
        insertar_detalles_factura(id_factura, detalles)

        return jsonify({
            'mensaje': 'Factura creada exitosamente',
            'id_factura': id_factura
        }), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'Error al crear la factura'}), 500
    
    # Obtener todos los clientes
@form_bp.route('/api/clientes', methods=['GET'])
def api_get_clientes():
    clientes = obtener_clientes()
    return jsonify(clientes), 200

# Insertar nuevo cliente
@form_bp.route('/api/clientes', methods=['POST'])
def api_post_cliente():
    data = request.get_json()
    try:
        nombre = data['nombre']
        email = data['email']
        telefono = data['telefono']
        direccion = data['direccion']
        cedula = data['cedula']
        
        id_cliente = insertar_cliente(nombre, email, telefono, direccion, cedula)
        return jsonify({'mensaje': 'Cliente insertado', 'id_cliente': id_cliente}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Buscar cliente por cédula
@form_bp.route('/api/clientes/cedula/<cedula>', methods=['GET'])
def api_get_cliente_por_cedula(cedula):
    cliente = buscar_cliente_por_cedula(cedula)
    if cliente:
        return jsonify(cliente), 200
    return jsonify({'error': 'Cliente no encontrado'}), 404

# Obtener cliente por ID
@form_bp.route('/api/clientes/<int:id_cliente>', methods=['GET'])
def api_get_cliente_por_id(id_cliente):
    cliente = obtener_cliente_por_id(id_cliente)
    if cliente:
        return jsonify(cliente), 200
    return jsonify({'error': 'Cliente no encontrado'}), 404

# Actualizar cliente
@form_bp.route('/api/clientes/<int:id_cliente>', methods=['PUT'])
def api_put_cliente(id_cliente):
    data = request.get_json()
    try:
        actualizar_cliente(
            id_cliente,
            data['nombre'],
            data['email'],
            data['telefono'],
            data['direccion'],
            data['cedula']
        )
        return jsonify({'mensaje': 'Cliente actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Eliminar cliente (borrado lógico)
@form_bp.route('/api/clientes/<int:id_cliente>', methods=['DELETE'])
def api_delete_cliente(id_cliente):
    try:
        eliminar_cliente(id_cliente)
        return jsonify({'mensaje': 'Cliente eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@form_bp.route('/api/libros', methods=['GET'])
def api_get_libros():
    try:
        libros = obtener_libros_factura()  # Llama a la función que ya tienes en libroDAO
        return jsonify(libros), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'Error al obtener la lista de libros'}), 500