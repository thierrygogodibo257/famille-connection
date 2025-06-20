import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { Menu, X, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Star, Settings, UserPlus, Flag, MessageSquare, LogOut, TreePine, Users, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteCodeError, setDeleteCodeError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      // Essayer de déconnecter côté Supabase
      await supabase.auth.signOut();
    } catch (error) {
      // Afficher une erreur mais continuer le process
      console.error('Erreur lors de la déconnexion:', error);
      // Optionnel : afficher un toast ici
    } finally {
      // Nettoyage local dans tous les cas
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').filter(Boolean).forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      navigate('/');
      // Optionnel : window.location.reload();
    }
  };

  const handleDeleteAll = async () => {
    setDeleteCodeError('');
    if (deleteCode !== '1432') {
      setDeleteCodeError('Code secret incorrect');
      return;
    }
    setShowDeleteDialog(false);
    setIsDeleting(true);
    try {
      const result = await api.admin.deleteAllUsers(deleteCode);
      if (result.success) {
        toast({
          title: 'Suppression complète réussie',
          description: `${(result as any).stats?.auth_users ?? result.deletedUsers ?? 0} utilisateurs supprimés.`,
        });
        window.location.href = '/';
      } else {
        toast({
          title: 'Erreur',
          description: result.message || 'Suppression échouée',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteCode('');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gradient-to-r from-whatsapp-700 to-whatsapp-800 shadow-lg' : 'bg-gradient-to-r from-whatsapp-600 to-whatsapp-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo et Titre */}
          <div className="flex items-center space-x-4">
            <motion.div
              className="logo-container relative"
              onHoverStart={() => setIsLogoHovered(true)}
              onHoverEnd={() => setIsLogoHovered(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/images/profile01.png" alt="Logo" className="w-12 h-12 rounded-full ring-2 ring-white/20" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-whatsapp-400 to-whatsapp-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <AnimatePresence>
                {isLogoHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <div className="relative">
              <motion.h1
                className="header-title text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-whatsapp-100 inline-flex items-center justify-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Famille Connect
                <sup className="ml-2 align-super">
                  <Star className="w-10 h-10 text-yellow-400 drop-shadow-lg" style={{ filter: 'brightness(1.5)' }} />
                </sup>
              </motion.h1>
              <motion.p
                className="header-subtitle text-sm text-whatsapp-100/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Par Thierry Gogo Développeur FullStack
              </motion.p>
            </div>
            </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link
                  to={ROUTES.HOME}
                  className={`nav-link relative px-4 py-2 text-white/90 hover:text-white transition-colors ${
                    isActive(ROUTES.HOME)
                      ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full'
                      : ''
                  }`}
                >
                  Accueil
                </Link>
                <Link
                  to={ROUTES.DASHBOARD.TREE}
                  className={`nav-link relative px-4 py-2 text-white/90 hover:text-white transition-colors ${
                    isActive(ROUTES.DASHBOARD.TREE)
                      ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full'
                      : ''
                  }`}
                >
                  Arbre Familial
                </Link>
                <Link
                  to={ROUTES.DASHBOARD.MEMBERS}
                  className={`nav-link relative px-4 py-2 text-white/90 hover:text-white transition-colors ${
                    isActive(ROUTES.DASHBOARD.MEMBERS)
                      ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full'
                      : ''
                  }`}
                >
                  Membres
                </Link>
              </>
            )}
          </nav>

          {/* Zone Sociale */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 shadow-lg">
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  className="social-button text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </motion.button>
                <motion.button
                  type="button"
                  className="social-button text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </motion.button>
                <motion.button
                  type="button"
                  className="social-button text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </motion.button>
                <motion.button
                  type="button"
                  className="social-button text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.button>
                <motion.button
                  type="button"
                  className="social-button text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="MessageCircle"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
        </div>

          {/* Zone Utilisateur */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                  >
                    <Avatar
                      src={user.user_metadata?.photo_url}
                      fallback={user.user_metadata?.first_name?.[0] || 'U'}
                      className="user-avatar ring-2 ring-white/20"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </button>
                </motion.div>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="user-name font-medium">{user.user_metadata?.first_name} {user.user_metadata?.last_name}</p>
                      <p className="user-status-text text-sm text-gray-500">En ligne</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={ROUTES.DASHBOARD.ROOT}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to={ROUTES.DASHBOARD.INVITE}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Inviter un membre
                      </Link>
                      <Link
                        to={ROUTES.DASHBOARD.REPORT}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Signaler un membre
                      </Link>
                      <Link
                        to={ROUTES.DASHBOARD.CHAT}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Initier un chat
                      </Link>
                      {user.user_metadata?.is_admin && (
                        <Link
                          to={ROUTES.DASHBOARD.SETTINGS}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Paramètres
                        </Link>
                      )}
                      {user.user_metadata?.is_admin && (
                        <Link
                          to={ROUTES.DASHBOARD.ADMIN}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Se déconnecter
                      </button>
                      {/* Afficher le bouton Delete All seulement pour les admins */}
                      {user.user_metadata?.is_admin && (
                        <button
                          onClick={() => {
                            setShowDeleteDialog(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-b transition-colors flex items-center mt-1"
                          disabled={isDeleting}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          {isDeleting ? 'Suppression...' : 'Delete All'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to={ROUTES.AUTH.LOGIN}>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Se connecter
                  </Button>
                </Link>
            )}

            {/* Menu Mobile */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <motion.div
        className={`mobile-menu fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 py-6 space-y-4">
          {user ? (
            <>
              <Link
                to={ROUTES.HOME}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to={ROUTES.DASHBOARD.TREE}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Arbre Familial
              </Link>
              <Link
                to={ROUTES.DASHBOARD.MEMBERS}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Membres
              </Link>
              <Link
                to={ROUTES.DASHBOARD.INVITE}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inviter un membre
              </Link>
              <Link
                to={ROUTES.DASHBOARD.REPORT}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Signaler un membre
              </Link>
              <Link
                to={ROUTES.DASHBOARD.CHAT}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Initier un chat
              </Link>
              {user.user_metadata?.is_admin && (
                <Link
                  to={ROUTES.DASHBOARD.SETTINGS}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Paramètres
                </Link>
              )}
              {user.user_metadata?.is_admin && (
                <Link
                  to={ROUTES.DASHBOARD.ADMIN}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Administration
                </Link>
              )}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Se connecter
            </Link>
          )}
        </div>
      </motion.div>

      {/* Boîte de dialogue Delete All - déplacée en dehors du menu */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression totale</DialogTitle>
          </DialogHeader>
          <p className="text-red-600 font-semibold mb-4">Cette action supprimera <b>tous les membres, utilisateurs, profils, relations familiales, messages et notifications</b>. Cette action est <b>irréversible</b>.</p>
          <div className="mb-2">
            <label htmlFor="delete-code" className="block text-sm font-medium text-gray-700 mb-1">Code secret</label>
            <input
              id="delete-code"
              type="password"
              value={deleteCode}
              onChange={e => { setDeleteCode(e.target.value); setDeleteCodeError(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Entrer le code secret pour confirmer"
              disabled={isDeleting}
              autoFocus
            />
            {deleteCodeError && <p className="text-red-500 text-xs mt-1">{deleteCodeError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeleting || deleteCode.length === 0}>
              {isDeleting ? 'Suppression...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
