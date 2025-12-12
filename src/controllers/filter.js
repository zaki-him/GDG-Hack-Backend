// src/controllers/filter.js
import prisma from "../config/prisma.js";

/*
 body: { criteria: [{ type: "skill", value: "React" }, { type: "minYears", value: 3 }] }
*/
export async function applyFilter(req, res, next) {
  try {
    const { jobId } = req.params;
    const { criteria } = req.body;

    let where = { jobDescriptionId: jobId, status: { in: ["PENDING","SHORTLISTED"] } };

    // very simple filtering: by text match of analysis or min score or min years
    if (criteria?.length) {
      for (const c of criteria) {
        if (c.type === "minScore") {
          where.score = { gte: c.value };
        }
        // other filters can be implemented using analysis text / skills array
      }
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { score: "desc" },
      take: 10,
    });

    // mark shortlisted
    const ids = candidates.map((x) => x.id);
    await prisma.candidate.updateMany({
      where: { id: { in: ids } },
      data: { status: "SHORTLISTED" },
    });

    res.json({ top: candidates });
  } catch (err) {
    next(err);
  }
}
