const express = require("express");
const orderController = require('../controllers/order');
const cartController = require("../controllers/cart");

const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post('/checkout', verify, orderController.checkout);

router.get('/my-orders', verify, orderController.getMyOrders);

router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders)

module.exports = router;