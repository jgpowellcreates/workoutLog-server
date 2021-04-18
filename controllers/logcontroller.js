const Express = require('express');
const { json } = require('sequelize');
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { LogModel } = require('../models');

router.get('/practice', validateJWT, (req, res) => {
    res.send("Hey! This is a practice route!")
});

/* 
==============
Create New Log
==============
 */
router.post("/", validateJWT, async (req, res) => {
    const {description, definition, result} = req.body.log;
    const {id} = req.user;
    const logEntry = {
        description,
        definition,
        result,
        owner_id: id
    }
    try {
        const newLog = await LogModel.create(logEntry);
        res.status(200).json(newLog);
    } catch (err) {
        res.status(500)/json({ error: err});
    }
})

/* 
==========================
View All Logs for One User
==========================
 */
router.get("/", validateJWT, async (req, res) => {
    let {id} = req.user;
    console.log(id);
    try{
        const userLogs = await LogModel.findAll({
            where: {
                owner_id: id
            }
        });
        res.status(200).json(userLogs);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

/* 
========================
Get Individual Log by ID
========================
 */
router.get("/:id", validateJWT, async (req, res) => {
    const {id} = req.params;
    console.log(req.params);
    try {
        const results = await LogModel.findOne({
            where: {
                id: id
            }
        });
        res.status(200).json({
            log: results
        });
    } catch (err) {
        res.status(500).json({error: err})
    }
});

/* 
============
Update a Log
============
 */
router.put("/:id", validateJWT, async (req, res) => {
    const {description, definition, result} = req.body.log;
    const logId = req.params.id;
    const userId = req.user.id;

    const query = {
        where: {
            id: logId,
            owner_id: userId
        }
    }
    console.log("THIS IS HOW MY QUERY RETURNED",query);
    
    const updatedLog = {
        description,
        definition,
        result
    }

    try {
        const update = await LogModel.update(updatedLog, query);
        res.status(200).json({
            update,
            message: "Update successful!",
            updatedLog
        });
    } catch (err) {
        res.status(500).json({error: err})
    }
});

/* 
============
Delete a Log
============
 */
router.delete("/:id", validateJWT, async (req, res) => {
    const logId = req.params.id;
    const userId = req.user.id;
    console.log(logId, userId);

    try {
        const query = {
            where: {
                id: logId,
                owner_id: userId
            }
        }
        let destroyedLog = await LogModel.destroy(query);
        if (destroyedLog > 0) {
            res.status(200).json({
                message: "The following entry has been successfully deleted",
                destroyedLog
            });
        } else {
            res.status(500).json({
                message: "Unable to delete entry "
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Error deleting entry",
            Error: err
        });
        console.log(err);
    }


});

module.exports = router;