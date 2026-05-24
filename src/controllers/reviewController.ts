import type { Response } from "express";
import { Review } from "../models/Review";
import { AcquisitionRequest } from "../models/AcquisitionRequest";
import { User } from "../models/User";
import type { CustomReq } from "../types/auth";
import { sendSuccess, sendError } from "../utils/apiResponse";

// ─── Customer: Submit a review ───────────────────────────────────────────────
export async function createReview(req: CustomReq, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 401, { code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const { id: acquisitionRequestId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return sendError(res, 400, { code: "VALIDATION_ERROR", message: "Rating must be a number between 1 and 5" });
    }

    // Verify the acquisition request belongs to this customer and is completed
    const request = await AcquisitionRequest.findOne({
      _id: acquisitionRequestId,
      customerId: req.user.id,
    });

    if (!request) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Acquisition request not found" });
    }
    if (request.status !== "completed") {
      return sendError(res, 400, { code: "INVALID_STATE", message: "You can only review completed transactions" });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ acquisitionRequestId });
    if (existingReview) {
      return sendError(res, 409, { code: "DUPLICATE_REVIEW", message: "You have already reviewed this transaction" });
    }

    const customer = await User.findById(req.user!.id).select("name").lean();

    const review = new Review({
      acquisitionRequestId,
      customerId: req.user.id,
      vendorId: request.vendorId,
      productId: request.productId,
      rating,
      comment: comment || null,
      customerName: (customer as any)?.name || "Customer",
      productName: request.productName,
    });

    await review.save();

    // Mark the request as reviewed
    request.hasReview = true;
    await request.save();

    return sendSuccess(res, 201, { review });
  } catch (error) {
    console.error("Error creating review:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to submit review" });
  }
}

// ─── Public: Get vendor reviews with average rating ─────────────────────────
export async function getVendorReviews(req: CustomReq, res: Response) {
  try {
    const { vendorId } = req.params;

    const reviews = await Review.find({ vendorId })
      .sort({ createdAt: -1 })
      .lean();

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return sendSuccess(res, 200, {
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    return sendError(res, 500, { code: "INTERNAL_ERROR", message: "Failed to fetch reviews" });
  }
}
