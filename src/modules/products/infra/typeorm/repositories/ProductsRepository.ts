import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const product = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const ids = products.map(product => product.id);
    const productsFind = await this.ormRepository.find({ id: In(ids) });

    if (ids.length !== productsFind.length) {
      throw new AppError('Missing Product');
    }

    return productsFind;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    const productsById = await this.findAllById(products);
    const newProducts = productsById.map(prod => {
      const productFind = products.find(product => product.id === prod.id);

      if (!productFind) {
        throw new AppError('Product not found');
      }

      if (prod.quantity < productFind.quantity) {
        throw new AppError('Product does not have quantity');
      }

      const newProduct = prod;

      newProduct.quantity -= productFind.quantity;

      return newProduct;
    });

    await this.ormRepository.save(newProducts);

    return newProducts;
  }
}

export default ProductsRepository;
