import { ArrowLeft, MapPinOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="ag-not-found">
      <section className="ag-not-found-card">
        <span className="ag-not-found-icon"><MapPinOff size={27} /></span>
        <h1>Page not found</h1>
        <p>The requested AtlasGrid workspace page does not exist or is no longer available.</p>
        <Link to="/"><ArrowLeft size={16} /> Return to dashboard</Link>
      </section>
    </main>
  );
}
