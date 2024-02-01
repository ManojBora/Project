import  Sequelize from 'sequelize';
import {sequelize}  from '../database.js';

// Models for User, Token, Author, and Quote entities
export const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fullname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export const Token = sequelize.define('token', {
  token: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

export const Author = sequelize.define('author', {
    authorId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  export const Quote = sequelize.define('quote', {
    quoteId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    authorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    quote: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

// Associations
Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });

Quote.belongsTo(Author, { foreignKey: 'authorId' });
Author.hasMany(Quote, { foreignKey: 'authorId' });


