# Accounting API with Express JS

## Overview

The Accounting API provides a set of endpoints for managing user authentication, retrieving account balances, and transferring balances between users. This API uses JSON format for both requests and responses and requires specific headers for authentication.

## Scalability
We can use the transactions_list table to roll back transactions between users. This table contains details such as which user transferred how much to whom, along with a timestamp. To revert the balance for a user, we retrieve the last 10,000 records where user_id matches the user whose balance needs to be reverted. From these records, we combine those with the same to_user_id. Similarly, we extract records where to_user_id is the user’s ID. (In both queries, we ignore the user’s own transactions like deposits and withdrawals.)

The first set of records represents the transactions where the user has sent money, and the second set represents transactions where the user has received money. By merging these two sets, we can determine how much the user has sent to or received from other users over 10,000 transactions. We then adjust the balances: deduct the sent amounts from the receiving users’ accounts and restore the received amounts back to the sending users’ accounts. This process effectively reverses 10,000 transactions (excluding the user’s own deposit/withdrawal activities).

#### Managing 1 million requests,

* ##### Load Balancer

* * A load balancer is a solution that acts as a traffic proxy and distributes network or application traffic to endpoints across a set of servers.


* ##### Horizontal Scaling

* * Horizontal scaling is based on having multiple servers running in parallel, sharing incoming requests or workload. For example, in a web application:

	1.	Load Balancer: It is one of the key components of horizontal scaling. A load balancer distributes incoming requests to the available servers either equally or according to certain rules, ensuring each server operates with a balanced load.

	2.	Running Copies of the Application: For instance, if you are running a Node.js application, you can run copies of the same application on different ports or servers. This way, each server handles a portion of the requests.

   
* ##### Async Processing (Queue)

* * It is used to break down a high volume of incoming workloads into more manageable parts for background processing. This method allows you to separate tasks where the API server needs to respond immediately from those that require longer processing. This way, users do not have to wait for a long time, and the load on the server is reduced.

* *  Example Library: Bull/BullMQ: It is a high-performance, Redis-based queue library for Node.js. It has a very user-friendly API and takes advantage of Redis’s speed benefits.
   

Here, to avoid high initial costs, we can proceed with the Async Processing (Queue) method. Later, if the number of users and constant high request traffic increase, we can implement the Horizontal Scaling method.

You can start with the Async Processing (Queue) method by installing the following package and using a system like in the example below:

[🏗️ bullmq](https://www.npmjs.com/package/bullmq)


   ```bash
   npm install bullmq
   ```


```js
const { Queue, Worker } = require('bullmq');
const redisConfig = {
  connection: {
    host: 'localhost',
    port: 6379,
  },
};

const queue = new Queue('jobQueue', redisConfig);

queue.add('jobName', { data: 'Some data to process' });


const worker = new Worker('jobQueue', async job => {
  console.log(`Processing job: ${job.name}`);
}, redisConfig);

worker.on('completed', job => {
  console.log(`Job with ID ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job with ID ${job.id} failed with error ${err.message}`);
});
```
   
## Authentication

The API requires the following headers for authentication:

	•	Content-Type: application/json
	•	appname: [YOUR_DATABASE_NAME]
	•	token: Your API token
	•	userAuth: User authentication token (JWT)


### Examples for requests

./example-request.json

### Example Usage

[Watch Video](https://www.loom.com/share/3b0dbdf9bf1940309c8fc64540f1e38a?sid=0db8ca5d-adb2-49f8-8f56-8765054149f8)


### Example DB (Mysql)

##### Transactions List
![Alt text](./public/screenshots/transactions_list_db_view.png?raw=true "transactions_list_db_view")

##### User Balances
![Alt text](./public/screenshots/user_balances_db_view.png?raw=true "user_balances_db_view")

##### User Process
![Alt text](./public/screenshots/user_process_db_view.png?raw=true "user_process_db_view")


##### Users
![Alt text](./public/screenshots/users_db_view.png?raw=true "users_db_view")



### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/coderemre/accounting-api.git
   cd accounting-api
   ```

2. Create .env file:
  PORT=3638
  MYSQL_HOST=db
  MYSQL_PORT=33060
  TOKEN=[YOUR_TOKEN]
  SALT=[YOUR_SALT]
  MYSQL_ROOT_PASSWORD=localtest
  MYSQL_USER=myuser
  MYSQL_DATABASE=blotuscode
  MYSQL_PASSWORD=localtest
  MYSQL_DOCKER_PORT=3307
  MYSQL_X_DOCKER_PORT=33061


3. Docker:

   ```bash
   $ docker-compose down -v

   $ docker-compose up --build

   --------------------------------

   If you want to use the test database 

   $ docker cp blotuscode.dump my-mysql-db:/blotuscode.sql

   $ docker exec -it my-mysql-db bash

   $ mysql -u root -p blotuscode < /blotuscode.sql

   ```

![Alt text](./public/screenshots/docker_container.png?raw=true "docker_container")
![Alt text](./public/screenshots/api_container.png?raw=true "api_container")