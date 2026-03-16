import { Router } from "express";
import adminController from "../controllers/admin.controller.js";

const router = Router();

// PROCTOR ROUTES

// Get all proctors
router.get("/proctors", adminController.getAllProctors);

// Search proctors by name or ID
router.get("/proctors/search", adminController.searchProctors);

// Create a new proctor
router.post("/proctors", adminController.createProctor);

// Update proctor details
router.put("/proctors/:id", adminController.updateProctor);

// Delete a proctor
router.delete("/proctors/:id", adminController.deleteProctor);

// STUDENT ROUTES

// Get students for a specific proctor
router.get("/proctors/:proctorId/students", adminController.getProctorStudents);

// Add a student to a proctor
router.post("/proctors/:proctorId/students", adminController.addStudentToProctor);

// Update student details
router.put("/students/:studentId", adminController.updateStudent);

// Remove student from proctor
router.delete("/students/:studentId", adminController.removeStudentFromProctor);

export default router;
