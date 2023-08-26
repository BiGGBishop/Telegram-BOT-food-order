const fs = require('fs');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Replace with your actual Stripe secret key
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

// Command to finish the order and initiate payment
bot.onText(/\/finish/, async (msg) => {
  const chatId = msg.chat.id;
  const order = orders[chatId];

  if (order && order.length > 0) {
    try {
      // Calculate the total amount to charge (in cents)
      const totalAmount = calculateTotalAmount(order);

      // Create a payment intent using Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd', // Change to your desired currency
        description: 'Food Order Payment',
      });

      // Send a message to the user with a payment link
      const paymentLink = paymentIntent.charges.data[0].payment_method_details.url;
      bot.sendMessage(chatId, `Your order total: $${totalAmount / 100}\nClick the link to pay: ${paymentLink}`);
    } catch (error) {
      bot.sendMessage(chatId, 'An error occurred while processing your payment.');
    }
  } else {
    bot.sendMessage(chatId, 'Your order is empty.');
  }
});

// Calculate the total amount of the order
function calculateTotalAmount(order) {
  // Replace this with your logic to calculate the total amount based on the food items
  // For demonstration purposes, let's assume each item costs $5
  return order.length * 500; // $5 * 100 (to convert to cents)
}
