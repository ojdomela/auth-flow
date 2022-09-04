const express=  require('express');
const router = express.Router();
const Category = require('../models/category');
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

router.get('/categories', async (req, res) => {
    const data = await Category.find();
    res.json(data);
});

router.get('/categories/:category', async (req, res) => {
    const { category } = req.params;
    console.log(category)
    const topic = await Category.where("name").equals(category);
    console.log(topic)
    res.send(topic);
});

router.post('/categories/:category', authenticateToken, async (req, res) => {
    const { category } = req.params;
    const { type, test, link } = req.body;
    if (type === 'comment') {
        const topic = await Topic.where(category);
        topic.comments.push({ text: test, owner: '5f1f9c9d8e6d0c0f1c1e1e6d' });
        await topic.save();
        res.send(topic);
    } else {
        const topic = await Topic.where(category);
        topic[type].push({ text: test, link, owner: '5f1f9c9d8e6d0c0f1c1e1e6d' });
        await topic.save();
        res.send(topic);
    }
    const topic = await Topic.find()
    console.log(topic)
    res.send(topic);
});

module.exports = router;
