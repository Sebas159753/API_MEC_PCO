#!/usr/bin/env bash
# Build script súper simple para Render
set -o errexit

echo "=== Iniciando build optimizado para Render ==="

# Instalar solo lo esencial para pymssql
echo "Instalando dependencias mínimas..."
apt-get update
apt-get install -y gcc g++ freetds-dev

# Limpiar
apt-get clean
rm -rf /var/lib/apt/lists/*

# Instalar Python packages
echo "Instalando paquetes Python..."
pip install --upgrade pip
pip install --no-cache-dir -r requirements.txt

echo "=== Build completado ==="
