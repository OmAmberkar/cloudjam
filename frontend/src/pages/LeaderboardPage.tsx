import { useEffect, useState, useMemo } from 'react';
import { Trophy, ExternalLink, RefreshCw, ShieldAlert, Award, Search, Users, CheckCircle, Cloud, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ParticipantRecord {
  "User Name": string;
  "User Email": string;
  "Google Cloud Skills Boost Profile URL": string;
  "Profile URL Status": string;
  "Access Code Redemption Status": string;
  "All Skill Badges & Games Completed": string;
  "# of Skill Badges Completed": string | number;
  "Names of Completed Skill Badges": string;
  "# of Arcade Games Completed": string | number;
  "Names of Completed Arcade Games": string;
  
  // Computed fields
  TotalRankScore?: number;
  IsSelected?: boolean;
}

const GOOGLE_COLORS = ['#1A73E8', '#D93025', '#F9AB00', '#1E8E3E'];

export default function LeaderboardPage() {
  const [data, setData] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'points' | 'badges' | 'games'>('points');
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const result = await response.json();
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition
        
        const processedData = result.data.map((item: ParticipantRecord) => {
          const badges = parseInt(String(item["# of Skill Badges Completed"])) || 0;
          const games = parseInt(String(item["# of Arcade Games Completed"])) || 0;
          const isSelected = item["All Skill Badges & Games Completed"]?.trim().toLowerCase() === 'yes';
          return {
            ...item,
            TotalRankScore: badges + games,
            IsSelected: isSelected
          };
        });
        
        setData(processedData);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Could not connect to the server. Making sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const stats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(u => u.IsSelected).length;
    return {
      total,
      completed,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
  }, [data]);

  const sortedAndFilteredData = useMemo(() => {
    return data
      .filter(u => {
        const matchesSearch = u["User Name"]?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u["User Email"]?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || (filterType === 'completed' && u.IsSelected);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.IsSelected && !b.IsSelected) return -1;
        if (!a.IsSelected && b.IsSelected) return 1;

        if (sortBy === 'points') {
          return (b.TotalRankScore || 0) - (a.TotalRankScore || 0);
        } else if (sortBy === 'badges') {
          return (Number(b["# of Skill Badges Completed"]) || 0) - (Number(a["# of Skill Badges Completed"]) || 0);
        } else {
          return (Number(b["# of Arcade Games Completed"]) || 0) - (Number(a["# of Arcade Games Completed"]) || 0);
        }
      });
  }, [data, searchTerm, filterType, sortBy]);

  const getStatusBadge = (isSelected: boolean) => {
    if (isSelected) {
      return (
        <span className="status-badge success">
          <Star size={12} fill="#1E8E3E" /> Selected
        </span>
      );
    }
    return <span className="status-badge neutral">In Progress</span>;
  };

  const getAvatarColor = (name: string) => {
    const index = (name?.charCodeAt(0) || 0) % GOOGLE_COLORS.length;
    return GOOGLE_COLORS[index];
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(60,64,67,.15)', border: '1px solid #dadce0' }}>
               <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            </div>
            <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'white', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Cloud size={16} color="#1A73E8" fill="#1A73E8" fillOpacity={0.1} />
            </div>
          </div>
          <div>
            <h1 className="logo-text" style={{ fontSize: '2.4rem', letterSpacing: '-0.03em' }}>
              <span className="logo-g">C</span>
              <span className="logo-o1">l</span>
              <span className="logo-o2">o</span>
              <span className="logo-g2">u</span>
              <span className="logo-l">d</span>
              <span className="logo-e">j</span>am Leaderboard
            </h1>
            <p style={{ color: '#5f6368', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.01em' }}>
               Official Google Cloud Campaign Academic Progress • 2026
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={fetchLeaderboard} style={{ width: '48px', padding: '0' }}>
            <RefreshCw size={20} className={loading ? 'spinning-animation' : ''} />
          </button>
          <button className="btn-primary filled" onClick={() => navigate('/admin')}>
            Admin Portal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div className="google-loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <h3 style={{ marginTop: '1.5rem', color: '#5f6368', fontWeight: 500 }}>Syncing with Google Cloud Platform...</h3>
        </div>
      ) : error ? (
         <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#D93025' }}>
          <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>System Sync Failed</h3>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="glass-card stat-card" style={{ borderBottom: '4px solid #1A73E8' }}>
              <Users size={20} color="#1A73E8" style={{ marginBottom: '0.5rem' }} />
              <div className="stat-value" style={{ color: '#202124' }}>{stats.total}</div>
              <div className="stat-label">Participants</div>
            </div>
            <div className="glass-card stat-card" style={{ borderBottom: '4px solid #1E8E3E' }}>
              <CheckCircle size={20} color="#1E8E3E" style={{ marginBottom: '0.5rem' }} />
              <div className="stat-value" style={{ color: '#1E8E3E' }}>{stats.completed}</div>
              <div className="stat-label">Milestones Met</div>
            </div>
            <div className="glass-card stat-card" style={{ borderBottom: '4px solid #F9AB00' }}>
              <Award size={20} color="#F9AB00" style={{ marginBottom: '0.5rem' }} />
              <div className="stat-value" style={{ color: '#F9AB00' }}>{stats.completionRate}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>

          <div className="search-container">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5f6368' }} size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by name or email..." 
                style={{ paddingLeft: '3.2rem', width: '100%', fontSize: '1rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select className="search-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="points">Sort: Total Points</option>
                <option value="badges">Sort: Badge Achievement</option>
                <option value="games">Sort: Arcade Wins</option>
              </select>

              <select className="search-input" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                <option value="all">View All Results</option>
                <option value="completed">Selected Winners</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            {sortedAndFilteredData.length === 0 ? (
              <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <Trophy size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
                <h3>No participants found</h3>
                <p style={{ color: '#5f6368' }}>Review your search keywords or filters.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                    <th>Participant Details</th>
                    <th>Score</th>
                    <th>Badges</th>
                    <th>Arcades</th>
                    <th>Selection</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredData.map((user, index) => {
                    const isCompleted = user.IsSelected;
                    return (
                      <tr key={user["User Email"] + index}>
                        <td className="rank-text">
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto',
                            background: index < 3 ? 'rgba(249, 171, 0, 0.1)' : '#f1f3f4',
                            color: index < 3 ? '#F9AB00' : '#5f6368',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}>
                            {index + 1}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                             <div style={{ 
                               width: '44px', 
                               height: '44px', 
                               background: getAvatarColor(user["User Name"]), 
                               borderRadius: '12px', 
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center', 
                               color: 'white',
                               fontWeight: 'bold',
                               fontSize: '1.2rem',
                               boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                             }}>
                              {user["User Name"]?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#202124', fontSize: '1.05rem' }}>{user["User Name"] || 'Unknown'}</div>
                              <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                <a href={user["Google Cloud Skills Boost Profile URL"]} target="_blank" rel="noreferrer" style={{ color: '#1A73E8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  Google Cloud Profile <ExternalLink size={12}/>
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#202124' }}>
                            {user.TotalRankScore}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#5f6368' }}>
                            {user["# of Skill Badges Completed"] || 0}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#5f6368' }}>
                            {user["# of Arcade Games Completed"] || 0}
                          </span>
                        </td>
                        <td>{getStatusBadge(!!isCompleted)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
