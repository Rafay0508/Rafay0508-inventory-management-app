// models/DailySale.js
const mongoose = require("mongoose");

const dailySaleSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true }, // Unique date for daily sales
  totalSales: { type: Number, required: true, default: 0 }, // Total sales for the day
  sales: [
    {
      barcode: { type: String, required: true },
      quantity: { type: Number, required: true },
      productName: { type: String, required: true },
    },
  ],
});

const DailySale = mongoose.model("DailySale", dailySaleSchema);

module.exports = DailySale;
