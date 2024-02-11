const mongoose = require('mongoose');

const ItemsSchema = new mongoose.Schema({
    listName: {
        type: String,
        required: true,
        index: true, 
    },
    items: [{
        name: {
            type: String,
            required: true,
        },
        isSelected: {
            type: Boolean,
            required: false,
            default: false,
        },
        quantity: {
            type: Number,
            required: true,
        },
    }],
});

const ItemsModel = mongoose.model("Items", ItemsSchema);

module.exports = ItemsModel;
