const express = require("express");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const CourseInstructor = require("../models/CourseInstructor");
const Course = require("../models/Course");
const User = require("../models/User");
const { verifyToken, checkAdmin, checkAdminOrProfessor } = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับดึงข้อมูล Section ทั้งหมดตาม filter (สำหรับแอดมิน)
router.post("/all", verifyToken, checkAdmin, async (req, res) => {
  const { course_number, section_number, semester_term, semester_year } = req.body;

  try {
    let sections;

    if (course_number || section_number || semester_term || semester_year) {
      // Find sections that match the provided course number, section name, term, and year
      sections = await Section.find({
        ...(course_number && { course_number }),
        ...(section_number && { section_number }),
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

// ฟังก์ชันสำหรับแก้ไขข้อมูล Section
router.put("/update/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;
  const { section_number, semester_term, semester_year} = req.body;

  try {
    // ค้นหา Section ที่จะทำการแก้ไข
    const section = await Section.findById(id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // อัปเดตข้อมูล Section
    let isUpdated = false;

    if (section_number && section.section_number !== section_number) {
      section.section_number = section_number;
      isUpdated = true;
    }
    if (semester_term && section.semester_term !== semester_term) {
      section.semester_term = semester_term;
      isUpdated = true;
    }
    if (semester_year && section.semester_year !== semester_year) {
      section.semester_year = semester_year;
      isUpdated = true;
    }

    // บันทึกการเปลี่ยนแปลงเฉพาะเมื่อมีการอัปเดตข้อมูล
    if (isUpdated) {
      await section.save();
    }

    res.status(200).json({
      message: "Section updated successfully!",
      section,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ message: "Error updating section", error });
  }
});

// ฟังก์ชันสำหรับลบ Section และข้อมูลที่เกี่ยวข้อง
router.delete("/delete/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;

  try {
    // ค้นหา Section ที่จะทำการลบ
    const section = await Section.findById(id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // ลบ Enrollment ที่เกี่ยวข้อง
    await Enrollment.deleteMany({ section_id: id });

    // ลบ CourseInstructor ที่เกี่ยวข้อง
    await CourseInstructor.deleteMany({ section_id: id });

    // ลบ Section ID จาก Course ที่เกี่ยวข้อง
    await Course.updateMany(
      { sections: id },
      { $pull: { sections: id } }
    );

    // ลบ Section
    await section.deleteOne();

    res.status(200).json({
      message: "Section and associated data deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: "Error deleting section", error });
  }
});

// ฟังก์ชันสำหรับดึงข้อมูลนักเรียนที่เกี่ยวข้องกับ Section
router.get("/students/:section_id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { section_id } = req.params;

  try {
    const enrollments = await Enrollment.find({ section_id }).populate("student_id", "personal_num first_name last_name email");

    if (!enrollments.length) {
      return res.status(404).json({ message: "No students found for this section" });
    }

    const students = enrollments.map(enrollment => {
      const student = enrollment.student_id;
      if (!student) {
        return {};
      }
      return {
        student_id: student._id,
        personal_num: student.personal_num,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
      };
    });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students for section:", error);
    res.status(500).json({ message: "Error fetching students for section", error });
  }
});

// ฟังก์ชันสำหรับดึงข้อมูลอาจารย์ที่เกี่ยวข้องกับ Section
router.get("/professors/:section_id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { section_id } = req.params;

  try {
    const instructors = await CourseInstructor.find({ section_id }).populate("professor_id", "personal_num first_name last_name email");

    if (!instructors.length) {
      return res.status(404).json({ message: "No professors found for this section" });
    }

    const professors = instructors.map(instructor => {
      const professor = instructor.professor_id;
      if (!professor) {
        return {};
      }
      return {
        professor_id: professor._id,
        personal_num: professor.personal_num,
        first_name: professor.first_name,
        last_name: professor.last_name,
        email: professor.email,
      };
    });

    res.status(200).json(professors);
  } catch (error) {
    console.error("Error fetching professors for section:", error);
    res.status(500).json({ message: "Error fetching professors for section", error });
  }
});

module.exports = router;
