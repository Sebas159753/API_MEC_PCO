# Copilot Instructions for MontoColoCadoPC API

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a Node.js Express REST API project for managing data from the SQL Server table `BVQ_ADMINISTRACION.MontoColoCadoPC`.

## Guidelines
- Follow REST API best practices
- Use Express.js framework patterns
- Implement proper error handling and validation
- Use SQL Server (mssql package) for database operations
- Follow MVC architecture pattern
- Include comprehensive logging with morgan
- Implement security middleware (helmet, cors, rate limiting)
- Use environment variables for configuration
- Validate input data using express-validator
- Return consistent JSON responses
- Use proper HTTP status codes
- Include proper CORS configuration
- Implement database connection pooling

## Database Schema
The main table `MontoColoCadoPC` contains financial data with the following key fields:
- emi_nombre (nvarchar): Issuer name
- RMV (varchar): Registration code
- Emisión (nchar): Emission number
- Vencimiento oferta pública (datetime): Public offer expiration
- Monto emitido (float): Issued amount
- Various calculated and derived fields for amounts and dates

## API Endpoints Structure
Follow RESTful conventions:
- GET /api/montos - Get all records with optional filtering
- GET /api/montos/:id - Get specific record
- POST /api/montos - Create new record
- PUT /api/montos/:id - Update specific record
- DELETE /api/montos/:id - Delete specific record
