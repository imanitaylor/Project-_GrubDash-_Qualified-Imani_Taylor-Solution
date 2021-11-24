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

//if the id in the URL matches a dish id in the data then next, if not
function dishExists (req, res, next){
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message:`Dish does not exist: ${dishId}`,
    })
}


function dishRouteIdMatch (req, res, next){
    const { dishId } = req.params;
    const { data: { id } } = req.body
    if (id){
        if(id === dishId){
            next();
        }
        next({
            status:400,
            message:`Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }
    else next();
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

function read(req, res){
    res.json({ data: res.locals.dish })
}


function update(req, res){
    const dish = res.locals.dish;

    const originalName = dish.name;
    const originalDescr = dish.description;
    const originalPrice = dish.price;
    const originalImg = dish.image_url;

    const { data: { name, description, price, image_url }} = req.body;
   
    if (originalName !== name ){
        dish.name = name;
    }

    if (originalDescr !== description){
        dish.description = description
    }

    if (originalPrice !== price ){
        dish.price = price;
    }

    if (originalImg !== image_url ){
        dish.image_url = image_url;
    }

    res.json({ data: res.locals.dish })


}



module.exports = { list, create: [isValidDish, create], read: [dishExists, read], update: [dishExists, dishRouteIdMatch, isValidDish, update]};