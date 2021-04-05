const dummy = blogs => {
  return blogs.reduce(out => out, 1);
};

const totalLikes = blogs => {
  const total = blogs.reduce((likes, blogs) => {
    return likes + blogs.likes;
  }, 0);

  return blogs.length === 0 ? 0 : total;
};

module.exports = {
  dummy,
  totalLikes
};