Feature: OpenCart shopping cart

  Scenario: Add an available product to the cart
    Given the OpenCart storefront is available
    When I add product 43 to the cart through the API
    Then the cart API should confirm the product was added
