import { z } from 'zod';
import { 
  insertProfileSchema, 
  insertGroupSchema, 
  insertPostSchema, 
  insertCommentSchema, 
  insertGameScoreSchema,
  profiles, groups, posts, comments, gameScores 
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:userId',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profiles',
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  groups: {
    list: {
      method: 'GET' as const,
      path: '/api/groups',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof groups.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/groups/:id',
      responses: {
        200: z.custom<typeof groups.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/groups',
      input: insertGroupSchema,
      responses: {
        201: z.custom<typeof groups.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts',
      input: z.object({
        groupId: z.string().optional(), // Can filter by group or null for general
        tag: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect & { author: { firstName: string | null, lastName: string | null, profileImageUrl: string | null } }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts',
      input: insertPostSchema,
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:id',
      responses: {
        200: z.custom<typeof posts.$inferSelect & { comments: (typeof comments.$inferSelect & { author: { firstName: string | null, lastName: string | null, profileImageUrl: string | null } })[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    create: {
      method: 'POST' as const,
      path: '/api/comments',
      input: insertCommentSchema,
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
  games: {
    submitScore: {
      method: 'POST' as const,
      path: '/api/games/scores',
      input: insertGameScoreSchema,
      responses: {
        201: z.custom<typeof gameScores.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    leaderboard: {
      method: 'GET' as const,
      path: '/api/games/:gameName/leaderboard',
      responses: {
        200: z.array(z.custom<typeof gameScores.$inferSelect & { user: { firstName: string | null, lastName: string | null } }>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
