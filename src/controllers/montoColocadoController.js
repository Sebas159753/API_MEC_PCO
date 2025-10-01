const montoColocadoService = require('../services/montoColocadoService');

class MontoColocadoController {
    // GET /api/montos - Obtener todos los registros
    async getAll(req, res, next) {
        try {
            const filters = {
                emi_nombre: req.query.emi_nombre,
                RMV: req.query.rmv,
                Emisión: req.query.emision,
                fecha_desde: req.query.fecha_desde,
                fecha_hasta: req.query.fecha_hasta
            };

            // Remover filtros vacíos
            Object.keys(filters).forEach(key => {
                if (!filters[key]) delete filters[key];
            });

            const pagination = {
                page: req.query.page || 1,
                limit: req.query.limit || 50
            };

            const result = await montoColocadoService.getAll(filters, pagination);

            res.json({
                success: true,
                message: 'Registros obtenidos exitosamente',
                data: result.data,
                pagination: result.pagination,
                filters: Object.keys(filters).length > 0 ? filters : null
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/montos/:rmv - Obtener un registro específico
    async getById(req, res, next) {
        try {
            const { rmv } = req.params;
            const record = await montoColocadoService.getById(rmv);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Registro obtenido exitosamente',
                data: record
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/montos - Crear un nuevo registro
    async create(req, res, next) {
        try {
            const newRecord = await montoColocadoService.create(req.body);

            res.status(201).json({
                success: true,
                message: 'Registro creado exitosamente',
                data: newRecord
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/montos/:rmv - Actualizar un registro
    async update(req, res, next) {
        try {
            const { rmv } = req.params;
            const updatedRecord = await montoColocadoService.update(rmv, req.body);

            res.json({
                success: true,
                message: 'Registro actualizado exitosamente',
                data: updatedRecord
            });
        } catch (error) {
            if (error.message === 'Registro no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // DELETE /api/montos/:rmv - Eliminar un registro
    async delete(req, res, next) {
        try {
            const { rmv } = req.params;
            const deletedRecord = await montoColocadoService.delete(rmv);

            res.json({
                success: true,
                message: 'Registro eliminado exitosamente',
                data: deletedRecord
            });
        } catch (error) {
            if (error.message === 'Registro no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // GET /api/montos/stats - Obtener estadísticas
    async getStats(req, res, next) {
        try {
            const stats = await montoColocadoService.getStats();

            res.json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MontoColocadoController();
