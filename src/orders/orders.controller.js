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
                message: `Dish ${[i]} must have a quantity that is an integer greater than 0`,
            })
        }
    
        if ( typeof dishes[i].quantity !== "number" || dishes[i].quantity < 1){
            return next({
                status: 400,
                message: `Dish ${[i]} must have a quantity that is an integer greater than 0`,
            })
        }
    
    }
    next();
}



function orderExists (req, res, next){
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message:`Order does not exist: ${orderId}`,
    })
}


function orderRouteIdMatch (req, res, next){
    const { orderId } = req.params;
    const { data: { id } } = req.body
    if (id){
        if(id === orderId){
            next();
        }
        next({
            status:400,
            message:`Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        })
    }
    next();
}

function isValidStatus (req, res, next){
    const { data: { status } } = req.body;

    if (!status || status.length === 0 || status === "invalid") {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }

    if (status === "delivered"){
        return next({
            status: 400,
            message: "A delivered order cannot be changed",
        })
    }

    next();

}

function isStatusPending (req, res, next){
    const { status } = res.locals.order;
   
       if(status !== "pending"){
        return next({
           status:400,
           message:"An order cannot be deleted unless it is pending",
       })
       
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


function read (req, res){
    res.json({ data: res.locals.order})
}

//not completely working right. dishes is coming back as undefined. problem with updating a dish in an order
// **** have to fix

function update(req, res){
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes }} = req.body;
    const originalDelivery = order.deliverTo;
    const originalNumber = order.mobileNumber;
    const originalStatus = order.status;
    const originalDishes = order.dishes;

    if (originalDelivery !== deliverTo ){
        order.deliverTo = deliverTo;
    }

    if (originalNumber !== mobileNumber){
        order.mobileNumber = mobileNumber
    }

    if (originalStatus !== status ){
        order.status = status;
    }

    if (originalDishes !== dishes ){
        order.dishes = dishes;
    }

    
    res.json({ data: res.locals.order })

}

function destroy(req, res){
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);

    const deletedOrder = orders.splice(index, 1);

    res.sendStatus(204);
}



module.exports = { list, create: [isValidOrder, isValidOrderDish, create], read: [orderExists, read], update: [orderExists, orderRouteIdMatch, isValidOrder, isValidOrderDish, isValidStatus, update], delete: [orderExists, isStatusPending, destroy] };