import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  type: { 
    type: String, 
    required: true, 
    enum: ["mcq", "short", "long", "rating", "checkbox", "dropdown", "file", "date", "time", "categorize"] 
  },
  text: { type: String, required: true },
  
  options: [{ type: String }],
  scale: { type: Number, default: 5 },  
  categories: [{ type: String }],
  items: [{ type: String }],
  required: { type: Boolean, default: false },
  placeholder: String,
  description: String
});


const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  questions: [QuestionSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file: { type: String, default: "" },
  theme: { type: String, default: "default" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


FormSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

export default mongoose.model("Form", FormSchema);