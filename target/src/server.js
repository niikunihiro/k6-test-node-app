const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const redisStore = require('connect-redis')(session);
const mysql = require('mysql2/promise');
const redis = require('ioredis');
const bcrypt = require('bcrypt');

const sql = require('./sql/locator');

const app = express();
const PORT = 3333;

/** @type {Promise<mysql.Connection>} */
let con;
let query = [];
app.listen(PORT, async () => {
  con = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT),
  });
  con.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('connected mysql server.');
  });
  query = sql.locator('/app/sql');
  console.log('Application started');
});

const sess = {
  secret: 'topSecretSecret',
  cookie: { maxAge: 1000 * 3600 },
  resave: false,
  saveUninitialized: false,
  store: new redisStore({
    client: new redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  }),
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/login' || req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
});

app.get('/', (req, res) => {
  res.send('your id: ' + req.session.user.clientId);
});

app.get('/me', (req, res) => {
  res.json({
    clientId: req.session.user.clientId,
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
  });
});

app.get('/login', (req, res) => {
  res.type('text/html').send(
    `<form method="POST" action="/login">
      <div>
        <label>input id</label>
        <input type="text" name="client_id" />
      </div>
      <div>
        <label>input password</label>
        <input type="password" name="password" />
      </div>
      <div><input type="submit" value="login"></div>
    </form>`
  );
});

app.post('/login', async (req, res) => {
  const clientId = req.body.client_id;
  const clientSecret = req.body.password;

  const [rows] = await con.execute(query['client_by_id'], [clientId]);
  if (rows.length !== 1) {
    console.warn('Login failure, user not found.');
    res.redirect(302, '/login');
    return;
  }

  const result = await bcrypt.compare(clientSecret, rows[0].password);
  if (result) {
    console.log('Login successful.');
    req.session.regenerate((err) => {
      req.session.user = {
        userId: rows[0].user_id,
        clientId: clientId,
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
      };
      res.redirect(303, '/');
    });
  } else {
    console.warn('Login failure, password not mutch');
    res.redirect(302, '/login');
  }
});

app.get('/posts', async (req, res) => {
  const take = req.query.take ? req.query.take : '10';
  const offset = req.query.offset ? req.query.offset : '0';
  const [posts] = await con.execute(query['post_list'], [take, offset]);
  let body = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    body.push({
      postId: post.post_id,
      post: post.post,
      postedAt: post.posted_at,
      _embedded: {
        postedUser: {
          clientId: post.client_id,
          firstName: post.first_name,
          lastName: post.last_name,
        },
      },
    });
  }
  res.json({ posts: body });
});

app.get('/user/posts', async (req, res) => {
  const take = req.query.take ? req.query.take : '10';
  const offset = req.query.offset ? req.query.offset : '0';
  const [posts, fileds] = await con.execute(query['users_post_list'], [
    req.session.user.clientId,
    take,
    offset,
  ]);
  let body = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    body.push({
      postId: post.post_id,
      post: post.post,
      postedAt: post.posted_at,
      _embedded: {
        postedUser: {
          clientId: post.client_id,
          firstName: post.first_name,
          lastName: post.last_name,
        },
      },
    });
  }
  res.json({ posts: body });
});

app.post('/post', async (req, res) => {
  const post = req.body.post ? req.body.post : '';
  if (post.length <= 0) {
    res.statusCode = 400;
    return res.json({ status: 'failed' });
  }
  try {
    await con.beginTransaction();
    const [row1] = await con.query('INSERT INTO posts SET ?', { post: post });
    console.log('row1', row1, req.session.user);
    const clientPostdata = {
      user_id: req.session.user.userId,
      post_id: row1.insertId,
    };
    const [row2] = await con.query(
      'INSERT INTO clients_post SET ?',
      clientPostdata
    );
    console.log('row2', row2);
    await con.commit();
    res.json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    await con.rollback();
    return res.json({ status: 'failed' });
  }
});

const hashPassword = async (password, rounds) => {
  const salt = await bcrypt.genSalt(rounds);
  console.log(salt);
  const hashedPass = await bcrypt.hash(password, salt);
  console.log(hashedPass);
  return hashedPass;
};
