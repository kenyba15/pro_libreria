from modelo.conexion import obtener_conexion 

def obtener_factura_completa_por_id(factura_id):
    print(f"DEBUG DAO: Iniciando obtener_factura_completa_por_id para ID: {factura_id}")
    conn = None
    try:
        conn = obtener_conexion()
        cursor = conn.cursor(dictionary=True) 

        sql_factura_principal = """
        SELECT
            f.id_factura,
            f.fecha,
            c.nombre AS cliente,          
            c.direccion AS direccion,   
            f.metodo_pago,
            f.notas,
            f.descuento,
            f.impuesto
        FROM
            factura AS f                  
        JOIN
            cliente AS c ON f.id_cliente = c.id_cliente 
        WHERE
            f.id_factura = %s;
        """
        print(f"DEBUG DAO: Ejecutando SQL Factura Principal para ID {factura_id}: {sql_factura_principal}")
        cursor.execute(sql_factura_principal, (factura_id,))
        factura_data = cursor.fetchone()

        print(f"DEBUG DAO: Resultado factura_data: {factura_data}")

        if not factura_data:
            print(f"DEBUG DAO: Factura con ID {factura_id} no encontrada en la consulta SQL principal.")
            return None 
       
        sql_detalles = """
       SELECT
            d.cantidad,
            d.precio_unitario,
            (d.cantidad * d.precio_unitario) AS totalLinea,
            l.titulo AS descripcion
            FROM
                detalle_factura AS d
            JOIN
                libro AS l ON d.id_libro = l.id_libro
            WHERE
                d.id_factura = %s;

        """
        print(f"DEBUG DAO: Ejecutando SQL Detalles para ID {factura_id}: {sql_detalles}")
        cursor.execute(sql_detalles, (factura_id,))
        detalles_data = cursor.fetchall()

        print(f"DEBUG DAO: Resultado detalles_data: {detalles_data}")

        
        from decimal import Decimal

        subtotal = sum(Decimal(str(d['cantidad'])) * Decimal(str(d['precio_unitario'])) for d in detalles_data)

        descuento = Decimal(str(factura_data.get('descuento', 0)))
        impuesto = Decimal(str(factura_data.get('impuesto', 0)))

        total_factura = subtotal - descuento + impuesto


      
        factura_data['detalles'] = detalles_data
        factura_data['subtotal'] = subtotal
        factura_data['totalFactura'] = total_factura # Clave esperada por el JS

        print(f"DEBUG DAO: Factura completa ensamblada: {factura_data}")
        return factura_data

    except Exception as e:
       
        print(f"ERROR DAO: Se capturó una excepción en obtener_factura_completa_por_id: {e}") 
        return None
    finally:
        if conn:
            print("DEBUG DAO: Cerrando conexión a la base de datos.")
            conn.close()