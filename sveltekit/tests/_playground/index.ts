import { prismaClient } from "$lib/index.server";

await prismaClient.post_stats.findMany({
    where: {
        topics: {
            has: "Biology"
        },
        author: {
            name: {
                contains: "Joe"
            }
        },
    },

    skip: 10,
    take: 20
})