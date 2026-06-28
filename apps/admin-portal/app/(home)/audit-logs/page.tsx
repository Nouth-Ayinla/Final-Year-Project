"use client";

import { useMemo, useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockAuditLogs } from '@/lib/mocks/data';

type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'ELECTION_CREATE'
  | 'ELECTION_PUBLISH'
  | 'ELECTION_PAUSE'
  | 'ELECTION_RESUME'
  | 'ELECTION_CLOSE'
  | 'ELECTION_ARCHIVE'
  | 'VOTER_CREATE'
  | 'VOTER_APPROVE'
  | 'VOTER_SUSPEND'
  | 'VOTER_UNSUSPEND'
  | 'VOTER_IMPORT'
  | 'VOTER_BIOMETRIC_ENROLL'
  | 'VOTER_BIOMETRIC_UPDATE'
  | 'BALLOT_CREATE'
  | 'BALLOT_PUBLISH'
  | 'SETTINGS_UPDATE';

type AuditLogRow = {
  id: string;
  adminEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  timestamp: string;
};

const AUDIT_LOGS_KEY = 'ondo-audit-logs';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | AuditAction>('ALL');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_KEY);
      if (!raw) {
        localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(mockAuditLogs));
        setLogs(mockAuditLogs as AuditLogRow[]);
      } else {
        setLogs(JSON.parse(raw) as AuditLogRow[]);
      }
    } catch {
      setLogs([]);
    }
  }, []);

  const downloadCsv = (filename: string, rows: AuditLogRow[]) => {
    if (!rows.length) return;
    const headers = ['timestamp', 'adminEmail', 'action', 'resourceType', 'resourceId'];
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        [row.timestamp, row.adminEmail, row.action, row.resourceType, row.resourceId]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        const matchesSearch =
          `${log.adminEmail} ${log.resourceId} ${log.resourceType}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
        return matchesSearch && matchesAction;
      }),
    [logs, searchTerm, actionFilter],
  );

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">Security & Audit</span>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">System Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Inspect sensitive system actions, filter activity trails, and export evidence-ready log bundles.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filters */}
        <Card className="lg:col-span-4 bg-white border border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Filter Logs</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Use action and keyword filtering for targeted investigations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">Search</span>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200"
                  placeholder="Admin email, resource, or ID"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">Action</span>
              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value as 'ALL' | AuditAction)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="ALL">All actions</option>
                {Array.from(new Set(logs.map((log) => log.action))).map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 mt-4"
              onClick={() => downloadCsv('audit-logs.csv', filtered)}
            >
              <Download size={16} />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-8 bg-white border border-slate-100 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Audit Timeline ({filtered.length})</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Chronological record of high-impact administrative actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-4 font-bold">Admin</th>
                    <th className="py-3 px-4 font-bold">Action</th>
                    <th className="py-3 px-4 font-bold">Resource</th>
                    <th className="py-3 px-4 font-bold">Time</th>
                    <th className="py-3 px-4 font-bold">Trace ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length > 0 ? (
                    filtered.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{log.adminEmail}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">{log.resourceType}</td>
                        <td className="py-3.5 px-4 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">{log.resourceId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No audit records match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
