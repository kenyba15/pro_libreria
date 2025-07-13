from modelo.conexion import obtener_conexion

def obtener_autores():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM autor WHERE estado = 1")
    autores = cursor.fetchall()
    conexion.close()
    return autores

def insertar_autor(nombre, correo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO autor (nombre, correo) VALUES (%s, %s)", (nombre, correo))
    conexion.commit()
    conexion.close()

def actualizar_autor(id_autor, nombre, correo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE autor SET nombre=%s, correo=%s WHERE id_autor=%s", (nombre, correo, id_autor))
    conexion.commit()
    conexion.close()

def eliminar_autor(id_autor):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE autor SET estado = 0 WHERE id_autor=%s", (id_autor,))
    conexion.commit()
    conexion.close()

def obtener_autor_por_id(id_autor):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM autor WHERE id_autor = %s", (id_autor,))
    autor = cursor.fetchone()
    conexion.close()
    return autor
