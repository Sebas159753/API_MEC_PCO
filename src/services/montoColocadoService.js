const sql = require('mssql');
const database = require('../config/database');

class MontoColocadoService {
    constructor() {
        this.tableName = 'BVQ_ADMINISTRACION.MontoColoCadoPC';
    }

    // Obtener todos los registros con filtros y paginación
    async getAll(filters = {}, pagination = {}) {
        try {
            const pool = database.getPool();
            const request = pool.request();
            
            let query = `SELECT * FROM ${this.tableName}`;
            const conditions = [];
            
            // Aplicar filtros
            if (filters.emi_nombre) {
                conditions.push(`emi_nombre LIKE @emi_nombre`);
                request.input('emi_nombre', sql.NVarChar, `%${filters.emi_nombre}%`);
            }
            
            if (filters.RMV) {
                conditions.push(`RMV = @RMV`);
                request.input('RMV', sql.VarChar, filters.RMV);
            }
            
            if (filters.Emisión) {
                conditions.push(`[Emisión] = @Emision`);
                request.input('Emision', sql.NChar, filters.Emisión);
            }
            
            if (filters.fecha_desde) {
                conditions.push(`[Fecha de Emision OP] >= @fecha_desde`);
                request.input('fecha_desde', sql.DateTime, filters.fecha_desde);
            }
            
            if (filters.fecha_hasta) {
                conditions.push(`[Fecha de Emision OP] <= @fecha_hasta`);
                request.input('fecha_hasta', sql.DateTime, filters.fecha_hasta);
            }
            
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            // Contar total de registros para paginación
            const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
            const countResult = await request.query(countQuery);
            const total = countResult.recordset[0].total;
            
            // Aplicar paginación
            const page = parseInt(pagination.page) || 1;
            const limit = parseInt(pagination.limit) || 50;
            const offset = (page - 1) * limit;
            
            query += ` ORDER BY [Fecha de Emision OP] DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            
            const result = await request.query(query);
            
            return {
                data: result.recordset,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    }

    // Obtener un registro por ID (usando RMV como identificador)
    async getById(rmv) {
        try {
            const pool = database.getPool();
            const request = pool.request();
            
            request.input('RMV', sql.VarChar, rmv);
            
            const query = `SELECT * FROM ${this.tableName} WHERE RMV = @RMV`;
            const result = await request.query(query);
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    }

    // Crear un nuevo registro
    async create(data) {
        try {
            const pool = database.getPool();
            const request = pool.request();
            
            // Solo incluir campos que se pueden insertar (excluyendo campos calculados)
            const insertableFields = [
                'emi_nombre', 'RMV', 'Emisión', 'Vencimiento oferta pública', 
                'Monto emitido', 'Registro de Inscripcion', 'Fecha de Emision OP', 
                'Fecha de Vencimiento OP', 'Calificación', 'Fecha calificación', 'Calificadora'
            ];
            
            const fields = [];
            const values = [];
            const inputs = [];
            
            insertableFields.forEach(field => {
                const dataKey = field.replace(/ /g, '_').replace(/ó/g, 'o').replace(/ñ/g, 'n');
                if (data[dataKey] !== undefined) {
                    fields.push(`[${field}]`);
                    values.push(`@${dataKey}`);
                    
                    // Definir tipos de datos SQL
                    switch (field) {
                        case 'emi_nombre':
                            request.input(dataKey, sql.NVarChar(250), data[dataKey]);
                            break;
                        case 'RMV':
                        case 'Registro de Inscripcion':
                            request.input(dataKey, sql.VarChar(50), data[dataKey]);
                            break;
                        case 'Emisión':
                            request.input(dataKey, sql.NChar(6), data[dataKey]);
                            break;
                        case 'Vencimiento oferta pública':
                        case 'Fecha de Emision OP':
                        case 'Fecha de Vencimiento OP':
                        case 'Fecha calificación':
                            request.input(dataKey, sql.DateTime, data[dataKey]);
                            break;
                        case 'Monto emitido':
                            request.input(dataKey, sql.Float, data[dataKey]);
                            break;
                        case 'Calificación':
                            request.input(dataKey, sql.NVarChar(10), data[dataKey]);
                            break;
                        case 'Calificadora':
                            request.input(dataKey, sql.VarChar(200), data[dataKey]);
                            break;
                    }
                }
            });
            
            if (fields.length === 0) {
                throw new Error('No se proporcionaron datos válidos para insertar');
            }
            
            const query = `
                INSERT INTO ${this.tableName} (${fields.join(', ')})
                VALUES (${values.join(', ')});
                SELECT * FROM ${this.tableName} WHERE RMV = @RMV;
            `;
            
            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    // Actualizar un registro
    async update(rmv, data) {
        try {
            const pool = database.getPool();
            const request = pool.request();
            
            // Verificar que el registro existe
            const existing = await this.getById(rmv);
            if (!existing) {
                throw new Error('Registro no encontrado');
            }
            
            const updatableFields = [
                'emi_nombre', 'Emisión', 'Vencimiento oferta pública', 
                'Monto emitido', 'Registro de Inscripcion', 'Fecha de Emision OP', 
                'Fecha de Vencimiento OP', 'Calificación', 'Fecha calificación', 'Calificadora'
            ];
            
            const updates = [];
            
            updatableFields.forEach(field => {
                const dataKey = field.replace(/ /g, '_').replace(/ó/g, 'o').replace(/ñ/g, 'n');
                if (data[dataKey] !== undefined) {
                    updates.push(`[${field}] = @${dataKey}`);
                    
                    // Definir tipos de datos SQL
                    switch (field) {
                        case 'emi_nombre':
                            request.input(dataKey, sql.NVarChar(250), data[dataKey]);
                            break;
                        case 'Registro de Inscripcion':
                            request.input(dataKey, sql.VarChar(50), data[dataKey]);
                            break;
                        case 'Emisión':
                            request.input(dataKey, sql.NChar(6), data[dataKey]);
                            break;
                        case 'Vencimiento oferta pública':
                        case 'Fecha de Emision OP':
                        case 'Fecha de Vencimiento OP':
                        case 'Fecha calificación':
                            request.input(dataKey, sql.DateTime, data[dataKey]);
                            break;
                        case 'Monto emitido':
                            request.input(dataKey, sql.Float, data[dataKey]);
                            break;
                        case 'Calificación':
                            request.input(dataKey, sql.NVarChar(10), data[dataKey]);
                            break;
                        case 'Calificadora':
                            request.input(dataKey, sql.VarChar(200), data[dataKey]);
                            break;
                    }
                }
            });
            
            if (updates.length === 0) {
                throw new Error('No se proporcionaron datos válidos para actualizar');
            }
            
            request.input('RMV', sql.VarChar, rmv);
            
            const query = `
                UPDATE ${this.tableName} 
                SET ${updates.join(', ')}
                WHERE RMV = @RMV;
                SELECT * FROM ${this.tableName} WHERE RMV = @RMV;
            `;
            
            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    }

    // Eliminar un registro
    async delete(rmv) {
        try {
            const pool = database.getPool();
            const request = pool.request();
            
            // Verificar que el registro existe
            const existing = await this.getById(rmv);
            if (!existing) {
                throw new Error('Registro no encontrado');
            }
            
            request.input('RMV', sql.VarChar, rmv);
            
            const query = `DELETE FROM ${this.tableName} WHERE RMV = @RMV`;
            await request.query(query);
            
            return existing;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    }

    // Obtener estadísticas básicas
    async getStats() {
        try {
            const pool = database.getPool();
            const request = pool.request();
            
            const query = `
                SELECT 
                    COUNT(*) as total_registros,
                    SUM([Monto emitido]) as monto_total_emitido,
                    AVG([Monto emitido]) as monto_promedio,
                    MIN([Fecha de Emision OP]) as fecha_mas_antigua,
                    MAX([Fecha de Emision OP]) as fecha_mas_reciente
                FROM ${this.tableName}
                WHERE [Monto emitido] IS NOT NULL
            `;
            
            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en getStats:', error);
            throw error;
        }
    }
}

module.exports = new MontoColocadoService();
