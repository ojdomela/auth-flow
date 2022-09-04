const express = require('express');
const mongoose = require('mongoose');
const Topic = require('./models/category');

const app = express();

mongoose.connect('mongodb://localhost:27017/test')

mongoose.connection.on('connected', () => {
    console.log('connected to mongodb');
}).on('error', (error) => {
    console.log(error);
});

app.use(express.json());

const topics = ['js', 'css', 'html', 'nodejs', 'react', 'java', 'git', 'springboot', 'sql', 'mongodb'];

app.get('/categories', async (req, res) => {
    const data = await Topic.find();
    res.json(data);
});

app.get('/categories/:category', async (req, res) => {
    const { category } = req.params;
    console.log(category)
    const topic = await Topic.where(category);
    console.log(topic)
    res.send(topic);
});

app.post('/categories/:category', async (req, res) => {
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


// app.get('/users', async (req, res) => {
//     const users = await User.find({}, { name: 1, _id: 0});
//     console.log(users)
//     res.json(users);
// })

// app.post('/users', async (req, res) => {
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const user = { name: req.body.name, email: req.body.email, password: hashedPassword };
//         await User.create(user);
//         res.status(201).send();
//     } catch {
//         // duplicate name / email handling
//         res.status(500).send();
//     }
// })

// app.post('/users/login', async (req, res) => {
//     const user = await User.where("name")
//         .equals(req.body.name)
//     if (user == null) {
//         return res.status(400).send('Cannot find user');
//     }
//     try {
//         if (await bcrypt.compare(req.body.password, user[0].password)) {
//             // JWT token handling
//             res.send('Success');
//         } else {
//             // Deny access handling
//             res.send('Not Allowed');
//         }
//     } catch (error) {
//         console.log(error)
//         res.status(500).send();
//     }
// })

app.listen(3001);
