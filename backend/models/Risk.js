const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Risk title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Risk description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['Cybersecurity', 'Compliance', 'Operational', 'Financial', 'Strategic', 'Reputational', 'Technical', 'Data Privacy']
  },
  likelihood: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  impact: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  riskScore: {
    type: Number
  },
  riskLevel: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Mitigated', 'Closed', 'Accepted'],
    default: 'Open'
  },
  owner: {
    type: String,
    required: [true, 'Risk owner is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  mitigation: {
    type: String,
    maxlength: [500, 'Mitigation plan cannot exceed 500 characters']
  },
  dueDate: {
    type: Date
  },
  tags: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-calculate risk score and level before saving
riskSchema.pre('save', function(next) {
  this.riskScore = this.likelihood * this.impact;

  if (this.riskScore >= 20) this.riskLevel = 'Critical';
  else if (this.riskScore >= 12) this.riskLevel = 'High';
  else if (this.riskScore >= 6) this.riskLevel = 'Medium';
  else this.riskLevel = 'Low';

  next();
});

module.exports = mongoose.model('Risk', riskSchema);