# Manual Test Scenarios

## Registration

### Positive
-Verify that the user can register with a valid first name and last name
-Verify that the user can register with an Arabic first name and last name
-Verify that the user can register with a valid email address
-Verify that the user can register with a valid telephone number
-Verify that the user can register with a telephone number of different country codes
-Verify that the user can register with a telephone number without a country code
-Verify that the user can register with a valid password
-Verify that the user is redirected to the account page after successful registration
-Verify that the user can register by subscribing to the newsletter
-Verify that the user can register without subscribing to the newsletter


### Negative
-Verify that the user cannot register by leaving all fields empty
-Verify that the user cannot register by leaving the first name field empty
-Verify that the user cannot register by leaving the last name field empty
-Verify that the user cannot register by leaving the email address field empty
-Verify that the user cannot register by leaving the telephone field empty
-Verify that the user cannot register by leaving the password field empty
-Verify that the user cannot register with a very long first name
-Verify that the user cannot register with a very long last name
-Verify that the user cannot register with an incorrectly formatted email address
-Verify that the user cannot register with a telephone number of less than 10 digits
-Verify that the user cannot register with a telephone number of more than 10 digits
-Verify that the user cannot register with a password of less than 4 characters
-Verify that the user cannot register with a password of more than 20 characters
-Verify that the user cannot register with an already existing email address
-Verify that the user cannot register by leaving the password confirm field empty
-Verify that the user cannot register when password and confirm password do not match
-Verify that the user cannot register without agreeing to the privacy policy


## Login

### Positive
-Verify that the user can successfully login with valid credentials
-Verify that the user is redirected to the account page after successful login
-Verify that the user can reset the password using the forgotten password link

### Negative
-Verify that the user cannot login with an invalid email address format
-Verify that the user cannot login with an incorrect password
-Verify that the user cannot login with an unregistered email address
-Verify that the user cannot login by leaving the email address field empty
-Verify that the user cannot login by leaving the password field empty
-Verify that the user cannot login by leaving both fields empty


## Cart / Order

## Positive
-Verify that the correct price and image of the product are displayed
-Verify that the description and specifications of the product are displayed
-Verify that the reviews of the product are displayed
-Verify that the user can compare products
-Verify that the user can choose different variations of a product
-Verify that the user can add a product to the wishlist
-Verify that the user can check if a product is out of stock
-Verify that the selected item is directly added to the cart
-Verify that the correct quantity of items is added to the cart
-Verify that multiple items can be added to the cart
-Verify that multiple items of multiple quantities can be added to the cart
-Verify that the total price updates correctly when items are added to the cart
-Verify that the user can remove a selected item from the cart
-Verify that the user can remove multiple items from the cart
-Verify that the user can update the quantity of items on the cart page
-Verify that the correct item information is displayed on the cart page
-Verify that the correct unit price and total price are displayed on the cart page
-Verify that the user can apply a coupon code and gift certificate
-Verify that the correct tax amount is displayed on the cart page
-Verify that the user can successfully place an order
-Verify that the user can select different payment methods during checkout
-Verify that the user can use an existing address or add a new address during checkout
-Verify that the user can complete guest checkout
-Verify that the user can order 100 items

## Negative
-Verify that an out of stock product cannot be added to the cart
-Verify that an out of stock product cannot be placed for order
-Verify that the user cannot checkout from an empty cart
-Verify that the user cannot checkout with incorrect card details
-Verify that the user cannot checkout without account login or registration
-Verify that the user cannot checkout without a billing address

