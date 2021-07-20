const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken'); //a module
const secret = process.env.JWT;
const { STRING } = Sequelize;
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.byToken = async(token)=> { //this is the value of headers.authentication = dkjhakdfahdkf.dfafd.adsfaf
  try {
    const decodedToken = await jwt.verify(token, secret); //the secret is the key to unencrypting the token
        //verify decodes token, return an object with {userId: id, iat:3841983749}
    if (decodedToken) {
        //1. first we wanna make sure decodedToken exists aka notNull
        const userData = await User.findByPk(decodedToken.userId); //we query the database
            //2. similarly, we want to make sure userData exists aka notNull 
        if(userData){
                //3. and if it does, return it
            return userData;                
        }
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> { 
  const user = await User.findOne({
    where: {
      username,
      password
    }
  });
  if(user){
     const token = await jwt.sign({userId : user.id}, secret); //generates a token khfsdfk.afafd.adfdf
     return token;

  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};