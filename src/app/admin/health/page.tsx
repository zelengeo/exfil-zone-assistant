// src/app/admin/health/page.tsx
import { HealthCheckDashboard } from '../components/HealthCheckDashboard';


export default async function AdminHealthPage() {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">System Health</h1>
            <HealthCheckDashboard />
        </div>
    );
}