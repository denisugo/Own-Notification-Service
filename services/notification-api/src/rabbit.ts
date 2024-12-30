import { Connection } from "rabbitmq-client";
// Initialize:
const rabbit = new Connection("amqp://guest:guest@localhost:5672");
rabbit.on("error", (err) => {
	console.log("RabbitMQ connection error", err);
});
rabbit.on("connection", () => {
	console.log("Connection successfully (re)established");
});

// Declare a publisher
// See API docs for all options
const publisher = rabbit.createPublisher({
	// Enable publish confirmations, similar to consumer acknowledgements
	confirm: true,
	// Enable retries
	maxAttempts: 2,
	// Optionally ensure the existence of an exchange before we use it
	exchanges: [{ exchange: "my-events", type: "fanout" }],
	// exchanges: [{ exchange: "my-events", type: "topic" }],
});

export async function publishNewComment(comment: object) {
	// await publisher.send("user-events", comment);
	// Publish a message to a custom exchange
	await publisher.send(
		{ exchange: "my-events" }, // metadata
		comment,
	); // message content
}

// Clean up when you receive a shutdown signal
async function onShutdown() {
	// Waits for pending confirmations and closes the underlying Channel
	await publisher.close();
	await rabbit.close();
	console.log("connection successfully closed");
}

// TODO these callbacks are recommended,
// but currently they cause problems when ctrl + c is used in dev terminal.
// Maybe they should be enabled in prod env but not in dev
// process.on("SIGINT", onShutdown);
// process.on("SIGTERM", onShutdown);
