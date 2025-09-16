from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from typing import Optional

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importar pymssql (driver principal)
try:
    import pymssql
    logger.info("pymssql loaded successfully")
except ImportError as e:
    logger.error(f"ERROR: pymssql no está disponible: {e}")
    logger.error("Instala pymssql: pip install pymssql")
    raise ImportError("pymssql es requerido para esta aplicación")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 API starting up...")
    yield
    # Shutdown
    logger.info("🛑 API shutting down...")

# App FastAPI
app = FastAPI(
    title="API MEC PCO",
    description="API optimizada para consulta de datos SQL Server",
    version="1.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables de configuración
SQL_SERVER = os.getenv("SQL_SERVER", "10.70.0.31")
SQL_DATABASE = os.getenv("SQL_DATABASE", "dbcentral")
SQL_USERNAME = os.getenv("SQL_USERNAME", "usrsicav")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "$icav2012*")
API_KEY = os.getenv("API_KEY", "prueba")

# Validar configuración
if not all([SQL_SERVER, SQL_DATABASE, SQL_USERNAME, SQL_PASSWORD]):
    logger.error("❌ Configuración de base de datos incompleta!")

# Función de conexión simplificada
def get_connection():
    """Conecta a SQL Server usando pymssql"""
    try:
        logger.debug(f"🔌 Conectando a {SQL_SERVER}:{SQL_DATABASE}")
        conn = pymssql.connect(
            server=SQL_SERVER,
            database=SQL_DATABASE,
            user=SQL_USERNAME,
            password=SQL_PASSWORD,
            timeout=30,
            login_timeout=30
        )
        logger.debug("✅ Conexión exitosa")
        return conn
    except Exception as e:
        error_msg = f"❌ Error de conexión: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# Middleware de seguridad para API Key
async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API Key requerida en header 'x-api-key'")
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API Key inválida")

# Endpoints
@app.get("/", tags=["Info"])
async def root():
    """Endpoint de información básica de la API"""
    return {
        "message": "API MEC PCO funcionando correctamente",
        "version": "1.1.0",
        "status": "healthy",
        "database_driver": "pymssql",
        "endpoints": {
            "health": "/health",
            "data": "/data?limit=10",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint para monitoring"""
    try:
        # Probar conexión a la base de datos
        conn = get_connection()
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2025-09-16T21:00:00Z"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")

@app.get("/data", dependencies=[Depends(verify_api_key)], tags=["Data"])
async def get_data(limit: int = 10):
    """
    Obtiene datos de la tabla MontoColoCadoPC
    
    - **limit**: Número máximo de registros a retornar (default: 10, max: 1000)
    """
    # Validar límite
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="Limit debe estar entre 1 y 1000")
    
    conn = None
    try:
        logger.info(f"Fetching {limit} records from database")
        conn = get_connection()
        cursor = conn.cursor()
        
        # Query segura con parámetros
        cursor.execute("SELECT TOP (?) * FROM BVQ_ADMINISTRACION.MontoColoCadoPC", (limit,))
        
        # Obtener nombres de columnas
        columns = [column[0] for column in cursor.description]
        
        # Obtener datos
        rows = cursor.fetchall()
        
        # Convertir a diccionarios
        result = [dict(zip(columns, row)) for row in rows]
        
        logger.info(f"Successfully retrieved {len(result)} records")
        
        return {
            "status": "success",
            "count": len(result),
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener datos: {str(e)}")
    
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass
