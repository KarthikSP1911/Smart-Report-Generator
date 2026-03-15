import prisma from "../config/db.config.js";
import bcrypt from "bcrypt";

class AdminController {
    async getProctors(req, res, next) {
        try {
            const proctors = await prisma.proctor.findMany({
                include: {
                    students: true
                }
            });
            // Don't send passwords
            const sanitizedProctors = proctors.map(proctor => {
                const { password, ...rest } = proctor;
                return rest;
            });
            
            res.status(200).json({ success: true, data: sanitizedProctors });
        } catch (error) {
            next(error);
        }
    }

    async createProctor(req, res, next) {
        try {
            const { proctorId, password, name } = req.body;
            // Default password logic just in case
            const hashedPassword = await bcrypt.hash(password || 'password123', 10);
            
            const newProctor = await prisma.proctor.create({
                data: {
                    proctorId: proctorId.toUpperCase(),
                    password: hashedPassword,
                    name: name || proctorId
                }
            });
            
            const { password: _, ...rest } = newProctor;
            res.status(201).json({ success: true, data: { ...rest, students: [] } });
        } catch (error) {
            next(error);
        }
    }

    async deleteProctor(req, res, next) {
        try {
            const { id } = req.params;
            
            // Ensure students are unassigned (handled by db/prisma or explicit here)
            await prisma.user.updateMany({
                where: { proctorId: id },
                data: { proctorId: null }
            });

            await prisma.proctor.delete({
                where: { id }
            });

            res.status(200).json({ success: true, message: "Proctor deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    async addStudentToProctor(req, res, next) {
        try {
            const { id } = req.params; // proctor doc id
            const { usn, dob } = req.body;
            
            if (!usn || !usn.trim()) return res.status(400).json({ success: false, message: 'USN is required' });

            const normalizedUsn = usn.toUpperCase().trim();

            let student = await prisma.user.findUnique({
                where: { usn: normalizedUsn }
            });

            if (!student) {
                student = await prisma.user.create({
                    data: { usn: normalizedUsn, dob: dob || '01012000', proctorId: id }
                });
            } else {
                student = await prisma.user.update({
                    where: { id: student.id },
                    data: { proctorId: id, dob: dob || student.dob }
                });
            }
            
            res.status(200).json({ success: true, data: student });
        } catch (error) {
            next(error);
        }
    }

    async removeStudentFromProctor(req, res, next) {
        try {
            const { studentId } = req.params;
            
            await prisma.user.update({
                where: { id: studentId },
                data: { proctorId: null }
            });
            
            res.status(200).json({ success: true, message: "Student removed from proctor successfully" });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
