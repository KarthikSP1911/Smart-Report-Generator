const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  let message = err.message || "Internal Server Error";
  
  // Sanitize Prisma database connection errors
  if (message.includes("Can't reach database server") || message.includes("PrismaClient")) {
      message = "Database connection error. Please ensure the database is active and try again.";
  }

  res.status(500).json({
    success: false,
    message,
  });
};

export default errorHandler;