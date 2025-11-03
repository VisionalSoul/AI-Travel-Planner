const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addExpense,
  addPhoto
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// 所有行程路由都需要认证
router.use(protect);

router
  .route('/')
  .get(getTrips)
  .post(createTrip);

router
  .route('/:id')
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip);

router.route('/:id/expenses').post(addExpense);
router.route('/:id/photos').post(addPhoto);

module.exports = router;