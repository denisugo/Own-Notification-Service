import { Hono } from "hono";
import { getAllcomments, getUserById, initialiseDb, saveComment } from "./db";
import { publishNewComment } from "./rabbit";

export default (() => {
	initialiseDb();

	const app = new Hono();

	app.get("/", (c) => {
		return c.text("Hello Hono!");
	});

	app.get("/users/:id", (c) => {
		const id = c.req.param("id");
		return c.json(getUserById(Number(id)) as object);
	});

	app.get("/comments", (c) => {
		return c.json(getAllcomments());
	});

	app.post("/comments", async (c) => {
		const { userId, text } = await c.req.parseBody();
		const comment = saveComment(Number(userId), String(text)) as object;
		await publishNewComment(comment);
		return c.json(comment);
	});

	return app;
})();
