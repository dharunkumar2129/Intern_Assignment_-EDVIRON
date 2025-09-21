import React, { useState, useEffect } from 'react';

// --- Helper Components (SVG Icons & Spinner) ---
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const Spinner = ({ size = '8' }) => (<div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-white mx-auto`}></div>);

// --- Authentication Form Components ---
const RegisterForm = ({ setView }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'student' }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to register');
            setSuccess('Registration successful! Please log in.');
            setTimeout(() => setView('login'), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-lg">
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="form-header">Create Student Account</h2>
                {error && <p className="alert-error">{error}</p>}
                {success && <p className="alert-success">{success}</p>}
                <div className="input-group"><div className="icon-wrapper"><span className="icon-span"><UserIcon /></span></div><input className="input-field" name="username" type="text" placeholder="Full Name" onChange={handleChange} required/></div>
                <div className="input-group"><div className="icon-wrapper"><span className="icon-span"><MailIcon /></span></div><input className="input-field" name="email" type="email" placeholder="Email Address" onChange={handleChange} required/></div>
                <div className="input-group mb-6"><div className="icon-wrapper"><span className="icon-span"><LockIcon /></span></div><input className="input-field" name="password" type="password" placeholder="Password" onChange={handleChange} required/></div>
                <button className="btn-primary w-full" type="submit">Sign Up</button>
                <p className="form-footer-text">Already have an account? <span onClick={() => setView('login')} className="link">Log In</span></p>
            </form>
        </div>
    );
};

const LoginForm = ({ setView, onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to login');
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-lg">
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="form-header">Welcome Back</h2>
                {error && <p className="alert-error">{error}</p>}
                <div className="input-group"><div className="icon-wrapper"><span className="icon-span"><MailIcon /></span></div><input className="input-field" name="email" type="email" placeholder="Email Address" onChange={handleChange} required/></div>
                <div className="input-group mb-6"><div className="icon-wrapper"><span className="icon-span"><LockIcon /></span></div><input className="input-field" name="password" type="password" placeholder="Password" onChange={handleChange} required/></div>
                <button className="btn-primary w-full" type="submit">Log In</button>
                <p className="form-footer-text">No account? <span onClick={() => setView('register')} className="link">Register as Student</span></p>
            </form>
        </div>
    );
};

// --- Portal/Dashboard Components ---

const AdminDashboard = ({ user, token, onLogout }) => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError('');
            try {
                const url = filter === 'all' 
                    ? 'http://localhost:5000/api/admin/transactions'
                    : `http://localhost:5000/api/admin/transactions?status=${filter}`;
                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Failed to fetch transactions.');
                const data = await response.json();
                setTransactions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [token, filter]);

    return (
        <div className="page-container md:max-w-4xl lg:max-w-6xl">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-lg">Welcome, <span className="font-bold">{user.username}</span>!</p>
                <button onClick={onLogout} className="btn-secondary">Logout</button>
            </div>

            <div className="my-6">
                <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setFilter('all')} className={filter === 'all' ? 'btn-filter-active' : 'btn-filter'}>All</button>
                    <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'btn-filter-active' : 'btn-filter'}>Pending</button>
                    <button onClick={() => setFilter('success')} className={filter === 'success' ? 'btn-filter-active' : 'btn-filter'}>Success</button>
                    <button onClick={() => setFilter('failed')} className={filter === 'failed' ? 'btn-filter-active' : 'btn-filter'}>Failed</button>
                </div>
                
                <div className="overflow-x-auto bg-slate-800 rounded-lg">
                    {loading ? <div className="p-8"><Spinner size="10"/></div> : error ? <p className="text-red-400 p-4">{error}</p> :
                    <table className="w-full text-left">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="p-3">Student Name</th>
                                <th className="p-3">Student Email</th>
                                <th className="p-3">Amount (INR)</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-6 text-gray-400">No transactions found for this filter.</td></tr>
                            ) : transactions.map(tx => (
                                <tr key={tx._id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="p-3">{tx.collect_id?.student_info?.name || 'N/A'}</td>
                                    <td className="p-3">{tx.collect_id?.student_info?.email || 'N/A'}</td>
                                    <td className="p-3">{(tx.order_amount || 0).toFixed(2)}</td>
                                    <td className="p-3"><span className={`status-badge status-${tx.status}`}>{tx.status}</span></td>
                                    <td className="p-3">{new Date(tx.collect_id?.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    }
                </div>
            </div>
        </div>
    );
};

const StudentPortal = ({ user, token, onLogout, onUserUpdate }) => {
    const [details, setDetails] = useState({ studentId: user.studentId || '', className: user.className || '', section: user.section || '' });
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const showDetailsForm = !user.studentId;

    const handleDetailsChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('http://localhost:5000/api/student/details', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(details),
            });
            const updatedUser = await response.json();
            if (!response.ok) throw new Error(updatedUser.message || 'Failed to update details.');
            onUserUpdate(updatedUser);
            setSuccess('Details saved successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setError('Please enter a valid amount.'); return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/payment/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({ amount: Number(amount) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to initiate payment.');
            window.location.href = data.paymentUrl;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
       <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Student Portal</h1>
                <button onClick={onLogout} className="btn-secondary">Logout</button>
            </div>
            <p className="text-lg mb-6">Welcome, <span className="font-bold">{user.username}</span>!</p>

            {showDetailsForm ? (
                <form onSubmit={handleDetailsSubmit} className="form-section">
                    <h3 className="form-title">Complete Your Profile</h3>
                    <p className="form-subtitle">Please provide your details before proceeding to payment.</p>
                    {error && <p className="alert-error">{error}</p>}
                    {success && <p className="alert-success">{success}</p>}
                    <label className="input-label">Student ID</label>
                    <input name="studentId" value={details.studentId} onChange={handleDetailsChange} className="input-field mb-4" required/>
                    <label className="input-label">Class</label>
                    <input name="className" value={details.className} onChange={handleDetailsChange} className="input-field mb-4" required/>
                    <label className="input-label">Section</label>
                    <input name="section" value={details.section} onChange={handleDetailsChange} className="input-field mb-4" required/>
                    <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Spinner /> : 'Save Details'}</button>
                </form>
            ) : (
                <form onSubmit={handlePayment} className="form-section">
                    <h3 className="form-title">Pay Your Fees</h3>
                    {error && <p className="alert-error">{error}</p>}
                    <label className="input-label">Amount (INR)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 5000" className="input-field mb-4" required />
                    <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <Spinner /> : 'Proceed to Payment'}</button>
                </form>
            )}
        </div>
    );
};

const PaymentCallback = () => (
    <div className="page-container text-center">
        <h1 className="text-3xl font-bold mb-4">Processing Payment...</h1>
        <p className="text-gray-400">Please wait while we confirm your transaction. You will be redirected shortly.</p>
        <div className="mt-8"><Spinner size="12"/></div>
    </div>
);

// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('login');
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (token && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                const path = window.location.pathname;
                if (path.includes('/payment-callback')) {
                    setView('payment-callback');
                } else {
                    setView(parsedUser.role === 'admin' ? 'dashboard' : 'student');
                }
            } else {
                setView('login');
            }
        } catch (e) {
            localStorage.clear();
            setView('login');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const handleLogin = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    };

    const handleUserUpdate = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
        setView('login');
        window.history.pushState({}, '', '/');
    };

    const renderView = () => {
        if (view === 'payment-callback') return <PaymentCallback />;
        
        if (user && token) {
            if (user.role === 'admin') {
                return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
            }
            return <StudentPortal user={user} token={token} onLogout={handleLogout} onUserUpdate={handleUserUpdate}/>;
        }
        
        return view === 'register'
            ? <RegisterForm setView={setView} />
            : <LoginForm setView={setView} onLogin={handleLogin} />;
    };

    return (
        <main className="main-container">
              <div className="header-container">
                  <h1 className="header-title">School Payment Portal <span className="header-span">(V2)</span></h1>
                  <p className="header-subtitle">Secure | Reliable | Efficient</p>
              </div>

              {isLoading ? <Spinner size="12" /> : renderView()}

              <style>{`
                  * { margin: 0; padding: 0; box-sizing: border-box; }

                  html, body { height: 100%; overflow-x: hidden; }

                  :root { 
                      --main-bg: #000000; 
                      --container-bg: #0D1117; 
                      --form-bg: #161B22; 
                      --border-color: #21262D; 
                      --primary-color: #238636; 
                      --primary-hover: #2EA043; 
                      --link-color: #58A6FF; 
                      --text-primary: #E6EDF3;
                      --text-secondary: #8B949E;
                  }
                  
                  .main-container { background-color: var(--main-bg); color: var(--text-primary); min-height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 1rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; position: relative; overflow: hidden; }
                  .header-container { text-align: center; margin-bottom: 2.5rem; }
                  .form-header { font-size: 1.75rem; font-weight: 650; text-align: center; color: #F0F6FC; margin-bottom: 2rem; animation: slideInFromTop 0.5s ease-out; }
                  .icon-wrapper { position: absolute; inset-y: 0; left: 0; padding-left: 0.875rem; display: flex; align-items: center; pointer-events: none; color: var(--text-secondary); }
                  .link { font-weight: 600; color: var(--link-color); cursor: pointer; padding-left:7rem;text-shadow: 0 0 8px rgba(88, 166, 255, 0.6); transition: all 0.2s ease-in-out; }                .form-subtitle { color: var(--text-secondary); margin-bottom: 1rem; animation: fadeInUp 0.4s ease-out 0.1s both; }

                  .input-field { appearance: none; width: 100%; padding: 0.875rem 0.875rem 0.875rem 2.75rem; border-radius: 0.5rem; background-color: var(--main-bg); border: 1px solid var(--border-color); color: var(--text-primary); transition: border-color 0.2s, box-shadow 0.2s; font-size: 1rem; }
                  .input-field:focus { outline: none; border-color: var(--link-color); box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2); }
                  
                  .btn-primary { background-color: var(--primary-color); color: white; font-weight: 600; padding: 0.875rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s, transform 0.2s; width: 100%; display: flex; justify-content: center; align-items: center; min-height: 48px; cursor: pointer; border: 1px solid rgba(240, 246, 252, 0.1); }
                  .btn-primary:hover { background-color: var(--primary-hover); }
                  .btn-primary:disabled { background-color: #21262D; cursor: not-allowed; }

                  .btn-secondary { background-color: #21262D; color: var(--text-primary); font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s, border-color 0.2s; border: 1px solid var(--border-color); }
                  .btn-secondary:hover { background-color: #30363D; border-color: var(--text-secondary); }
                  
                  .link { font-weight: 600; color: var(--link-color); cursor: pointer; }
                  .link:hover { text-decoration: underline; }

                  .page-container { width: 100%; max-width: 42rem; padding: 2rem; background-color: var(--container-bg); border-radius: 0.75rem; border: 1px solid var(--border-color); }
                  
                  .icon-wrapper { position: absolute; inset-y: 0; left: 0; padding-left: 0.875rem; display: flex; align-items: center; pointer-events: none; color: var(--text-secondary); }
                  .icon-span { width: 1.25rem; height: 1.25rem; }
                  
                  .form-container { background-color: var(--container-bg); box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3), 0 0 15px rgba(35, 134, 54, 0.1); border-radius: 0.75rem; padding: 2.5rem; border: 1px solid var(--border-color); }
                  .form-header { font-size: 1.75rem; font-weight: 600; text-align: center; color: #F0F6FC; margin-bottom: 2rem; }
                  .form-footer-text { text-align: center; color: var(--text-secondary); font-size: 0.875rem; margin-top: 1.5rem; }
                  .input-group { margin-bottom: 1.25rem; position: relative; }
                  
                  .form-section { margin-top: 2rem; background-color: var(--form-bg); padding: 1.5rem; border-radius: 0.75rem; }
                  .form-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
                  .form-subtitle { color: var(--text-secondary); margin-bottom: 1rem; }
                  .input-label { display: block; color: var(--text-primary); margin-bottom: 0.5rem; font-size: 0.875rem; }

                  .alert-error { background-color: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.4); color: #F87171; text-align: center; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
                  .alert-success { background-color: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.4); color: #34D399; text-align: center; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
                  
                  .btn-filter { background-color: #21262D; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; }
                  .btn-filter-active { background-color: var(--link-color); color: #0D1117; padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid var(--link-color); }

                  .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
                  .status-pending { background-color: rgba(251, 191, 36, 0.2); color: #FBBF24; }
                  .status-success { background-color: rgba(52, 211, 153, 0.2); color: #34D399; }
                  .status-failed { background-color: rgba(248, 113, 113, 0.2); color: #F87171; }
              `}</style>
        </main>
    );
}

