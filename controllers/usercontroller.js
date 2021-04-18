const Express = require('express');
const {UserModel} = require("../models");
const router = Express.Router();
const {UniqueConstraintError} = require("sequelize/lib/errors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.get("/test", (req, res) => {
    res.send("Hey! You're a user and it's working!")
});

//USER REGISTER ROUTE - POST
/***************************/
router.post("/register", async (req, res) => {
    let { username, passwordhash } = req.body.user;
    try{
        const newUser = await UserModel.create({
            username,
            passwordhash: bcrypt.hashSync(passwordhash, 10)
        });

        let token = jwt.sign({id: newUser.id}, 
            process.env.JWT_SECRET, 
            {expiresIn: 60 * 60 * 24});
        
        res.status(201).json({
            message: "User registered",
            user: newUser,
            sessionToken: token
        })

    } catch(err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: "Username already in use",
            })
        } else {
            res.status(500).json({
                message: "Failed to register user",
                error: err
            });
        }
    }
});

//USER LOGIN ROUTE - POST
/***********************/
router.post("/login", async (req, res) => {
    let { username, passwordhash } = req.body.user;
    try {
        const loginUser = await UserModel.findOne({
            where: {username: username}
        })

        if(loginUser){
            let passwordComparison = await bcrypt.compare(passwordhash, loginUser.passwordhash);

            if (passwordComparison) {
                let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});
    
                res.status(200).json({
                    message: "You are logged in!",
                    user: loginUser,
                    sessionToken: token
                });
            } else {
                res.status(401).json({
                    message: "Incorrect Username or Password"
                });
            }
        } else {
            res.status(401).json({
                message: "Incorrect Username or Password"
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Failed to log user in"
        })
    }
});


module.exports = router;