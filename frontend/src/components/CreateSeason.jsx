import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const CreateSeason = () => {
  const [season, setSeason] = useState({
    name: "Rabi",
    year: new Date().getFullYear(),
  });

  const { token } = useSelector((state) => state.farmer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeason({ ...season, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seasons/create`,
        {
          name: season.name,
          year: Number(season.year),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Season created!");
      console.log(res.data);
      setSeason({
        name: "Rabi",
        year: new Date().getFullYear(),
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create season.");
    }
  };

  return (
    <div className="bg-white border-l-4 border-green-400 p-6 rounded-xl shadow-md hover:shadow-xl transition">
      <h2 className="text-xl font-bold mb-2">🌾 Create New Season</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          name="name"
          value={season.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        >
          <option value="Rabi">Rabi</option>
          <option value="Kharif">Kharif</option>
          <option value="Zaid">Zaid</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="number"
          name="year"
          placeholder="Enter Year"
          value={season.year}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold">
          ➕ Create Season
        </button>
      </form>
    </div>
  );
};

export default CreateSeason;
