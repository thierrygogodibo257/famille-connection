import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-whatsapp-600">404</h1>
          <p className="text-2xl text-gray-600">Oops! Page non trouvée</p>
          <p className="text-gray-500">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Button
            onClick={() => window.location.href = ROUTES.HOME}
            className="mt-4"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
