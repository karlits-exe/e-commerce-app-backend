const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user");
const productRoutes = require('./routes/product');
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const app = express();
require('dotenv').config();

const corsOptions = {
	// to update origin of request
	origin: ['http://localhost:8000'],
	// methods: ['GET', 'POST'],p
	//allowedHeaders: ['Content-Type', 'Authorization']
	credentials: true, //(cookies, authorization headers)
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas."));

app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// if(require.main === module){
//     app.listen(process.env.PORT || 3000, () => console.log(`Server running at port ${process.env.PORT || 3000}`));
// }

module.exports = {app,mongoose};