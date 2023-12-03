import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const [allMembers, setAllMembers] = useState([]);
  const [displayedMembers, setDisplayedMembers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedMemberId, setEditedMemberId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState('');

  useEffect(() => {
    axios.get("https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json")
      .then(response => {
        const initialMembers = response.data;
        setAllMembers(initialMembers);
        setDisplayedMembers(initialMembers);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSearchDynamic = (event) => {
    const inputValue = event.target.value.toLowerCase();
    const updatedMembers = inputValue === '' ? allMembers : allMembers.filter(member =>
      Object.values(member).some(value =>
        String(value).toLowerCase().includes(inputValue)
      )
    );
    setDisplayedMembers(updatedMembers);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (id, name, email, role) => {
    setEditedMemberId(id);
    setEditedName(name);
    setEditedEmail(email);
    setEditedRole(role);
  };

  const handleSave = (id) => {
    const updatedMembers = allMembers.map(member =>
      member.id === id ? { ...member, name: editedName, email: editedEmail, role: editedRole } : member
    );
    setAllMembers(updatedMembers);
    setDisplayedMembers(updatedMembers);
    setEditedMemberId(null);
    setSelectedRows([]);
  };

  const handleCancel = () => {
    setEditedMemberId(null);
    setEditedName('');
    setEditedEmail('');
    setEditedRole('');
  };

  const handleDeleteRow = (id) => {
    const updatedMembers = allMembers.filter(member => member.id !== id);
    setAllMembers(updatedMembers);
    setDisplayedMembers(updatedMembers);
    setSelectedRows([]);
    setEditedMemberId(null);
  };

  const handleDelete = () => {
    const updatedMembers = allMembers.filter(member => !selectedRows.includes(member.id));
    setAllMembers(updatedMembers);
    setDisplayedMembers(updatedMembers);
    setSelectedRows([]);
    setEditedMemberId(null);
  };

  const toggleSelectAll = () => {
    const allSelected = selectedRows.length === ITEMS_PER_PAGE;
    setSelectedRows(allSelected ? [] : displayedMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(member => member.id));
    setEditedMemberId(null);
  };

  const handleRowSelect = (id, name, email, role) => {
    if (editedMemberId === id) {
      return;
    }

    const updatedSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter(rowId => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(updatedSelectedRows);
    setEditedMemberId(null);
  };

  const isRowEditing = (id) => editedMemberId === id;

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearchDynamic}
        />
      </div>
      <div className="delete-container">
        <button className="delete" onClick={handleDelete}>Delete Selected</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={selectedRows.length === ITEMS_PER_PAGE}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedMembers
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map(member => (
              <tr key={member.id} className={selectedRows.includes(member.id) ? 'selected-row' : ''}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleRowSelect(member.id, member.name, member.email, member.role)}
                    checked={selectedRows.includes(member.id)}
                  />
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  ) : (
                    member.name
                  )}
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <input
                      type="text"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  ) : (
                    member.email
                  )}
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <input
                      type="text"
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value)}
                    />
                  ) : (
                    member.role
                  )}
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <>
                      <button className="save" onClick={() => handleSave(member.id)}>Save</button>
                      <button className="cancel" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="edit" onClick={() => handleEdit(member.id, member.name, member.email, member.role)}>Edit</button>
                      <button className="delete" onClick={() => handleDeleteRow(member.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <button className="first-page" onClick={() => handlePageChange(1)}>First Page</button>
        <button className="previous-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous Page</button>
        {Array.from({ length: Math.ceil(displayedMembers.length / ITEMS_PER_PAGE) }, (_, index) => (
          <button className='btnName' key={index + 1} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
        ))}
        <button className="next-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(displayedMembers.length / ITEMS_PER_PAGE)}>Next Page</button>
        <button className="last-page" onClick={() => handlePageChange(Math.ceil(displayedMembers.length / ITEMS_PER_PAGE))}>Last Page</button>
      </div>
    </div>
  );
};

export default Dashboard;
