import { z } from 'zod';
import { 
  insertProfileSchema, 
  insertGroupSchema, 
  insertPostSchema, 
  insertCommentSchema, 
  insertGameScoreSchema,
  insertPointsLedgerSchema,
  insertExtensionSchema,
  profiles, groups, posts, comments, gameScores, badges, userBadges, pointsLedger, userPoints, extensions, extensionLogs
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
  valorization: {
    myPoints: {
      method: 'GET' as const,
      path: '/api/valorization/my-points',
      responses: {
        200: z.custom<typeof userPoints.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    userPoints: {
      method: 'GET' as const,
      path: '/api/valorization/users/:userId/points',
      responses: {
        200: z.custom<typeof userPoints.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    leaderboard: {
      method: 'GET' as const,
      path: '/api/valorization/leaderboard',
      responses: {
        200: z.array(z.custom<typeof userPoints.$inferSelect & { user: { firstName: string | null, lastName: string | null, profileImageUrl: string | null } }>()),
      },
    },
    myBadges: {
      method: 'GET' as const,
      path: '/api/valorization/my-badges',
      responses: {
        200: z.array(z.custom<typeof userBadges.$inferSelect & { badge: typeof badges.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    userBadges: {
      method: 'GET' as const,
      path: '/api/valorization/users/:userId/badges',
      responses: {
        200: z.array(z.custom<typeof userBadges.$inferSelect & { badge: typeof badges.$inferSelect }>()),
      },
    },
    allBadges: {
      method: 'GET' as const,
      path: '/api/valorization/badges',
      responses: {
        200: z.array(z.custom<typeof badges.$inferSelect>()),
      },
    },
    recentAchievements: {
      method: 'GET' as const,
      path: '/api/valorization/achievements',
      responses: {
        200: z.array(z.custom<typeof pointsLedger.$inferSelect & { user: { firstName: string | null, lastName: string | null, profileImageUrl: string | null } }>()),
      },
    },
  },
  extensions: {
    list: {
      method: 'GET' as const,
      path: '/api/extensions',
      responses: {
        200: z.array(z.custom<typeof extensions.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/extensions/:id',
      responses: {
        200: z.custom<typeof extensions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    install: {
      method: 'POST' as const,
      path: '/api/extensions',
      input: insertExtensionSchema,
      responses: {
        201: z.custom<typeof extensions.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    enable: {
      method: 'POST' as const,
      path: '/api/extensions/:id/enable',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    disable: {
      method: 'POST' as const,
      path: '/api/extensions/:id/disable',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    uninstall: {
      method: 'DELETE' as const,
      path: '/api/extensions/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    updateConfig: {
      method: 'PUT' as const,
      path: '/api/extensions/:id/config',
      input: z.record(z.any()),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    logs: {
      method: 'GET' as const,
      path: '/api/extensions/:id/logs',
      responses: {
        200: z.array(z.custom<typeof extensionLogs.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    events: {
      method: 'GET' as const,
      path: '/api/extensions/events',
      responses: {
        200: z.array(z.string()),
      },
    },
    permissions: {
      method: 'GET' as const,
      path: '/api/extensions/permissions',
      responses: {
        200: z.array(z.string()),
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
