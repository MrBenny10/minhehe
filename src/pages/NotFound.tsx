import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>

      <p className="text-lg mb-6">
        React Router caught this route: <br />
        <code className="bg-muted px-2 py-1 rounded text-sm">
          {location.pathname}
        </code>
      </p>

      <div className="flex gap-4">
        <Link to="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
