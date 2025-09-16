from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from typing import Optional

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importaciones de drivers de DB con manejo de errores
db_drivers = {}

try:
    import pymssql
    db_drivers['pymssql'] = pymssql
    logger.info("pymssql driver loaded successfully")
except ImportError as e:
    logger.warning(f"pymssql not available: {e}")

try:
    import pyodbc
    db_drivers['pyodbc'] = pyodbc
    logger.info("pyodbc driver loaded successfully")
except ImportError as e:
    logger.warning(f"pyodbc not available: {e}")

if not db_drivers:
    logger.error("No database drivers available!")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("API starting up...")
    logger.info(f"Available DB drivers: {list(db_drivers.keys())}")
    yield
    # Shutdown
    logger.info("API shutting down...")

# Crear app FastAPI con configuración mejorada
app = FastAPI(
    title="API MEC PCO",
    description="API para consulta de datos de SQL Server",
    version="1.0.1",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables de conexión con validación
SQL_SERVER = os.getenv("SQL_SERVER", "10.70.0.31")
SQL_DATABASE = os.getenv("SQL_DATABASE", "dbcentral")
SQL_USERNAME = os.getenv("SQL_USERNAME", "usrsicav")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "$icav2012*")
API_KEY = os.getenv("API_KEY", "prueba")

# Validar configuración crítica
if not SQL_SERVER or not SQL_DATABASE:
    logger.error("Database configuration is incomplete!")

# Conexión robusta con múltiples drivers
def get_connection():
    """
    Establece conexión a SQL Server usando el mejor driver disponible.
    Prioridad: pymssql -> pyodbc
    """
    connection_errors = []
    
    # Intentar con pymssql (mejor para contenedores Linux)
    if 'pymssql' in db_drivers:
        try:
            logger.info("Attempting connection with pymssql...")
            conn = db_drivers['pymssql'].connect(
                server=SQL_SERVER,
                database=SQL_DATABASE,
                user=SQL_USERNAME,
                password=SQL_PASSWORD,
                timeout=30,
                login_timeout=30
            )
            logger.info("Successfully connected with pymssql")
            return conn
        except Exception as e:
            error_msg = f"pymssql connection failed: {str(e)}"
            logger.warning(error_msg)
            connection_errors.append(error_msg)
    
    # Fallback a pyodbc
    if 'pyodbc' in db_drivers:
        try:
            logger.info("Attempting connection with pyodbc...")
            # Intentar diferentes drivers ODBC
            drivers_to_try = [
                "ODBC Driver 18 for SQL Server",
                "ODBC Driver 17 for SQL Server",
                "FreeTDS"
            ]
            
            for driver in drivers_to_try:
                try:
                    conn_str = (
                        f"DRIVER={{{driver}}};"
                        f"SERVER={SQL_SERVER};"
                        f"DATABASE={SQL_DATABASE};"
                        f"UID={SQL_USERNAME};"
                        f"PWD={SQL_PASSWORD};"
                        "Encrypt=no;"
                        "TrustServerCertificate=yes;"
                        "Connection Timeout=30;"
                    )
                    conn = db_drivers['pyodbc'].connect(conn_str)
                    logger.info(f"Successfully connected with pyodbc using {driver}")
                    return conn
                except Exception as driver_error:
                    logger.debug(f"Driver {driver} failed: {driver_error}")
                    continue
            
            # Si llegamos aquí, todos los drivers fallaron
            error_msg = "All pyodbc drivers failed"
            connection_errors.append(error_msg)
            
        except Exception as e:
            error_msg = f"pyodbc connection failed: {str(e)}"
            logger.error(error_msg)
            connection_errors.append(error_msg)
    
    # Si llegamos aquí, todas las conexiones fallaron
    all_errors = "; ".join(connection_errors)
    logger.error(f"All database connection attempts failed: {all_errors}")
    raise HTTPException(
        status_code=500, 
        detail=f"Database connection failed. Errors: {all_errors}"
    )

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
        "version": "1.0.1",
        "status": "healthy",
        "available_drivers": list(db_drivers.keys()),
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
