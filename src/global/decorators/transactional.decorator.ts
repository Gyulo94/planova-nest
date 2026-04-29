import { Prisma } from '@prisma/client';
import transactionStorage from '../prisma/transaction.storage';

export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  Level?: Prisma.TransactionIsolationLevel;
}

export function Transactional(options?: TransactionOptions): MethodDecorator {
  return ((
    _: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any) => Promise<any>>,
  ) => {
    const originalFn = descriptor.value;
    if (typeof originalFn !== 'function') {
      throw new Error(
        `@Transactional 데코레이터는 오직 함수(메서드)에만 사용될 수 있습니다. 하지만 (${propertyKey.toString()})는 함수가 아닙니다.`,
      );
    }

    descriptor.value = async function (this: any, ...args: any[]) {
      return transactionStorage.initTx(options || {}, async () => {
        try {
          const result = await originalFn.apply(this, args);

          const store = transactionStorage.getTx();
          if (store?.manualTx) {
            await store.manualTx.commit();
          }

          return result;
        } catch (error) {
          const store = transactionStorage.getTx();
          if (store?.manualTx) {
            await store.manualTx.rollback(error);
          }

          throw error;
        }
      });
    };

    function copyMethodMetadata(from: any, to: any) {
      const metadataKeys = Reflect.getMetadataKeys(from);
      metadataKeys.map((key) => {
        const value = Reflect.getMetadata(key, from);
        Reflect.defineMetadata(key, value, to);
      });
    }

    copyMethodMetadata(originalFn, descriptor.value);
  }) as MethodDecorator;
}
