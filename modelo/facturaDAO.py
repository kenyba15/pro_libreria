from modelo.conexion import obtener_conexion

# Insertar factura
def insertar_factura(id_cliente, fecha, descuento, impuesto, metodo_pago, notas):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO factura (id_cliente, fecha, descuento, impuesto, metodo_pago, notas, estado)
            VALUES (%s, %s, %s, %s, %s, %s, 1)  -- Estado por defecto es 1 (activo)
        """, (id_cliente, fecha, descuento, impuesto, metodo_pago, notas))
        conn.commit()
        id_factura = cursor.lastrowid
    except Exception as e:
        print("Error al insertar factura:", e)
        conn.rollback()  # Deshacer cambios en caso de error
        id_factura = None
    finally:
        cursor.close()
        conn.close()
    return id_factura

# Insertar los artículos de la factura (detalle_factura)
def insertar_detalles_factura(id_factura, detalles):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        for item in detalles:
            cursor.execute("""
                INSERT INTO detalle_factura (id_factura, id_libro, cantidad, precio_unitario, estado)
                VALUES (%s, %s, %s, %s, 1)  -- Estado por defecto es 1 (activo)
            """, (id_factura, item['id_libro'], item['cantidad'], item['precio_unitario']))
        conn.commit()
    except Exception as e:
        print("Error al insertar detalles de factura:", e)
        conn.rollback()  # Deshacer cambios en caso de error
    finally:
        cursor.close()
        conn.close()

# Obtener lista de facturas
def obtener_facturas():
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM factura WHERE estado = 1")  # Solo facturas activas
        facturas = cursor.fetchall()
    except Exception as e:
        print("Error al obtener facturas:", e)
        facturas = []
    finally:
        cursor.close()
        conn.close()
    return facturas

# Obtener detalles de una factura específica
def obtener_detalles_factura(id_factura):
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM detalle_factura WHERE id_factura = %s AND estado = 1", (id_factura,))
        detalles = cursor.fetchall()
    except Exception as e:
        print("Error al obtener detalles de factura:", e)
        detalles = []
    finally:
        cursor.close()
        conn.close()
    return detalles
