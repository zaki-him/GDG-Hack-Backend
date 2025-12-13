// src/controllers/analyze.js
import prisma from "../config/prisma.js";
import { extractTextFromPDF } from "../services/pdf.js";
import { scoreResume } from "../services/ai.js";
import { sendEmail } from "../services/mailer.js";
import fs from "fs";
import path from "path";

export async function analyzeJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await prisma.jobDescription.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: "Job not found" });

    // fetch candidates for this job
    const candidates = await prisma.candidate.findMany({
      where: { jobDescriptionId: jobId, status: "PENDING" },
    });

    const processed = [];
    for (const c of candidates) {
      // read resume file from uploads
      const filePath = path.join(process.cwd(), c.resumeUrl.replace("/uploads/", "uploads/"));
      let resumeText = "";
      if (fs.existsSync(filePath)) {
        resumeText = await extractTextFromPDF(filePath);
      } else {
        resumeText = "";
      }

      // call AI to score
      const result = await scoreResume(resumeText, job.content);
      const score = Math.round(result.score ?? 0);

      // update candidate
      const updated = await prisma.candidate.update({
        where: { id: c.id },
        data: { score, analysis: result.reason || JSON.stringify(result), status: score < 60 ? "REJECTED" : "PENDING" },
      });

      // if rejected, send email
      if (score < 60) {
        const subject = `Application update for ${job.title}`;
        const body = `<p>Hi,</p><p>Thank you for applying to ${job.title}. After review, we will not proceed with your application. Reason: ${result.reason ?? "Insufficient match"}.</p>`;
        await sendEmail(c.email || "no-email@example.com", subject, body);

        // log email
        await prisma.emailLog.create({
          data: {
            companyId: c.companyId,
            candidateId: c.id,
            type: "rejection",
            to: c.email || "no-email@example.com",
            subject,
            body,
          },
        });
      }

      processed.push(updated);
    }

    res.json({ processedCount: processed.length, processed });
  } catch (err) {
    res.json({ err: err.message })
  }
}
