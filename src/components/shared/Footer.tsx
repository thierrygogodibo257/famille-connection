import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Créateur */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold gradient-text">Thierr Gogo</h3>
            <p className="text-gray-600">
              Développeur FullStack<br />
              Siège : Riviera 3/Abidjan
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold gradient-text">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-whatsapp-600 transition-colors duration-200"
                >
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/members"
                  className="text-gray-600 hover:text-whatsapp-600 transition-colors duration-200"
                >
                  Membres
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/settings"
                  className="text-gray-600 hover:text-whatsapp-600 transition-colors duration-200"
                >
                  Paramètres
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold gradient-text">Contact</h3>
            <p className="text-gray-600">
              <a href="mailto:2024dibo@gmail.com" className="hover:text-whatsapp-600 transition-colors">2024dibo@gmail.com</a><br />
              +225 0758966156<br />
              +225 0141573641
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>&copy; {currentYear} Family Tree. Créé avec</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>pour votre famille</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
