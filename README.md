# Accounting API with Express JS

## Overview

The Accounting API provides a set of endpoints for managing user authentication, retrieving account balances, and transferring balances between users. This API uses JSON format for both requests and responses and requires specific headers for authentication.


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
