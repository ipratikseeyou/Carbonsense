
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw,
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  Cloud,
  Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  syncExistingProjectsToAWS, 
  verifyDataConsistency, 
  SyncSummary 
} from '@/utils/syncProjects';

export default function SyncDashboard() {
  const [issyncing, setIsSyncing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<SyncSummary | null>(null);
  const [consistencyResult, setConsistencyResult] = useState<any>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncResult(null);
    
    try {
      const result = await syncExistingProjectsToAWS();
      setSyncResult(result);
      setSyncProgress(100);
      
      if (result.failed === 0) {
        toast({
          title: 'Sync Complete!',
          description: `Successfully synced ${result.successful} projects to AWS.`,
        });
      } else {
        toast({
          title: 'Sync Completed with Issues',
          description: `${result.successful} succeeded, ${result.failed} failed.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync projects.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerifyConsistency = async () => {
    setIsVerifying(true);
    setConsistencyResult(null);
    
    try {
      const result = await verifyDataConsistency();
      setConsistencyResult(result);
      
      if (result.consistent) {
        toast({
          title: 'Data Consistent',
          description: 'All projects are properly synchronized.',
        });
      } else {
        toast({
          title: 'Inconsistency Detected',
          description: `${result.missingInAws.length} projects missing in AWS.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify consistency.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Data Synchronization Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and manage data consistency between Supabase and AWS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleSync}
              disabled={issyncing}
              className="w-full"
            >
              {issyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync to AWS
                </>
              )}
            </Button>
            
            <Button
              onClick={handleVerifyConsistency}
              disabled={isVerifying}
              variant="outline"
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Consistency
                </>
              )}
            </Button>
          </div>

          {issyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sync Progress</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{syncResult.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{syncResult.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{syncResult.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {syncResult.failed > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some projects failed to sync. Check the console for detailed error logs.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Consistency Results */}
      {consistencyResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Consistency Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={consistencyResult.consistent ? 'default' : 'destructive'}>
                {consistencyResult.consistent ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Consistent
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inconsistent
                  </>
                )}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{consistencyResult.supabaseCount}</div>
                <div className="text-sm text-muted-foreground">Supabase Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{consistencyResult.awsCount}</div>
                <div className="text-sm text-muted-foreground">AWS Projects</div>
              </div>
            </div>

            {consistencyResult.missingInAws.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {consistencyResult.missingInAws.length} projects exist in Supabase but not in AWS.
                  Run sync to fix this.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
