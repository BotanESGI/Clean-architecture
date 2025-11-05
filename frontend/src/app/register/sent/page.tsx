import Link from "next/link";

type PageProps = {
  searchParams: { email?: string | string[] };
};

export default function RegisterSentPage({ searchParams }: PageProps) {
  const raw = searchParams?.email;
  const email = Array.isArray(raw) ? raw[0] : raw;

  return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Vérifiez votre boîte mail</h1>
          <p className="text-muted">
            Nous avons envoyé un lien de confirmation {email ? `à ${email}` : "par email"}. Cliquez dessus pour
            activer votre compte.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/" className="btn-secondary">Retour à l’accueil</Link>
            <Link href="/login" className="btn-primary">Se connecter</Link>
          </div>
        </div>
      </div>
  );
}
