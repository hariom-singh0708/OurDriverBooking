import SOS from "../models/SOS.model.js";
import { sendEmail } from "../utils/sendEmail.js";
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

await sendEmail({
  to: process.env.EMAIL_USER, // admin / ops email
  subject: "SOS Resolved",
  html: `
    <h3>Hello Team,</h3>

    <p>An <b style="color:red">SOS alert</b> has been <b style="color:green">RESOLVED</b>.</p>

    <p><b>Ride ID:</b> ${ride?._id || sos.rideId}</p>
    <p><b>Triggered By:</b> ${user?.name || "—"} (${user?.mobile || "—"})</p>
    <p><b>Role:</b> ${sos.role}</p>
    <p><b>Resolved At:</b> ${new Date(sos.resolvedAt).toLocaleString("en-IN")}</p>

    <br/>

    <p>The emergency has been handled successfully.</p>

    <br/>
    <p>Thanks,<br/>Driver Booking Team</p>
  `,
});



  res.json({ success: true, message: "SOS resolved" });
};
