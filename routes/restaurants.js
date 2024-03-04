const express = require('express');

const {getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant} = require('../controllers/restaurants');

// Include other resource routers
const reservationRouter=require('./reservations');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:restaurantId/reservations/',reservationRouter);

router
    .route("/")
    .get(protect, authorize('user','admin'), getRestaurants)
    .post(protect, authorize('admin'), createRestaurant);

router.route('/:id')
    .get(protect, authorize('user', 'admin'), getRestaurant)
    .put(protect, authorize('admin'), updateRestaurant)
    .delete(protect, authorize('admin'), deleteRestaurant );
    

module.exports = router;
