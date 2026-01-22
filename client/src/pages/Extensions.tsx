import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useExtensions, 
  useAvailableEvents, 
  useAvailablePermissions,
  useEnableExtension,
  useDisableExtension 
} from "@/hooks/use-extensions";
import { 
  Puzzle, 
  Settings, 
  Code, 
  Zap, 
  Shield, 
  FileText,
  Package,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function Extensions() {
  const { isAuthenticated } = useAuth();
  const { data: extensionsList, isLoading } = useExtensions();
  const { data: events } = useAvailableEvents();
  const { data: permissions } = useAvailablePermissions();
  const enableExtension = useEnableExtension();
  const disableExtension = useDisableExtension();

  const handleToggle = async (id: number, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      await disableExtension.mutateAsync(id);
    } else {
      await enableExtension.mutateAsync(id);
    }
  };

  return (
    <Layout>
      <SEO
        title="Extensions - DisabilitySquare"
        description="Manage platform extensions and plugins"
      />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary flex items-center gap-3" data-testid="text-extensions-title">
              <Puzzle className="h-10 w-10" />
              Extensions
            </h1>
            <p className="text-muted-foreground mt-2">
              Extend platform functionality with custom plugins and integrations
            </p>
          </div>
        </div>

        <Tabs defaultValue="installed" className="space-y-6">
          <TabsList>
            <TabsTrigger value="installed" data-testid="tab-installed">
              <Package className="h-4 w-4 mr-2" />
              Installed
            </TabsTrigger>
            <TabsTrigger value="develop" data-testid="tab-develop">
              <Code className="h-4 w-4 mr-2" />
              Develop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-96 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : extensionsList && extensionsList.length > 0 ? (
              <div className="grid gap-4">
                {extensionsList.map((ext: any) => (
                  <Card key={ext.id} data-testid={`card-extension-${ext.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Puzzle className="h-5 w-5 text-primary" />
                            {ext.displayName}
                            <Badge variant="outline" className="ml-2">
                              v{ext.version}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {ext.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          {ext.enabled ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                          <Switch
                            checked={ext.enabled}
                            onCheckedChange={() => handleToggle(ext.id, ext.enabled)}
                            data-testid={`switch-extension-${ext.id}`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>By {ext.author}</span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {ext.hooks?.length || 0} hooks
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {ext.permissions?.length || 0} permissions
                        </span>
                      </div>
                      {ext.hooks && ext.hooks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {ext.hooks.map((hook: string) => (
                            <Badge key={hook} variant="outline" className="text-xs">
                              {hook}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Extensions Installed</h3>
                  <p className="text-muted-foreground">
                    Extensions allow you to add custom functionality to the platform.
                    Check the Develop tab to learn how to create your own.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="develop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Extension Development Guide
                </CardTitle>
                <CardDescription>
                  Create custom extensions to extend DisabilitySquare functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Getting Started</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Extensions are TypeScript modules that export a manifest and handler function.
                    They can respond to platform events and integrate with the valorization system.
                  </p>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// server/extensions/my-extension.ts
import type { ExtensionContext, ExtensionEventPayload } from '@shared/schema';

export const manifest = {
  name: 'my-extension',
  displayName: 'My Extension',
  description: 'Does something awesome',
  version: '1.0.0',
  author: 'Your Name',
  hooks: ['post.created', 'comment.created'],
  permissions: ['read:posts', 'award:points'],
};

export async function handler(
  context: ExtensionContext,
  event: ExtensionEventPayload
): Promise<void> {
  await context.log('info', \`Event: \${event.eventType}\`);
  
  // Your extension logic here
  if (event.eventType === 'post.created') {
    // React to new posts
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Available Event Hooks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {events?.map((event: string) => (
                      <Badge key={event} variant="outline">
                        {event}
                      </Badge>
                    )) || (
                      <span className="text-sm text-muted-foreground">Loading events...</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Available Permissions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {permissions?.map((perm: string) => (
                      <Badge key={perm} variant="secondary">
                        {perm}
                      </Badge>
                    )) || (
                      <span className="text-sm text-muted-foreground">Loading permissions...</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Extension Context API
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><code className="bg-muted px-1 rounded">context.log(level, message, metadata?)</code> - Log messages for debugging</li>
                    <li><code className="bg-muted px-1 rounded">context.awardPoints(userId, points, actionType, description)</code> - Award valorization points</li>
                    <li><code className="bg-muted px-1 rounded">context.awardBadge(userId, badgeId)</code> - Award a badge to a user</li>
                    <li><code className="bg-muted px-1 rounded">context.getConfig()</code> - Get extension configuration</li>
                    <li><code className="bg-muted px-1 rounded">context.setConfig(config)</code> - Update extension configuration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Sample Extension
                </CardTitle>
                <CardDescription>
                  A working example: Welcome Newcomers Extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This sample extension awards bonus points when users welcome newcomers.
                  Find it at <code className="bg-muted px-1 rounded">server/extensions/samples/welcome-extension.ts</code>
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`export const manifest = {
  name: 'welcome-newcomers',
  displayName: 'Welcome Newcomers',
  description: 'Awards bonus points when users welcome newcomers',
  version: '1.0.0',
  author: 'DisabilitySquare Team',
  hooks: ['comment.created'],
  permissions: ['read:posts', 'read:users', 'award:points'],
  defaultConfig: {
    bonusPoints: 10,
    welcomeMessage: 'Thank you for welcoming a newcomer!',
  },
};`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
