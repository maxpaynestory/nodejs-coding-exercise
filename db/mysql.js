const mysql = require("promise-mysql");

const env = process.env;

const getDbConnection = async () => {
  if (process.env.NODE_ENV === "test") {
    return {
      query(sql, params){
        return {};
      }
    }
  } else {
    return await mysql.createConnection({
      host: env.MYSQL_DB_HOST,
      user: env.MYSQL_DB_USER,
      password: env.MYSQL_DB_PASSWORD,
      database: env.MYSQL_DB_NAME,
    });
  }
};

const query = async (sql, params) => {
  const db = await getDbConnection();
  const data = await db.query(sql, params);
  await db.end();
  return data;
};

module.exports = {
  query,
};
