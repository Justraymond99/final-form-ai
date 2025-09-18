import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Wifi,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  description: string;
}

interface SystemHealth {
  api_response_time: number;
  database_connections: number;
  memory_usage: number;
  cpu_usage: number;
  error_rate: number;
  uptime: number;
}

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    
    // Set up real-time monitoring
    const interval = setInterval(loadPerformanceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      // Simulate performance metrics (in real app, this would come from monitoring service)
      const mockMetrics: PerformanceMetric[] = [
        {
          id: 'page_load',
          name: 'Page Load Time',
          value: 1.2,
          unit: 's',
          status: 'good',
          description: 'Average time to load pages'
        },
        {
          id: 'api_response',
          name: 'API Response Time',
          value: 340,
          unit: 'ms',
          status: 'good',
          description: 'Average API response time'
        },
        {
          id: 'error_rate',
          name: 'Error Rate',
          value: 0.1,
          unit: '%',
          status: 'good',
          description: 'Percentage of requests resulting in errors'
        },
        {
          id: 'memory_usage',
          name: 'Memory Usage',
          value: 68,
          unit: '%',
          status: 'warning',
          description: 'Current memory utilization'
        },
        {
          id: 'database_response',
          name: 'Database Response',
          value: 45,
          unit: 'ms',
          status: 'good',
          description: 'Average database query time'
        },
        {
          id: 'concurrent_users',
          name: 'Active Users',
          value: 1247,
          unit: 'users',
          status: 'good',
          description: 'Currently active users'
        }
      ];

      const mockSystemHealth: SystemHealth = {
        api_response_time: 340,
        database_connections: 45,
        memory_usage: 68,
        cpu_usage: 32,
        error_rate: 0.1,
        uptime: 99.8
      };

      setMetrics(mockMetrics);
      setSystemHealth(mockSystemHealth);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">Real-time application performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">Live</span>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health Overview
            </CardTitle>
            <CardDescription>Overall system performance and health status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemHealth.cpu_usage}%</div>
                <div className="text-sm text-muted-foreground">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemHealth.memory_usage}%</div>
                <div className="text-sm text-muted-foreground">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemHealth.database_connections}</div>
                <div className="text-sm text-muted-foreground">DB Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                {getStatusIcon(metric.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                
                {/* Progress bar for percentage-based metrics */}
                {metric.unit === '%' && (
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                )}
                
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                
                <Badge 
                  variant={metric.status === 'good' ? 'default' : 
                          metric.status === 'warning' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {metric.status === 'good' ? 'Healthy' :
                   metric.status === 'warning' ? 'Warning' : 'Critical'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Database className="w-4 h-4 mr-2" />
              Clear Database Cache
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HardDrive className="w-4 h-4 mr-2" />
              Optimize Storage
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Cpu className="w-4 h-4 mr-2" />
              Restart Services
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">API Performance Excellent</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Response times are well within acceptable limits.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Memory Usage High</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Consider optimizing memory usage or scaling resources.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Traffic Increasing</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                User activity has increased 15% this week.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};