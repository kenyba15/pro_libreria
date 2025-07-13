from modelo.conexion import obtener_conexion

def obtener_libros():
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            l.id_libro, l.titulo, l.isbn, l.id_Editorial, l.idioma, l.genero, l.edicion, l.formato, l.precio, l.best_seller,
            e.nombre AS nombre_editorial,
            GROUP_CONCAT(a.nombre SEPARATOR ', ') AS autores,
            GROUP_CONCAT(a.id_autor SEPARATOR ',') AS autores_ids
        FROM libro l
        LEFT JOIN editorial e ON l.id_Editorial = e.id_editorial
        LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
        LEFT JOIN autor a ON la.id_autor = a.id_autor
        WHERE l.estado = 1
        GROUP BY l.id_libro
    """)
    rows = cursor.fetchall()
    libros = []
    for row in rows:
        libros.append(row)
    cursor.close()
    conn.close()
    return libros

def obtener_libros(busqueda=''):
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            l.id_libro, l.titulo, l.isbn, l.id_Editorial, l.idioma, l.genero, l.edicion, l.formato, l.precio, l.best_seller,
            e.nombre AS nombre_editorial,
            GROUP_CONCAT(a.nombre SEPARATOR ', ') AS autores,
            GROUP_CONCAT(a.id_autor SEPARATOR ',') AS autores_ids
        FROM libro l
        LEFT JOIN editorial e ON l.id_Editorial = e.id_editorial
        LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
        LEFT JOIN autor a ON la.id_autor = a.id_autor
        WHERE l.estado = 1
    """
    params = ()

    if busqueda:
        sql += " AND l.titulo LIKE %s"
        params = (f"%{busqueda}%",)

    sql += " GROUP BY l.id_libro"

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def obtener_libros_factura():
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            l.id_libro, l.titulo, l.isbn, l.id_Editorial, l.idioma, l.genero, l.edicion, l.formato, l.best_seller,l.precio,
            e.nombre AS nombre_editorial,
            GROUP_CONCAT(a.nombre SEPARATOR ', ') AS autores,
            GROUP_CONCAT(a.id_autor SEPARATOR ',') AS autores_ids
        FROM libro l
        LEFT JOIN editorial e ON l.id_Editorial = e.id_editorial
        LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
        LEFT JOIN autor a ON la.id_autor = a.id_autor
        WHERE l.estado = 1
        GROUP BY l.id_libro
    """)
    rows = cursor.fetchall()
    libros = []
    for row in rows:
        libros.append(row)
    cursor.close()
    conn.close()
    return libros

def insertar_libro(titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO libro (titulo, isbn, id_Editorial, idioma, genero, edicion, formato, precio, best_seller, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
    """, (titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller))
    conn.commit()
    nuevo_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return nuevo_id

def actualizar_libro(id_libro, titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE libro 
        SET titulo=%s, isbn=%s, id_Editorial=%s, idioma=%s, genero=%s, edicion=%s, formato=%s, precio=%s, best_seller=%s
        WHERE id_libro=%s
    """, (titulo, isbn, editorial, idioma, genero, edicion, formato, precio, best_seller, id_libro))
    conn.commit()
    cursor.close()
    conn.close()

def insertar_autores_libro(id_libro, lista_autores):
    conn = obtener_conexion()
    cursor = conn.cursor()
    for id_autor in lista_autores:
        cursor.execute("""
            INSERT INTO libro_autor (id_libro, id_autor)
            VALUES (%s, %s)
        """, (id_libro, id_autor))
    conn.commit()
    cursor.close()
    conn.close()

def actualizar_autores_libro(id_libro, lista_autores):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM libro_autor WHERE id_libro = %s", (id_libro,))
    for id_autor in lista_autores:
        cursor.execute("""
            INSERT INTO libro_autor (id_libro, id_autor)
            VALUES (%s, %s)
        """, (id_libro, id_autor))
    conn.commit()
    cursor.close()
    conn.close()

def eliminar_libro(id_libro):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE libro SET estado = 0 WHERE id_libro = %s", (id_libro,))
    conexion.commit()
    conexion.close()

def obtener_libro_por_id(id_libro):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM libro WHERE id_libro = %s", (id_libro,))
    libro = cursor.fetchone()
    cursor.execute("SELECT id_autor FROM libro_autor WHERE id_libro = %s", (id_libro,))
    autores = [row['id_autor'] for row in cursor.fetchall()]
    libro['autores'] = autores
    conexion.close()
    return libro

