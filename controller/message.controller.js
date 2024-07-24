

export const messagesSomeone = (req,res) => {
    const { id } = req.params;

    const userId = req.user.id;

    console.log(id,userId);

    

    

}