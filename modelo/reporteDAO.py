from modelo.conexion import obtener_conexion

def obtener_libros_baja_rotacion():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    sql = """
    SELECT l.id_libro, l.titulo, l.isbn, l.idioma, l.genero, l.edicion, l.formato, l.precio, l.best_seller,
           COALESCE(SUM(df.cantidad), 0) AS total_vendido
    FROM libro l
    LEFT JOIN detalle_factura df ON l.id_libro = df.id_libro AND df.estado = 1
    LEFT JOIN factura f ON df.id_factura = f.id_factura AND f.estado = 1
    WHERE l.estado = 1
    GROUP BY l.id_libro
    HAVING total_vendido <= 1
    ORDER BY total_vendido ASC
    """
    cursor.execute(sql)
    resultados = cursor.fetchall()
    cursor.close()
    conexion.close()
    return resultados

def obtener_libros_best_seller():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    sql = """
    SELECT id_libro, titulo, isbn, idioma, genero, edicion, formato, precio, best_seller
    FROM libro
    WHERE best_seller = 1 AND estado = 1
    ORDER BY titulo
    """
    cursor.execute(sql)
    resultados = cursor.fetchall()
    cursor.close()
    conexion.close()
    return resultados

def obtener_ventas_mensuales():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    sql = """
    SELECT 
        DATE_FORMAT(f.fecha, '%Y-%m') AS mes,
        COUNT(f.id_factura) AS total_facturas,
        SUM(df.cantidad * df.precio_unitario) AS total_ventas
    FROM factura f
    JOIN detalle_factura df ON f.id_factura = df.id_factura
    WHERE f.estado = 1 AND df.estado = 1
    GROUP BY mes
    ORDER BY mes DESC;
    """
    cursor.execute(sql)
    resultados = cursor.fetchall()
    cursor.close()
    conexion.close()
    return resultados

def obtener_ventas_anuales():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    sql = """
    SELECT 
        YEAR(f.fecha) AS anio,
        COUNT(f.id_factura) AS total_facturas,
        SUM(df.cantidad * df.precio_unitario) AS total_ventas
    FROM factura f
    JOIN detalle_factura df ON f.id_factura = df.id_factura
    WHERE f.estado = 1 AND df.estado = 1
    GROUP BY anio
    ORDER BY anio DESC;
    """
    cursor.execute(sql)
    resultados = cursor.fetchall()
    cursor.close()
    conexion.close()
    return resultados
