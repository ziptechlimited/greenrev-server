import { Router } from "express";
import { getExperts } from "../controllers/expertController";

const router = Router();

router.get("/experts", getExperts);

export default router;
