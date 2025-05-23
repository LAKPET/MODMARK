const express = require("express");
const mongoose = require("mongoose");
const Assessment = require("../models/Assessment");
const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const AssessmentRubric = require("../models/AssessmentRubric");
const Rubric = require("../models/Rubric");
const User = require("../models/User");
const FinalScore = require("../models/FinalScore");
const Section = require("../models/Section"); // Import Section model
const StudentScore = require("../models/StudentScore"); // Import StudentScore model
const Submission = require("../models/Submission"); // Import Submission model
const {
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  checkAdminOrProfessorOrStudent,
} = require("./middleware");

const router = express.Router();

// Create a new assessment with rubric
router.post(
  "/create",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const {
      course_id,
      section_id,
      assessment_name,
      assessment_description,
      assignment_type,
      teamgrading_type,
      publish_date,
      due_date,
      rubric_id, // ID of the selected rubric
      graders, // Array of graders with their weights [{ user_id, role, weight }] - role should be 'professor' or 'ta'
    } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const section = await Section.findById(section_id);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      const existingAssessment = await Assessment.findOne({
        assessment_name,
        section_id,
      });
      if (existingAssessment) {
        return res
          .status(400)
          .json({ message: "Assessment name already exists in this section." });
      }

      const selectedRubric = await Rubric.findById(rubric_id);
      if (!selectedRubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }

      // Validate grader weights
      let totalWeight = 0;
      if (!teamgrading_type) {
        totalWeight = 1; // Professor creating is the sole grader initially
      } else if (graders && graders.length > 0) {
        totalWeight = graders.reduce((sum, grader) => sum + grader.weight, 0);
        if (graders.some((grader) => grader.weight < 0 || grader.weight > 1)) {
          return res
            .status(400)
            .json({ message: "Weight of each grader must be between 0 and 1" });
        }
        if (totalWeight > 1) {
          // Allow total weight to be slightly less than 1 due to floating point, but not over
          if (Math.abs(totalWeight - 1) > 0.0001 && totalWeight > 1) {
            return res
              .status(400)
              .json({ message: "Total weight of graders must not exceed 1" });
          }
        }
      } else if (teamgrading_type && (!graders || graders.length === 0)) {
        // Require graders for team grading unless handled differently
        // return res.status(400).json({ message: "Graders are required for team grading." });
        // Or assign the creator as default grader? Let's assume creator is default if none provided for now.
        totalWeight = 1; // Defaulting to creator if no graders provided for team grading
      }

      const newAssessment = new Assessment({
        course_id: course_id,
        section_id: section_id,
        professor_id: req.user.id, // The user creating the assessment
        first_name: user.first_name,
        last_name: user.last_name,
        assessment_name,
        assessment_description,
        assignment_type,
        teamgrading_type,
        publish_date,
        due_date,
        rubric_id: selectedRubric._id, // Store the selected rubric ID directly
      });

      await newAssessment.save();

      // Link rubric to assessment
      const newAssessmentRubric = new AssessmentRubric({
        assessment_id: newAssessment._id,
        rubric_id: selectedRubric._id,
        is_active: true,
      });
      await newAssessmentRubric.save();

      // Also add this assessment link to the Rubric's assessments array
      selectedRubric.assessments.push(newAssessmentRubric._id);
      await selectedRubric.save();

      // Create group for professors/TAs who will grade the assessment
      const gradingGroup = new Group({
        assessment_id: newAssessment._id,
        group_name: `${assessment_name} Grading Group`,
        group_type: "grading",
        status: "not-submit", // Or relevant initial status
      });
      await gradingGroup.save();

      // Save graders with their weights in GroupMember
      if (!teamgrading_type) {
        // If teamgrading_type is false, only the professor who created the assessment is the grader
        const professorGroupMember = new GroupMember({
          group_id: gradingGroup._id,
          assessment_id: newAssessment._id,
          user_id: req.user.id, // Professor's user ID
          role: "professor",
          weight: 1, // Sole grader
        });
        await professorGroupMember.save();
      } else if (graders && graders.length > 0) {
        for (const grader of graders) {
          // Ensure user exists before adding as grader (optional but good practice)
          const graderUser = await User.findById(grader.user_id);
          if (
            !graderUser ||
            !["professor", "ta"].includes(graderUser.role.toLowerCase())
          ) {
            console.warn(
              `Grader user not found or invalid role: ${grader.user_id}`
            );
            // Decide whether to skip or return error. Skipping for now.
            continue;
          }
          const newGroupMember = new GroupMember({
            group_id: gradingGroup._id,
            assessment_id: newAssessment._id,
            user_id: new mongoose.Types.ObjectId(grader.user_id),
            role: grader.role.toLowerCase(), // Ensure lowercase 'professor' or 'ta'
            weight: grader.weight,
          });
          await newGroupMember.save();
        }
      } else {
        // Default: Add the creator as the grader if no specific graders were provided
        const professorGroupMember = new GroupMember({
          group_id: gradingGroup._id,
          assessment_id: newAssessment._id,
          user_id: req.user.id, // Professor's user ID
          role: "professor",
          weight: 1, // Sole grader by default
        });
        await professorGroupMember.save();
      }

      res.status(201).json({
        message: "Assessment created successfully!",
        assessment: newAssessment,
        rubric: selectedRubric, // Include rubric details if needed
      });
    } catch (error) {
      console.error("Error creating assessment:", error);
      res
        .status(500)
        .json({ message: "Error creating assessment", error: error.message });
    }
  }
);

// Get all assessments (Admin/Prof/TA view)
router.get(
  "/",
  verifyToken,

  async (req, res) => {
    try {
      const assessments = await Assessment.find()
        .populate("course_id", "course_name")
        .populate("section_id", "section_number semester_term semester_year")
        .populate("professor_id", "first_name last_name email")
        .populate("rubric_id", "rubric_name description")
        .lean(); // Use .lean() for potentially better performance if not modifying docs

      const assessmentsWithGraders = await Promise.all(
        assessments.map(async (assessment) => {
          const graders = await GroupMember.find({
            assessment_id: assessment._id,
            role: { $in: ["professor", "ta"] }, // Standardized to lowercase 'ta'
          })
            .populate("user_id", "first_name last_name email role") // Include role for clarity
            .select("user_id weight")
            .lean();

          return {
            ...assessment,
            graders,
          };
        })
      );

      res.status(200).json(assessmentsWithGraders);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res
        .status(500)
        .json({ message: "Error fetching assessments", error: error.message });
    }
  }
);

// Get a specific assessment by ID (Admin/Prof/TA view)
router.get(
  "/:id",
  verifyToken,

  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Assessment ID format" });
    }

    try {
      const assessment = await Assessment.findById(id)
        .populate("course_id", "course_name")
        .populate("section_id", "section_number semester_term semester_year")
        .populate("professor_id", "first_name last_name email")
        .populate("rubric_id", "rubric_name description score criteria") // Populate more rubric details if needed
        .lean();

      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      const graders = await GroupMember.find({
        assessment_id: assessment._id,
        role: { $in: ["professor", "ta"] }, // Standardized to lowercase 'ta'
      })
        .populate("user_id", "first_name last_name role email")
        .select("user_id weight")
        .lean();

      res.status(200).json({ ...assessment, graders });
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res
        .status(500)
        .json({ message: "Error fetching assessment", error: error.message });
    }
  }
);

// Get all assessments in a section (Student/Prof/TA/Admin view)
router.get(
  "/section/:section_id",
  verifyToken,
  // Allows students too
  async (req, res) => {
    const { section_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(section_id)) {
      return res.status(400).json({ message: "Invalid Section ID format" });
    }

    try {
      // Optionally filter by publish_date for students
      const filter = { section_id };
      // Uncomment below if students should only see published assessments
      // const user = await User.findById(req.user.id).select('role');
      // if (user && user.role === 'student') {
      //    filter.publish_date = { $lte: new Date() }; // Only show if publish_date is past or now
      // }

      const assessments = await Assessment.find(filter)
        .populate("course_id", "course_name")
        .populate("section_id", "section_number semester_term semester_year")
        .populate("professor_id", "first_name last_name email")
        .populate("rubric_id", "rubric_name description")
        .lean();

      if (!assessments.length && !(await Section.findById(section_id))) {
        return res.status(404).json({ message: "Section not found" });
      }

      const assessmentsWithDetails = await Promise.all(
        assessments.map(async (assessment) => {
          // Graders might be sensitive, decide if students should see them
          // For now, we fetch them but you might want to remove/limit this based on user role
          const graders = await GroupMember.find({
            assessment_id: assessment._id,
            role: { $in: ["professor", "ta"] }, // Standardized 'ta'
          })
            .populate("user_id", "first_name last_name role email")
            .select("user_id weight")
            .lean();

          return {
            ...assessment,
            graders, // Consider omitting this for students
          };
        })
      );

      res.status(200).json(assessmentsWithDetails);
    } catch (error) {
      console.error("Error fetching assessments for section:", error);
      res.status(500).json({
        message: "Error fetching assessments for section",
        error: error.message,
      });
    }
  }
);

// Get assessment progress for a student in a section
router.get(
  "/progress/:section_id",
  verifyToken, // Requires logged-in user
  async (req, res) => {
    const { section_id } = req.params;
    const student_id = req.user.id; // Get student ID from token

    if (!mongoose.Types.ObjectId.isValid(section_id)) {
      return res.status(400).json({ message: "Invalid Section ID format" });
    }

    try {
      const section = await Section.findById(section_id).lean();
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      // Find all assessments in the section
      const assessmentsInSection = await Assessment.find({ section_id })
        .select("_id")
        .lean();
      const totalAssessments = assessmentsInSection.length;

      if (totalAssessments === 0) {
        return res.status(200).json({
          course_id: section.course_id,
          section_id,
          total_assessments: 0,
          completed_assessments: 0,
          remaining_assessments: 0,
        });
      }

      const assessmentIds = assessmentsInSection.map((a) => a._id);

      // 1. หา group ที่ user เป็นสมาชิกใน section และ assessment เหล่านี้
      const groupMembers = await GroupMember.find({
        assessment_id: { $in: assessmentIds },
        user_id: student_id,
      }).select("group_id assessment_id").lean();

      // Map assessment_id => group_id ที่ user อยู่
      const assessmentGroupMap = {};
      groupMembers.forEach((gm) => {
        assessmentGroupMap[gm.assessment_id.toString()] = gm.group_id;
      });

      // 2. หา submission ที่ assessment_id และ group_id ตรงกับที่ user อยู่
      const submissions = await Submission.find({
        assessment_id: { $in: assessmentIds },
        group_id: { $in: Object.values(assessmentGroupMap) },
      }).select("assessment_id group_id").lean();

      // 3. นับ assessment ที่มี submission ในกลุ่มของ user
      const completedAssessmentSet = new Set();
      submissions.forEach((sub) => {
        // ตรวจสอบว่า submission นี้เป็นของกลุ่มที่ user อยู่ใน assessment นั้น
        const aid = sub.assessment_id.toString();
        if (
          assessmentGroupMap[aid] &&
          sub.group_id &&
          sub.group_id.toString() === assessmentGroupMap[aid].toString()
        ) {
          completedAssessmentSet.add(aid);
        }
      });

      const completedAssessments = completedAssessmentSet.size;

      res.status(200).json({
        course_id: section.course_id,
        section_id,
        total_assessments: totalAssessments,
        completed_assessments: completedAssessments,
        remaining_assessments: totalAssessments - completedAssessments,
      });
    } catch (error) {
      console.error("Error fetching assessment progress:", error);
      res.status(500).json({
        message: "Error fetching assessment progress",
        error: error.message,
      });
    }
  }
);

// Get scores for a student in each assessment of a section
router.get(
  "/scores/:section_id",
  verifyToken, // Requires logged-in user
  async (req, res) => {
    const { section_id } = req.params;
    const student_id = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(section_id)) {
      return res.status(400).json({ message: "Invalid Section ID format" });
    }

    try {
      const assessments = await Assessment.find({ section_id })
        .populate("rubric_id", "score rubric_name") // Get max score from rubric
        .lean();

      if (!assessments.length) {
        // Check if section exists to differentiate between no assessments and invalid section
        if (!(await Section.findById(section_id))) {
          return res.status(404).json({ message: "Section not found" });
        }
        return res.status(200).json([]); // No assessments in this section, return empty array
      }

      const scores = await Promise.all(
        assessments.map(async (assessment) => {
          let studentScoreValue = null; // Use null to indicate not graded/no score yet
          let maxScore = assessment.rubric_id?.score || 0; // Get max score from populated rubric

          // Fetch score from StudentScore
          const studentScore = await StudentScore.findOne({
            assessment_id: assessment._id,
            student_id: student_id,
          })
            .select("score")
            .lean();

          if (studentScore) {
            studentScoreValue = studentScore.score;
          }

          return {
            assessment_id: assessment._id,
            assessment_name: assessment.assessment_name,
            max_score: maxScore,
            student_score: studentScoreValue, // Will be null if not graded/found
          };
        })
      );

      res.status(200).json(scores);
    } catch (error) {
      console.error("Error fetching student scores for section:", error);
      res.status(500).json({
        message: "Error fetching student scores for section",
        error: error.message,
      });
    }
  }
);

// Get overall score statistics for a section (Admin/Prof/TA view)
router.get(
  "/statistics/:section_id",
  verifyToken, // Usually restricted view
  async (req, res) => {
    const { section_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(section_id)) {
      return res.status(400).json({ message: "Invalid Section ID format" });
    }

    try {
      const assessments = await Assessment.find({ section_id })
        .populate("rubric_id", "score rubric_name")
        .lean();

      if (!assessments.length) {
        if (!(await Section.findById(section_id))) {
          return res.status(404).json({ message: "Section not found" });
        }
        return res.status(200).json({
          assessments_statistics: [],
          overall_statistics: { overall_mean: 0 },
          Myscore: 0,
        });
      }

      let overallMean = 0;
      let totalAssessmentMeans = 0;
      let studentTotalScore = 0;

      // ส่วนที่ 1: ส่งสถิติ max, min, mean
      const statistics = await Promise.all(
        assessments.map(async (assessment) => {
          const submissions = await StudentScore.find({
            assessment_id: assessment._id,
          }).select("score student_id").lean();

          const scores = submissions
            .map((submission) => submission.score)
            .filter((score) => score !== undefined && score !== null);

          const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
          const minScore = scores.length > 0 ? Math.min(...scores) : 0;
          const meanScore =
            scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : 0;

          totalAssessmentMeans += meanScore;

          return {
            assessment_id: assessment._id,
            assessment_name: assessment.assessment_name,
            max_possible_score: assessment.rubric_id?.score || 0,
            max_score: maxScore,
            min_score: minScore,
            mean_score: parseFloat(meanScore.toFixed(2)), // Format mean score
          };
        })
      );

      // ส่วนที่ 2: คำนวณ overallMean และ Myscore
      overallMean =
        assessments.length > 0
          ? parseFloat((totalAssessmentMeans / assessments.length).toFixed(2))
          : 0;

      const studentSubmissions = await StudentScore.find({
        section_id,
        student_id: req.user.id,
      }).select("score");

      studentTotalScore = studentSubmissions.reduce(
        (sum, submission) => sum + (submission.score || 0),
        0
      );

      const Myscore =
        assessments.length > 0
          ? parseFloat((studentTotalScore / assessments.length).toFixed(2))
          : 0;

      // ส่วนที่ 3: นับจำนวน submission และงานที่อาจารย์ตรวจแล้ว
      const submissionStatistics = await Promise.all(
        assessments.map(async (assessment) => {
          const submissions = await Submission.find({
            assessment_id: assessment._id,
          }).select("grading_status grading_status_by").lean();

          const submissionCount = submissions.length;

          const gradedByProfessor = submissions.filter((submission) =>
            submission.grading_status_by.some(
              (grader) =>
                grader.grader_id.toString() === req.user.id &&
                grader.status === "already"
            )
          ).length;

          const notGradedByProfessor = submissions.filter((submission) =>
            submission.grading_status_by.some(
              (grader) =>
                grader.grader_id.toString() === req.user.id &&
                grader.status === "pending"
            )
          ).length;

          return {
            assessment_id: assessment._id,
            submission_count: submissionCount,
            graded_by_professor: gradedByProfessor,
            not_graded_by_professor: notGradedByProfessor,
          };
        })
      );

      // รวมผลลัพธ์จากทั้ง 3 ส่วน
      const combinedStatistics = statistics.map((stat) => {
        const submissionStat = submissionStatistics.find(
          (subStat) => subStat.assessment_id.toString() === stat.assessment_id.toString()
        );
        return {
          ...stat,
          submission_count: submissionStat?.submission_count || 0,
          graded_by_professor: submissionStat?.graded_by_professor || 0,
          not_graded_by_professor: submissionStat?.not_graded_by_professor || 0,
        };
      });

      res.status(200).json({
        assessments_statistics: combinedStatistics,
        overall_statistics: {
          overall_mean: overallMean,
        },
        Myscore,
      });
    } catch (error) {
      console.error("Error fetching statistics for section:", error);
      res.status(500).json({
        message: "Error fetching statistics for section",
        error: error.message,
      });
    }
  }
);

// Update an assessment
router.put(
  "/update/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;
    const {
      assessment_name,
      assessment_description,
      assignment_type,
      teamgrading_type,
      publish_date,
      due_date,
      rubric_id, // New rubric ID (optional)
      graders, // Updated array of graders [{ user_id, role, weight }]
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Assessment ID format" });
    }
    if (rubric_id && !mongoose.Types.ObjectId.isValid(rubric_id)) {
      return res.status(400).json({ message: "Invalid Rubric ID format" });
    }

    try {
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // --- Rubric Update Handling ---
      let oldRubricId = assessment.rubric_id; // Store the current rubric ID
      let newRubricId = rubric_id
        ? new mongoose.Types.ObjectId(rubric_id)
        : null;
      let assessmentRubricRecord = null;

      if (newRubricId && !newRubricId.equals(oldRubricId)) {
        const newSelectedRubric = await Rubric.findById(newRubricId);
        if (!newSelectedRubric) {
          return res.status(404).json({ message: "New Rubric not found" });
        }

        // Find/Update the AssessmentRubric link
        assessmentRubricRecord = await AssessmentRubric.findOneAndUpdate(
          { assessment_id: id },
          { rubric_id: newRubricId, is_active: true },
          { new: true, upsert: true } // Create if it doesn't exist
        );

        // Add assessment link to the new rubric
        await Rubric.findByIdAndUpdate(newRubricId, {
          $addToSet: { assessments: assessmentRubricRecord._id }, // Use $addToSet to avoid duplicates
        });

        // Remove assessment link from the old rubric (if it existed)
        if (oldRubricId) {
          await Rubric.findByIdAndUpdate(oldRubricId, {
            $pull: { assessments: assessmentRubricRecord._id },
          });
        }
        assessment.rubric_id = newRubricId; // Update assessment's direct reference
      } else if (!newRubricId && oldRubricId) {
        // Handle case where rubric is being removed (set to null)
        assessmentRubricRecord = await AssessmentRubric.findOne({
          assessment_id: id,
        });
        if (assessmentRubricRecord) {
          await Rubric.findByIdAndUpdate(oldRubricId, {
            $pull: { assessments: assessmentRubricRecord._id },
          });
          await AssessmentRubric.deleteOne({ _id: assessmentRubricRecord._id });
        }
        assessment.rubric_id = null;
      }
      // --- End Rubric Update Handling ---

      // Update other assessment details
      assessment.assessment_name =
        assessment_name || assessment.assessment_name;
      assessment.assessment_description =
        assessment_description || assessment.assessment_description;
      assessment.assignment_type =
        assignment_type || assessment.assignment_type;
      if (teamgrading_type !== undefined)
        assessment.teamgrading_type = teamgrading_type;
      assessment.publish_date = publish_date || assessment.publish_date;
      assessment.due_date = due_date || assessment.due_date;
      // assessment.rubric_id is handled above

      // --- Grader Update Handling ---
      const gradingGroup = await Group.findOne({
        assessment_id: id,
        group_type: "grading",
      });
      if (!gradingGroup) {
        // This shouldn't happen if created correctly, but handle defensively
        console.error(`Grading group not found for assessment ${id}`);
        // Potentially create it here if needed, or return error
      } else {
        // Update group name if assessment name changed
        if (assessment_name) {
          gradingGroup.group_name = `${assessment_name} Grading Group`;
          await gradingGroup.save();
        }

        // Only update graders if the 'graders' array is provided in the request
        if (graders !== undefined) {
          // Validate new grader weights if provided
          if (Array.isArray(graders) && graders.length > 0) {
            const totalWeight = graders.reduce(
              (sum, grader) => sum + grader.weight,
              0
            );
            if (graders.some((g) => g.weight < 0 || g.weight > 1)) {
              return res.status(400).json({
                message: "Weight of each grader must be between 0 and 1",
              });
            }
            if (totalWeight > 1 && Math.abs(totalWeight - 1) > 0.0001) {
              return res
                .status(400)
                .json({ message: "Total weight of graders must not exceed 1" });
            }

            // Remove existing professor/ta graders
            await GroupMember.deleteMany({
              group_id: gradingGroup._id,
              role: { $in: ["professor", "ta"] },
            });

            // Add new graders
            for (const grader of graders) {
              if (
                !grader.user_id ||
                !grader.role ||
                grader.weight === undefined
              ) {
                console.warn("Skipping invalid grader data:", grader);
                continue;
              }
              const graderUser = await User.findById(grader.user_id);
              if (
                !graderUser ||
                !["professor", "ta"].includes(graderUser.role.toLowerCase())
              ) {
                console.warn(
                  `Grader user not found or invalid role for update: ${grader.user_id}`
                );
                continue;
              }
              const newGroupMember = new GroupMember({
                group_id: gradingGroup._id,
                assessment_id: assessment._id,
                user_id: new mongoose.Types.ObjectId(grader.user_id),
                role: grader.role.toLowerCase(), // Standardize role
                weight: grader.weight,
              });
              await newGroupMember.save();
            }
          } else if (Array.isArray(graders) && graders.length === 0) {
            // If an empty array is passed, remove all professor/ta graders
            await GroupMember.deleteMany({
              group_id: gradingGroup._id,
              role: { $in: ["professor", "ta"] },
            });
            // Consider adding the assessment creator back as default? Or leave it empty?
            // Leaving empty for now, assuming explicit control.
          }
        } // else: graders array not provided, so don't change existing graders
      }
      // --- End Grader Update Handling ---

      await assessment.save();

      // Fetch the updated assessment with populated fields to return
      const updatedAssessment = await Assessment.findById(id)
        .populate("rubric_id", "rubric_name description score")
        .lean();
      const updatedGraders = await GroupMember.find({
        assessment_id: id,
        role: { $in: ["professor", "ta"] },
      })
        .populate("user_id", "first_name last_name role email")
        .select("user_id weight")
        .lean();

      res.status(200).json({
        message: "Assessment updated successfully!",
        assessment: { ...updatedAssessment, graders: updatedGraders },
      });
    } catch (error) {
      console.error("Error updating assessment:", error);
      res
        .status(500)
        .json({ message: "Error updating assessment", error: error.message });
    }
  }
);

// Delete an assessment
router.delete(
  "/delete/:id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { id } = req.params;

    try {
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      await Group.deleteMany({ assessment_id: id });
      await GroupMember.deleteMany({
        assessment_id: id,
        role: { $in: ["professor", "TA"] },
      }); // Include both professor and TA
      await AssessmentRubric.deleteMany({ assessment_id: id });

      await assessment.deleteOne();
      res.status(200).json({ message: "Assessment deleted successfully!" });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Error deleting assessment", error });
    }
  }
);

// Get all student scores with optional filters via URL parameters
router.get(
  "/student_score/:section_id/:assessment_id",
  verifyToken,
  async (req, res) => {
    try {
      const { section_id, assessment_id } = req.params; // Extract parameters from URL

      // Build the filter object dynamically
      const filter = { section_id };
      if (assessment_id) {
        filter.assessment_id = assessment_id;
      }

      const scores = await StudentScore.find(filter)
        .populate("student_id", "personal_num first_name last_name email") // Populate student details
        .populate("assessment_id", "assessment_name") // Populate assessment details
        .select("student_id group_id section_id submission_id score") // Select relevant fields
        .lean();

      res.status(200).json(scores);
    } catch (error) {
      console.error("Error fetching student scores:", error);
      res.status(500).json({
        message: "Error fetching student scores",
        error: error.message,
      });
    }
  }
);

module.exports = router;
