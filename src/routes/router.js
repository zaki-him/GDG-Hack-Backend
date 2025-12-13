import e from "express";
import { createCompany } from "../controllers/company.js";
import jobDescription from "../controllers/jobDescription.js";
import { upload } from "../middlewares/upload.js";
import uploadResumes from "../controllers/uploadResumes.js";
import { analyzeJob } from "../controllers/analyze.js";
import { applyFilter } from "../controllers/filter.js";
import { scheduleInterviews } from "../controllers/schduele.js";

const router = e.Router()

router.post('/company', createCompany)

router.post('/job', jobDescription)

// upload files
router.post('/resume/upload', upload.array('files', 50), uploadResumes)

router.post('/analyze/:jobId', analyzeJob)

router.post('/filter/:jobId', applyFilter)

router.post('/schedule/:jobId', scheduleInterviews)

export default router