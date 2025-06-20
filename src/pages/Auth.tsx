import { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 via-green-50 to-emerald-50 flex items-center justify-center p-4 pt-32">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Form Content */}
        <div className="p-6">
          {isLogin ? <LoginForm /> : <RegisterForm />}

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-whatsapp-600 hover:text-whatsapp-700 font-medium transition-colors"
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
