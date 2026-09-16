// Données de démonstration — utilisées uniquement quand aucune connexion Gmail réelle
// n'est active. Ce fichier joue le rôle d'adaptateur "fictif" isolé, remplaçable par
// GmailAdapter (voir src/adapters/GmailAdapter.js) sans changer l'UI.

export const demoProfile = {
  name: 'Quentin Morel',
  email: 'quentin.morel@kdm-mail360.app',
  avatarColor: '#4453D6',
  storageUsedGb: 4.2,
  storageTotalGb: 15,
}

export const demoLabels = [
  { id: 'lbl_projet', name: 'Projet Atlas', color: '#4453D6', count: 6 },
  { id: 'lbl_marketing', name: 'Marketing', color: '#D5484F', count: 2 },
  { id: 'lbl_produit', name: 'Produit', color: '#2E9E77', count: 3 },
  { id: 'lbl_recrutement', name: 'Recrutement', color: '#C98A2C', count: 1 },
  { id: 'lbl_finance', name: 'Finance', color: '#E07A4F', count: 4 },
  { id: 'lbl_voyages', name: 'Voyages', color: '#8B5FBF', count: 0 },
]

export const demoFolderCounts = {
  inbox: 12,
  followed: 3,
  snoozed: 2,
  sent: 0,
  drafts: 3,
  archive: 0,
  trash: 0,
}

function initials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

const people = [
  { name: 'Camille Rousseau', email: 'camille.rousseau@partenaire-conseil.fr', role: 'Cheffe de projet', org: 'Partenaire Conseil', phone: '+33 6 45 12 78 03', location: 'Lyon, France', online: true },
  { name: 'Antoine Faure', email: 'antoine.faure@kdm-mail360.app', role: 'Chef de produit', org: 'Équipe produit', phone: null, location: null, online: false },
  { name: 'Sophie Delmas', email: 'sophie.delmas@kdm-mail360.app', role: 'Designeuse UX', org: 'Équipe produit', phone: null, location: null, online: true },
  { name: 'Louis Barbier', email: 'louis.barbier@finance-ext.fr', role: 'Contrôleur de gestion', org: 'Direction financière', phone: '+33 6 21 09 44 12', location: null, online: false },
  { name: 'Élise Chevalier', email: 'elise.chevalier@partenaire-conseil.fr', role: 'Consultante', org: 'Partenaire Conseil', phone: null, location: null, online: false },
  { name: 'Marc Petitjean', email: 'marc.petitjean@kdm-mail360.app', role: 'Support technique', org: 'IT interne', phone: null, location: null, online: false },
  { name: 'Direction Générale', email: 'direction@kdm-mail360.app', role: null, org: null, phone: null, location: null, online: false },
  { name: 'Claire Fontaine', email: 'claire.fontaine@kdm-mail360.app', role: 'Office manager', org: 'RH', phone: null, location: null, online: true },
]

function person(name) {
  const p = people.find((x) => x.name === name)
  return { ...p, initials: initials(name) }
}

const now = new Date('2026-09-16T11:20:00')
const h = (n) => new Date(now.getTime() - n * 3600 * 1000).toISOString()
const d = (n) => new Date(now.getTime() - n * 24 * 3600 * 1000).toISOString()

export const demoThreads = [
  {
    id: 't1',
    folder: 'inbox',
    starred: true,
    unread: true,
    from: person('Camille Rousseau'),
    to: ['moi', 'Équipe produit'],
    subject: 'Validation finale — lancement du projet Atlas',
    preview: 'Bonjour Quentin, voici la version finale du dossier de lancement, intégrant les retours de l\u2019équipe et du comité...',
    date: h(2),
    messageCount: 3,
    labels: ['lbl_projet'],
    attachments: [
      { name: 'Dossier_ATLAS_vfinale.pdf', size: '2,4 Mo', type: 'pdf' },
      { name: 'Planning_lancement.png', size: '1,1 Mo', type: 'image' },
      { name: 'Synthese_comite.docx', size: '320 Ko', type: 'doc' },
    ],
    body: [
      'Bonjour Quentin,',
      "Voici la version finale du dossier de lancement du projet Atlas, intégrant l\u2019ensemble des retours de l\u2019équipe et du comité. Nous sommes désormais alignés sur le périmètre, le budget et le calendrier.",
      "Il ne reste plus qu\u2019à obtenir ta validation pour pouvoir communiquer officiellement auprès des parties prenantes dès lundi.",
      "N\u2019hésite pas si tu as la moindre question ou un dernier ajustement à suggérer.",
      "À très vite,",
    ],
    signoff: 'Camille Rousseau\nCheffe de projet — Atlas',
    statusSteps: [
      { label: 'Cadrage', sub: 'Terminé', state: 'done' },
      { label: 'Conception', sub: 'Terminé', state: 'done' },
      { label: 'Validation', sub: 'En cours', state: 'current' },
      { label: 'Lancement', sub: 'À venir', state: 'todo' },
    ],
    summary: [
      "Camille transmet la version finale du dossier de lancement du projet Atlas.",
      "Le périmètre, le budget et le calendrier sont validés par l\u2019équipe.",
      "Il ne manque plus que ta validation pour communiquer officiellement dès lundi.",
    ],
    tasks: [
      { id: 'tk1', title: 'Valider le dossier de lancement', due: 'Lun. 21 sept.', owner: 'Camille Rousseau', done: false },
      { id: 'tk2', title: 'Préparer la communication aux parties prenantes', due: 'Lun. 21 sept.', owner: 'Camille Rousseau', done: false },
      { id: 'tk3', title: 'Vérifier les derniers ajustements', due: 'Mar. 22 sept.', owner: null, done: false },
    ],
  },
  {
    id: 't2',
    folder: 'inbox',
    starred: false,
    unread: true,
    from: person('Antoine Faure'),
    to: ['moi'],
    subject: 'Point hebdo — équipe produit',
    preview: "Voici un résumé des avancées de la semaine et des sujets à trancher avant vendredi...",
    date: h(6),
    messageCount: 2,
    labels: ['lbl_produit'],
    attachments: [],
    body: [
      'Salut,',
      "Voici un résumé des avancées de la semaine et des sujets à trancher avant vendredi. Le module de recherche est en bonne voie, on vise un déploiement en préproduction jeudi.",
      "On garde le point hebdo à la même heure la semaine prochaine ?",
    ],
    signoff: 'Antoine',
    statusSteps: null,
    summary: ["Antoine partage l\u2019avancement hebdomadaire de l\u2019équipe produit.", "Le module de recherche est en bonne voie, déploiement en préproduction jeudi."],
    tasks: [{ id: 'tk4', title: 'Confirmer le créneau du point hebdo', due: null, owner: null, done: false }],
  },
  {
    id: 't3',
    folder: 'inbox',
    starred: false,
    unread: false,
    from: person('Sophie Delmas'),
    to: ['moi'],
    subject: 'Re: Retours sur la maquette v3',
    preview: "Merci pour ces retours très constructifs, j\u2019ai intégré la plupart des ajustements...",
    date: h(9),
    messageCount: 4,
    labels: [],
    attachments: [],
    body: ['Merci pour ces retours très constructifs, j\u2019ai intégré la plupart des ajustements sur la v3. Je te partage une nouvelle capture d\u2019écran demain matin.'],
    signoff: 'Sophie',
    statusSteps: null,
    summary: ["Sophie a intégré les retours sur la maquette v3 et enverra une nouvelle version demain."],
    tasks: [],
  },
  {
    id: 't4',
    folder: 'inbox',
    starred: false,
    unread: false,
    from: person('Louis Barbier'),
    to: ['moi'],
    subject: 'Budget Q3 — validation',
    preview: 'Bonjour, peux-tu jeter un œil au budget prévisionnel avant notre échange de jeudi ?',
    date: h(10),
    messageCount: 1,
    labels: ['lbl_finance'],
    attachments: [{ name: 'Budget-Q3.xlsx', size: '184 Ko', type: 'sheet' }],
    body: ['Bonjour,', "Peux-tu jeter un œil au budget prévisionnel avant notre échange de jeudi ? Je souhaite qu\u2019on valide les grandes masses ensemble avant de le transmettre à la direction."],
    signoff: 'Louis',
    statusSteps: null,
    summary: ["Louis demande une revue du budget prévisionnel Q3 avant jeudi."],
    tasks: [{ id: 'tk5', title: 'Relire le budget prévisionnel Q3', due: 'Jeu. 18 sept.', owner: 'Quentin', done: false }],
  },
  {
    id: 't5',
    folder: 'inbox',
    starred: false,
    unread: false,
    from: person('Élise Chevalier'),
    to: ['moi'],
    subject: 'Compte rendu — réunion client',
    preview: 'Tu trouveras ci-joint le compte rendu et les prochaines étapes convenues avec le client...',
    date: d(1),
    messageCount: 1,
    labels: ['lbl_projet'],
    attachments: [
      { name: 'CR_reunion_client.pdf', size: '410 Ko', type: 'pdf' },
      { name: 'Actions_suivi.xlsx', size: '96 Ko', type: 'sheet' },
      { name: 'Photo_atelier.jpg', size: '2,1 Mo', type: 'image' },
      { name: 'Notes.txt', size: '4 Ko', type: 'doc' },
    ],
    body: ['Tu trouveras ci-joint le compte rendu et les prochaines étapes convenues avec le client.'],
    signoff: 'Élise',
    statusSteps: null,
    summary: ['Élise a partagé le compte rendu de la réunion client et les actions de suivi.'],
    tasks: [],
  },
  {
    id: 't6',
    folder: 'inbox',
    starred: false,
    unread: false,
    from: person('Marc Petitjean'),
    to: ['moi'],
    subject: 'Accès plateforme de test',
    preview: 'Les accès sont maintenant actifs, tu peux te connecter avec ton identifiant habituel...',
    date: d(1),
    messageCount: 1,
    labels: [],
    attachments: [],
    body: ['Les accès sont maintenant actifs, tu peux te connecter avec ton identifiant habituel.'],
    signoff: 'Marc',
    statusSteps: null,
    summary: ['Marc confirme que les accès à la plateforme de test sont actifs.'],
    tasks: [],
  },
  {
    id: 't7',
    folder: 'inbox',
    starred: false,
    unread: false,
    from: person('Direction Générale'),
    to: ['moi'],
    subject: 'Annonce — nouveaux locaux',
    preview: 'Nous sommes heureux de vous annoncer l\u2019emménagement dans nos nouveaux locaux le mois prochain...',
    date: d(1),
    messageCount: 1,
    labels: [],
    attachments: [],
    body: ['Nous sommes heureux de vous annoncer l\u2019emménagement dans nos nouveaux locaux le mois prochain.'],
    signoff: 'La direction',
    statusSteps: null,
    summary: ['Annonce de l\u2019emménagement dans de nouveaux locaux le mois prochain.'],
    tasks: [],
  },
  {
    id: 't8',
    folder: 'inbox',
    starred: false,
    unread: false,
    from: person('Claire Fontaine'),
    to: ['moi'],
    subject: 'Invitation — déjeuner équipe',
    preview: 'Ravis de nous retrouver jeudi prochain pour un déjeuner d\u2019équipe...',
    date: d(1),
    messageCount: 1,
    labels: [],
    attachments: [],
    body: ['Ravis de nous retrouver jeudi prochain pour un déjeuner d\u2019équipe.'],
    signoff: 'Claire',
    statusSteps: null,
    summary: ['Claire invite l\u2019équipe à un déjeuner jeudi prochain.'],
    tasks: [{ id: 'tk6', title: 'Confirmer présence au déjeuner d\u2019équipe', due: 'Jeu. 18 sept.', owner: null, done: false }],
  },
]

export const demoDrafts = [
  { id: 'dr1', to: 'sophie.delmas@kdm-mail360.app', subject: 'Re: Retours sur la maquette v3', preview: 'Merci Sophie, une dernière remarque sur...' },
]
