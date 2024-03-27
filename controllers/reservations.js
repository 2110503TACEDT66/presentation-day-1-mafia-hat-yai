const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

//@desc     Get all reservations
//@route    GET /api/v1/reservations
//@access   Public
exports.getReservations = async (req, res, next) => {
    let query;

    // No authentication check, anyone can access this route.
    // if (req.user.role !== 'admin') {
    //     query = Reservation.find({ user: req.user.id }).populate({
    //         path: 'restaurant',
    //         select: 'name'
    //     });

    // } else {
        if (req.params.restaurantId) { /* Show only specified restaurant reservations 
        if the restaurantId is included. */
        console.log(req.params.restaurantId);
        query = Reservation.find({ Restaurant: req.params.restaurantId, }).populate({
            path: 'restaurant',
            select: 'name',
        });
        
        } else { // Otherwise shows all of reservations
            query = Reservation.find().populate({
                path: 'restaurant',
                select: 'name',
            });
        }
    // }   
    
    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
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
    if (req.params.restaurantId && !req.body.restaurant) {
        req.body.restaurant = req.params.restaurantId;
    }
    try {
        const restaurant = await Restaurant.findById(req.body.restaurant);

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: `No restaurant found with the id ${req.params.restaurantId}`,
            });
        }

        console.log(req.body);

        // Check for existing reservations
        const existingReservations = await Reservation.find({ user: req.body.user });

        // If you want to limit reservations per user, you can check here
        // However, in this example, we're assuming there's no limit

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

        // Implement authorization check here

        // Update reservation
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Run validators to ensure data validity
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
                message: `No reservation with the id of ${req.params.id}`,
            });
        }

        // Remove authorization check

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