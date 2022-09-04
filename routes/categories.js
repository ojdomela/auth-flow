const express=  require('express');
const router = express.Router();
const Category = require('../models/category');

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

router.post('/categories/:category', async (req, res) => {
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
