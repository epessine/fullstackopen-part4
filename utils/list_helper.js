const _ = require('lodash');

const dummy = blogs => {
  return blogs.reduce(out => out, 1);
};

const totalLikes = blogs => {
  const total = blogs.reduce((likes, blogs) => {
    return likes + blogs.likes;
  }, 0);

  return blogs.length === 0 ? 0 : total;
};

const favoriteBlog = blogs => {
  const mostLiked = blogs.find(blog => 
    blog.likes === Math.max(...blogs.map(blog => {
      return blog.likes;
    }))
  );

  return blogs.length === 0 ? null : mostLiked;
};

const mostBlogs = blogs => {
  const authors = _.countBy(blogs, (blog) => blog.author);
  const authorWithMostBlogs = _.max(Object.keys(authors), o => authors[o]);

  return blogs.length === 0 ? null : { 
    author: authorWithMostBlogs, 
    blogs: authors[authorWithMostBlogs]
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
};