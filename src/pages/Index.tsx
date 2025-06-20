
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, TreePine, Photo, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TreePine className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">Famille Connection</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Connexion</Button>
            <Button>S'inscrire</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-4">
              🌟 Nouveau : Arbre généalogique interactif
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Connectez-vous avec votre
              <span className="text-emerald-600 block">famille</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Créez votre arbre généalogique, partagez vos souvenirs et restez connecté 
              avec tous les membres de votre famille en un seul endroit.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Commencer gratuitement
              </Button>
              <Button size="lg" variant="outline">
                Voir une démo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour votre famille
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Des outils puissants et simples pour construire et maintenir vos liens familiaux
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <TreePine className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle>Arbre généalogique</CardTitle>
                  <CardDescription>
                    Créez et explorez votre arbre familial avec une interface interactive et intuitive
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Profils familiaux</CardTitle>
                  <CardDescription>
                    Créez des profils détaillés pour chaque membre de la famille avec photos et informations
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Photo className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>Souvenirs partagés</CardTitle>
                  <CardDescription>
                    Partagez photos, vidéos et histoires familiales pour préserver vos précieux souvenirs
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Événements familiaux</CardTitle>
                  <CardDescription>
                    Organisez et suivez les anniversaires, réunions et célébrations familiales
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Connexions authentiques</CardTitle>
                  <CardDescription>
                    Restez proche de votre famille avec des outils de communication intégrés
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Sécurité et confidentialité</CardTitle>
                  <CardDescription>
                    Vos données familiales sont protégées avec les plus hauts standards de sécurité
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-emerald-600">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Prêt à connecter votre famille ?
            </h3>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de familles qui utilisent déjà Famille Connection 
              pour rester proches et partager leurs histoires.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Commencer maintenant - C'est gratuit
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <TreePine className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold">Famille Connection</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Famille Connection. Tous droits réservés.</p>
            <p className="mt-2">Construisons ensemble l'avenir de vos liens familiaux.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
