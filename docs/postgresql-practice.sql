-- PostgreSQL QA Database Testing Practice
-- Environment: PostgreSQL running in Docker

-- Create test tables
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    status VARCHAR(20)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    amount DECIMAL(10,2),
    status VARCHAR(20)
);

-- Insert test data
INSERT INTO customers (name, email, status) VALUES
('John Smith', 'john@test.com', 'Active'),
('Sarah Lee', 'sarah@test.com', 'Active'),
('Mike Brown', 'mike@test.com', 'Inactive');

INSERT INTO orders (customer_id, amount, status) VALUES
(1, 120.50, 'Completed'),
(1, 75.00, 'Pending'),
(2, 210.25, 'Completed');

-- SELECT + WHERE validation
SELECT *
FROM customers
WHERE status = 'Active';

-- Validate customer/order relationship using JOIN
SELECT c.name, o.order_id, o.amount, o.status
FROM customers c
JOIN orders o
    ON c.customer_id = o.customer_id;

-- Aggregation validation
SELECT
    c.name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o
    ON c.customer_id = o.customer_id
GROUP BY c.name;

-- UPDATE test data
UPDATE customers
SET status = 'Active'
WHERE email = 'mike@test.com';

-- Verify UPDATE
SELECT *
FROM customers
WHERE email = 'mike@test.com';

-- DELETE test data
DELETE FROM customers
WHERE email = 'mike@test.com';

-- Verify DELETE
SELECT *
FROM customers
WHERE email = 'mike@test.com';