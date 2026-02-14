import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const prismaClientSingleton = () => {
    const baseUrl = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!baseUrl) {
        throw new Error("DATABASE_URL_MISSING: TURSO_DATABASE_URL is not defined.");
    }

    // Fallback/Hack for Prisma 7 compatibility: Pass token in URL if headers fail
    const url = token ? `${baseUrl}?authToken=${token}` : baseUrl;

    const libsql = createClient({
        url: url,
        authToken: token, // Keep it here too for redundancy
    });

    // Fix for Prisma property detection
    (libsql as any).url = url;

    const adapter = new PrismaLibSql(libsql as any);
    return new PrismaClient({ adapter });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
