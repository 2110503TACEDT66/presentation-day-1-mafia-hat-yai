const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

//@desc     Get all reservations
//@route    GET /api/v1/reservations
//@access   Public
exports.getReservations = async (req, res, next) => {
    let query;

    // General users are restricted to viewing only their restaurant reservations.
    if (req.user.role !== 'admin') {
        query = Reservation.find({ user: req.user.id }).populate({
            path: 'restaurant',
            select: 'name'
        });

    } else { // Unless you're an admin.

        if (req.params.restaurantId) { // Show only specified restaurant reservations if the restaurantId is included. 

            console.log(req.params.restaurantId);
            
            query = Reservation.find({Restaurant: req.params.restaurantId,}).populate({
                path: 'restaurant',
                select: 'name',
            });

        } else { // Otherwise shows all of reservations
            query = Reservation.find().populate({
                path: 'restaurant',
                select: 'name',
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });

    } catch (error) {
        console.log(error);
        return res.stutus(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
};

//@desc     Get single reservation
//@route    GET /api/v1/reservations/:id
//@access   Public
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name'
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: reservation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
};

//@desc     Add reservations
//@route    POST /api/v1/reservations/:id
//@access   Private
exports.addReservation = async (req, res, next) => {
    try {
        console.log(req.body);
        console.log("^ Body && v Params");
        console.log(req.params);
    } catch (err) {
        console.log(err);
    }

    if (req.params.restaurantId) {
      req.body.restaurant = req.params.restaurantId;
    } 

    try {
        // req.body.restaurant = req.params.restaurant;
        const restaurant = await Restaurant.findById(req.body.restaurant);

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: `No restaurant found with the id ${req.params.restaurantId}`,
            });
        }

        console.log(req.body);

        // add user Id to req.body
        req.body.user = req.user.id;

        // Check for existing reservations
        const existingReservations = await Reservation.find({ user: req.user.id });

        // If the user is not an admin, they can only create 3 reservations
        if (existingReservations.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 reservations`,
            });
        }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({
            success: true,
            data: reservation,
        });

    } catch (error) {
        console.error(error); // Log the error for debugging

        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};


//@desc     Update reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private
exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(400).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        // Make sure user is the reservation owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to uppdate this reservation`
            });
        }   
        
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Reservation"
        });
    }
};

//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation = async (req, res, next) => {
    try {
      const reservation = await Reservation.findById(req.params.id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: `No reservation with theid of ${req.params.id}`,
        });
      }

      // Make sure user is the reservation owner
      if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
        return res.status(401).json({
          success: false,
          message: `User ${req.user.id} is not authorized to delete this reservation`,
        });
      }

      await reservation.deleteOne();

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Cannot delete Reservation"
        });
    }
};