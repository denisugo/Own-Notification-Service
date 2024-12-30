import { type AsyncMessage, Connection } from "rabbitmq-client";
// Initialize:
const rabbit = new Connection("amqp://guest:guest@localhost:5672");
rabbit.on("error", (err) => {
	console.log("RabbitMQ connection error", err);
});
rabbit.on("connection", () => {
	console.log("Connection successfully (re)established");
});

export function createSubscriber(cb: (msg: AsyncMessage) => Promise<void>) {
	const subsciber = rabbit.createConsumer(
		{
			queue: `${crypto.randomUUID()}`,
			// queue: "user-events",
			queueOptions: { durable: false, autoDelete: true },
			// handle 2 messages at a time
			qos: { prefetchCount: 2 },
			// Optionally ensure an exchange exists
			exchanges: [{ exchange: "my-events", type: "fanout" }],
			// exchanges: [{ exchange: "my-events", type: "topic" }],
			// With a "topic" exchange, messages matching this pattern are routed to the queue
			queueBindings: [
				{ exchange: "my-events", routingKey: `users.${crypto.randomUUID()}` },
			],
			// queueBindings: [{ exchange: "my-events", routingKey: "users.*" }],
		},
		async (msg) => {
			console.log("received message (user-events)", msg);
			await cb(msg);
		},
	);
	subsciber.on("error", (err) => {
		// Maybe the consumer was cancelled, or the connection was reset before a
		// message could be acknowledged.
		console.log("consumer error (user-events)", err);
	});

	return subsciber;
}

// Clean up when you receive a shutdown signal
async function onShutdown() {
	await rabbit.close();
	console.log("connection successfully closed");
}

// TODO these callbacks are recommended,
// but currently they cause problems when ctrl + c is used in dev terminal.
// Maybe they should be enabled in prod env but not in dev
// process.on("SIGINT", onShutdown);
// process.on("SIGTERM", onShutdown);
