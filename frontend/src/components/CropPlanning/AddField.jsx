import { motion } from "framer-motion";

const AddField = ({
  unassignedFields,
  fieldToAdd,
  setFieldToAdd,
  onAdd,
  onCancel,
}) => (
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
      <button className="btn-success" onClick={onAdd}>
        ✅ Add
      </button>
      <button className="btn-secondary" onClick={onCancel}>
        ❌ Cancel
      </button>
    </div>
  </motion.div>
);

export default AddField;