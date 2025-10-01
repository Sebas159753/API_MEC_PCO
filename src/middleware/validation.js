const { body, param, query, validationResult } = require('express-validator');

// Validaciones para campos de MontoColoCadoPC
const validateMontoColocado = [
    body('emi_nombre')
        .optional()
        .isLength({ max: 250 })
        .withMessage('El nombre del emisor no puede superar 250 caracteres'),
    
    body('RMV')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El RMV no puede superar 50 caracteres'),
    
    body('Emisión')
        .optional()
        .isLength({ max: 6 })
        .withMessage('La emisión no puede superar 6 caracteres'),
    
    body('Vencimiento_oferta_publica')
        .optional()
        .isISO8601()
        .withMessage('Fecha de vencimiento de oferta pública debe ser una fecha válida'),
    
    body('Monto_emitido')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto emitido debe ser un número positivo'),
    
    body('Casa_Estructuradora')
        .optional()
        .isLength({ max: 300 })
        .withMessage('Casa estructuradora no puede superar 300 caracteres'),
    
    body('Casa_Colocadora')
        .optional()
        .isLength({ max: 80 })
        .withMessage('Casa colocadora no puede superar 80 caracteres'),
    
    body('Registro_de_Inscripcion')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Registro de inscripción no puede superar 50 caracteres'),
    
    body('Fecha_de_Emision_OP')
        .optional()
        .isISO8601()
        .withMessage('Fecha de emisión OP debe ser una fecha válida'),
    
    body('Fecha_de_Vencimiento_OP')
        .optional()
        .isISO8601()
        .withMessage('Fecha de vencimiento OP debe ser una fecha válida'),
    
    body('Calificación')
        .optional()
        .isLength({ max: 10 })
        .withMessage('Calificación no puede superar 10 caracteres'),
    
    body('Fecha_calificacion')
        .optional()
        .isISO8601()
        .withMessage('Fecha de calificación debe ser una fecha válida'),
    
    body('Calificadora')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Calificadora no puede superar 200 caracteres')
];

const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateMontoColocado,
    validateId,
    validatePagination,
    handleValidationErrors
};
