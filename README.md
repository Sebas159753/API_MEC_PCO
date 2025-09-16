# API MEC PCO

API FastAPI para consulta de datos de bases de datos SQL Server.

## Deployment en Railway

1. Visita [Railway](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Sube este proyecto a un repositorio de GitHub
4. En Railway, selecciona "Deploy from GitHub repo"
5. Configura las variables de entorno:
   - `SQL_SERVER`: Tu servidor SQL
   - `SQL_DATABASE`: Tu base de datos
   - `SQL_USERNAME`: Tu usuario
   - `SQL_PASSWORD`: Tu contraseña
   - `API_KEY`: Tu clave API

## Deployment en Render

1. Visita [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Selecciona "Web Service"
4. Configura:
   - Build Command: `./build.sh`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Agrega las variables de entorno

## Variables de Entorno Requeridas

- `SQL_SERVER`: Dirección del servidor SQL
- `SQL_DATABASE`: Nombre de la base de datos
- `SQL_USERNAME`: Usuario de la base de datos
- `SQL_PASSWORD`: Contraseña de la base de datos
- `API_KEY`: Clave para autenticación de la API

## Endpoints

- `GET /` - Información de la API
- `GET /data?limit=10` - Obtener datos (requiere header `x-api-key`)

## Uso Local

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
