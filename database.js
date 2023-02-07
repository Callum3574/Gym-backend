const pg = require("pg");

const client = new pg.Client({
  host: "manny.db.elephantsql.com",
  port: 5432,
  database: "rzjuybnz",
  user: "rzjuybnz",
  password: "bNmswk0bMot8z2JwRZ80xZRSNdAE_sdi",
});

client.connect();

module.exports = client;
