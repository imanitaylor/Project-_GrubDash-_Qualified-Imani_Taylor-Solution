const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
//---Middleware functions---//



//---Router functions---//

//get notes
function list(req, res){
res.json({ data: dishes})
}


function create (req, res){
    const { data: { name, description, price, image_url }} = req.body;

    const newDish = { 
        id: nextId(),
        name,
        description,
        price,
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}



module.exports = { list, create };