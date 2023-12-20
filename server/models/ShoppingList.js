const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ShoppingListSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    IsSelected: {
        type: Boolean,
        required: true,
        default: false
    }
});

const ShoppingList = mongoose.model("ShoppingList", ShoppingListSchema);

module.exports = ShoppingList;