//[SECTION] Dependencies and Modules
const User = require('../models/User');
// bcrypt is one of the many packages that we can use to encrypt strings or passwords
const bcrypt = require('bcrypt');

const auth = require('../auth.js');


module.exports.checkEmailExists = (req, res) => {

    if(req.body.email.includes("@")){

        return User.find({ email : req.body.email })
        .then(result => {

            if (result.length > 0) {

                return res.status(409).send({ message: 'Duplicate email found.' });

            } else {

                return res.status(404).send({ message: 'No duplicate email found.' });
            };
        })
        .catch(error => errorHandler(error, req, res))
    
    } else {
        res.status(400).send({ message: 'Invalid email format.' });
    }
 
};

module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({message: 'Invalid email'});
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: "Mobile number invalid" });
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: "Password must be atleast 8 characters" });
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({message: 'Registered Successfully'}))
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.loginUser = (req, res) => {

    if(req.body.email.includes("@")){

       return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                // Send status 404
                return res.status(404).send({ message: "No email Found" });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {

                    //Send status 200
                    return res.status(200).send({ access : auth.createAccessToken(result)})
                } else {

                    //Send status 401
                    return res
                      .status(401)
                      .send({ message: "Email and password do not match" });
                }
            }
        })
        .catch(error => errorHandler(error, req, res)); 
    } else {
        return res.status(400).send({ message: "Invalid email" });
    }
};

module.exports.getProfile = (req, res) => {

    return User.findById(req.user.id)
    .then(user => {
        if(user){
            user.password = "";
            return res.status(200).send(user);
        } else{
            return res.status(404).send({message: "User not found"})
        }
    })
    .catch(error => errorHandler(error, req, res))
};

module.exports.setAdmin = (req, res) => {
    return User.findById(req.params.id)
    .then(result => {
        if(!result){
            return res
              .status(404)
              .send({ message: "User not found" });

        }
        if(result.isAdmin){
            return res.status(200).send({message: 'User is already an admin'})
        }

        result.isAdmin = true;
        return result.save().then(() => {
            return res.status(200).send({message: 'Successfully set as admin'})
        })
    }).catch(err => res.status(400).send(err.message))
}

module.exports.updatePassword = (req, res) => {
    let newPassword = req.body.newPassword

    if(!newPassword){
        return res.status(400).send({message: 'New Password is required'})
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)

    return User.findByIdAndUpdate(req.user.id, {password: hashedPassword})
    .then(result => {
      if (result) {
        return res
          .status(200)
          .send({ message: "Password reset successfully" });
      } else {
        return res.status(404).send({ message: "User not found" });
      }
    })
    .catch(err => {
        return res.status(500).send({ message: 'Error updating password' })
    })
}