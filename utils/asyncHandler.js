export const asyncHandler =  (requestHandle)=>{
    return async (req,res,next) => {
        try {
            await requestHandle(req,res,next);
        } catch (error) {
           next(error);
        }
    }
}