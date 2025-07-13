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
