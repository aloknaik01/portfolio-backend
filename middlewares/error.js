class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;


    if (err.code === "23505") {
        let field = "field";
        const match = err.detail?.match(/\((.*?)\)/);
        if (match && match[1]) {
            field = match[1];
        }
        err = new ErrorHandler(`Oops! A user with this ${field} already exists. Please use a different one!`, 400);
    }


    if (err.code === "22P02") {
        err = new ErrorHandler("Invalid input format", 400);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("JSON Web Token is Invalid!", 400);
    }
    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("JSON Web Token is Expired, try again!", 400);
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

export default ErrorHandler;