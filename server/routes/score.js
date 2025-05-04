const express = require("express");
const mongoose = require("mongoose");
const RawScore = require("../models/RawScore");
const FinalScore = require("../models/FinalScore");
const GroupMember = require("../models/GroupMember");
const Rubric = require("../models/Rubric");
const Submission = require("../models/Submission");
const StudentScore = require("../models/StudentScore");
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

    let responseSent = false; // Flag เพื่อตรวจสอบว่า Response ถูกส่งไปแล้วหรือยัง

    try {
      // 1. Find the assessment
      const assessment = await mongoose
        .model("Assessment")
        .findById(assessment_id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Case 1: Individual assignment graded by a single professor
      if (assessment.assignment_type === "individual" && !assessment.teamgrading_type) {
        // 2. Find the rubric
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        // 3. Validate criteria
        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        // 4. Calculate total score
        const totalRawScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        // 5. Save or update RawScore
        let rawScore = await RawScore.findOne({
          professor_id: req.user.id,
          submission_id,
        });

        if (rawScore) {
          rawScore.score = scores;
          rawScore.total_score = totalRawScore;
          rawScore.rubric_id = rubricId;
          await rawScore.save();
        } else {
          rawScore = new RawScore({
            professor_id: req.user.id,
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
          });
          await rawScore.save();
        }

        // 6. Save or update FinalScore
        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.score = scores;
          finalScore.total_score = totalRawScore;
          finalScore.status = "graded";
          await finalScore.save();
        } else {
          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
            status: "graded",
          });
          await finalScore.save();
        }

        // 7. Save or update StudentScore
        let studentScore = await StudentScore.findOne({ submission_id });

        if (studentScore) {
          studentScore.score = totalRawScore;
          await studentScore.save();
        } else {
          studentScore = new StudentScore({
            student_id: req.body.student_id,
            assessment_id,
            submission_id,
            group_id: req.body.group_id,
            score: totalRawScore,
          });
          await studentScore.save();
        }

        // 8. Update grading status in Submission
        const submission = await Submission.findById(submission_id);
        if (submission) {
          // Update the grading_status_by for the current professor
          submission.grading_status_by = submission.grading_status_by.map((grader) => {
            if (grader.grader_id.toString() === req.user.id) {
              return { ...grader, status: "already" };
            }
            return grader;
          });

          // Check if all graders have completed grading
          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          // Update the overall grading_status if all graders are done
          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
          console.log("Submission grading status updated successfully!");
        }

        if (!responseSent) {
          responseSent = true; // ตั้งค่า Flag ว่า Response ถูกส่งแล้ว
          return res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
            studentScore,
          });
        }
      }

      // Case 2: Individual assignment graded by multiple professors
      if (assessment.assignment_type !== "individual" || assessment.teamgrading_type) {
        // 2. Find the rubric
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id; // Store rubric_id for later use

        // 3. Validate criteria
        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        console.log("Criteria IDs from Rubric:", criteriaIds);

        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        // 4. Calculate total score
        const totalRawScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        // 5. Save or update RawScore
        let rawScore = await RawScore.findOne({
          professor_id: req.user.id,
          submission_id,
        });

        if (rawScore) {
          // Update existing RawScore
          rawScore.score = scores;
          rawScore.total_score = totalRawScore;
          rawScore.rubric_id = rubricId;
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
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
          });
          await rawScore.save();
          console.log("RawScore created successfully!");
        }

        // 6. Fetch all RawScores for this submission
        const rawScores = await RawScore.find({ submission_id });

        // 7. Fetch GroupMember to calculate weight
        const groupMembersForWeight = await GroupMember.find({ assessment_id }); // เปลี่ยนชื่อจาก groupMembers

        if (!groupMembersForWeight || groupMembersForWeight.length === 0) {
          console.error("No GroupMember data found for the given group_id and assessment_id.");
        }

        // Filter roles to include only professor or ta
        const weightMap = groupMembersForWeight.reduce((map, member) => {
          if (["professor", "ta"].includes(member.role)) {
            map[member.user_id.toString()] = member.weight || 1; // ใช้ค่าเริ่มต้นเป็น 1 หาก weight ไม่ถูกกำหนด
          }
          return map;
        }, {});

        // ตรวจสอบว่า Weight Map ว่างเปล่าหรือไม่
        if (Object.keys(weightMap).length === 0) {
          console.warn("Weight Map is empty. Defaulting all weights to 1.");
          groupMembersForWeight.forEach((member) => {
            if (["professor", "ta"].includes(member.role)) {
              weightMap[member.user_id.toString()] = 1; // ตั้งค่า weight เป็น 1
            }
          });
        }

        console.log("Weight Map:", weightMap);

        // 8. Aggregate scores from RawScore using weight
        const criteriaScores = {};
        let totalScore = 0; // Final aggregated score
        console.log("Starting aggregation of RawScores...");
        rawScores.forEach((rawScore) => {
          console.log(`Processing RawScore for professor_id: ${rawScore.professor_id}`);
          const scoreObject = Object.fromEntries(rawScore.score);
          const weight = weightMap[rawScore.professor_id.toString()] || 1; // Default weight is 1
          console.log(`Weight for professor_id ${rawScore.professor_id}: ${weight}`);

          Object.entries(scoreObject).forEach(([criteriaId, score]) => {
            const weightedScore = score * weight; // Apply weight to the score
            console.log(`Adding weighted score for criteriaId: ${criteriaId}, score: ${score}, weighted score: ${weightedScore}`);
            if (!criteriaScores[criteriaId]) {
              criteriaScores[criteriaId] = [];
            }
            criteriaScores[criteriaId].push(weightedScore);
          });
        });

        console.log("Aggregated Criteria Scores before calculating total:", criteriaScores);

        // Calculate total score per criteria
        const finalScores = {}; // Declare finalScores here
        for (const [criteriaId, scores] of Object.entries(criteriaScores)) {
          const totalCriteriaScore = scores.reduce((sum, score) => sum + score, 0);
          console.log(`Total score for criteriaId: ${criteriaId}, scores: ${scores}, totalCriteriaScore: ${totalCriteriaScore}`);
          finalScores[criteriaId] = totalCriteriaScore; // Assign to finalScores
          totalScore += totalCriteriaScore;
        }

        console.log("Final Scores after aggregation:", finalScores);
        console.log("Final aggregated totalScore after calculation:", totalScore);

        // Check if totalScore is a valid number
        if (isNaN(totalScore)) {
          throw new Error("Total Score is NaN. Please check the calculation logic.");
        }

        // 9. Save or update FinalScore
        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          // Update existing FinalScore
          finalScore.score = finalScores; // Use finalScores here
          finalScore.total_score = totalScore;
          finalScore.status = "graded";
          await finalScore.save();
          console.log("FinalScore updated successfully!");
        } else {
          // Create new FinalScore
          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: finalScores, // Use finalScores here
            total_score: totalScore,
            status: "graded",
          });
          await finalScore.save();
          console.log("FinalScore created successfully!");
        }

        // 10. Save or update StudentScore
        let studentScore = await StudentScore.findOne({ submission_id });

        if (studentScore) {
          // Update existing StudentScore
          studentScore.score = totalScore;
          await studentScore.save();
          console.log("StudentScore updated successfully!");
        } else {
          // Create new StudentScore
          studentScore = new StudentScore({
            student_id: req.body.student_id,
            assessment_id,
            submission_id,
            group_id: req.body.group_id,
            score: totalScore,
          });
          await studentScore.save();
          console.log("StudentScore created successfully!");
        }

        // 11. Update grading status in Submission
        const submission = await Submission.findById(submission_id);
        if (submission) {
          // Update the grading_status_by for the current professor
          submission.grading_status_by = submission.grading_status_by.map((grader) => {
            if (grader.grader_id.toString() === req.user.id) {
              return { ...grader, status: "already" };
            }
            return grader;
          });

          // Check if all graders have completed grading
          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          // Update the overall grading_status if all graders are done
          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
          console.log("Submission grading status updated successfully!");
        }

        if (!responseSent) {
          responseSent = true; // ตั้งค่า Flag ว่า Response ถูกส่งแล้ว
          res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
            studentScore,
          });
        }
      }

      // Case 3: Group assignment graded by a single professor
      if (assessment.assignment_type === "group" && !assessment.teamgrading_type) {
        // 2. Find the rubric
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        // 3. Validate criteria
        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        // 4. Calculate total score
        const totalRawScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        // 5. Save or update RawScore
        let rawScore = await RawScore.findOne({
          professor_id: req.user.id,
          submission_id,
        });

        if (rawScore) {
          rawScore.score = scores;
          rawScore.total_score = totalRawScore;
          rawScore.rubric_id = rubricId;
          await rawScore.save();
        } else {
          rawScore = new RawScore({
            professor_id: req.user.id,
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
          });
          await rawScore.save();
        }

        // 6. Save or update FinalScore
        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.score = scores;
          finalScore.total_score = totalRawScore;
          finalScore.status = "graded";
          await finalScore.save();
        } else {
          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
            status: "graded",
          });
          await finalScore.save();
        }

        // 7. Distribute FinalScore to group members
        const groupMembersForDistribution = await GroupMember.find({ group_id: req.body.group_id }); // เปลี่ยนชื่อจาก groupMembers
        console.log("Group Members:", groupMembersForDistribution);

        for (const member of groupMembersForDistribution) {
          if (!member.user_id) {
            console.error(`Missing user_id for group member: ${member}`);
            continue; // Skip if user_id is missing
          }

          try {
            let studentScore = await StudentScore.findOne({
              student_id: member.user_id, // Use user_id as student_id
              submission_id,
            });

            if (studentScore) {
              studentScore.score = totalRawScore;
              await studentScore.save();
              console.log(`StudentScore updated for student_id: ${member.user_id}`, {
                student_id: member.user_id,
                score: studentScore.score,
                submission_id: studentScore.submission_id,
              });
            } else {
              studentScore = new StudentScore({
                student_id: member.user_id, // Use user_id as student_id
                assessment_id,
                submission_id,
                group_id: req.body.group_id,
                score: totalRawScore,
              });
              await studentScore.save();
              console.log(`StudentScore created for student_id: ${member.user_id}`, {
                student_id: member.user_id,
                score: studentScore.score,
                submission_id: studentScore.submission_id,
              });
            }
          } catch (error) {
            console.error(`Error processing user_id: ${member.user_id}`, error);
            // Handle error แต่ไม่ส่ง Response ซ้ำ
          }
        }

        // 8. Update grading status in Submission
        const submission = await Submission.findById(submission_id);
        if (submission) {
          // Update the grading_status_by for the current professor
          submission.grading_status_by = submission.grading_status_by.map((grader) => {
            if (grader.grader_id.toString() === req.user.id) {
              return { ...grader, status: "already" };
            }
            return grader;
          });

          // Check if all graders have completed grading
          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          // Update the overall grading_status if all graders are done
          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
          console.log("Submission grading status updated successfully!");
        }

        if (!responseSent) {
          responseSent = true; // ตั้งค่า Flag ว่า Response ถูกส่งแล้ว
          return res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
          });
        }
      }

      // Case 4: Group assignment graded by multiple professors
      if (assessment.assignment_type === "group" && assessment.teamgrading_type) {
        // 2. Find the rubric
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        // 3. Validate criteria
        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        // 4. Calculate total score
        const totalRawScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        // 5. Save or update RawScore
        let rawScore = await RawScore.findOne({
          professor_id: req.user.id,
          submission_id,
        });

        if (rawScore) {
          rawScore.score = scores;
          rawScore.total_score = totalRawScore;
          rawScore.rubric_id = rubricId;
          await rawScore.save();
        } else {
          rawScore = new RawScore({
            professor_id: req.user.id,
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
          });
          await rawScore.save();
        }

        // 6. Fetch all RawScores for this submission
        const rawScores = await RawScore.find({ submission_id });

        // 7. Fetch GroupMember to calculate weight
        const groupMembersForWeight = await GroupMember.find({ assessment_id }); // เปลี่ยนชื่อจาก groupMembers

        if (!groupMembersForWeight || groupMembersForWeight.length === 0) {
          console.error("No GroupMember data found for the given group_id and assessment_id.");
        }

        // Filter roles to include only professor or ta
        const weightMap = groupMembersForWeight.reduce((map, member) => {
          if (["professor", "ta"].includes(member.role)) {
            map[member.user_id.toString()] = member.weight || 1; // Default weight is 1
          }
          return map;
        }, {});

        console.log("Weight Map:", weightMap);

        // 8. Aggregate scores from RawScore using weight
        const criteriaScores = {};
        let totalScore = 0; // Final aggregated score
        console.log("Starting aggregation of RawScores...");
        rawScores.forEach((rawScore) => {
          console.log(`Processing RawScore for professor_id: ${rawScore.professor_id}`);
          const scoreObject = Object.fromEntries(rawScore.score);
          const weight = weightMap[rawScore.professor_id.toString()] || 1; // Default weight is 1
          console.log(`Weight for professor_id ${rawScore.professor_id}: ${weight}`);

          Object.entries(scoreObject).forEach(([criteriaId, score]) => {
            const weightedScore = score * weight; // Apply weight to the score
            console.log(`Adding weighted score for criteriaId: ${criteriaId}, score: ${score}, weighted score: ${weightedScore}`);
            if (!criteriaScores[criteriaId]) {
              criteriaScores[criteriaId] = [];
            }
            criteriaScores[criteriaId].push(weightedScore);
          });
        });

        console.log("Aggregated Criteria Scores before calculating total:", criteriaScores);

        // Calculate total score per criteria
        const finalScores = {}; // Declare finalScores here
        for (const [criteriaId, scores] of Object.entries(criteriaScores)) {
          const totalCriteriaScore = scores.reduce((sum, score) => sum + score, 0);
          console.log(`Total score for criteriaId: ${criteriaId}, scores: ${scores}, totalCriteriaScore: ${totalCriteriaScore}`);
          finalScores[criteriaId] = totalCriteriaScore; // Assign to finalScores
          totalScore += totalCriteriaScore;
        }

        console.log("Final Scores after aggregation:", finalScores);
        console.log("Final aggregated totalScore after calculation:", totalScore);

        // Ensure totalScore is consistent
        if (totalScore !== 37) {
          console.error(`Mismatch in totalScore calculation. Expected: 37, Got: ${totalScore}`);
        }

        // 9. Distribute FinalScore to group members
        const groupMembersForDistribution = await GroupMember.find({ group_id: req.body.group_id }); // เปลี่ยนชื่อจาก groupMembers
        console.log("Group Members fetched for score distribution:", groupMembersForDistribution);

        if (!groupMembersForDistribution || groupMembersForDistribution.length === 0) {
          console.error("No GroupMember data found for the given group_id.");
        }

        for (const member of groupMembersForDistribution) {
          if (!member.user_id) {
            console.error(`Missing user_id for group member: ${member}`);
            continue; // Skip if user_id is missing
          }

          try {
            console.log(`Distributing score to student_id: ${member.user_id}`);
            let studentScore = await StudentScore.findOne({
              student_id: member.user_id,
              submission_id,
            });

            if (studentScore) {
              console.log(`Existing StudentScore found for student_id: ${member.user_id}, current score: ${studentScore.score}`);
              studentScore.score = totalScore; // Assign FinalScore's totalScore
              await studentScore.save();
              console.log(`StudentScore updated for student_id: ${member.user_id}`, {
                student_id: member.user_id,
                score: studentScore.score,
                submission_id: studentScore.submission_id,
              });
            } else {
              console.log(`No existing StudentScore found for student_id: ${member.user_id}. Creating new StudentScore.`);
              studentScore = new StudentScore({
                student_id: member.user_id,
                assessment_id,
                submission_id,
                group_id: req.body.group_id,
                score: totalScore, // Assign FinalScore's totalScore
              });
              await studentScore.save();
              console.log(`StudentScore created for student_id: ${member.user_id}`, {
                student_id: member.user_id,
                score: studentScore.score,
                submission_id: studentScore.submission_id,
              });
            }
          } catch (error) {
            console.error(`Error processing user_id: ${member.user_id}`, error);
          }
        }

        // 10. Save or update FinalScore
        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.total_score = totalScore;
          finalScore.status = "graded";
          await finalScore.save();
        } else {
          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: criteriaScores,
            total_score: totalScore,
            status: "graded",
          });
          await finalScore.save();
        }

        // 11. Update grading status in Submission
        const submission = await Submission.findById(submission_id);
        if (submission) {
          // Update the grading_status_by for the current professor
          submission.grading_status_by = submission.grading_status_by.map((grader) => {
            if (grader.grader_id.toString() === req.user.id) {
              return { ...grader, status: "already" };
            }
            return grader;
          });

          // Check if all graders have completed grading
          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          // Update the overall grading_status if all graders are done
          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
          console.log("Submission grading status updated successfully!");
        }

        if (!responseSent) {
          responseSent = true; // Set flag to indicate response has been sent
          return res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting scores:", error);
      if (!responseSent) {
        responseSent = true; // ตั้งค่า Flag ว่า Response ถูกส่งแล้ว
        return res.status(500).json({
          message: "Error submitting scores",
          error,
        });
      }
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
