import { RegisterForm } from "../../components/organisms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold leading-tight">Ouvrez votre compte <span className="text-primary">en quelques minutes</span></h1>
        <p className="text-muted mt-3 max-w-md">Profitez d'une sécurité de niveau bancaire, de paiements rapides et d'une gestion simple de vos finances.</p>
        <div className="mt-10 relative h-72">
          <div className="absolute -left-6 top-0 w-48 phone-card"><div className="phone-notch" /><div className="aspect-[9/19]" /></div>
          <div className="absolute left-24 top-10 w-48 rotate-6 phone-card"><div className="phone-notch" /><div className="aspect-[9/19]" /></div>
        </div>
      </div>

      <div className="glass border border-white/10 rounded-2xl p-8 shadow-glow w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Créer un compte</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
