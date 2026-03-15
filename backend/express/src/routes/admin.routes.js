import { Router } from "express";
import adminController from "../controllers/admin.controller.js";

const router = Router();

router.get("/proctors", adminController.getProctors);
router.post("/proctors", adminController.createProctor);
router.delete("/proctors/:id", adminController.deleteProctor);
router.post("/proctors/:id/students", adminController.addStudentToProctor);
router.delete("/proctors/:proctorId/students/:studentId", adminController.removeStudentFromProctor);

export default router;
