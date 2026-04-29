import { AsyncLocalStorage } from 'async_hooks';
import { TransactionOptions } from '../decorators/transactional.decorator';
import { ManualTransaction } from './manual-transaction';

type TransactionStorageDataType = {
  manualTx: ManualTransaction | null;
  options: TransactionOptions;
};

class LocalStorage<T> {
  private readonly als: AsyncLocalStorage<T>;
  constructor() {
    this.als = new AsyncLocalStorage();

    if (!this.als) {
      throw new Error(
        `async_hooks 모듈에서 AsyncLocalStorage를 찾을 수 없기 때문에 트랜잭션 저장소를 만들 수 없습니다.`,
      );
    }
  }

  protected run<R = any>(
    store: T,
    callback: () => R | Promise<R>,
  ): R | Promise<R> {
    return this.als.run(store, callback);
  }

  protected get(): T {
    return this.als.getStore() || ({} as T);
  }

  protected set(key: keyof T, value: any): void {
    const store = this.get();
    if (store !== null && store !== undefined) store[key] = value;
  }
}

class TransactionStorage extends LocalStorage<TransactionStorageDataType> {
  async initTx<R = any>(
    options: TransactionOptions,
    callback: () => Promise<R>,
  ): Promise<R> {
    return this.run({ manualTx: null, options }, callback) as Promise<R>;
  }

  getTx(): TransactionStorageDataType | null {
    const store = this.get();
    return store && Object.keys(store).length > 0 ? store : null;
  }

  setTx(value: ManualTransaction): void {
    const store = this.get();
    if (store !== null && store !== undefined) {
      store.manualTx = value;
    } else {
      throw new Error('트랜잭션 저장소가 올바르게 초기화되지 않았습니다.');
    }
  }
}

export default new TransactionStorage();
