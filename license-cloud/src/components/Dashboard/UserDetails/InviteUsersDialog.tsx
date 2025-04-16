// InviteUsersDialog.tsx
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import "./UserDetails.css";
import storageService from "../../../utils/storageService";
import { ENDPOINTS } from "../../../API/Endpoint";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface InviteUsersDialogProps {
  onClose: () => void;
  onSubmit: (emails: string[]) => void;
}

const InviteUsersDialog: React.FC<InviteUsersDialogProps> = ({ onClose, onSubmit }) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  // const navigate = useNavigate();

  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);  

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      toast.error(`Invalid email format: ${trimmedEmail}`);
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      toast.error(`Email already added: ${trimmedEmail}`);
      return;
    }
    
    setEmails([...emails, trimmedEmail]);
    setInputValue("");
    // setError("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (inputValue) {
        addEmail(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      // Remove the last email when backspace is pressed and input is empty
      const newEmails = [...emails];
      newEmails.pop();
      setEmails(newEmails);
      setError("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const getInitial = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  const handleSend = async () => {
    if (inputValue.trim()) {
      addEmail(inputValue);
      if (error) return;
    }
  
    if (emails.length === 0) return;
  
    onSubmit(emails);
  
    try {
      const res = await fetch(ENDPOINTS.DASHBOARD.INVITE_USERS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emails: emails
        })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast.success(data.message || "Invitation sent successfully.");
      } else {
        toast.error(data.detail || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to send invitation. Please try again.");
    }
  };
  

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="invite-modal" onClick={stopPropagation}>
      <div className="modal-header">
        <div></div>
        <h2>Invite Users</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="email-input-container">
        <div className="email-chip-container">
          {emails.map((email, index) => (
            <div key={index} className="email-chip">
              <div 
                className="avatar"
                style={{
                  backgroundColor: getAvatarColor(email),
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  marginRight: "5px",
                  fontSize: "12px"
                }}
              >
                {getInitial(email)}
              </div>
              <span>{email}</span>
              <button onClick={() => removeEmail(email)}>×</button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              border: "none",
              outline: "none",
              flexGrow: 1,
              minWidth: "100px",
              fontSize: "15px",
              background: "transparent"
            }}
          />
        </div>
        
        {error && (
          <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
            {error}
          </div>
        )}
      </div>

      <button 
        className="send-btn" 
        onClick={handleSend}
        disabled={emails.length === 0}
      >
        Send
      </button>
    </div>
  );
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

export default InviteUsersDialog;