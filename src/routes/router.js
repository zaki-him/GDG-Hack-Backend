import e from "express";
import { createCompany } from "../controllers/company.js";
import jobDescription from "../controllers/jobDescription.js";
import { upload } from "../middlewares/upload.js";

const router = e.Router()

router.post('/company', createCompany)

router.post('/job', jobDescription)

// upload files
router.post('/resume/upload', upload.array('files', 50), uploadResumes)

router.post('/analyze/:jobId')

router.post('/filter/:jobId')

router.post('/schduele/:jobId')

export default router