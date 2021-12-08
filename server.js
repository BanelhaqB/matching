// const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('name: ', err.name);
  console.log('message: ', err.message);
  console.log('UNCAUGHT EXCEPTION! 🛠 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const connect = async () => {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: 'ec2-108-128-198-48.eu-west-1.compute.amazonaws.com',
    user: 'u8v24o66mvn1sh',
    password:
      'p9d17b04b7eabdc37ca0e28bb27dc85880c915033a4c6189792b5205dfb0ef011',
    database: 'd5ujoq165lf7or',
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  pool.connect();

  global['pool'] = pool;

  return pool;
};

connect();

const app = require('./app');

// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
//   })
//   .then(() => console.log('DB connection successful!'));

//console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(1, err.name);
  console.log(2, err.message);
  console.log(2, err.stack);
  console.log('UNHANDLER REJECTION! 🔒 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
