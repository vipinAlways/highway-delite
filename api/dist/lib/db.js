import { PrismaClient } from "../generated/prisma/index.js";
const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma ??
    new PrismaClient({
        log: ["query"],
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = db;
//# sourceMappingURL=db.js.map