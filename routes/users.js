const express=  require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/', async (req, res) => {
    const users = await User.find({}, { name: 1, _id: 0});
    res.json(users);
})

router.post('/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { name: req.body.name, email: req.body.email, password: hashedPassword };
        await User.create(user);
        res.status(201).send();
    } catch {
        // duplicate name / email handling
        res.status(500).send();
    }
})

router.post('/login', async (req, res) => {
    const user = await User.where("name")
        .equals(req.body.name)
    if (user == null) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if (await bcrypt.compare(req.body.password, user[0].password)) {
            // JWT token handling
            res.send('Success');
        } else {
            // Deny access handling
            res.send('Not Allowed');
        }
    } catch (error) {
        console.log(error)
        res.status(500).send();
    }
})

module.exports = router;
