const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const Cart = require("../models/cart.js");
const Order = require("../models/order.js");
const Product = require("../models/product.js");
const Review = require("../models/review.js");
const mongoose = require("mongoose");
const Seller = require("../models/seller.js");
const asyncHandler = require("express-async-handler");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

const userLogin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(req.body.email);
  if (
    !user ||
    (req.body.isSeller && user.role !== "seller") ||
    (user.role === "seller" && !req.body.isSeller)
  ) {
    res.status(400).json({ error: "Email not registered" });
  } else {
    try {
      const result = await user.matchPassword(req.body.password);
      if (result) {
        const token = generateToken(user._id);
        if (req.body.favouriteItems) {
          for (const item of req.body.favouriteItems) {
            if (
              !user.favourites.some((i) => i.toString() === item.toString())
            ) {
              user.favourites.push(new mongoose.Types.ObjectId(item));
            }
          }
          await user.save();
        }
        if (req.body.basket) {
          const cart = await Cart.findOne({ user: user._id });
          for (const item of req.body.basket) {
            if (
              !cart.products.some(
                (i) => i.product.toString() === item.id.toString()
              )
            ) {
              cart.products.push({
                product: new mongoose.Types.ObjectId(item.id),
                quantity: item.quantity,
              });
            } else {
              const index = cart.products.findIndex(
                (obj) => obj.product.toString() === item.id.toString()
              );
              cart.products[index].quantity = item.quantity;
            }
            await cart.save();
          }
        }
        const response_user = {
          id: user.id,
          displayName: user.name,
          addresses: user.addresses,
          token: token,
          favouriteItems: user.favourites,
          email: user.email,
          phone: user.phone,
          paymentMethods: user.paymentMethods,
          currentAddress: user.currentAddress,
        };
        if (req.body.isSeller) {
          delete response_user.favouriteItems;
          delete response_user.paymentMethods;
          delete response_user.currentAddress;
          const seller = await Seller.findOne({ user: user._id });
          response_user.businessName = seller.businessName;
        }
        const cart = !req.body.isSeller
          ? await Cart.findOne({ user: user._id }).lean()
          : null;
        const basket = cart ? cart.products : [];
        for (let i = 0; i < basket.length; ++i) {
          basket[i].id = basket[i].product.toString();
          delete basket[i].product;
        }
        // console.log(basket)
        const orders = !req.body.isSeller
          ? await Order.find({ user: user._id })
          : [];
        // response_user.orders = orders;
        const frontendOrders = [];
        for (const order of orders) {
          const items = [];
          for (const item of order.cartItems) {
            items.push({
              id: item.product,
              quantity: item.quantity,
            });
          }
          frontendOrders.push({
            id: order.id,
            items: items,
            date: order.orderDate,
            total: order.orderAmount,
            shippingAddress: order.shippingAddress,
          });
        }
        if (req.body.isSeller) {
          const products = await Product.find({ seller: user._id }).lean();
          for (let i = 0; i < products.length; ++i) {
            products[i].id = products[i]._id.toString();
            delete products[i]._id;
          }
          res
            .status(200)
            .json({ success: true, user: response_user, products: products });
        } else {
          res.status(200).json({
            success: true,
            user: response_user,
            orders: frontendOrders,
            basket: basket,
          });
        }
      } else {
        res.status(401).json({ error: "Incorrect Password" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Error in signin" });
    }
  }
  console.log(req.body.email, req.body.password);
};

const userSignup = async (req, res) => {
  const users = await User.find({ email: req.body.email });
  if (users.length > 0) {
    res.status(400).json({ error: "Email already in use" });
  } else {
    try {
      const favourites = [];
      if (req.body.favouriteItems && !req.body.isSeller) {
        for (const item of req.body.favouriteItems) {
          if (!favourites.some((i) => i.toString() === item.toString())) {
            favourites.push(new mongoose.Types.ObjectId(item));
          }
        }
      }
      const productsInBasket = [];
      if (req.body.basket) {
        for (const item of req.body.basket) {
          productsInBasket.push({ product: item.id, quantity: item.quantity });
        }
      }
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        addresses: req.body.address ? [req.body.address] : [],
        favourites: favourites,
        role: req.body.isSeller ? "seller" : "buyer",
        currentAddress: req.body.isSeller ? 0 : -1,
      });
      if (req.body.isSeller) {
        await Seller.create({
          user: user._id,
          businessName: req.body.businessName,
        });
      }
      const basket = !req.body.isSeller
        ? await Cart.create({
            user: user._id,
            products: productsInBasket,
          })
        : [];
      const token = generateToken(user._id);
      const response_user = {
        id: user.id,
        displayName: user.name,
        addresses: user.addresses,
        token: token,
        favouriteItems: user.favourites,
        // orders: [],
        email: user.email,
        phone: user.phone,
        paymentMethods: user.paymentMethods,
        currentAddress: -1,
      };
      if (req.body.isSeller) {
        delete response_user.favouriteItems;
        delete response_user.currentAddress;
        delete response_user.paymentMethods;
        response_user.businessName = req.body.businessName;
        res.status(201).json({ success: true, user: response_user });
        return;
      }
      res.status(201).json({
        success: true,
        user: response_user,
        orders: [],
        basket: req.body.basket,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Error with database" });
    }
  }
  console.log(req.body.email, req.body.password);
};

const fetchUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(
      new mongoose.Types.ObjectId(decoded.id)
    ).lean();
    const response_user = user;
    response_user.displayName = user.name;
    response_user.id = response_user._id;
    delete response_user._id;
    delete response_user.__v;
    delete response_user.password;
    delete response_user.role;
    delete response_user.isVerified;
    response_user.token = token;
    const favouriteItems = user.favourites;
    delete response_user.favourites;
    if (!req.query.isSeller) {
      const cart = await Cart.findOne({
        user: new mongoose.Types.ObjectId(user.id),
      }).lean();
      const basket = cart.products;
      for (let i = 0; i < basket.length; ++i) {
        basket[i].id = basket[i].product;
        delete basket[i]._id;
        delete basket[i].product;
      }
      res.status(200).json({
        user: response_user,
        favouriteItems: favouriteItems,
        basket: basket
      });
    } else {
      delete response_user.currentAddress;
      delete response_user.paymentMethods;
      res.status(200).json({
        user: response_user,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(401).json({ error: "Invalid token" });
  }
};

const updateDetails = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const fields = Object.keys(req.query);
  const updateObject = {};
  for (const field of fields) {
    updateObject[field] = req.query[field];
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    const objectId = new mongoose.Types.ObjectId(decoded.id);
    const updateResult = await User.findOneAndUpdate(
      { _id: objectId },
      updateObject
    );
    // console.log(updateResult)
    res.status(201).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error updating" });
  }
};

const editAddress = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const field = req.query["request"];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const objectId = new mongoose.Types.ObjectId(decoded.id);
    if (field === "add") {
      const user = await User.findOne({ _id: objectId });
      // console.log(req.body)
      user.addresses.push(req.body.address);
      await user.save();
      res.status(201).json({ success: true });
    }
    if (field === "update") {
      // console.log(req.body.address);
      const user = await User.findOne({ _id: objectId });
      // console.log(req.body)
      const indexToUpdate = user.addresses.findIndex(
        (obj) => obj.id === req.body.address.id
      );
      if (indexToUpdate === -1) throw new Error("Error in updating");
      user.addresses[indexToUpdate] = {
        ...user.addresses[indexToUpdate],
        ...req.body.address,
      };
      await user.save();
      res.status(201).json({ success: true });
    }
    if (field === "delete") {
      const user = await User.findOne({ _id: objectId });
      const idToDelete = req.query["id"];
      const indexToDelete = user.addresses.findIndex(
        (obj) => obj.id === idToDelete
      );
      if (indexToDelete === -1) throw new Error("Error in updating");
      user.addresses.splice(indexToDelete, 1);
      if (indexToDelete === user.currentAddress) {
        user.currentAddress = -1;
      }
      await user.save();
      res.status(204).json({ success: true });
    }
    if (field === "currentaddress") {
      const addressId = req.query["address"];
      const user = await User.findOne({ _id: objectId });
      user.currentAddress = user.addresses.findIndex(
        (obj) => obj.id === addressId
      );
      await user.save();
      res.status(201).json({ success: true });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error updating" });
  }
  // res.status(500).json({error:'er'})
};

const editBasket = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cart = await Cart.findOne({
      user: new mongoose.Types.ObjectId(decoded.id),
    });
    if (!cart) throw new Error("Server not responding");
    // console.log(req.query["product"])
    const product = new mongoose.Types.ObjectId(req.query["product"]);
    const quantity = Number(req.query["quantity"]);
    console.log(cart.products);
    const index = cart.products.findIndex(
      (p) => p.product.toString() === product.toString()
    );
    // console.log(cart.products[0].product.toString()===product.toString(), index)
    if (quantity > 0) {
      if (index === -1) {
        cart.products.push({ product: product, quantity: quantity });
      } else {
        cart.products[index].quantity = quantity;
      }
    } else {
      cart.products = cart.products.filter(
        (obj) => obj.product.toString() !== product.toString()
      );
    }
    await cart.save();
    res.status(201).json({ success: true });
  } catch (e) {
    console.log(e);
    if (e.message === "Server not responding") {
      res.status(500).json({ error: e.message });
    } else {
      res.status(401).json({ error: "Unauthorized access" });
    }
  }
};
const editFavourites = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(new mongoose.Types.ObjectId(decoded.id));
    if (!user) throw new Error("Server not responding");
    const product = new mongoose.Types.ObjectId(req.query["product"]);
    const action = req.query["request"];
    if (action === "add") {
      if (
        !user.favourites.some((obj) => obj.toString() === product.toString())
      ) {
        user.favourites.push(product);
      }
    }
    if (action === "remove") {
      user.favourites = user.favourites.filter(
        (obj) => obj.toString() !== product.toString()
      );
    }
    await user.save();
    res.status(201).json({ success: true });
  } catch (e) {
    console.log(e);
    if (e.message === "Server not responding") {
      res.status(500).json({ error: e.message });
    } else {
      res.status(401).json({ error: "Unauthorized access" });
    }
  }
};

const placeOrder = asyncHandler(async (req, res) => {
  try {
    const basket = req.body.basket;
    const orderAmount = req.body.orderAmount;
    // console.log(orderAmount);
    for (let i = 0; i < basket.length; ++i) {
      basket[i].product = new mongoose.Types.ObjectId(basket[i].id);
      delete basket[i].id;
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(new mongoose.Types.ObjectId(decoded.id));
    if (!user) throw new Error("Server not responding");
    if (!user.currentAddress < 0) {
      throw new Error("Address not selected");
    }
    const shippingAddress = user.addresses[user.currentAddress];
    const order = await Order.create({
      cartItems: basket,
      user: user._id,
      shippingAddress: shippingAddress,
      paymentDetails: "",
      orderAmount: orderAmount,
      orderDate: Date.now(),
    });
    console.log(order.orderDate);
    for (const item of basket) {
      const product = await Product.findById(item.product);
      // console.log(product)
      const seller = await Seller.findOne({ user: product.seller });
      // if (!seller) continue
      // console.log(seller.sellingHistory);
      const existingOrderIndex = seller.sellingHistory.findIndex(
        (hist) => hist.order.toString() === order._id.toString()
      );

      if (existingOrderIndex === -1) {
        seller.sellingHistory.push({
          buyerName: user.name,
          products: [
            {
              product: item.product,
              productTitle: product.title,
              quantity: item.quantity,
              price: product.price,
            },
          ],
          order: order._id,
          shippingAddress: {
            recipient: user.name,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country,
          },
          transactionID: "", // Replace with actual transaction ID
          paymentMethod: "", // Replace with actual payment method
          orderStatus: -1,
          amount: item.quantity * product.price,
          orderDate: order.orderDate,
        });
      } else {
        seller.sellingHistory[existingOrderIndex].products.push({
          product: item.product,
          productTitle: product.title,
          quantity: item.quantity,
          price: product.price,
        });
        seller.sellingHistory[existingOrderIndex].amount +=
          item.quantity * product.price;
      }
      await seller.save();
    }
    await Cart.findOneAndUpdate({ user: user._id }, { products: [] });
    res.status(201).json({ success: true, id: order.id });
  } catch (e) {
    console.log(e);
    if (
      e.message === "Server not responding" ||
      e.message === "Address not selected"
    ) {
      res.status(500).json({ error: e.message });
    } else {
      res.status(401).json({ error: "Unauthorized access" });
    }
  }
});

// const editReview = asyncHandler(async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const reviewer = await User.findById(
//       new mongoose.Types.ObjectId(decoded.id)
//     );

//     const product = await Product.findOne({
//       _id: new mongoose.Types.ObjectId(req.query["product"]),
//     });
//     if (!reviewer || !product) {
//       throw new Error("Error with server");
//     }
//     let oldReview = false;
//     for (const rev of product.reviews) {
//       const review = await Review.findbyId(rev);
//       if (review.reviewer.toString() === reviewer._id.toString()) {
//         oldReview = review;
//       }
//     }
//     if (oldReview) {
//       oldReview.comment = req.body.comment;
//       oldReview.rating = req.body.rating;
//       oldReview.date = Date.now();
//     } else {
//       oldReview = Review.create({
//         reviewer: reviewer._id,
//         comment: req.body.comment,
//         rating: req.body.rating,
//         date: Date.now(),
//       });
//     }
//     await oldReview.save();
//     res.status(201).json({ success: true });
//   } catch (e) {
//     if (e.message === "Error with server") {
//       res.status(500).json({ error: e.message });
//       return;
//     }
//     res.status(401).json({ error: "Unauthorized access" });
//   }
// });

const fetchOrders = asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = await Order.find({
      user: new mongoose.Types.ObjectId(decoded.id),
    }).lean();
    for (let i = 0; i < orders.length; ++i) {
      orders[i].id = orders[i]._id.toString();
      delete orders[i]._id;
    }
    delete orders.user;
    res.status(200).send(orders);
  } catch (e) {
    res.status(400).json({ error: "Unauthorized access" });
  }
});
module.exports = {
  userLogin,
  userSignup,
  fetchUser,
  updateDetails,
  editAddress,
  editBasket,
  editFavourites,
  placeOrder,
  fetchOrders,
};
