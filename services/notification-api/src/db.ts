import { Database } from "bun:sqlite";

const db = new Database(":memory:");

export function initialiseDb() {
	db.run(`CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT NOT NULL UNIQUE
        )`);
	db.run("INSERT INTO user(username) VALUES (?)", ["dorian"]);
	db.run("INSERT INTO user(username) VALUES (?)", ["master"]);
	const userQuery = db.query("SELECT * FROM user;");
	console.log(userQuery.all());

	db.run(`
		CREATE TABLE comment (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        userId INTEGER NOT NULL,
        text TEXT,
        FOREIGN KEY(userId) REFERENCES user(id)
        )`);

	db.run("INSERT INTO comment(userId, text) VALUES (?, ?)", [
		1,
		"I think I'm right!",
	]);
	const commentQuery = db.query("SELECT * FROM comment;");
	console.log(commentQuery.all());
}

export function getUserById(id: number) {
	const query = db.query("SELECT username FROM user WHERE id = ?;");
	return query.get(id);
}

export function getAllcomments() {
	const query = db.query("SELECT * FROM comment;");
	return query.all();
}

export function saveComment(userId: number, text: string) {
	const query = db.query(
		"INSERT INTO comment(userId, text) VALUES (?, ?) RETURNING *",
	);
	return query.get(userId, text);
}
