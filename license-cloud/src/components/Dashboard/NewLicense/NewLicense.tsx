import React, { useState } from "react";
import "./NewLicense.css";

const NewLicense: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [existingClients] = useState(["Client A", "Client B", "Client C", "Client D"]);
  const [licenseType, setLicenseType] = useState("");
  const [userCount, setUserCount] = useState(1);
  const [serialCount, setSerialCount] = useState(1);
  const [needsDatabase, setNeedsDatabase] = useState("false");
  const [needsTranslation, setNeedsTranslation] = useState("false");
  const [needsStorage, setNeedsStorage] = useState("false");

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    // Reset form when switching options
    setClientName("");
    setLicenseType("");
    setUserCount(1);
    setSerialCount(1);
    setNeedsDatabase("false");
    setNeedsTranslation("false");
    setNeedsStorage("false");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      type: selectedOption,
      clientName,
      licenseType,
      userCount,
      serialCount,
      needsDatabase,
      needsTranslation,
      needsStorage
    });
    alert(`${selectedOption === "existing" ? "Updated" : "Created"} successfully!`);
  };

  return (
    <div className="license-container">
       <div className="license-container-header">
       <h2>New License</h2>
       <p>Generate license for Exisiting Client or New Clients</p>
    </div>

      {!selectedOption ? (
        <div className="options-container">
          <div 
            className="option-card" 
            onClick={() => handleOptionClick("existing")}
          >
            <div className="option-icon">
              <i className="fas fa-user"></i>
            </div>
            <h2>Existing Client</h2>
            <p>Select this option to manage licenses for existing clients</p>
          </div>
          
          <div 
            className="option-card" 
            onClick={() => handleOptionClick("new")}
          >
            <div className="option-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h2>Create Client</h2>
            <p>Select this option to create a new client and license</p>
          </div>
        </div>
      ) : (
        <div className="form-container">
          <button className="back-button" onClick={() => setSelectedOption(null)}>
            <i className="fas fa-arrow-left"></i> Back to Options
          </button>
          
          <h2 className="form-title">
            {selectedOption === "existing" ? "Manage Existing Client" : "Create New Client"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Client Name</label>
              {selectedOption === "existing" ? (
                <select 
                  className="form-control" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                >
                  <option value="">Select a client</option>
                  {existingClients.map((client, index) => (
                    <option key={index} value={client}>{client}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              )}
            </div>
            
            <div className="form-group">
              <label>Type of License Applied</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter license type"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>License to Activate for Users</label>
              <div className="number-input">
                {/* <button 
                  type="button" 
                  className="number-button"
                  onClick={() => setUserCount(Math.max(1, userCount - 1))}
                >-</button> */}
                <input 
                  type="number" 
                  className="form-control number-control" 
                  value={userCount}
                  onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  required
                />
                {/* <button 
                  type="button" 
                  className="number-button"
                  onClick={() => setUserCount(userCount + 1)}
                >+</button> */}
              </div>
            </div>
            
            <div className="form-group">
              <label>Enter in Serial Wise Manner or Incremental Manner</label>
              <div className="number-input">
                {/* <button 
                  type="button" 
                  className="number-button"
                  onClick={() => setSerialCount(Math.max(1, serialCount - 1))}
                >-</button> */}
                <input 
                  type="number" 
                  className="form-control number-control" 
                  value={serialCount}
                  onChange={(e) => setSerialCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  required
                />
                {/* <button 
                  type="button" 
                  className="number-button"
                  onClick={() => setSerialCount(serialCount + 1)}
                >+</button> */}
              </div>
            </div>
            
            <div className="form-group">
              <label>Need Database Storage?</label>
              <select 
                className="form-control" 
                value={needsDatabase}
                onChange={(e) => setNeedsDatabase(e.target.value)}
                required
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Need Translation Services?</label>
              <select 
                className="form-control" 
                value={needsTranslation}
                onChange={(e) => setNeedsTranslation(e.target.value)}
                required
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Need Storage Device?</label>
              <select 
                className="form-control" 
                value={needsStorage}
                onChange={(e) => setNeedsStorage(e.target.value)}
                required
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            
            <button type="submit" className="submit-button">
              {selectedOption === "existing" ? "Update" : "Create"} Client
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewLicense;
