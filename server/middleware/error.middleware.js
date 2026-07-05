export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
  next();
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[API error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
