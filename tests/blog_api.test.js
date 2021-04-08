const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/Blog');
const User = require('../models/User');

const api = supertest(app);

const initialUser = {
  username: 'test1',
  name: 'Test 1',
  password: 'testpassword'
};

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaWQiOiI2MDZkMWRmNDU5NjdmYzNmZjQwZThjMGEiLCJpYXQiOjE2MTc4NDk4ODV9.Aa6546AsLhKXjUkqQn3seC5C86LUuKKXwzi7w9h4hVw';
let token = '';
let initialUserId = '';

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  return blogs.map(blog => blog.toJSON());
};

const auth = async () => {
  await User.deleteMany({});
  const savedUser = await api.post('/api/users')
    .send({
      username: initialUser.username,
      name: initialUser.name,
      password: initialUser.password
    });
  initialUserId = savedUser.body.id;

  const response = await api.post('/api/login')
    .send({
      username: initialUser.username,
      password: initialUser.password
    });
  token = response.body.token;
};

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }  
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await auth();

  for (let blog of initialBlogs) {
    let blogObject = new Blog({
      ...blog,
      user: initialUserId
    });
    await blogObject.save();
  }
});

describe('retrieving blogs', () => {
  test('blogs are returned as json and correct amount', async () => {
    const res = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
      
    expect(res.body).toHaveLength(initialBlogs.length);
  });
  
  test('blogs unique identifier is named id', async () => {
    const res = await api.get('/api/blogs');
    
    expect(res.body[0].id).toBeDefined();
  });
});

describe('inserting blogs', () => {
  test('valid blogs can be added', async () => {
    const newBlog = {
      title: 'test title',
      author: 'test author',
      url: 'test url',
      likes: 0
    };
  
    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain('test title');
  });

  test('blogs user are saved', async () => {
    const newBlog = {
      title: 'test title',
      author: 'test author',
      url: 'test url'
    };
  
    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);

    const users = blogsAtEnd.map(b => b.user.name);
    expect(users).toContain(initialUser.name);
  });
  
  test('blogs without likes defaults likes to zero', async () => {
    const newBlog = {
      title: 'test title',
      author: 'test author',
      url: 'test url'
    };
  
    const res = await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
    expect(res.body.likes).toBe(0);
  });
  
  test('blogs without title are not saved', async () => {
    const newBlog = {
      author: 'test author',
      url: 'test url'
    };
  
    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  });
  
  test('blogs without url are not saved', async () => {
    const newBlog = {
      title: 'test title',
      author: 'test author',
    };
  
    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  });
});

describe('deleting and updating blogs', () => {
  test('blogs can be deleted', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToDelete = blogsAtStart[0];
  
    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)    
      .expect(204);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(
      initialBlogs.length - 1
    );
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test('blogs cant be deleted by wrong user', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToDelete = blogsAtStart[0];
  
    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${fakeToken}`)    
      .expect(401);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain(blogToDelete.title);
  });

  test('blogs can be updated', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToUpdate = {
      ...blogsAtStart[0],
      title: 'updated title test',
      likes: 99
    };
  
    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(blogToUpdate)  
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain(blogToUpdate.title);
  });

  test('blogs cant be updated by wrong user', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToUpdate = {
      ...blogsAtStart[0],
      title: 'updated title test',
      likes: 99
    };
  
    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${fakeToken}`)
      .send(blogToUpdate)  
      .expect(401)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain(blogsAtStart[0].title);
  });

  test('blogs with invalid data are not updated', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToUpdate = {
      ...blogsAtStart[0],
      title: 1,
      url: 1,
      likes: 'string',
    };
  
    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(blogToUpdate)  
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  
    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).toContain(blogsAtStart[0].title);
  });
});

afterAll(async () => {
  mongoose.connection.close();
});