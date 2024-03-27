const express = require("express");

const {
    addReview,
    editReview,
    removeReview,
} = require("../controllers/reviews");

// Include other resource routers
const reservationRouter = require("./reservations");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:restaurantId/reservations/", reservationRouter);

// Review routes
router.route("/:restaurantId")
  // .post(protect, authorize("user", "admin"), addReview);
  .post(addReview);

router.route("/:restaurantId/:reviewId")
  // .put(protect, authorize("user", "admin"), editReview)
  .put(editReview)
  // .delete(protect, authorize("user", "admin"), removeReview);
  .delete(removeReview);

module.exports = router;