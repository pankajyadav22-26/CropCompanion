import React from "react";
import { motion } from "framer-motion";
import stageImages from "src/services/stageImages";

const StageCard = ({
  stage,
  index,
  cropCycle,
  landPrepNotes,
  setLandPrepNotes,
  markLandPreparationDone,
  handleSowingRecommendation,
  sowingInput,
  setSowingInput,
  submitSowingDetails,
  lastRecommendation,
  irrigationForm,
  setIrrigationForm,
  handleGetIrrigationRecommendation,
  submitIrrigationLog,
  lastFertilizerRecommendation,
  fertilizerForm,
  setFertilizerForm,
  handleGetFertilizerRecommendation,
  submitFertilizerLog,
  lastPestSuggestion,
  sprayForm,
  setSprayForm,
  handleGetPestSuggestion,
  submitSprayLog,
  setPestImage,
  harvestExpected,
  handleGetHarvestPrediction,
  submitHarvestForm,
  setHarvestForm,
  harvestForm,
  setCropImage,
  handleGetYieldPrediction,
  submitYieldForm,
  setYieldForm,
  yieldForm,
}) => {
  const statusColors = {
    done: "bg-green-100 text-green-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    pending: "bg-gray-100 text-gray-600",
  };

  const harvestingDone = !!cropCycle.harvesting?.actualDate;
  const sowingDone = cropCycle.sowing?.actualDate;

  const renderStageDetails = () => {
    switch (stage.key) {
      case "cropSelection":
        const sel = cropCycle.cropSelection;
        return sel ? (
          <>
            <div>
              <strong>Selected:</strong> {sel.selected.charAt(0).toUpperCase()}
              {sel.selected.slice(1)}{" "}
            </div>
            <div>
              <strong>Source:</strong> {sel.source}
            </div>
            <div>
              <strong>Date:</strong> {new Date(sel.date).toLocaleDateString()}
            </div>
          </>
        ) : null;

      case "landPreparation":
        const prep = cropCycle.landPreparation;
        if (prep?.done) {
          return (
            <>
              <p>
                <strong>Completed on:</strong>{" "}
                {new Date(prep.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Notes:</strong> {prep.notes || "—"}
              </p>
            </>
          );
        }
        return (
          <>
            <p>
              <strong>Not yet completed</strong>
            </p>
            <textarea
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              placeholder="Add any notes about land preparation..."
              value={landPrepNotes}
              onChange={(e) => setLandPrepNotes(e.target.value)}
            />
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={markLandPreparationDone}
            >
              Mark as Done
            </button>
          </>
        );

      case "sowing":
        const sow = cropCycle.sowing;
        const landDone = cropCycle.landPreparation?.done;

        if (!landDone) return <p>Complete Land Preparation first.</p>;

        if (sow?.actualDate) {
          return (
            <>
              <div>
                <strong>Method:</strong> {sow.method}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(sow.actualDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Notes:</strong> {sow.notes || "—"}
              </div>
              {sow.recommendedDate?.from && (
                <div>
                  <strong>AI Suggested:</strong>{" "}
                  {new Date(sow.recommendedDate.from).toLocaleDateString()} –{" "}
                  {new Date(sow.recommendedDate.to).toLocaleDateString()}
                </div>
              )}
            </>
          );
        }

        return (
          <div className="space-y-3">
            {!sow?.recommendedDate?.from && (
              <button
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={handleSowingRecommendation}
              >
                🤖 Get AI Sowing Recommendation
              </button>
            )}

            {sow?.recommendedDate?.from && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <strong>AI Recommended Sowing Window:</strong>
                <br />
                {new Date(sow.recommendedDate.from).toLocaleDateString()} –{" "}
                {new Date(sow.recommendedDate.to).toLocaleDateString()}
              </div>
            )}

            <input
              type="date"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              value={sowingInput.actualDate}
              onChange={(e) =>
                setSowingInput({ ...sowingInput, actualDate: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="Method (e.g. broadcasting)"
              value={sowingInput.method}
              onChange={(e) =>
                setSowingInput({ ...sowingInput, method: e.target.value })
              }
            />
            <textarea
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
              placeholder="Notes (optional)"
              value={sowingInput.notes}
              onChange={(e) =>
                setSowingInput({ ...sowingInput, notes: e.target.value })
              }
            />
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={submitSowingDetails}
            >
              Save Sowing Info
            </button>
          </div>
        );

      case "irrigation":
        const irrigationLogs = cropCycle.irrigation?.logs || [];

        if (!sowingDone) {
          return (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Complete Sowing before proceeding to Irrigation.
            </p>
          );
        }

        return (
          <div className="space-y-4">
            {/* Show past logs */}
            {irrigationLogs.length > 0 && (
              <div className="space-y-2">
                {irrigationLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border"
                  >
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Method:</strong> {log.method}
                    </div>
                    <div>
                      <strong>Notes:</strong> {log.notes || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No actions allowed if harvesting done */}
            {harvestingDone ? (
              <p className="text-green-600 dark:text-green-400 font-semibold">
                Irrigation marked as done. No further actions allowed.
              </p>
            ) : (
              <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-md border space-y-3">
                {!lastRecommendation ? (
                  <button
                    onClick={handleGetIrrigationRecommendation}
                    className=""
                  >
                    🧠 Get AI Irrigation Suggestion
                  </button>
                ) : lastRecommendation.needed === true ? (
                  <>
                    <p className="text-red-700 font-semibold">
                      Irrigation is recommended by AI.
                    </p>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      value={irrigationForm.date}
                      onChange={(e) =>
                        setIrrigationForm({
                          ...irrigationForm,
                          date: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Method (e.g. drip, sprinkler)"
                      value={irrigationForm.method}
                      onChange={(e) =>
                        setIrrigationForm({
                          ...irrigationForm,
                          method: e.target.value,
                        })
                      }
                    />
                    <textarea
                      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Notes (optional)"
                      value={irrigationForm.notes}
                      onChange={(e) =>
                        setIrrigationForm({
                          ...irrigationForm,
                          notes: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={submitIrrigationLog}
                      className="btn-primary"
                    >
                      💾 Save Irrigation Log
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-green-700 font-semibold">
                      No irrigation needed at this time.
                    </p>
                    <button
                      onClick={handleGetIrrigationRecommendation}
                      className="bg-gray-500 hover:bg-gray-950 text-white font-bold py-2 px-4 rounded-full"
                    >
                      🔁 Check Again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case "fertilization":
        const fertilizerLogs = cropCycle.fertilization?.logs || [];

        if (!sowingDone) {
          return (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Complete Sowing before proceeding to Fertilizer.
            </p>
          );
        }

        return (
          <div className="space-y-4">
            {fertilizerLogs.length > 0 && (
              <div className="space-y-2">
                {fertilizerLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border"
                  >
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Type:</strong> {log.type}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {log.quantity}
                    </div>
                    <div>
                      <strong>Notes:</strong> {log.notes || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-green-50 dark:bg-gray-800 p-3 rounded-md border space-y-3">
              {harvestingDone ? (
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  Fertilization marked as done. No further actions allowed.
                </p>
              ) : !lastFertilizerRecommendation ? (
                <button
                  onClick={handleGetFertilizerRecommendation}
                  className="border-amber-50"
                >
                  🧠 Get AI Fertilizer Suggestion
                </button>
              ) : lastFertilizerRecommendation.needed === true ? (
                <>
                  <p className="text-red-700 font-semibold">
                    Fertilization is recommended. Suggested:{" "}
                    <strong>
                      {lastFertilizerRecommendation.recommendedType}
                    </strong>
                  </p>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    value={fertilizerForm.date}
                    onChange={(e) =>
                      setFertilizerForm({
                        ...fertilizerForm,
                        date: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Fertilizer Type"
                    value={fertilizerForm.type}
                    onChange={(e) =>
                      setFertilizerForm({
                        ...fertilizerForm,
                        type: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Quantity (e.g. 5kg)"
                    value={fertilizerForm.quantity}
                    onChange={(e) =>
                      setFertilizerForm({
                        ...fertilizerForm,
                        quantity: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Notes (optional)"
                    value={fertilizerForm.notes}
                    onChange={(e) =>
                      setFertilizerForm({
                        ...fertilizerForm,
                        notes: e.target.value,
                      })
                    }
                  />
                  <button onClick={submitFertilizerLog} className="btn-primary">
                    💾 Save Fertilizer Log
                  </button>
                </>
              ) : (
                <>
                  <p className="text-green-700 font-semibold">
                    No fertilization needed at this time.
                  </p>
                  <button
                    onClick={handleGetFertilizerRecommendation}
                    className="btn-primary"
                  >
                    🔁 Check Again
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case "pestManagement":
        const pest = cropCycle.pestManagement;

        if (!sowingDone) {
          return (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Complete Sowing before proceeding to Pest Management.
            </p>
          );
        }

        const unresolvedIssue = pest.issues?.find((issue) => !issue.resolved);

        return (
          <div className="space-y-4">
            {(pest?.issues?.length > 0 || pest?.sprayLogs?.length > 0) && (
              <div className="space-y-2">
                {pest.issues?.map((issue, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 dark:bg-gray-800 p-3 rounded-md border"
                  >
                    <div>
                      <strong>Issue:</strong> {issue.type}
                    </div>
                    <div>
                      <strong>Detected:</strong>{" "}
                      {new Date(issue.detectedOn).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Treatment:</strong> {issue.treatment}
                    </div>
                    <div>
                      <strong>Resolved:</strong> {issue.resolved ? "Yes" : "No"}
                    </div>

                    {issue.sprayLogs?.map((spray, i) => (
                      <div
                        key={i}
                        className="bg-blue-50 dark:bg-gray-800 p-3 mt-2 rounded-md border"
                      >
                        <div>
                          <strong>Date:</strong>{" "}
                          {new Date(spray.date).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Pesticide:</strong> {spray.pesticide} (
                          {spray.quantity})
                        </div>
                        <div>
                          <strong>Notes:</strong> {spray.notes || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {pest.sprayLogs?.map((spray, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 dark:bg-gray-800 p-3 rounded-md border"
                  >
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(spray.date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Pesticide:</strong> {spray.pesticide} (
                      {spray.quantity})
                    </div>
                    <div>
                      <strong>Notes:</strong> {spray.notes || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-md border space-y-3">
              {harvestingDone ? (
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  Pest Management marked as done. No further actions allowed.
                </p>
              ) : !unresolvedIssue ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPestImage(e.target.files[0])}
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <button
                    onClick={handleGetPestSuggestion}
                    className="btn-primary"
                  >
                    🧠 Detect Pest via AI
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-red-700 font-semibold">
                    Pest detected: {unresolvedIssue.type}
                  </p>
                  <p>
                    Suggested Treatment:{" "}
                    <strong>{unresolvedIssue.treatment}</strong>
                  </p>

                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    value={sprayForm.date}
                    onChange={(e) =>
                      setSprayForm({ ...sprayForm, date: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Pesticide used"
                    value={sprayForm.pesticide}
                    onChange={(e) =>
                      setSprayForm({ ...sprayForm, pesticide: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Quantity (e.g. 500ml/acre)"
                    value={sprayForm.quantity}
                    onChange={(e) =>
                      setSprayForm({ ...sprayForm, quantity: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Notes (optional)"
                    value={sprayForm.notes}
                    onChange={(e) =>
                      setSprayForm({ ...sprayForm, notes: e.target.value })
                    }
                  />
                  <button
                    onClick={() => submitSprayLog(unresolvedIssue._id)}
                    className="btn-primary"
                  >
                    💾 Save Spray Log
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case "harvesting":
        const harvesting = cropCycle.harvesting || {};

        if (!sowingDone) {
          return (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Complete Sowing before proceeding to Harvesting.
            </p>
          );
        }

        return (
          <div className="space-y-4">
            {harvesting.expectedDate && (
              <div className="bg-yellow-50 dark:bg-gray-800 p-3 rounded-md border">
                <p>
                  <strong>📅 Expected Harvest Date (AI):</strong>{" "}
                  {new Date(harvesting.expectedDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {harvesting.actualDate && (
              <div className="bg-green-50 dark:bg-gray-800 p-3 rounded-md border">
                <p>
                  <strong>✅ Actual Harvested On:</strong>{" "}
                  {new Date(harvesting.actualDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>📝 Notes:</strong> {harvesting.notes || "—"}
                </p>
              </div>
            )}

            {!harvesting.expectedDate && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCropImage(e.target.files[0])}
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />

                <button
                  onClick={handleGetHarvestPrediction}
                  className="btn-primary"
                >
                  🧠 Detect Pest via AI
                </button>
              </div>
            )}

            {harvesting.expectedDate && !harvesting.actualDate && (
              <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-md border space-y-3">
                <h3 className="font-semibold">📦 Log Actual Harvest</h3>

                <input
                  type="date"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  value={harvestForm.actualDate}
                  onChange={(e) =>
                    setHarvestForm({
                      ...harvestForm,
                      actualDate: e.target.value,
                    })
                  }
                />

                <textarea
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Notes (optional)"
                  value={harvestForm.notes}
                  onChange={(e) =>
                    setHarvestForm({
                      ...harvestForm,
                      notes: e.target.value,
                    })
                  }
                />

                <button onClick={submitHarvestForm} className="btn-primary">
                  💾 Save Harvest Info
                </button>
              </div>
            )}
          </div>
        );

      case "yield":
        const yieldData = cropCycle.yield || {};

        if (!harvestingDone) {
          return (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Complete Harvesting before entering Yield.
            </p>
          );
        }

        return (
          <div className="space-y-4">
            {yieldData.expected && (
              <div className="bg-yellow-50 dark:bg-gray-800 p-3 rounded-md border">
                <p>
                  <strong>📊 AI Predicted Yield:</strong> {yieldData.expected}{" "}
                  {yieldData.unit}
                </p>
              </div>
            )}

            {yieldData.actual && (
              <div className="bg-green-50 dark:bg-gray-800 p-3 rounded-md border">
                <p>
                  <strong>✅ Actual Yield:</strong> {yieldData.actual}{" "}
                  {yieldData.unit}
                </p>
                <p>
                  <strong>📝 Notes:</strong> {yieldData.notes || "—"}
                </p>
              </div>
            )}

            {!yieldData.expected && (
              <button
                onClick={handleGetYieldPrediction}
                className="btn-primary"
              >
                🧠 Predict Yield using AI
              </button>
            )}

            {yieldData.expected && !yieldData.actual && (
              <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-md border space-y-3">
                <h3 className="font-semibold">📥 Enter Actual Yield</h3>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Enter actual yield"
                  value={yieldForm.actual}
                  onChange={(e) =>
                    setYieldForm({ ...yieldForm, actual: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  value={yieldForm.unit}
                  onChange={(e) =>
                    setYieldForm({ ...yieldForm, unit: e.target.value })
                  }
                />
                <textarea
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Notes (optional)"
                  value={yieldForm.notes}
                  onChange={(e) =>
                    setYieldForm({ ...yieldForm, notes: e.target.value })
                  }
                />
                <button onClick={submitYieldForm} className="btn-primary">
                  💾 Save Yield Info
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      key={stage.key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      {/* Stage Image */}
      <img
        className="w-full md:w-60 h-48 md:h-auto object-cover md:rounded-s-2xl"
        src={stageImages[stage.key]}
        alt={stage.name}
        loading="lazy"
      />

      {/* Stage Info */}
      <div className="p-5 flex flex-col justify-between w-full">
        {/* Title & Status */}
        <div className="flex justify-between items-start mb-4">
          <h5 className="text-xl font-semibold text-gray-900 dark:text-white">
            {stage.name}
          </h5>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium capitalize whitespace-nowrap ${
              statusColors[stage.status]
            }`}
          >
            {stage.status}
          </span>
        </div>

        {/* Details */}
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
          {renderStageDetails()}
        </div>
      </div>
    </motion.div>
  );
};

export default StageCard;
