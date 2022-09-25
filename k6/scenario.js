import http from 'k6/http';
import { check, sleep } from 'k6';

export function setup() {
  console.log('setUp!');
}

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const baseUrl = 'http://localhost:8000';
  const sessionKey = 'connect.sid';

  // Login to API Server
  const response = http.post(baseUrl + '/login', {
    client_id: 'yamada-naoko',
    password: 'topSecretSecret',
  });

  // Get Session ID from cookie
  const jar = http.cookieJar();
  const cookies = jar.cookiesForURL(response.url);
  check(null, {
    'vu jar has session cookie': () => cookies[sessionKey].length > 0,
  });

  // Set Session in cookie
  jar.set(baseUrl, sessionKey, cookies[sessionKey], {
    domain: 'localhost:8000',
    path: '/',
    max_age: 600,
  });

  sleep(3);

  // Get login user information
  const loginRes = http.get(baseUrl + '/me');
  check(loginRes, {
    'get client-id status': (r) => r.status === 200,
    'client-id is yamada': (r) => r.json('clientId') === 'yamada-naoko',
  });

  // Get Post information
  const postsRes = http.get(baseUrl + '/posts');
  check(postsRes, {
    'get posts status': (r) => r.status === 200,
    'posts length': (r) => r.json('posts').length >= 1,
  });

  // Create New Post
  const postRes = http.post(
    `${baseUrl}/post`,
    JSON.stringify({
      post: 'posted by stress test k6.',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const postResult = check(postRes, {
    'posted success': (r) => r.status === 200,
    'posted respons body': (r) => r.json('status') === 'success',
  });
  if (!postResult) {
    console.error('posted error');
  }

  // Get Users Post information
  const userPostsRes = http.get(baseUrl + '/user/posts', {
    take: 10,
    offfset: 20,
  });
  check(userPostsRes, {
    'get user posts status': (r) => r.status === 200,
    'user posts length': (r) => r.json('posts').length >= 1,
  });
}
