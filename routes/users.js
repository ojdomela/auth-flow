const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const tokens = [];

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

const generateTokens = (user) => {
    return {
        accessToken: jwt.sign({ name: user.name, id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }), refreshToken: jwt.sign({ name: user.name, id: user._id }, process.env.REFRESH_TOKEN_SECRET)
    }
};

const authenticateRefreshToken = (req, res, next) => {
    req.cookies.refresh_token
}

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
            const {accessToken, refreshToken} = generateTokens(user[0]);
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            res.json({
                accessToken
            });
        } else {
            // Deny access handling
            res.status(403).send('Not Allowed');
        }
    } catch (error) {
        console.log(error)
        res.status(500).send();
    }
})

router.post('/refresh', async (req, res) => {
    const userToken = req.cookies.refresh_token;

    // Check for token in Redis Cache >

    if (userToken == null) return res.sendStatus(401);
    jwt.verify(userToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const {accessToken, refreshToken} = generateTokens(user);

        // 

        res.cookie('accessToken', accessToken, { secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.send("refreshed");
    });
})

module.exports = router;
