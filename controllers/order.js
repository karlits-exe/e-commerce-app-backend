const Order = require("../models/Order");
const Cart = require("../models/Cart"); 
const { errorHandler, verify, verifyAdmin } = require("../auth.js");

module.exports.checkout = (req, res) => {
  return Cart.findOne({ userId: req.user.id })
    .then(cart => {
      if (!cart || cart.cartItems.length === 0) {
        return res.status(404).send({ message: "No items to checkout" });
      }

      const newOrder = new Order({
        userId: req.user.id,
        productsOrdered: cart.cartItems,
        totalPrice: cart.totalPrice,
        orderedOn: new Date(),
        status: "Pending"
      });

      // Save the order
      return newOrder.save().then((order) => {
        // Optional: clear the cart after checkout
        cart.cartItems = [];
        cart.totalPrice = 0;
        return cart.save().then(() => {
          res.status(201).send({
            message: "Ordered Successfully"
          });
        });
      });
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getMyOrders = (req, res) => {
  return Order.find({ userId: req.user.id })
    .then((result) => {
      if (result.length > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "No Orders Found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getAllOrders = (req, res) => {
  return Order.find({})
    .then((result) => {
      if (result.length > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "No Orders Found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};
