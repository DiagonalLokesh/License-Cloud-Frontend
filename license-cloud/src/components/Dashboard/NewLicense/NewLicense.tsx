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
  const [licenseClients, setLicenseClients] = useState<{ client_name: string, client_id: string,serial_number: number}[]>([]);

  const [licenseMode, setLicenseMode] = useState("Renew"); // default is New
  const [renewSerial, setRenewSerial] = useState<number | null>(null);


  const handleOptionClick = async (option: string) => {
    setSelectedOption(option);
    resetForm();
  
    if (option === "existing") {
      try {
        const response = await fetch("https://license.aryabhat.ai/api/get-license", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ filters: false }),
        });
  
        const data = await response.json();
  
        // Extract unique client_name/client_id combos
        const uniqueClientsMap: { [key: string]: { client_id: string, serial_number: number } } = {};
        data.forEach((item: any) => {
          if (!uniqueClientsMap[item.client_name]) {
            uniqueClientsMap[item.client_name] = {
              client_id: item.client_id,
              serial_number: item.serial_number
            };
          }
        });

        const uniqueClients = Object.entries(uniqueClientsMap).map(([name, details]) => ({
          client_name: name,
          client_id: details.client_id,
          serial_number: details.serial_number,
        }));

  
        setLicenseClients(uniqueClients);

        const latestClient = data[0]; 
        if (latestClient && latestClient.serial_number) {
          setRenewSerial(latestClient.serial_number);
        }
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
      }} catch (err) {
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
                        if (licenseMode === "Renew") {
                          setSerialCount(selected.serial_number);
                        }
                      }
                    }}
                    required
                  >
                    {/* <option value="">Select a client</option> */}
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
                    // placeholder="Enter license type"
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
                        if (mode === "Renew") {
                          const selected = licenseClients.find(c => c.client_name === clientName);
                          if (selected) {
                            setSerialCount(selected.serial_number);
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
                        onChange={(e) => {
                          if (licenseMode === "New") {
                            setSerialCount(Math.max(1, parseInt(e.target.value) || 1));
                          }
                        }}
                        min="1"
                        required
                        readOnly={licenseMode === "Renew"}
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
                    // placeholder="Enter client name"
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
                    // placeholder="Enter contact person name"
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
                    // placeholder="Enter contact person designation"
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
                    // placeholder="Enter contact person mobile number"
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
              {selectedOption === "existing" ? "Update" : "Create"} Client
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewLicense;
