const express = require('express');
const router = express.Router();
const passport = require('passport');
const Comment = require('../models/Comment');

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate('author', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Create a new comment
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { content, postId } = req.body;
    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating comment', error: error.message });
  }
});

// Delete a comment
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting comment', error: error.message });
  }
});

module.exports = router;