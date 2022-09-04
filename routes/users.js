const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const generateAccessToken = (user) => {
    return jwt.sign({ name: user.name, id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

router.get('/', authenticateToken, async (req, res) => {
    const users = await User.find({}, { name: 1, _id: 0 });
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
            const accessToken = generateAccessToken(user[0]);
            const refreshToken = jwt.sign({ name: user[0].name, id: user[0]._id }, process.env.REFRESH_TOKEN_SECRET);
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, signed: true });
            res.json({
                accessToken,
                refreshToken
            });
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
