const mongoose = require('mongoose');

const rubricCriteriaSchema = new mongoose.Schema({
    rubric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric', required: true },
    criterion_name: { type: String, required: true },
    description: { type: String },
    max_score: { type: Number, required: true },
    weight: { type: Number, default: 1.0 }
});

module.exports = mongoose.model('RubricCriteria', rubricCriteriaSchema);
