// src/controllers/schedule.js
import prisma from "../config/prisma.js";
import { sendEmail } from "../services/mailer.js";

/*
body: { slots: ["2025-12-15T10:00:00Z", "2025-12-15T14:00:00Z"] }
*/
export async function scheduleInterviews(req, res, next) {
  try {
    const { jobId } = req.params;
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) return res.status(400).json({ error: "No slots provided" });

    // find shortlisted candidates
    const candidates = await prisma.candidate.findMany({
      where: { jobDescriptionId: jobId, status: "SHORTLISTED" },
      orderBy: { score: "desc" },
      take: 10,
    });

    const assignments = [];
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      const slot = slots[i % slots.length]; // simple distribution
      await prisma.candidate.update({
        where: { id: c.id },
        data: { status: "INTERVIEW", interviewSlot: slot },
      });

      const subject = `Interview for ${slot}`;
      const body = `<p>Hi ${c.name || ""},</p><p>Your interview for ${slot} is confirmed. Link/venue will be shared.</p>`;
      await sendEmail(c.email || "no-email@example.com", subject, body);
      await prisma.emailLog.create({
        data: {
          companyId: c.companyId,
          candidateId: c.id,
          type: "interview",
          to: c.email || "no-email@example.com",
          subject,
          body,
        },
      });

      assignments.push({ candidateId: c.id, slot });
    }

    res.json({ assignments });
  } catch (err) {
    next(err);
  }
}
