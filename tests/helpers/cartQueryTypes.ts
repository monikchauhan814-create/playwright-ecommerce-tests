import type { RowDataPacket } from 'mysql2';

export type ProductIdRow = RowDataPacket & {
  product_id: number;
};

export type CartIdRow = RowDataPacket & {
  cart_id: number;
};

export type QuantityRow = RowDataPacket & {
  quantity: number;
};

export type CartDetailsRow = RowDataPacket & {
  cart_id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
};
