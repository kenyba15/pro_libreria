from flask import jsonify
from flask import Blueprint, render_template, request, redirect, url_for
from modelo.autorDAO import obtener_autores, insertar_autor, actualizar_autor, eliminar_autor, obtener_autor_por_id
from modelo.editorialDAO import obtener_editoriales, insertar_editorial, actualizar_editorial, eliminar_editorial, obtener_editorial_por_id
from modelo.libroDAO import obtener_libros, insertar_libro, actualizar_libro, eliminar_libro, obtener_libro_por_id, insertar_autores_libro, actualizar_autores_libro, obtener_libros_factura
from modelo.facturaDAO import insertar_factura, insertar_detalles_factura
from modelo.clienteDAO import insertar_cliente, obtener_clientes, actualizar_cliente, eliminar_cliente, buscar_cliente_por_cedula, obtener_cliente_por_id
from modelo.reporteDAO import obtener_libros_baja_rotacion, obtener_libros_best_seller, obtener_ventas_mensuales, obtener_ventas_anuales
from datetime import datetime, timedelta
from modelo.actividadDAO import registrar_actividad, obtener_ultimas_actividades, contar_libros, contar_autores, contar_editoriales
from flask import make_response, render_template
from xhtml2pdf import pisa
import io


form_bp = Blueprint('form_bp', __name__)

@form_bp.route('/')
def inicio():
    total_libros = contar_libros()
    total_autores = contar_autores()
    total_editoriales = contar_editoriales()
    ultimas_actividades = obtener_ultimas_actividades()

    return render_template('inicio.html',
                           total_libros=total_libros,
                           total_autores=total_autores,
                           total_editoriales=total_editoriales,
                           ultimas_actividades=ultimas_actividades)

@form_bp.route('/autor', methods=['GET', 'POST'])
def autor():
    if request.method == 'POST':
        id_autor = request.form.get('id_autor')
        nombre = request.form.get('nombre')
        correo = request.form.get('correo')
        if id_autor:  # Editar
            actualizar_autor(id_autor, nombre, correo)
            registrar_actividad('autor', f'Autor "{nombre}" actualizado')
        else:  # Nuevo
            insertar_autor(nombre, correo)
            registrar_actividad('autor', f'Autor "{nombre}" creado')
        return redirect(url_for('form_bp.autor'))

    busqueda = request.args.get('busqueda', '')
    autores = obtener_autores(busqueda)
    return render_template('autor.html', autores=autores)

@form_bp.route('/autor/editar/<int:id_autor>', methods=['GET', 'POST'])
def editar_autor(id_autor):
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        correo = request.form.get('correo')
        actualizar_autor(id_autor, nombre, correo)
        descripcion = f'Autor "{nombre}" actualizado'
        registrar_actividad('autor', descripcion)
        return redirect(url_for('form_bp.autor'))

    autor = obtener_autor_por_id(id_autor)
    autores = obtener_autores()
    return render_template('autor.html', autor=autor, autores=autores)

@form_bp.route('/autor/eliminar/<int:id_autor>')
def eliminar_autor_ruta(id_autor):
    autor = obtener_autor_por_id(id_autor)
    if autor:
        eliminar_autor(id_autor)
        descripcion = f'Autor "{autor["nombre"]}" eliminado'
        registrar_actividad('autor', descripcion)
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
            descripcion = f'Libro "{titulo}" actualizado'
            registrar_actividad('libro', descripcion)
        else:
            nuevo_id = insertar_libro(titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller)
            insertar_autores_libro(nuevo_id, autores)
            descripcion = f'Libro "{titulo}" creado'
            registrar_actividad('libro', descripcion)

        return redirect(url_for('form_bp.libro'))

    busqueda = request.args.get('busqueda', '')
    libros = obtener_libros(busqueda)
    editoriales = obtener_editoriales()
    autores = obtener_autores()
    return render_template('libro.html', libros=libros, editoriales=editoriales, autores=autores)

@form_bp.route('/libro/eliminar/<int:id_libro>')
def eliminar_libro_ruta(id_libro):
    libro = obtener_libro_por_id(id_libro)
    if libro:
        eliminar_libro(id_libro)
        descripcion = f'Libro "{libro["titulo"]}" eliminado'
        registrar_actividad('libro', descripcion)
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
            registrar_actividad('editorial', f'Editorial "{nombre}" actualizada')
        else:  # Nuevo
            insertar_editorial(nombre, tipo, sitio_web, correo)
            registrar_actividad('editorial', f'Editorial "{nombre}" creada')
        return redirect(url_for('form_bp.editorial'))

    busqueda = request.args.get('busqueda', '')
    editoriales = obtener_editoriales(busqueda)
    return render_template('editorial.html', editoriales=editoriales)

@form_bp.route('/editorial/editar/<int:id_editorial>', methods=['GET', 'POST'])
def editar_editorial(id_editorial):
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        tipo = request.form.get('tipo')
        sitio_web = request.form.get('sitio_web')
        correo = request.form.get('correo')
        actualizar_editorial(id_editorial, nombre, tipo, sitio_web, correo)
        descripcion = f'Editorial "{nombre}" actualizada'
        registrar_actividad('editorial', descripcion)
        return redirect(url_for('form_bp.editorial'))

    editorial = obtener_editorial_por_id(id_editorial)
    editoriales = obtener_editoriales()
    return render_template('editorial.html', editorial=editorial, editoriales=editoriales)

@form_bp.route('/editorial/eliminar/<int:id_editorial>')
def eliminar_editorial_ruta(id_editorial):
    editorial = obtener_editorial_por_id(id_editorial)
    if editorial:
        eliminar_editorial(id_editorial)
        descripcion = f'Editorial "{editorial["nombre"]}" eliminada'
        registrar_actividad('editorial', descripcion)
    return redirect(url_for('form_bp.editorial'))


@form_bp.route('/uiFactura')
def ui_factura():
    return render_template('uiFactura.html')

@form_bp.route('/Detalle_Factura')
def detalle_f():
    return render_template('Detalle_Factura.html')


# API para insertar factura completa con detalles
@form_bp.route('/api/factura', methods=['POST'])
def api_agregar_factura():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({'error': 'JSON inválido o no proporcionado'}), 400

        cliente = data.get('cliente')
        factura_info = data.get('factura')
        detalles = data.get('detalles', [])

        # Validaciones básicas
        if not cliente or not factura_info or not detalles:
            return jsonify({'error': 'Datos incompletos'}), 400

        id_cliente = cliente.get('id_cliente')
        fecha = factura_info.get('fecha')
        descuento = factura_info.get('descuento', 0)
        impuesto = factura_info.get('impuesto', 0)
        metodo_pago = factura_info.get('metodo_pago')
        notas = factura_info.get('notas', '')

        if not all([id_cliente, fecha, metodo_pago]):
            return jsonify({'error': 'Campos obligatorios faltantes'}), 400

        # 1. Insertar factura y obtener ID
        id_factura = insertar_factura(id_cliente, fecha, descuento, impuesto, metodo_pago, notas)
        if not id_factura:
            return jsonify({'error': 'Error al insertar la factura'}), 500

        # 2. Validar y agregar detalles
        for detalle in detalles:
            if not all(k in detalle for k in ('id_libro', 'cantidad', 'precio_unitario')):
                return jsonify({'error': 'Detalle de factura incompleto'}), 400

        insertar_detalles_factura(id_factura, detalles)

        return jsonify({
            'mensaje': 'Factura y detalles insertados correctamente',
            'id_factura': id_factura
        }), 201

    except Exception as e:
        print("❌ Error en la API:", e)
        return jsonify({'error': 'Error interno del servidor'}), 500

    
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
    
@form_bp.route('/reportes', methods=['GET', 'POST'])
def reportes():
    tipo_reporte = request.args.get('tipo', '')  # Para GET o POST podrías usar request.form.get si quieres un form

    libros_baja_rotacion = []
    libros_best_seller = []
    ventas_mensuales = []
    ventas_anuales = []


    if tipo_reporte == 'baja_rotacion':
        libros_baja_rotacion = obtener_libros_baja_rotacion()
    elif tipo_reporte == 'best_seller':
        libros_best_seller = obtener_libros_best_seller()
    elif tipo_reporte == 'ventas_mensuales':
        ventas_mensuales = obtener_ventas_mensuales()
    elif tipo_reporte == 'ventas_anuales':
        ventas_anuales = obtener_ventas_anuales()

    return render_template('reportes.html',
                           tipo_reporte=tipo_reporte,
                           libros_baja_rotacion=libros_baja_rotacion,
                           libros_best_seller=libros_best_seller,
                           ventas_mensuales=ventas_mensuales,
                           ventas_anuales=ventas_anuales)


@form_bp.route('/reportes/pdf')
def generar_pdf():
    tipo = request.args.get('tipo', '')

    if not tipo:
        # en vez de generar pdf, recarga la página de reportes con un mensaje de error
        error = "Debe seleccionar un tipo de reporte para generar el PDF."
        return render_template('reportes.html', tipo_reporte='', libros_baja_rotacion=[], libros_best_seller=[], error=error)

    if tipo == 'baja_rotacion':
        resultados = obtener_libros_baja_rotacion()
        titulo = "Reporte de Libros de Baja Rotación"
    elif tipo == 'best_seller':
        resultados = obtener_libros_best_seller()
        titulo = "Reporte de Libros Best Seller"
    elif tipo == 'ventas_mensuales':
        resultados = obtener_ventas_mensuales()
        titulo = "Reporte de Ventas Mensuales"
    elif tipo == 'ventas_anuales':
        resultados = obtener_ventas_anuales()
        titulo = "Reporte de Ventas Anuales"
    else:
        error = "Tipo de reporte no válido."
        return render_template('reportes.html', tipo_reporte='', libros_baja_rotacion=[], libros_best_seller=[], ventas_mensuales=[], ventas_anuales=[], error=error)

    html = render_template('reportes_pdf.html', resultados=resultados, titulo=titulo, tipo_reporte=tipo)

    buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=buffer)

    if pisa_status.err:
        error = "Error al generar el PDF."
        return render_template('reportes.html', tipo_reporte=tipo, error=error)

    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename={tipo}_reporte.pdf'
    return response
