const express = require("express");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const CourseInstructor = require("../models/CourseInstructor");
const {
  verifyToken,
  checkAdmin,
  checkAdminOrProfessor,
  checkAdminOrStudent,
} = require("./middleware");

const router = express.Router();

// สร้าง Course พร้อม Section
router.post("/create", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const {
    course_number,
    course_name,
    course_description,
    section_name,
    section_term,
    section_year,
  } = req.body;

  if (
    !course_number ||
    !course_name ||
    !section_name ||
    !section_term ||
    !section_year
  ) {
    return res.status(400).json({
      message: "All fields are required for Course and Section.",
    });
  }

  try {
    let existingCourse = await Course.findOne({ course_number, course_name });

    if (!existingCourse) {
      existingCourse = new Course({
        course_number,
        course_name,
        course_description,
      });
      await existingCourse.save();
    }

    const existingSection = await Section.findOne({
      course_id: existingCourse._id,
      section_name,
      semester_term: section_term,
      semester_year: section_year,
    });

    if (existingSection) {
      return res.status(400).json({
        message: `Section ${section_name} for term ${section_term} in year ${section_year} already exists.`,
      });
    }

    // เพิ่ม course_number และ course_name ใน Section
    const newSection = new Section({
      course_id: existingCourse._id, // เชื่อมโยงกับ Course ที่ถูกต้อง
      section_name,
      semester_term: section_term,
      semester_year: section_year,
      professor_id: req.user.role === "professor" ? req.user.id : null, // หากเป็น admin ให้ professor_id เป็น null
      course_number: existingCourse.course_number, // เก็บรหัสวิชาจาก Course
      course_name: existingCourse.course_name, // เก็บชื่อวิชาจาก Course
    });
    await newSection.save();

    // เพิ่ม Section ไปยัง Course
    existingCourse.sections.push(newSection._id);
    await existingCourse.save();

    // ลงทะเบียนอาจารย์อัตโนมัติหากผู้ใช้ไม่ใช่ admin
    let newCourseInstructor = null;
    if (req.user.role === "professor") {
      newCourseInstructor = new CourseInstructor({
        section_id: newSection._id,
        professor_id: req.user.id, // ID ของอาจารย์ที่สร้าง
        email: req.user.email, // ใช้ email จาก middleware
        username: req.user.username, // ใช้ username จาก middleware
        course_number: existingCourse.course_number,
        section_name: newSection.section_name,
      });
      await newCourseInstructor.save();
    }

    res.status(201).json({
      message: "Course and Section created successfully!",
      course: existingCourse,
      section: newSection,
      ...(newCourseInstructor && { instructor: newCourseInstructor }), // เพิ่ม instructor เฉพาะกรณีที่ไม่ใช่ admin
    });
  } catch (error) {
    console.error("Error creating course and section:", error);
    res
      .status(500)
      .json({ message: "Error creating course and section", error });
  }
});

module.exports = router;

// ฟังก์ชันสำหรับดึงข้อมูลคอร์สของผู้ใช้
router.get("/my-courses", verifyToken, async (req, res) => {
  try {
    let courses;

    // ถ้าเป็นนักเรียนให้ดึงข้อมูลจาก Enrollment
    if (req.user.role === "student") {
      const enrollments = await Enrollment.find({
        student_id: req.user.id,
      }).populate({
        path: "section_id",
        populate: {
          path: "course_id",
          select: "course_number course_name course_description",
        },
      });

      // ดึงข้อมูลของคอร์สและ section ที่เกี่ยวข้อง
      courses = enrollments.map((enrollment) => ({
        course_number: enrollment.section_id.course_id.course_number,
        course_name: enrollment.section_id.course_id.course_name,
        course_description: enrollment.section_id.course_id.course_description,
        section_name: enrollment.section_id.section_name,
        section_term: enrollment.section_id.semester_term,
        section_year: enrollment.section_id.semester_year,
      }));
    }
    // ถ้าเป็นอาจารย์ให้ดึงข้อมูลจาก CourseInstructor
    else if (req.user.role === "professor") {
      const courseInstructors = await CourseInstructor.find({
        professor_id: req.user.id,
      }).populate({
        path: "section_id",
        populate: {
          path: "course_id",
          select: "course_number course_name course_description",
        },
      });

      // ดึงข้อมูลของคอร์สและ section ที่เกี่ยวข้อง
      courses = courseInstructors.map((courseInstructor) => ({
        course_number: courseInstructor.section_id.course_id.course_number,
        course_name: courseInstructor.section_id.course_id.course_name,
        course_description:
          courseInstructor.section_id.course_id.course_description,
        section_name: courseInstructor.section_id.section_name,
        section_term: courseInstructor.section_id.semester_term,
        section_year: courseInstructor.section_id.semester_year,
      }));
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching my courses:", error);
    res.status(500).json({ message: "Error fetching my courses", error });
  }
});

router.get("/course/details/:courseNumber", async (req, res) => {
  try {
    const { courseNumber } = req.params; // ดึง courseNumber จาก URL parameter

    // ค้นหาคอร์สที่มี course_number ตรงกับที่ระบุ
    const courseDetails = await Course.findOne({
      course_number: courseNumber,
    }).populate({
      path: "sections", // Populate section_id ที่เกี่ยวข้อง
      select: "section_name semester_term semester_year", // เลือก fields ที่ต้องการแสดง
    });

    // ตรวจสอบว่าพบข้อมูลคอร์สหรือไม่
    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ส่งข้อมูลคอร์สกลับไปยัง client
    res.status(200).json({
      course_number: courseDetails.course_number,
      course_name: courseDetails.course_name,
      course_description: courseDetails.course_description,
      sections: courseDetails.sections.map((section) => ({
        section_name: section.section_name,
        semester_term: section.semester_term,
        semester_year: section.semester_year,
      })),
    });
  } catch (error) {
    console.error("Error fetching course details:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching course details", error: error.message });
  }
});

// ฟังก์ชันสำหรับแก้ไขข้อมูล Course
router.put(
  "/update/:id",
  verifyToken,
  checkAdminOrProfessor,
  async (req, res) => {
    const { id } = req.params;
    const { course_number, course_name, course_description } = req.body;

    try {
      // ค้นหา Course ที่จะทำการแก้ไข
      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // แก้ไขข้อมูลที่ถูกส่งมาจาก body
      if (course_number) course.course_number = course_number;
      if (course_name) course.course_name = course_name;
      if (course_description) course.course_description = course_description;

      // บันทึกการเปลี่ยนแปลง
      await course.save();

      res.status(200).json({
        message: "Course updated successfully!",
        course,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating course", error });
    }
  }
);

// ฟังก์ชันสำหรับลบ Course และ Section ที่เกี่ยวข้อง
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrProfessor,
  async (req, res) => {
    const { id } = req.params;

    try {
      // ค้นหา Course ที่จะทำการลบ
      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // ลบ Section ที่เกี่ยวข้อง
      await Section.deleteMany({ course_id: id });

      // ลบ Course
      await course.deleteOne();

      res
        .status(200)
        .json({
          message: "Course and associated sections deleted successfully!",
        });
    } catch (error) {
      res.status(500).json({ message: "Error deleting course", error });
    }
  }
);

module.exports = router;
