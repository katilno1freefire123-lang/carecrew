import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Professional from "../models/Professional.js";

export const createReview = async (req, res) => {
  try {
    const { bookingId, customerId, rating, comment } = req.body;

    if (!bookingId || !customerId || !rating) {
      return res.status(400).json({ message: "bookingId, customerId, rating are required." });
    }

    const booking = await Booking.findOne({ _id: bookingId, status: "completed" });
    if (!booking) {
      return res.status(404).json({ message: "Completed booking not found." });
    }

    if (String(booking.customerId) !== String(customerId)) {
      return res.status(403).json({ message: "You can only review your own booking." });
    }

    const review = await Review.create({
      bookingId,
      customerId,
      professionalId: booking.professionalId,
      rating: Number(rating),
      comment: comment || "",
    });

    const reviews = await Review.find({ professionalId: booking.professionalId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Professional.findByIdAndUpdate(booking.professionalId, {
      rating: Math.round(avgRating * 10) / 10,
    });

    await Booking.findByIdAndUpdate(bookingId, { reviewed: true });

    return res.status(201).json({ message: "Review submitted.", review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Review already submitted for this booking." });
    }
    return res.status(500).json({ message: "Failed to submit review.", error: error.message });
  }
};

export const getProfessionalReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ professionalId: req.params.professionalId }).populate("customerId", "name").sort({ createdAt: -1 });
    return res.status(200).json({ reviews, count: reviews.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews.", error: error.message });
  }
};
