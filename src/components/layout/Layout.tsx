import { ReactNode } from 'react';
import Header from '@/components/shared/Header';
import { TreePine, Heart, Mail } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <footer className="bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo et Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TreePine className="w-8 h-8" />
                <h2 className="text-xl font-bold">Famille Connect</h2>
              </div>
              <p className="text-white/80">
                Votre arbre généalogique en ligne, pour garder vivante l'histoire de votre famille.
              </p>
            </div>

            {/* Liens Rapides */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Liens Rapides</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/dashboard" className="text-white/80 hover:text-white transition-colors">
                    Tableau de bord
                  </a>
                </li>
                <li>
                  <a href="/dashboard/tree" className="text-white/80 hover:text-white transition-colors">
                    Arbre généalogique
                  </a>
                </li>
                <li>
                  <a href="/dashboard/members" className="text-white/80 hover:text-white transition-colors">
                    Membres
                  </a>
                </li>
                <li>
                  <a href="/dashboard/profile" className="text-white/80 hover:text-white transition-colors">
                    Profil
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <a href="mailto:contact@familleconnect.fr" className="text-white/80 hover:text-white transition-colors">
                    contact@familleconnect.fr
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-white/80">
                    Fait avec ❤️ pour les familles
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/60">
            <p>&copy; {new Date().getFullYear()} Famille Connect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
