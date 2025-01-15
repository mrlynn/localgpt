// /frontend/src/components/EnvironmentCheck.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const EnvironmentCheck = () => {
  const [checks, setChecks] = useState({
    ollama: { status: 'pending', details: null },
    mongodb: { status: 'pending', details: null },
    environment: { status: 'pending', details: {} }
  });
  const [loading, setLoading] = useState(false);

  const checkEnvironment = async () => {
    setLoading(true);
    setChecks({
      ollama: { status: 'pending', details: null },
      mongodb: { status: 'pending', details: null },
      environment: { status: 'pending', details: {} }
    });

    try {
      // Check Ollama
      const ollamaRes = await fetch('http://localhost:3000/api/test-ollama');
      const ollamaData = await ollamaRes.json();
      setChecks(prev => ({
        ...prev,
        ollama: {
          status: ollamaData.status === 'ok' ? 'success' : 'error',
          details: ollamaData
        }
      }));

      // Check MongoDB through debug endpoint
      const mongoRes = await fetch('http://localhost:3000/api/debug/chats');
      const mongoData = await mongoRes.json();
      setChecks(prev => ({
        ...prev,
        mongodb: {
          status: mongoData.error ? 'error' : 'success',
          details: mongoData
        }
      }));

      // Check Environment Variables from backend
      const envRes = await fetch('http://localhost:3000/api/env-check');
      const envData = await envRes.json();
      setChecks(prev => ({
        ...prev,
        environment: {
          status: envData.status === 'ok' ? 'success' : 'error',
          details: {
            variables: envData.envVars,
            message: envData.message,
            missingVars: envData.missingVars
          }
        }
      }));

    } catch (error) {
      console.error('Error running environment checks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const renderDetails = (check) => {
    if (!check.details) return null;

    switch (check.status) {
      case 'success':
        return (
          <div className="mt-2 text-sm text-muted-foreground">
            {typeof check.details === 'object' ? (
              <pre className="p-2 bg-muted rounded-md overflow-auto">
                {JSON.stringify(check.details, null, 2)}
              </pre>
            ) : (
              check.details
            )}
          </div>
        );
      case 'error':
        return (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {typeof check.details === 'object' 
                ? JSON.stringify(check.details, null, 2)
                : check.details}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Environment Status
          <Button 
            onClick={checkEnvironment} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Refresh Checks
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Variables */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.environment.status)}
            <h3 className="font-semibold">Environment Variables</h3>
          </div>
          {renderDetails(checks.environment)}
        </div>

        {/* MongoDB Check */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.mongodb.status)}
            <h3 className="font-semibold">MongoDB Connection</h3>
          </div>
          {renderDetails(checks.mongodb)}
        </div>

        {/* Ollama Check */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.ollama.status)}
            <h3 className="font-semibold">Ollama Connection</h3>
          </div>
          {renderDetails(checks.ollama)}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentCheck;