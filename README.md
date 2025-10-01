# API REST - MontoColoCadoPC

API REST desarrollada en Node.js con Express para gestionar los datos de la tabla `BVQ_ADMINISTRACION.MontoColoCadoPC` en SQL Server.

## 🚀 Características

- **Framework**: Express.js
- **Base de datos**: SQL Server (mssql)
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Validación**: express-validator
- **Logging**: Morgan
- **Desarrollo**: Nodemon para hot reload

## 📋 Prerrequisitos

- Node.js (versión 14 o superior)
- SQL Server con acceso a la base de datos DBCENTRAL
- npm o yarn

## 🔧 Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd mec_pco
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copiar el archivo `.env.example` a `.env` y configurar las variables:
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   DB_SERVER=10.70.0.31
   DB_DATABASE=DBCENTRAL
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERTIFICATE=true
   
   PORT=3000
   NODE_ENV=development
   
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## 🚦 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Endpoints del API

### Base URL
```
http://localhost:3000/api
```

### Información del API
- **GET** `/` - Información general del API
- **GET** `/health` - Estado de salud del API

### Gestión de Montos Colocados

#### Obtener todos los registros
```http
GET /api/montos
```

**Parámetros de consulta opcionales:**
- `page` (número): Página (default: 1)
- `limit` (número): Registros por página (default: 50, máx: 100)
- `emi_nombre` (string): Filtrar por nombre del emisor
- `rmv` (string): Filtrar por código RMV
- `emision` (string): Filtrar por número de emisión
- `fecha_desde` (fecha): Fecha desde (formato ISO)
- `fecha_hasta` (fecha): Fecha hasta (formato ISO)

**Ejemplo:**
```http
GET /api/montos?page=1&limit=20&emi_nombre=Memorial
```

#### Obtener registro específico
```http
GET /api/montos/:rmv
```

**Ejemplo:**
```http
GET /api/montos/2010.1.02.00807
```

#### Crear nuevo registro
```http
POST /api/montos
Content-Type: application/json

{
  "emi_nombre": "Nombre del Emisor",
  "RMV": "2023.1.01.00001",
  "Emision": "1",
  "Vencimiento_oferta_publica": "2024-12-31T00:00:00.000Z",
  "Monto_emitido": 1000000,
  "Registro_de_Inscripcion": "REG001",
  "Fecha_de_Emision_OP": "2023-01-01T00:00:00.000Z",
  "Fecha_de_Vencimiento_OP": "2023-12-31T00:00:00.000Z",
  "Calificacion": "AAA",
  "Fecha_calificacion": "2023-01-01T00:00:00.000Z",
  "Calificadora": "Calificadora S.A."
}
```

#### Actualizar registro
```http
PUT /api/montos/:rmv
Content-Type: application/json

{
  "Monto_emitido": 1500000,
  "Calificacion": "AA+"
}
```

#### Eliminar registro
```http
DELETE /api/montos/:rmv
```

#### Obtener estadísticas
```http
GET /api/montos/stats
```

## 📊 Estructura de Respuestas

### Respuesta exitosa
```json
{
  "success": true,
  "message": "Descripción de la operación",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### Respuesta de error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ]
}
```

## 🗂️ Estructura del Proyecto

```
mec_pco/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de base de datos
│   ├── controllers/
│   │   └── montoColocadoController.js  # Controladores
│   ├── middleware/
│   │   ├── errorHandler.js      # Manejo de errores
│   │   └── validation.js        # Validaciones
│   ├── routes/
│   │   ├── index.js            # Rutas principales
│   │   └── montoColocado.js    # Rutas específicas
│   ├── services/
│   │   └── montoColocadoService.js     # Lógica de negocio
│   └── app.js                  # Configuración de Express
├── .env                        # Variables de entorno
├── .env.example               # Ejemplo de variables
├── server.js                  # Punto de entrada
├── package.json              # Dependencias y scripts
└── README.md                 # Documentación
```

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso cross-origin
- **Rate Limiting**: Limitación de solicitudes por IP
- **Validación de entrada**: Sanitización y validación de datos
- **Manejo de errores**: Sin exposición de información sensible

## 🔍 Validaciones

### Campos validados:
- `emi_nombre`: Máximo 250 caracteres
- `RMV`: Máximo 50 caracteres (identificador único)
- `Emisión`: Máximo 6 caracteres
- `Monto_emitido`: Número positivo
- Fechas: Formato ISO 8601
- `Calificación`: Máximo 10 caracteres
- `Calificadora`: Máximo 200 caracteres

## 📈 Monitoreo

### Logs
- Requests HTTP (desarrollo: formato dev, producción: formato combined)
- Errores de base de datos
- Errores de aplicación

### Health Check
```http
GET /api/health
```

Retorna información sobre:
- Estado del servidor
- Tiempo activo
- Timestamp actual

## 🚀 Despliegue

### Variables de entorno de producción
```env
NODE_ENV=production
DB_SERVER=servidor_produccion
DB_USER=usuario_produccion
DB_PASSWORD=password_segura
PORT=80
```

### PM2 (Recomendado para producción)
```bash
npm install -g pm2
pm2 start server.js --name "mec-pco-api"
```

## 🧪 Testing

Para probar la API puedes usar:

### cURL
```bash
# Obtener todos los registros
curl http://localhost:3000/api/montos

# Obtener un registro específico
curl http://localhost:3000/api/montos/2010.1.02.00807

# Health check
curl http://localhost:3000/api/health
```

### Postman
Importa la URL base `http://localhost:3000/api` y configura los endpoints según la documentación.

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar credenciales en `.env`
- Comprobar conectividad al servidor SQL Server
- Verificar que la base de datos DBCENTRAL esté disponible

### Error 503 - Servicio no disponible
- Verificar que SQL Server esté ejecutándose
- Revisar configuración de red y firewall

### Errores de validación
- Revisar el formato de los datos enviados
- Verificar que los campos requeridos estén presentes

## 📞 Soporte

Para reportar problemas o solicitar nuevas características, contactar al desarrollador o crear un issue en el repositorio del proyecto.

---

**Versión**: 1.0.0  
**Desarrollado por**: sjacome  
**Tecnologías**: Node.js, Express.js, SQL Server
