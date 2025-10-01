const express = require('express');
const router = express.Router();

// Importar rutas específicas
const montoColocadoRoutes = require('./montoColocado');

// Usar las rutas
router.use('/montos', montoColocadoRoutes);

// Ruta de salud del API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API MontoColoCadoPC funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Ruta raíz del API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bienvenido al API de MontoColoCadoPC',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            montos: {
                getAll: 'GET /api/montos',
                getById: 'GET /api/montos/:rmv',
                create: 'POST /api/montos',
                update: 'PUT /api/montos/:rmv',
                delete: 'DELETE /api/montos/:rmv',
                stats: 'GET /api/montos/stats'
            }
        },
        documentation: {
            swagger: '/api-docs',
            postman: 'Importar colección desde /docs/postman'
        }
    });
});

module.exports = router;
