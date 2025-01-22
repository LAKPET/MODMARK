const express = require("express");
const Section = require("../models/Section");
const { verifyToken, checkAdmin } = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับดึงข้อมูล Section ทั้งหมดตาม filter (สำหรับแอดมิน)
router.post("/all", verifyToken, checkAdmin, async (req, res) => {
  const { course_number, section_name, semester_term, semester_year } = req.body;

  try {
    let sections;

    if (course_number || section_name || semester_term || semester_year) {
      // Find sections that match the provided course number, section name, term, and year
      sections = await Section.find({
        ...(course_number && { course_number }),
        ...(section_name && { section_name }),
        ...(semester_term && { semester_term }),
        ...(semester_year && { semester_year })
      });

      if (sections.length === 0) {
        return res.status(404).json({ message: "No sections found matching the provided criteria" });
      }
    } else {
      // If no filtering criteria are provided, return all sections
      sections = await Section.find();
    }

    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
});

module.exports = router;
