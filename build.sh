#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias (el archivo ya está en la misma carpeta, así que es directo)
pip install -r requirements.txt

# Correr comandos de Django (apuntando a la carpeta correcta)
python dev_sistema_escolar_api/manage.py collectstatic --no-input
python dev_sistema_escolar_api/manage.py migrate