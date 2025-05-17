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

    let responseSent = false;

    try {
      const assessment = await mongoose
        .model("Assessment")
        .findById(assessment_id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      if (
        assessment.assignment_type === "individual" &&
        !assessment.teamgrading_type
      ) {
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        const totalRawScore = Object.values(scores).reduce(
          (sum, score) => sum + score,
          0
        );

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

        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.score = scores;
          finalScore.total_score = totalRawScore;

          const graderExists = finalScore.grading_status_by.some(
            (grader) => grader.grader_id.toString() === req.user.id
          );

          if (!graderExists) {
            finalScore.grading_status_by.push({
              grader_id: req.user.id,
              role: req.user.role,
              status: "already",
            });
          } else {
            finalScore.grading_status_by = finalScore.grading_status_by.map(
              (grader) => {
                if (grader.grader_id.toString() === req.user.id) {
                  return { ...grader, status: "already" };
                }
                return grader;
              }
            );
          }

          const allGraded = finalScore.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            finalScore.status = "graded";
          }

          await finalScore.save();
        } else {
          const gradingStatusBy = [
            {
              grader_id: req.user.id,
              role: req.user.role,
              status: "already",
            },
          ];

          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
            status: "graded",
            grading_status_by: gradingStatusBy,
          });

          await finalScore.save();
        }

        let studentScore = await StudentScore.findOne({ submission_id });

        if (studentScore) {
          studentScore.score = totalRawScore;
          studentScore.section_id = assessment.section_id;
          await studentScore.save();
        } else {
          studentScore = new StudentScore({
            student_id: req.body.student_id,
            assessment_id,
            submission_id,
            group_id: req.body.group_id,
            section_id: assessment.section_id,
            score: totalRawScore,
          });
          await studentScore.save();
        }

        const submission = await Submission.findById(submission_id);
        if (submission) {
          submission.grading_status_by = submission.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
        }

        if (!responseSent) {
          responseSent = true;
          return res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
            studentScore,
          });
        }
      }

      if (
        assessment.assignment_type === "individual" &&
        assessment.teamgrading_type
      ) {
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        const totalRawScore = Object.values(scores).reduce(
          (sum, score) => sum + score,
          0
        );

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

        const graders = await GroupMember.find({
          assessment_id,
          role: { $in: ["professor", "ta"] },
        });

        if (!graders || graders.length === 0) {
          return res.status(404).json({
            message: "No graders found for this assessment",
          });
        }

        const rawScores = await RawScore.find({ submission_id });

        const groupMembersForWeight = await GroupMember.find({ assessment_id });
        const weightMap = groupMembersForWeight.reduce((map, member) => {
          if (["professor", "ta"].includes(member.role)) {
            map[member.user_id.toString()] = member.weight || 1;
          }
          return map;
        }, {});

        const criteriaScores = {};
        let totalWeight = 0;
        let totalScore = 0;

        rawScores.forEach((rawScore) => {
          const weight = weightMap[rawScore.professor_id.toString()] || 1;
          totalWeight += weight;
        });

        rawScores.forEach((rawScore) => {
          let scoreObject;
          if (rawScore.score instanceof Map) {
            scoreObject = Object.fromEntries(rawScore.score);
          } else {
            scoreObject = rawScore.score;
          }
          const weight = weightMap[rawScore.professor_id.toString()] || 1;
          console.log(
            `[Weight Calculation] Professor ${rawScore.professor_id} weight: ${weight}, scores: ${JSON.stringify(scoreObject)}`
          );
          Object.entries(scoreObject).forEach(([criteriaId, score]) => {
            const weightedScore =
              totalWeight > 0 ? (score * weight) / totalWeight : score;
            console.log(
              `[Weighted Score] Professor ${rawScore.professor_id} criteria ${criteriaId}: raw=${score}, weighted=${weightedScore}`
            );
            if (!criteriaScores[criteriaId]) {
              criteriaScores[criteriaId] = [];
            }
            criteriaScores[criteriaId].push(weightedScore);
          });
        });

        const finalScores = {};
        totalScore = 0;
        for (const [criteriaId, scoresArr] of Object.entries(criteriaScores)) {
          const sum = scoresArr.reduce((a, b) => a + b, 0);
          finalScores[criteriaId] = sum;
          totalScore += sum;
          console.log(
            `[Final Criteria Score] criteriaId: ${criteriaId}, sum: ${sum}, all weighted: ${JSON.stringify(scoresArr)}`
          );
        }
        console.log(`[Final Total Score] totalScore: ${totalScore}`);

        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.score = finalScores;
          finalScore.total_score = totalScore;

          graders.forEach((grader) => {
            const graderExists = finalScore.grading_status_by.some(
              (g) => g.grader_id.toString() === grader.user_id.toString()
            );

            if (!graderExists) {
              finalScore.grading_status_by.push({
                grader_id: grader.user_id,
                role: grader.role,
                status: "pending",
              });
            }
          });

          finalScore.grading_status_by = finalScore.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = finalScore.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            finalScore.status = "graded";
          }

          await finalScore.save();
        } else {
          const gradingStatusBy = graders.map((grader) => ({
            grader_id: grader.user_id,
            role: grader.role,
            status:
              grader.user_id.toString() === req.user.id ? "already" : "pending",
          }));

          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: finalScores,
            total_score: totalScore,
            status: gradingStatusBy.every(
              (grader) => grader.status === "already"
            )
              ? "graded"
              : "pending",
            grading_status_by: gradingStatusBy,
          });

          await finalScore.save();
        }

        if (finalScore.status === "graded") {
          let studentScore = await StudentScore.findOne({ submission_id });

          if (studentScore) {
            studentScore.score = totalScore;
            studentScore.section_id = assessment.section_id;
            await studentScore.save();
          } else {
            studentScore = new StudentScore({
              student_id: req.body.student_id,
              assessment_id,
              submission_id,
              group_id: req.body.group_id,
              section_id: assessment.section_id,
              score: totalScore,
            });
            await studentScore.save();
          }
        }

        const submission = await Submission.findById(submission_id);
        if (submission) {
          submission.grading_status_by = submission.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
        }

        if (!responseSent) {
          responseSent = true;
          res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
          });
        }
      }

      if (
        assessment.assignment_type === "group" &&
        !assessment.teamgrading_type
      ) {
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        const totalRawScore = Object.values(scores).reduce(
          (sum, score) => sum + score,
          0
        );

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

        const graders = await GroupMember.find({
          assessment_id,
          role: { $in: ["professor", "ta"] },
        });

        if (!graders || graders.length === 0) {
          return res.status(404).json({
            message: "No graders found for this assessment",
          });
        }

        const groupMembersForWeight = await GroupMember.find({ assessment_id });
        const weightMap = groupMembersForWeight.reduce((map, member) => {
          if (["professor", "ta"].includes(member.role)) {
            map[member.user_id.toString()] = member.weight || 1;
          }
          return map;
        }, {});

        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.score = scores;
          finalScore.total_score = totalRawScore;

          graders.forEach((grader) => {
            const graderExists = finalScore.grading_status_by.some(
              (g) => g.grader_id.toString() === grader.user_id.toString()
            );

            if (!graderExists) {
              finalScore.grading_status_by.push({
                grader_id: grader.user_id,
                role: grader.role,
                status: "pending",
              });
            }
          });

          finalScore.grading_status_by = finalScore.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = finalScore.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            finalScore.status = "graded";
          }

          await finalScore.save();
        } else {
          const gradingStatusBy = graders.map((grader) => ({
            grader_id: grader.user_id,
            role: grader.role,
            status:
              grader.user_id.toString() === req.user.id ? "already" : "pending",
          }));

          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: scores,
            total_score: totalRawScore,
            status: gradingStatusBy.every(
              (grader) => grader.status === "already"
            )
              ? "graded"
              : "pending",
            grading_status_by: gradingStatusBy,
          });

          await finalScore.save();
        }

        if (finalScore.status === "graded") {
          const groupMembersForDistribution = await GroupMember.find({
            group_id: req.body.group_id,
          });

          for (const member of groupMembersForDistribution) {
            if (!member.user_id) continue;
            try {
              let studentScore = await StudentScore.findOne({
                student_id: member.user_id,
                submission_id,
              });
              if (studentScore) {
                studentScore.score = finalScore.total_score;
                studentScore.section_id = assessment.section_id;
                await studentScore.save();
                console.log(
                  `[Distribute Score] Updated StudentScore for student_id: ${member.user_id}, score: ${finalScore.total_score}`
                );
              } else {
                studentScore = new StudentScore({
                  student_id: member.user_id,
                  assessment_id,
                  submission_id,
                  group_id: req.body.group_id,
                  section_id: assessment.section_id,
                  score: finalScore.total_score,
                });
                await studentScore.save();
                console.log(
                  `[Distribute Score] Created StudentScore for student_id: ${member.user_id}, score: ${finalScore.total_score}`
                );
              }
            } catch (error) {
              console.error(
                `[Distribute Score] Error processing user_id: ${member.user_id}`,
                error
              );
            }
          }
        }

        const submission = await Submission.findById(submission_id);
        if (submission) {
          submission.grading_status_by = submission.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
        }

        if (!responseSent) {
          responseSent = true;
          return res.status(201).json({
            message: "Scores submitted successfully!",
            rawScore,
            finalScore,
          });
        }
      }

      if (
        assessment.assignment_type === "group" &&
        assessment.teamgrading_type
      ) {
        const rubric = await Rubric.findById(assessment.rubric_id);
        if (!rubric) {
          return res
            .status(404)
            .json({ message: "Rubric not found for this assessment" });
        }

        const rubricId = rubric._id;

        const criteriaIds = rubric.criteria.map((c) => c._id.toString());
        for (const criteriaId in scores) {
          if (!criteriaIds.includes(criteriaId)) {
            return res.status(400).json({
              message: `Invalid criteria ID: ${criteriaId}`,
              validCriteria: criteriaIds,
            });
          }
        }

        const totalRawScore = Object.values(scores).reduce(
          (sum, score) => sum + score,
          0
        );

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

        const graders = await GroupMember.find({
          assessment_id,
          role: { $in: ["professor", "ta"] },
        });

        if (!graders || graders.length === 0) {
          return res.status(404).json({
            message: "No graders found for this assessment",
          });
        }

        const rawScores = await RawScore.find({ submission_id });

        const groupMembersForWeight = await GroupMember.find({ assessment_id });
        const weightMap = groupMembersForWeight.reduce((map, member) => {
          if (["professor", "ta"].includes(member.role)) {
            map[member.user_id.toString()] = member.weight || 1;
          }
          return map;
        }, {});

        const criteriaScores = {};
        let totalWeight = 0;
        let totalScore = 0;

        rawScores.forEach((rawScore) => {
          const weight = weightMap[rawScore.professor_id.toString()] || 1;
          totalWeight += weight;
        });

        rawScores.forEach((rawScore) => {
          let scoreObject;
          if (rawScore.score instanceof Map) {
            scoreObject = Object.fromEntries(rawScore.score);
          } else {
            scoreObject = rawScore.score;
          }
          const weight = weightMap[rawScore.professor_id.toString()] || 1;
          console.log(
            `[Weight Calculation] Professor ${rawScore.professor_id} weight: ${weight}, scores: ${JSON.stringify(scoreObject)}`
          );
          Object.entries(scoreObject).forEach(([criteriaId, score]) => {
            const weightedScore =
              totalWeight > 0 ? (score * weight) / totalWeight : score;
            console.log(
              `[Weighted Score] Professor ${rawScore.professor_id} criteria ${criteriaId}: raw=${score}, weighted=${weightedScore}`
            );
            if (!criteriaScores[criteriaId]) {
              criteriaScores[criteriaId] = [];
            }
            criteriaScores[criteriaId].push(weightedScore);
          });
        });

        const finalScores = {};
        totalScore = 0;
        for (const [criteriaId, scoresArr] of Object.entries(criteriaScores)) {
          const sum = scoresArr.reduce((a, b) => a + b, 0);
          finalScores[criteriaId] = sum;
          totalScore += sum;
          console.log(
            `[Final Criteria Score] criteriaId: ${criteriaId}, sum: ${sum}, all weighted: ${JSON.stringify(scoresArr)}`
          );
        }
        console.log(`[Final Total Score] totalScore: ${totalScore}`);

        let finalScore = await FinalScore.findOne({ submission_id });

        if (finalScore) {
          finalScore.score = finalScores;
          finalScore.total_score = totalScore;

          graders.forEach((grader) => {
            const graderExists = finalScore.grading_status_by.some(
              (g) => g.grader_id.toString() === grader.user_id.toString()
            );

            if (!graderExists) {
              finalScore.grading_status_by.push({
                grader_id: grader.user_id,
                role: grader.role,
                status: "pending",
              });
            }
          });

          finalScore.grading_status_by = finalScore.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = finalScore.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            finalScore.status = "graded";
          }

          await finalScore.save();
        } else {
          const gradingStatusBy = graders.map((grader) => ({
            grader_id: grader.user_id,
            role: grader.role,
            status:
              grader.user_id.toString() === req.user.id ? "already" : "pending",
          }));

          finalScore = new FinalScore({
            student_id: req.body.student_id,
            group_id: req.body.group_id,
            assessment_id,
            submission_id,
            rubric_id: rubricId,
            score: finalScores,
            total_score: totalScore,
            status: gradingStatusBy.every(
              (grader) => grader.status === "already"
            )
              ? "graded"
              : "pending",
            grading_status_by: gradingStatusBy,
          });

          await finalScore.save();
        }

        if (finalScore.status === "graded") {
          const groupMembersForDistribution = await GroupMember.find({
            group_id: req.body.group_id,
          });

          for (const member of groupMembersForDistribution) {
            if (!member.user_id) continue;
            try {
              let studentScore = await StudentScore.findOne({
                student_id: member.user_id,
                submission_id,
              });
              if (studentScore) {
                studentScore.score = finalScore.total_score;
                studentScore.section_id = assessment.section_id;
                await studentScore.save();
                console.log(
                  `[Distribute Score] Updated StudentScore for student_id: ${member.user_id}, score: ${finalScore.total_score}`
                );
              } else {
                studentScore = new StudentScore({
                  student_id: member.user_id,
                  assessment_id,
                  submission_id,
                  group_id: req.body.group_id,
                  section_id: assessment.section_id,
                  score: finalScore.total_score,
                });
                await studentScore.save();
                console.log(
                  `[Distribute Score] Created StudentScore for student_id: ${member.user_id}, score: ${finalScore.total_score}`
                );
              }
            } catch (error) {
              console.error(
                `[Distribute Score] Error processing user_id: ${member.user_id}`,
                error
              );
            }
          }
        }

        const submission = await Submission.findById(submission_id);
        if (submission) {
          submission.grading_status_by = submission.grading_status_by.map(
            (grader) => {
              if (grader.grader_id.toString() === req.user.id) {
                return { ...grader, status: "already" };
              }
              return grader;
            }
          );

          const allGraded = submission.grading_status_by.every(
            (grader) => grader.status === "already"
          );

          if (allGraded) {
            submission.grading_status = "already";
          }

          await submission.save();
        }

        if (!responseSent) {
          responseSent = true;
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
        responseSent = true;
        return res.status(500).json({
          message: "Error submitting scores",
          error,
        });
      }
    }
  }
);

router.get(
  "/assessment/finalscore",
  verifyToken,

  async (req, res) => {
    const { assessment_id, submission_id } = req.query;

    try {
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

router.get(
  "/assessment/rawscore/:submission_id",
  verifyToken,

  async (req, res) => {
    const { submission_id } = req.params;

    try {
      const rawScore = await RawScore.findOne({
        submission_id,
        professor_id: req.user.id,
      }).populate("rubric_id", "rubric_name description criteria");

      if (!rawScore) {
        return res.status(404).json({
          message: "RawScore not found for this submission and professor",
        });
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
