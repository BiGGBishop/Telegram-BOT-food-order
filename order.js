const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('YOUR_BOT_TOKEN', { polling: true });

const orders = {}; // In-memory storage for orders
const foodData = JSON.parse(fs.readFileSync('food_data.json', 'utf-8'));

// Command to start the order process
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the Food Ordering Bot! What would you like to order?');
  orders[chatId] = [];
  sendFoodMenu(chatId);
});

// Function to send the food menu
function sendFoodMenu(chatId) {
  foodData.forEach((foodItem) => {
    const caption = `${foodItem.name}\n${foodItem.description}\nPrice: ${foodItem.price}`;
    bot.sendPhoto(chatId, foodItem.image, { caption: caption });
  });
}

// Handle user messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const order = orders[chatId];
  
  if (order) {
    // Assuming the user enters the order as plain text
    order.push(msg.text);
    bot.sendMessage(chatId, 'Added to your order: ' + msg.text);
  } else {
    bot.sendMessage(chatId, 'Please start your order using /start command.');
  }
});

// Command to finish the order and display the order summary
bot.onText(/\/finish/, (msg) => {
  const chatId = msg.chat.id;
  const order = orders[chatId];
  
  if (order && order.length > 0) {
    bot.sendMessage(chatId, 'Thank you for your order! Here is your order summary:\n' + order.join('\n'));
    delete orders[chatId];
  } else {
    bot.sendMessage(chatId, 'Your order is empty.');
  }
});
