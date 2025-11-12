export const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "You must be logged in" });
  }
  next();
};
