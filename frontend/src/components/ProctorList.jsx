import React, { useState } from 'react';
import ProctorItem from './ProctorItem';
import './ProctorList.css';

function ProctorList({ proctors, onEditProctor, onDeleteProctor, onAddStudent, onEditStudent, onRemoveStudent, onAddProctor }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProctor, setNewProctor] = useState({ proctorId: '', name: '', password: '' });

  const handleAddProctor = async (e) => {
    e.preventDefault();
    if (!newProctor.proctorId || !newProctor.password) {
      alert('Proctor ID and Password are required');
      return;
    }
    await onAddProctor(newProctor);
    setNewProctor({ proctorId: '', name: '', password: '' });
    setIsAdding(false);
  };

  return (
    <div className="proctor-list">
      <div className="proctor-list-header">
        <h2>Proctors</h2>
        {!isAdding ? (
          <button onClick={() => setIsAdding(true)} className="btn-add-proctor">
            + Add Proctor
          </button>
        ) : null}
      </div>

      {isAdding && (
        <form onSubmit={handleAddProctor} className="add-proctor-form">
          <input
            type="text"
            placeholder="Proctor ID"
            value={newProctor.proctorId}
            onChange={(e) => setNewProctor({ ...newProctor, proctorId: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newProctor.name}
            onChange={(e) => setNewProctor({ ...newProctor, name: e.target.value })}
            className="form-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={newProctor.password}
            onChange={(e) => setNewProctor({ ...newProctor, password: e.target.value })}
            className="form-input"
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Create Proctor
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewProctor({ proctorId: '', name: '', password: '' });
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="proctors-container">
        {proctors && proctors.length > 0 ? (
          proctors.map((proctor) => (
            <ProctorItem
              key={proctor.id}
              proctor={proctor}
              onEditProctor={onEditProctor}
              onDeleteProctor={onDeleteProctor}
              onAddStudent={onAddStudent}
              onEditStudent={onEditStudent}
              onRemoveStudent={onRemoveStudent}
            />
          ))
        ) : (
          <p className="no-proctors">No proctors found</p>
        )}
      </div>
    </div>
  );
}

export default ProctorList;
