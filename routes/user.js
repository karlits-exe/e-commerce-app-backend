//[SECTION] Dependencies and Modules
const express = require('express');
const userController = require('../controllers/user');

const { verify, verifyAdmin } = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

//[SECTION] Route for User Registration
router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.setAdmin);

router.patch('/update-password', verify, userController.updatePassword)



//[SECTION] Activity: Routes for duplicate email
// router.post("/check-email", userController.checkEmailExists);

module.exports = router;


