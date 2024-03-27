const express = require('express');
const {getReservations, getReservation, addReservation, updateReservation, deleteReservation} = require('../controllers/reservations');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getReservations)
    // .post(protect, authorize('admin','user'), addReservation);
    .post(addReservation);
    
router.route('/:id')
    // .get(protect, authorize('admin', 'user'), getReservation)
    .get(getReservation)
    // .put(protect, authorize('admin','user'), updateReservation)
    .put(updateReservation)
    // .delete(protect, authorize('admin','user'), deleteReservation);
    .delete(deleteReservation);
    

module.exports = router;