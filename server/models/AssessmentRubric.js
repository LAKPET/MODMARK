const mongoose = require('mongoose');

const assessmentRubricSchema = new mongoose.Schema({
    assessment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric', required: true },
    is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('AssessmentRubric', assessmentRubricSchema);
