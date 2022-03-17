const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this)
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => { // cp = cartProduct
      return cp.productId.toString() === product._id.toString(); // return index dari cart items (cek product id apa sudah ada di cart)
    })
    // console.log(cartProductIndex);

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1; // if product already in cart, add 1 to quantity
      updatedCartItems[cartProductIndex].quantity = newQuantity; // update quantity
    } else {
      updatedCartItems.push({ // if product not in cart, add new product to cart
        productId: new ObjectId(product._id),
        quantity: newQuantity
      })
    }
    const updatedCart = {
      items: updatedCartItems // update cart
    }
    const db = getDb();
    db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: updatedCart } }
    );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => { // i = index of cart.items
      return i.productId; // return productId from cart.items
    })
    return db.collection('products')
      .find({ _id: { $in: productIds } }) // find all products in cart
      .toArray()
      .then(products => { // products = [product, product, product] (array of products) from database
        return products.map(p => { // p = product
          return {
            ...p,
            quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();  // find cartItem with productId = product._id (id product pada colection products)
            }).quantity
          }
        })
      })
      .catch(err => console.log(err));
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString(); // filter cart.items, return cart.items that not equal to productId
    })
    const db = getDb();
    return db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: { items: updatedCartItems } } }
    );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name
          }
        }
        return db.collection('orders').insertOne(order)
      })
      .then(result => {
        this.cart = { items: [] };
        return db.collection('users').updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: { items: [] } } }
        );
      })
      .catch(err => console.log(err));
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray()
      .then(orders => {
        return orders;
      })
      .catch(err => console.log(err));
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then(user => {
        // console.log(user);
        return user;
      })
      .catch(err => console.log(err));
  }
}

module.exports = User;