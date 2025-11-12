export const submitResponse = async (req, res) => {
  try {
    const { formId } = req.params; // get from URL
    const { answers } = req.body;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // Save answers directly (no scoring)
    const processedAnswers = answers.map(ans => ({
      questionId: ans.questionId,
      answer: ans.answer
    }));

    const response = new Response({ formId, answers: processedAnswers });
    await response.save();

    res.status(201).json({ message: "Response submitted", response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
