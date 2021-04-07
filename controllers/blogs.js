const blogsRouter = require('express').Router();
const Blog = require('../models/Blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { 
      username: 1, 
      name: 1 
    });
  res.status(200).json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  if(!req.user)
    return res.status(401)
      .json({ error: 'token missing or invalid' });

  if (!req.body.title || !req.body.url) 
    return res.status(400)
      .json('error: title or url missing');

  if (!req.body.likes) req.body.likes = 0;

  const blog = new Blog({
    ...req.body,
    user: req.user.id
  });

  const returnedBlog = await blog.save();
  req.user.blogs = req.user.blogs.concat(returnedBlog._id);
  await req.user.save();

  res.status(201).json(returnedBlog);
});

blogsRouter.delete('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!req.user || blog.user.toString() !== req.user.id.toString())
    return res.status(401)
      .json({ error: 'token missing or invalid' });

  const updatedBlog = await Blog.findByIdAndRemove(req.params.id);
  res.status(204).json(updatedBlog);
});

blogsRouter.put('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!req.user || blog.user.toString() !== req.user.id.toString())
    return res.status(401)
      .json({ error: 'token missing or invalid' });

  const body = req.body;

  if (!body)
    return res.status(400)
      .json('error: info missing');

  const updatedBlog = {
    title: body.title || blog.title,
    author: body.author || blog.author,
    url: body.url || blog.url,
    likes: body.likes || blog.likes,
  };

  const returnedBlog = await Blog.findByIdAndUpdate(
    req.params.id, 
    updatedBlog, 
    { new: true, runValidators: true }
  );

  res.status(200).json(returnedBlog);
});

module.exports = blogsRouter;