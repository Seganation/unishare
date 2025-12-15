"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertCircle, CheckCircle2, RefreshCw, Server } from "lucide-react";

export function AIHealthStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: health, refetch, isLoading } = api.ai.healthCheck.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            AI Server Status
          </CardTitle>
          <CardDescription>Checking AI server availability...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isHealthy = health?.available && health?.modelAvailable;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>AI Server Status</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <CardDescription>
          Local Ollama server for AI-powered features
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="text-destructive h-5 w-5" />
          )}
          <span className="font-medium">
            {isHealthy ? "AI is ready" : "AI is not available"}
          </span>
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {isHealthy ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Server Status */}
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Ollama Server</span>
            <Badge variant={health?.available ? "default" : "secondary"}>
              {health?.available ? "Running" : "Not Running"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Model Status</span>
            <Badge variant={health?.modelAvailable ? "default" : "secondary"}>
              {health?.modelAvailable ? "Available" : "Not Found"}
            </Badge>
          </div>
        </div>

        {/* Available Models */}
        {health?.models && health.models.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Available Models</span>
            <div className="flex flex-wrap gap-2">
              {health.models.map((model) => (
                <Badge key={model} variant="outline">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Error/Warning Messages */}
        {!isHealthy && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              {!health?.available ? (
                <div>
                  <p className="font-medium">Ollama is not running</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
                    <li>Install Ollama from https://ollama.ai/download</li>
                    <li>Start Ollama server</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Model not found</p>
                  <p className="mt-2 text-sm">
                    Run this command to download the model:
                  </p>
                  <code className="bg-muted mt-1 block rounded p-2 text-xs">
                    ollama pull qwen2.5:1.5b
                  </code>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
