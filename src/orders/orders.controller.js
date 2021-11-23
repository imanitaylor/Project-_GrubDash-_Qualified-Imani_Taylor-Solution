const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//---Middleware functions---//
function isValidOrder(req, res, next){ 
    const { data } = req.body;
    const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
    for (const field of requiredFields) {
        if (!data[field]) {
            return next({
                status: 400,
                message: `Order must include a ${field}`
            })
        }
    }
    next();
}


function isValidOrderDish(req, res, next){ 
    const { data: { dishes } } = req.body;
    
    //makes sure dishes is an array that has at least one item
    if ( !Array.isArray(dishes) || dishes.length<1){
        next({
            status: 400,
            message:"Order must include at least one dish",
        })
    }
    

    for (let i=0; i<dishes.length; i++){
        if (!dishes[i].quantity) {
            return next({
                status: 400,
                message: `Dish ${[i + 1]} must have a quantity that is an integer greater than 0`,
            })
        }
    
        if ( typeof dishes[i].quantity !== "number" || dishes[i].quantity < 1){
            return next({
                status: 400,
                message: `Dish ${[i + 1]} must have a quantity that is an integer greater than 0`,
            })
        }
    
    }

    next();
}






//---Router functions---//

function list (req, res){
    res.json({ data: orders });
}



function create (req, res){
    const { data: { deliverTo, mobileNumber, status, dishes: [{ name, description, image_url, price, quantity }] }} = req.body;

    const newOrder ={
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes: [{ 
            id: nextId(),
            name,
            description,
            image_url,
            price,
            quantity
            }]
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}



module.exports = { list, create: [isValidOrder, isValidOrderDish, create] };