// const express = require("express");
// const path = require("path");
// const session = require("express-session");
// const connectDB = require("./config/db");
// const Product = require("./models/Product");
// const DailySale = require("./models/DailySale");
// const DailyPurchase = require("./models/DailyPurchase");
// const User = require("./models/User");
// const bcrypt = require("bcrypt");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT;

// app.use(cors());
// app.use(express.urlencoded({ extended: true }));

// // Middleware for session management
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "ABDULRAFAY", // Use a secure secret
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // Set to true if using HTTPS
//   })
// );

// // Set views and view engine
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// // Connect to the database
// connectDB();

// // Authentication middleware
// function isAuthenticated(req, res, next) {
//   if (req.session.userId) {
//     return next(); // User is authenticated
//   }
//   res.redirect("/login"); // Redirect to login page if not authenticated
// }

// // Public routes
// app.get("/login", (req, res) => {
//   res.render("login", { error: null });
// });

// // Handle login
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   console.log(username, password);
//   try {
//     const singleUser = await User.findOne({ username });
//     if (!singleUser) {
//       return res.render("login", { error: "Invalid username" });
//     }
//     const isMatch = await bcrypt.compare(password, singleUser.password);
//     if (!isMatch) {
//       return res.render("login", { error: "Invalid password" });
//     }
//     req.session.userId = singleUser.username; // Store in session
//     res.redirect("/"); // Redirect to home
//   } catch (error) {
//     console.error(error);
//     res.render("login", { error: "Error logging in." });
//   }
// });

// // Protected routes
// app.use(isAuthenticated); // Apply to all routes after this point

// app.get("/", async (req, res) => {
//   try {
//     const totalProducts = await Product.countDocuments();

//     // Fetch today's sales
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Normalize to midnight

//     const todaysSales = await DailySale.findOne({ date: today });
//     const todaysPurchases = await DailyPurchase.findOne({ date: today });

//     res.render("Home", {
//       totalProducts,
//       todaysSales: todaysSales ? todaysSales.totalSales : 0,
//       todaysPurchases: todaysPurchases ? todaysPurchases.totalPurchases : 0,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching data.");
//   }
// });

// app.get("/inventory", async (req, res) => {
//   const searchQuery = req.query.search || "";

//   try {
//     const filteredProducts = await Product.find({
//       barcode: { $regex: searchQuery, $options: "i" }, // Case-insensitive search
//     });

//     res.render("Inventory", { product_list: filteredProducts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching inventory.");
//   }
// });

// // Add Product Page
// app.get("/addProduct", (req, res) => {
//   res.render("addProduct");
// });

// // Handle Add Product Form Submission
// app.post("/add-product", async (req, res) => {
//   const newProduct = new Product({
//     name: req.body.name,
//     description: req.body.description,
//     barcode: req.body.barcode,
//     price: parseFloat(req.body.price),
//     quantity: parseInt(req.body.quantity),
//     category: req.body.category,
//   });

//   try {
//     await newProduct.save(); // Save the new product to the database
//     res.redirect("/inventory"); // Redirect to the inventory page
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error adding product.");
//   }
// });

// // Get Product for Editing
// app.get("/editProduct/:barcode", async (req, res) => {
//   const barcode = req.params.barcode;

//   try {
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     res.render("editProduct", { product }); // Pass the product to the view
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching product.");
//   }
// });

// // Handle Edit Product Form Submission
// app.post("/editProduct/:barcode", async (req, res) => {
//   const barcode = req.params.barcode;

//   try {
//     // Find the product by barcode
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     // Update product details
//     product.name = req.body.name;
//     product.description = req.body.description;
//     product.barcode = req.body.barcode;
//     product.price = parseFloat(req.body.price);
//     product.quantity = parseInt(req.body.quantity);
//     product.category = req.body.category;

//     // Save the updated product to the database
//     await product.save();

//     res.redirect("/inventory"); // Redirect to the inventory page
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error updating product.");
//   }
// });

// // Add Purchase
// app.post("/add-Purchase", async (req, res) => {
//   const { barcode, quantity } = req.body;

//   if (!barcode || !quantity) {
//     return res.status(400).send("Barcode and quantity are required.");
//   }

//   const quantityNum = parseInt(quantity, 10);

//   try {
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found.");
//     }

//     // Update product quantity
//     product.quantity += quantityNum;
//     await product.save();

//     // Create a new purchase record
//     const purchaseRecord = new DailyPurchase({
//       date: new Date(),
//       barcode,
//       quantity: quantityNum,
//       productName: product.name,
//     });

//     await purchaseRecord.save(); // Save the purchase record

//     // Update daily purchases
//     const today = new Date().setHours(0, 0, 0, 0); // Normalize to midnight
//     let dailyPurchase = await DailyPurchase.findOne({ date: today });

//     if (!dailyPurchase) {
//       dailyPurchase = new DailyPurchase({
//         date: today,
//         totalPurchases: 0,
//         purchases: [],
//       });
//     }

//     dailyPurchase.totalPurchases += quantityNum;
//     dailyPurchase.purchases.push({
//       barcode,
//       quantity: quantityNum,
//       productName: product.name,
//     });
//     await dailyPurchase.save();

//     console.log(`Purchase recorded: ${quantityNum} of ${product.name}`);
//     res.redirect("/inventory");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error processing purchase.");
//   }
// });

// app.get("/addSale", (req, res) => {
//   res.render("addSale");
// });
// // Get Product by Barcode
// app.get("/get-product/:barcode", async (req, res) => {
//   const barcode = req.params.barcode;

//   try {
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Return product details
//     res.json({
//       name: product.name,
//       quantity: product.quantity,
//       price: product.price,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching product" });
//   }
// });

// // Handle Add Sale Form Submission
// app.post("/addSale", async (req, res) => {
//   const { barcode, quantity } = req.body;

//   if (!barcode || !quantity) {
//     return res.status(400).send("Barcode and quantity are required.");
//   }

//   const quantityNum = parseInt(quantity, 10);

//   try {
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found.");
//     }

//     // Ensure there is enough stock for the sale
//     if (product.quantity < quantityNum) {
//       return res.status(400).send("Not enough stock for the sale.");
//     }

//     // Update product quantity
//     product.quantity -= quantityNum; // Decrease the product quantity
//     await product.save();

//     // Get today's date (without time)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set time to midnight

//     // Check for an existing DailySale record for today
//     let dailySale = await DailySale.findOne({ date: today });

//     if (!dailySale) {
//       // Create a new daily sale record if it doesn't exist
//       dailySale = new DailySale({
//         date: today,
//         totalSales: quantityNum,
//         sales: [
//           {
//             barcode,
//             quantity: quantityNum,
//             productName: product.name,
//           },
//         ],
//       });
//     } else {
//       // Update the existing daily sale record
//       dailySale.totalSales += quantityNum; // Increment total sales
//       dailySale.sales.push({
//         barcode,
//         quantity: quantityNum,
//         productName: product.name,
//       });
//     }

//     await dailySale.save(); // Save the daily sale record

//     console.log(`Sale recorded: ${quantityNum} of ${product.name}`);
//     res.redirect("/view-sales"); // Redirect to the daily sales page
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error processing sale.");
//   }
// });

// // Add Purchase Page
// app.get("/addPurchase", (req, res) => {
//   res.render("addPurchase");
// });
// // Handle Add Purchase Form Submission
// app.post("/addPurchase", async (req, res) => {
//   const { barcode, quantity } = req.body;

//   if (!barcode || !quantity) {
//     return res.status(400).send("Barcode and quantity are required.");
//   }

//   const quantityNum = parseInt(quantity, 10);

//   try {
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found.");
//     }

//     // Update product quantity
//     product.quantity += quantityNum;
//     await product.save();

//     // Create a new purchase record
//     const purchaseRecord = new DailyPurchase({
//       date: new Date(),
//       barcode,
//       quantity: quantityNum,
//       productName: product.name,
//     });

//     await purchaseRecord.save(); // Save the purchase record

//     // Optionally, update daily purchases (if you have that logic)
//     const today = new Date().setHours(0, 0, 0, 0); // Normalize to midnight
//     let dailyPurchase = await DailyPurchase.findOne({ date: today });

//     if (!dailyPurchase) {
//       dailyPurchase = new DailyPurchase({
//         date: today,
//         totalPurchases: 0,
//         purchases: [],
//       });
//     }

//     dailyPurchase.totalPurchases += quantityNum;
//     dailyPurchase.purchases.push({
//       barcode,
//       quantity: quantityNum,
//       productName: product.name,
//     });
//     await dailyPurchase.save();

//     console.log(`Purchase recorded: ${quantityNum} of ${product.name}`);
//     res.redirect("/inventory"); // Redirect to the inventory page
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error processing purchase.");
//   }
// });
// // View Daily Sales
// app.get("/view-sales", async (req, res) => {
//   try {
//     const sales = await DailySale.find();
//     console.log(sales);
//     res.render("dailySale", { sales: sales });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // View Daily Purchases
// app.get("/dailyPurchase", async (req, res) => {
//   try {
//     const purchase = await DailyPurchase.find();
//     console.log(purchase);
//     res.render("dailyPurchase", { purchases: purchase });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get Product for Deletion Confirmation
// app.get("/deleteProduct/:barcode", async (req, res) => {
//   const barcode = req.params.barcode;

//   try {
//     const product = await Product.findOne({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     res.render("deleteProduct", { product }); // Pass the product to the view
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching product.");
//   }
// });

// // Handle Product Deletion
// app.post("/deleteProduct/:barcode", async (req, res) => {
//   const barcode = req.params.barcode;

//   try {
//     const product = await Product.findOneAndDelete({ barcode });

//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     console.log(`Product deleted: ${product.name}`);
//     res.redirect("/inventory"); // Redirect to the inventory page
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error deleting product.");
//   }
// });

// app.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).send("Error logging out.");
//     }
//     res.redirect("/login"); // Redirect to login page after logout
//   });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log("Server started at http://localhost:5000");
// });

const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const DailySale = require("./models/DailySale");
const DailyPurchase = require("./models/DailyPurchase");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Middleware for session management
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

app.use(
  session({
    secret: process.env.SESSION_SECRET || "ABDULRAFAY", // Use a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: SESSION_DURATION }, // Set maxAge for the session cookie
  })
);

// Set views and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Connect to the database
connectDB();

// Authentication middleware
function isAuthenticated(req, res, next) {
  console.log("Session:", req.session); // Log session data for debugging
  if (req.session.userId) {
    return next(); // User is authenticated
  }
  res.redirect("/login"); // Redirect to login page if not authenticated
}

// Public routes
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Handle login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const singleUser = await User.findOne({ username });
    if (!singleUser) {
      return res.render("login", { error: "Invalid username" });
    }
    const isMatch = await bcrypt.compare(password, singleUser.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid password" });
    }
    req.session.userId = singleUser.username; // Store in session
    res.redirect("/"); // Redirect to home
  } catch (error) {
    console.error(error);
    res.render("login", { error: "Error logging in." });
  }
});

// Protected routes
app.use(isAuthenticated); // Apply to all routes after this point

app.get("/", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    // Fetch today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    const todaysSales = await DailySale.findOne({ date: today });
    const todaysPurchases = await DailyPurchase.findOne({ date: today });

    res.render("Home", {
      totalProducts,
      todaysSales: todaysSales ? todaysSales.totalSales : 0,
      todaysPurchases: todaysPurchases ? todaysPurchases.totalPurchases : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data.");
  }
});

app.get("/inventory", async (req, res) => {
  const searchQuery = req.query.search || "";

  try {
    const filteredProducts = await Product.find({
      barcode: { $regex: searchQuery, $options: "i" }, // Case-insensitive search
    });

    res.render("Inventory", { product_list: filteredProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching inventory.");
  }
});

// Add Product Page
app.get("/addProduct", (req, res) => {
  res.render("addProduct");
});

// Handle Add Product Form Submission
app.post("/add-product", async (req, res) => {
  const newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    barcode: req.body.barcode,
    price: parseFloat(req.body.price),
    quantity: parseInt(req.body.quantity),
    category: req.body.category,
  });

  try {
    await newProduct.save(); // Save the new product to the database
    res.redirect("/inventory"); // Redirect to the inventory page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding product.");
  }
});

// Get Product for Editing
app.get("/editProduct/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("editProduct", { product }); // Pass the product to the view
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching product.");
  }
});

// Handle Edit Product Form Submission
app.post("/editProduct/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    // Find the product by barcode
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Update product details
    product.name = req.body.name;
    product.description = req.body.description;
    product.barcode = req.body.barcode;
    product.price = parseFloat(req.body.price);
    product.quantity = parseInt(req.body.quantity);
    product.category = req.body.category;

    // Save the updated product to the database
    await product.save();

    res.redirect("/inventory"); // Redirect to the inventory page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating product.");
  }
});

// Add Purchase
app.post("/add-Purchase", async (req, res) => {
  const { barcode, quantity } = req.body;

  if (!barcode || !quantity) {
    return res.status(400).send("Barcode and quantity are required.");
  }

  const quantityNum = parseInt(quantity, 10);

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Update product quantity
    product.quantity += quantityNum;
    await product.save();

    // Create a new purchase record
    const purchaseRecord = new DailyPurchase({
      date: new Date(),
      barcode,
      quantity: quantityNum,
      productName: product.name,
    });

    await purchaseRecord.save(); // Save the purchase record

    // Update daily purchases
    const today = new Date().setHours(0, 0, 0, 0); // Normalize to midnight
    let dailyPurchase = await DailyPurchase.findOne({ date: today });

    if (!dailyPurchase) {
      dailyPurchase = new DailyPurchase({
        date: today,
        totalPurchases: 0,
        purchases: [],
      });
    }

    dailyPurchase.totalPurchases += quantityNum;
    dailyPurchase.purchases.push({
      barcode,
      quantity: quantityNum,
      productName: product.name,
    });
    await dailyPurchase.save();

    console.log(`Purchase recorded: ${quantityNum} of ${product.name}`);
    res.redirect("/inventory");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing purchase.");
  }
});

app.get("/addSale", (req, res) => {
  res.render("addSale");
});
// Get Product by Barcode
app.get("/get-product/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return product details
    res.json({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Handle Add Sale Form Submission
app.post("/addSale", async (req, res) => {
  const { barcode, quantity } = req.body;

  if (!barcode || !quantity) {
    return res.status(400).send("Barcode and quantity are required.");
  }

  const quantityNum = parseInt(quantity, 10);

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Ensure there is enough stock for the sale
    if (product.quantity < quantityNum) {
      return res.status(400).send("Not enough stock for the sale.");
    }

    // Update product quantity
    product.quantity -= quantityNum; // Decrease the product quantity
    await product.save();

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight

    // Check for an existing DailySale record for today
    let dailySale = await DailySale.findOne({ date: today });

    if (!dailySale) {
      // Create a new daily sale record if it doesn't exist
      dailySale = new DailySale({
        date: today,
        totalSales: quantityNum,
        sales: [
          {
            barcode,
            quantity: quantityNum,
            productName: product.name,
          },
        ],
      });
    } else {
      // Update the existing daily sale record
      dailySale.totalSales += quantityNum; // Increment total sales
      dailySale.sales.push({
        barcode,
        quantity: quantityNum,
        productName: product.name,
      });
    }

    await dailySale.save(); // Save the daily sale record

    console.log(`Sale recorded: ${quantityNum} of ${product.name}`);
    res.redirect("/view-sales"); // Redirect to the daily sales page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing sale.");
  }
});

// Add Purchase Page
app.get("/addPurchase", (req, res) => {
  res.render("addPurchase");
});
// Handle Add Purchase Form Submission
app.post("/addPurchase", async (req, res) => {
  const { barcode, quantity } = req.body;

  if (!barcode || !quantity) {
    return res.status(400).send("Barcode and quantity are required.");
  }

  const quantityNum = parseInt(quantity, 10);

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Update product quantity
    product.quantity += quantityNum;
    await product.save();

    // Create a new purchase record
    const purchaseRecord = new DailyPurchase({
      date: new Date(),
      barcode,
      quantity: quantityNum,
      productName: product.name,
    });

    await purchaseRecord.save(); // Save the purchase record

    // Optionally, update daily purchases (if you have that logic)
    const today = new Date().setHours(0, 0, 0, 0); // Normalize to midnight
    let dailyPurchase = await DailyPurchase.findOne({ date: today });

    if (!dailyPurchase) {
      dailyPurchase = new DailyPurchase({
        date: today,
        totalPurchases: 0,
        purchases: [],
      });
    }

    dailyPurchase.totalPurchases += quantityNum;
    dailyPurchase.purchases.push({
      barcode,
      quantity: quantityNum,
      productName: product.name,
    });
    await dailyPurchase.save();

    console.log(`Purchase recorded: ${quantityNum} of ${product.name}`);
    res.redirect("/inventory"); // Redirect to the inventory page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing purchase.");
  }
});
// View Daily Sales
app.get("/view-sales", async (req, res) => {
  try {
    const sales = await DailySale.find();
    console.log(sales);
    res.render("dailySale", { sales: sales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View Daily Purchases
app.get("/dailyPurchase", async (req, res) => {
  try {
    const purchase = await DailyPurchase.find();
    console.log(purchase);
    res.render("dailyPurchase", { purchases: purchase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Product for Deletion Confirmation
app.get("/deleteProduct/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("deleteProduct", { product }); // Pass the product to the view
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching product.");
  }
});

// Handle Product Deletion
app.post("/deleteProduct/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    const product = await Product.findOneAndDelete({ barcode });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    console.log(`Product deleted: ${product.name}`);
    res.redirect("/inventory"); // Redirect to the inventory page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting product.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out.");
    }
    res.redirect("/login"); // Redirect to login page after logout
  });
});

// Start the server
app.listen(PORT, () => {
  console.log("Server started at http://localhost:5000");
});
