const mongoose = require('mongoose');

const rubricLevelSchema = new mongoose.Schema({
    rubric_criteria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RubricCriteria', required: true },
    level_name: { type: String, required: true },
    score: { type: Number, required: true },
    description: { type: String }
});

module.exports = mongoose.model('RubricLevel', rubricLevelSchema);
