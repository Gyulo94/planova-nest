import { Prisma } from '@prisma/client';
import { TransactionOptions } from '../decorators/transactional.decorator';
import { extractTransaction } from './extract-transaction';
import transactionStorage from './transaction.storage';

export const createTransactionExtension = (options?: TransactionOptions) =>
  Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        $allOperations: async ({
          args,
          model,
          operation,
          query,
          __internalParams,
        }: any) => {
          const store = transactionStorage.getTx();

          if (!store || store === null || __internalParams?.transaction) {
            return query(args);
          }

          if (store.manualTx === null) {
            const manualTx = await extractTransaction(
              prisma,
              store.options || options,
            );
            transactionStorage.setTx(manualTx);
          }

          const updatedStore = transactionStorage.getTx();

          if (!updatedStore) {
            throw new Error(
              '트랜잭션 저장소가 올바르게 초기화되지 않았습니다.',
            );
          }

          if (model) {
            if (!updatedStore.manualTx || !updatedStore.manualTx.client) {
              throw new Error(
                '수동 트랜잭션 클라이언트가 설정되지 않았습니다. 트랜잭션이 올바르게 초기화되었는지 확인하세요."',
              );
            }
            if (!updatedStore.manualTx.client[model]) {
              throw new Error(
                `모델 (${model})이 트랜잭션 클라이언트에 존재하지 않습니다.`,
              );
            }
            const result =
              await updatedStore.manualTx.client[model][operation](args);

            return result;
          }

          if (!updatedStore.manualTx) {
            throw new Error('수동 트랜잭션이 설정되지 않았습니다.');
          }

          return (updatedStore.manualTx as any).client[operation](args);
        },
      },
    });
  });
