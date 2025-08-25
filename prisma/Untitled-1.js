

const  insertUser =  async ( req , res) => {
 const {data }= req.body;
const  user = await prima.user.create({
    data:data 
})

}