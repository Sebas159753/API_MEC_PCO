#!/usr/bin/env bash
# Build script optimizado para Render
set -o errexit

echo "=== Iniciando build script ==="

# Actualizar sistema
echo "Actualizando paquetes del sistema..."
apt-get update

# Instalar dependencias del sistema necesarias
echo "Instalando dependencias del sistema..."
apt-get install -y \
    build-essential \
    gcc \
    g++ \
    unixodbc-dev \
    freetds-dev \
    freetds-bin \
    libfreetds6

# Limpiar cache
echo "Limpiando cache de apt..."
apt-get clean
rm -rf /var/lib/apt/lists/*

# Actualizar pip
echo "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias de Python
echo "Instalando dependencias de Python..."
pip install --no-cache-dir -r requirements.txt

echo "=== Build completado exitosamente ==="
