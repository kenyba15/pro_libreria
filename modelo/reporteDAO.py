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


def obtener_libros_por_genero():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    sql = """
    SELECT
    l.genero,
    l.id_libro,
    l.isbn,
    l.titulo,
    GROUP_CONCAT(DISTINCT a.nombre SEPARATOR ', ') AS autores,
    ed.nombre AS editorial,
    l.precio,
    l.best_seller,  -- Aquí traes el valor crudo (1 o 0)
    SUM(df.cantidad) AS total_vendido
    FROM libro l
    JOIN detalle_factura df ON l.id_libro = df.id_libro
    LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
    LEFT JOIN autor a ON la.id_autor = a.id_autor
    LEFT JOIN editorial ed ON l.id_editorial = ed.id_editorial
    WHERE l.estado = 1
    GROUP BY l.genero, l.id_libro
    HAVING SUM(df.cantidad) >= 1
    ORDER BY l.genero, total_vendido DESC;
    """
       
    try:
        cursor.execute(sql)
        libros = cursor.fetchall()
    except Exception as e: # Captura cualquier error de SQL
        print(f"Error al obtener libros por género: {e}")
        libros = []
    finally:
        cursor.close()
        conexion.close()

    libros_por_genero_agrupados = {}
    for libro in libros:
        genero = libro['genero']
        if genero not in libros_por_genero_agrupados:
            libros_por_genero_agrupados[genero] = {
                'libros': [],
                'total_libros_genero': 0
            }
        
        libros_por_genero_agrupados[genero]['libros'].append(libro)
        libros_por_genero_agrupados[genero]['total_libros_genero'] += 1
    
    return libros_por_genero_agrupados

