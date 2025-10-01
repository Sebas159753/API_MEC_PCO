const express = require('express');
const router = express.Router();
const montoColocadoController = require('../controllers/montoColocadoController');
const { 
    validateMontoColocado, 
    validatePagination, 
    handleValidationErrors 
} = require('../middleware/validation');

// GET /api/montos/stats - Obtener estadísticas (debe ir antes de /:rmv)
router.get('/stats', montoColocadoController.getStats);

// GET /api/montos - Obtener todos los registros con filtros y paginación
router.get('/', 
    validatePagination,
    handleValidationErrors,
    montoColocadoController.getAll
);

// GET /api/montos/:rmv - Obtener un registro específico
router.get('/:rmv', montoColocadoController.getById);

// POST /api/montos - Crear un nuevo registro
router.post('/', 
    validateMontoColocado,
    handleValidationErrors,
    montoColocadoController.create
);

// PUT /api/montos/:rmv - Actualizar un registro
router.put('/:rmv', 
    validateMontoColocado,
    handleValidationErrors,
    montoColocadoController.update
);

// DELETE /api/montos/:rmv - Eliminar un registro
router.delete('/:rmv', montoColocadoController.delete);

module.exports = router;
