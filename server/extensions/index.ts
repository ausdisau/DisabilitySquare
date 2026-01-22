/**
 * DisabilitySquare Extension Framework
 * 
 * This module provides a flexible plugin architecture for extending the platform.
 * Extensions can hook into platform events, add custom actions, and integrate
 * with the valorization system.
 * 
 * ## Creating an Extension
 * 
 * Extensions are defined as modules that export a handler function:
 * 
 * ```typescript
 * import { ExtensionHandler, ExtensionContext, ExtensionEventPayload } from './types';
 * 
 * export const manifest = {
 *   name: 'my-extension',
 *   displayName: 'My Extension',
 *   description: 'Does something awesome',
 *   version: '1.0.0',
 *   author: 'Developer Name',
 *   hooks: ['post.created', 'comment.created'],
 *   permissions: ['read:posts', 'award:points'],
 * };
 * 
 * export const handler: ExtensionHandler = async (
 *   context: ExtensionContext,
 *   event: ExtensionEventPayload
 * ) => {
 *   await context.log('info', `Received event: ${event.eventType}`);
 *   // Your extension logic here
 * };
 * ```
 */

import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import { 
  Extension, 
  ExtensionContext, 
  ExtensionEventPayload,
  ExtensionManifest,
  EXTENSION_EVENTS,
  extensions,
  extensionHooks,
  extensionLogs,
} from '@shared/schema';
import { db } from '../db';
import { eq, and, asc } from 'drizzle-orm';
import { storage } from '../storage';

export type ExtensionHandler = (
  context: ExtensionContext,
  event: ExtensionEventPayload
) => Promise<void>;

interface LoadedExtension {
  extension: Extension;
  handler: ExtensionHandler;
}

class ExtensionManager extends EventEmitter {
  private loadedExtensions: Map<number, LoadedExtension> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('[Extensions] Initializing extension manager...');
    await this.loadAllExtensions();
    this.initialized = true;
    console.log(`[Extensions] Loaded ${this.loadedExtensions.size} extensions`);
  }

  async loadAllExtensions(): Promise<void> {
    const enabledExtensions = await db
      .select()
      .from(extensions)
      .where(eq(extensions.enabled, true));

    for (const ext of enabledExtensions) {
      await this.loadExtension(ext);
    }
  }

  private async loadExtension(ext: Extension): Promise<boolean> {
    try {
      const module = await import(ext.entryPoint);
      if (typeof module.handler !== 'function') {
        console.warn(`[Extensions] Extension ${ext.name} has no handler function`);
        return false;
      }

      this.loadedExtensions.set(ext.id, {
        extension: ext,
        handler: module.handler,
      });

      console.log(`[Extensions] Loaded: ${ext.displayName} v${ext.version}`);
      return true;
    } catch (error) {
      console.error(`[Extensions] Failed to load ${ext.name}:`, error);
      await this.logExtensionError(ext.id, `Failed to load: ${error}`);
      return false;
    }
  }

  async emit(eventType: string, data: Record<string, any>, userId?: string): Promise<void> {
    const event: ExtensionEventPayload = {
      eventType,
      timestamp: new Date(),
      data,
      userId,
    };

    const hooks = await db
      .select()
      .from(extensionHooks)
      .where(and(
        eq(extensionHooks.eventType, eventType),
        eq(extensionHooks.enabled, true)
      ))
      .orderBy(asc(extensionHooks.priority));

    for (const hook of hooks) {
      const loaded = this.loadedExtensions.get(hook.extensionId);
      if (!loaded) continue;

      const context = this.createContext(loaded.extension);
      
      try {
        await loaded.handler(context, event);
      } catch (error) {
        console.error(`[Extensions] Error in ${loaded.extension.name}:`, error);
        await this.logExtensionError(
          loaded.extension.id, 
          `Error handling ${eventType}: ${error}`
        );
      }
    }
  }

  private createContext(ext: Extension): ExtensionContext {
    return {
      extensionId: ext.id,
      storage: null,
      
      log: async (level, message, metadata = {}) => {
        await db.insert(extensionLogs).values({
          extensionId: ext.id,
          level,
          message,
          metadata,
        });
      },

      awardPoints: async (userId, points, actionType, description) => {
        // Use storage method to ensure consistent valorization behavior
        await storage.awardPoints({
          userId,
          points,
          actionType,
          description,
        });
        
        console.log(`[Extensions] ${ext.name} awarded ${points} points to ${userId}`);
      },

      awardBadge: async (userId, badgeId) => {
        // Use storage method for consistent behavior
        try {
          await storage.awardBadge(userId, badgeId);
          console.log(`[Extensions] ${ext.name} awarded badge ${badgeId} to ${userId}`);
        } catch (error: any) {
          // Badge may already exist, log but don't throw
          console.log(`[Extensions] Badge ${badgeId} already awarded to ${userId}`);
        }
      },

      getConfig: () => ext.config || {},

      setConfig: async (config) => {
        await db.update(extensions)
          .set({ config, updatedAt: new Date() })
          .where(eq(extensions.id, ext.id));
        ext.config = config;
      },
    };
  }

  private async logExtensionError(extensionId: number, message: string): Promise<void> {
    await db.insert(extensionLogs).values({
      extensionId,
      level: 'error',
      message,
      metadata: {},
    });
  }

  private validateEntryPoint(entryPoint: string): boolean {
    // Resolve the absolute path to prevent directory traversal attacks
    const serverRoot = path.resolve(process.cwd(), 'server');
    const allowedRoot = path.resolve(serverRoot, 'extensions');
    const resolvedPath = path.resolve(serverRoot, entryPoint);
    
    // Ensure resolved path is within the allowed extensions directory
    if (!resolvedPath.startsWith(allowedRoot + path.sep)) {
      return false;
    }
    
    // Must have valid extension
    const hasValidExtension = entryPoint.endsWith('.ts') || entryPoint.endsWith('.js');
    if (!hasValidExtension) {
      return false;
    }
    
    // Verify file exists and is a regular file (not symlink to outside directory)
    try {
      const realPath = fs.realpathSync(resolvedPath);
      // Ensure the real path is also within extensions directory
      if (!realPath.startsWith(allowedRoot + path.sep)) {
        return false;
      }
      const stat = fs.statSync(realPath);
      return stat.isFile();
    } catch {
      // File doesn't exist
      return false;
    }
  }

  async installExtension(manifest: ExtensionManifest, entryPoint: string): Promise<Extension> {
    // Validate entry point to prevent arbitrary code execution
    if (!this.validateEntryPoint(entryPoint)) {
      throw new Error('Invalid extension entry point. Extensions must be located in server/extensions/');
    }

    const [ext] = await db.insert(extensions).values({
      name: manifest.name,
      displayName: manifest.displayName,
      description: manifest.description,
      version: manifest.version,
      author: manifest.author,
      hooks: manifest.hooks,
      permissions: manifest.permissions,
      config: manifest.defaultConfig || {},
      entryPoint,
      enabled: true,
    }).returning();

    for (const hook of manifest.hooks) {
      await db.insert(extensionHooks).values({
        extensionId: ext.id,
        eventType: hook,
        priority: 100,
        enabled: true,
      });
    }

    await this.loadExtension(ext);
    await this.emit(EXTENSION_EVENTS.EXTENSION_INSTALLED, { extension: ext });
    
    return ext;
  }

  async enableExtension(extensionId: number): Promise<void> {
    const [ext] = await db
      .update(extensions)
      .set({ enabled: true, updatedAt: new Date() })
      .where(eq(extensions.id, extensionId))
      .returning();

    if (ext) {
      await this.loadExtension(ext);
      await this.emit(EXTENSION_EVENTS.EXTENSION_ENABLED, { extension: ext });
    }
  }

  async disableExtension(extensionId: number): Promise<void> {
    await db
      .update(extensions)
      .set({ enabled: false, updatedAt: new Date() })
      .where(eq(extensions.id, extensionId));

    this.loadedExtensions.delete(extensionId);
    await this.emit(EXTENSION_EVENTS.EXTENSION_DISABLED, { extensionId });
  }

  async uninstallExtension(extensionId: number): Promise<void> {
    await db.delete(extensionHooks).where(eq(extensionHooks.extensionId, extensionId));
    await db.delete(extensionLogs).where(eq(extensionLogs.extensionId, extensionId));
    await db.delete(extensions).where(eq(extensions.id, extensionId));
    this.loadedExtensions.delete(extensionId);
  }

  async getExtension(extensionId: number): Promise<Extension | undefined> {
    const [ext] = await db.select().from(extensions).where(eq(extensions.id, extensionId));
    return ext;
  }

  async getAllExtensions(): Promise<Extension[]> {
    return db.select().from(extensions);
  }

  async getExtensionLogs(extensionId: number, limit = 100): Promise<typeof extensionLogs.$inferSelect[]> {
    return db
      .select()
      .from(extensionLogs)
      .where(eq(extensionLogs.extensionId, extensionId))
      .limit(limit);
  }

  async updateExtensionConfig(extensionId: number, config: Record<string, any>): Promise<void> {
    await db
      .update(extensions)
      .set({ config, updatedAt: new Date() })
      .where(eq(extensions.id, extensionId));

    const loaded = this.loadedExtensions.get(extensionId);
    if (loaded) {
      loaded.extension.config = config;
    }
  }

  getLoadedCount(): number {
    return this.loadedExtensions.size;
  }
}

export const extensionManager = new ExtensionManager();
export { EXTENSION_EVENTS };
