export const notFound = (req, res, next) => {
  res.status(404).json({ message: "Rota não encontrada" });
};

export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const body = { message: err.message || "Erro interno" };
  if (process.env.NODE_ENV === "development") {
    body.stack = err.stack;
  }
  res.status(status).json(body);
};
