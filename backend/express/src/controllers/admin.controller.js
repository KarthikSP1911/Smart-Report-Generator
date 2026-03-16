import prisma from "../config/db.config.js";

class AdminController {
    // PROCTOR MANAGEMENT
    
    // Get all proctors
    async getAllProctors(req, res, next) {
        try {
            const proctors = await prisma.proctor.findMany({
                include: {
                    students: {
                        select: {
                            id: true,
                            usn: true,
                            dob: true,
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return res.status(200).json({
                success: true,
                data: proctors,
            });
        } catch (error) {
            next(error);
        }
    }

    // Search proctors by name or proctorId
    async searchProctors(req, res, next) {
        try {
            const { query } = req.query;

            if (!query || query.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required",
                });
            }

            const proctors = await prisma.proctor.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        },
                        {
                            proctorId: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        }
                    ]
                },
                include: {
                    students: {
                        select: {
                            id: true,
                            usn: true,
                            dob: true,
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return res.status(200).json({
                success: true,
                data: proctors,
            });
        } catch (error) {
            next(error);
        }
    }

    // Create a new proctor
    async createProctor(req, res, next) {
        try {
            const { proctorId, name, password } = req.body;

            if (!proctorId || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Proctor ID and password are required",
                });
            }

            // Check if proctor already exists
            const existingProctor = await prisma.proctor.findUnique({
                where: { proctorId: proctorId.toUpperCase() }
            });

            if (existingProctor) {
                return res.status(400).json({
                    success: false,
                    message: "Proctor ID already exists",
                });
            }

            const newProctor = await prisma.proctor.create({
                data: {
                    proctorId: proctorId.toUpperCase(),
                    name: name || proctorId,
                    password,
                },
                include: {
                    students: true
                }
            });

            return res.status(201).json({
                success: true,
                data: newProctor,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update proctor details
    async updateProctor(req, res, next) {
        try {
            const { id } = req.params;
            const { name, password } = req.body;

            const proctor = await prisma.proctor.findUnique({
                where: { id }
            });

            if (!proctor) {
                return res.status(404).json({
                    success: false,
                    message: "Proctor not found",
                });
            }

            const updatedProctor = await prisma.proctor.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(password && { password })
                },
                include: {
                    students: {
                        select: {
                            id: true,
                            usn: true,
                            dob: true,
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: updatedProctor,
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete a proctor
    async deleteProctor(req, res, next) {
        try {
            const { id } = req.params;

            const proctor = await prisma.proctor.findUnique({
                where: { id }
            });

            if (!proctor) {
                return res.status(404).json({
                    success: false,
                    message: "Proctor not found",
                });
            }

            // Optionally unassign students before deleting proctor
            await prisma.user.updateMany({
                where: { proctorId: id },
                data: { proctorId: null }
            });

            await prisma.proctor.delete({
                where: { id }
            });

            return res.status(200).json({
                success: true,
                message: "Proctor deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    // STUDENT MANAGEMENT

    // Get students for a specific proctor
    async getProctorStudents(req, res, next) {
        try {
            const { proctorId } = req.params;

            const proctor = await prisma.proctor.findUnique({
                where: { id: proctorId },
                include: {
                    students: {
                        orderBy: {
                            usn: 'asc'
                        }
                    }
                }
            });

            if (!proctor) {
                return res.status(404).json({
                    success: false,
                    message: "Proctor not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: proctor.students,
            });
        } catch (error) {
            next(error);
        }
    }

    // Add a student to a proctor
    async addStudentToProctor(req, res, next) {
        try {
            const { proctorId } = req.params;
            const { usn, dob } = req.body;

            if (!usn || !dob) {
                return res.status(400).json({
                    success: false,
                    message: "USN and DOB are required",
                });
            }

            const proctor = await prisma.proctor.findUnique({
                where: { id: proctorId }
            });

            if (!proctor) {
                return res.status(404).json({
                    success: false,
                    message: "Proctor not found",
                });
            }

            // Check if student already exists with same USN
            const existingStudent = await prisma.user.findUnique({
                where: { usn: usn.toUpperCase() }
            });

            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: "Student with this USN already exists",
                });
            }

            const newStudent = await prisma.user.create({
                data: {
                    usn: usn.toUpperCase(),
                    dob,
                    proctorId
                }
            });

            return res.status(201).json({
                success: true,
                data: newStudent,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update student details
    async updateStudent(req, res, next) {
        try {
            const { studentId } = req.params;
            const { dob } = req.body;

            const student = await prisma.user.findUnique({
                where: { id: studentId }
            });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found",
                });
            }

            const updatedStudent = await prisma.user.update({
                where: { id: studentId },
                data: {
                    ...(dob && { dob })
                }
            });

            return res.status(200).json({
                success: true,
                data: updatedStudent,
            });
        } catch (error) {
            next(error);
        }
    }

    // Remove student from proctor
    async removeStudentFromProctor(req, res, next) {
        try {
            const { studentId } = req.params;

            const student = await prisma.user.findUnique({
                where: { id: studentId }
            });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found",
                });
            }

            // Unassign student from proctor
            await prisma.user.update({
                where: { id: studentId },
                data: { proctorId: null }
            });

            return res.status(200).json({
                success: true,
                message: "Student removed from proctor successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
