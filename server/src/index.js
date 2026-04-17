/**
 * TaskFlow API - Servidor principal
 * Orquesta: configuracion, middlewares, rutas y manejo de errores
 */

const express = require('express');
const cors = require('cors');
const configuracion = require('./config/env');
const loggerMiddleware = require('./middleware/logger');
const rutasTareas = require('./routes/task.routes');

// Instanciar aplicacion Express
const app = express();

/**
 * MIDDLEWARES GLOBALES
 * Se ejecutan en este orden para TODAS las peticiones
 */

// 1) Parser JSON - Transforma req.body en objetos JS
app.use(express.json());

// 2) CORS - Permite solicitudes desde otros origenes
// En desarrollo se acepta cualquier origen para no bloquear el frontend
// En produccion usar la variable CORS_ORIGIN del .env
app.use(
  cors({
    origin: configuracion.esDesarrollo ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:3001'),
    credentials: !configuracion.esDesarrollo,
  })
);

// 3) Logger personalizado - Auditoria de peticiones
app.use(loggerMiddleware);

/**
 * RUTAS DE NEGOCIO
 */

// Ruta de salud - Verificar que el servidor esta activo
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'Servidor activo',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de tareas - Prefijo /api/v1/tasks
app.use('/api/v1/tasks', rutasTareas);

/**
 * MANEJO DE RUTAS NO ENCONTRADAS (404)
 */
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * MIDDLEWARE GLOBAL DE ERRORES
 * Debe ir DESPUES de todas las rutas y middlewares
 * Firma obligatoria: (err, req, res, next)
 */
app.use((err, req, res, next) => {
  console.error('ERROR NO CONTROLADO:', err);

  let codigoEstado = 500;
  let mensaje = 'Error interno del servidor';

  if (err.message === 'NOT_FOUND') {
    codigoEstado = 404;
    mensaje = 'Recurso no encontrado';
  } else if (err.name === 'ValidationError') {
    codigoEstado = 400;
    mensaje = 'Error de validacion';
  }

  res.status(codigoEstado).json({
    exito: false,
    error: mensaje,
    ...(configuracion.esDesarrollo && { detalle: err.message }),
  });
});

/**
 * INICIAR SERVIDOR
 * En local se llama a listen(); en Vercel (serverless) este bloque no se ejecuta
 * porque el modulo es importado, no ejecutado directamente.
 */
if (require.main === module) {
  app.listen(configuracion.PORT, () => {
    console.log(`TaskFlow API activa en http://localhost:${configuracion.PORT} (${configuracion.NODE_ENV})`);
  });
}

module.exports = app;
