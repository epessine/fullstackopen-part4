const blogsRouter = require('express').Router();
const Blog = require('../models/Blog');
const User = require('../models/User');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { 
      username: 1, 
      name: 1 
    });
  res.status(200).json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  if (!req.body.title || !req.body.url) {
    return res.status(400).json('error: title or url missing');
  }
  if (!req.body.likes) {
    req.body.likes = 0;
  }

  const user = await User.findById(req.body.userId);
  const blog = new Blog({
    ...req.body,
    user: user.id
  });
  const returnedBlog = await blog.save();
  user.blogs = user.blogs.concat(returnedBlog._id);
  await user.save();

  res.status(201).json(returnedBlog);
});

blogsRouter.delete('/:id', async (req, res) => {
  const updatedBlog = await Blog.findByIdAndRemove(req.params.id);
  res.status(204).json(updatedBlog);
});

blogsRouter.put('/:id', async (req, res) => {
  if (!req.body.title || !req.body.url || !req.body.likes) {
    return res.status(400).json('error: title or url missing');
  }
  const body = req.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };
  const updatedBlog = await Blog
    .findByIdAndUpdate(
      req.params.id, 
      blog, 
      { new: true, runValidators: true });
  res.status(200).json(updatedBlog);
});

module.exports = blogsRouter;