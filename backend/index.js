require("dotenv").config();
const app = require("./app");

// Initialize exam timeout service
const examTimeoutService = require("./services/examTimeoutService");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log("✅ Exam timeout service initialized");
});
