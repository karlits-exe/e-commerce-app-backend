const Product = require("../models/Product");
const { errorHandler } = require("../auth.js");

module.exports.createProduct = (req, res) => {
  let newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  });

  return newProduct
    .save()
    .then((result) => res.status(201).send({ message: "Product created" }))
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getAllProducts = (req, res) => {
  return Product.find({})
    .then((result) => {
      if (result.length > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "No products found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getActiveProducts = (req, res) => {
  return Product.find({ isActive: true })
    .then((result) => {
      if (result.length > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "No active products found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getProduct = (req, res) => {
  return Product.findById(req.params.productId)
    .then((result) => {
      if (result) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.updateProduct = (req, res) => {
  let updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };

  return Product.findByIdAndUpdate(req.params.productId, updatedProduct, {
    new: true,
  })
    .then((result) => {
      if (result) {
        return res.status(200).send({ message: "Product updated successfully" });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.archiveProduct = (req, res) => {
  return Product.findByIdAndUpdate(
    req.params.productId,
    { isActive: false },
    { new: true },
  )
    .then((result) => {
      if (result) {
        return res.status(200).send({ message: "Product archived successfully" });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.activateProduct = (req, res) => {
  return Product.findByIdAndUpdate(
    req.params.productId,
    { isActive: true },
    { new: true },
  )
    .then((result) => {
      if (result) {
        return res.status(200).send({ message: "Product activated successfully" });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};


module.exports.searchByName = (req, res) => {
  return Product.find({name: {$regex: req.body.name, $options: "i"}})
    .then((result) => {
        return res.status(200).send({result});
    })
    .catch((error) => errorHandler(error, req, res));
}

module.exports.searchByPrice = (req, res) => {
  return Product.find({
    price: { $gte: req.body.minPrice, $lte: req.body.maxPrice },
  })
    .then((result) => {
        return res.status(200).send(result);
    })
    .catch((error) => errorHandler(error, req, res));
}