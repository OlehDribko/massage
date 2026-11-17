/*
 * Ukrainian texts of the administration (French / Ukrainian only), added to
 * uk.js on the /admin pages. Same format as uk.js.
 */
const messages = {
  '{n} tentative|{n} tentatives': {
    one: '{n} спроба',
    few: '{n} спроби',
    many: '{n} спроб',
    other: '{n} спроб',
  },
  'Aucun e-mail enregistré (envoi désactivé sur ce serveur ou pas encore traité).':
    'Листів не зареєстровано (надсилання вимкнено на цьому сервері або ще не оброблено).',
  Client: 'Клієнт',
  Cabinet: 'Кабінет',
  'Ce rendez-vous était déjà annulé.': 'Цей запис уже було скасовано.',
  'Agenda du jour': 'Розклад дня',
  'Nom non renseigné': 'Ім’я не вказано',
  'Aucune coordonnée renseignée.': 'Контактних даних не вказано.',
  'Motif d’annulation': 'Причина скасування',
  '(facultatif)': '(необов’язково)',
  'Annuler ce rendez-vous': 'Скасувати цей запис',
  'E-mails': 'Листи',
  'Le rendez-vous du {date} ({client}) sera annulé et l’horaire libéré. Le client est prévenu par e-mail si l’envoi est activé. Action définitive.':
    'Запис на {date} ({client}) буде скасовано, а час звільниться. Клієнт отримає лист, якщо надсилання ввімкнено. Дію не можна скасувати.',
  client: 'клієнт',
  ' Motif : « {reason} ».': ' Причина: «{reason}».',
  'Détail du <accent>rendez-vous</accent>': 'Деталі <accent>запису</accent>',
  Ouvert: 'Відкрито',
  'Jour ouvert': 'Робочий день',
  'Fermé aux réservations': 'Закрито для запису',
  'Fermé aux nouvelles réservations': 'Закрито для нових записів',
  'Jour de repos': 'Вихідний',
  'Jour de repos (planning)': 'Вихідний (за графіком)',
  Indisponible: 'Зайнято',
  'Sélectionner le {date}': 'Вибрати {date}',
  ' — voir la journée': ' — відкрити день',
  'Aucun rendez-vous': 'Записів немає',
  Indisponibilité: 'Зайнятий час',
  'le {date}': 'на {date}',
  '{n} rendez-vous|{n} rendez-vous': {
    one: '{n} запис',
    few: '{n} записи',
    many: '{n} записів',
    other: '{n} записів',
  },
  'aucun rendez-vous': 'записів немає',
  Fermé: 'Закрито',
  Repos: 'Вихідний',
  'Rendez-vous à venir': 'Майбутні записи',
  Indisponibilités: 'Зайнятий час',
  'Indisponibilité (temps pris ailleurs)': 'Зайнятий час (зайнято деінде)',
  'Fermeture retirée pour {n} date.|Fermeture retirée pour {n} dates.': {
    one: 'Закриття знято з {n} дати.',
    few: 'Закриття знято з {n} дат.',
    many: 'Закриття знято з {n} дат.',
    other: 'Закриття знято з {n} дат.',
  },
  'Chaque date reprend son planning habituel.':
    'Кожна дата повертається до звичного графіка.',
  'Jour de repos dans le planning, cette date reste fermée : {dates}. Pour y travailler, modifiez les horaires.|Jour de repos dans le planning, ces dates restent fermées : {dates}. Pour y travailler, modifiez les horaires.':
    {
      one: 'За графіком це вихідний, тож дата залишається закритою: {dates}. Щоб працювати цього дня, змініть графік.',
      few: 'За графіком це вихідні, тож дати залишаються закритими: {dates}. Щоб працювати цими днями, змініть графік.',
      many: 'За графіком це вихідні, тож дати залишаються закритими: {dates}. Щоб працювати цими днями, змініть графік.',
      other:
        'За графіком це вихідні, тож дати залишаються закритими: {dates}. Щоб працювати цими днями, змініть графік.',
    },
  '{n} date fermée aux nouvelles réservations.|{n} dates fermées aux nouvelles réservations.':
    {
      one: '{n} дату закрито для нових записів.',
      few: '{n} дати закрито для нових записів.',
      many: '{n} дат закрито для нових записів.',
      other: '{n} дат закрито для нових записів.',
    },
  'Ces rendez-vous sont conservés, aucun n’a été annulé. Vous pouvez les assurer ou contacter les clients vous-même.':
    'Ці записи збережено, жоден не скасовано. Ви можете їх провести або самостійно зв’язатися з клієнтами.',
  'Aucun rendez-vous n’était prévu ces jours-là.': 'На ці дні записів не було.',
  'Fermer ce message': 'Закрити повідомлення',
  'Indisponibilité supprimée : le créneau est de nouveau réservable selon les horaires.':
    'Зайнятий час видалено: цей проміжок знову доступний для запису за графіком.',
  'Indisponibilité ajoutée : les clients ne peuvent plus réserver ce créneau.':
    'Зайнятий час додано: клієнти більше не можуть записатися на цей проміжок.',
  'Indisponibilité modifiée.': 'Зайнятий час змінено.',
  'Vue du mois': 'Огляд місяця',
  'Semaine affichée': 'Поточний тиждень',
  Affichage: 'Вигляд',
  Semaine: 'Тиждень',
  Mois: 'Місяць',
  'Changer de mois': 'Змінити місяць',
  'Changer de semaine': 'Змінити тиждень',
  'Préc.': 'Попер.',
  'Suiv.': 'Наст.',
  'Touchez les dates (à partir d’aujourd’hui) pour les sélectionner, puis choisissez l’action en bas.':
    'Торкніться дат (від сьогодні), щоб вибрати їх, а потім оберіть дію внизу.',
  'Touchez une date pour ouvrir l’agenda du jour. Pour fermer ou rouvrir des dates, passez en sélection.':
    'Торкніться дати, щоб відкрити розклад дня. Щоб закрити або відкрити дати, перейдіть у режим вибору.',
  'Touchez un créneau libre pour ajouter une indisponibilité, une date pour ouvrir l’agenda du jour. Cochez des jours pour les fermer aux nouvelles réservations ou retirer leur fermeture.':
    'Торкніться вільного проміжку, щоб додати зайнятий час, або дати, щоб відкрити розклад дня. Позначте дні, щоб закрити їх для нових записів або зняти закриття.',
  'Ajouter une indisponibilité': 'Додати зайнятий час',
  'Terminer la sélection': 'Завершити вибір',
  'Sélectionner des dates': 'Вибрати дати',
  'Dates sélectionnées': 'Вибрані дати',
  '{n} date sélectionnée|{n} dates sélectionnées': {
    one: 'Вибрано {n} дату',
    few: 'Вибрано {n} дати',
    many: 'Вибрано {n} дат',
    other: 'Вибрано {n} дат',
  },
  Réinitialiser: 'Скинути',
  'Fermer aux nouvelles réservations': 'Закрити для нових записів',
  'Retirer la fermeture': 'Зняти закриття',
  'Fermer aux nouvelles réservations ?': 'Закрити для нових записів?',
  'Retirer la fermeture ?': 'Зняти закриття?',
  'Fermer ces dates': 'Закрити ці дати',
  'Plus aucune nouvelle réservation ni aucun déplacement vers cette date.|Plus aucune nouvelle réservation ni aucun déplacement vers ces dates.':
    {
      one: 'На цю дату більше не можна буде записатися чи перенести запис.',
      few: 'На ці дати більше не можна буде записатися чи перенести запис.',
      many: 'На ці дати більше не можна буде записатися чи перенести запис.',
      other: 'На ці дати більше не можна буде записатися чи перенести запис.',
    },
  'Les rendez-vous existants ne sont pas annulés ({n} à venir) : leur liste s’affichera ensuite.':
    'Наявні записи не скасовуються ({n} майбутніх): їхній список з’явиться після цього.',
  'Les rendez-vous existants ne sont pas annulés.':
    'Наявні записи не скасовуються.',
  'Seule la fermeture est retirée : chaque date reprend son planning habituel.':
    'Знімається лише закриття: кожна дата повертається до звичного графіка.',
  'Jour de repos dans le planning, cette date restera fermée : {dates}.|Jour de repos dans le planning, ces dates resteront fermées : {dates}.':
    {
      one: 'За графіком це вихідний, тож дата залишиться закритою: {dates}.',
      few: 'За графіком це вихідні, тож дати залишаться закритими: {dates}.',
      many: 'За графіком це вихідні, тож дати залишаться закритими: {dates}.',
      other: 'За графіком це вихідні, тож дати залишаться закритими: {dates}.',
    },
  '{n} date déjà fermée, inchangée.|{n} dates déjà fermées, inchangées.': {
    one: '{n} дата вже закрита, без змін.',
    few: '{n} дати вже закриті, без змін.',
    many: '{n} дат уже закриті, без змін.',
    other: '{n} дат уже закриті, без змін.',
  },
  '{n} date non fermée, inchangée.|{n} dates non fermées, inchangées.': {
    one: '{n} дата не закрита, без змін.',
    few: '{n} дати не закриті, без змін.',
    many: '{n} дат не закриті, без змін.',
    other: '{n} дат не закриті, без змін.',
  },
  'Calendrier du <accent>cabinet</accent>':
    'Календар <accent>кабінету</accent>',
  confirmé: 'підтверджено',
  'en cours': 'триває',
  terminé: 'завершено',
  annulé: 'скасовано',
  h: 'год',
  '{time} réservées': 'заброньовано {time}',
  '{n} annulé|{n} annulés': {
    one: '{n} скасовано',
    few: '{n} скасовано',
    many: '{n} скасовано',
    other: '{n} скасовано',
  },
  'Pause · fermé': 'Перерва · закрито',
  'Planning du jour': 'Розклад дня',
  'Rendez-vous annulé. Le client est prévenu par e-mail si l’envoi est actif.':
    'Запис скасовано. Клієнт отримає лист, якщо надсилання ввімкнено.',
  'Rendez-vous sélectionné': 'Вибраний запис',
  cabinet: 'кабінет',
  'Aucun e-mail enregistré pour ce rendez-vous.':
    'Для цього запису листів немає.',
  'Historique complet': 'Повна історія',
  '{client} — {date}, {service}. L’horaire est libéré et le client est prévenu par e-mail (si l’envoi est actif).':
    '{client} — {date}, {service}. Час звільниться, а клієнт отримає лист (якщо надсилання ввімкнено).',
  'Ce client': 'Цей клієнт',
  'Chargement des rendez-vous…': 'Завантаження записів…',
  'Horaires et indisponibilités non chargés.':
    'Графік і зайнятий час не завантажено.',
  'Rien de prévu ce jour-là.': 'На цей день нічого не заплановано.',
  'Agenda du <accent>jour</accent>': 'Розклад <accent>дня</accent>',
  Calendrier: 'Календар',
  'Jour précédent': 'Попередній день',
  Journée: 'День',
  'Jour suivant': 'Наступний день',
  'Envoi des e-mails désactivé sur ce serveur : la demande est enregistrée, aucun e-mail n’est envoyé au cabinet.':
    'Надсилання листів на цьому сервері вимкнено: запит збережено, але кабінету лист не надсилається.',
  État: 'Стан',
  Tentatives: 'Спроби',
  'Dernier essai': 'Остання спроба',
  'Accepté le': 'Прийнято',
  '« Accepté » signifie pris en charge par le service d’envoi, pas forcément arrivé dans la boîte de réception.':
    '«Прийнято» означає, що поштовий сервіс узяв лист в обробку, а не обов’язково, що він дійшов до скриньки.',
  'Toutes les demandes': 'Усі запити',
  'Chargement de la demande…': 'Завантаження запиту…',
  'Statut mis à jour : {status}.': 'Статус оновлено: {status}.',
  'Le statut était déjà à jour.': 'Статус уже був актуальним.',
  'Demande n° {number}': 'Запит № {number}',
  'Reçue le': 'Отримано',
  'Contact souhaité': 'Бажаний спосіб зв’язку',
  'Mise à jour': 'Оновлено',
  'Aucun paiement en ligne ni carte émise par le site : la demande est traitée à la main avec le client.':
    'Сайт не приймає онлайн-оплату й не видає сертифікатів: запит опрацьовується вручну разом із клієнтом.',
  'Téléphone non vérifié': 'Телефон не підтверджено',
  'Coordonnées au moment de la demande.': 'Контакти на момент запиту.',
  Statut: 'Статус',
  'Mise à jour…': 'Оновлення…',
  'Aucun changement de statut possible.': 'Змінити статус неможливо.',
  '« Traitée » : traitement terminé à la main (ce n’est ni un paiement ni une carte émise par le site). « Clôturée » : demande erronée, en double ou retirée. Une demande traitée ou clôturée peut être rouverte.':
    '«Опрацьовано»: роботу завершено вручну (це не оплата й не виданий сайтом сертифікат). «Закрито»: помилковий, повторний або відкликаний запит. Опрацьований чи закритий запит можна відкрити знову.',
  'E-mail au cabinet': 'Лист кабінету',
  'Demande de <accent>carte cadeau</accent>':
    'Запит на <accent>подарунковий сертифікат</accent>',
  Toutes: 'Усі',
  'Reçues du': 'Отримані з',
  au: 'до',
  'Réinitialiser les filtres': 'Скинути фільтри',
  'Dates de réception, heure de Paris, bornes incluses.':
    'Дати отримання, час Парижа, межі включно.',
  'n° {number}': '№ {number}',
  '· contact : {channel}': '· зв’язок: {channel}',
  'E-mail au cabinet :': 'Лист кабінету:',
  'envoi désactivé': 'надсилання вимкнено',
  'La date de début doit précéder la date de fin.':
    'Дата початку має бути раніше за дату кінця.',
  'Chargement des demandes…': 'Завантаження запитів…',
  'Aucune demande pour ces filtres.': 'За цими фільтрами запитів немає.',
  '{n} demande · page {page} sur {pages}|{n} demandes · page {page} sur {pages}':
    {
      one: '{n} запит · сторінка {page} з {pages}',
      few: '{n} запити · сторінка {page} з {pages}',
      many: '{n} запитів · сторінка {page} з {pages}',
      other: '{n} запитів · сторінка {page} з {pages}',
    },
  'Cette page est vide.': 'Ця сторінка порожня.',
  'Revenir à la première page': 'Повернутися на першу сторінку',
  Pages: 'Сторінки',
  '← Précédente': '← Попередня',
  'Suivante →': 'Наступна →',
  'Demandes envoyées depuis le site. Elles sont traitées à la main : contactez le client, convenez du règlement et de la remise de la carte, puis mettez à jour le statut.':
    'Запити, надіслані із сайту. Вони опрацьовуються вручну: зв’яжіться з клієнтом, домовтеся про оплату й передачу сертифіката, потім оновіть статус.',
  'Cartes <accent>cadeaux</accent>': 'Подарункові <accent>сертифікати</accent>',
  'Des rendez-vous confirmés seraient en dehors des horaires. Annulez-les ou gardez des horaires qui les incluent, puis enregistrez à nouveau. Pour seulement bloquer de nouvelles réservations, fermez la date dans le Calendrier : les rendez-vous existants y restent valables.':
    'Підтверджені записи опинилися б поза графіком. Скасуйте їх або залиште графік, що їх охоплює, і збережіть ще раз. Щоб лише заблокувати нові записи, закрийте дату в Календарі: наявні записи там залишаються дійсними.',
  'Semaine type': 'Типовий тиждень',
  'Heure de Paris': 'Час Парижа',
  'Copier les horaires du lundi sur les jours ouverts':
    'Скопіювати графік понеділка на робочі дні',
  'Le dernier début de séance reste fixé à 19:00 ; une pause de 15 minutes sépare deux séances.':
    'Останній сеанс починається не пізніше 19:00; між сеансами — перерва 15 хвилин.',
  'Horaires de la semaine enregistrés.': 'Графік тижня збережено.',
  'Enregistrer la semaine': 'Зберегти тиждень',
  'Annuler les modifications': 'Скасувати зміни',
  '{date} : enregistré.': '{date}: збережено.',
  '1. Choisissez la date': '1. Оберіть дату',
  'Date particulière': 'Особлива дата',
  'Choisissez une date dans le calendrier.': 'Оберіть дату в календарі.',
  '2. Horaires de ce jour': '2. Графік цього дня',
  'Aucune date choisie': 'Дату не вибрано',
  'Date personnalisée : modifiez ses horaires ci-dessous.':
    'Особлива дата: змініть її графік нижче.',
  'Remplace les horaires de la semaine type pour ce jour.':
    'Замінює графік типового тижня на цей день.',
  'Ce jour-là': 'Цього дня',
  'Horaires spéciaux': 'Особливий графік',
  'Ce jour': 'Цей день',
  'Aucun horaire ce jour-là. Refusé s’il y a déjà des rendez-vous : pour bloquer seulement les nouvelles réservations, fermez la date dans le':
    'Цього дня запису немає. Неможливо, якщо вже є записи: щоб заблокувати лише нові записи, закрийте дату в розділі',
  'Ajoutez au moins une plage, ou choisissez « Jour de repos ».':
    'Додайте хоча б один проміжок або оберіть «Вихідний».',
  'Aucun changement : ce sont déjà les horaires de la semaine type pour ce jour.':
    'Змін немає: це вже графік типового тижня для цього дня.',
  ' Pour revenir à la semaine type, supprimez cette date dans la liste.':
    ' Щоб повернутися до типового тижня, видаліть цю дату зі списку.',
  'Modifiez les horaires de cette date, puis enregistrez.':
    'Змініть графік цієї дати, потім збережіть.',
  'Enregistrer les modifications': 'Зберегти зміни',
  'Enregistrer la date': 'Зберегти дату',
  'Annuler la modification': 'Скасувати редагування',
  'Aucune date particulière à venir : la semaine type s’applique.':
    'Особливих дат попереду немає: діє типовий тиждень.',
  'Modifier le {date}': 'Змінити {date}',
  'Revenir à la semaine type le {date}': 'Повернути типовий тиждень для {date}',
  'Revenir à la semaine type': 'Повернути типовий тиждень',
  'Revenir à la semaine type ?': 'Повернути типовий тиждень?',
  'Supprimer la date particulière': 'Видалити особливу дату',
  'Le {date} suivra de nouveau les horaires de la semaine type.':
    '{date} знову діятиме графік типового тижня.',
  'Chargement des horaires…': 'Завантаження графіка…',
  'Les horaires habituels de chaque jour. Désactivez un jour pour en faire un jour de repos.':
    'Звичний графік кожного дня. Вимкніть день, щоб зробити його вихідним.',
  'Dates particulières': 'Особливі дати',
  'Des horaires différents pour un jour précis (jour férié, horaires réduits…). Pour bloquer des dates sans toucher aux rendez-vous, utilisez le Calendrier.':
    'Інший графік на конкретний день (свято, скорочений день…). Щоб заблокувати дати, не зачіпаючи записів, скористайтеся Календарем.',
  '3. Dates personnalisées': '3. Особливі дати',
  'Horaires du <accent>cabinet</accent>': 'Графік <accent>кабінету</accent>',
  Horaires: 'Графік',
  'Cartes cadeaux': 'Подарункові сертифікати',
  'L’administration n’est pas encore disponible.':
    'Адміністрування ще недоступне.',
  'Vérification de vos droits…': 'Перевірка прав доступу…',
  'Connectez-vous avec le compte de l’administration.':
    'Увійдіть під обліковим записом адміністратора.',
  'Cette page est réservée à l’administration du cabinet.':
    'Ця сторінка доступна лише адміністрації кабінету.',
  'Vous n’avez plus accès à l’administration.':
    'Ви більше не маєте доступу до адміністрування.',
  'Rendez-vous': 'Запис',
  'Cette indisponibilité est terminée : elle ne peut plus être modifiée. Vous pouvez la supprimer.':
    'Цей зайнятий час уже минув: змінити його не можна. Його можна видалити.',
  'Le calendrier a été mis à jour.': 'Календар оновлено.',
  Supprimer: 'Видалити',
  'Supprimer cette indisponibilité ?': 'Видалити цей зайнятий час?',
  '« {title} » —': '«{title}» —',
  '{time}. Ce créneau redevient réservable par les clients selon les horaires du cabinet.':
    '{time}. Цей проміжок знову стане доступним для запису клієнтів за графіком кабінету.',
  'Temps déjà pris ailleurs (Treatwell, Planity). Les clients ne peuvent plus réserver sur ce créneau, ni dans la pause de 15 min avant et après. Visible uniquement par l’administration.':
    'Час, уже зайнятий деінде (Treatwell, Planity). Клієнти не зможуть записатися на цей проміжок, а також на 15 хв перерви до й після нього. Бачить лише адміністрація.',
  'Date et horaires': 'Дата й час',
  'Cette indisponibilité dépasse minuit (créée hors de ce formulaire) : ses horaires restent tels quels. Vous pouvez modifier le titre et la note, ou la supprimer puis en créer une par jour.':
    'Цей зайнятий час виходить за північ (створений не через цю форму): його час залишається без змін. Можна змінити назву й нотатку або видалити його й створити окремий на кожен день.',
  Début: 'Початок',
  'Début (HH:MM)': 'Початок (ГГ:ХХ)',
  Fin: 'Кінець',
  'Fin (HH:MM, 24:00 pour minuit)': 'Кінець (ГГ:ХХ, 24:00 — північ)',
  'Un seul jour, heure de Paris, par pas de 5 min. Pour aller jusqu’à minuit, indiquez 24:00. Au moins 15 min.':
    'Лише один день, час Парижа, крок 5 хв. Щоб до півночі, вкажіть 24:00. Щонайменше 15 хв.',
  Source: 'Джерело',
  'Choisissez la source': 'Виберіть джерело',
  '{title} (titre actuel)': '{title} (поточна назва)',
  'Nom du client, détails internes…': 'Ім’я клієнта, внутрішні деталі…',
  Note: 'Нотатка',
  '(facultatif, {n}/{max})': '(необов’язково, {n}/{max})',
  Annuler: 'Скасувати',
  Ajouter: 'Додати',
  '{day}, plage {n} : début': '{day}, проміжок {n}: початок',
  '{day}, plage {n} : fin': '{day}, проміжок {n}: кінець',
  'Retirer la plage {n}': 'Видалити проміжок {n}',
  Plage: 'Проміжок',
  '{day} ouvert': '{day} — робочий',
  'Aucune réservation possible ce jour-là.': 'Цього дня записатися неможливо.',
  '{time} (depuis la veille)': '{time} (з попереднього дня)',
  '{time} (jusqu’au lendemain {end})': '{time} (до наступного дня, {end})',
  'Choisissez la source : Treatwell ou Planity.':
    'Виберіть джерело: Treatwell або Planity.',
  'Choisissez une date.': 'Оберіть дату.',
  'La date ne peut pas être passée.': 'Дата не може бути в минулому.',
  'Au plus {n} jours à l’avance.': 'Не більше ніж на {n} днів уперед.',
  'Heure de début au format HH:MM (00:00–23:55).':
    'Час початку у форматі ГГ:ХХ (00:00–23:55).',
  'Minutes par pas de {n} (ex. 14:05).': 'Хвилини з кроком {n} (напр. 14:05).',
  'Heure de fin au format HH:MM (24:00 pour minuit).':
    'Час кінця у форматі ГГ:ХХ (24:00 — північ).',
  'Minutes par pas de {n} (ex. 15:35).': 'Хвилини з кроком {n} (напр. 15:35).',
  'La fin doit être après le début, le même jour (24:00 au plus).':
    'Кінець має бути пізніше за початок, того ж дня (не пізніше 24:00).',
  'Au moins {n} minutes.': 'Щонайменше {n} хвилин.',
  'Indiquez un titre ({n} caractères maximum).':
    'Вкажіть назву (не більше {n} символів).',
  'Début refusé : vérifiez la date et l’heure (pas de 5 min, horizon de 365 jours, heure qui n’existe pas ou existe deux fois au changement d’heure).':
    'Початок відхилено: перевірте дату й час (крок 5 хв, не більше ніж на 365 днів уперед, час, якого не існує або який повторюється під час переходу на літній/зимовий час).',
  'Fin refusée par le serveur : vérifiez qu’elle n’est pas déjà passée, qu’elle reste le même jour (24:00 au plus), à au moins 15 minutes du début, minutes par pas de 5 (heure du changement d’heure non acceptée).':
    'Сервер відхилив кінець: перевірте, що він ще не минув, що це той самий день (не пізніше 24:00), щонайменше 15 хвилин після початку, хвилини з кроком 5 (час переходу на літній/зимовий час не приймається).',
  'Des rendez-vous confirmés (avec leur pause de 15 min) se trouvent sur ce créneau. Rien n’a été enregistré : déplacez ou annulez-les d’abord, ou changez les horaires.':
    'На цей проміжок припадають підтверджені записи (з їхньою 15-хвилинною перервою). Нічого не збережено: спочатку перенесіть або скасуйте їх чи змініть час.',
  'Cette indisponibilité a été supprimée entre-temps : elle n’a pas été recréée. Le calendrier est mis à jour.':
    'Цей зайнятий час тим часом було видалено: його не створено знову. Календар оновлено.',
  'Cette indisponibilité n’existe plus (supprimée entre-temps). Le calendrier est mis à jour.':
    'Цього зайнятого часу вже немає (його тим часом видалено). Календар оновлено.',
  'Cette demande a déjà servi pour une autre indisponibilité. Vérifiez le calendrier, puis enregistrez à nouveau : une nouvelle demande sera envoyée.':
    'Цей запит уже використано для іншого зайнятого часу. Перевірте календар і збережіть ще раз: буде надіслано новий запит.',
  'Certaines informations sont refusées. Vérifiez les champs signalés.':
    'Деякі дані відхилено. Перевірте позначені поля.',
  '{n} indisponibilité|{n} indisponibilités': {
    one: '{n} зайнятий проміжок',
    few: '{n} зайняті проміжки',
    many: '{n} зайнятих проміжків',
    other: '{n} зайнятих проміжків',
  },
  'Agenda du jour — administration': 'Розклад дня — адміністрування',
  'Calendrier — administration': 'Календар — адміністрування',
  'Carte cadeau — administration': 'Сертифікат — адміністрування',
  'Cartes cadeaux — administration':
    'Подарункові сертифікати — адміністрування',
  'Horaires — administration': 'Графік — адміністрування',
  'Rendez-vous — administration': 'Запис — адміністрування',
  ' — voir le détail': ' — переглянути деталі',
  ' — modifier ou supprimer': ' — змінити або видалити',
  'Heures d’ouverture : ': 'Години роботи: ',
  'Chargement du calendrier…': 'Завантаження календаря…',
  ' la sélection': ' вибір',
  indisponible: 'зайнято',
  'Indisponibilité terminée': 'Зайнятий час минув',
  ' pour {day}': ' для: {day}',
  ' (annulé)': ' (скасовано)',
  'Jours affichés': 'Показані дні',
  'Jours affichés — flèches gauche et droite pour changer de période':
    'Показані дні — стрілки вліво й вправо змінюють період',
  'Changer de jours': 'Змінити дні',
};

export default messages;
