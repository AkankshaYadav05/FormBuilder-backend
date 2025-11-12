// models/response.js
import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subQuestionId: { type: mongoose.Schema.Types.ObjectId},
  question: { type: String, required: true }, // actual question text
  answer: { type: mongoose.Schema.Types.Mixed },
});

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  answers: [AnswerSchema],
  submittedAt: { type: Date, default: Date.now },
  submitterInfo: {
    ip: String,
    userAgent: String,
    sessionId: String
  }
}, { timestamps: true });

export default mongoose.model("Response", ResponseSchema);
