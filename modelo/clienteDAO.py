from modelo.conexion import obtener_conexion  # Asegúrate de tener esta función

# Insertar nuevo cliente
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

# Obtener todos los clientes activos
def obtener_clientes():
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cliente WHERE estado = 1")
    clientes = cursor.fetchall()
    cursor.close()
    conn.close()
    return clientes

# Buscar cliente por ID
def obtener_cliente_por_id(id_cliente):
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cliente WHERE id_cliente = %s", (id_cliente,))
    cliente = cursor.fetchone()
    cursor.close()
    conn.close()
    return cliente

# Buscar cliente por cédula
def buscar_cliente_por_cedula(cedula):
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cliente WHERE cedula = %s AND estado = 1", (cedula,))
    cliente = cursor.fetchone()
    cursor.close()
    conn.close()
    return cliente

# Actualizar cliente
def actualizar_cliente(id_cliente, nombre, email, telefono, direccion, cedula):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE cliente
        SET nombre = %s, email = %s, telefono = %s, direccion = %s, cedula = %s
        WHERE id_cliente = %s
    """, (nombre, email, telefono, direccion, cedula, id_cliente))
    conn.commit()
    cursor.close()
    conn.close()

# Eliminar cliente (borrado lógico)
def eliminar_cliente(id_cliente):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("UPDATE cliente SET estado = 0 WHERE id_cliente = %s", (id_cliente,))
    conn.commit()
    cursor.close()
    conn.close()
