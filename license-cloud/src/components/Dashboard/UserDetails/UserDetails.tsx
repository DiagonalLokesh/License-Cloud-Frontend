import React, { useState, useEffect, useRef } from "react";
import InviteUsersDialog from "./InviteUsersDialog";
import { ENDPOINTS } from "../../../API/Endpoint";
import storageService from "../../../utils/storageService";
// import { Filter } from 'lucide-react';
import { toast } from "react-toastify";
import "./UserDetails.css";

  // Interface for user data
  interface UserData {
    email: string;
    requestDate: string;
    status: "Accepted" | "Pending";
    accessEnabled: boolean;
  }

  // Filter options for status
  type StatusFilter = "All" | "Accepted" | "Pending";

const UserDetails: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [enabledUsers, setEnabledUsers] = useState<{[email: string]: boolean}>({});
  // Filter states
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [showEmailFilter, setShowEmailFilter] = useState<boolean>(false);
  const [showStatusFilter, setShowStatusFilter] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Refs for filter dropdowns
  const emailFilterRef = useRef<HTMLDivElement>(null);
  // const dateFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  const email = storageService.getItem(storageService.KEYS.USER_NAME);
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);

  const usersPerPage = 10;

  const handleDelete = (email: string) => {
    setUserToDelete(email);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(ENDPOINTS.DASHBOARD.DELETE_USER, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_email: userToDelete
        })
      });
  
      const data = await response.json();

      if (response.ok) {
        // Refresh the webpage
        window.location.reload();
        toast.success(data.message);
      }
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };
  
  // Fetch user data from API
  useEffect(() => {
    console.log("Email from local storage:", email);

    const fetchUserData = async () => {
      try {
        const response = await fetch(ENDPOINTS.DASHBOARD.USER_DETAILS, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            emails: [ email ]
          })
        });
  
        const data = await response.json();
  
        if (data?.items) {

          const formattedUsers = data.items.map((item: any) => ({
            email: item.email,
            status: item.status as "Accepted" | "Pending",
            requestDate: item.date_and_time === "None" ? 
              new Date().toISOString().split("T")[0] : 
              item.date_and_time.split(" ")[0],
            accessEnabled: item.AccessEnabled
          }));
          
          const userStatusMap = formattedUsers.reduce((acc: {[key: string]: boolean}, user: UserData) => {
            acc[user.email] = user.accessEnabled;
            return acc;
          }, {});
          setEnabledUsers(userStatusMap);
          
          console.log("Formatted user data:", formattedUsers);

          setUserData(formattedUsers);
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };
  
    fetchUserData();
  }, []);  

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleMenuToggle = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };
  
  // const handleDeleteUser = (index: number) => {
  //   const updatedUsers = [...userData];
  //   updatedUsers.splice(indexOfFirstUser + index, 1);
  //   setUserData(updatedUsers);
  //   setOpenMenuIndex(null);
  // };

  // Toggle filter dropdowns
  // const toggleEmailFilter = () => {
  //   setShowEmailFilter(!showEmailFilter);
  //   // setShowDateFilter(false);
  //   setShowStatusFilter(false);
  // };

  // const toggleStatusFilter = () => {
  //   setShowStatusFilter(!showStatusFilter);
  //   setShowEmailFilter(false);
  // };

  // Apply filters to user data
  const getFilteredUsers = () => {
    return userData.filter(user => {
      // Email filter
      const emailMatch = emailFilter === "" || 
        user.email.toLowerCase().includes(emailFilter.toLowerCase());
      
      // Date filter
      const dateMatch = dateFilter === "" || 
        user.requestDate.includes(dateFilter);
      
      // Status filter
      const statusMatch = statusFilter === "All" || 
        user.status === statusFilter;
      
      return emailMatch && dateMatch && statusMatch;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close action menu when clicking outside
      const clickedInMenu = menuRefs.current.some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      
      // Close filter dropdowns when clicking outside
      const clickedInEmailFilter = emailFilterRef.current && 
        emailFilterRef.current.contains(event.target as Node);
      const clickedInStatusFilter = statusFilterRef.current && 
        statusFilterRef.current.contains(event.target as Node);
      
      if (!clickedInMenu) {
        setOpenMenuIndex(null);
      }
      
      if (!clickedInEmailFilter) {
        setShowEmailFilter(false);
      }
      
      if (!clickedInStatusFilter) {
        setShowStatusFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleInviteSubmit = (emails: string[]) => {
    // In a real application, this would be an API call
    const newUsers = emails.map(email => ({
      email,
      requestDate: new Date().toISOString().split('T')[0],
      status: "Pending" as const,
      accessEnabled: false 
    }));
    
    setUserData([...newUsers, ...userData]);
    handleCloseDialog();
  };

  // Reset filters
  const resetFilters = () => {
    setEmailFilter("");
    setDateFilter("");
    setStatusFilter("All");
  };

    const handleStatusToggle = (email: string, currentStatus: boolean) => {
      if (currentStatus) {
        // If currently enabled, disable it
        handleDisableStatusToggle(email, currentStatus);
      } else {
        // If currently disabled, enable it
        handleEnableStatusToggle(email, currentStatus);
      }
    };

    const handleEnableStatusToggle = async (email: string, currentStatus: boolean) => {
      try {
        const requestBody = { email: email }
    
        const response = await fetch(ENDPOINTS.DASHBOARD.USER_DETAILS, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
    
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
    
        // Toggle the local state
        setEnabledUsers(prev => ({
          ...prev,
          [email]: !currentStatus
        }));
    
        toast.success(`User enabled successfully`);
      } catch (error) {
        // console.error("Failed to update user status:", error);
        toast.error("Failed to update user status");
      }
    };

    const handleDisableStatusToggle = async (email: string, currentStatus: boolean) => {
      try {
        const requestBody = { disable_email: email };
    
        const response = await fetch(ENDPOINTS.DASHBOARD.USER_DETAILS, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
    
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
    
        setEnabledUsers(prev => ({
          ...prev,
          [email]: !currentStatus
        }));
    
        toast.success(`User disabled successfully`);
      } catch (error) {
        // console.error("Failed to update user status:", error);
        toast.error("Failed to update user status");
      }
    };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredUsers.length, currentPage, totalPages]);
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const getInitial = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email: string): string => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      "#4299E1", // blue
      "#48BB78", // green
      "#9F7AEA", // purple
      "#ED64A6", // pink
      "#ECC94B", // yellow
      "#F56565", // red
      "#667EEA", // indigo
      "#38B2AC"  // teal
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="user-details-container">
       <div className="user-header">
        <h2>User Details</h2>
        <p>Check and invite users accounts</p>
      </div>

      <div className="actions-row">
        <button className="invite-btn" onClick={handleOpenDialog}>
          Invite
        </button>
        
        {(emailFilter || dateFilter || statusFilter !== "All") && (
          <button className="reset-filters-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      {dialogOpen && (
        <InviteUsersDialog onClose={handleCloseDialog} onSubmit={handleInviteSubmit} />
      )}

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                User Email
                <div className="filter-header">
                  {/* <span
                    className="filter-icon"
                    onClick={toggleEmailFilter}>
                    <Filter size={14} />
                  </span> */}
                  {showEmailFilter && (
                    <div className="filter-dropdown email-filter-dropdown" ref={emailFilterRef}>
                      <input
                        type="text"
                        placeholder="Search email..."
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </th>
              <th>
                Date of Request
                <div className="filter-header">
                </div>
              </th>
              <th>
                Status
                <div className="filter-header">
                  {/* <span
                    className="filter-icon"
                    onClick={toggleStatusFilter}>
                    <Filter size={14} />
                  </span> */}
                  {showStatusFilter && (
                    <div className="filter-status-dropdown status-filter-dropdown" ref={statusFilterRef}>
                      <div className="status-options">
                        <div 
                          className={`status-option ${statusFilter === "Accepted" ? "selected" : ""}`}
                          onClick={() => setStatusFilter("Accepted")}
                        >
                          Accepted
                        </div>
                        <div 
                          className={`status-option ${statusFilter === "Pending" ? "selected" : ""}`}
                          onClick={() => setStatusFilter("Pending")}
                        >
                          Pending
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </th>
              <th>
                Access
              </th>
              <th>
                Actions
              </th>
              
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={index}>
                <td>
                  <div className="user-email-cell">
                    <div 
                      className="avatar"
                      style={{ backgroundColor: getAvatarColor(user.email) }}
                    >
                      {getInitial(user.email)}
                    </div>
                    <span className="email-text">{user.email}</span>
                  </div>
                </td>
                <td>{formatDate(user.requestDate)}</td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td className="switch-cell">
                  <div
                    className={`custom-switch ${enabledUsers[user.email] ? "on" : "off"}`}
                    onClick={() => handleStatusToggle(user.email, enabledUsers[user.email])}
                  >
                    <div className="switch-knob" />
                  </div>
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
                    >
                      ⋮
                    </button>
                    {openMenuIndex === index && (
                      <div className="dropdown-menu">
                      <button onClick={() => handleDelete(user.email)}>Delete</button>
                      {/* {!enabledUsers[user.email] && (
                        <button onClick={() => handleEnableStatusToggle(user.email, enabledUsers[user.email])}>Enable Access</button>
                      )}
                      {enabledUsers[user.email] && (
                        <button onClick={() => handleDisableStatusToggle(user.email, enabledUsers[user.email])}>Disable Access</button>
                      )} */}
                    </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="no-results">
                  No users match the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            &gt;
          </button>
        </div>

        {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to Delete User ?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmDelete}>Yes</button>
              <button className="btn-cancel" onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserDetails;