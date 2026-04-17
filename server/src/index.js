
const express = require('express');
const cors = require('cors');
const configuracion = require('./config/env');
const loggerMiddleware = require('./middleware/logger');
const rutasTareas = require('./routes/task.routes');

const app = express();


app.use(express.json());

app.use(
  cors({
    origin: configuracion.esDesarrollo ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:3001'),
    credentials: !configuracion.esDesarrollo,
  })
);

app.use(loggerMiddleware);


app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'Servidor activo',
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/v1/tasks', rutasTareas);



app.use((req, res) => {
  res.status(404).json({
    exito: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

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


if (require.main === module) {
  app.listen(configuracion.PORT, () => {
    console.log(`TaskFlow API activa en http://localhost:${configuracion.PORT} (${configuracion.NODE_ENV})`);
  });
}

module.exports = app;
