const express = require("express");
const mongoose = require("mongoose");
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
    section_number,
    section_term,
    section_year,
  } = req.body;

  if (
    !course_number ||
    !course_name ||
    !section_number ||
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
      section_number,
      semester_term: section_term,
      semester_year: section_year,
    });

    if (existingSection) {
      return res.status(400).json({
        message: `Section ${section_number} for term ${section_term} in year ${section_year} already exists.`,
      });
    }

    // เพิ่ม course_number, course_name และ personal_num ใน Section
    const newSection = new Section({
      course_id: existingCourse._id, // เชื่อมโยงกับ Course ที่ถูกต้อง
      section_number,
      semester_term: section_term,
      semester_year: section_year,
      course_number: existingCourse.course_number, // เก็บรหัสวิชาจาก Course
      course_name: existingCourse.course_name, // เก็บชื่อวิชาจาก Course
      personal_num: req.user.personal_num, // ดึง personal_num จาก token
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
        professor_id: req.user.id, // ตรวจสอบว่า req.user.id ถูกตั้งค่าอย่างถูกต้อง
        personal_num: req.user.personal_num, // ID ของอาจารย์ที่สร้าง Section
        course_number: existingCourse.course_number,
        section_number: newSection.section_number, // เปลี่ยนจาก section_name เป็น section_number
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

// ฟังก์ชันสำหรับดึงข้อมูลคอร์สของผู้ใช้
router.get("/my-courses", verifyToken, async (req, res) => {
  try {
    let courses;

    // ถ้าเป็นนักเรียนให้ดึงข้อมูลจาก Enrollment
    if (req.user.role === "student") {
      const enrollments = await Enrollment.find({
        personal_num: req.user.personal_num,
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
        section_id: enrollment.section_id._id,
        section_number: enrollment.section_id.section_number,
        section_term: enrollment.section_id.semester_term,
        section_year: enrollment.section_id.semester_year,
      }));
    }
    // ถ้าเป็นอาจารย์ให้ดึงข้อมูลจาก CourseInstructor
    else if (req.user.role === "professor") {
      const courseInstructors = await CourseInstructor.find({
        personal_num: req.user.personal_num,
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
        section_id: courseInstructor.section_id._id,
        section_number: courseInstructor.section_id.section_number,
        section_term: courseInstructor.section_id.semester_term,
        section_year: courseInstructor.section_id.semester_year,
      }));
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching my courses:", error);
    res
      .status(500)
      .json({ message: "Error fetching my courses", error: error.message });
  }
});

// ฟังก์ชันสำหรับดึงข้อมูล Course และ Section โดยใช้ ID ของ Section
router.get("/details/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // ค้นหา Section โดยใช้ ID
    const section = await Section.findById(id).populate("course_id");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // ดึงข้อมูล Course ที่เกี่ยวข้อง
    const course = section.course_id;

    // ดึงข้อมูลทีมผู้สอนของ Section นี้
    const instructors = await CourseInstructor.find({
      section_id: id,
    }).populate("professor_id", "first_name last_name");

    // ส่งข้อมูลในรูปแบบที่กำหนด
    res.status(200).json({
      course_id: course._id,
      course_number: course.course_number,
      course_name: course.course_name,
      course_description: course.course_description,
      section_id: section._id,
      section_number: section.section_number,
      semester_term: section.semester_term,
      semester_year: section.semester_year,
      professors: instructors.map((instructor) => ({
        personal_num: instructor.personal_num,
        professor_id: instructor.professor_id._id,
        first_name: instructor.professor_id.first_name,
        last_name: instructor.professor_id.last_name,
      })),
    });
  } catch (error) {
    console.error("Error fetching course and section details:", error);
    res
      .status(500)
      .json({ message: "Error fetching course and section details", error });
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

      // อัปเดตข้อมูล Course
      if (course_number && course.course_number !== course_number) {
        course.course_number = course_number;
      }
      if (course_name && course.course_name !== course_name) {
        course.course_name = course_name;
      }
      if (
        course_description &&
        course.course_description !== course_description
      ) {
        course.course_description = course_description;
      }

      // บันทึกการเปลี่ยนแปลงของ Course
      await course.save();

      // อัปเดตข้อมูลใน Sections ที่เกี่ยวข้อง
      const sections = await Section.find({ course_id: course._id });
      for (const section of sections) {
        let isUpdated = false;

        if (course_number && section.course_number !== course_number) {
          section.course_number = course_number;
          isUpdated = true;
        }
        if (course_name && section.course_name !== course_name) {
          section.course_name = course_name;
          isUpdated = true;
        }

        // บันทึกการเปลี่ยนแปลงเฉพาะเมื่อมีการอัปเดตข้อมูล
        if (isUpdated) {
          await section.save();
        }

        // อัปเดตข้อมูลใน CourseInstructor ที่เกี่ยวข้อง
        const courseInstructors = await CourseInstructor.find({
          section_id: section._id,
        });
        for (const instructor of courseInstructors) {
          let isInstructorUpdated = false;

          if (course_number && instructor.course_number !== course_number) {
            instructor.course_number = course_number;
            isInstructorUpdated = true;
          }
          if (
            section.section_number &&
            instructor.section_number !== section.section_number
          ) {
            instructor.section_number = section.section_number;
            isInstructorUpdated = true;
          }

          // บันทึกการเปลี่ยนแปลงเฉพาะเมื่อมีการอัปเดตข้อมูล
          if (isInstructorUpdated) {
            await instructor.save();
          }
        }
      }

      res.status(200).json({
        message:
          "Course and related sections and instructors updated successfully!",
        course,
      });
    } catch (error) {
      console.error("Error updating course and sections:", error);
      res
        .status(500)
        .json({ message: "Error updating course and sections", error });
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

      // ลบ Enrollment ที่เกี่ยวข้อง
      await Enrollment.deleteMany({ section_id: { $in: course.sections } });

      // ลบ CourseInstructor ที่เกี่ยวข้อง
      await CourseInstructor.deleteMany({
        section_id: { $in: course.sections },
      });

      // ลบ Course
      await course.deleteOne();

      res.status(200).json({
        message: "Course and associated sections deleted successfully!",
      });
    } catch (error) {
      res.status(500).json({ message: "Error deleting course", error });
    }
  }
);

module.exports = router;
