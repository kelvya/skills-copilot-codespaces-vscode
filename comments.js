// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

// Create web server
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Create event handler
const handleEvent = (type, data) => {
  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    // Get comments by post id
    const comments = commentsByPostId[postId] || [];
    // Push new comment to comments array
    comments.push({ id, content, status });
    // Set comments array to comments object
    commentsByPostId[postId] = comments;
  }
  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    // Get comments by post id
    const comments = commentsByPostId[postId];
    // Find comment by id
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    // Update content and status
    comment.status = status;
    comment.content = content;
  }
};

// Get comments
app.get('/posts/:id/comments', (req, res) => {
  // Get comments by post id
  const comments = commentsByPostId[req.params.id] || [];
  // Send comments
  res.send(comments);
});

// Create comment
app.post('/posts/:id/comments', async (req, res) => {
  // Get comment content
  const { content } = req.body;
  // Get post id
  const postId = req.params.id;
  // Get comments by post id
  const comments = commentsByPostId[postId] || [];
  // Create comment id
  const id = require('crypto').randomBytes(4).toString('hex');
  // Create comment
  const comment = { id, content, status: 'pending' };
  // Push comment to comments array
  comments.push(comment);
  // Set comments array to comments object
  commentsByPostId[postId] = comments;
  // Emit CommentCreated event
  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: { id, content, postId, status: 'pending' },
    });
});