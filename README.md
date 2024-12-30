# ONS (Own Notification Service)

## How to run
1. Open this project in **VSCode** as a **devcontainer**
2. Type `bun dev` in the terminal
3. Go to `services/client`, select `index.html` and hit `Go live` in the bottom bar of your **VSCode** window, a browser with the selected page should open automatically

## How to operate
There are two pages in the `services/client` folder, `index.html` is for reading the comments, and `send.html` is for sending new comments

## How this works
This devcontainer has a **RabbitMQ** instance, the gateway, the api, and the client folders. So, all requests coming from the client are processed on the gateway. It will send some of then to the api without any modificatons. The most intresting is the `/live` endpoint which handles all pub/sub logic. A subscriber(consumer) along with a queue is created for each user of the client(every single browser tab is a user in this context). When the user has diconnected, the gateway service deletes the subscriber and the queue. THE CURRENT IMPLEMENTATION IS NOT VERY EFFICIENT. The user can insert a new record into the database(an in-memory **SQLite** is used in this project). When this insertion happens, a publisher in the api sends a message to the **RabbitMQ**, which has an exchange with the `fanout` type. So, the message is sent to all queues.