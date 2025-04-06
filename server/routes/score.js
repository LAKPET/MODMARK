// routes/score.js

const express = require("express");
const mongoose = require("mongoose");
const RawScore = require("../models/RawScore");
const FinalScore = require("../models/FinalScore");
const GroupMember = require("../models/GroupMember");
const Rubric = require("../models/Rubric");
const { verifyToken, checkAdminOrProfessorOrTeacherAssistant } = require("./middleware");

const router = express.Router();

router.post(
  "/assessment/submit",
  verifyToken,
  checkAdminOrProfessorOrTeacherAssistant,
  async (req, res) => {
    const { assessment_id, submission_id, scores } = req.body;

    try {
      // 1. หา assessment
      const assessment = await mongoose.model("Assessment").findById(assessment_id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // 2. หา rubric
      const rubric = await Rubric.findById(assessment.rubric_id);
      if (!rubric) {
        return res.status(404).json({ message: "Rubric not found for this assessment" });
      }

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

      // 4. Save or Update raw score
      let rawScore = await RawScore.findOne({
        professor_id: req.user.id,
        submission_id,
      });

      if (rawScore) {
        // Update existing RawScore
        rawScore.score = scores; // อัปเดตคะแนนใหม่
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
          score: scores,
        });
        await rawScore.save();
        console.log("RawScore created successfully!");
      }

      // 5. ดึง raw score ทั้งหมดของ submission นี้
      const rawScores = await RawScore.find({ submission_id }).populate("professor_id");

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
        console.error("No weights found for professors or TAs in this assessment.");
        return res.status(400).json({ message: "No weights found for professors or TAs in this assessment." });
      }

      // 7. รวมคะแนนตาม criteria
      const criteriaScores = {};
      rawScores.forEach((rawScore) => {
        const weight = weightMap[rawScore.professor_id.toString()] || 1;

        // แปลง rawScore.score จาก Map เป็น Object
        const scoreObject = Object.fromEntries(rawScore.score);

        // ตรวจสอบ rawScore.score
        console.log("RawScore Score (as Object):", scoreObject);

        // กรองเฉพาะ criteria ID ที่ตรงกับ rubric
        const validScores = Object.entries(scoreObject || {}).filter(([criteriaId]) =>
          criteriaIds.includes(criteriaId)
        );

        // ตรวจสอบ validScores
        console.log("Valid Scores for RawScore:", validScores);

        validScores.forEach(([criteriaId, score]) => {
          if (!criteriaScores[criteriaId]) {
            criteriaScores[criteriaId] = [];
          }
          criteriaScores[criteriaId].push(score * weight); // คูณ weight ก่อนรวมคะแนน
        });
      });

      // ตรวจสอบค่า criteriaScores
      console.log("Criteria Scores:", criteriaScores);

      // 8. คำนวณ final score ต่อ criteria
      const finalScores = {};
      for (const [criteriaId, scores] of Object.entries(criteriaScores)) {
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        if (isNaN(totalScore)) {
          console.error(`Invalid totalScore for criteria "${criteriaId}":`, scores);
          continue; // ข้าม criteria ที่มีค่าผิดพลาด
        }
        finalScores[criteriaId] = Number(totalScore); // แปลงค่าให้เป็นตัวเลข
      }

      // 🔐 แปลง finalScores ให้เป็น Object ที่ปลอดภัย
      console.log("Final Scores (Before Save):", finalScores);
      const safeFinalScores = Object.fromEntries(
        Object.entries(finalScores).map(([key, value]) => [key, value])
      );

      // 9. Update หรือ Save final score
      let finalScore; // กำหนดตัวแปร finalScore ไว้ภายนอก if-else block
      const existingFinalScore = await FinalScore.findOne({ submission_id });
      if (existingFinalScore) {
        // Update FinalScore
        existingFinalScore.score = safeFinalScores;
        await existingFinalScore.save();
        console.log("FinalScore updated successfully!");
        finalScore = existingFinalScore; // อัปเดตตัวแปร finalScore
      } else {
        // Create new FinalScore
        finalScore = new FinalScore({
          student_id: req.body.student_id,
          group_id: req.body.group_id,
          assessment_id,
          submission_id,
          score: safeFinalScores, // ใช้ Object ที่ถูกต้อง
        });
        await finalScore.save();
        console.log("FinalScore created successfully!");
      }

      res.status(201).json({
        message: "Raw scores submitted and final scores calculated successfully",
        rawScore,
        finalScore, // ใช้ตัวแปร finalScore ที่กำหนดไว้
      });
    } catch (error) {
      console.error("Error submitting raw scores or calculating final scores:", error);
      res.status(500).json({ message: "Error submitting raw scores or calculating final scores", error });
    }
  }
);

module.exports = router;
