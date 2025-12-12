import prisma from "../config/prisma.js";

const jobDescription = async (req, res) => {
  try {
    const { companyName, title, content } = req.body
    const company = await prisma.company.findUnique({
      where: { name: companyName }
    })

    if (!company) {
      return res.status(404).json({ message: 'Company Not Found' })
    }

    const job = await prisma.job.create({
      data: {
        title, content, companyId: company.id
      }
    })

    res.status(201).json( job )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default jobDescription