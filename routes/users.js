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
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    return [accessToken, refreshToken];
};

const authenticateRefreshToken = (req, res, next) => {
    const userToken = req.cookies.refresh_token;
    console.log(req.cookies.refresh_token)

    if (userToken == undefined) return res.sendStatus(401);
    jwt.verify(userToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        // check if token is in the list of tokens
        // if not, return 403

        req.user = user;
        next();
    });
}

router.get('/', authenticateToken, async (req, res) => {
    const users = await User.find({}, { name: 1, _id: 0 });
    res.json(users);
})

router.get('/:id', authenticateToken, async (req, res) => {
    const user = await User.find({ _id: req.params.id});
    res.json(user);
})

router.put('/:id', authenticateToken, async (req, res) => {
    // update user flow
    res.send('User updated');
})

router.delete('/:id', authenticateToken, async (req, res) => {
    // delete user flow
    res.send('User deleted');
})

router.post('/new', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { name: req.body.name, email: req.body.email, password: hashedPassword };
        await User.create(user);
        res.status(201).send();
    } catch {
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
            const { accessToken, refreshToken } = generateTokens(user[0]);
            res.cookie('refreshToken', refreshToken, { expires: date, httpOnly: true, secure: true });
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

router.post('/refresh', authenticateRefreshToken, async (req, res) => {
    const [ accessToken, refreshToken ] = generateTokens(req.user);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.json(accessToken);
    // set refresh token in db?
})

module.exports = router;
