import assert from 'assert';
import fetch from 'node-fetch';
import { appl } from '../index.js';

describe('Functional Tests - API Methods', () => {
  after(() => {
    appl.close();
  });

  const testUser = {
    email: 'test38@example.com',
    password: 'testpassword',
    fullname: 'TestUser38',
  };

  let authToken; 

  // Test GET /info
  it('should return public information for the main page', async () => {
    const response = await fetch('http://localhost:5000/info');
    const responseBody = await response.json();

    //console.log('GET /info Response:', responseBody);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(responseBody.success, true);
    assert.strictEqual(responseBody.data.info, 'Some information about the <b>company</b>.');
  });

  // Test POST /register
  it('should register a new user', async () => {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const responseBody = await response.json();

    //console.log('POST /register Response:', responseBody);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(responseBody.success, true);
    assert.deepStrictEqual(responseBody.data, {});
  });

  // Test POST /login
  it('should authenticate user and return a token', async () => {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const responseBody = await response.json();

    //console.log('POST /login Response:', responseBody);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(responseBody.success, true);
    assert.strictEqual(typeof responseBody.data.token, 'string');

    authToken = responseBody.data.token; // Save the token for subsequent requests
  });

  // Test GET /profile?token=[token]
  it('should return user profile for an authenticated user', async () => {
    const profileResponse = await fetch(`http://localhost:5000/profile?token=${authToken}`);
    const profileBody = await profileResponse.json();

    //console.log('GET /profile Response:', profileBody);

    assert.strictEqual(profileResponse.status, 200);
    assert.strictEqual(profileBody.success, true);
    assert.strictEqual(typeof profileBody.data.fullname, 'string');
    assert.strictEqual(typeof profileBody.data.email, 'string');
  });

  // Test GET /author?token=[token]
  it('should return random author information for an authenticated user', async () => {
    // Fetch random author using the obtained token
    const authorResponse = await fetch(`http://localhost:5000/author?token=${authToken}`);
    const authorBody = await authorResponse.json();

    //console.log('GET /author Response:', authorBody);

    assert.strictEqual(authorResponse.status, 200);
    assert.strictEqual(authorBody.success, true);
    assert.strictEqual(typeof authorBody.data.authorId, 'number');
    assert.strictEqual(typeof authorBody.data.name, 'string');
  });

  // Test GET /quote?token=[token]&authorId=[authorId]
  it('should return random quote for an authenticated user and specified author', async () => {
    // Fetch random quote 
    const authorResponse = await fetch(`http://localhost:5000/author?token=${authToken}`);
    const authorBody = await authorResponse.json();
    //console.log('GET /author Response:', authorBody);
    const authorId = authorBody.data.authorId

    const quoteResponse = await fetch(`http://localhost:5000/quote?token=${authToken}&authorId=${authorId}`);
    const quoteBody = await quoteResponse.json();

    //console.log('GET /quote Response:', quoteBody);

    assert.strictEqual(quoteResponse.status, 200);
    assert.strictEqual(quoteBody.success, true);
    assert.strictEqual(typeof quoteBody.data.authorId, 'number');
    assert.strictEqual(typeof quoteBody.data.quoteId, 'number');
    assert.strictEqual(typeof quoteBody.data.quote, 'string');
  });

  // Test DELETE /logout?token=[token]
  it('should successfully log out an authenticated user', async () => {
    // Log out the user 
    const logoutResponse = await fetch(`http://localhost:5000/logout?token=${authToken}`, {
      method: 'DELETE',
    });

    const logoutBody = await logoutResponse.json();

    //console.log('DELETE /logout Response:', logoutBody);

    assert.strictEqual(logoutResponse.status, 200);
    assert.strictEqual(logoutBody.success, true);
    assert.deepStrictEqual(logoutBody.data, {});
  }).timeout(10000); 
});
