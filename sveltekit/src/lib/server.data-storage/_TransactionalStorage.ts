import type { Prisma, PrismaClient } from "@prisma/client";
import type { PrismaDataStorage } from "./_index";

export class PrismaDataStorageComponent {
  _ctx: PrismaDataStorage;
  _prismaClient: PrismaClient | TransactionalPrismaClient;

  constructor(
    ctx: PrismaDataStorage,
    prismaClient: PrismaClient | TransactionalPrismaClient,
  ) {
    this._ctx = ctx;
    this._prismaClient = prismaClient;
  }
}

export type TransactionalPrismaClient = SafeOmit<
  PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;

export async function forceRunInTransaction<R>(
  prismaClient: TransactionalPrismaClient | PrismaClient,
  block: (prismaClient: TransactionalPrismaClient | PrismaClient) => Promise<R>,
  isolationLevel: "ReadCommitted" | "RepeatableRead" | "Serializable" =
    "RepeatableRead",
) {
  if ("$transaction" in prismaClient) {
    // prismaClient is not in a transaction
    return prismaClient.$transaction(
      async (tx) => block(tx),
      { isolationLevel },
    );
  } else {
    // prismaClient is already in a transaction. just use it
    return block(prismaClient);
  }
}
