/* eslint-disable max-classes-per-file */
// product.service.ts
import { ipcRenderer } from 'electron';
type Product = { id: number; name: string };

type IProductService = {
  getProduct(id: number): Promise<Product>;
  setProductName(id: number, name: string): void;
};

const productBridge: IProductService = {
  getProduct(id: number): Promise<Product> {
    return ipcRenderer.invoke('product/getProduct', id);
  },

  setProductName(id: number, name: string): void {
    return ipcRenderer.send('product/setProductName', { id, name });
  },
};

export type Handler = {
  registerHandlers(): void;
};

class ProductHandler implements Handler {
  productService: IProductService;

  ipcMain: Electron.IpcMain;

  constructor(productService: IProductService, ipcMain: Electron.IpcMain) {
    this.productService = productService;
    this.ipcMain = ipcMain;
  }

  registerHandlers() {
    this.ipcMain.handle('product/getProduct', async (event, id) => {
      console.log('ProductHandler [product/getProduct] id:', id);
      return this.productService.getProduct(id);
    });

    this.ipcMain.on('product/setProductName', (event, { id, name }) => {
      console.log('ProductHandler [product/setProductName]', { id, name });
      this.productService.setProductName(id, name);
    });
  }
}

class ProductService implements IProductService {
  products: Product[];

  constructor() {
    this.products = [
      { id: 0, name: 'foo' },
      { id: 1, name: 'bar' },
    ];
  }

  setProductName(id: number, name: string): void {
    this.products[id].name = name;
  }

  getProduct(id: number): Promise<Product> {
    return new Promise((resolve, reject) => {
      const product = this.products[id];
      if (product == null) {
        reject(new Error(`Cannot find product with id: ${id}`));
      } else {
        resolve(product);
      }
    });
  }
}

// type Message<T extends string = string, P = void> = { type: T; payload: P };

// function createMessage<T extends string = string, P = void>(
//   type: T
// ): (payload: P) => Message<T, P> {
//   return (payload: P) => {
//     const message: Message<T, P> = { type, payload };
//     return message;
//   };
// }

// const getProduct = createMessage<'getProduct', number>('getProduct');
// getProduct(1);

// function invoke<T extends string = string, P = void>(message: Message<T, P>) {
//   return ipcRenderer.invoke(message.type, message.payload);
// }

// invoke(getProduct(1));

export {
  ProductService,
  IProductService,
  Product,
  productBridge,
  ProductHandler,
};
