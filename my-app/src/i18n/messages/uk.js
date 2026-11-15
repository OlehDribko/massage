/*
 * Ukrainian texts of the site: « texte français » → translation (keys are the
 * French texts used in the code, see src/i18n/translate.js). Plural keys
 * ("un|plusieurs") map to { one, few, many, other }.
 */
const messages = {
  'Mon compte': 'Мій кабінет',
  'Espace client': 'Особистий кабінет',
  'Chargement…': 'Завантаження…',
  'Mon rendez-vous': 'Мій запис',
  'Mes réservations': 'Мої записи',
  Connexion: 'Вхід',
  'Confirmer l’inscription': 'Підтвердження підписки',
  Newsletter: 'Розсилка',
  'Confirmer votre <accent>inscription</accent>':
    'Підтвердьте <accent>підписку</accent>',
  'Page introuvable': 'Сторінку не знайдено',
  'Erreur 404': 'Помилка 404',
  'Cette page est <accent>introuvable</accent>':
    'Цю сторінку <accent>не знайдено</accent>',
  'Le lien est peut-être incorrect ou la page a été déplacée.':
    'Можливо, посилання неправильне або сторінку перенесено.',
  'Retour à l’accueil': 'На головну',
  'Prendre rendez-vous': 'Записатися',
  'Massage à Bordeaux | Massage by Stefania Ben':
    'Масаж у Бордо | Massage by Stefania Ben',
  'Cabinet de massage à Bordeaux, rue Castéja : massage thérapeutique et relaxant, Tuina, drainage lymphatique, anti-cellulite et Endosphères. Réservez en ligne.':
    'Масажний кабінет у Бордо, вулиця Кастежа: лікувальний і розслаблювальний масаж, Туйна, лімфодренаж, антицелюлітний масаж та Endospheres. Онлайн-запис.',
  '← Toutes les prestations': '← Усі послуги',
  'Cette prestation ne peut pas être affichée pour le moment. Réessayez dans quelques instants.':
    'Цю послугу зараз не вдається показати. Спробуйте ще раз за мить.',
  Durée: 'Тривалість',
  'Réserver un massage à Bordeaux': 'Запис на масаж у Бордо',
  'Prenez rendez-vous en ligne pour votre massage à Bordeaux, 23 rue Castéja : choisissez le soin et le créneau qui vous conviennent.':
    'Запишіться онлайн на масаж у Бордо, 23 rue Castéja: оберіть процедуру та зручний час.',
  'Réserver un massage <accent>à Bordeaux</accent>':
    'Запис на масаж <accent>у Бордо</accent>',
  'Choisissez votre soin et sa durée, puis l’horaire qui vous convient. Le règlement se fait sur place, au cabinet, 23 rue Castéja.':
    'Оберіть процедуру та її тривалість, а потім зручний час. Оплата на місці, у кабінеті, 23 rue Castéja.',
  'Confirmation immédiate': 'Миттєве підтвердження',
  'Paiement au cabinet': 'Оплата в кабінеті',
  'Annulation en ligne': 'Скасування онлайн',
  'Le service de réservation met trop de temps à répondre.':
    'Сервіс запису відповідає надто довго.',
  'Les prestations ne peuvent pas être affichées pour le moment.':
    'Послуги зараз не вдається показати.',
  'Réessayez dans quelques instants.': 'Спробуйте ще раз за мить.',
  'Référence : {id}': 'Код звернення: {id}',
  Réessayer: 'Спробувати ще раз',
  'Aucune prestation n’est ouverte à la réservation.':
    'Наразі немає послуг, доступних для запису.',
  Désabonnement: 'Відписка',
  'Se <accent>désabonner</accent>': '<accent>Відписатися</accent>',
  'Modifier mon adresse e-mail': 'Змінити адресу e-mail',
  'Adresse e-mail invalide.': 'Неправильна адреса e-mail.',
  'C’est déjà votre adresse actuelle.': 'Це вже ваша поточна адреса.',
  'Un lien de confirmation a été envoyé à {email}. Votre adresse changera après l’ouverture de ce lien ; vous devrez alors vous reconnecter.':
    'Посилання для підтвердження надіслано на {email}. Адреса зміниться після того, як ви його відкриєте; потім потрібно буде увійти знову.',
  'Nouvelle adresse e-mail': 'Нова адреса e-mail',
  'Envoi…': 'Надсилання…',
  'Envoyer le lien': 'Надіслати посилання',
  Fermer: 'Закрити',
  'Vous n’êtes pas inscrit·e à la newsletter.': 'Ви не підписані на розсилку.',
  'Inscription en attente : ouvrez le lien de confirmation reçu par e-mail.':
    'Підписка очікує підтвердження: відкрийте посилання з листа.',
  'Vous êtes inscrit·e à la newsletter.': 'Ви підписані на розсилку.',
  'Vous êtes désinscrit·e. Les e-mails liés à vos rendez-vous ne sont pas concernés.':
    'Ви відписалися. Листів щодо ваших записів це не стосується.',
  'Le statut de la newsletter s’affiche une fois votre adresse e-mail confirmée.':
    'Статус розсилки з’явиться після підтвердження вашої адреси e-mail.',
  'L’inscription à la newsletter n’est pas encore ouverte.':
    'Підписка на розсилку ще не відкрита.',
  'Recevoir la newsletter du cabinet': 'Отримувати розсилку кабінету',
  'Enregistrement…': 'Збереження…',
  Enregistrer: 'Зберегти',
  'Renvoyer l’e-mail de confirmation': 'Надіслати лист підтвердження ще раз',
  'Nouvel envoi possible {wait}.': 'Новий лист можна буде надіслати {wait}.',
  'Aucune modification à enregistrer.': 'Немає змін для збереження.',
  'Profil enregistré.': 'Профіль збережено.',
  'Certaines informations sont invalides.': 'Деякі дані неправильні.',
  'Nom et prénom': 'Ім’я та прізвище',
  Téléphone: 'Телефон',
  'Format international. Utilisé uniquement pour vos rendez-vous.':
    'Міжнародний формат. Використовується лише для ваших записів.',
  'Mon <accent>compte</accent>': 'Мій <accent>кабінет</accent>',
  'Pour terminer votre réservation :': 'Щоб завершити запис:',
  'Votre profil est complet : vous pouvez reprendre votre réservation.':
    'Ваш профіль заповнено: можна повернутися до запису.',
  Continuer: 'Продовжити',
  'Chargement de votre profil…': 'Завантаження профілю…',
  Coordonnées: 'Контактні дані',
  'Votre nom et votre téléphone sont nécessaires pour réserver.':
    'Для запису потрібні ваше ім’я та номер телефону.',
  'Adresse e-mail': 'Адреса e-mail',
  '(confirmée)': '(підтверджено)',
  '(non confirmée)': '(не підтверджено)',
  'Mode de connexion': 'Спосіб входу',
  'Confirmez votre adresse e-mail': 'Підтвердьте адресу e-mail',
  'Un lien de confirmation a été envoyé à {email}. Après l’avoir ouvert, revenez ici et actualisez votre statut.':
    'Посилання для підтвердження надіслано на {email}. Відкривши його, поверніться сюди й оновіть статус.',
  'Vérification…': 'Перевірка…',
  'J’ai confirmé': 'Я підтвердив(-ла)',
  'E-mail de confirmation renvoyé.': 'Лист підтвердження надіслано ще раз.',
  'Renvoyer l’e-mail': 'Надіслати лист ще раз',
  'Déconnexion…': 'Вихід…',
  'Se déconnecter': 'Вийти',
  'Mon profil': 'Мій профіль',
  Administration: 'Адміністрування',
  'L’espace client n’est pas encore disponible.':
    'Особистий кабінет ще недоступний.',
  'Chargement de votre compte…': 'Завантаження облікового запису…',
  'Le service de connexion est momentanément indisponible.':
    'Сервіс входу тимчасово недоступний.',
  'Connectez-vous pour accéder à votre compte.':
    'Увійдіть, щоб перейти до свого кабінету.',
  'Se connecter': 'Увійти',
  'Créer un compte': 'Створити обліковий запис',
  'Créer mon compte': 'Створити обліковий запис',
  'Votre session a expiré ou a été fermée sur un autre appareil. Veuillez vous reconnecter.':
    'Ваш сеанс завершився або його закрито на іншому пристрої. Увійдіть знову.',
  'Ce compte est désactivé. Contactez-nous si vous pensez qu’il s’agit d’une erreur.':
    'Цей обліковий запис вимкнено. Зв’яжіться з нами, якщо вважаєте, що це помилка.',
  'Indiquez votre adresse e-mail.': 'Вкажіть адресу e-mail.',
  'Indiquez votre mot de passe.': 'Вкажіть пароль.',
  '{n} caractères minimum.': 'Щонайменше {n} символів.',
  'Si un compte existe pour cette adresse, un e-mail pour choisir un nouveau mot de passe vient d’être envoyé.':
    'Якщо для цієї адреси існує обліковий запис, на неї щойно надіслано лист для встановлення нового пароля.',
  'La connexion en ligne n’est pas encore disponible.':
    'Онлайн-вхід ще недоступний.',
  'Découvrir les soins': 'Переглянути послуги',
  'Vous êtes <accent>connecté·e</accent>': 'Ви <accent>увійшли</accent>',
  'Type de connexion': 'Тип входу',
  'J’ai un compte': 'У мене є обліковий запис',
  'Nouveau compte': 'Новий обліковий запис',
  'Votre compte vous permettra de retrouver vos informations.':
    'Обліковий запис дає змогу зберігати ваші дані.',
  'Mot de passe': 'Пароль',
  'Masquer le mot de passe': 'Приховати пароль',
  'Afficher le mot de passe': 'Показати пароль',
  Masquer: 'Приховати',
  Afficher: 'Показати',
  'Recevoir la newsletter du cabinet (facultatif)':
    'Отримувати розсилку кабінету (необов’язково)',
  'Un instant…': 'Хвилинку…',
  'Mot de passe oublié ?': 'Забули пароль?',
  ou: 'або',
  'Connexion avec Google…': 'Вхід через Google…',
  'Continuer avec Google': 'Продовжити з Google',
  'Préparation de votre session…': 'Підготовка сеансу…',
  '{duration}, fin à {time}': '{duration}, до {time}',
  'à régler au cabinet': 'оплата в кабінеті',
  'Réservation…': 'Запис…',
  'Confirmer la réservation': 'Підтвердити запис',
  'La réservation en ligne n’est pas encore disponible. Vous pouvez réserver par la page de rendez-vous.':
    'Онлайн-запис ще недоступний. Записатися можна через сторінку запису.',
  'Votre profil n’a pas pu être chargé.': 'Не вдалося завантажити ваш профіль.',
  'Choisissez un horaire': 'Оберіть час',
  'Complétez les étapes ci-contre pour confirmer.':
    'Щоб підтвердити, виконайте кроки поруч.',
  'Se reconnecter': 'Увійти знову',
  '← Changer d’horaire': '← Змінити час',
  'Tout est <accent>prêt</accent>': 'Усе <accent>готово</accent>',
  'Encore <accent>quelques informations</accent>':
    'Ще <accent>кілька даних</accent>',
  'Vérifiez le récapitulatif puis confirmez : le rendez-vous est enregistré immédiatement.':
    'Перевірте підсумок і підтвердіть: запис буде створено одразу.',
  'Votre réservation': 'Ваш запис',
  Modifier: 'Змінити',
  'Aucun horaire choisi': 'Час не обрано',
  Soin: 'Процедура',
  'À régler sur place': 'Оплата на місці',
  'Confirmation immédiate, sans acompte':
    'Миттєве підтвердження, без передоплати',
  'Report en ligne jusqu’à 12 h avant':
    'Перенесення онлайн до 12 год до візиту',
  'Annulation en ligne jusqu’au rendez-vous':
    'Скасування онлайн до початку запису',
  Confirmer: 'Підтвердити',
  ' (terminé)': ' (виконано)',
  'Un lien de confirmation a été envoyé à <email>{email}</email>. Ouvrez-le, puis revenez ici : cette page se met à jour toute seule.':
    'Посилання для підтвердження надіслано на <email>{email}</email>. Відкрийте його й поверніться сюди: сторінка оновиться сама.',
  'Un compte administrateur ne peut pas réserver pour lui-même. Connectez-vous avec un compte client.':
    'Обліковий запис адміністратора не може записуватися сам. Увійдіть під обліковим записом клієнта.',
  Compte: 'Обліковий запис',
  'Pour reporter ou annuler en ligne, votre rendez-vous est lié à un compte.':
    'Щоб переносити чи скасовувати запис онлайн, він прив’язується до облікового запису.',
  'Vos coordonnées': 'Ваші контактні дані',
  'Pour vous joindre en cas d’imprévu concernant le rendez-vous.':
    'Щоб зв’язатися з вами, якщо з записом щось зміниться.',
  'Enregistrer et continuer': 'Зберегти й продовжити',
  'Confirmer votre e-mail': 'Підтвердьте e-mail',
  'Adresse confirmée': 'Адресу підтверджено',
  'Un lien vous sera envoyé par e-mail.': 'Вам надішлють посилання на e-mail.',
  Horaire: 'Час',
  Confirmation: 'Підтвердження',
  'Étapes de la réservation': 'Етапи запису',
  'par le client': 'клієнтом',
  'par le cabinet': 'кабінетом',
  Date: 'Дата',
  Prestation: 'Послуга',
  Tarif: 'Вартість',
  '· règlement sur place': '· оплата на місці',
  Annulation: 'Скасування',
  'Annulé {by} le {date}': 'Скасовано {by} {date}',
  'Motif : {reason}': 'Причина: {reason}',
  'Réservation créée': 'Запис створено',
  'Rendez-vous déplacé': 'Запис перенесено',
  'Annulé {by}': 'Скасовано {by}',
  Modification: 'Зміна',
  vers: 'на',
  'Filtrer les soins': 'Фільтр послуг',
  'Type de soin': 'Тип процедури',
  Budget: 'Бюджет',
  Populaires: 'Популярні',
  '<b>{n}</b> soin correspondant à vos critères|<b>{n}</b> soins correspondant à vos critères':
    {
      one: '<b>{n}</b> послуга відповідає вашим критеріям',
      few: '<b>{n}</b> послуги відповідають вашим критеріям',
      many: '<b>{n}</b> послуг відповідають вашим критеріям',
      other: '<b>{n}</b> послуг відповідають вашим критеріям',
    },
  '<b>{n}</b> soin disponible|<b>{n}</b> soins disponibles': {
    one: '<b>{n}</b> послуга доступна',
    few: '<b>{n}</b> послуги доступні',
    many: '<b>{n}</b> послуг доступно',
    other: '<b>{n}</b> послуг доступно',
  },
  'Effacer les filtres': 'Скинути фільтри',
  'les soins les plus demandés': 'найпопулярніші процедури',
  'Aucun soin ne correspond': 'Немає відповідних послуг',
  'Essayez une autre durée ou un autre budget.':
    'Спробуйте іншу тривалість або інший бюджет.',
  'Voir tous les soins': 'Показати всі послуги',
  'À dimanche': 'До зустрічі в неділю',
  'À lundi': 'До зустрічі в понеділок',
  'À mardi': 'До зустрічі у вівторок',
  'À mercredi': 'До зустрічі в середу',
  'À jeudi': 'До зустрічі в четвер',
  'À vendredi': 'До зустрічі в п’ятницю',
  'À samedi': 'До зустрічі в суботу',
  'Ajouter à Google Agenda': 'Додати в Google Календар',
  ' (nouvelle fenêtre)': ' (нове вікно)',
  'Chargement du rendez-vous…': 'Завантаження запису…',
  'Rendez-vous introuvable.': 'Запис не знайдено.',
  'Rendez-vous déplacé au {date}.': 'Запис перенесено на {date}.',
  'Le rendez-vous est déjà à cet horaire.': 'Запис уже призначено на цей час.',
  'Rendez-vous annulé.': 'Запис скасовано.',
  Itinéraire: 'Маршрут',
  'Report en ligne': 'Перенесення онлайн',
  'avant le {date}': 'до {date}',
  'n’est plus possible (moins de 12 h)': 'уже неможливе (менше ніж за 12 год)',
  'jusqu’à l’heure du rendez-vous': 'до часу запису',
  Déplacer: 'Перенести',
  'Annuler le rendez-vous': 'Скасувати запис',
  'Votre rendez-vous est confirmé.': 'Ваш запис підтверджено.',
  'Le règlement se fait sur place.': 'Оплата на місці.',
  'Gérer le rendez-vous': 'Керувати записом',
  ' — motif : {reason}': ' — причина: {reason}',
  'Choisissez un nouvel horaire': 'Оберіть новий час',
  'Choisir cet horaire': 'Обрати цей час',
  Historique: 'Історія',
  'Déplacer le rendez-vous ?': 'Перенести запис?',
  'Nouvel horaire : {date}. La prestation et le tarif restent les mêmes.':
    'Новий час: {date}. Послуга й вартість залишаються тими самими.',
  'Annuler ce rendez-vous ?': 'Скасувати цей запис?',
  'Oui, annuler': 'Так, скасувати',
  Garder: 'Залишити',
  'Plutôt déplacer': 'Краще перенести',
  'L’horaire sera libéré pour quelqu’un d’autre. Cette action est définitive — vous pouvez aussi simplement le déplacer.':
    'Цей час звільниться для інших. Дію не можна скасувати — ви також можете просто перенести запис.',
  'L’horaire sera libéré pour quelqu’un d’autre. Cette action est définitive.':
    'Цей час звільниться для інших. Дію не можна скасувати.',
  'Mon <accent>rendez-vous</accent>': 'Мій <accent>запис</accent>',
  Tout: 'Усі',
  Passés: 'Минулі',
  Annulés: 'Скасовані',
  'Aujourd’hui': 'Сьогодні',
  Demain: 'Завтра',
  'Dans {n} jours': 'Через {n} дн.',
  'Réserver à nouveau': 'Записатися знову',
  'Chargement de vos réservations…': 'Завантаження ваших записів…',
  'Vous n’avez pas encore de réservation.': 'У вас ще немає записів.',
  'Réserver un soin': 'Записатися на процедуру',
  'Prochain rendez-vous': 'Найближчий запис',
  'En cours': 'У процесі',
  Gérer: 'Керувати',
  'Aucun rendez-vous à venir.': 'Найближчих записів немає.',
  Ensuite: 'Далі',
  'Filtrer l’historique': 'Фільтр історії',
  'Aucun rendez-vous dans cette catégorie.': 'У цій категорії записів немає.',
  'Mes <accent>réservations</accent>': 'Мої <accent>записи</accent>',
  'Voir les {n} forfaits — jusqu’à {percent} % d’économie':
    'Переглянути абонементи ({n}) — економія до {percent} %',
  'Forfaits −{percent} %': 'Абонементи −{percent} %',
  'Forfaits — {name}': 'Абонементи — {name}',
  'soit {price} / séance': 'тобто {price} / сеанс',
  'Forfait réglé au cabinet, chaque séance se réserve ensuite en ligne. Pour en profiter :':
    'Абонемент оплачується в кабінеті, а кожен сеанс потім бронюється онлайн. Щоб придбати:',
  'par e-mail': 'електронною поштою',
  'au lieu de ': 'замість ',
  'offre valable jusqu’au {date}': 'пропозиція діє до {date}',
  'Avant de réserver :': 'Перед записом:',
  Populaire: 'Популярне',
  Description: 'Опис',
  'Choisir l’horaire': 'Обрати час',
  'ou dès {price} / séance en forfait': 'або від {price} / сеанс з абонементом',
  'Du {from} au {to}': 'З {from} до {to}',
  'Semaine précédente': 'Попередній тиждень',
  'Semaine suivante': 'Наступний тиждень',
  'Chargement des disponibilités…': 'Завантаження вільного часу…',
  Jour: 'День',
  '{n} horaire|{n} horaires': {
    one: '{n} слот',
    few: '{n} слоти',
    many: '{n} слотів',
    other: '{n} слотів',
  },
  'aucun horaire': 'немає вільного часу',
  Aucun: 'Немає',
  'Aucun créneau disponible sur cette période.':
    'У цей період немає вільного часу.',
  'Consultez la semaine suivante.': 'Перегляньте наступний тиждень.',
  'Horaires du {date}': 'Час на {date}',
  'Aucun horaire ce jour-là': 'Цього дня немає вільного часу',
  'Voir le {date}': 'Переглянути {date}',
  'Plus aucun horaire ouvert cette semaine.':
    'Цього тижня вільного часу більше немає.',
  'Réservation au plus tard 12 h à l’avance, jusqu’à 45 jours. Horaires à l’heure de Bordeaux.':
    'Запис щонайменше за 12 год і не більше ніж на 45 днів уперед. Час — за Бордо.',
  'La déconnexion a échoué. Veuillez réessayer.':
    'Не вдалося вийти. Спробуйте ще раз.',
  'Connexion indisponible, réessayer': 'Вхід недоступний, спробувати ще раз',
  'Espace personnel': 'Особистий кабінет',
  'Ce que nous faisons': 'Що ми робимо',
  'À propos': 'Про мене',
  'Nos réalisations': 'Наші роботи',
  Avis: 'Відгуки',
  'Massage thérapeutique et bien-être, dans un cadre calme et confidentiel à Bordeaux.':
    'Лікувальний і оздоровчий масаж у спокійній, конфіденційній атмосфері в Бордо.',
  'Navigation du pied de page': 'Навігація в підвалі сайту',
  NAVIGATION: 'НАВІГАЦІЯ',
  CONTACT: 'КОНТАКТИ',
  'SUIVEZ-NOUS': 'МИ В СОЦМЕРЕЖАХ',
  '{name} (nouvel onglet)': '{name} (нова вкладка)',
  '© 2026 {name}. Tous droits réservés.': '© 2026 {name}. Усі права захищено.',
  'À propos de moi': 'Про мене',
  'Massages populaires': 'Популярні масажі',
  'Mon approche': 'Мій підхід',
  'Navigation principale': 'Основна навігація',
  'Ouvrir le menu': 'Відкрити меню',
  'Langue : {name}': 'Мова: {name}',
  'Langue de l’administration': 'Мова адмінпанелі',
  'Langue du site': 'Мова сайту',
  'Connexion indisponible — réessayer': 'Вхід недоступний — спробувати ще раз',
  Menu: 'Меню',
  'Fermer le menu': 'Закрити меню',
  'Offrir une carte cadeau': 'Подарувати сертифікат',
  'Traduction (seul le texte français ci-dessus fait foi) : {text}':
    'Переклад (юридичну силу має лише французький текст вище): {text}',
  'Nous vous contacterons à': 'Ми зв’яжемося з вами',
  Nom: 'Ім’я',
  'Modifier mon profil': 'Змінити профіль',
  'Choisissez le soin à offrir.': 'Оберіть процедуру в подарунок.',
  '{n} caractères maximum.': 'Не більше {n} символів.',
  'Choisissez comment vous préférez être contacté.':
    'Оберіть, як із вами краще зв’язатися.',
  'Que souhaitez-vous offrir ? *': 'Що ви хочете подарувати? *',
  'Soin offert *': 'Процедура в подарунок *',
  'La liste des soins est indisponible pour le moment. Choisissez « Un montant » et précisez le soin dans votre message.':
    'Список процедур зараз недоступний. Оберіть «Суму» й укажіть процедуру в повідомленні.',
  'Chargement des soins…': 'Завантаження процедур…',
  'Choisir un soin': 'Оберіть процедуру',
  '{soin} : carte de {price} (tarif actuel).':
    '{soin}: сертифікат на {price} (поточна ціна).',
  'La carte vaut le prix actuel du soin choisi.':
    'Сертифікат дорівнює поточній ціні обраної процедури.',
  'Montant de la carte *': 'Сума сертифіката *',
  'Montant libre en euros, par exemple 80 ou 120,50.':
    'Довільна сума в євро, наприклад 80 або 120,50.',
  'Message — facultatif': 'Повідомлення — необов’язково',
  'Pour l’anniversaire de ma sœur, un massage relaxant…':
    'На день народження сестри, розслаблювальний масаж…',
  'Comment préférez-vous être contacté ? *': 'Як із вами краще зв’язатися? *',
  'Pas de paiement en ligne : la praticienne vous recontacte pour convenir du règlement et de la remise de la carte.':
    'Онлайн-оплати немає: майстриня зв’яжеться з вами, щоб домовитися про оплату та передачу сертифіката.',
  'Réessayer l’envoi': 'Надіслати ще раз',
  'Envoyer la demande': 'Надіслати запит',
  'Demande n° {number} envoyée.': 'Запит № {number} надіслано.',
  'Nous vous contacterons pour la suite. La carte cadeau n’est ni réglée ni émise à ce stade : le règlement et la remise se font avec la praticienne.':
    'Ми зв’яжемося з вами щодо подальших кроків. На цьому етапі сертифікат ще не оплачений і не виданий: оплату й передачу ви узгодите з майстринею.',
  Montant: 'Сума',
  Contact: 'Зв’язок',
  Message: 'Повідомлення',
  'Faire une autre demande': 'Надіслати ще один запит',
  'La demande en ligne est momentanément indisponible. Contactez-nous directement (coordonnées ci-dessous).':
    'Онлайн-запити тимчасово недоступні. Зв’яжіться з нами напряму (контакти нижче).',
  'Demandez une carte cadeau': 'Замовте подарунковий сертифікат',
  'Choisissez un montant ou une prestation et envoyez votre demande. Nous vous contacterons pour finaliser la commande.':
    'Оберіть суму або процедуру й надішліть запит. Ми зв’яжемося з вами, щоб оформити замовлення.',
  'Offrez une carte cadeau': 'Подаруйте сертифікат',
  'Carte cadeau': 'Подарунковий сертифікат',
  'Ou directement': 'Або напряму',
  'Confirmez votre inscription à la newsletter du cabinet.':
    'Підтвердьте підписку на розсилку кабінету.',
  'Confirmer mon inscription': 'Підтвердити підписку',
  'Votre inscription à la newsletter est confirmée.':
    'Підписку на розсилку підтверджено.',
  'Votre inscription était déjà confirmée.':
    'Вашу підписку вже було підтверджено.',
  'Ce lien n’est plus valide : il a expiré, a déjà été utilisé ou a été remplacé par un lien plus récent.':
    'Це посилання вже недійсне: воно застаріло, вже було використане або його замінено новішим.',
  'Vous ne recevrez plus la newsletter du cabinet. Les e-mails liés à vos rendez-vous ne sont pas concernés.':
    'Ви більше не отримуватимете розсилку кабінету. Листів щодо ваших записів це не стосується.',
  'Me désabonner': 'Відписатися',
  'Vous êtes désabonné·e de la newsletter.': 'Ви відписалися від розсилки.',
  'Ce lien de désabonnement n’est pas valide.':
    'Це посилання для відписки недійсне.',
  'Ce lien est incomplet. Utilisez le lien reçu par e-mail.':
    'Посилання неповне. Скористайтеся посиланням із листа.',
  'Une erreur est survenue. Réessayez dans quelques instants.':
    'Сталася помилка. Спробуйте ще раз за мить.',
  'La newsletter n’est pas disponible pour le moment.':
    'Розсилка зараз недоступна.',
  'Demander un nouveau lien': 'Отримати нове посилання',
  'Fermer le message': 'Закрити повідомлення',
  'Je suis Stefaniia, masseuse certifiée avec plus de 10 ans d’expérience.':
    'Я — Стефанія, сертифікована масажистка з досвідом понад 10 років.',
  'J’ai travaillé à l’Institut de Vertébrologie et je suis spécialisée dans différents types de massages : thérapeutique, drainage lymphatique, anti-cellulite, relaxant et bien d’autres.':
    'Я працювала в Інституті вертебрології та спеціалізуюся на різних видах масажу: лікувальному, лімфодренажному, антицелюлітному, розслаблювальному та багатьох інших.',
  'Mon objectif n’est pas seulement de réaliser une séance, mais d’obtenir des résultats concrets et d’améliorer votre bien-être.':
    'Моя мета — не просто провести сеанс, а досягти відчутних результатів і покращити ваше самопочуття.',
  clients: 'клієнтів',
  'ans d’expérience': 'років досвіду',
  'ans d’exp.': 'р. досвіду',
  reviennent: 'повертаються',
  'Pourquoi mes clients me choisissent': 'Чому клієнти обирають мене',
  'Massage professionnel avec des <accent>résultats visibles</accent>':
    'Професійний масаж із <accent>помітним результатом</accent>',
  'Stefaniia, masseuse certifiée à Bordeaux':
    'Стефанія, сертифікована масажистка в Бордо',
  'Mains posées sur une serviette après un massage':
    'Руки на рушнику після масажу',
  'Qui est concerné': 'Кому це підходить',
  'Tensions chroniques du dos et de la nuque':
    'Хронічне напруження в спині та шиї',
  'Stress accumulé et sommeil perturbé': 'Накопичений стрес і порушений сон',
  'Manque d’énergie au quotidien': 'Брак енергії в повсякденному житті',
  'Pose de ventouses sur le dos pendant une séance':
    'Баночний масаж спини під час сеансу',
  'Ce que vous recevez': 'Що ви отримуєте',
  'Spécialiste certifiée, formée à l’Institut de Vertébrologie':
    'Сертифікована фахівчиня, яка навчалася в Інституті вертебрології',
  'Un traitement personnalisé selon votre morphologie.':
    'Індивідуальна процедура з урахуванням особливостей вашого тіла.',
  'Des techniques professionnelles éprouvées': 'Перевірені професійні техніки',
  Résultats: 'Результати',
  'Dès la 1ère séance — soulagement immédiat':
    'З першого сеансу — відчутне полегшення',
  'Après 3 séances — mobilité restaurée':
    'Після 3 сеансів — відновлена рухливість',
  'Suivi régulier — bien-être durable, dans un cadre confortable et confidentiel':
    'Регулярні сеанси — тривале гарне самопочуття в комфортній і конфіденційній атмосфері',
  'Pourquoi me choisir': 'Чому варто обрати мене',
  'Une approche pensée pour votre bien-être, <accent>pas juste une séance</accent>':
    'Підхід, створений для вашого добробуту, <accent>а не просто сеанс</accent>',
  'Prenez <accent>rendez-vous</accent>':
    'Запишіться <accent>на прийом</accent>',
  'Choisissez votre soin, sa durée et l’horaire qui vous convient. La réservation est confirmée immédiatement ; le règlement se fait sur place, au cabinet.':
    'Оберіть процедуру, її тривалість і зручний час. Запис підтверджується одразу; оплата — на місці, у кабінеті.',
  'Soin signature': 'Фірмова процедура',
  'Découvrez le massage': 'Відкрийте для себе',
  Endosphérologie: 'Ендосферотерапію',
  'Une technologie de compression mécanique par rouleaux, pensée pour stimuler la microcirculation, drainer les tissus en profondeur et redessiner la silhouette. Un soin d’exception pour un corps visiblement plus tonique.':
    'Технологія механічної компресії роликами, що стимулює мікроциркуляцію, глибоко дренує тканини та моделює силует. Особлива процедура для помітно підтягнутого тіла.',
  'Réserver ce soin': 'Записатися на процедуру',
  'Idéale pour toute personne recherchant détente, récupération ou un moment rien qu’à elle.':
    'Ідеальний подарунок для тих, хто шукає розслаблення, відновлення чи час лише для себе.',
  'Au choix : un montant libre, utilisable sur l’ensemble des soins, ou un soin précis à offrir.':
    'На вибір: довільна сума на будь-які процедури або конкретна процедура в подарунок.',
  'Valable 1 an à compter de la date d’achat, envoyée par email prête à offrir.':
    'Дійсний 1 рік з дати покупки, надсилається на e-mail готовим до вручення.',
  'Carte cadeau : massage dans une ambiance aux bougies':
    'Подарунковий сертифікат: масаж при свічках',
  'Offrez un moment de bien-être': 'Подаруйте момент турботи',
  'Laisser une demande': 'Залишити запит',
  'Massage du dos dans un cabinet de massage à Bordeaux':
    'Масаж спини в масажному кабінеті в Бордо',
  'Soins professionnels du corps': 'Професійний догляд за тілом',
  'Le massage qui vous <accent>ressource</accent>':
    'Масаж, що <accent>відновлює сили</accent>',
  'Merci ! Si cette adresse n’est pas encore inscrite, un lien de confirmation vient de lui être envoyé.':
    'Дякуємо! Якщо ця адреса ще не підписана, на неї щойно надіслано посилання для підтвердження.',
  'Indiquez une adresse e-mail valide.': 'Вкажіть правильну адресу e-mail.',
  'Ne manquez aucune offre': 'Не пропустіть жодної пропозиції',
  'Recevez en avant-première nos offres saisonnières, tarifs spéciaux et invitations pour des séances à prix réduit ou offertes.':
    'Першими отримуйте сезонні пропозиції, спеціальні ціни та запрошення на сеанси зі знижкою чи безкоштовні.',
  'Vous êtes inscrit·e avec <email>{email}</email>.':
    'Ви підписані з адресою <email>{email}</email>.',
  'Gérer mon inscription': 'Керувати підпискою',
  'Inscription…': 'Підписка…',
  'S’inscrire avec {email}': 'Підписатися з {email}',
  'Une inscription attend la confirmation par e-mail : ce bouton l’active tout de suite.':
    'Підписка очікує підтвердження з листа: ця кнопка активує її одразу.',
  'Utiliser une autre adresse': 'Використати іншу адресу',
  'nom@exemple.com': 'name@example.com',
  'S’inscrire à la newsletter': 'Підписатися на розсилку',
  'Massage du cou, cliente allongée en cabine':
    'Масаж шиї, клієнтка лежить у кабінеті',
  'Massage du dos et des épaules en cabine': 'Масаж спини та плечей у кабінеті',
  'à partir de {price}': 'від {price}',
  min: 'хв',
  'Nos soins <accent>populaires</accent>':
    'Наші <accent>популярні</accent> процедури',
  '{n} soin le plus demandé.|{n} soins les plus demandés.': {
    one: '{n} найпопулярніша процедура.',
    few: '{n} найпопулярніші процедури.',
    many: '{n} найпопулярніших процедур.',
    other: '{n} найпопулярніших процедур.',
  },
  'Les soins les plus demandés.': 'Найпопулярніші процедури.',
  'Un doute ? Consultation gratuite.':
    'Сумніваєтеся? Консультація безкоштовна.',
  'Retrouvez tous nos soins, leurs durées et leurs tarifs sur la page de réservation.':
    'Усі процедури, їхня тривалість і ціни — на сторінці запису.',
  'Découvrir les services': 'Переглянути послуги',
  'Avis clients': 'Відгуки клієнтів',
  'Avis Planity': 'Відгук на Planity',
  '{rating} sur 5': '{rating} з 5',
  'Reprendre le défilement des avis': 'Відновити прокручування відгуків',
  'Mettre en pause le défilement des avis':
    'Призупинити прокручування відгуків',
  'Avis précédent': 'Попередній відгук',
  'Avis suivant': 'Наступний відгук',
  Retour: 'Назад',
  '{label} : {date} — changer de date': '{label}: {date} — змінити дату',
  Choisir: 'Обрати',
  'Choisir une date': 'Оберіть дату',
  'Mois précédent': 'Попередній місяць',
  'Mois suivant': 'Наступний місяць',
  ' (aujourd’hui)': ' (сьогодні)',
  'Note {rating} sur 5 — {n} avis vérifiés sur Planity (nouvelle fenêtre)':
    'Оцінка {rating} з 5 — {n} перевірених відгуків на Planity (нове вікно)',
  '{n} avis vérifié|{n} avis vérifiés': {
    one: '{n} перевірений відгук',
    few: '{n} перевірені відгуки',
    many: '{n} перевірених відгуків',
    other: '{n} перевірених відгуків',
  },
  'Note parfaite : {rating} / 5': 'Ідеальна оцінка: {rating} / 5',
  '6 séances · demi-corps': '6 сеансів · половина тіла',
  '12 séances · demi-corps': '12 сеансів · половина тіла',
  '18 séances · demi-corps': '18 сеансів · половина тіла',
  '24 séances · demi-corps': '24 сеанси · половина тіла',
  '12 séances · corps complet': '12 сеансів · усе тіло',
  'Massages chinois': 'Китайські масажі',
  'Massages relaxants': 'Розслаблювальні масажі',
  'Massages spécifiques': 'Спеціальні масажі',
  'Soins express 30 min': 'Експрес-процедури 30 хв',
  Endosphères: 'Endospheres',
  Madérothérapie: 'Мадеротерапія',
  'Lettres, espaces, apostrophes, points et tirets uniquement.':
    'Лише літери, пробіли, апострофи, крапки й дефіси.',
  'Format international avec indicatif, par exemple +33 6 12 34 56 78.':
    'Міжнародний формат із кодом країни, наприклад +33 6 12 34 56 78.',
  'Ce nom n’est pas accepté.': 'Таке ім’я не приймається.',
  'Numéro invalide : utilisez le format international, par exemple +33 6 12 34 56 78.':
    'Неправильний номер: використовуйте міжнародний формат, наприклад +33 6 12 34 56 78.',
  'Adresse e-mail ou mot de passe incorrect.':
    'Неправильна адреса e-mail або пароль.',
  'Mot de passe trop court : 6 caractères minimum.':
    'Пароль закороткий: щонайменше 6 символів.',
  'Ce mot de passe ne respecte pas les règles de sécurité.':
    'Пароль не відповідає вимогам безпеки.',
  'Un compte existe déjà avec cette adresse. Connectez-vous à ce compte.':
    'Обліковий запис із цією адресою вже існує. Увійдіть у нього.',
  'Ces identifiants sont déjà utilisés par un autre compte. Connectez-vous à ce compte.':
    'Ці дані для входу вже використовує інший обліковий запис. Увійдіть у нього.',
  'Un compte existe déjà avec cette adresse. Connectez-vous avec votre e-mail et votre mot de passe.':
    'Обліковий запис із цією адресою вже існує. Увійдіть за допомогою e-mail і пароля.',
  'Ce compte est désactivé.': 'Цей обліковий запис вимкнено.',
  'Trop de tentatives. Patientez quelques minutes avant de réessayer.':
    'Забагато спроб. Зачекайте кілька хвилин і спробуйте знову.',
  'Connexion impossible. Vérifiez votre accès à Internet et réessayez.':
    'Не вдається увійти. Перевірте підключення до інтернету й спробуйте ще раз.',
  'La fenêtre Google a été bloquée par le navigateur. Autorisez les fenêtres pop-up pour ce site et réessayez.':
    'Браузер заблокував вікно Google. Дозвольте спливаючі вікна для цього сайту й спробуйте ще раз.',
  'La connexion n’est pas autorisée sur ce domaine pour le moment.':
    'Вхід на цьому домені поки не дозволено.',
  'Ce mode de connexion n’est pas disponible pour le moment.':
    'Цей спосіб входу поки недоступний.',
  'Pour des raisons de sécurité, reconnectez-vous puis réessayez.':
    'З міркувань безпеки увійдіть знову й повторіть спробу.',
  'Le service de compte est momentanément indisponible.':
    'Сервіс облікових записів тимчасово недоступний.',
  'Impossible de joindre le service de compte. Vérifiez votre connexion.':
    'Не вдається зв’язатися із сервісом облікових записів. Перевірте підключення.',
  'Le service de compte met trop de temps à répondre.':
    'Сервіс облікових записів відповідає надто довго.',
  'Le service de compte a envoyé une réponse incomplète.':
    'Сервіс облікових записів надіслав неповну відповідь.',
  'Le service de compte n’est pas encore configuré.':
    'Сервіс облікових записів ще не налаштовано.',
  'Règlement sur place, au cabinet.': 'Оплата на місці, у кабінеті.',
  '30 min': '30 хв',
  '1 h': '1 год',
  '1 h 30': '1 год 30 хв',
  '2 h': '2 год',
  'Jusqu’à 60 €': 'До 60 €',
  '60 – 100 €': '60 – 100 €',
  '100 € et plus': 'Від 100 €',
  'À venir': 'Заплановано',
  Terminé: 'Завершено',
  Annulé: 'Скасовано',
  'Statut inconnu': 'Невідомий статус',
  'par vous': 'вами',
  'Un compte administrateur ne peut pas réserver pour lui-même.':
    'Обліковий запис адміністратора не може записуватися сам.',
  'Connectez-vous ou créez un compte.':
    'Увійдіть або створіть обліковий запис.',
  'Confirmez votre adresse e-mail.': 'Підтвердьте адресу e-mail.',
  'Confirmer mon e-mail': 'Підтвердити e-mail',
  'Indiquez votre nom.': 'Вкажіть своє ім’я.',
  'Compléter mon profil': 'Заповнити профіль',
  'Indiquez votre numéro de téléphone.': 'Вкажіть номер телефону.',
  'Ce créneau commence dans moins de 12 heures.':
    'Цей час починається менш ніж за 12 годин.',
  'Ce créneau est trop éloigné dans le temps.':
    'Цей час надто далеко в майбутньому.',
  'Ce créneau ne correspond plus aux horaires du cabinet.':
    'Цей час більше не відповідає графіку кабінету.',
  'Ce créneau vient d’être réservé.': 'Цей час щойно забронювали.',
  'Ce créneau n’est plus disponible.': 'Цей час уже недоступний.',
  'Choisissez un autre horaire.': 'Оберіть інший час.',
  'Cette prestation n’est plus proposée à la réservation.':
    'Ця послуга більше не доступна для запису.',
  'Votre profil doit être complété avant de réserver.':
    'Перед записом потрібно заповнити профіль.',
  'Le rendez-vous ne peut plus être déplacé à moins de 12 heures. Vous pouvez encore l’annuler.':
    'Запис уже не можна перенести менш ніж за 12 годин. Скасувати його ще можна.',
  'Le rendez-vous a déjà commencé ou est terminé : il ne peut plus être annulé.':
    'Запис уже почався або завершився: скасувати його неможливо.',
  'Ce rendez-vous est annulé.': 'Цей запис скасовано.',
  'Le calendrier est momentanément occupé. Réessayez dans quelques secondes.':
    'Календар тимчасово зайнятий. Спробуйте ще раз за кілька секунд.',
  'Des rendez-vous confirmés se trouvent en dehors des nouveaux horaires. Annulez-les d’abord, puis enregistrez à nouveau.':
    'Є підтверджені записи поза новим графіком. Спочатку скасуйте їх, потім збережіть ще раз.',
  'Certaines informations sont invalides. Vérifiez le formulaire.':
    'Деякі дані неправильні. Перевірте форму.',
  'Vous n’avez pas accès à cette page.':
    'У вас немає доступу до цієї сторінки.',
  'Votre session a expiré. Veuillez vous reconnecter.':
    'Сеанс завершився. Увійдіть знову.',
  'Le service de compte est momentanément indisponible. Réessayez dans quelques instants.':
    'Сервіс облікових записів тимчасово недоступний. Спробуйте ще раз за мить.',
  'Impossible de joindre le service. Vérifiez votre connexion et réessayez.':
    'Не вдається зв’язатися із сервісом. Перевірте підключення й спробуйте ще раз.',
  'Le service met trop de temps à répondre. Réessayez dans quelques instants.':
    'Сервіс відповідає надто довго. Спробуйте ще раз за мить.',
  'La réponse du service est incomplète. Réessayez dans quelques instants.':
    'Відповідь сервісу неповна. Спробуйте ще раз за мить.',
  'Le service de réservation n’est pas encore configuré.':
    'Сервіс запису ще не налаштовано.',
  'Le rendez-vous est bien enregistré': 'Запис збережено',
  'Le nouvel horaire est bien enregistré': 'Новий час збережено',
  'L’annulation est bien enregistrée': 'Скасування збережено',
  'Un e-mail confirmant l’annulation est en cours d’envoi.':
    'Лист із підтвердженням скасування надсилається.',
  'Un e-mail avec les détails est en cours d’envoi.':
    'Лист із деталями надсилається.',
  'Un e-mail confirmant l’annulation vous a été envoyé.':
    'Вам надіслано лист із підтвердженням скасування.',
  'Un e-mail avec les détails vous a été envoyé.':
    'Вам надіслано лист із деталями.',
  '{done}, mais l’e-mail n’a pas pu être envoyé. Les détails restent disponibles ici.':
    '{done}, але лист не вдалося надіслати. Деталі доступні тут.',
  'L’e-mail est retardé. Les détails restent disponibles ici.':
    'Лист затримується. Деталі доступні тут.',
  Réservation: 'Запис',
  Déplacement: 'Перенесення',
  'En attente': 'Очікує',
  'Envoi en cours': 'Надсилається',
  'Accepté par le service d’envoi': 'Прийнято поштовим сервісом',
  Échec: 'Помилка',
  'Non envoyé': 'Не надіслано',
  Interrompu: 'Перервано',
  'envoi prévu 30 min après la dernière modification':
    'надсилання заплановано через 30 хв після останньої зміни',
  'horaire revenu à celui du dernier e-mail':
    'час повернуто до вказаного в останньому листі',
  'nouvel essai prévu': 'заплановано нову спробу',
  'remplacé par un e-mail plus récent': 'замінено новішим листом',
  'séance déjà commencée': 'сеанс уже почався',
  'environnement de test': 'тестове середовище',
  'adresse invalide': 'неправильна адреса',
  'erreurs temporaires': 'тимчасові помилки',
  'délai du service d’envoi trop long':
    'надто довга затримка поштового сервісу',
  'refusé par le service d’envoi': 'відхилено поштовим сервісом',
  'configuration du service d’envoi': 'налаштування поштового сервісу',
  'événement invalide': 'неправильна подія',
  'traitement interrompu': 'обробку перервано',
  'traitement retardé': 'обробку відкладено',
  autre: 'інше',
  Inconnu: 'Невідомо',
  'E-mail et mot de passe': 'E-mail і пароль',
  Lundi: 'Понеділок',
  Mardi: 'Вівторок',
  Mercredi: 'Середа',
  Jeudi: 'Четвер',
  Vendredi: 'П’ятниця',
  Samedi: 'Субота',
  Dimanche: 'Неділя',
  'Heure invalide : indiquez par exemple 9, 930 ou 09:30 (de 00:00 à 24:00).':
    'Неправильний час: введіть, наприклад, 9, 930 або 09:30 (від 00:00 до 24:00).',
  'L’heure de fin doit être après l’heure de début.':
    'Час закінчення має бути пізніше за час початку.',
  '{n} plages au maximum par jour.': 'Не більше {n} проміжків на день.',
  'Cette plage chevauche une autre plage du même jour.':
    'Цей проміжок перетинається з іншим того ж дня.',
  Matin: 'Ранок',
  'Après-midi': 'День',
  Soir: 'Вечір',
  'Montant invalide : indiquez un nombre en euros, par exemple 80 ou 80,50.':
    'Неправильна сума: введіть число в євро, наприклад 80 або 80,50.',
  'Ce montant est trop élevé.': 'Сума завелика.',
  'Le montant doit être supérieur à 0 €.': 'Сума має бути більшою за 0 €.',
  'Ce message contient des caractères non autorisés.':
    'Повідомлення містить недопустимі символи.',
  'Un montant': 'Сума',
  'Un soin': 'Процедура',
  Nouvelle: 'Новий',
  Traitée: 'Опрацьовано',
  Clôturée: 'Закрито',
  'Prendre en charge': 'Взяти в роботу',
  Rouvrir: 'Відкрити знову',
  'Marquer comme traitée': 'Позначити як опрацьований',
  Clôturer: 'Закрити',
  'Demande reçue': 'Запит отримано',
  'Rouverte ({from} → en cours)': 'Відкрито знову ({from} → в роботі)',
  'Un compte administrateur ne peut pas demander de carte cadeau.':
    'Обліковий запис адміністратора не може замовити подарунковий сертифікат.',
  'Connectez-vous ou créez un compte client.':
    'Увійдіть або створіть обліковий запис клієнта.',
  'Le numéro de téléphone de votre profil n’est pas valide.':
    'Номер телефону у вашому профілі неправильний.',
  'Modifier mon numéro': 'Змінити номер',
  'Connectez-vous ou créez un compte pour demander une carte cadeau.':
    'Увійдіть або створіть обліковий запис, щоб замовити подарунковий сертифікат.',
  'Pour envoyer votre demande, confirmez d’abord votre adresse e-mail.':
    'Щоб надіслати запит, спочатку підтвердьте адресу e-mail.',
  'Pour envoyer votre demande, ajoutez votre prénom et votre numéro de téléphone à votre profil.':
    'Щоб надіслати запит, додайте до профілю своє ім’я та номер телефону.',
  'Pour envoyer votre demande, corrigez le numéro de téléphone de votre profil.':
    'Щоб надіслати запит, виправте номер телефону в профілі.',
  'Pour envoyer votre demande, complétez d’abord votre compte.':
    'Щоб надіслати запит, спочатку заповніть обліковий запис.',
  'plus tard': 'пізніше',
  'dans quelques instants': 'за мить',
  'dans {n} minute|dans {n} minutes': {
    one: 'через {n} хвилину',
    few: 'через {n} хвилини',
    many: 'через {n} хвилин',
    other: 'через {n} хвилин',
  },
  'dans {n} heure|dans {n} heures': {
    one: 'через {n} годину',
    few: 'через {n} години',
    many: 'через {n} годин',
    other: 'через {n} годин',
  },
  'Votre compte doit être complété avant d’envoyer la demande.':
    'Перед надсиланням запиту потрібно заповнити обліковий запис.',
  'Vous avez envoyé plusieurs demandes aujourd’hui. Réessayez {wait}.':
    'Сьогодні ви вже надіслали кілька запитів. Спробуйте ще раз {wait}.',
  'Le service est momentanément occupé. Réessayez dans quelques secondes.':
    'Сервіс тимчасово зайнятий. Спробуйте ще раз за кілька секунд.',
  'La demande a changé pendant l’envoi. Vérifiez-la puis renvoyez-la.':
    'Запит змінився під час надсилання. Перевірте його й надішліть знову.',
  'Demande introuvable.': 'Запит не знайдено.',
  'Ce changement de statut n’est plus possible : la demande vient d’être mise à jour.':
    'Цю зміну статусу вже неможливо виконати: запит щойно оновлено.',
  'Vous êtes inscrit·e à la newsletter. Un e-mail de bienvenue vous a été envoyé.':
    'Ви підписані на розсилку. Вам надіслано вітальний лист.',
  'Vous êtes déjà inscrit·e à la newsletter.': 'Ви вже підписані на розсилку.',
  'Un lien de confirmation vous a été envoyé par e-mail : ouvrez-le pour activer l’inscription.':
    'Вам надіслано посилання для підтвердження: відкрийте його, щоб активувати підписку.',
  'Un e-mail de confirmation a déjà été envoyé récemment. Vous pourrez en demander un nouveau {wait}.':
    'Лист підтвердження вже нещодавно надіслано. Новий можна буде запросити {wait}.',
  'Votre demande est déjà enregistrée. Aucun nouvel e-mail n’est nécessaire pour le moment.':
    'Ваш запит уже збережено. Новий лист поки не потрібен.',
  'Votre demande a été prise en compte.': 'Ваш запит враховано.',
  'Newsletter : un lien de confirmation vous a été envoyé par e-mail.':
    'Розсилка: вам надіслано посилання для підтвердження.',
  'Newsletter : l’e-mail de confirmation n’a pas pu être envoyé. Vous pourrez vous inscrire depuis votre compte.':
    'Розсилка: лист підтвердження не вдалося надіслати. Підписатися можна у своєму кабінеті.',
  'Newsletter : adresse non autorisée sur l’environnement de test.':
    'Розсилка: адреса не дозволена в тестовому середовищі.',
  'Newsletter : l’inscription n’a pas pu être enregistrée. Vous pourrez vous inscrire depuis votre compte.':
    'Розсилка: підписку не вдалося зберегти. Підписатися можна у своєму кабінеті.',
  'dans {n} seconde|dans {n} secondes': {
    one: 'через {n} секунду',
    few: 'через {n} секунди',
    many: 'через {n} секунд',
    other: 'через {n} секунд',
  },
  'Adresse non autorisée sur l’environnement de test.':
    'Адреса не дозволена в тестовому середовищі.',
  'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez {wait}.':
    'Лист підтвердження не вдалося надіслати. Спробуйте ще раз {wait}.',
  'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez dans quelques minutes.':
    'Лист підтвердження не вдалося надіслати. Спробуйте ще раз за кілька хвилин.',
  'Le texte de consentement a changé. Rechargez la page puis réessayez.':
    'Текст згоди змінився. Оновіть сторінку й спробуйте ще раз.',
  'Connectez-vous à votre compte pour gérer la newsletter.':
    'Увійдіть у свій кабінет, щоб керувати розсилкою.',
  'Confirmez d’abord votre adresse e-mail.':
    'Спочатку підтвердьте адресу e-mail.',
  'Trop de demandes. Réessayez {wait}.':
    'Забагато запитів. Спробуйте ще раз {wait}.',
  'Trop de demandes. Réessayez dans quelques minutes.':
    'Забагато запитів. Спробуйте ще раз за кілька хвилин.',
  'Massages et soins': 'Масажі та процедури',
  'Cabinet de massage à Bordeaux : massages thérapeutiques et bien-être dans un cadre calme et confidentiel. Réservation en ligne.':
    'Масажний кабінет у Бордо: лікувальні й оздоровчі масажі в спокійній, конфіденційній атмосфері. Онлайн-запис.',
  'Mar – Dim, 10h – 19h': 'Вт – Нд, 10:00 – 19:00',
  'En vous inscrivant, vous acceptez de recevoir par e-mail les offres et actualités du cabinet. Un lien de confirmation vous sera envoyé ; désinscription possible à tout moment.':
    'Підписуючись, ви погоджуєтеся отримувати пропозиції та новини кабінету електронною поштою. Вам надішлють посилання для підтвердження; відписатися можна будь-коли.',
  'Choisir un horaire': 'Вибір часу',
  'E-mail': 'E-mail',
  'Indiquez le montant de la carte cadeau.': 'Вкажіть суму сертифіката.',
};

export default messages;
