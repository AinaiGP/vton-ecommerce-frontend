import React from 'react';

export default function AdminCategories() {
  const categories = ["Dresses", "T-shirts", "Formal", "Accessories"];
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Admin - Category Management</h1>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Category Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={index}>
              <td>{cat}</td>
              <td><button style={{ color: 'red' }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px' }}>
        <input type="text" placeholder="New Category" />
        <button>Add Category</button>
      </div>
    </div>
  );
}
