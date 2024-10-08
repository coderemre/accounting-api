# Accounting API with Express JS

## Overview

The Accounting API provides a set of endpoints for managing user authentication, retrieving account balances, and transferring balances between users. This API uses JSON format for both requests and responses and requires specific headers for authentication.

## Scalability
We can use the transactions_list table to roll back transactions between users. This table contains details such as which user transferred how much to whom, along with a timestamp. To revert the balance for a user, we retrieve the last 10,000 records where user_id matches the user whose balance needs to be reverted. From these records, we combine those with the same to_user_id. Similarly, we extract records where to_user_id is the user’s ID. (In both queries, we ignore the user’s own transactions like deposits and withdrawals.)

The first set of records represents the transactions where the user has sent money, and the second set represents transactions where the user has received money. By merging these two sets, we can determine how much the user has sent to or received from other users over 10,000 transactions. We then adjust the balances: deduct the sent amounts from the receiving users’ accounts and restore the received amounts back to the sending users’ accounts. This process effectively reverses 10,000 transactions (excluding the user’s own deposit/withdrawal activities).

#### Managing 1 million requests,

* Load Balancer

A load balancer is a solution that acts as a traffic proxy and distributes network or application traffic to endpoints across a set of servers.

* Horizontal Scaling

Yatay ölçekleme (diğer adıyla ölçekleme), yeni taleplerle başa çıkmak için altyapınıza ek düğümler veya makineler eklemeyi ifade eder.

Yük dengeleyiciyide ki fikir gibi uygulamanın gerektiğinde birden fazla makinede çalışması için bu yöntemi kullanabiliriz.

   
* Asenkron işlem kuyruğu (Queue)

Yüksek miktarda gelen iş yükünü daha yönetilebilir parçalara ayırarak arka planda işlemek için kullanılır. Bu yöntem, API sunucusunun hemen yanıt vermesi gereken durumlarla uzun süren işlemleri ayırmanı sağlar. Böylece kullanıcı, uzun süre beklemek zorunda kalmaz ve sunucu üzerindeki yük azalır.

##### Example Library:
Bull/BullMQ: Redis tabanlı, yüksek performanslı bir Node.js kuyruk kütüphanesidir. Çok kullanışlı bir API’si vardır ve Redis’in hız avantajlarından yararlanır.
   

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

2. Pack. Install:

   ```bash
   yarn

   or

   npm install
   ```

3. Create .env file:

   JWT_KEY=[YOUR_JWT_KEY]
   TOKEN=[YOUR_TOKEN]
   SALT=[YOUR_SALT]
   PORT=3638
   DB_HOST=127.0.0.1
   DB_USER=[YOUR_DB_USERNAME]
   DB_PASSWORD=[YOUR_DB_PASSWORD]
   DB_PORT=33060

4. Run:

   ```bash
   yarn dev

   or

   npm run dev
   ```
