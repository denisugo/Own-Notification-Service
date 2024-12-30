import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import type { Consumer } from "rabbitmq-client";
import { createSubscriber } from "./rabbit";

export default (() => {
	const app = new Hono();

	app.use(
		"*",
		cors({
			origin: "*",
		}),
	);

	app.get("/", (c) => {
		return c.text("Hello Hono!");
	});

	// app.get("/users/:id", (c) => {
	// 	const id = c.req.param("id");
	// 	return c.json(getUserById(Number(id)) as object);
	// });

	app.get("/comments", async (c) => {
		// const response = await fetch("http://localhost:4444/comments");
		// const body = await response.json();
		// return c.json(body);
		return fetch("http://localhost:4444/comments");
	});

	app.post("/comments", async (c) => {
		return fetch("http://localhost:4444/comments", {
			method: c.req.raw.method,
			body: await c.req.formData(), // TODO try to proxify this endpoint
		});
	});

	app.get("/live", (c) => {
		return streamSSE(c, async (stream) => {
			const subscriber = createSubscriber(async (msg) => {
				await stream.writeSSE({
					data: JSON.stringify(msg.body),
					event: "time-update",
					id: crypto.randomUUID(),
				});
			});

			c.set("subscriber", subscriber);

			await stream.writeSSE({
				data: "Subscriber created",
				event: "time-update",
				id: "1",
			});

			while (!stream.aborted && !stream.closed) {
				await stream.sleep(200);
				// console.log("update");
			}
			console.log("stream ended");
			await subscriber.close();
		});
	});

	return app;
})();

declare module "hono" {
	interface ContextVariableMap {
		subscriber: Consumer;
	}
}
