const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Blog = require('../models/Blog');

const api = supertest(app);

const initialUsers = [
  {
    _id: '5a422a851b54a676234d17f7',
    username: 'test1',
    name: 'Test 1',
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    username: 'test2',
    name: 'Test 2',
    __v: 0,
  },
  {
    _id: '5a422a851b54a676234d17f9',
    username: 'test3',
    name: 'Test 3',
    __v: 0,
  }
];

const usersInDb = async () => {
  const users = await User.find({})
    .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 });
  return users.map(user => user.toJSON());
};

const blogsInDb = async () => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 });
  return blogs.map(blog => blog.toJSON());
};

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  for (let user of initialUsers) {
    let userObject = new User(user);
    await userObject.save();
  }
});

describe('retrieving users', () => {
  test('users are returned as json and correct amount', async () => {
    const res = await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    
    expect(res.body).toHaveLength(initialUsers.length);
  });
});

describe('inserting users', () => {
  test('valid users can be added', async () => {
    const newUser = {
      username: 'test4',
      name: 'Test 4',
      password: 'testpassword'
    };
  
    await api.post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(initialUsers.length + 1);
  
    const users = usersAtEnd.map(u => u.username);
    expect(users).toContain('test4');
  });

  test('users without username or password cant be added', async () => {
    const noUsernameUser = {
      username: '',
      name: 'Test 4',
      password: 'password'
    };

    const noPasswordUser = {
      username: 'test4',
      name: 'Test 4',
      password: ''
    };
  
    await api.post('/api/users')
      .send(noUsernameUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    await api.post('/api/users')
      .send(noPasswordUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(initialUsers.length);
  });

  test('users with username or password with less than 3 characters cant be added', async () => {
    const invalidUsernameUser = {
      username: 't',
      name: 'Test 4',
      password: 'password'
    };

    const invalidPasswordUser = {
      username: 'test4',
      name: 'Test 4',
      password: 'p'
    };
  
    await api.post('/api/users')
      .send(invalidUsernameUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    
    await api.post('/api/users')
      .send(invalidPasswordUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(initialUsers.length);
  });
});

describe('updating users blogs', () => {
  test('users blogs are updated on blog insert', async () => {
    const newBlog = {
      title: 'test title',
      author: 'test author',
      url: 'test url',
      likes: 0,
      userId: initialUsers[0]._id
    };
  
    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(1);
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain('test title');

    const usersAtEnd = await usersInDb();
    const blogs = usersAtEnd.map(u => u.blogs);
    expect(blogs[0][0].title).toContain('test title');
  });
});

afterAll(() => {
  mongoose.connection.close();
});