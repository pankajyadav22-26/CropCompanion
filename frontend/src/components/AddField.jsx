import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

const LocationPicker = ({ setCoords }) => {
  useMapEvents({
    click(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const AddField = () => {
  const [field, setField] = useState({
    name: "",
    location: "", // this will store "lat,lng"
    area: "",
    soilType: "Loamy",
    soilData: {
      nitrogen: "",
      phosphorous: "",
      potassium: "",
      pH: "",
    },
  });

  const [markerCoords, setMarkerCoords] = useState(null);
  const { token } = useSelector((state) => state.farmer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["nitrogen", "phosphorous", "potassium", "pH"].includes(name)) {
      setField({ ...field, soilData: { ...field.soilData, [name]: value } });
    } else {
      setField({ ...field, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/fields/create`,
        field,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Field added successfully!");
      setField({
        ...field,
        name: "",
        location: "",
        area: "",
        soilData: { nitrogen: "", phosphorous: "", potassium: "", pH: "" },
      });
      setMarkerCoords(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add field.");
    }
  };

  // Update location when map coordinates change
  const handleCoordsUpdate = (coords) => {
    setMarkerCoords(coords);
    setField({ ...field, location: `${coords.lat},${coords.lng}` });
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-2">🗺️ Add New Field</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          name="name"
          placeholder="Field Name"
          value={field.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          name="area"
          placeholder="Area (e.g. 2.5 acres)"
          value={field.area}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        {/* Show picked coordinates */}
        <input
          name="location"
          value={field.location}
          readOnly
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Location"
        />

        {/* Map UI */}
        <div className="z-0 h-64 rounded overflow-hidden">
          <MapContainer
            center={[28.6139, 77.209]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker setCoords={handleCoordsUpdate} />
            {markerCoords && (
              <Marker position={[markerCoords.lat, markerCoords.lng]} />
            )}
          </MapContainer>
        </div>

        <select
          name="soilType"
          value={field.soilType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        >
          <option>Sandy</option>
          <option>Clay</option>
          <option>Silt</option>
          <option>Peaty</option>
          <option>Chalky</option>
          <option>Loamy</option>
          <option>Other</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="nitrogen"
            placeholder="Nitrogen"
            value={field.soilData.nitrogen}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="number"
            name="phosphorous"
            placeholder="Phosphorous"
            value={field.soilData.phosphorous}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="number"
            name="potassium"
            placeholder="Potassium"
            value={field.soilData.potassium}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="number"
            name="pH"
            placeholder="Soil pH"
            value={field.soilData.pH}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            step="0.1"
            required
          />
        </div>

        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold">
          ➕ Add Field
        </button>
      </form>
    </div>
  );
};

export default AddField;
