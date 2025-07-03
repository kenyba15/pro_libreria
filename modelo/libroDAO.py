from modelo.conexion import obtener_conexion

def obtener_libros():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM libro WHERE estado = 1")
    libros = cursor.fetchall()
    conexion.close()
    return libros

def insertar_libro(titulo, isbn, editorial, autor, idioma, genero, edicion, formato, best_seller):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO libro (titulo, isbn, id_editorial, id_autor, idioma, genero, edicion, formato, best_seller)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (titulo, isbn, editorial, autor, idioma, genero, edicion, formato, best_seller))
    conexion.commit()
    conexion.close()

def actualizar_libro(id_libro, titulo, isbn, editorial, autor, idioma, genero, edicion, formato, best_seller):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE libro SET titulo=%s, isbn=%s, id_editorial=%s, id_autor=%s,
        idioma=%s, genero=%s, edicion=%s, formato=%s, best_seller=%s WHERE id_libro=%s
    """, (titulo, isbn, editorial, autor, idioma, genero, edicion, formato, best_seller, id_libro))
    conexion.commit()
    conexion.close()

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
    conexion.close()
    return libro
