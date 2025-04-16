import React, { useState, useEffect, useRef } from "react";
import InviteUsersDialog from "./InviteUsersDialog";
import { ENDPOINTS } from "../../../API/Endpoint";
import storageService from "../../../utils/storageService";
import { Filter, Calendar } from 'lucide-react';
import "./UserDetails.css";

// Interface for user data
interface UserData {
  email: string;
  requestDate: string;
  status: "Accepted" | "Pending";
}

// Filter options for status
type StatusFilter = "All" | "Accepted" | "Pending";

const UserDetails: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);
  const [selectedYearDecade, setSelectedYearDecade] = useState<number>(Math.floor(2024 / 10) * 5);


  // Filter states
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [showEmailFilter, setShowEmailFilter] = useState<boolean>(false);
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [showStatusFilter, setShowStatusFilter] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Refs for filter dropdowns
  const emailFilterRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  const email = storageService.getItem(storageService.KEYS.USER_NAME);
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);

  const usersPerPage = 10;

    // Add these handler functions for month/year selection
  const toggleMonthYearView = () => {
    setShowMonthYearPicker(!showMonthYearPicker);
    setShowYearPicker(false);
  };

  const toggleYearPicker = () => {
    setShowYearPicker(!showYearPicker);
    setSelectedYearDecade(Math.floor(selectedYear / 10) * 10);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setShowMonthYearPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  const handlePrevDecade = () => {
    setSelectedYearDecade(selectedYearDecade - 10);
  };

  const handleNextDecade = () => {
    setSelectedYearDecade(selectedYearDecade + 10);
  };
  // Mock data for demonstration
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
          const today = new Date().toISOString().split("T")[0]; 
  
          const formattedUsers = data.items.map((item: any) => ({
            email: item.email,
            status: item.status as "Accepted" | "Pending",
            requestDate: today
          }));
          
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
  
  const handleDeleteUser = (index: number) => {
    const updatedUsers = [...userData];
    updatedUsers.splice(indexOfFirstUser + index, 1);
    setUserData(updatedUsers);
    setOpenMenuIndex(null);
  };

  // Toggle filter dropdowns
  const toggleEmailFilter = () => {
    setShowEmailFilter(!showEmailFilter);
    setShowDateFilter(false);
    setShowStatusFilter(false);
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    setShowEmailFilter(false);
    setShowStatusFilter(false);
  };

  const toggleStatusFilter = () => {
    setShowStatusFilter(!showStatusFilter);
    setShowEmailFilter(false);
    setShowDateFilter(false);
  };

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
      const clickedInDateFilter = dateFilterRef.current && 
        dateFilterRef.current.contains(event.target as Node);
      const clickedInStatusFilter = statusFilterRef.current && 
        statusFilterRef.current.contains(event.target as Node);
      
      if (!clickedInMenu) {
        setOpenMenuIndex(null);
      }
      
      if (!clickedInEmailFilter) {
        setShowEmailFilter(false);
      }
      
      if (!clickedInDateFilter) {
        setShowDateFilter(false);
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
      status: "Pending" as const
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

  // Calendar functionality
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (selectedDate <= today) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateFilter(formattedDate);
      setShowDateFilter(false);
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

 // Update the calendar rendering function to handle future dates properly
const renderCalendar = () => {
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days = [];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Weekday headers
  days.push(
    <div className="calendar-header" key="header">
      {weekDays.map(day => (
        <div className="weekday" key={day}>{day}</div>
      ))}
    </div>
  );
  
  // Calendar grid
  let dayCounter = 1;
  const calendarRows = [];
  
  // Add empty cells for days before the first day of month
  const firstRow = [];
  for (let i = 0; i < firstDay; i++) {
    firstRow.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
  }
  
  // Add days of the month to the first row
  for (let i = firstDay; i < 7; i++) {
    const dayDate = new Date(selectedYear, selectedMonth, dayCounter);
    const isFutureDate = dayDate > today;

    firstRow.push(
      <div 
        className={`calendar-day ${dateFilter === `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}` ? 'selected' : ''} ${isFutureDate ? 'disabled' : ''}`}
        key={dayCounter}
        onClick={() => !isFutureDate && handleDateSelect(dayCounter)}
      >
        {dayCounter++}
      </div>
    );
  }
  calendarRows.push(<div className="calendar-row" key="row-0">{firstRow}</div>);
  
  // Add remaining days
  while (dayCounter <= daysInMonth) {
    const row = [];
    for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
      const dayDate = new Date(selectedYear, selectedMonth, dayCounter);
      const isFutureDate = dayDate > today;
      row.push(
        <div 
          className={`calendar-day ${dateFilter === `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}` ? 'selected' : ''} ${isFutureDate ? 'disabled' : ''}`}
          key={dayCounter}
          onClick={() => !isFutureDate && handleDateSelect(dayCounter)}
        >
          {dayCounter++}
        </div>
      );
    }
    calendarRows.push(<div className="calendar-row" key={`row-${calendarRows.length}`}>{row}</div>);
  }
  
  return (
    <div className="calendar-container">
      <div className="calendar-navigation">
        <button onClick={handlePrevMonth}>&lt;</button>
        <div className="month-year" onClick={toggleMonthYearView}>
          {`${monthName} ${selectedYear}`}
        </div>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>
      
      {showMonthYearPicker ? (
        <div className="month-year-picker">
          {showYearPicker ? (
            <div className="year-picker">
              <div className="year-grid">
                {Array.from({ length: 12 }, (_, i) => selectedYearDecade + i).map(year => (
                  <div 
                    key={year} 
                    className={`year-cell ${year === selectedYear ? 'selected' : ''}`}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </div>
                ))}
              </div>
              <div className="year-navigation">
                <button onClick={handlePrevDecade}>←</button>
                <span>{selectedYearDecade} - {selectedYearDecade + 11}</span>
                <button onClick={handleNextDecade}>→</button>
              </div>
            </div>
          ) : (
            <div className="month-picker">
              {Array.from({ length: 12 }, (_, i) => i).map(month => (
                <div 
                  key={month} 
                  className={`month-cell ${month === selectedMonth ? 'selected' : ''}`}
                  onClick={() => handleMonthSelect(month)}
                >
                  {new Date(2000, month).toLocaleString('default', { month: 'short' })}
                </div>
              ))}
              <div className="year-selector" onClick={toggleYearPicker}>
                {selectedYear} ↓
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="calendar">
          {days}
          {calendarRows}
        </div>
      )}
      
      {dateFilter && (
        <div className="selected-date">
          <p>Selected: {formatDate(dateFilter)}</p>
          <button onClick={() => setDateFilter("")}>Clear</button>
        </div>
      )}
    </div>
  );
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
                  <span
                    className="filter-icon"
                    onClick={toggleEmailFilter}>
                    <Filter size={14} />
                  </span>
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
                  <span
                    className="filter-icon"
                    onClick={toggleDateFilter}>
                    <Calendar size={14} />
                  </span>
                  {showDateFilter && (
                    <div className="filter-dropdown date-filter-dropdown" ref={dateFilterRef}>
                      {renderCalendar()}
                    </div>
                  )}
                </div>
              </th>
              <th>
                Status
                <div className="filter-header">
                  <span
                    className="filter-icon"
                    onClick={toggleStatusFilter}>
                    <Filter size={14} />
                  </span>
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
                        <button onClick={() => handleDeleteUser(index)}>Delete</button>
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
      </div>
    </div>
  );
};

export default UserDetails;