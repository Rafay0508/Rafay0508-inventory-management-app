// models/DailyPurchase.js
const mongoose = require("mongoose");

const dailyPurchaseSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true }, // Unique date for daily purchases
  totalPurchases: { type: Number, required: true, default: 0 }, // Total purchases for the day
  purchases: [
    {
      barcode: { type: String, required: true },
      quantity: { type: Number, required: true },
      productName: { type: String, required: true },
    },
  ],
});

const DailyPurchase = mongoose.model("DailyPurchase", dailyPurchaseSchema);

module.exports = DailyPurchase;
