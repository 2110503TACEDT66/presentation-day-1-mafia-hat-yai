const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Please add Restaurant\'s name']
    },
    address : {
        type : String,
        required : [true,'Please add Restaurant\'s address']
    },
    telephone:{
        type : String,
        required: [true,'Please add Restaurant\'s telephone number'],
        unique : true
    },
    openclosetime: {
        open: {
            type: Date,
            required: [true,'Please add Restaurant\'s open time']
        },
        close: {
            type: Date,
            required: [true,'Please add Restaurant\'s close time']
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);