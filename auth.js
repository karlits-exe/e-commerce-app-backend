//JSON web tokens are industry standard for sending information between our applications  in a secure manner.
const jwt = require('jsonwebtoken');
require('dotenv').config();
// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the "secret code"
- Only the system that knows the "secret code" that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

// Wrapping of Token/ Token Creation:
/*
	Analogy: Packing of gift and provide a lock with the secret code as the key.
*/

module.exports.createAccessToken = (user) => {
	
	// This is our payload, it contains the id, email and isAdmin property of the user.
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}


	// This is the sign method of jsonwebtoken package:
		// Syntax:
			// jwt.sign(payload, secretKey, additional options);
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {})
}



//Unwrapping of Token
//[SECTION] Token Verification
/*
Analogy
    Receive the gift and open the lock to verify if the the sender is legitimate and the gift was not tampered with
- Verify will be used as a middleware in ExpressJS. Functions added as argument in an expressJS route are considered as middleware and is able to receive the request and response objects as well as the next() function. Middlewares will be further elaborated on later sessions.
*/

module.exports.verify = (req, res, next) => {

	let token = req.headers.authorization;

	if(typeof token === "undefined") {
		return res.send({ auth: "Failed. No Token"});
	} else {
		console.log(token);
		token = token.slice(7, token.length);
		console.log(token);


		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken) {

			if(err) {
				return res.status(403).send({
					auth:"Failed",
					message: err.message
				})
			} else {
				console.log("result from verify method:")
				console.log(decodedToken);

				req.user = decodedToken; //id, email, isAdmin

				next();
			}
		})
	}
}



//[SECTION] Verify Admin
module.exports.verifyAdmin = (req, res, next) => {

	// console.log("result from verifyAdmin method");
	// console.log(req.user)

	if(req.user.isAdmin) {
		next()
	} else {

		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}


//[SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {

	console.error(err);

	const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error'

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	});
}
