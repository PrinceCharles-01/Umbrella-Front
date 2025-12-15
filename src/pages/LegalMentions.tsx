import React from 'react';

const LegalMentions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Mentions Légales</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Informations Générales</h2>
          <p className="mb-2">Nom de l'entreprise : Umbrella</p>
          <p className="mb-2">Forme juridique : [À compléter]</p>
          <p className="mb-2">Adresse du siège social : [À compléter]</p>
          <p className="mb-2">Numéro de téléphone : [À compléter]</p>
          <p className="mb-2">Adresse e-mail : [À compléter]</p>
          <p className="mb-2">Numéro d'immatriculation : [À compléter]</p>
          <p className="mb-2">Capital social : [À compléter]</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
          <p className="mb-2">Nom de l'hébergeur : [À compléter]</p>
          <p className="mb-2">Adresse de l'hébergeur : [À compléter]</p>
          <p className="mb-2">Numéro de téléphone de l'hébergeur : [À compléter]</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Propriété Intellectuelle</h2>
          <p className="mb-2">L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques. La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Données Personnelles</h2>
          <p className="mb-2">Umbrella s'engage à ce que la collecte et le traitement de vos données, effectués à partir du site, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés. Pour toute information ou exercice de vos droits Informatique et Libertés sur les traitements de données personnelles gérés par Umbrella, vous pouvez nous contacter.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation de Responsabilité</h2>
          <p className="mb-2">Umbrella ne saurait être tenu pour responsable des erreurs rencontrées sur le site, problèmes techniques, interprétation des informations publiées et conséquences de leur utilisation. En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Droit Applicable</h2>
          <p className="mb-2">Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
        </section>
      </div>
    </div>
  );
};

export default LegalMentions;
