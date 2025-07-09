import { useSelector } from "react-redux";

const FarmerProfile = () => {
  const { farmer } = useSelector((state) => state.farmer);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-green-500">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        👨‍🌾 Farmer Profile
      </h2>
      <div className="space-y-2 text-green-900">
        <p>
          <strong>Name:</strong> {farmer?.name}
        </p>
        <p>
          <strong>Email:</strong> {farmer?.email}
        </p>
      </div>
    </div>
  );
};

export default FarmerProfile;
