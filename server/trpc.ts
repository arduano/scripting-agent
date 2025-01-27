import type { createContext } from "./context.ts";
import { EventEmitter } from "node:events";
import {
  makeChatRouterForAgent,
  ServerSideChatConversationHelper,
} from "@trpc-chat-agent/core";
import { initTRPC } from "@trpc/server";
import { nanoid } from "nanoid";
import { agent } from "./agent.ts";
import { getAllConversationsWithMetadata } from "@/server/conversationMetadata.ts";

export const ee = new EventEmitter();

export const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

export const appRouter = router({
  chat: makeChatRouterForAgent({
    agent,
    createConversation: async ({ ctx }) => {
      const id = nanoid();

      await ctx.conversations.addConversation(id);

      return ServerSideChatConversationHelper.newConversationData<typeof agent>(
        id
      );
    },
    getConversation: async ({ id, ctx }) => {
      try {
        const data = await ctx.conversations.store.get(id);
        if (!data) {
          return null;
        }

        return data as any;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    t,
    saveConversation: async ({ id, conversation, ctx }) => {
      await ctx.conversations.store.set(id, conversation as any);
    },
  }),

  listConversations: publicProcedure.query(async ({ ctx }) => {
    return getAllConversationsWithMetadata(ctx);
  }),
});

export type AppRouter = typeof appRouter;
