const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
    submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    file_url: { type: String, required: true },
    page_number: { type: Number, required: true },
    highlight_text: { type: String },
    bounding_box: { type: Object },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Annotation', annotationSchema);
