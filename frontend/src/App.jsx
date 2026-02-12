import AppRoutes from "./routes/AppRoutes";
import "leaflet/dist/leaflet.css";
import { Toaster } from 'react-hot-toast';
export default function App() {
  return  <>
  <Toaster position="bottom-right" reverseOrder={false} />
  <AppRoutes />
  </>
}
