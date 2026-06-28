"use client";

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Flag, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockBiometricProfiles, mockVoters } from '@/lib/mocks/data';

type BiometricStatus = 'PENDING' | 'ENROLLED' | 'POOR_QUALITY' | 'DUPLICATE_ALERT' | 'FAILED';

type BiometricReviewRecord = {
  id: string;
  voterId: string;
  voterName: string;
  faceStatus: BiometricStatus;
  fingerprintStatus: BiometricStatus;
  attempts: number;
  flagged: boolean;
  updatedAt: string;
};

const BIOMETRIC_REVIEW_KEY = 'ondo-biometric-review';

export default function BiometricReviewPage() {
  const [records, setRecords] = useState<BiometricReviewRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BiometricStatus>('ALL');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BIOMETRIC_REVIEW_KEY);
      if (raw) {
        setRecords(JSON.parse(raw) as BiometricReviewRecord[]);
      } else {
        const defaults: BiometricReviewRecord[] = mockBiometricProfiles.map((profile) => {
          const voter = mockVoters.find((item) => item.id === profile.voterId);
          return {
            id: profile.id,
            voterId: profile.voterId,
            voterName: voter ? `${voter.firstName} ${voter.lastName}` : profile.voterId,
            faceStatus: profile.faceEnrollmentStatus as BiometricStatus,
            fingerprintStatus: profile.fingerprintEnrollmentStatus as BiometricStatus,
            attempts: profile.verificationAttempts,
            flagged: false,
            updatedAt: profile.createdAt,
          };
        });
        localStorage.setItem(BIOMETRIC_REVIEW_KEY, JSON.stringify(defaults));
        setRecords(defaults);
      }
    } catch {
      setRecords([]);
    }
  }, []);

  const saveRecords = (newRecords: BiometricReviewRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(BIOMETRIC_REVIEW_KEY, JSON.stringify(newRecords));
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        record.voterName.toLowerCase().includes(term) || record.voterId.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'ALL' || record.faceStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const updateRecord = (id: string, updater: (record: BiometricReviewRecord) => BiometricReviewRecord) => {
    const updated = records.map((record) => (record.id === id ? updater(record) : record));
    saveRecords(updated);
  };

  const approveEnrollment = (id: string) => {
    updateRecord(id, (record) => ({
      ...record,
      faceStatus: 'ENROLLED',
      fingerprintStatus: 'ENROLLED',
      flagged: false,
      updatedAt: new Date().toISOString(),
    }));
    toast.success('Biometric profile approved successfully');
  };

  const flagProfile = (id: string) => {
    updateRecord(id, (record) => ({
      ...record,
      faceStatus: 'POOR_QUALITY',
      flagged: true,
      updatedAt: new Date().toISOString(),
    }));
    toast.error('Profile flagged for quality review');
  };

  const requestReenrollment = (id: string) => {
    updateRecord(id, (record) => ({
      ...record,
      faceStatus: 'PENDING',
      fingerprintStatus: 'PENDING',
      attempts: record.attempts + 1,
      flagged: false,
      updatedAt: new Date().toISOString(),
    }));
    toast.success('Re-enrollment request logged');
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">Biometrics Registry</span>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Biometric Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review enrollment quality, approve valid profiles, and flag suspicious or poor biometric submissions.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Review Controls */}
        <Card className="lg:col-span-4 bg-white border border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Review Queue Controls</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Filter records by voter or biometric status to speed up validation.
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
                  placeholder="Search by name or voter ID"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">Face Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'ALL' | BiometricStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="POOR_QUALITY">Poor Quality</option>
                <option value="DUPLICATE_ALERT">Duplicate Alert</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Profiles List */}
        <Card className="lg:col-span-8 bg-white border border-slate-100 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Voter Profiles ({filtered.length})</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Action each profile with approve, flag, or re-enrollment workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-4 font-bold">Voter</th>
                    <th className="py-3 px-4 font-bold">Face Status</th>
                    <th className="py-3 px-4 font-bold">Fingerprint Status</th>
                    <th className="py-3 px-4 font-bold">Verification Stats</th>
                    <th className="py-3 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length > 0 ? (
                    filtered.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-700">{record.voterName}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{record.voterId}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.faceStatus === 'ENROLLED'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : record.faceStatus === 'POOR_QUALITY' || record.faceStatus === 'FAILED'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}
                          >
                            {record.faceStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-500">
                          {record.fingerprintStatus}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`w-fit px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                record.flagged
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {record.flagged ? 'Flagged' : 'Clean'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Attempts: {record.attempts}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => approveEnrollment(record.id)}
                            >
                              <CheckCircle2 size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => flagProfile(record.id)}
                            >
                              <Flag size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                              onClick={() => requestReenrollment(record.id)}
                            >
                              <RefreshCcw size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No biometric profiles match your filters.
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
