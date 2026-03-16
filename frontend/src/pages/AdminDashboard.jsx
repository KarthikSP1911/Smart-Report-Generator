import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ProctorList from '../components/ProctorList';
import './AdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const [proctors, setProctors] = useState([]);
  const [filteredProctors, setFilteredProctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all proctors on mount
  useEffect(() => {
    fetchProctors();
  }, []);

  const fetchProctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/proctors`);

      if (!response.ok) {
        throw new Error('Failed to fetch proctors');
      }

      const data = await response.json();
      setProctors(data.data || []);
      setFilteredProctors(data.data || []);
      setError(null);
    } catch (err) {
      setError('Unable to load proctors. Please ensure the server is running.');
      console.error('Error fetching proctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setFilteredProctors(proctors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/proctors/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setFilteredProctors(data.data || []);
    } catch (err) {
      console.error('Error searching proctors:', err);
      setFilteredProctors([]);
    }
  };

  const handleAddProctor = async (proctorData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/proctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proctorData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create proctor');
      }

      const data = await response.json();
      const updatedProctors = [...proctors, data.data];
      setProctors(updatedProctors);
      setFilteredProctors(updatedProctors);
      alert('Proctor added successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error adding proctor:', err);
    }
  };

  const handleEditProctor = async (proctorId, editData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/proctors/${proctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error('Failed to update proctor');
      }

      const data = await response.json();
      const updatedProctors = proctors.map(p => p.id === proctorId ? data.data : p);
      setProctors(updatedProctors);
      setFilteredProctors(updatedProctors);
      alert('Proctor updated successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error updating proctor:', err);
    }
  };

  const handleDeleteProctor = async (proctorId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/proctors/${proctorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete proctor');
      }

      const updatedProctors = proctors.filter(p => p.id !== proctorId);
      setProctors(updatedProctors);
      setFilteredProctors(updatedProctors);
      alert('Proctor deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error deleting proctor:', err);
    }
  };

  const handleAddStudent = async (proctorId, studentData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/proctors/${proctorId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add student');
      }

      // Refresh proctors data
      await fetchProctors();
      alert('Student added successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error adding student:', err);
    }
  };

  const handleEditStudent = async (studentId, editData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      // Refresh proctors data
      await fetchProctors();
      alert('Student updated successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error updating student:', err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      if (!window.confirm('Are you sure you want to remove this student?')) {
        return;
      }

      const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove student');
      }

      // Refresh proctors data
      await fetchProctors();
      alert('Student removed successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error removing student:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage proctors and their assigned students</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-content">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search proctors by name or ID..."
          />

          {loading ? (
            <div className="loading">Loading proctors...</div>
          ) : (
            <ProctorList
              proctors={filteredProctors}
              onAddProctor={handleAddProctor}
              onEditProctor={handleEditProctor}
              onDeleteProctor={handleDeleteProctor}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onRemoveStudent={handleRemoveStudent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
