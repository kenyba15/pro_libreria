from modelo.conexion import obtener_conexion

# Insertar nuevo cliente (desde formulario si elige "nuevo")
def insertar_cliente(nombre, email, telefono, direccion, cedula):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cliente (nombre, email, telefono, direccion, cedula, estado)
        VALUES (%s, %s, %s, %s, %s, 1)
    """, (nombre, email, telefono, direccion, cedula))
    conn.commit()
    id_cliente = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_cliente

# Buscar cliente por cédula (para el botón lupa)
def buscar_cliente_por_cedula(cedula):
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cliente WHERE cedula = %s AND estado = 1", (cedula,))
    cliente = cursor.fetchone()
    cursor.close()
    conn.close()
    return cliente

# Insertar factura
def insertar_factura(id_cliente, fecha, descuento, impuesto, metodo_pago, notas):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO factura (id_cliente, fecha, descuento, impuesto, metodo_pago, notas, estado)
        VALUES (%s, %s, %s, %s, %s, %s, 1)
    """, (id_cliente, fecha, descuento, impuesto, metodo_pago, notas))
    conn.commit()
    id_factura = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_factura

# Insertar los artículos de la factura (detalle_factura)
def insertar_detalles_factura(id_factura, detalles):
    conn = obtener_conexion()
    cursor = conn.cursor()
    for item in detalles:
        cursor.execute("""
            INSERT INTO detalle_factura (id_factura, id_libro, cantidad, precio_unitario, estado)
            VALUES (%s, %s, %s, %s, 1)
        """, (id_factura, item['id_libro'], item['cantidad'], item['precio_unitario']))
    conn.commit()
    cursor.close()
    conn.close()

# Obtener lista de clientes activos
def obtener_clientes():
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_cliente, nombre FROM cliente WHERE estado = 1")
    clientes = cursor.fetchall()
    cursor.close()
    conn.close()
    return clientes
