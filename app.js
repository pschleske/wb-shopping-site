import express from 'express';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import session from 'express-session';
import users from './users.json' assert { type: 'json' };
import stuffedAnimalData from './stuffed-animal-data.json' assert { type: 'json' };

const app = express();
const port = '8000';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));

nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/all-animals', (req, res) => {
  res.render('all-animals.html.njk', { animals: Object.values(stuffedAnimalData) });
});

app.get('/animal-details/:animalId', (req, res) => {
  const animalDetails = getAnimalDetails(req.params.animalId)
  res.render('animal-details.html.njk', { animal: animalDetails });
});

app.get('/add-to-cart/:animalId', (req, res) => {
  const sessionCart = req.session
  // const animalId = req.params.animalId
  const { animalId } = req.params
  // TODO: Finish add to cart functionality
  // The logic here should be something like:
  if (!sessionCart.cart) {
    sessionCart.cart = {}
    // console.log(cart)
  }
  // - check if a "cart" exists in the session, and create one (an empty
  // object keyed to the string "cart") if not
  if (!(animalId in sessionCart.cart)) {
    sessionCart.cart[animalId] = 0
  }
  // - check if the desired animal id is in the cart, and if not, put it in
  // - increment the count for that animal id by 1
  sessionCart.cart[animalId] += 1
  console.log(sessionCart.cart)
  // - redirect the user to the cart page
  res.redirect("/cart")
});

app.get('/cart', (req, res) => {
  const sessionCart = req.session
  // TODO: Display the contents of the shopping cart.
  // - get the cart object from the session
  if (!req.session.cart) {
    req.session.cart = {}
  }
  // - create an array to hold the animals in the cart, and a variable to hold the total
  // cost of the order
  const cart = req.session.cart
  const animals = []
  let orderTotal = 0
  // - loop over the cart object, and for each animal id:
  //   - get the animal object by calling getAnimalDetails
  for (const animalId in cart) {
    const animalDetails = getAnimalDetails(animalId)
    const quantity = cart[animalId]
    animalDetails.quantity = quantity
    //   - compute the total cost for that type of animal
    //   - add quantity and total cost as properties on the animal object
    const subtotal = quantity * animalDetails.price
    animalDetails.subtotal = subtotal
    //   - add this to the order total
    orderTotal += subtotal
    //   - add the animal object to the array created above
    animals.push(animalDetails)
  }
  // Make sure your function can also handle the case where no cart has
  // been added to the session
  // - pass the total order cost and the array of animal objects to the template
  res.render('cart.html.njk', { animals: animals, orderTotal: orderTotal, name: req.session.name });
});

app.get('/checkout', (req, res) => {
  // Empty the cart.
  req.session.cart = {};
  res.redirect('/all-animals');
});

app.get('/login', (req, res) => {
  // TODO: Implement this
  res.render("login.html.njk")
  // res.send('Login has not been implemented yet!');
});

app.post('/process-login', (req, res) => {
  // TODO: Implement this
  for (const user of users) {
    if (req.body.username === user.username && req.body.password === user.password) {
      req.body.username = user.username
      // this is to save the name to the session
      req.session.name = user.name
      res.redirect("/all-animals")
      return;
    }
  }
  res.render("login.html.njk", { message: "Invalid username or password" })
  // res.send('Login has not been implemented yet!');
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
    }
    res.redirect("/all-animals")
  })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
