const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    rating: {
        type: Number,
        default: 1,
    },
    owner: mongoose.Schema.Types.ObjectId,
});

const ItemSchema = new mongoose.Schema({
    text: [String],
    link: { 
        type: String,
        required: true,
        unique: true
    },
    rating: {
        type: Number,
        default: 1,
    },
    owner: mongoose.Schema.Types.ObjectId,
});

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    videos: [ItemSchema],
    articles: [ItemSchema],
    books: [ItemSchema],
    comments: [CommentSchema]
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
