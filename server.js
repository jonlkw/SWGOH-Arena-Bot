const app = require('express')();
const { createLogger, format, transports } = require('winston');

app.get('/', (req, res) => res.send('Server is up.'));


let log_location = 'logs/arena-message.log';
// let log = fs.readFileSync(log_location, 'utf8');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'arena-bot' },
  transports: [
    new transports.File({ filename: 'logs/arena-message.log' })
  ]
});

const options = {
  File: log_location,
  order: 'asc',
  limit: 1e6,
  fields: ['timestamp', 'message']
};

logger.query(options, function (err, results) {
  if (err) {
    /* TODO: handle me */
    throw err;
  }

  let output = '';
  results.file.forEach((array, index) => {
    output += `<div>${index}. [${array.timestamp}] ${array.message}</div>`;
  });

  app.get('/logs/arena-message.log', (req, res) => res.send(output));

});

module.exports = () => {
  app.listen(3000);
}