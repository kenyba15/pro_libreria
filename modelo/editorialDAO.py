from modelo.conexion import obtener_conexion

def obtener_editoriales(busqueda=''):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    sql = "SELECT * FROM editorial WHERE estado = 1"
    params = ()

    if busqueda:
        sql += " AND nombre LIKE %s"
        params = (f"%{busqueda}%",)

    cursor.execute(sql, params)
    editoriales = cursor.fetchall()
    conexion.close()
    return editoriales

def insertar_editorial(nombre, tipo, sitio_web, correo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute(
        "INSERT INTO editorial (nombre, tipo, sitio_web, correo) VALUES (%s, %s, %s, %s)",
        (nombre, tipo, sitio_web, correo)
    )
    conexion.commit()
    conexion.close()

def actualizar_editorial(id_editorial, nombre, tipo, sitio_web, correo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute(
        "UPDATE editorial SET nombre=%s, tipo=%s, sitio_web=%s, correo=%s WHERE id_editorial=%s",
        (nombre, tipo, sitio_web, correo, id_editorial)
    )
    conexion.commit()
    conexion.close()

def eliminar_editorial(id_editorial):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE editorial SET estado = 0 WHERE id_editorial=%s", (id_editorial,))
    conexion.commit()
    conexion.close()

def obtener_editorial_por_id(id_editorial):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM editorial WHERE id_editorial = %s", (id_editorial,))
    editorial = cursor.fetchone()
    conexion.close()
    return editorial
