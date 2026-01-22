/**
 * Sample Extension: Welcome New Commenters
 * 
 * This extension demonstrates the DisabilitySquare extension framework.
 * It awards bonus points to users who welcome newcomers to the platform
 * by commenting on their first post.
 * 
 * To install this extension, use the extension management API or admin UI.
 */

import type { ExtensionContext, ExtensionEventPayload } from '@shared/schema';

export const manifest = {
  name: 'welcome-newcomers',
  displayName: 'Welcome Newcomers',
  description: 'Awards bonus points when users welcome newcomers by commenting on their first post',
  version: '1.0.0',
  author: 'DisabilitySquare Team',
  hooks: ['comment.created'],
  permissions: ['read:posts', 'read:users', 'award:points'],
  defaultConfig: {
    bonusPoints: 10,
    welcomeMessage: 'Thank you for welcoming a newcomer!',
  },
};

export async function handler(
  context: ExtensionContext,
  event: ExtensionEventPayload
): Promise<void> {
  if (event.eventType !== 'comment.created') return;
  
  const config = context.getConfig();
  const { comment, post } = event.data;
  
  await context.log('info', `Processing comment ${comment.id} on post ${post?.id}`);
  
  // Here you would check if the post author is a newcomer
  // This is a simplified example
  if (post && comment.content.toLowerCase().includes('welcome')) {
    await context.awardPoints(
      event.userId!,
      config.bonusPoints || 10,
      'welcomed_newcomer',
      config.welcomeMessage || 'Thank you for welcoming a newcomer!'
    );
    
    await context.log('info', `Awarded welcome bonus to user ${event.userId}`);
  }
}
