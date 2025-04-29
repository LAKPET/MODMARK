const express = require("express");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const CourseInstructor = require("../models/CourseInstructor");
const Course = require("../models/Course");
const User = require("../models/User");
const Assessment = require("../models/Assessment");
const {
  verifyToken,
  checkAdmin,
  checkAdminOrProfessorOrTeacherAssistant,
} = require("./middleware");

const router = express.Router();

// ฟังก์ชันสำหรับดึงข้อมูล Section ทั้งหมดตาม filter (สำหรับแอดมิน)
router.post("/all", verifyToken, checkAdmin, async (req, res) => {
  const { course_number, section_number, semester_term, semester_year } =
    req.body;

  try {
    let sections;

    if (course_number || section_number || semester_term || semester_year) {
      // Find sections that match the provided course number, section name, term, and year
      sections = await Section.find({
        ...(course_number && { course_number }),
        ...(section_number && { section_number }),
        ...(semester_term && { semester_term }),
        ...(semester_year && { semester_year }),
      });

      if (sections.length === 0) {
        return res.status(404).json({
          message: "No sections found matching the provided criteria",
        });
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

// ฟังก์ชันสำหรับแก้ไขข้อมูล Section และ Course
router.put(
  "/update/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;
    const {
      section_number,
      semester_term,
      semester_year,
      course_number,
      course_name,
      course_description,
    } = req.body;

    try {
      // ค้นหา Section ที่จะทำการแก้ไข
      const section = await Section.findById(id);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      // ค้นหา Course ที่เกี่ยวข้อง
      const course = await Course.findById(section.course_id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // อัปเดตข้อมูล Section
      let isSectionUpdated = false;
      if (section_number && section.section_number !== section_number) {
        section.section_number = section_number;
        isSectionUpdated = true;
      }
      if (semester_term && section.semester_term !== semester_term) {
        section.semester_term = semester_term;
        isSectionUpdated = true;
      }
      if (semester_year && section.semester_year !== semester_year) {
        section.semester_year = semester_year;
        isSectionUpdated = true;
      }
      if (course_number && section.course_number !== course_number) {
        section.course_number = course_number;
        isSectionUpdated = true;
      }
      if (course_name && section.course_name !== course_name) {
        section.course_name = course_name;
        isSectionUpdated = true;
      }

      // อัปเดตข้อมูล Course
      let isCourseUpdated = false;
      if (course_number && course.course_number !== course_number) {
        course.course_number = course_number;
        isCourseUpdated = true;
      }
      if (course_name && course.course_name !== course_name) {
        course.course_name = course_name;
        isCourseUpdated = true;
      }
      if (
        course_description &&
        course.course_description !== course_description
      ) {
        course.course_description = course_description;
        isCourseUpdated = true;
      }

      // บันทึกการเปลี่ยนแปลงเฉพาะเมื่อมีการอัปเดตข้อมูล
      if (isSectionUpdated) {
        await section.save();
      }
      if (isCourseUpdated) {
        await course.save();
      }

      res.status(200).json({
        message: "Section and Course updated successfully!",
        section,
        course,
      });
    } catch (error) {
      console.error("Error updating section and course:", error);
      res
        .status(500)
        .json({ message: "Error updating section and course", error });
    }
  }
);

// ฟังก์ชันสำหรับลบ Section และข้อมูลที่เกี่ยวข้อง
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
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
      await Course.updateMany({ sections: id }, { $pull: { sections: id } });

      // ลบ Section
      await section.deleteOne();

      res.status(200).json({
        message: "Section and associated data deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Error deleting section", error });
    }
  }
);

// ฟังก์ชันสำหรับดึงข้อมูลนักเรียนที่เกี่ยวข้องกับ Section
router.get(
  "/students/:section_id",
  verifyToken,

  async (req, res) => {
    const { section_id } = req.params;

    try {
      const enrollments = await Enrollment.find({ section_id }).populate(
        "student_id",
        "personal_num first_name last_name email"
      );

      if (!enrollments.length) {
        return res
          .status(404)
          .json({ message: "No students found for this section" });
      }

      const students = enrollments.map((enrollment) => {
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
      res
        .status(500)
        .json({ message: "Error fetching students for section", error });
    }
  }
);

// ฟังก์ชันสำหรับดึงข้อมูลอาจารย์ที่เกี่ยวข้องกับ Section
router.get(
  "/professors/:section_id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { section_id } = req.params;

    try {
      const instructors = await CourseInstructor.find({ section_id }).populate(
        "professor_id",
        "personal_num role first_name last_name email"
      );

      if (!instructors.length) {
        return res
          .status(404)
          .json({ message: "No professors found for this section" });
      }

      const professors = instructors.map((instructor) => {
        const professor = instructor.professor_id;
        if (!professor) {
          return {};
        }
        return {
          professor_id: professor._id,
          personal_num: professor.personal_num,
          role: professor.role,
          first_name: professor.first_name,
          last_name: professor.last_name,
          email: professor.email,
        };
      });

      res.status(200).json(professors);
    } catch (error) {
      console.error("Error fetching professors for section:", error);
      res
        .status(500)
        .json({ message: "Error fetching professors for section", error });
    }
  }
);

module.exports = router;
