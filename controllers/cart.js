const Cart = require("../models/Cart");
const Product = require("../models/Product");

const { errorHandler } = require("../auth.js");

module.exports.getCart = (req, res) => {
  return Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ message: "Cart is empty" });
      }
      return res.status(200).send({ cart });
    })
    .catch((error) => errorHandler(error, req, res));
};


module.exports.addToCart = (req, res) => {
  return Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      const subtotal = product.price * req.body.quantity;

      return Cart.findOne({ userId: req.user.id }).then((cart) => {
        if (!cart) {
          let newCart = new Cart({
            userId: req.user.id,
            cartItems: [
              {
                productId: req.body.productId,
                quantity: req.body.quantity,
                subtotal: subtotal,
              },
            ],
            totalPrice: subtotal,
          });

          return newCart
            .save()
            .then((savedCart) =>
              res.status(200).send({ message: "Item added to cart successfully", cart: savedCart }),
            );
        }

        // Check if product already exists
        const existingItem = cart.cartItems.find(
          item => item.productId.toString() === req.body.productId
        );

        if (existingItem) {
          // Update existing item
          existingItem.quantity += req.body.quantity;
          existingItem.subtotal = existingItem.quantity * product.price;
        } else {
          // Add new item
          cart.cartItems.push({
            productId: req.body.productId,
            quantity: req.body.quantity,
            subtotal: subtotal
          });
        }

        // Recalculate total price
        cart.totalPrice = cart.cartItems.reduce(
          (sum, item) => sum + item.subtotal,
          0
        );

        return cart
          .save()
          .then((udpatedCart) => res.status(200).send({ message: "Item added to cart successfully", cart: udpatedCart }));
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.updateQuantity = (req, res) => {
  return Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ message: "Cart not found" });
      }

      const item = cart.cartItems.find(
        (item) => item.productId.toString() === req.body.productId,
      );

      if (!item) {
        return res.status(404).send({ message: "Item not found in cart" });
      }

      return Product.findById(item.productId)
        .then(product => {
          if (!product) {
            return res.status(404).send({ message: "Product not found" });
          }

          // Update quantity
          item.quantity = req.body.newQuantity;

          // Recalculate subtotal using real price
          item.subtotal = product.price * item.quantity;

          // Recalculate cart total
          cart.totalPrice = cart.cartItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
          );

        return cart
          .save()
          .then(() => res.status(200).send({
            message: "Quantity updated",
            cart
          }));
        });
      })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.removeFromCart = (req, res) => {
  return Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ message: "Cart not found" });
      } else {
        if(cart.cartItems.length > 0){
          cart.cartItems = cart.cartItems.filter((item) =>
            !item.productId.toString() === req.params.productId,
          );
          cart.totalPrice = cart.cartItems.reduce(
            (sum, item) => sum + item.subtotal,
            0,
          );
          return cart
          .save()
          .then(() => res.status(200).send({message: 'Item removed from cart successfully'}))
          .catch(err => res.status(400).send({message: 'Item not found in cart'}))
        } else {
          return res.status(400).send({message: 'No items in cart'});
        }
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.clearCart = (req, res) => {
  return Cart.findOneAndUpdate(
    { userId: req.user.id },
    { cartItems: [], totalPrice: 0 },
    { new: true }
  )
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ message: "Cart not found", cart: [] });
      }
      
      return res
        .status(200)
        .send({ message: "Cart cleared successfully", cart });
    })
    .catch((error) => errorHandler(error, req, res));
};