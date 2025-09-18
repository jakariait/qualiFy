require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const inquirer = require('inquirer');
const User = require('./models/UserModel');
const Order = require('./models/OrderModel');
const OrderCounter = require('./models/OrderCounterModel');
const Product = require('./models/ProductModel');
const Shipping = require('./models/ShippingModel');
const FreeDeliveryAmount = require('./models/FreeDeliveryAmount');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Dev login function
async function devLogin(email) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Dev login only allowed in development!");
  }
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  console.log(`✅ Dev login as ${user.email}`);
  return user;
}

// Add single order function
async function addOrder(user) {
  // Add items
  const items = [];
  let addMore = true;
  let subtotalAmount = 0;

  while (addMore) {
    const itemAnswers = await inquirer.prompt([
      { name: "productId", message: "Product ID:" },
      { name: "quantity", message: "Quantity:", default: 1, validate: value => !isNaN(value) },
    ]);

    const product = await Product.findById(itemAnswers.productId);
    if (!product) {
        console.log("Product not found!");
        continue;
    }

    const price = product.finalDiscount > 0 ? product.finalDiscount : product.finalPrice;
    const quantity = Number(itemAnswers.quantity);

    items.push({
      productId: itemAnswers.productId,
      quantity: quantity,
      price: price,
    });

    subtotalAmount += quantity * price;

    const { more } = await inquirer.prompt([
      { type: "confirm", name: "more", message: "Add another product?", default: false }
    ]);

    addMore = more;
  }

  const { shippingId } = await inquirer.prompt([
      { name: "shippingId", message: "Shipping ID:" },
  ]);

  let deliveryCharge = 0;
  if (shippingId) {
      const shippingMethod = await Shipping.findById(shippingId);
      if (!shippingMethod) {
          console.log("Invalid shipping method ID!");
      } else {
          const freeDelivery = await FreeDeliveryAmount.findOne().sort({ createdAt: -1 });
          const freeDeliveryThreshold = freeDelivery ? freeDelivery.value : 0;

          if (freeDeliveryThreshold > 0) {
              deliveryCharge = subtotalAmount >= freeDeliveryThreshold ? 0 : shippingMethod.value;
          } else {
              deliveryCharge = shippingMethod.value;
          }
      }
  }

  const totalAmount = subtotalAmount + deliveryCharge;

  // Increment order number
  const counter = await OrderCounter.findOneAndUpdate(
    { id: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const orderNo = String(counter.seq).padStart(6, "0");

  const order = new Order({
    orderNo: orderNo,
    userId: user._id,
    shippingInfo: {
        fullName: user.fullName,
        mobileNo: user.phone,
        email: user.email,
        address: user.address,
    },
    items,
    shippingId: shippingId || null,
    deliveryCharge: deliveryCharge,
    subtotalAmount: subtotalAmount,
    totalAmount: totalAmount,
    orderStatus: "pending",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "unpaid",
  });

  await order.save();
  console.log(`✅ Order created (#${order.orderNo}) for ${user.email}`);
}

// Main interactive loop
async function main() {
  try {
    const { email } = await inquirer.prompt([
      { name: "email", message: "Enter user email to log in (dev only):" }
    ]);

    const user = await devLogin(email);

    let addAnother = true;

    while (addAnother) {
      await addOrder(user);
      const response = await inquirer.prompt([
        { type: "confirm", name: "more", message: "Add another order?", default: false }
      ]);
      addAnother = response.more;
    }

    console.log("All orders added!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();