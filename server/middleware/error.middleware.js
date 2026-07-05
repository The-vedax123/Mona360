export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
  next();
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  // eslint-disable-next-line no-console
  console.error(
    `[Mona360 API error] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`,
    status >= 500 ? err.stack : ''
  );
  res.status(status).json({
    error: err.message || 'Internal server error',
    path: req.originalUrl,
  });
}
