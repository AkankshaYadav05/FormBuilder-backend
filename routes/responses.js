import express from "express";
import Response from "../models/Response.js";

const router = express.Router();

// POST /api/submit - General submit endpoint
router.post('/submit', async (req, res) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Invalid form submission' });
    }

    answers.forEach(a => {
      if (!a.questionId || !a.subQuestionId || !a.question) {
        throw new Error('Answer validation failed');
      }
    });

    const response = new Response({
      formId,
      answers,
      submitterInfo: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        sessionId: req.sessionID || null
      }
    });

    await response.save();

    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error saving response:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ===== GET ALL RESPONSES FOR LOGGED-IN USER =====
router.get("/user", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Not logged in" });
    }

    const responses = await Response.find({ user: req.session.userId });
    res.json(responses);
  } catch (err) {
    console.error("Error fetching responses:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// GET /api/responses - Get all responses (with optional form filter)
router.get("/", async (req, res) => {
  try {
    const { formId } = req.query;
    const filter = formId ? { formId } : {};
    
    const responses = await Response.find(filter)
      .populate('formId', 'title description')
      .sort({ submittedAt: -1 });
    
    res.json(responses);
  } catch (err) {
    console.error("Fetch responses error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/responses/:id - Get specific response
router.get("/:id", async (req, res) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('formId', 'title description');
    
    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }
    
    res.json(response);
  } catch (err) {
    console.error("Fetch response error:", err);
    res.status(500).json({ message: err.message });
  }
});



// DELETE /api/responses/:id - Delete specific response
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Response.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Response not found" });
    }
    
    res.json({ message: "Response deleted successfully" });
  } catch (err) {
    console.error("Delete response error:", err);
    res.status(500).json({ message: err.message });
  }
});


export default router;