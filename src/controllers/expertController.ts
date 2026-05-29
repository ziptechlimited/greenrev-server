import type { Request, Response } from "express";
import { User } from "../models/User";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function getExperts(req: Request, res: Response) {
  try {
    const experts = await User.find({ 
      role: "mechanic",
      city: { $ne: null },
      lat: { $ne: null }
    })
      .select("-passwordHash -__v")
      .lean();

    // Map the backend User to the frontend Expert structure
    const mappedExperts = experts.map((expert) => ({
      id: expert._id.toString(),
      name: expert.name || expert.companyName || expert.garageName || "Unknown Expert",
      city: expert.city || "Unknown City",
      country: expert.country || "Unknown Country",
      address: expert.address || "",
      lat: expert.lat || 0,
      lng: expert.lng || 0,
      specialization: expert.specialization || [],
      hourlyRate: expert.hourlyRate || 0,
      phone: expert.phone || "",
      email: expert.email,
      image: expert.profileImage || "/images/experts/default.png", // Fallback image
    }));

    return sendSuccess(res, 200, { experts: mappedExperts });
  } catch (error) {
    console.error("Get experts error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Server error",
    });
  }
}
