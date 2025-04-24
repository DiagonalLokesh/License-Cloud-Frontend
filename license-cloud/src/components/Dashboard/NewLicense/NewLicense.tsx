import React, { useState } from "react";
import { ENDPOINTS } from "../../../API/Endpoint";
import storageService from "../../../utils/storageService";
import { toast } from "react-toastify";
import "./NewLicense.css";

const NewLicense: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [clientID, setClientID] = useState("");
  const [clientName, setClientName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonDesignation, setContactPersonDesignation] = useState("");
  const [contactPersonMobile, setContactPersonMobile] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [userCount, setUserCount] = useState(1);
  const [expiryDCount, SetexpiryDCount] = useState(10);
  const [serialCount, setSerialCount] = useState(1);
  const [needsDatabase, setNeedsDatabase] = useState("false");
  const [needsTranslation, setNeedsTranslation] = useState("false");
  const [needsStorage, setNeedsStorage] = useState("false");

  // Store license data
  const [licenseClients, setLicenseClients] = useState<{ client_name: string, client_id: string, serial_number: number }[]>([]);
  
  // Store raw license data to calculate next serial number
  const [rawLicenseData, setRawLicenseData] = useState<any[]>([]);

  const [licenseMode, setLicenseMode] = useState("Renew"); // default is Renew

  const handleOptionClick = async (option: string) => {
    setSelectedOption(option);
    resetForm();
  
    if (option === "existing") {
      try {
        const response = await fetch(ENDPOINTS.DASHBOARD.GET_LICENSE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ filters: false }),
        });
  
        const data = await response.json();
        const licenseList = data.items || [];
        
        // Store raw license data for serial number calculations
        setRawLicenseData(licenseList);
  
        // Process client data
        const uniqueClientsMap: {
          [key: string]: { client_id: string; serial_number: number };
        } = {};
  
        // Find the highest serial number for each client
        licenseList.forEach((item: any) => {
          if (item.client_name) {
            if (!uniqueClientsMap[item.client_name] || 
                item.serial_number > uniqueClientsMap[item.client_name].serial_number) {
              uniqueClientsMap[item.client_name] = {
                client_id: item.client_id,
                serial_number: item.serial_number,
              };
            }
          }
        });
  
        const uniqueClients = Object.entries(uniqueClientsMap).map(
          ([client_name, details]) => ({
            client_name,
            client_id: details.client_id,
            serial_number: details.serial_number,
          })
        );
  
        setLicenseClients(uniqueClients);

        
      } catch (err) {
        toast.error("Failed to load clients");
        console.error("License fetch error:", err);
      }
    }
  };  
  
  const resetForm = () => {
    setClientID("");
    setClientName("");
    setContactPersonName("");
    setContactPersonDesignation("");
    setContactPersonMobile("");
    setLicenseType("");
    SetexpiryDCount(10);
    setUserCount(1);
    setSerialCount(1);
    setNeedsDatabase("false");
    setNeedsTranslation("false");
    setNeedsStorage("false");
  };
  
  // Function to get the next serial number for a client
  const getNextSerialNumber = (clientName: string): number => {
    // Filter licenses by client name
    const clientLicenses = rawLicenseData.filter(
      license => license.client_name === clientName
    );
    
    // If no licenses found, start with 1
    if (clientLicenses.length === 0) return 1;
    
    // Find the highest serial number
    const highestSerial = Math.max(...clientLicenses.map(license => license.serial_number));
    
    // Return the next number
    return highestSerial + 1;
  };

  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOption === "new") {
      try {
        const response = await fetch(ENDPOINTS.DASHBOARD.CREATE_CLIENTS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            company_name: clientName,
            contact_person_name: contactPersonName,
            contact_person_designation: contactPersonDesignation,
            contact_person_mobile_number: contactPersonMobile,
          }),
        });
      
        const data = await response.json();
      
        if (response.ok) {
          toast.success(data.message || "Client created successfully!");
        } else {
          // Some APIs return error messages under 'detail', others under 'message'
          const errorMsg = data.message || data.detail || "Failed to create client.";
          toast.error(errorMsg);
        }
      } catch (err: any) {
        // In case it's a network or unexpected JSON error
        toast.error("Something went wrong. Please try again.");
        console.error("Create Client Error:", err);
      }      
  
    } else if (selectedOption === "existing") {
      try {
        const response = await fetch(ENDPOINTS.DASHBOARD.CREATE_LICENSE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, 
          },
          body: JSON.stringify({
            client_id: clientID,
            client_name: clientName,
            expiry_days: expiryDCount,
            users: userCount,
            license_type: licenseType,
            serial_number: serialCount,
            database: needsDatabase,
            translation: needsTranslation,
            storage_device: needsStorage
          })
        });
  
        const data = await response.json();

        if (response.ok) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error("Failed to generate license");
      }
    }
  };
  
  
  return (
    <div className="license-container">
      <div className="license-container-header">
        <h2>New License</h2>
        <p>Generate license for Existing Client or New Clients</p>
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
            <h2>Generate License</h2>
            <p>Select this option to generate licenses for existing clients</p>
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
            {selectedOption === "existing" ? "Generate License" : "Create New Client"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {selectedOption === "existing" ? (
              <>
                <div className="form-group">
                  <label>Client Name</label>
                  <select
                    className="form-control"
                    value={clientName}
                    onChange={(e) => {
                      const selected = licenseClients.find(c => c.client_name === e.target.value);
                      if (selected) {
                        setClientName(selected.client_name);
                        setClientID(selected.client_id);
                        
                        // Set serial number based on license mode
                        if (licenseMode === "Renew") {
                          // For Renew: Use the last/highest serial number
                          setSerialCount(selected.serial_number);
                        } else {
                          // For New: Use the next available serial number
                          setSerialCount(getNextSerialNumber(selected.client_name));
                        }
                      }
                    }}
                    required
                  >
                    <option value="">Select a client</option>
                    {licenseClients.map((client, index) => (
                      <option key={index} value={client.client_name}>
                        {client.client_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Client ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={clientID}
                    readOnly
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Type of License Applied</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Expiry Days</label>
                  <div className="number-input">
                    <input 
                      type="number" 
                      className="form-control number-control" 
                      value={expiryDCount}
                      onChange={(e) => SetexpiryDCount(Math.max(10, parseInt(e.target.value) || 1))}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>License to Activate for Users</label>
                  <div className="number-input">
                    <input 
                      type="number" 
                      className="form-control number-control" 
                      value={userCount}
                      onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>License Mode</label>
                    <select
                      className="form-control"
                      value={licenseMode}
                      onChange={(e) => {
                        const mode = e.target.value;
                        setLicenseMode(mode);
                        
                        if (clientName) {
                          const selected = licenseClients.find(c => c.client_name === clientName);
                          if (selected) {
                            if (mode === "Renew") {
                              // For Renew: Use the last/highest serial number
                              setSerialCount(selected.serial_number);
                            } else {
                              // For New: Use the next available serial number
                              setSerialCount(getNextSerialNumber(selected.client_name));
                            }
                          }
                        }
                      }}
                    >
                      <option value="New">New</option>
                      <option value="Renew">Renew</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Enter in Serial Wise Manner or Incremental Manner</label>
                    <div className="number-input">
                      <input
                        type="number"
                        className="form-control number-control"
                        value={serialCount}
                        readOnly={true}
                        min="1"
                        required
                     
                     />
                    </div>
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
                    <option value="true">True</option>
                    <option value="false">False</option>
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
                    <option value="true">True</option>
                    <option value="false">False</option>
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
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Client Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Person Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                   
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Person Designation</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    
                    value={contactPersonDesignation}
                    onChange={(e) => setContactPersonDesignation(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Person Mobile Number</label>
                  <input 
                    type="number" 
                    className="form-control" 
                   
                    value={contactPersonMobile}
                    onChange={(e) => setContactPersonMobile(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            
            <button
              type="submit"
              className="submit-button"
              disabled={selectedOption === "existing" && (!clientID || !clientName)}
            >
              {selectedOption === "existing" ? "Generate License" : "Create Client"} 
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewLicense;
