import { Card } from "../Card";

const SeasonList = ({ seasons, onSelectSeason }) => {
  return (
    <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
      {seasons.map((season) => (
        <Card key={season._id} onClick={() => onSelectSeason(season)}>
          <h2 className="text-xl font-semibold text-green-700">
            {season.name}
          </h2>
          <p className="text-gray-500">📅 Year: {season.year}</p>
        </Card>
      ))}
    </div>
  );
};

export default SeasonList;