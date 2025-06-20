import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormHeader } from '@/components/shared/FormHeader';
import { FamilyLoginForm } from './FamilyLoginForm';
import { FamilyRegisterForm } from './FamilyRegisterForm';

export const LoginForm = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <FormHeader title="Bienvenue" subtitle="Connectez-vous ou créez un compte pour accéder à votre arbre familial" />
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Connexion</TabsTrigger>
          <TabsTrigger value="register">Inscription</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <FamilyLoginForm />
        </TabsContent>
        <TabsContent value="register">
          <FamilyRegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};
