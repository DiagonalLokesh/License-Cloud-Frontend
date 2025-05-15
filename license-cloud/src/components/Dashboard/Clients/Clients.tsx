import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, User, Briefcase, Phone, Calendar, Key, Database, HardDrive, Globe, MessageSquare } from "lucide-react";
import "./Clients.css";
import storageService from "../../../utils/storageService";
import { ENDPOINTS } from "../../../API/Endpoint";

interface Client {
  client_id: string;
  client_name: string;
  users: number;
  active_users: number;
  serial_number: number;
  status: string;
  created_at: string;
  expiry_date: string;
  license_number: string;
  signed_license_key: string;
  license_type: string;
  translation: boolean;
  storage_device: boolean;
  database: boolean;
  message: string | null;
  contact_person_name: string | null;
  contact_person_designation: string | null;
  contact_person_mobile_number: string | null;
}

interface DetailCardProps {
  client: Client;
  cardType: 'contact' | 'license';
  onClose: () => void;
}

const DetailCard: React.FC<DetailCardProps> = ({ client, cardType, onClose }) => {
  // Ref for the card to implement click outside to close
  const cardRef = useRef<HTMLDivElement>(null);

  // Effect for handling click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Format date strings for better display
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="detail-card-overlay">
      <div className="detail-card" ref={cardRef}>
        <div className="detail-card-header">
          <h3>{cardType === 'contact' ? 'Contact Details' : 'License Details'}</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="detail-card-content">
          {cardType === 'contact' ? (
            <div className="contact-details">
              <div className="detail-item">
                <span className="detail-label">Client Name</span>
                <span className="detail-value">{client.client_name}</span>
              </div>
              <div className="detail-item" style={{ marginTop: '20px' }}>
                <span className="detail-label">Client ID</span>
                <span className="detail-value">{client.client_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <User size={16} style={{ marginRight: '8px' }} /> Contact Person
                </span>
                <span className={`detail-value ${!client.contact_person_name ? 'not-specified' : ''}`}>
                  {client.contact_person_name || "Null"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <Briefcase size={16} style={{ marginRight: '8px' }} /> Designation
                </span>
                <span className={`detail-value ${!client.contact_person_designation ? 'not-specified' : ''}`}>
                  {client.contact_person_designation || "Null"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <Phone size={16} style={{ marginRight: '8px' }} /> Mobile Number
                </span>
                <span className={`detail-value ${!client.contact_person_mobile_number ? 'not-specified' : ''}`}>
                  {client.contact_person_mobile_number || "Null"}
                </span>
              </div>
              
              
            </div>
          ) : (
            <div className="license-details">
              <div className="detail-item">
                <span className="detail-label">
                  <Key size={16} style={{ marginRight: '8px' }} /> License Type
                </span>
                <span className={`detail-value ${!client.license_type ? 'not-specified' : ''}`}>
                  {client.license_type || "Null"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">License Number</span>
                <span className="detail-value">{client.license_number || "Null"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Serial Number</span>
                <span className="detail-value">{client.serial_number || "Null"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <Calendar size={16} style={{ marginRight: '8px' }} /> Created At
                </span>
                <span className="detail-value">{formatDate(client.created_at) || "Null"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <Calendar size={16} style={{ marginRight: '8px' }} /> Expiry Date
                </span>
                <span className="detail-value">{formatDate(client.expiry_date) || "Null"}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">
                  <Globe size={16} style={{ marginRight: '8px' }} /> Translation
                </span>
                <span className="detail-value boolean-value">
                  <span className={`boolean-indicator ${client.translation ? 'enabled' : ''}`}></span>
                  {client.translation ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <HardDrive size={16} style={{ marginRight: '8px' }} /> Storage Device
                </span>
                <span className="detail-value boolean-value">
                  <span className={`boolean-indicator ${client.storage_device ? 'enabled' : ''}`}></span>
                  {client.storage_device ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <Database size={16} style={{ marginRight: '8px' }} /> Database
                </span>
                <span className="detail-value boolean-value">
                  <span className={`boolean-indicator ${client.database ? 'enabled' : ''}`}></span>
                  {client.database ? "Enabled" : "Disabled"}
                </span>
              </div>
              
              {client.message && (
                <div className="detail-item">
                  <span className="detail-label">
                    <MessageSquare size={16} style={{ marginRight: '8px' }} /> Message
                  </span>
                  <span className="detail-value">{client.message}</span>
                </div>
              )}
              
              {client.signed_license_key && (
                <div className="detail-item">
                  <span className="detail-label">Signed License Key</span>
                  <span className="license-key">{client.signed_license_key}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filters] = useState({
    client_name: "",
    client_id: "",
    users: "",
    active_users: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig] = useState<{key: keyof Client, direction: 'ascending' | 'descending'} | null>(null);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  
  // State for detail card
  const [detailCard, setDetailCard] = useState<{
    visible: boolean;
    client: Client | null;
    type: 'contact' | 'license';
  }>({
    visible: false,
    client: null,
    type: 'contact'
  });

  // Fetch clients data from API
  useEffect(() => {
    const fetchClientsData = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(ENDPOINTS.DASHBOARD.CLIENTS, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json() as Client[];
        setClients(data);
        setFilteredClients(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Failed to fetch clients data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClientsData();
  }, [accessToken]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuIndex !== null) {
        const currentMenuRef = menuRefs.current[openMenuIndex];
        if (currentMenuRef && !currentMenuRef.contains(event.target as Node)) {
          setOpenMenuIndex(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuIndex]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...clients];
    
    if (filters.client_name) {
      result = result.filter(client => 
        client.client_name?.toLowerCase().includes(filters.client_name.toLowerCase())
      );
    }
    
    if (filters.client_id) {
      result = result.filter(client => 
        client.client_id?.toLowerCase().includes(filters.client_id.toLowerCase())
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
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle null or undefined values
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredClients(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, clients, sortConfig]);

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

  // Format status with appropriate styling
  const getStatusClass = (status: string) => {
    if (!status) return "";
    
    switch (status.toLowerCase()) {
      case "active":
        return "status-active"; // Green
      case "inactive":
        return "status-inactive"; // Grey
      case "expired":
        return "status-expired"; // Blue
      default:
        return "";
    }
  };
  const handleMenuToggle = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Handler for opening detail cards
  const handleOpenDetails = (client: Client, type: 'contact' | 'license') => {
    setDetailCard({
      visible: true,
      client,
      type
    });
    setOpenMenuIndex(null); // Close the menu after selection
  };

  // Handler for closing detail cards
  const handleCloseDetails = () => {
    setDetailCard({
      ...detailCard,
      visible: false
    });
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1>Clients</h1>
        <p>View and manage your client accounts</p>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading client data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>License No</th>
                  <th>License Serial No</th>
                  <th>Users</th>
                  <th>Active Users</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((client, index) => (
                    <tr key={`${client.client_name}-${index}`}>
                      <td className="client-id">{client.client_name || "-"}</td>
                      <td>{client.license_number || "-"}</td>
                      <td>{client.serial_number || "-"}</td>
                      <td>{client.users}</td>
                      <td>{client.active_users}</td>
                      <td>
                        <span className={`status-tag ${getStatusClass(client.status)}`}>
                          {client.status || "-"}
                        </span>
                      </td>
                      <td className="action-cell">
                        <div 
                          className="menu-wrapper" 
                          ref={(el) => {
                            menuRefs.current[index] = el;
                          }}
                        >
                          <button 
                            className="menu-button" 
                            onClick={() => handleMenuToggle(index)}
                            aria-label="Open actions menu"
                          >
                            ⋮
                          </button>
                          {openMenuIndex === index && (
                            <div className="dropdown-clients-action-menu">
                              <button onClick={() => handleOpenDetails(client, 'contact')}>
                                Contact Details
                              </button>
                              <button onClick={() => handleOpenDetails(client, 'license')}>
                                License Details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="no-results">No clients found</td>
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
              disabled={currentPage === totalPages || totalPages === 0}
              className="pagination-button"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Detail Card */}
          {detailCard.visible && detailCard.client && (
            <DetailCard 
              client={detailCard.client} 
              cardType={detailCard.type} 
              onClose={handleCloseDetails} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default Clients;
