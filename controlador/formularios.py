from flask import Blueprint, render_template

form_bp = Blueprint('form_bp', __name__)

@form_bp.route('/')
def inicio():
    return render_template('inicio.html')

@form_bp.route('/autor')
def autor():
    return render_template('autor.html')

@form_bp.route('/libro')
def libro():
    return render_template('libro.html')

@form_bp.route('/editorial')
def editorial():
    return render_template('editorial.html')

@form_bp.route('/uiFactura')
def ui_factura():
    return render_template('uiFactura.html')

@form_bp.route('/Detalle_Factura')
def detalle_f():
    return render_template('Detalle_Factura.html')
