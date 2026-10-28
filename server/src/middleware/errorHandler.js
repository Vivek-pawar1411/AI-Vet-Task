// export function errorHandler(error, _req, res, _next) {
//   const statusCode = error.statusCode
//     || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 0)
//     || (error.code === 11000 ? 409 : 500);
//   if (statusCode >= 500) console.error(error);
//   const message = error.code === 11000
//     ? "A record with these details already exists"
//     : statusCode >= 500
//       ? statusCode === 503 ? error.message : "An unexpected server error occurred"
//       : error.message;
//   res.status(statusCode).json({
//     message,
//     ...(error.name === "ValidationError" ? { errors: Object.values(error.errors).map((item) => item.message) } : {}),
//   });
// }


export function errorHandler(error, _req, res, _next) {
  // 1. Status Code Resolve karein
  const statusCode =
    error.statusCode ||
    (error.name === "ValidationError" || error.name === "CastError" ? 400 : null) ||
    (error.code === 11000 ? 409 : null) ||
    (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? 401 : null) ||
    500;

  // 2. Terminal me 500 errors log karein taaki Render logs me track ho sake
  if (statusCode >= 500) {
    console.error("SERVER ERROR:", error);
  }

  // 3. User-friendly message generate karein
  let message = error.message;

  if (error.code === 11000) {
    message = "A record with these details already exists";
  } else if (statusCode >= 500 && statusCode !== 503 && process.env.NODE_ENV === "production") {
    message = "An unexpected server error occurred";
  }

  // 4. Clean JSON Response
  res.status(statusCode).json({
    message,
    ...(error.name === "ValidationError" && error.errors
      ? { errors: Object.values(error.errors).map((item) => item.message) }
      : {}),
  });
}
