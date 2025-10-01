const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Error de conexión a base de datos
    if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'TIMEOUT') {
        return res.status(503).json({
            success: false,
            message: 'Error de conexión a la base de datos',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Servicio temporalmente no disponible'
        });
    }

    // Error de SQL Server
    if (err.number) {
        return res.status(400).json({
            success: false,
            message: 'Error en la consulta SQL',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error en la operación de base de datos'
        });
    }

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors
        });
    }

    // Error genérico del servidor
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'Error interno del servidor'
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
