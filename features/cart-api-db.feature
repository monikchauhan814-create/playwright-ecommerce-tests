@db @integration
Feature: Cart API and MySQL integration

  Scenario: Update cart quantity and verify persistence
    Given the OpenCart storefront is available
    And I am a registered OpenCart customer for product 43
    When I add product 43 to the cart through the API
    Then the cart API should confirm the product was added
    And MySQL should store quantity 1 for my cart product
    When I update my cart product to quantity 2 through the API
    Then the cart API should confirm the quantity was updated
    And MySQL should store quantity 2 for my cart product

  Scenario: Remove a cart product and verify database deletion
    Given the OpenCart storefront is available
    And I am a registered OpenCart customer for product 43
    When I add product 43 to the cart through the API
    Then the cart API should confirm the product was added
    And MySQL should store quantity 1 for my cart product
    When I remove my cart product through the API
    Then the cart API should confirm the product was removed
    And MySQL should have no row for my cart product
