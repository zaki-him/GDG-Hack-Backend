// src/controllers/resume.js
import prisma from "../config/prisma.js";
import path from "path";

export default async function uploadResumes(req, res, next) {
  try {
    const { companyId, jobId } = req.body;  // One of the features that i want to add as a service is to give the premium subscribers the ability 
    // files is array from multer
    const files = req.files || [];
    const saved = [];
    for (const f of files) {
      const url = `/uploads/${path.basename(f.path)}`; // demo: local path
      const candidate = await prisma.candidate.create({
        data: {
          companyId,
          jobDescriptionId: jobId,
          name: f.originalname.replace(/\.[^/.]+$/, ""),
          email: "", // optional — not always in resume
          resumeUrl: url,
          status: "PENDING",
        },
      });
      saved.push(candidate);
    }
    res.json({ uploaded: saved.length, saved });
  } catch (err) {
    next(err);
  }
}
