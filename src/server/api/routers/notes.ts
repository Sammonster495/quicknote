import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const notesRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ title: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const note = await ctx.db.note.create({
                data: {
                    title: input.title,
                    userId: ctx.session.user.id,
                    
                },
            });
            return note;
        }),
    getAll: protectedProcedure
        .query(({ ctx }) => {
            return ctx.db.note.findMany({
                where: {
                    userId: ctx.session.user.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })
        }),
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.db.note.findUnique({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
            })
        }),
    update: protectedProcedure
        .input(z.object({ id: z.string(), content: z.string().array() }))
        .mutation(async ({ ctx, input }) => {
            const note = await ctx.db.note.update({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
                data: {
                    content: input.content,
                },
            })

            return note;
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const note = await ctx.db.note.delete({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
            })

            return note;
        })
});
