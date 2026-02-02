import SOS from "../models/SOS.model.js";

export const listSOS = async (req, res) => {
  const list = await SOS.find()
    .populate("triggeredBy", "name role mobile")
    .populate("rideId")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: list });
};

export const resolveSOS = async (req, res) => {
  const sos = await SOS.findById(req.params.id);
  if (!sos) return res.status(404).json({ message: "SOS not found" });

  sos.resolved = true;
  sos.resolvedAt = new Date();
  await sos.save();

  res.json({ success: true, message: "SOS resolved" });
};
