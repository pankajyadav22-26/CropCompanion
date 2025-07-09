import { Card } from "../Card";
import { X, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const FieldList = ({
  season,
  fields,
  onBack,
  onFieldClick,
  onRemoveField,
  unassignedFields,
  showAddField,
  setShowAddField,
  fieldToAdd,
  setFieldToAdd,
  onAddField,
}) => {
  return (
    <div>
      <button onClick={onBack} className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-gray-300 hover:bg-white/40 transition">
        <ArrowLeft className="inline-block mr-2" /> Back to Seasons
      </button>

      <h2 className="text-2xl font-bold mt-6 mb-4">
        🗺️ Fields in {season.name} {season.year}
      </h2>

      {fields.length === 0 ? (
        <p className="text-gray-600 italic">No fields added to this season.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <Card key={field._id} onClick={() => onFieldClick(field)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{field.name}</h3>
                  <p className="text-gray-500 text-sm">
                    📍 {field.location} • {field.area}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveField(field._id);
                  }}
                  className="text-red-500 hover:scale-110 transition"
                >
                  <X />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowAddField(true)}
          className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-gray-300 hover:bg-white/40 transition"
        >
          <Plus className="inline-block mr-1" />
          Add Field
        </button>

        {showAddField && (
          <motion.div
            className="mt-4 p-4 border bg-white/80 rounded-xl space-y-3 shadow-inner"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <select
              value={fieldToAdd}
              onChange={(e) => setFieldToAdd(e.target.value)}
              className="input w-full p-2 border rounded-lg"
            >
              <option value="">-- Select a field --</option>
              {unassignedFields.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.location})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button className="btn-success" onClick={onAddField}>
                ✅ Add
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowAddField(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FieldList;