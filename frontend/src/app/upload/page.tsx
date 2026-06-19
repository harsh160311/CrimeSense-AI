'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, Incident } from '@/lib/api';
import {
  Upload, FileText, Database, CheckCircle, AlertTriangle, Loader2, Plus, X, Shield,
} from 'lucide-react';

const CRIME_TYPES = [
  'BURGLARY', 'VANDALISM', 'FRAUD', 'DOMESTIC VIOLENCE', 'FIREARM OFFENSE',
  'ROBBERY', 'KIDNAPPING', 'IDENTITY THEFT', 'SEXUAL ASSAULT', 'ASSAULT',
  'TRAFFIC VIOLATION', 'PUBLIC INTOXICATION', 'HOMICIDE', 'CYBERCRIME',
  'ILLEGAL POSSESSION', 'ARSON', 'DRUG OFFENSE', 'EXTORTION',
  'COUNTERFEITING', 'VEHICLE - STOLEN', 'SHOPLIFTING',
];

const LOCATIONS = [
  'Agra', 'Ahmedabad', 'Bangalore', 'Bhopal', 'Chennai', 'Delhi',
  'Faridabad', 'Ghaziabad', 'Hyderabad', 'Indore', 'Jaipur', 'Kalyan',
  'Kanpur', 'Kolkata', 'Lucknow', 'Ludhiana', 'Meerut', 'Mumbai',
  'Nagpur', 'Nashik', 'Patna', 'Pune', 'Rajkot', 'Srinagar', 'Surat',
  'Thane', 'Vadodara', 'Varanasi', 'Visakhapatnam',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const WEAPONS = ['None', 'Blunt Object', 'Firearm', 'Knife', 'Poison', 'Sharp Object', 'Strangulation', 'Other'];
const GENDERS = ['M', 'F', 'Other'];
const CRIME_DOMAINS = ['Violent Crime', 'Property Crime', 'Drug Related', 'Cyber Crime', 'Financial Crime', 'Other Crime'];

export default function UploadPage() {
  const { user, loading: authLoading, logout: authLogout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'upload' | 'manual'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    crime_type: 'BURGLARY',
    location_name: 'Delhi',
    latitude: '28.7041',
    longitude: '77.1025',
    date_time: new Date().toISOString().slice(0, 16),
    severity: 'Medium',
    description: '',
    victim_age: '',
    victim_gender: 'M',
    weapon_used: 'None',
    crime_domain: 'Violent Crime',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading) return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[var(--accent-blue)] animate-spin" /></div>;
  if (!user) return null;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    setUploadError(null);
    try {
      const result = await api.uploadFile(file);
      setUploadResult(`Successfully uploaded ${result.count} incidents`);
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed. Ensure backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const descParts = [`Domain: ${form.crime_domain}`, `Weapon: ${form.weapon_used}`, `Victim: ${form.victim_gender}/${form.victim_age || '?'}`];
      if (form.description) descParts.push(form.description);
      await api.createIncident({
        crime_type: form.crime_type,
        location_name: form.location_name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        date_time: new Date(form.date_time).toISOString(),
        severity: form.severity,
        description: descParts.join(' | '),
      });
      setUploadResult('Incident recorded successfully');
      setForm(prev => ({ ...prev, description: '', victim_age: '' }));
    } catch {
      setUploadError('Failed to record incident.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    router.push('/login');
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Data Management</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">Upload or manually enter crime incident data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
            <Shield className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span className="text-xs text-[var(--text-secondary)]">{user.name} ({user.badge})</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors">Logout</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'upload' ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)]'
          }`}
        >
          <Upload className="w-4 h-4" />
          Bulk Upload
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'manual' ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)]'
          }`}
        >
          <Plus className="w-4 h-4" />
          Manual Entry
        </button>
      </div>

      {tab === 'upload' ? (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Bulk Upload</h2>
              <p className="text-xs text-[var(--text-muted)]">Upload CSV, JSON, PDF, or Excel files with incident data</p>
            </div>
          </div>

          <div
            className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-12 text-center cursor-pointer hover:border-[var(--accent-blue)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.pdf,.xls,.xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              {file ? file.name : 'Drop your file here or click to browse'}
            </p>
              <p className="text-xs text-[var(--text-muted)]">Supports CSV, JSON, PDF, and Excel (XLS/XLSX) formats</p>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-blue)]" />
                <span className="text-sm text-[var(--text-primary)]">{file.name}</span>
                <span className="text-xs text-[var(--text-muted)]">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={() => setFile(null)} className="text-[var(--text-muted)] hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full py-2.5 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </button>

          {uploadResult && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{uploadResult}</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{uploadError}</span>
            </div>
          )}

          <div className="mt-6 p-4 rounded-lg bg-[var(--bg-primary)]">
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Expected Format (matches Indian Crime Dataset columns):</p>
            <code className="text-[10px] text-[var(--text-muted)] block leading-relaxed">
              CSV: crime_type, location_name, latitude, longitude, date_time, severity, description
              JSON: Array of objects with crime_type, location_name, latitude, longitude, date_time, severity, description
              PDF: Table or structured text with same columns
              Excel (.xls/.xlsx): Columns with same names (case-insensitive)
              {'\n'}
              Dataset Columns (XLTX): Report Number, Date Reported, Date of Occurrence, Time of Occurrence, City,
              Crime Code, Crime Description, Victim Age, Victim Gender, Weapon Used, Crime Domain,
              Police Deployed, Case Closed, Date Case Closed
              {'\n'}
              Dataset Columns (CSV): Law Category, Crime + Legal Section, Reason, Cases (Jan-Aug 2025),
              Cases (Aug 2024), Cases (Jul 2025), Cases (Aug 2025)
            </code>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Manual Entry</h2>
              <p className="text-xs text-[var(--text-muted)]">Add a single crime incident record</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Crime Description</label>
              <select value={form.crime_type} onChange={(e) => setForm(prev => ({ ...prev, crime_type: e.target.value }))}>
                {CRIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">As per Crime Description column in dataset</p>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">City / Location</label>
              <select value={form.location_name} onChange={(e) => setForm(prev => ({ ...prev, location_name: e.target.value }))}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">City from dataset (29 cities)</p>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Date of Occurrence</label>
              <input type="datetime-local" value={form.date_time} onChange={(e) => setForm(prev => ({ ...prev, date_time: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Severity Level</label>
              <select value={form.severity} onChange={(e) => setForm(prev => ({ ...prev, severity: e.target.value }))}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Victim Age</label>
              <input
                type="number" min="0" max="120"
                value={form.victim_age}
                onChange={(e) => setForm(prev => ({ ...prev, victim_age: e.target.value }))}
                placeholder="e.g. 25"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Victim Gender</label>
              <select value={form.victim_gender} onChange={(e) => setForm(prev => ({ ...prev, victim_gender: e.target.value }))}>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Weapon Used</label>
              <select value={form.weapon_used} onChange={(e) => setForm(prev => ({ ...prev, weapon_used: e.target.value }))}>
                {WEAPONS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Crime Domain</label>
              <select value={form.crime_domain} onChange={(e) => setForm(prev => ({ ...prev, crime_domain: e.target.value }))}>
                {CRIME_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-[var(--text-secondary)] mb-1.5 block">Description / Notes</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional case details..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Record Incident'}
          </button>

          {uploadResult && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{uploadResult}</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
