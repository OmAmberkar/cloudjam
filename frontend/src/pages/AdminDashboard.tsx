import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, CheckCircle, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setMessage('');
      setSuccess(false);
    } else {
      setFile(null);
      setMessage('Unrecognized format. Please upload a valid Excel file (.xlsx)');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/leaderboard/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage(`Data synced! Successfully processed ${data.rowCount} cloud records.`);
        setFile(null);
      } else {
        setMessage(data.message || 'Cloud sync failed');
      }
    } catch (error) {
      setMessage('Lost connection to Google Cloud servers');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container">
       <div className="google-brand-bar">
        <div className="brand-blue"></div>
        <div className="brand-red"></div>
        <div className="brand-yellow"></div>
        <div className="brand-green"></div>
      </div>

      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ background: 'white', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(60,64,67,.30)' }}>
            <LayoutDashboard size={32} color="#1A73E8" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#202124' }}>Admin Console</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Upload & Update Participant Data</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            View Leaderboard
          </button>
          <button className="btn-primary" style={{ background: '#fce8e6', color: '#d93025', border: '1px solid #f99' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, color: '#202124' }}>Sync Cloud Data</h2>
        
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          style={{ 
            border: '2px dashed #dadce0', 
            background: dragActive ? 'rgba(26, 115, 232, 0.05)' : '#f8f9fa',
            padding: '4rem 2rem',
            borderRadius: '16px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleChange}
            style={{ display: "none" }}
          />

          {!file ? (
            <>
              <UploadCloud style={{ color: '#1A73E8', width: '64px', height: '64px', marginBottom: '1rem' }} />
              <h3 style={{ color: '#202124', fontSize: '1.4rem' }}>Drop spreadsheet here</h3>
              <p style={{ color: '#5f6368', marginTop: '0.5rem' }}>Select the latest .xlsx file to overwrite leaderboard results</p>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FileSpreadsheet style={{ color: '#1E8E3E', width: '64px', height: '64px', marginBottom: '1rem' }} />
              <h3 style={{ color: '#202124' }}>{file.name}</h3>
              <p style={{ color: '#5f6368' }}>Ready for cloud ingestion ({(file.size / 1024).toFixed(1)} KB)</p>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', marginTop: '1.5rem', border: '1px solid #dadce0' }}
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
              >
                Choose Different File
              </button>
            </div>
          )}
        </div>

        {message && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.25rem', 
            borderRadius: '12px', 
            background: success ? '#e6f4ea' : '#fce8e6',
            color: success ? '#1e8e3e' : '#d93025',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontWeight: 500,
            border: `1px solid ${success ? '#1e8e3e44' : '#d9302544'}`
          }}>
            <CheckCircle size={24} />
            {message}
          </div>
        )}

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-primary filled" 
            style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1rem' }}
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Processing Sheets...' : 'Update Leaderboard Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
