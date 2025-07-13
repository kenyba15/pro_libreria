from modelo.conexion import obtener_conexion

def contar_libros():
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM libro WHERE estado = 1")
    total = cursor.fetchone()[0]
    conn.close()
    return total

def contar_autores():
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM autor WHERE estado = 1")
    total = cursor.fetchone()[0]
    conn.close()
    return total

def contar_editoriales():
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM editorial WHERE estado = 1")
    total = cursor.fetchone()[0]
    conn.close()
    return total

def obtener_ultimas_actividades():
    conn = obtener_conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM actividad ORDER BY fecha DESC LIMIT 3")
    actividades = cursor.fetchall()
    conn.close()
    return actividades

def registrar_actividad(tipo, descripcion):
    conn = obtener_conexion()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO actividad (tipo, descripcion) VALUES (%s, %s)", (tipo, descripcion))
    conn.commit()
    conn.close()
