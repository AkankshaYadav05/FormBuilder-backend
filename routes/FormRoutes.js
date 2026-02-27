import express from 'express';
import Form from '../models/Form.js';
import Response from "../models/Response.js";
import { uploadDocument } from '../upload.js';
import { requireLogin } from '../middleware.js';

const router = express.Router();

// GET all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/forms - Create new form
router.post('/', requireLogin, uploadDocument.single('file'), async (req, res) => {
  try {
    const newForm = new Form({
      title: req.body.title,
      description: req.body.description,
      file: req.file.path,
    });
    await newForm.save();
    res.status(201).json(newForm);
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET all forms for logged in user
router.get("/user", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Not logged in" });
    }

    // Fetch all forms where user field matches logged-in user's ObjectId
    const forms = await Form.find({ user: req.session.userId });
    res.json(forms);
  } catch (err) {
    console.error("Error fetching forms:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/forms/:id - Get specific form
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (err) {
    console.error('Error fetching form:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/forms/:id - Update form
router.put('/:id', requireLogin, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // check ownership
    if (form.user.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this form' });
    }

    form.set({ ...req.body, updatedAt: new Date() });
    await form.save();

    res.json(form);
  } catch (err) {
    console.error('Error updating form:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/forms/:id - Delete form
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // check ownership
    if (form.user.toString() !== req.session.userId) {
      console.log("Session ID:", req.session.userId);
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }

    await form.deleteOne();
    await Response.deleteMany({ formId: req.params.id });

    console.log("✅ Form deleted:", req.params.id);
    res.status(200).json({ message: 'Form and responses deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting form:', err);
    res.status(500).json({ message: err.message });
  }
});



// POST /api/forms/:id/submit - Submit form response
router.post("/:id/submit", async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; 

    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const processedAnswers = answers.map(userAnswer => {
      const question = form.questions.find(q => q.id === userAnswer.questionId);
      
      if (!question) {
        return {
          questionId: userAnswer.questionId,
          questionText: "Question not found",
          questionType: "unknown",
          answer: userAnswer.answer,
        };
      }

      return {
        questionId: userAnswer.questionId,
        questionText: question.text,
        questionType: question.type,
        answer: userAnswer.answer,
      };
    });

    const response = new Response({
      formId: id,
      answers: processedAnswers,
      submittedAt: new Date(),
      submitterInfo: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || 'anonymous'
      }
    });

    await response.save();
    await Form.findByIdAndUpdate(id, { $inc: { responsesCount: 1 } });
    
    res.status(201).json({ 
      message: 'Response submitted successfully',
      response: {
        _id: response._id,
        submittedAt: response.submittedAt,
      }
    });
  } catch (err) {
    console.error("Error saving response:", err);
    res.status(500).json({ error: "Server error while saving response" });
  }
});

// GET /api/forms/:id/responses - Get all responses for a form
router.get('/:id/responses', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.id })
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    console.error('Error fetching responses:', err);
    res.status(500).json({ message: err.message });
  }
});


// POST /api/forms/upload - Upload document to Cloudinary
router.post(
  "/upload",
  requireLogin,
  uploadDocument.single("file"),
  async (req, res) => {
    try {
      res.status(200).json({
        filePath: req.file.path,
        url: req.file.path,
        public_id: req.file.filename,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Document upload failed" });
    }
  }
);



export default router;