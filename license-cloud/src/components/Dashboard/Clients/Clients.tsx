import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Clients.css";

interface Client {
  client_id: string;
  client_name: string;
  users: number;
  active_users: number;
  serial_number: number;
}

const Clients: React.FC = () => {
  const sampleData: Client[] = [
    {"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":30,"active_users":3,"serial_number":1},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":5,"active_users":5,"serial_number":2},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":3,"active_users":3,"serial_number":2},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":5,"active_users":5,"serial_number":2},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":20,"active_users":10,"serial_number":2},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":30,"active_users":4,"serial_number":1},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":30,"active_users":4,"serial_number":1},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":30,"active_users":6,"serial_number":1},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":20,"active_users":10,"serial_number":2},{"client_id":"","client_name":"Aryabhat","users":20,"active_users":3,"serial_number":1},{"client_id":"YEZZBT4T400XFJS2","client_name":"Varroc","users":1,"active_users":0,"serial_number":3},{"client_id":"U794ZVY2U4M4TN43","client_name":"Demo","users":1,"active_users":0,"serial_number":0},{"client_id":"LXRTQE95SL9NDCDE","client_name":"ASyasd","users":1,"active_users":0,"serial_number":1},{"client_id":"27ATLSPHL7BI6FSQ","client_name":"","users":1,"active_users":0,"serial_number":1},{"client_id":"27ATLSPHL7BI6FSQ","client_name":"","users":1,"active_users":0,"serial_number":1},{"client_id":"27ATLSPHL7BI6FSQ","client_name":"","users":7,"active_users":0,"serial_number":1},{"client_id":"IBHQYMP5T2OA3UIO","client_name":"New Client","users":1,"active_users":0,"serial_number":1},{"client_id":"","client_name":"Aryabhat","users":30,"active_users":8,"serial_number":1},{"client_id":"VRI8MMZ35Q1IF2OR","client_name":"Diagonal","users":20,"active_users":10,"serial_number":2},{"client_id":"IBHQYMP5T2OA3UIO","client_name":"New Client","users":1,"active_users":0,"serial_number":1},{"client_id":"YEZZBT4T400XFJS2","client_name":"Varroc","users":1,"active_users":0,"serial_number":1},{"client_id":"","client_name":"Aryabhat","users":19,"active_users":0,"serial_number":1},{"client_id":"","client_name":"Aryabhat","users":30,"active_users":8,"serial_number":1}
  ];

  const [clients] = useState<Client[]>(sampleData);
  const [filteredClients, setFilteredClients] = useState<Client[]>(sampleData);
  const [filters] = useState({
    client_name: "",
    client_id: "",
    users: "",
    active_users: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{key: keyof Client, direction: 'ascending' | 'descending'} | null>(null);

  useEffect(() => {
    let result = clients;
    
    if (filters.client_name) {
      result = result.filter(client => 
        client.client_name.toLowerCase().includes(filters.client_name.toLowerCase())
      );
    }
    
    if (filters.client_id) {
      result = result.filter(client => 
        client.client_id.toLowerCase().includes(filters.client_id.toLowerCase())
      );
    }
    
    if (filters.users) {
      result = result.filter(client => 
        client.users.toString().includes(filters.users)
      );
    }
    
    if (filters.active_users) {
      result = result.filter(client => 
        client.active_users.toString().includes(filters.active_users)
      );
    }
    
    // Apply sorting if configured
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredClients(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, clients, sortConfig]);

  // // Handle filter change
  // const handleFilterChange = (key: string, value: string) => {
  //   setFilters(prevFilters => ({
  //     ...prevFilters,
  //     [key]: value
  //   }));
  // };

  // Handle sorting
  const requestSort = (key: keyof Client) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Render sorting indicator
  const getSortIndicator = (key: keyof Client) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '↕';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1>Clients</h1>
        <p>View and manage your client accounts</p>
      </div>

      <div className="table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('client_id')}>
                Client ID {getSortIndicator('client_id')}
                {/* <div className="filter-container">
                  <input 
                    type="text" 
                    placeholder="Filter..." 
                    onChange={(e) => handleFilterChange('client_id', e.target.value)}
                    className="filter-input"
                  />
                </div> */}
              </th>
              <th onClick={() => requestSort('client_name')}>
                Client Name {getSortIndicator('client_name')}
                {/* <div className="filter-container">
                  <input 
                    type="text" 
                    placeholder="Filter..." 
                    onChange={(e) => handleFilterChange('client_name', e.target.value)}
                    className="filter-input"
                  />
                </div> */}
              </th>
              <th onClick={() => requestSort('users')}>
                Users {getSortIndicator('users')}
                {/* <div className="filter-container">
                  <input 
                    type="text" 
                    placeholder="Filter..." 
                    onChange={(e) => handleFilterChange('users', e.target.value)}
                    className="filter-input"
                  />
                </div> */}
              </th>
              <th onClick={() => requestSort('active_users')}>
                Active Users {getSortIndicator('active_users')}
                {/* <div className="filter-container">
                  <input 
                    type="text" 
                    placeholder="Filter..." 
                    onChange={(e) => handleFilterChange('active_users', e.target.value)}
                    className="filter-input"
                  />
                </div> */}
              </th>
               <th onClick={() => requestSort('serial_number')}>
                Serial Number {getSortIndicator('serial_number')}
                {/* <div className="filter-container">
                  <input 
                    type="text" 
                    placeholder="Filter..." 
                    onChange={(e) => handleFilterChange('serial_number', e.target.value)}
                    className="filter-input"
                  />
                </div> */}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((client, index) => (
                <tr key={`${client.client_id}-${index}`}>
                  <td className="client-id">{client.client_id}</td>
                  <td>{client.client_name}</td>
                  <td>{client.users}</td>
                  <td>{client.active_users}</td>
                  <td>{client.serial_number}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-results">No clients match your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={goToPreviousPage} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages} ({filteredClients.length} total records)
        </span>
        <button 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Clients;
