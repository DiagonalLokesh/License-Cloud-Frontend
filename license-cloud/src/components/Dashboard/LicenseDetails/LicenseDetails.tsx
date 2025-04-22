// LicenseKeyValidator.tsx
import React, { useState, FormEvent, ChangeEvent } from "react";
import "./LicenseDetails.css";
import storageService from "../../../utils/storageService";

// Define TypeScript interfaces for the license details
interface LicenseDetails {
  status: string;
  created_at: string;
  expiry_date: string;
  users: number;
  translation: boolean;
  database: boolean;
  storage_device: boolean;
  active_users: number;
  is_expired: boolean;
  is_active_users_exceeded: boolean;
  license_number: string;
  signed_license_key: string;
  client_id: string;
}

const LicenseKeyValidator: React.FC = () => {
  const [signedLicenseKey, setSignedLicenseKey] = useState<string>("");
  const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Real API call to the endpoint
      const response = await fetch(`https://license.aryabhat.ai/check-license-status?signed_license_key=${encodeURIComponent(signedLicenseKey)}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        // credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json() as LicenseDetails;
      setLicenseDetails(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to validate license key: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSignedLicenseKey(e.target.value);
  };

  return (
    <div className="license-details-container">
      <div className="license-card">
        <h2 className="license-title">License Key Validator</h2>
        
        <form onSubmit={handleSubmit} className="license-form">
          <div className="form-group">
            <label htmlFor="signed_license_key" className="form-label">
              Signed License Key
            </label>
            <input
              id="signed_license_key"
              type="text"
              value={signedLicenseKey}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn"
          >
            {loading ? "Processing..." : "Proceed"}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {licenseDetails && (
          <div className="details-section">
            <h3 className="details-title">License Details</h3>
            <div className="table-container">
              <table className="details-table">
                <tbody>
                  <tr>
                    <td className="details-label">Status</td>
                    <td>
                      <span className={`tag ${licenseDetails.status === "Active" ? "tag-active" : "tag-inactive"}`}>
                        {licenseDetails.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="details-label">Created At</td>
                    <td>{licenseDetails.created_at}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Expiry Date</td>
                    <td>{licenseDetails.expiry_date}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Users</td>
                    <td>{licenseDetails.users}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Active Users</td>
                    <td>{licenseDetails.active_users}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Translation</td>
                    <td>{licenseDetails.translation ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Database</td>
                    <td>{licenseDetails.database ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Storage Device</td>
                    <td>{licenseDetails.storage_device ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Expired</td>
                    <td>{licenseDetails.is_expired ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Users Exceeded</td>
                    <td>{licenseDetails.is_active_users_exceeded ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td className="details-label">License Number</td>
                    <td className="break-all">{licenseDetails.license_number}</td>
                  </tr>
                  <tr>
                    <td className="details-label">Client ID</td>
                    <td>{licenseDetails.client_id}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseKeyValidator;