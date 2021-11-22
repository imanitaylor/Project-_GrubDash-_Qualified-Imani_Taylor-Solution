const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


// TODO: Implement the /dishes handlers needed to make the tests pass
//---Middleware functions---//

function isValidDish(req, res, next){ 
    const { data } = req.body;
    const requiredFields = ["name", "description", "price", "image_url"];
    for (const field of requiredFields) {
        if (!data[field]) {
            return next({
                status: 400,
                message: `Dish must include a ${field}`
            })
        }
    }

    if ( typeof data.price !== "number" || data.price < 1){
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    }

    next();
}






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



module.exports = { list, create: [isValidDish, create] };