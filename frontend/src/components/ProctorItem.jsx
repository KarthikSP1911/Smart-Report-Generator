import React, { useState } from 'react';
import StudentList from './StudentList';
import './ProctorItem.css';

function ProctorItem({ proctor, onEditProctor, onDeleteProctor, onAddStudent, onEditStudent, onRemoveStudent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: proctor.name || '', password: '' });

  const handleEditProctor = async () => {
    if (!editData.name) {
      alert('Name cannot be empty');
      return;
    }
    await onEditProctor(proctor.id, editData);
    setIsEditing(false);
  };

  return (
    <div className="proctor-item">
      <div className="proctor-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="proctor-expand-btn"
          title={isExpanded ? 'Hide students' : 'Show students'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        <div className="proctor-info">
          {isEditing ? (
            <div className="proctor-edit-form">
              <input
                type="text"
                placeholder="Proctor Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="edit-input-field"
              />
              <input
                type="password"
                placeholder="Password (leave empty to keep current)"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                className="edit-input-field"
              />
            </div>
          ) : (
            <div>
              <h3 className="proctor-name">{proctor.name || proctor.proctorId}</h3>
              <p className="proctor-id">ID: {proctor.proctorId}</p>
            </div>
          )}
        </div>

        <div className="proctor-actions">
          {isEditing ? (
            <>
              <button onClick={handleEditProctor} className="btn-save">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-cancel">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this proctor?')) {
                    onDeleteProctor(proctor.id);
                  }
                }}
                className="btn-delete"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="proctor-details">
          <StudentList
            students={proctor.students || []}
            proctorId={proctor.id}
            onAddStudent={onAddStudent}
            onEditStudent={onEditStudent}
            onRemoveStudent={onRemoveStudent}
          />
        </div>
      )}
    </div>
  );
}

export default ProctorItem;
