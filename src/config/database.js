const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            if (!this.pool) {
                this.pool = await sql.connect(config);
                console.log('📊 Conexión a SQL Server establecida exitosamente');
            }
            return this.pool;
        } catch (error) {
            console.error('❌ Error al conectar con SQL Server:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close();
                this.pool = null;
                console.log('📊 Conexión a SQL Server cerrada');
            }
        } catch (error) {
            console.error('❌ Error al cerrar conexión:', error);
        }
    }

    getPool() {
        return this.pool;
    }
}

const database = new Database();

module.exports = database;
