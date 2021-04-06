const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  if (!req.body.title || !req.body.url) {
    return res.status(400).json('error: title or url missing');
  }
  if (!req.body.likes) {
    req.body.likes = 0;
  }
  const blog = new Blog(req.body);
  const returnedBlog = await blog.save();
  res.status(201).json(returnedBlog);
});

module.exports = blogsRouter;