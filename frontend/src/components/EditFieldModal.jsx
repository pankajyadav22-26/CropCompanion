import { useState } from "react";
import axios from "axios";

const EditFieldModal = ({ field, token, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: field.name,
    location: field.location,
    area: field.area,
    soilType: field.soilType || "",
    soilData: {
      nitrogen: field.soilData?.nitrogen || "",
      phosphorous: field.soilData?.phosphorous || "",
      potassium: field.soilData?.potassium || "",
      pH: field.soilData?.pH || "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["nitrogen", "phosphorous", "potassium", "pH"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        soilData: { ...prev.soilData, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/fields/${field._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onClose();
      onUpdate(); // Refresh field list
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-opacity-40 backdrop-blur-sm flex items-center justify-center px-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-green-700">✏️ Edit Field</h2>

        {/* Basic Field Info */}
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Field Name"
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Location"
          required
        />
        <input
          name="area"
          value={formData.area}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Area"
          required
        />
        <input
          name="soilType"
          value={formData.soilType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Soil Type"
        />

        {/* Soil Nutrients */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-1">🧪 Soil Nutrients</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["nitrogen", "phosphorous", "potassium", "pH"].map((key) => (
              <input
                key={key}
                name={key}
                value={formData.soilData[key]}
                onChange={handleChange}
                type="number"
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                className="px-2 py-2 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFieldModal;