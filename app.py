from flask import Flask
from controlador.formularios import form_bp
import webbrowser
import threading
import os

app = Flask(__name__, template_folder='vista', static_folder='static')
app.secret_key = 'clave_secreta'
app.register_blueprint(form_bp)

def abrir_navegador():
    if not os.environ.get("WERKZEUG_RUN_MAIN"):  # Evita que se ejecute dos veces en modo debug
        webbrowser.open_new("http://localhost:5000/")

if __name__ == '__main__':  
    threading.Timer(1.0, abrir_navegador).start()
    app.run(debug=True)
