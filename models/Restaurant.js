const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add Restaurant's name"],
    },
    address: {
        type: String,
        required: [true, "Please add Restaurant's address"],
    },
    telephone: {
        type: String,
        required: [true, "Please add Restaurant's telephone number"],
        unique: true,
    },
    picture: {
        type: String,
        required: [true, "Please add picture"],
    },
    open: {
        type: Date,
        required: [true, "Please add Restaurant's open time"],
    },
    close: {
        type: Date,
        required: [true, "Please add Restaurant's close time"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    averageStar: {
        type: Number,
        default: 0,
    },
    totalStars: {
        type: Number,
        default: 0,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    userReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Middleware to update averageStar, totalStars, and numberOfReviews
RestaurantSchema.pre("save", async function (next) {
    const restaurant = this;
    try {
        const totalStars = await mongoose.models.Review.aggregate([
        { $match: { restaurant: restaurant._id } },
        { $group: { _id: null, total: { $sum: "$stars" }, count: { $sum: 1 } } },
        ]);
        restaurant.totalStars = totalStars.length ? totalStars[0].total : 0;
        restaurant.numberOfReviews = totalStars.length ? totalStars[0].count : 0;
        restaurant.averageStar =
        restaurant.numberOfReviews > 0
            ? restaurant.totalStars / restaurant.numberOfReviews
            : 0;
        next();
    } catch (error) {
        next(error);
    }
});

// Update averageStar when a review is removed
RestaurantSchema.pre("findOneAndDelete", async function (next) {
    const restaurant = await this.model.findOne(this.getFilter());
    restaurant.totalStars -= this._conditions.stars;
    restaurant.numberOfReviews--;
    restaurant.averageStar =
        restaurant.numberOfReviews > 0
        ? restaurant.totalStars / restaurant.numberOfReviews
        : 0;
    await restaurant.save();
    next();
});

// Populate userReviews and reservation when fetching restaurants
RestaurantSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "restaurant",
});

RestaurantSchema.virtual("reservation", {
    ref: "Reservation",
    localField: "_id",
    foreignField: "restaurant",
    justOne: false,
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
