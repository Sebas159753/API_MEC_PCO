const database = require('./src/config/database');

async function testConnection() {
    try {
        console.log('🔄 Probando conexión a la base de datos...');
        await database.connect();
        
        const pool = database.getPool();
        const result = await pool.request().query('SELECT COUNT(*) as total FROM BVQ_ADMINISTRACION.MontoColoCadoPC');
        
        console.log('✅ Conexión exitosa!');
        console.log(`📊 Total de registros en MontoColoCadoPC: ${result.recordset[0].total}`);
        
        await database.disconnect();
        console.log('✅ Prueba completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en la prueba de conexión:', error.message);
        console.log('\n💡 Verifica que:');
        console.log('   - Las credenciales en .env son correctas');
        console.log('   - El servidor SQL Server está disponible');
        console.log('   - La base de datos DBCENTRAL existe');
        console.log('   - La tabla BVQ_ADMINISTRACION.MontoColoCadoPC existe');
    }
}

testConnection();
