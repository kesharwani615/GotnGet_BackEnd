class ApiError extends Error {
    constructor(
        statusCode,
        message="Something went wrong",
        error = [],
        stack = ""
    ){
        console.log(statusCode, message)
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;

          if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;