const express = require("express");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const CourseInstructor = require("../models/CourseInstructor");
const { verifyToken, checkAdmin, checkAdminOrProfessor, checkAdminOrStudent } = require("./middleware");

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

    const newSection = new Section({
      course_id: existingCourse._id,  // เชื่อมโยงกับ Course ที่ถูกต้อง
      section_name,
      semester_term: section_term,
      semester_year: section_year,
      professor_id: req.user.id,  // ใช้ข้อมูลผู้ใช้งานที่ล็อกอินมา
    });
    await newSection.save();
    
    // เพิ่ม Section ไปยัง Course
    existingCourse.sections.push(newSection._id);
    await existingCourse.save();

    res.status(201).json({
      message: "Course and Section created successfully!",
      course: existingCourse,
      section: newSection,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating course and section", error });
  }
});

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้ใน Section (นักเรียน)
router.post("/enroll", verifyToken, checkAdminOrStudent, async (req, res) => {
    const { section_id } = req.body; // รับข้อมูล section_id จาก body
    const student_id = req.user.id;  // ใช้ข้อมูลจาก token (ผู้ใช้ที่ล็อกอินอยู่)
  
    try {
      // ค้นหาว่า section นี้มีอยู่ในระบบหรือไม่
      const section = await Section.findById(section_id).populate("course_id");
  
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
  
      // ตรวจสอบว่าผู้ใช้คนนี้ได้ลงทะเบียนใน section นี้แล้วหรือยัง
      const existingEnrollment = await Enrollment.findOne({
        student_id,
        section_id: section._id
      });
  
      if (existingEnrollment) {
        return res.status(400).json({ message: "You are already enrolled in this section" });
      }
  
      // ถ้ายังไม่ลงทะเบียน ก็ทำการลงทะเบียนผู้ใช้ใน section นี้
      const newEnrollment = new Enrollment({
        student_id,
        section_id: section._id,
        email: req.user.email,  // เก็บ email ของ user
        username: req.user.username,  // เก็บ username ของ user
        course_number: section.course_id.course_number, // เก็บรหัสวิชาจาก Course
        section_name: section.section_name, // เก็บชื่อ section
      });
  
      await newEnrollment.save();
  
      res.status(200).json({
        message: "Successfully enrolled in the course section",
        enrollment: newEnrollment
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Error enrolling in course", error });
    }
  });
  

// ลงทะเบียนอาจารย์ใน Section
router.post("/register-instructor", verifyToken, checkAdminOrProfessor, async (req, res) => {
    const { section_id } = req.body; // รับข้อมูล section_id จาก body
    const professor_id = req.user.id; // ใช้ข้อมูลจาก token (ผู้ใช้งานที่ล็อกอินอยู่)
    
    try {
      // ค้นหาว่า section นี้มีอยู่ในระบบหรือไม่
      const section = await Section.findById(section_id).populate('course_id'); // เพิ่ม populate ให้ดึงข้อมูล course_id
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
  
      // ตรวจสอบว่าผู้ใช้นี้เป็นอาจารย์ในระบบแล้วหรือไม่
      const existingInstructor = await CourseInstructor.findOne({
        section_id: section._id,
        professor_id
      });
  
      if (existingInstructor) {
        return res.status(400).json({ message: "Instructor is already registered for this section" });
      }
  
      // ถ้าไม่มีข้อมูลอาจารย์ใน section นี้ ก็ทำการลงทะเบียนอาจารย์ใน section นี้
      const newInstructor = new CourseInstructor({
        section_id: section._id,
        professor_id: professor_id,
        email: req.user.email,  // เก็บ email ของ user
        username: req.user.username,  // เก็บ username ของ user
        course_number: section.course_id.course_number, // เก็บรหัสวิชาจาก Course
        section_name: section.section_name, // เก็บชื่อ section
      });
  
      await newInstructor.save();
  
      res.status(200).json({
        message: "Instructor successfully registered for the section",
        courseInstructor: newInstructor
      });
    } catch (error) {
      console.error("Error registering instructor:", error);
      res.status(500).json({ message: "Error registering instructor", error });
    }
  });
  

// ฟังก์ชันสำหรับดึงข้อมูลคอร์สของผู้ใช้
router.get("/my-courses", verifyToken, async (req, res) => {
  try {
    let courses;

    // ถ้าเป็นนักเรียนให้ดึงข้อมูลจาก Enrollment
    if (req.user.role === "student") {
      const enrollments = await Enrollment.find({ student_id: req.user.id })
        .populate({
          path: "section_id", 
          populate: {
            path: "course_id", 
            select: "course_number course_name course_description"
          }
        });
      
      // ดึงข้อมูลของคอร์สและ section ที่เกี่ยวข้อง
      courses = enrollments.map(enrollment => ({
        course_number: enrollment.section_id.course_id.course_number,
        course_name: enrollment.section_id.course_id.course_name,
        course_description: enrollment.section_id.course_id.course_description,
        section_name: enrollment.section_id.section_name,
        section_term: enrollment.section_id.semester_term,
        section_year: enrollment.section_id.semester_year
      }));
    } 
    // ถ้าเป็นอาจารย์ให้ดึงข้อมูลจาก CourseInstructor
    else if (req.user.role === "professor") {
      const courseInstructors = await CourseInstructor.find({ professor_id: req.user.id })
        .populate({
          path: "section_id", 
          populate: {
            path: "course_id", 
            select: "course_number course_name course_description"
          }
        });
      
      // ดึงข้อมูลของคอร์สและ section ที่เกี่ยวข้อง
      courses = courseInstructors.map(courseInstructor => ({
        course_number: courseInstructor.section_id.course_id.course_number,
        course_name: courseInstructor.section_id.course_id.course_name,
        course_description: courseInstructor.section_id.course_id.course_description,
        section_name: courseInstructor.section_id.section_name,
        section_term: courseInstructor.section_id.semester_term,
        section_year: courseInstructor.section_id.semester_year
      }));
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching my courses:", error);
    res.status(500).json({ message: "Error fetching my courses", error });
  }
});

// แก้ไขข้อมูล Course
router.put("/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;
  const { course_number, course_name, course_description } = req.body;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // แก้ไขข้อมูล
    if (course_number) course.course_number = course_number;
    if (course_name) course.course_name = course_name;
    if (course_description) course.course_description = course_description;

    await course.save();

    res.status(200).json({
      message: "Course updated successfully!",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
});

// ลบ Course และ Section
router.delete("/:id", verifyToken, checkAdminOrProfessor, async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ลบ Section ที่เกี่ยวข้อง
    await Section.deleteMany({ course_id: id });

    // ลบ Course
    await course.deleteOne();

    res.status(200).json({ message: "Course and associated sections deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
});

module.exports = router;
