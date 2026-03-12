import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-builty-gray mb-8">Mentions légales</h1>
        
        <div className="prose prose-lg max-w-none text-builty-gray-light space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Éditeur du site</h2>
            <p>
              Builty SAS<br />
              Capital social : 10 000€<br />
              Siège social : [Adresse à compléter]<br />
              RCS : [Numéro à compléter]<br />
              SIRET : [Numéro à compléter]<br />
              TVA intracommunautaire : [Numéro à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Directeur de la publication</h2>
            <p>[Nom du directeur à compléter]</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Hébergement</h2>
            <p>
              Ce site est hébergé par :<br />
              Supabase Inc.<br />
              [Adresse de l'hébergeur]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Contact</h2>
            <p>
              Email : builtypro@gmail.com<br />
              Site web : <a href="https://builty.fr" className="text-builty-blue hover:underline">builty.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de Builty SAS, sauf mention contraire. Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord exprès par écrit de Builty SAS.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function Confidentialite() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-builty-gray mb-8">Politique de confidentialité</h1>
        
        <div className="prose prose-lg max-w-none text-builty-gray-light space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Collecte des données</h2>
            <p>
              Builty collecte les données personnelles suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nom, prénom et email lors de l'inscription</li>
              <li>Informations de l'entreprise (nom, SIRET, adresse)</li>
              <li>Données de facturation et paiement</li>
              <li>Données d'utilisation du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Utilisation des données</h2>
            <p>
              Vos données personnelles sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Vous envoyer des communications importantes</li>
              <li>Assurer la sécurité de nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Protection des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Hébergement sécurisé en France</li>
              <li>Sauvegardes quotidiennes</li>
              <li>Accès restreint aux données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Vos droits RGPD</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : builtypro@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Cookies</h2>
            <p>
              Nous utilisons des cookies essentiels au fonctionnement du site. Consultez notre politique de cookies pour plus d'informations.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function CGV() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-builty-gray mb-8">Conditions Générales de Vente</h1>
        
        <div className="prose prose-lg max-w-none text-builty-gray-light space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 1 - Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent la vente des services proposés par Builty SAS à ses clients professionnels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 2 - Services</h2>
            <p>
              Builty propose un logiciel SaaS de gestion de chantiers comprenant :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gestion des devis et factures</li>
              <li>Planning et suivi de chantiers</li>
              <li>Gestion des équipes</li>
              <li>Suivi de la rentabilité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 3 - Tarifs</h2>
            <p>
              Les tarifs de nos services sont indiqués en euros HT. Ils sont consultables sur notre site web et peuvent être modifiés à tout moment. Les modifications de tarifs ne s'appliquent qu'aux nouveaux abonnements ou renouvellements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 4 - Modalités de paiement</h2>
            <p>
              Le paiement s'effectue :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Par carte bancaire via notre prestataire de paiement sécurisé Stripe</li>
              <li>Mensuellement ou annuellement selon la formule choisie</li>
              <li>Le premier paiement intervient à la fin de la période d'essai de 14 jours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 5 - Période d'essai</h2>
            <p>
              Tous nos plans bénéficient d'une période d'essai gratuite de 14 jours, sans engagement et sans carte bancaire requise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 6 - Résiliation</h2>
            <p>
              L'abonnement peut être résilié à tout moment depuis l'espace client. La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement n'est effectué au prorata.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 7 - Responsabilité</h2>
            <p>
              Builty s'engage à fournir un service de qualité avec une disponibilité de 99,9%. Toutefois, Builty ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Article 8 - Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function Cookies() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-builty-gray mb-8">Politique de Cookies</h1>
        
        <div className="prose prose-lg max-w-none text-builty-gray-light space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre ordinateur lors de la visite d'un site web. Les cookies permettent de mémoriser vos préférences et d'améliorer votre expérience de navigation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Cookies utilisés par Builty</h2>
            
            <h3 className="text-xl font-bold text-builty-gray mb-3 mt-6">Cookies essentiels</h3>
            <p>
              Ces cookies sont nécessaires au fonctionnement du site :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session</strong> : Maintient votre connexion active</li>
              <li><strong>Sécurité</strong> : Protège contre les attaques CSRF</li>
              <li><strong>Préférences</strong> : Mémorise vos choix (langue, etc.)</li>
            </ul>

            <h3 className="text-xl font-bold text-builty-gray mb-3 mt-6">Cookies analytiques</h3>
            <p>
              Ces cookies nous aident à comprendre comment vous utilisez notre site :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Analytics</strong> : Statistiques de visite anonymisées</li>
              <li>Ces cookies peuvent être désactivés dans vos paramètres</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Gestion des cookies</h2>
            <p>
              Vous pouvez à tout moment désactiver les cookies via les paramètres de votre navigateur :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
              <li><strong>Firefox</strong> : Options → Vie privée et sécurité → Cookies</li>
              <li><strong>Safari</strong> : Préférences → Confidentialité → Cookies</li>
            </ul>
            <p className="mt-4">
              Attention : La désactivation de certains cookies peut affecter le fonctionnement du site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Durée de conservation</h2>
            <p>
              Les cookies de session sont supprimés à la fermeture de votre navigateur. Les autres cookies sont conservés pendant 13 mois maximum.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-builty-gray mb-4">Contact</h2>
            <p>
              Pour toute question concernant notre utilisation des cookies, contactez-nous à : builtypro@gmail.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
