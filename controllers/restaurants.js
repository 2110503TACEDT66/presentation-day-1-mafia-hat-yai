const Restaurant = require('../models/Restaurant');

//@desc     Get all restaurants
//@route    GET /api/v1/restaurants
//@access   Public
exports.getRestaurants = async (req, res, next) => {
  try {
    let restaurant; 
    // Executing query
    if (req.user.role !== 'admin') {
      // If user is not an admin, they can only see basic restaurant information
      restaurant = await Restaurant.find()
        .populate({
          path: "reservation",
          match: { user: req.user.id },
        })
        .populate("userReviews");

    } else {
      // If user is  an admin, they can see all restaurant information
      restaurant = await Restaurant.find()
        .populate("reservation")
        .populate("userReviews");
    }

    res.status(200).json({
        success: true,
        count: restaurant.length,
        data: restaurant
    });

  } catch (err) {
    res.status(400).json({
      success: false
    });
  }
};


//@desc     Get single restaurant
//@route    GET /api/v1/restaurants/:id
//@access   Public
exports.getRestaurant = async (req, res, next) => {
  try {
    let restaurant; 
    // Executing query
    if (req.user.role !== 'admin') {
      restaurant = await Restaurant.findById(req.params.id).populate({
        path: "reservation",
        match: { user: req.user.id },
      });
    } else {
      restaurant = await Restaurant.findById(req.params.id).populate('reservation');
    }

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        msg: `There is no such restaurant with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });

  } catch (err) {
    res.status(400).json({
      success: false
    });
  }
};


//@desc     Create new restaurant
//@route    POST /api/v1/restaurants
//@access   Private
exports.createRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    success: true,
    data: restaurant
  });
};


//@desc     Update restaurant
//@route    PUT /api/v1/restaurants/:id
//@access   Private
exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!restaurant) {
      res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: restaurant});
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete restaurant
//@route    DELETE /api/v1/restaurants/:id
//@access   Private
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(400).json({ success: false });
    }

    await restaurant.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};