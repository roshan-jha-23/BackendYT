import {asyncHandler} from '../utils/asyncHandler.js'



const registerUser=asyncHandler(async (req,res)=>{
     res.status(200).json({
        message:'ye agar aaya matlab sucessful hai dost'
    })
})

export { registerUser }; 