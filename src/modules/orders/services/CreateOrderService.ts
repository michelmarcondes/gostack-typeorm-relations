import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    let isProductAvailable = true;
    let productName = '';

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const productsFound = await this.productsRepository.findAllById(products);

    if (!productsFound || productsFound.length !== products.length) {
      throw new AppError('Some/all Products Not Found');
    }

    for (let index = 0; index < productsFound.length; index += 1) {
      const product = productsFound[index];

      const desiredProduct = products.find(p => p.id === product.id);

      if (desiredProduct && product.quantity < desiredProduct.quantity) {
        isProductAvailable = false;
        productName = product.name;
        break;
      }

      if (desiredProduct) {
        product.quantity -= desiredProduct.quantity;
      }
    }

    if (!isProductAvailable) {
      throw new AppError(`Quantity is not available for ${productName}`);
    }

    const orderedProducts = productsFound.map(product => ({
      product_id: product.id,
      price: product.price,
      quantity: products.filter(p => p.id === product.id)[0].quantity,
    }));

    const newOrder = await this.ordersRepository.create({
      customer,
      products: orderedProducts,
    });

    await this.productsRepository.updateQuantity(productsFound);

    return newOrder;
  }
}

export default CreateOrderService;
