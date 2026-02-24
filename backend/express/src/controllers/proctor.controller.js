import proctorRepository from "../repositories/proctor.repository.js";

class ProctorController {
    async getProctees(req, res, next) {
        try {
            const { proctorId } = req.params;

            // Basic security check: The logged in proctor can only view their own dashboard
            if (req.user.proctorId !== proctorId) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized: You can only view your own proctees."
                });
            }

            const proctor = await proctorRepository.findByProctorId(proctorId);
            if (!proctor) {
                return res.status(404).json({ success: false, message: "Proctor not found" });
            }

            // We use findById logic with include but for proctorId
            const proctorWithProctees = await proctorRepository.findById(proctor.id);

            res.status(200).json({
                success: true,
                data: proctorWithProctees.proctees
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyProcteeLink(req, res, next) {
        try {
            const { proctorId, usn } = req.params;

            if (req.user.proctorId !== proctorId) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized: Access denied."
                });
            }

            const proctor = await proctorRepository.findByProctorId(proctorId);
            const proctorWithProctees = await proctorRepository.findById(proctor.id);

            const isAssigned = proctorWithProctees.proctees.some(p => p.usn === usn);

            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: This student is not assigned to you."
                });
            }

            res.status(200).json({ success: true, message: "Authorized" });
        } catch (error) {
            next(error);
        }
    }
}

export default new ProctorController();
