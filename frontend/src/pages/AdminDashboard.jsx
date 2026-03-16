import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Let's use custom CSS

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [proctors, setProctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New proctor form state
  const [newProctor, setNewProctor] = useState({ proctorId: '', name: '', password: '' });
  
  // New student form state per proctor key
  const [newStudent, setNewStudent] = useState({});

  // Dropdown open state
  const [openProctor, setOpenProctor] = useState(null);

  useEffect(() => {
    fetchProctors();
  }, []);

  const fetchProctors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/proctors`);
      if (response.data.success) {
        setProctors(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch proctors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProctor = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/proctors`, newProctor);
      if (response.data.success) {
        setProctors([...proctors, response.data.data]);
        setNewProctor({ proctorId: '', name: '', password: '' });
      }
    } catch (err) {
      alert('Error adding proctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProctor = async (id, e) => {
    e.stopPropagation(); // prevent toggling dropdown
    if (!window.confirm("Are you sure you want to remove this proctor?")) return;
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/proctors/${id}`);
      if (response.data.success) {
        setProctors(proctors.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Error deleting proctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddStudent = async (proctorId, e) => {
    e.preventDefault();
    const studentData = newStudent[proctorId];
    if (!studentData?.usn) return;

    try {
      const payload = { usn: studentData.usn };
      if (studentData.dob && studentData.dob.trim() !== '') {
        payload.dob = studentData.dob.trim();
      }

      const response = await axios.post(`${API_BASE_URL}/admin/proctors/${proctorId}/students`, payload);
      if (response.data.success) {
        // Updated state locally
        const updatedProctors = proctors.map(p => {
          if (p.id === proctorId) {
            // Add student if not exists, else update
            const exists = p.students.find(s => s.id === response.data.data.id);
            if (!exists) {
              return { ...p, students: [...p.students, response.data.data] };
            }
          }
          return p;
        });
        setProctors(updatedProctors);
        setNewStudent({ ...newStudent, [proctorId]: { usn: '', dob: '' } });
      }
    } catch (err) {
      alert('Error adding student: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveStudent = async (proctorId, studentId) => {
    if (!window.confirm("Are you sure you want to unassign this student?")) return;
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/proctors/${proctorId}/students/${studentId}`);
      if (response.data.success) {
        const updatedProctors = proctors.map(p => {
          if (p.id === proctorId) {
            return { ...p, students: p.students.filter(s => s.id !== studentId) };
          }
          return p;
        });
        setProctors(updatedProctors);
      }
    } catch (err) {
      alert('Error removing student: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleDropdown = (id) => {
    setOpenProctor(openProctor === id ? null : id);
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        <div className="admin-header-section">
          <h1 className="admin-title">Admin Control Center</h1>
          <p className="admin-subtitle">Manage proctors and class assignments</p>
        </div>

      <div className="admin-content">
        <div className="admin-proctors-section">
          <h2 className="admin-section-title">Manage Proctors</h2>
          
          <form className="admin-add-form" onSubmit={handleAddProctor}>
            <input 
              type="text" 
              className="admin-input"
              placeholder="Proctor ID (e.g. P101)" 
              required 
              value={newProctor.proctorId}
              onChange={e => setNewProctor({...newProctor, proctorId: e.target.value})}
            />
            <input 
              type="text" 
              className="admin-input"
              placeholder="Full Name" 
              value={newProctor.name}
              onChange={e => setNewProctor({...newProctor, name: e.target.value})}
            />
            <input 
              type="password" 
              className="admin-input"
              placeholder="Assign Password" 
              required 
              value={newProctor.password}
              onChange={e => setNewProctor({...newProctor, password: e.target.value})}
            />
            <button className="btn btn-primary" type="submit">Create Proctor</button>
          </form>

          <div className="admin-proctors-list">
            {proctors.length === 0 ? (
              <p className="no-data">No proctors found.</p>
            ) : (
              proctors.map(proctor => (
                <div key={proctor.id} className="proctor-card">
                  <div className="proctor-header" onClick={() => toggleDropdown(proctor.id)}>
                    <div className="proctor-info">
                      <h3>{proctor.name} ({proctor.proctorId})</h3>
                      <span className="badge">{proctor.students?.length || 0} Students</span>
                    </div>
                    <div className="proctor-actions">
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => handleDeleteProctor(proctor.id, e)}
                      >
                        Remove
                      </button>
                      <span className={`dropdown-icon ${openProctor === proctor.id ? 'open' : ''}`}>&#9660;</span>
                    </div>
                  </div>

                  {openProctor === proctor.id && (
                    <div className="proctor-students">
                      <div className="students-list">
                        <h4>Assigned Students</h4>
                        {(!proctor.students || proctor.students.length === 0) ? (
                          <p className="no-students">No students assigned yet.</p>
                        ) : (
                          <ul>
                            {proctor.students.map(student => (
                              <li key={student.id} className="student-item">
                                <div className="student-info">
                                  <span className="student-usn">{student.usn}</span>
                                  <span className="student-dob">DOB: {student.dob || 'Not set'}</span>
                                </div>
                                <button 
                                  className="btn btn-text text-danger"
                                  onClick={() => handleRemoveStudent(proctor.id, student.id)}
                                >
                                  Unassign
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <form 
                        className="add-student-form" 
                        onSubmit={(e) => handleAddStudent(proctor.id, e)}
                      >
                        <input 
                          type="text" 
                          className="admin-input"
                          placeholder="Student USN" 
                          required 
                          value={newStudent[proctor.id]?.usn || ''}
                          onChange={(e) => setNewStudent({
                            ...newStudent, 
                            [proctor.id]: { ...newStudent[proctor.id], usn: e.target.value }
                          })}
                        />
                        <input 
                          type="text" 
                          className="admin-input"
                          placeholder="DOB (Optional)" 
                          value={newStudent[proctor.id]?.dob || ''}
                          onChange={(e) => setNewStudent({
                            ...newStudent, 
                            [proctor.id]: { ...newStudent[proctor.id], dob: e.target.value }
                          })}
                        />
                        <button className="btn btn-secondary btn-sm" type="submit">+ Assign</button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div></div>
    </div>
  );
}
