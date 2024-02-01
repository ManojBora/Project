import  Sequelize  from 'sequelize';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { User, Token, Author, Quote } from './models/tables.js';

import express from 'express';
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 5000


const secretKey = 'securekey@123';
// Generate a JWT token
function generateToken(userId) {
    const payload = { userId };
    const options = { expiresIn: '1h' }; // Token expires in 1 hour
    return jwt.sign(payload, secretKey, options);
  }



// 1. GET /info - no authentication needed
app.get('/info', (req, res) => {
  res.json({
    success: true,
    data: { info: 'Some information about the <b>company</b>.' }
  });
});

// 2. POST /register - only not authenticated
app.post('/register', async (req, res) => {
  const { email, password, fullname } = req.body;

  try {
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists.'
      });
    }

    // Create a new user
    const newUser = await User.create({ email, password, fullname });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

// 3. POST /login - only not authenticated
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user with the provided email already has an associated token
    const loggedInUser = await User.findOne({ where: { email } });

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Check if the user already has a token
    const existingToken = await Token.findOne({ where: { userId: loggedInUser.id } });

    let token;
    
    if (existingToken) {
      // Reuse the existing token
      token = existingToken.token;
    } else {
      // Generate a new token
      token = generateToken(loggedInUser.id);
      
      // Create and associate a new token
      await Token.create({ token, userId: loggedInUser.id });
    }

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

// 4. GET /profile?token=[token] - only authenticated
app.get('/profile', async (req, res) => {
  const { token } = req.query;

  try {
    // Find user by token
    const user = await User.findOne({
      include: [{
        model: Token,
        where: { token },
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }

    res.json({
      success: true,
      data: { fullname: user.fullname, email: user.email }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Authenticate the user based on the provided token
const authenticateUser = async (req, res, next) => {
  const { token } = req.query;

  try {
    // Find the user based on the provided token
    const user = await User.findOne({
      include: [{
        model: Token,
        where: { token },
      }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
    }

    // User is authenticated
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

// GET /author?token=[token] - only authenticated
app.get('/author', authenticateUser, async (req, res) => {
    try {
      
      //await delay(5000);
  
      // Fetch a random author
      const randomAuthor = await Author.findOne({
        order: [
          [Sequelize.fn('RANDOM')] 
        ],
      });
  
      if (!randomAuthor) {
        return res.status(404).json({
          success: false,
          error: 'No authors found.',
        });
      }
  
      res.json({
        success: true,
        data: {
          authorId: randomAuthor.authorId,
          name: randomAuthor.name,
        },
      });
    } catch (error) {
      console.error('Error fetching random author:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
    }
  });
  
  // GET /quote?token=[token]&authorId=[authorId] - only authenticated
  app.get('/quote', authenticateUser, async (req, res) => {
    const { authorId } = req.query;
    console.error('author:', authorId);
  
    try {
      //await delay(5000);
  
      // Fetch a random quote from the specified author
      const randomQuote = await Quote.findOne({
        where: { authorId },
        order: [
          [Sequelize.fn('RANDOM')] 
        ],
      });
  
      if (!randomQuote) {
        return res.status(404).json({
          success: false,
          error: 'No quotes found for the specified author.',
        });
      }
  
      res.json({
        success: true,
        data: {
          authorId: randomQuote.authorId,
          quoteId: randomQuote.quoteId,
          quote: randomQuote.quote,
        },
      });
    } catch (error) {
      console.error('Error fetching random quote:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
    }
  });
  
  // DELETE /logout?token=[token]
  app.delete('/logout', authenticateUser, async (req, res) => {
    const { token } = req.query;
  
    try {
      // Find and delete the token from the database
      await Token.destroy({ where: { token } });
  
      res.json({
        success: true,
        data: {},
      });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      });
    }
  });
  
export const appl=  app.listen(port,()=>{
    console.log("server running")
}   );

