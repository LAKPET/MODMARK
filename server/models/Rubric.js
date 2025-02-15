const mongoose = require('mongoose');

const rubricLevelSchema = new mongoose.Schema({
    level: { type: Number, required: true },
    description: { type: String, required: true },
    score: { type: Number, required: true }
});

const rubricCriteriaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    levels: [rubricLevelSchema]
});

const rubricSchema = new mongoose.Schema({
    rubric_name: { type: String, required: true },
    description: { type: String },
    score: { type: Number, required: true ,default: 100, min: 0, max: 100},
    criteria: [rubricCriteriaSchema],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    is_global: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentRubric' }]
});

module.exports = mongoose.model('Rubric', rubricSchema);
