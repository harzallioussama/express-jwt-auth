const connection = require("../database/db");

class userModel {
  constructor() {
    this.users = "users";
  }
  async findAll() {
    const [row] = await connection.query("select * from users");
    console.log(row);
    return row;
  }
  async findById(id) {
    // const id = 9 ;
    const [row] = await connection.query("select * from users where id = ? ", [
      id,
    ]);
    // console.log(row) ;
    return row;
  }
  async findByEmail(email) {
    const [row] = await connection.query(
      `select * from users where email = ?`,
      [email]
    );
    return row;
  }
  async createUser(email, pwd) {
    const date = new Date();
    const d = date.toISOString().split("T")[0];
    const query = await connection.query(
      "insert into users(email , password , createdAt , updatedAt) values(? , ? , ? ,?)",
      [email, pwd, d, d]
    );
    return "success";
  }
  async createPasswordResetToken(id, hash) {
    const date = Date.now() + 10 * 60 * 1500;
    const query = await connection.query(
      "update users set passwordResetToken = ? , passwordExpiresToken = ? where id = ?",
      [hash, date, id]
    );
  }
  async findByToken(token) {
    const date = Date.now();
    const [row] = await connection.query(
      `select id from users where passwordResetToken = ? and ${date} <= passwordExpiresToken`,
      [token]
    );
    if (row.length != 0) return row[0].id;
    return null;
  }
  async updateUserPassword(id, password) {
    const query = await connection.query(
      "update users set password = ? where id = ?",
      [password, id]
    );
    // console.log("success");
    return "success";
  }
}

module.exports = new userModel();
