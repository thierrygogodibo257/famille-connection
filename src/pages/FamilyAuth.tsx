import { AuthPage } from './auth/AuthPage';
import Layout from '@/components/layout/Layout';

export const FamilyAuth = () => {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <main className="flex-grow flex justify-center">
          <div className="w-full max-w-md mt-20 mb-20">
            <div className="glass-effect rounded-2xl p-8 shadow-xl">
              <AuthPage />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default FamilyAuth;
