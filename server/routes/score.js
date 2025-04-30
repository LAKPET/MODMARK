const express = require("express");
const mongoose = require("mongoose");
const RawScore = require("../models/RawScore");
const FinalScore = require("../models/FinalScore");
const GroupMember = require("../models/GroupMember");
const Rubric = require("../models/Rubric");
const Submission = require("../models/Submission"); // Add this import
const StudentScore = require("../models/StudentScore"); // Add this import
const {
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
} = require("./middleware");

const router = express.Router();

router.post(
  "/assessment/submit",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { assessment_id, submission_id, scores } = req.body;

    try {
      // 1. หา assessment
      const assessment = await mongoose
        .model("Assessment")
        .findById(assessment_id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Check if the professor is a GroupMember of the grading group
      const groupMember = await GroupMember.findOne({
        assessment_id,
        user_id: req.user.id,
        role: { $in: ["professor", "ta"] },
      });

      if (!groupMember || groupMember.weight <= 0) {
        return res.status(403).json({
          message: "You do not have permission to grade this assessment.",
        });
      }

      // 2. หา rubric
      const rubric = await Rubric.findById(assessment.rubric_id);
      if (!rubric) {
        return res
          .status(404)
          .json({ message: "Rubric not found for this assessment" });
      }

      const rubricId = rubric._id; // Store rubric_id for later use

      // 3. ตรวจสอบว่า criteria ถูกต้อง
      const criteriaIds = rubric.criteria.map((c) => c._id.toString()); // ดึง ObjectId ของ criteria
      console.log("Criteria IDs from Rubric:", criteriaIds);

      for (const criteriaId in scores) {
        if (!criteriaIds.includes(criteriaId)) {
          return res.status(400).json({
            message: `Invalid criteria ID: ${criteriaId}`,
            validCriteria: criteriaIds,
          });
        }
      }

      // Calculate total score for raw score
      const totalRawScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

      // 4. Save or Update raw score
      let rawScore = await RawScore.findOne({
        professor_id: req.user.id,
        submission_id,
      });

      if (rawScore) {
        // Update existing RawScore
        rawScore.score = scores; // อัปเดตคะแนนใหม่
        rawScore.rubric_id = rubricId; // Add rubric_id
        rawScore.total_score = totalRawScore; // Add total score
        await rawScore.save();
        console.log("RawScore updated successfully!");
      } else {
        // Create new RawScore
        rawScore = new RawScore({
          professor_id: req.user.id,
          student_id: req.body.student_id,
          group_id: req.body.group_id,
          assessment_id,
          submission_id,
          rubric_id: rubricId, // Add rubric_id
          score: scores,
          total_score: totalRawScore, // Add total score
        });
        await rawScore.save();
        console.log("RawScore created successfully!");
      }

      // 5. ดึง raw score ทั้งหมดของ submission นี้
      const rawScores = await RawScore.find({ submission_id }).populate(
        "professor_id"
      );

      // 6. ดึง group member เพื่อนำมาคำนวณ weight
      const groupMembers = await GroupMember.find({ assessment_id });

      // กรองเฉพาะ role ที่เป็น professor หรือ ta
      const filteredGroupMembers = groupMembers.filter(
        (member) => member.role === "professor" || member.role === "ta"
      );

      const weightMap = filteredGroupMembers.reduce((map, member) => {
        map[member.user_id.toString()] = member.weight;
        return map;
      }, {});

      // ตรวจสอบค่า weightMap
      console.log("Filtered Weight Map:", weightMap);

      // หาก weightMap ว่างเปล่า ให้แจ้งเตือน
      if (Object.keys(weightMap).length === 0) {
        console.error(
          "No weights found for professors or TAs in this assessment."
        );
        return res
          .status(400)
          .json({
            message:
              "No weights found for professors or TAs in this assessment.",
          });
      }

      // 7. รวมคะแนนตาม criteria
      const criteriaScores = {};
      rawScores.forEach((rawScore) => {
        const professorId =
          rawScore.professor_id?._id?.toString?.() ||
          rawScore.professor_id?.toString?.();
        const weight = weightMap[professorId] || 1;

        console.log("Using professorId:", professorId, "-> weight:", weight);

        // แปลง rawScore.score จาก Map เป็น Object
        const scoreObject = Object.fromEntries(rawScore.score);

        // ตรวจสอบ rawScore.score
        console.log("RawScore Score (as Object):", scoreObject);

        // กรองเฉพาะ criteria ID ที่ตรงกับ rubric
        const validScores = Object.entries(scoreObject || {}).filter(
          ([criteriaId]) => criteriaIds.includes(criteriaId)
        );

        // ตรวจสอบ validScores
        console.log("Valid Scores for RawScore:", validScores);

        validScores.forEach(([criteriaId, score]) => {
          if (!criteriaScores[criteriaId]) {
            criteriaScores[criteriaId] = [];
          }
          console.log(weight);
          criteriaScores[criteriaId].push(score * weight); // คูณ weight ก่อนรวมคะแนน
        });
      });

      // ตรวจสอบค่า criteriaScores
      console.log("Criteria Scores:", criteriaScores);

      // 8. คำนวณ final score ต่อ criteria และรวมคะแนนทั้งหมด
      const finalScores = {};
      let totalScore = 0; // Initialize total score
      for (const [criteriaId, scores] of Object.entries(criteriaScores)) {
        const totalCriteriaScore = scores.reduce((sum, score) => sum + score, 0);
        if (isNaN(totalCriteriaScore)) {
          console.error(
            `Invalid totalScore for criteria "${criteriaId}":`,
            scores
          );
          continue; // ข้าม criteria ที่มีค่าผิดพลาด
        }
        finalScores[criteriaId] = Number(totalCriteriaScore); // แปลงค่าให้เป็นตัวเลข
        totalScore += totalCriteriaScore; // Add to total score
      }

      // 🔐 แปลง finalScores ให้เป็น Object ที่ปลอดภัย
      console.log("Final Scores (Before Save):", finalScores);
      console.log("Total Score:", totalScore); // Log total score
      const safeFinalScores = Object.fromEntries(
        Object.entries(finalScores).map(([key, value]) => [key, value])
      );

      // Logic for storing scores based on assignment type
      let finalScore;
        // Individual assessment: Save score directly in FinalScore
        finalScore = new FinalScore({
          student_id: req.body.student_id,
          group_id: req.body.group_id,
          assessment_id,
          submission_id,
          rubric_id: rubricId,
          score: safeFinalScores,
          total_score: totalScore,
          status: "graded",
        });
        await finalScore.save();

      // 10. Update grading_status_by for the professor in the Submission model
      const submission = await Submission.findById(submission_id);
      if (submission) {
        const professorEntry = submission.grading_status_by.find(
          (entry) => entry.professor_id.toString() === req.user.id
        );
        if (professorEntry) {
          professorEntry.status = "already"; // Update status to "already"
        }

        // Check if all professors have completed grading
        const allGraded = submission.grading_status_by.every(
          (entry) => entry.status === "already"
        );

        if (allGraded) {
          submission.grading_status = "already"; // Update submission status to "already"
        } else {
          submission.grading_status = "pending"; // Keep it as pending
        }

        await submission.save();
        console.log(
          "Grading status updated successfully for submission:",
          submission_id
        );
      } else {
        console.warn("Submission not found:", submission_id);
      }

      // 11. Update grading status in FinalScore
      if (finalScore) {
        const allGraded = submission.grading_status_by.every(
          (entry) => entry.status === "already"
        );

        finalScore.status = allGraded ? "graded" : "pending"; // Update status
        await finalScore.save();
        console.log("FinalScore status updated successfully!");

        // If FinalScore is graded, distribute scores to StudentScore
        if (finalScore.status === "graded" && assessment.assignment_type === "group") {
          const groupMembers = await GroupMember.find({ group_id: req.body.group_id });
          const totalWeight = groupMembers.reduce((sum, member) => sum + member.weight, 0);

          for (const member of groupMembers) {
            const individualScore = (finalScore.total_score * member.weight) / totalWeight;
            const studentScore = new StudentScore({
              student_id: member.user_id,
              assessment_id,
              group_id: req.body.group_id,
              score: individualScore,
            });
            await studentScore.save();
          }
          console.log("Scores distributed to StudentScore successfully!");
        }
      } else {
        console.warn("FinalScore not found for submission:", submission_id);
      }

      res.status(201).json({
        message:
          "Raw scores submitted and final scores calculated successfully",
        rawScore,
        finalScore,
      });
    } catch (error) {
      console.error(
        "Error submitting raw scores or calculating final scores:",
        error
      );
      res
        .status(500)
        .json({
          message: "Error submitting raw scores or calculating final scores",
          error,
        });
    }
  }
);

router.post(
  "/assessment/finalscore",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { assessment_id, submission_id } = req.body;

    try {
      // Find the final score based on assessment_id and submission_id
      const finalScore = await FinalScore.findOne({
        assessment_id,
        submission_id,
      });

      if (!finalScore) {
        return res.status(404).json({ message: "FinalScore not found" });
      }

      res.status(200).json({ finalScore });
    } catch (error) {
      console.error("Error retrieving final score:", error);
      res.status(500).json({ message: "Error retrieving final score", error });
    }
  }
);

// Get raw score for a specific submission and professor
router.get(
  "/assessment/rawscore/:submission_id",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { submission_id } = req.params;

    try {
      // Find the raw score for the professor and submission
      const rawScore = await RawScore.findOne({
        submission_id,
        professor_id: req.user.id,
      }).populate("rubric_id", "rubric_name description criteria");

      if (!rawScore) {
        return res.status(404).json({ message: "RawScore not found for this submission and professor" });
      }

      res.status(200).json({
        message: "RawScore fetched successfully",
        rawScore,
      });
    } catch (error) {
      console.error("Error fetching raw score:", error);
      res.status(500).json({ message: "Error fetching raw score", error });
    }
  }
);

module.exports = router;
