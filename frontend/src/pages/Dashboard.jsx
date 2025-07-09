import FarmerProfile from "../components/FarmerProfile";
import CreateSeason from "../components/CreateSeason";
import AddField from "../components/AddField";
import FieldList from "../components/FieldList";

const Dashboard = () => {
  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-extrabold text-green-800 mb-10 text-center drop-shadow-sm">
        🌿 Farmer Dashboard
      </h1>

      {/* Profile and Season */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="transition-transform hover:scale-[1.02]">
          <FarmerProfile />
        </div>
        <div className="transition-transform hover:scale-[1.02]">
          <CreateSeason />
        </div>
      </div>

      {/* Add Field */}
      <div className="transition-transform hover:scale-[1.01] mb-8">
        <AddField />
      </div>

      {/* Field List */}
      <div className="transition-transform hover:scale-[1.01]">
        <FieldList />
      </div>
    </div>
  );
};

export default Dashboard;