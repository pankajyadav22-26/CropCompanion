import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import EditFieldModal from "./EditFieldModal";

const FieldList = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);

  const { token } = useSelector((state) => state.farmer);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/fields/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFields(res.data);
    } catch (err) {
      console.error("Error fetching fields:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    try {
      await axios.delete(`http://localhost:5050/api/fields/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFields(fields.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Error deleting field:", err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  if (loading) return <p>Loading fields...</p>;

  return (
    <div className="p-6 bg-green-50 rounded-xl shadow-md border border-green-200 transition hover:shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🌱 Your Fields</h2>

      {fields.length === 0 ? (
        <p className="text-gray-600 italic">No fields added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div
              key={field._id}
              className="bg-blue-50 hover:bg-green-50 border border-gray-200 p-4 rounded-lg shadow-sm transition-all"
            >
              {/* Field Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {field.name}
                  </h3>
                  <p className="text-sm text-gray-700">
                    📍 <span className="font-medium">{field.location}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    🌾 Area: <span className="font-medium">{field.area}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
                  <button
                    onClick={() => setEditingField(field)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm px-3 py-1 rounded transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(field._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Soil Data */}
              <div>
                <p className="mb-2 font-semibold text-green-700">
                  🧪 Soil Nutrients
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white border rounded px-2 py-1 text-center shadow-sm">
                    N: {field.soilData?.nitrogen}
                  </div>
                  <div className="bg-white border rounded px-2 py-1 text-center shadow-sm">
                    P: {field.soilData?.phosphorous}
                  </div>
                  <div className="bg-white border rounded px-2 py-1 text-center shadow-sm">
                    K: {field.soilData?.potassium}
                  </div>
                  <div className="bg-white border rounded px-2 py-1 text-center shadow-sm">
                    pH: {field.soilData?.pH}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingField && (
        <EditFieldModal
          field={editingField}
          token={token}
          onClose={() => setEditingField(null)}
          onUpdate={fetchFields}
        />
      )}
    </div>
  );
};

export default FieldList;
