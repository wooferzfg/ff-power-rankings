In order to run the application:

1. Run npm install in the root directory and in the power-rankings directory.
2. Download ngrok and forward port 5000 with "./ngrok http 5000"
3. Create a Yahoo App at https://developer.yahoo.com/apps/create, setting the the redirect URL to the ngrok URL and only asking for Fantasy Sports Read permissions.
4. Fill in tokens.js with the tokens from Yahoo and the ngrok URL.
5. Run "node server.js" in the root directory to start the backend server.
6. Run "npm start" in the power-rankings directory to start the frontend server.