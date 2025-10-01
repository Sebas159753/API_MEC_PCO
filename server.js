const App = require('./src/app');

// Crear y iniciar la aplicación
const app = new App();

// Iniciar el servidor
app.start().catch(error => {
    console.error('❌ Error fatal al iniciar la aplicación:', error);
    process.exit(1);
});
