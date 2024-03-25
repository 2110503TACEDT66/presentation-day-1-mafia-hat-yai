const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const jwt = require("jsonwebtoken");

//@desc     Add review
//@route    POST /api/v1/reviews/:restaurantId
//@access   Public
exports.addReview = async (req, res, next) => {
  try {
    // Extract the user ID from the request's authentication token
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = decodedToken.id;
    const restaurant = req.params.restaurantId;
    const { stars, comment } = req.body;

    console.log(user, restaurant, stars, comment);

    // Count the number of reviews the user has left for the restaurant
    const userReviewsCount = await Review.countDocuments({
      user: user,
      restaurant: restaurant,
    });

    // Check if the user has already left 3 reviews for the restaurant
    if (req.user.role !== 'admin' && userReviewsCount >= 3) {
      const userReviews = await Review.find({
        user: user,
        restaurant: restaurant,
      });
      return res.status(400).json({
        success: false,
        message: "Cannot add review. You have already left 3 reviews for this restaurant",
        userReviews: userReviews,
      });
    }

    // Check if the restaurant exists
    const existingRestaurant = await Restaurant.findById(restaurant);
    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Create a new review
    const newReview = await Review.create({
      user,
      restaurant,
      stars,
      comment,
    });

    console.log(newReview.id);

    // Add the review to the restaurant's reviews
    existingRestaurant.userReviews.push(newReview._id);
    await existingRestaurant.save();

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

exports.editReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { stars, comment } = req.body;

    // Check if the review exists
    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: `Review with ID of ${reviewId} is not exist`
      });
    }

    // Update the review
    existingReview.stars = stars;
    existingReview.comment = comment;
    await existingReview.save();

    res.status(200).json({
      success: true,
      data: existingReview
    });

  } catch (error) {
    next(error);
  }
};

exports.removeReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Check if the review exists
    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Ensure existingReview is a Mongoose document
    if (!existingReview._id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review document" });
    }

    // Remove the review from the restaurant's reviews
    const restaurantId = existingReview.restaurant;
    const restaurant = await Restaurant.findById(restaurantId);
    restaurant.userReviews.pull(reviewId);
    await restaurant.save();

    // Delete the review
    await existingReview.deleteOne();
    
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
