from fastapi import FastAPI, Header, HTTPException, Depends
import pyodbc
import os

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "API MEC PCO funcionando correctamente", "version": "1.0"}

# Variables de conexión (usar variables de entorno en producción)
SQL_SERVER = os.getenv("SQL_SERVER", "10.70.0.31")  # IP o nombre del servidor SQL
SQL_DATABASE = os.getenv("SQL_DATABASE", "dbcentral")
SQL_USERNAME = os.getenv("SQL_USERNAME", "usrsicav")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "$icav2012*")
API_KEY = os.getenv("API_KEY", "prueba")

# Conexión ODBC
def get_connection():
    conn_str = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={SQL_SERVER};DATABASE={SQL_DATABASE};"
        f"UID={SQL_USERNAME};PWD={SQL_PASSWORD};Encrypt=no;"
    )
    return pyodbc.connect(conn_str)

# Middleware para API Key
async def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API Key inválida")

@app.get("/data", dependencies=[Depends(verify_api_key)])
async def get_data(limit: int = 10):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT TOP (?) * FROM BVQ_ADMINISTRACION.MontoColoCadoPC", limit)
    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    result = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return result
