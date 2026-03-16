import React, { useState } from 'react';
import './StudentList.css';

function StudentList({ students, proctorId, onAddStudent, onEditStudent, onRemoveStudent }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ usn: '', dob: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ dob: '' });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.usn || !newStudent.dob) {
      alert('Please fill in all fields');
      return;
    }
    await onAddStudent(proctorId, newStudent);
    setNewStudent({ usn: '', dob: '' });
    setIsAdding(false);
  };

  const handleEditStudent = async (studentId, updatedData) => {
    await onEditStudent(studentId, updatedData);
    setEditingId(null);
    setEditData({ dob: '' });
  };

  return (
    <div className="student-list">
      <h4>Students</h4>
      
      {students && students.length > 0 ? (
        <table className="students-table">
          <thead>
            <tr>
              <th>USN</th>
              <th>DOB</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="student-row">
                <td>{student.usn}</td>
                <td>
                  {editingId === student.id ? (
                    <input
                      type="date"
                      value={editData.dob}
                      onChange={(e) => setEditData({ dob: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    student.dob
                  )}
                </td>
                <td className="actions-cell">
                  {editingId === student.id ? (
                    <>
                      <button
                        onClick={() => handleEditStudent(student.id, editData)}
                        className="btn-save"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(student.id);
                          setEditData({ dob: student.dob });
                        }}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onRemoveStudent(student.id)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-students">No students assigned</p>
      )}

      <div className="add-student-section">
        {!isAdding ? (
          <button onClick={() => setIsAdding(true)} className="btn-add-student">
            + Add Student
          </button>
        ) : (
          <form onSubmit={handleAddStudent} className="add-student-form">
            <input
              type="text"
              placeholder="Student USN"
              value={newStudent.usn}
              onChange={(e) => setNewStudent({ ...newStudent, usn: e.target.value })}
              className="form-input"
            />
            <input
              type="date"
              value={newStudent.dob}
              onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
              className="form-input"
            />
            <button type="submit" className="btn-submit">
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewStudent({ usn: '', dob: '' });
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default StudentList;
