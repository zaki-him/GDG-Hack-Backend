import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

export const createCompany = async (req, res) => {
  try {
    const { name, password, email, planType } = req.body;

    const exists = await prisma.company.findUnique({
      where: { email }
    })

    if (exists) {
      return res.status(400).json({ message: 'Company already exists in DB' })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const company = await prisma.company.create({
      data: {
        name,
        email,
        planType,
        password: hashedPassword,
      },

    });
    res.status(201).json({ company })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
