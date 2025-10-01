const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const database = require('./config/database');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

class App {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    
    initializeMiddlewares() {
        // Seguridad
        this.app.use(helmet());
        
        // CORS
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://yourdomain.com'] // Cambiar por tu dominio en producción
                : '*',
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            message: {
                success: false,
                message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
            }
        });
        this.app.use('/api/', limiter);
        
        // Logging
        this.app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    }
    
    initializeRoutes() {
        // Rutas del API
        this.app.use('/api', apiRoutes);
        
        // Ruta raíz
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'API MontoColoCadoPC - Servidor funcionando',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                endpoints: {
                    api: '/api',
                    health: '/api/health',
                    montos: '/api/montos'
                }
            });
        });
    }
    
    initializeErrorHandling() {
        // Manejar rutas no encontradas
        this.app.use(notFoundHandler);
        
        // Manejar errores
        this.app.use(errorHandler);
    }
    
    async start() {
        try {
            // Conectar a la base de datos
            await database.connect();
            
            // Iniciar servidor
            this.server = this.app.listen(this.port, () => {
                console.log('🚀 ================================');
                console.log(`🚀 API MontoColoCadoPC iniciada`);
                console.log(`🚀 Puerto: ${this.port}`);
                console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🚀 URL: http://localhost:${this.port}`);
                console.log(`🚀 API Docs: http://localhost:${this.port}/api`);
                console.log('🚀 ================================');
            });
            
            // Manejar señales de terminación
            this.handleTermination();
            
        } catch (error) {
            console.error('❌ Error al iniciar el servidor:', error);
            process.exit(1);
        }
    }
    
    async stop() {
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }
        await database.disconnect();
        console.log('🛑 Servidor detenido correctamente');
    }
    
    handleTermination() {
        // Manejar CTRL+C
        process.on('SIGINT', async () => {
            console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
            await this.stop();
            process.exit(0);
        });
        
        // Manejar terminación del proceso
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
            await this.stop();
            process.exit(0);
        });
        
        // Manejar errores no capturados
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Promesa rechazada no manejada:', reason);
            // No salir del proceso, solo loggear
        });
        
        process.on('uncaughtException', (error) => {
            console.error('❌ Excepción no capturada:', error);
            process.exit(1);
        });
    }
}

module.exports = App;
