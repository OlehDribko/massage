/*
 * Russian texts of the site: « texte français » → translation (keys are the
 * French texts used in the code, see src/i18n/translate.js). Plural keys
 * ("un|plusieurs") map to { one, few, many, other }.
 */
const messages = {
  'Mon compte': 'Мой кабинет',
  'Espace client': 'Личный кабинет',
  'Chargement…': 'Загрузка…',
  'Mon rendez-vous': 'Моя запись',
  'Mes réservations': 'Мои записи',
  Connexion: 'Вход',
  'Confirmer l’inscription': 'Подтверждение подписки',
  Newsletter: 'Рассылка',
  'Confirmer votre <accent>inscription</accent>':
    'Подтвердите <accent>подписку</accent>',
  'Page introuvable': 'Страница не найдена',
  'Erreur 404': 'Ошибка 404',
  'Cette page est <accent>introuvable</accent>':
    'Эта страница <accent>не найдена</accent>',
  'Le lien est peut-être incorrect ou la page a été déplacée.':
    'Возможно, ссылка неверна или страница была перемещена.',
  'Retour à l’accueil': 'На главную',
  'Prendre rendez-vous': 'Записаться',
  'Massage à Bordeaux | Massage by Stefania Ben':
    'Массаж в Бордо | Massage by Stefania Ben',
  'Cabinet de massage à Bordeaux, rue Castéja : massage thérapeutique et relaxant, Tuina, drainage lymphatique, anti-cellulite et Endosphères. Réservez en ligne.':
    'Массажный кабинет в Бордо, улица Кастежа: лечебный и расслабляющий массаж, Туйна, лимфодренаж, антицеллюлитный массаж и Endospheres. Онлайн-запись.',
  '← Toutes les prestations': '← Все услуги',
  'Cette prestation ne peut pas être affichée pour le moment. Réessayez dans quelques instants.':
    'Эту услугу сейчас не удаётся показать. Попробуйте ещё раз через минуту.',
  Durée: 'Длительность',
  'Réserver un massage à Bordeaux': 'Запись на массаж в Бордо',
  'Prenez rendez-vous en ligne pour votre massage à Bordeaux, 23 rue Castéja : choisissez le soin et le créneau qui vous conviennent.':
    'Запишитесь онлайн на массаж в Бордо, 23 rue Castéja: выберите процедуру и удобное время.',
  'Réserver un massage <accent>à Bordeaux</accent>':
    'Запись на массаж <accent>в Бордо</accent>',
  'Choisissez votre soin et sa durée, puis l’horaire qui vous convient. Le règlement se fait sur place, au cabinet, 23 rue Castéja.':
    'Выберите процедуру и её длительность, затем удобное время. Оплата на месте, в кабинете, 23 rue Castéja.',
  'Confirmation immédiate': 'Мгновенное подтверждение',
  'Paiement au cabinet': 'Оплата в кабинете',
  'Annulation en ligne': 'Отмена онлайн',
  'Le service de réservation met trop de temps à répondre.':
    'Сервис записи отвечает слишком долго.',
  'Les prestations ne peuvent pas être affichées pour le moment.':
    'Услуги сейчас не удаётся показать.',
  'Réessayez dans quelques instants.': 'Попробуйте ещё раз через минуту.',
  'Référence : {id}': 'Код обращения: {id}',
  Réessayer: 'Попробовать снова',
  'Aucune prestation n’est ouverte à la réservation.':
    'Сейчас нет услуг, доступных для записи.',
  Désabonnement: 'Отписка',
  'Se <accent>désabonner</accent>': '<accent>Отписаться</accent>',
  'Modifier mon adresse e-mail': 'Изменить адрес e-mail',
  'Adresse e-mail invalide.': 'Неверный адрес e-mail.',
  'C’est déjà votre adresse actuelle.': 'Это уже ваш текущий адрес.',
  'Un lien de confirmation a été envoyé à {email}. Votre adresse changera après l’ouverture de ce lien ; vous devrez alors vous reconnecter.':
    'Ссылка для подтверждения отправлена на {email}. Адрес изменится после того, как вы её откроете; затем нужно будет войти снова.',
  'Nouvelle adresse e-mail': 'Новый адрес e-mail',
  'Envoi…': 'Отправка…',
  'Envoyer le lien': 'Отправить ссылку',
  Fermer: 'Закрыть',
  'Vous n’êtes pas inscrit·e à la newsletter.': 'Вы не подписаны на рассылку.',
  'Inscription en attente : ouvrez le lien de confirmation reçu par e-mail.':
    'Подписка ожидает подтверждения: откройте ссылку из письма.',
  'Vous êtes inscrit·e à la newsletter.': 'Вы подписаны на рассылку.',
  'Vous êtes désinscrit·e. Les e-mails liés à vos rendez-vous ne sont pas concernés.':
    'Вы отписались. Писем о ваших записях это не касается.',
  'Le statut de la newsletter s’affiche une fois votre adresse e-mail confirmée.':
    'Статус рассылки появится после подтверждения вашего адреса e-mail.',
  'L’inscription à la newsletter n’est pas encore ouverte.':
    'Подписка на рассылку ещё не открыта.',
  'Recevoir la newsletter du cabinet': 'Получать рассылку кабинета',
  'Enregistrement…': 'Сохранение…',
  Enregistrer: 'Сохранить',
  'Renvoyer l’e-mail de confirmation': 'Отправить письмо подтверждения ещё раз',
  'Nouvel envoi possible {wait}.': 'Новое письмо можно будет отправить {wait}.',
  'Aucune modification à enregistrer.': 'Нет изменений для сохранения.',
  'Profil enregistré.': 'Профиль сохранён.',
  'Certaines informations sont invalides.': 'Некоторые данные неверны.',
  'Nom et prénom': 'Имя и фамилия',
  Téléphone: 'Телефон',
  'Format international. Utilisé uniquement pour vos rendez-vous.':
    'Международный формат. Используется только для ваших записей.',
  'Mon <accent>compte</accent>': 'Мой <accent>кабинет</accent>',
  'Pour terminer votre réservation :': 'Чтобы завершить запись:',
  'Votre profil est complet : vous pouvez reprendre votre réservation.':
    'Ваш профиль заполнен: можно вернуться к записи.',
  Continuer: 'Продолжить',
  'Chargement de votre profil…': 'Загрузка профиля…',
  Coordonnées: 'Контактные данные',
  'Votre nom et votre téléphone sont nécessaires pour réserver.':
    'Для записи нужны ваше имя и номер телефона.',
  'Adresse e-mail': 'Адрес e-mail',
  '(confirmée)': '(подтверждён)',
  '(non confirmée)': '(не подтверждён)',
  'Mode de connexion': 'Способ входа',
  'Confirmez votre adresse e-mail': 'Подтвердите адрес e-mail',
  'Un lien de confirmation a été envoyé à {email}. Après l’avoir ouvert, revenez ici et actualisez votre statut.':
    'Ссылка для подтверждения отправлена на {email}. Открыв её, вернитесь сюда и обновите статус.',
  'Vérification…': 'Проверка…',
  'J’ai confirmé': 'Я подтвердил(а)',
  'E-mail de confirmation renvoyé.': 'Письмо подтверждения отправлено ещё раз.',
  'Renvoyer l’e-mail': 'Отправить письмо ещё раз',
  'Déconnexion…': 'Выход…',
  'Se déconnecter': 'Выйти',
  'Mon profil': 'Мой профиль',
  Administration: 'Администрирование',
  'L’espace client n’est pas encore disponible.':
    'Личный кабинет пока недоступен.',
  'Chargement de votre compte…': 'Загрузка учётной записи…',
  'Le service de connexion est momentanément indisponible.':
    'Сервис входа временно недоступен.',
  'Connectez-vous pour accéder à votre compte.':
    'Войдите, чтобы перейти в свой кабинет.',
  'Se connecter': 'Войти',
  'Créer un compte': 'Создать учётную запись',
  'Créer mon compte': 'Создать учётную запись',
  'Votre session a expiré ou a été fermée sur un autre appareil. Veuillez vous reconnecter.':
    'Ваш сеанс истёк или был закрыт на другом устройстве. Войдите снова.',
  'Ce compte est désactivé. Contactez-nous si vous pensez qu’il s’agit d’une erreur.':
    'Эта учётная запись отключена. Свяжитесь с нами, если считаете, что это ошибка.',
  'Indiquez votre adresse e-mail.': 'Укажите адрес e-mail.',
  'Indiquez votre mot de passe.': 'Укажите пароль.',
  '{n} caractères minimum.': 'Не менее {n} символов.',
  'Si un compte existe pour cette adresse, un e-mail pour choisir un nouveau mot de passe vient d’être envoyé.':
    'Если для этого адреса существует учётная запись, на него только что отправлено письмо для установки нового пароля.',
  'La connexion en ligne n’est pas encore disponible.':
    'Онлайн-вход пока недоступен.',
  'Découvrir les soins': 'Посмотреть услуги',
  'Vous êtes <accent>connecté·e</accent>': 'Вы <accent>вошли</accent>',
  'Type de connexion': 'Тип входа',
  'J’ai un compte': 'У меня есть учётная запись',
  'Nouveau compte': 'Новая учётная запись',
  'Votre compte vous permettra de retrouver vos informations.':
    'Учётная запись позволяет сохранять ваши данные.',
  'Mot de passe': 'Пароль',
  'Masquer le mot de passe': 'Скрыть пароль',
  'Afficher le mot de passe': 'Показать пароль',
  Masquer: 'Скрыть',
  Afficher: 'Показать',
  'Recevoir la newsletter du cabinet (facultatif)':
    'Получать рассылку кабинета (необязательно)',
  'Un instant…': 'Минутку…',
  'Mot de passe oublié ?': 'Забыли пароль?',
  ou: 'или',
  'Connexion avec Google…': 'Вход через Google…',
  'Continuer avec Google': 'Продолжить с Google',
  'Préparation de votre session…': 'Подготовка сеанса…',
  '{duration}, fin à {time}': '{duration}, до {time}',
  'à régler au cabinet': 'оплата в кабинете',
  'Réservation…': 'Запись…',
  'Confirmer la réservation': 'Подтвердить запись',
  'La réservation en ligne n’est pas encore disponible. Vous pouvez réserver par la page de rendez-vous.':
    'Онлайн-запись пока недоступна. Записаться можно через страницу записи.',
  'Votre profil n’a pas pu être chargé.': 'Не удалось загрузить ваш профиль.',
  'Choisissez un horaire': 'Выберите время',
  'Complétez les étapes ci-contre pour confirmer.':
    'Чтобы подтвердить, выполните шаги рядом.',
  'Se reconnecter': 'Войти снова',
  '← Changer d’horaire': '← Изменить время',
  'Tout est <accent>prêt</accent>': 'Всё <accent>готово</accent>',
  'Encore <accent>quelques informations</accent>':
    'Ещё <accent>несколько данных</accent>',
  'Vérifiez le récapitulatif puis confirmez : le rendez-vous est enregistré immédiatement.':
    'Проверьте итог и подтвердите: запись будет создана сразу.',
  'Votre réservation': 'Ваша запись',
  Modifier: 'Изменить',
  'Aucun horaire choisi': 'Время не выбрано',
  Soin: 'Процедура',
  'À régler sur place': 'Оплата на месте',
  'Confirmation immédiate, sans acompte':
    'Мгновенное подтверждение, без предоплаты',
  'Report en ligne jusqu’à 12 h avant': 'Перенос онлайн до 12 ч до визита',
  'Annulation en ligne jusqu’au rendez-vous': 'Отмена онлайн до начала записи',
  Confirmer: 'Подтвердить',
  ' (terminé)': ' (выполнено)',
  'Un lien de confirmation a été envoyé à <email>{email}</email>. Ouvrez-le, puis revenez ici : cette page se met à jour toute seule.':
    'Ссылка для подтверждения отправлена на <email>{email}</email>. Откройте её и вернитесь сюда: страница обновится сама.',
  'Un compte administrateur ne peut pas réserver pour lui-même. Connectez-vous avec un compte client.':
    'Учётная запись администратора не может записываться сама. Войдите под учётной записью клиента.',
  Compte: 'Учётная запись',
  'Pour reporter ou annuler en ligne, votre rendez-vous est lié à un compte.':
    'Чтобы переносить или отменять запись онлайн, она привязывается к учётной записи.',
  'Vos coordonnées': 'Ваши контактные данные',
  'Pour vous joindre en cas d’imprévu concernant le rendez-vous.':
    'Чтобы связаться с вами, если с записью что-то изменится.',
  'Enregistrer et continuer': 'Сохранить и продолжить',
  'Confirmer votre e-mail': 'Подтвердите e-mail',
  'Adresse confirmée': 'Адрес подтверждён',
  'Un lien vous sera envoyé par e-mail.': 'Вам отправят ссылку на e-mail.',
  Horaire: 'Время',
  Confirmation: 'Подтверждение',
  'Étapes de la réservation': 'Этапы записи',
  'par le client': 'клиентом',
  'par le cabinet': 'кабинетом',
  Date: 'Дата',
  Prestation: 'Услуга',
  Tarif: 'Стоимость',
  '· règlement sur place': '· оплата на месте',
  Annulation: 'Отмена',
  'Annulé {by} le {date}': 'Отменено {by} {date}',
  'Motif : {reason}': 'Причина: {reason}',
  'Réservation créée': 'Запись создана',
  'Rendez-vous déplacé': 'Запись перенесена',
  'Annulé {by}': 'Отменено {by}',
  Modification: 'Изменение',
  vers: 'на',
  'Filtrer les soins': 'Фильтр услуг',
  'Type de soin': 'Тип процедуры',
  Budget: 'Бюджет',
  Populaires: 'Популярные',
  '<b>{n}</b> soin correspondant à vos critères|<b>{n}</b> soins correspondant à vos critères':
    {
      one: '<b>{n}</b> услуга соответствует вашим критериям',
      few: '<b>{n}</b> услуги соответствуют вашим критериям',
      many: '<b>{n}</b> услуг соответствуют вашим критериям',
      other: '<b>{n}</b> услуг соответствуют вашим критериям',
    },
  '<b>{n}</b> soin disponible|<b>{n}</b> soins disponibles': {
    one: '<b>{n}</b> услуга доступна',
    few: '<b>{n}</b> услуги доступны',
    many: '<b>{n}</b> услуг доступно',
    other: '<b>{n}</b> услуг доступно',
  },
  'Effacer les filtres': 'Сбросить фильтры',
  'les soins les plus demandés': 'самые популярные процедуры',
  'Aucun soin ne correspond': 'Нет подходящих услуг',
  'Essayez une autre durée ou un autre budget.':
    'Попробуйте другую длительность или другой бюджет.',
  'Voir tous les soins': 'Показать все услуги',
  'À dimanche': 'До встречи в воскресенье',
  'À lundi': 'До встречи в понедельник',
  'À mardi': 'До встречи во вторник',
  'À mercredi': 'До встречи в среду',
  'À jeudi': 'До встречи в четверг',
  'À vendredi': 'До встречи в пятницу',
  'À samedi': 'До встречи в субботу',
  'Ajouter à Google Agenda': 'Добавить в Google Календарь',
  ' (nouvelle fenêtre)': ' (новое окно)',
  'Chargement du rendez-vous…': 'Загрузка записи…',
  'Rendez-vous introuvable.': 'Запись не найдена.',
  'Rendez-vous déplacé au {date}.': 'Запись перенесена на {date}.',
  'Le rendez-vous est déjà à cet horaire.':
    'Запись уже назначена на это время.',
  'Rendez-vous annulé.': 'Запись отменена.',
  Itinéraire: 'Маршрут',
  'Report en ligne': 'Перенос онлайн',
  'avant le {date}': 'до {date}',
  'n’est plus possible (moins de 12 h)': 'уже невозможен (менее чем за 12 ч)',
  'jusqu’à l’heure du rendez-vous': 'до времени записи',
  Déplacer: 'Перенести',
  'Annuler le rendez-vous': 'Отменить запись',
  'Votre rendez-vous est confirmé.': 'Ваша запись подтверждена.',
  'Le règlement se fait sur place.': 'Оплата на месте.',
  'Gérer le rendez-vous': 'Управлять записью',
  ' — motif : {reason}': ' — причина: {reason}',
  'Choisissez un nouvel horaire': 'Выберите новое время',
  'Choisir cet horaire': 'Выбрать это время',
  Historique: 'История',
  'Déplacer le rendez-vous ?': 'Перенести запись?',
  'Nouvel horaire : {date}. La prestation et le tarif restent les mêmes.':
    'Новое время: {date}. Услуга и стоимость остаются прежними.',
  'Annuler ce rendez-vous ?': 'Отменить эту запись?',
  'Oui, annuler': 'Да, отменить',
  Garder: 'Оставить',
  'Plutôt déplacer': 'Лучше перенести',
  'L’horaire sera libéré pour quelqu’un d’autre. Cette action est définitive — vous pouvez aussi simplement le déplacer.':
    'Это время освободится для других. Действие нельзя отменить — вы также можете просто перенести запись.',
  'L’horaire sera libéré pour quelqu’un d’autre. Cette action est définitive.':
    'Это время освободится для других. Действие нельзя отменить.',
  'Mon <accent>rendez-vous</accent>': 'Моя <accent>запись</accent>',
  Tout: 'Все',
  Passés: 'Прошедшие',
  Annulés: 'Отменённые',
  'Aujourd’hui': 'Сегодня',
  Demain: 'Завтра',
  'Dans {n} jours': 'Через {n} дн.',
  'Réserver à nouveau': 'Записаться снова',
  'Chargement de vos réservations…': 'Загрузка ваших записей…',
  'Vous n’avez pas encore de réservation.': 'У вас ещё нет записей.',
  'Réserver un soin': 'Записаться на процедуру',
  'Prochain rendez-vous': 'Ближайшая запись',
  'En cours': 'В процессе',
  Gérer: 'Управлять',
  'Aucun rendez-vous à venir.': 'Ближайших записей нет.',
  Ensuite: 'Далее',
  'Filtrer l’historique': 'Фильтр истории',
  'Aucun rendez-vous dans cette catégorie.': 'В этой категории записей нет.',
  'Mes <accent>réservations</accent>': 'Мои <accent>записи</accent>',
  'Voir les {n} forfaits — jusqu’à {percent} % d’économie':
    'Посмотреть абонементы ({n}) — экономия до {percent} %',
  'Forfaits −{percent} %': 'Абонементы −{percent} %',
  'Forfaits — {name}': 'Абонементы — {name}',
  'soit {price} / séance': 'то есть {price} / сеанс',
  'Forfait réglé au cabinet, chaque séance se réserve ensuite en ligne. Pour en profiter :':
    'Абонемент оплачивается в кабинете, а каждый сеанс затем бронируется онлайн. Чтобы приобрести:',
  'par e-mail': 'по электронной почте',
  'au lieu de ': 'вместо ',
  'offre valable jusqu’au {date}': 'предложение действует до {date}',
  'Avant de réserver :': 'Перед записью:',
  Populaire: 'Популярное',
  Description: 'Описание',
  'Choisir l’horaire': 'Выбрать время',
  'ou dès {price} / séance en forfait': 'или от {price} / сеанс с абонементом',
  'Du {from} au {to}': 'С {from} по {to}',
  'Semaine précédente': 'Предыдущая неделя',
  'Semaine suivante': 'Следующая неделя',
  'Chargement des disponibilités…': 'Загрузка свободного времени…',
  Jour: 'День',
  '{n} horaire|{n} horaires': {
    one: '{n} слот',
    few: '{n} слота',
    many: '{n} слотов',
    other: '{n} слотов',
  },
  'aucun horaire': 'нет свободного времени',
  Aucun: 'Нет',
  'Aucun créneau disponible sur cette période.':
    'В этот период нет свободного времени.',
  'Consultez la semaine suivante.': 'Посмотрите следующую неделю.',
  'Horaires du {date}': 'Время на {date}',
  'Aucun horaire ce jour-là': 'В этот день нет свободного времени',
  'Voir le {date}': 'Посмотреть {date}',
  'Plus aucun horaire ouvert cette semaine.':
    'На этой неделе свободного времени больше нет.',
  'Réservation au plus tard 12 h à l’avance, jusqu’à 45 jours. Horaires à l’heure de Bordeaux.':
    'Запись минимум за 12 ч и не более чем на 45 дней вперёд. Время — по Бордо.',
  'La déconnexion a échoué. Veuillez réessayer.':
    'Не удалось выйти. Попробуйте ещё раз.',
  'Connexion indisponible, réessayer': 'Вход недоступен, попробовать снова',
  'Espace personnel': 'Личный кабинет',
  'Ce que nous faisons': 'Что мы делаем',
  'À propos': 'Обо мне',
  'Nos réalisations': 'Наши работы',
  Avis: 'Отзывы',
  'Massage thérapeutique et bien-être, dans un cadre calme et confidentiel à Bordeaux.':
    'Лечебный и оздоровительный массаж в спокойной, конфиденциальной обстановке в Бордо.',
  'Navigation du pied de page': 'Навигация в подвале сайта',
  NAVIGATION: 'НАВИГАЦИЯ',
  CONTACT: 'КОНТАКТЫ',
  'SUIVEZ-NOUS': 'МЫ В СОЦСЕТЯХ',
  '{name} (nouvel onglet)': '{name} (новая вкладка)',
  '© 2026 {name}. Tous droits réservés.': '© 2026 {name}. Все права защищены.',
  'À propos de moi': 'Обо мне',
  'Massages populaires': 'Популярные массажи',
  'Mon approche': 'Мой подход',
  'Navigation principale': 'Основная навигация',
  'Ouvrir le menu': 'Открыть меню',
  'Langue : {name}': 'Язык: {name}',
  'Langue de l’administration': 'Язык админпанели',
  'Langue du site': 'Язык сайта',
  'Connexion indisponible — réessayer': 'Вход недоступен — попробовать снова',
  Menu: 'Меню',
  'Fermer le menu': 'Закрыть меню',
  'Offrir une carte cadeau': 'Подарить сертификат',
  'Traduction (seul le texte français ci-dessus fait foi) : {text}':
    'Перевод (юридическую силу имеет только французский текст выше): {text}',
  'Nous vous contacterons à': 'Мы свяжемся с вами',
  Nom: 'Имя',
  'Modifier mon profil': 'Изменить профиль',
  'Choisissez le soin à offrir.': 'Выберите процедуру в подарок.',
  '{n} caractères maximum.': 'Не более {n} символов.',
  'Choisissez comment vous préférez être contacté.':
    'Выберите, как с вами лучше связаться.',
  'Que souhaitez-vous offrir ? *': 'Что вы хотите подарить? *',
  'Soin offert *': 'Процедура в подарок *',
  'La liste des soins est indisponible pour le moment. Choisissez « Un montant » et précisez le soin dans votre message.':
    'Список процедур сейчас недоступен. Выберите «Сумму» и укажите процедуру в сообщении.',
  'Chargement des soins…': 'Загрузка процедур…',
  'Choisir un soin': 'Выберите процедуру',
  '{soin} : carte de {price} (tarif actuel).':
    '{soin}: сертификат на {price} (текущая цена).',
  'La carte vaut le prix actuel du soin choisi.':
    'Сертификат равен текущей цене выбранной процедуры.',
  'Montant de la carte *': 'Сумма сертификата *',
  'Montant libre en euros, par exemple 80 ou 120,50.':
    'Любая сумма в евро, например 80 или 120,50.',
  'Message — facultatif': 'Сообщение — необязательно',
  'Pour l’anniversaire de ma sœur, un massage relaxant…':
    'На день рождения сестры, расслабляющий массаж…',
  'Comment préférez-vous être contacté ? *': 'Как с вами лучше связаться? *',
  'Pas de paiement en ligne : la praticienne vous recontacte pour convenir du règlement et de la remise de la carte.':
    'Онлайн-оплаты нет: мастер свяжется с вами, чтобы договориться об оплате и передаче сертификата.',
  'Réessayer l’envoi': 'Отправить ещё раз',
  'Envoyer la demande': 'Отправить запрос',
  'Demande n° {number} envoyée.': 'Запрос № {number} отправлен.',
  'Nous vous contacterons pour la suite. La carte cadeau n’est ni réglée ni émise à ce stade : le règlement et la remise se font avec la praticienne.':
    'Мы свяжемся с вами по поводу дальнейших шагов. На этом этапе сертификат ещё не оплачен и не выдан: оплату и передачу вы согласуете с мастером.',
  Montant: 'Сумма',
  Contact: 'Связь',
  Message: 'Сообщение',
  'Faire une autre demande': 'Отправить ещё один запрос',
  'La demande en ligne est momentanément indisponible. Contactez-nous directement (coordonnées ci-dessous).':
    'Онлайн-запросы временно недоступны. Свяжитесь с нами напрямую (контакты ниже).',
  'Demandez une carte cadeau': 'Закажите подарочный сертификат',
  'Choisissez un montant ou une prestation et envoyez votre demande. Nous vous contacterons pour finaliser la commande.':
    'Выберите сумму или процедуру и отправьте запрос. Мы свяжемся с вами, чтобы оформить заказ.',
  'Offrez une carte cadeau': 'Подарите сертификат',
  'Carte cadeau': 'Подарочный сертификат',
  'Ou directement': 'Или напрямую',
  'Confirmez votre inscription à la newsletter du cabinet.':
    'Подтвердите подписку на рассылку кабинета.',
  'Confirmer mon inscription': 'Подтвердить подписку',
  'Votre inscription à la newsletter est confirmée.':
    'Подписка на рассылку подтверждена.',
  'Votre inscription était déjà confirmée.':
    'Ваша подписка уже была подтверждена.',
  'Ce lien n’est plus valide : il a expiré, a déjà été utilisé ou a été remplacé par un lien plus récent.':
    'Эта ссылка уже недействительна: она устарела, уже была использована или заменена более новой.',
  'Vous ne recevrez plus la newsletter du cabinet. Les e-mails liés à vos rendez-vous ne sont pas concernés.':
    'Вы больше не будете получать рассылку кабинета. Писем о ваших записях это не касается.',
  'Me désabonner': 'Отписаться',
  'Vous êtes désabonné·e de la newsletter.': 'Вы отписались от рассылки.',
  'Ce lien de désabonnement n’est pas valide.':
    'Эта ссылка для отписки недействительна.',
  'Ce lien est incomplet. Utilisez le lien reçu par e-mail.':
    'Ссылка неполная. Воспользуйтесь ссылкой из письма.',
  'Une erreur est survenue. Réessayez dans quelques instants.':
    'Произошла ошибка. Попробуйте ещё раз через минуту.',
  'La newsletter n’est pas disponible pour le moment.':
    'Рассылка сейчас недоступна.',
  'Demander un nouveau lien': 'Получить новую ссылку',
  'Fermer le message': 'Закрыть сообщение',
  'Je suis Stefaniia, masseuse certifiée avec plus de 10 ans d’expérience.':
    'Я — Стефания, сертифицированный массажист с опытом более 10 лет.',
  'J’ai travaillé à l’Institut de Vertébrologie et je suis spécialisée dans différents types de massages : thérapeutique, drainage lymphatique, anti-cellulite, relaxant et bien d’autres.':
    'Я работала в Институте вертебрологии и специализируюсь на разных видах массажа: лечебном, лимфодренажном, антицеллюлитном, расслабляющем и многих других.',
  'Mon objectif n’est pas seulement de réaliser une séance, mais d’obtenir des résultats concrets et d’améliorer votre bien-être.':
    'Моя цель — не просто провести сеанс, а добиться ощутимых результатов и улучшить ваше самочувствие.',
  clients: 'клиентов',
  'ans d’expérience': 'лет опыта',
  'ans d’exp.': 'г. опыта',
  reviennent: 'возвращаются',
  'Pourquoi mes clients me choisissent': 'Почему клиенты выбирают меня',
  'Massage professionnel avec des <accent>résultats visibles</accent>':
    'Профессиональный массаж с <accent>заметным результатом</accent>',
  'Stefaniia, masseuse certifiée à Bordeaux':
    'Стефания, сертифицированный массажист в Бордо',
  'Mains posées sur une serviette après un massage':
    'Руки на полотенце после массажа',
  'Qui est concerné': 'Кому это подходит',
  'Tensions chroniques du dos et de la nuque':
    'Хроническое напряжение в спине и шее',
  'Stress accumulé et sommeil perturbé': 'Накопившийся стресс и нарушенный сон',
  'Manque d’énergie au quotidien': 'Нехватка энергии в повседневной жизни',
  'Pose de ventouses sur le dos pendant une séance':
    'Баночный массаж спины во время сеанса',
  'Ce que vous recevez': 'Что вы получаете',
  'Spécialiste certifiée, formée à l’Institut de Vertébrologie':
    'Сертифицированный специалист, обучавшийся в Институте вертебрологии',
  'Un traitement personnalisé selon votre morphologie.':
    'Индивидуальная процедура с учётом особенностей вашего тела.',
  'Des techniques professionnelles éprouvées':
    'Проверенные профессиональные техники',
  Résultats: 'Результаты',
  'Dès la 1ère séance — soulagement immédiat':
    'С первого сеанса — ощутимое облегчение',
  'Après 3 séances — mobilité restaurée':
    'После 3 сеансов — восстановленная подвижность',
  'Suivi régulier — bien-être durable, dans un cadre confortable et confidentiel':
    'Регулярные сеансы — долгое хорошее самочувствие в комфортной и конфиденциальной обстановке',
  'Pourquoi me choisir': 'Почему стоит выбрать меня',
  'Une approche pensée pour votre bien-être, <accent>pas juste une séance</accent>':
    'Подход, созданный для вашего благополучия, <accent>а не просто сеанс</accent>',
  'Prenez <accent>rendez-vous</accent>': 'Запишитесь <accent>на приём</accent>',
  'Choisissez votre soin, sa durée et l’horaire qui vous convient. La réservation est confirmée immédiatement ; le règlement se fait sur place, au cabinet.':
    'Выберите процедуру, её длительность и удобное время. Запись подтверждается сразу; оплата — на месте, в кабинете.',
  'Soin signature': 'Фирменная процедура',
  'Découvrez le massage': 'Откройте для себя',
  Endosphérologie: 'Эндосферотерапию',
  'Une technologie de compression mécanique par rouleaux, pensée pour stimuler la microcirculation, drainer les tissus en profondeur et redessiner la silhouette. Un soin d’exception pour un corps visiblement plus tonique.':
    'Технология механической компрессии роликами, стимулирующая микроциркуляцию, глубоко дренирующая ткани и моделирующая силуэт. Особая процедура для заметно подтянутого тела.',
  'Réserver ce soin': 'Записаться на процедуру',
  'Idéale pour toute personne recherchant détente, récupération ou un moment rien qu’à elle.':
    'Идеальный подарок для тех, кто ищет расслабление, восстановление или время только для себя.',
  'Au choix : un montant libre, utilisable sur l’ensemble des soins, ou un soin précis à offrir.':
    'На выбор: произвольная сумма на любые процедуры или конкретная процедура в подарок.',
  'Valable 1 an à compter de la date d’achat, envoyée par email prête à offrir.':
    'Действует 1 год с даты покупки, отправляется на e-mail готовым к вручению.',
  'Carte cadeau : massage dans une ambiance aux bougies':
    'Подарочный сертификат: массаж при свечах',
  'Offrez un moment de bien-être': 'Подарите момент заботы',
  'Laisser une demande': 'Оставить запрос',
  'Massage du dos dans un cabinet de massage à Bordeaux':
    'Массаж спины в массажном кабинете в Бордо',
  'Soins professionnels du corps': 'Профессиональный уход за телом',
  'Le massage qui vous <accent>ressource</accent>':
    'Массаж, который <accent>возвращает силы</accent>',
  'Merci ! Si cette adresse n’est pas encore inscrite, un lien de confirmation vient de lui être envoyé.':
    'Спасибо! Если этот адрес ещё не подписан, на него только что отправлена ссылка для подтверждения.',
  'Indiquez une adresse e-mail valide.': 'Укажите правильный адрес e-mail.',
  'Ne manquez aucune offre': 'Не пропустите ни одного предложения',
  'Recevez en avant-première nos offres saisonnières, tarifs spéciaux et invitations pour des séances à prix réduit ou offertes.':
    'Первыми получайте сезонные предложения, специальные цены и приглашения на сеансы со скидкой или бесплатные.',
  'Vous êtes inscrit·e avec <email>{email}</email>.':
    'Вы подписаны с адресом <email>{email}</email>.',
  'Gérer mon inscription': 'Управлять подпиской',
  'Inscription…': 'Подписка…',
  'S’inscrire avec {email}': 'Подписаться с {email}',
  'Une inscription attend la confirmation par e-mail : ce bouton l’active tout de suite.':
    'Подписка ожидает подтверждения из письма: эта кнопка активирует её сразу.',
  'Utiliser une autre adresse': 'Использовать другой адрес',
  'nom@exemple.com': 'name@example.com',
  'S’inscrire à la newsletter': 'Подписаться на рассылку',
  'Massage du cou, cliente allongée en cabine':
    'Массаж шеи, клиентка лежит в кабинете',
  'Massage du dos et des épaules en cabine': 'Массаж спины и плеч в кабинете',
  'à partir de {price}': 'от {price}',
  min: 'мин',
  'Nos soins <accent>populaires</accent>':
    'Наши <accent>популярные</accent> процедуры',
  '{n} soin le plus demandé.|{n} soins les plus demandés.': {
    one: '{n} самая популярная процедура.',
    few: '{n} самые популярные процедуры.',
    many: '{n} самых популярных процедур.',
    other: '{n} самых популярных процедур.',
  },
  'Les soins les plus demandés.': 'Самые популярные процедуры.',
  'Un doute ? Consultation gratuite.': 'Сомневаетесь? Консультация бесплатно.',
  'Retrouvez tous nos soins, leurs durées et leurs tarifs sur la page de réservation.':
    'Все процедуры, их длительность и цены — на странице записи.',
  'Découvrir les services': 'Посмотреть услуги',
  'Avis clients': 'Отзывы клиентов',
  'Avis Planity': 'Отзыв на Planity',
  '{rating} sur 5': '{rating} из 5',
  'Reprendre le défilement des avis': 'Возобновить прокрутку отзывов',
  'Massage Tuina': 'Массаж Туйна',
  'Massage sportif': 'Спортивный массаж',
  'Endospheres therapy': 'Endospheres-терапия',
  'Massage lymphatique': 'Лимфатический массаж',
  'Massage anti-cellulite': 'Антицеллюлитный массаж',
  'Mettre en pause le défilement des avis': 'Приостановить прокрутку отзывов',
  'Avis précédent': 'Предыдущий отзыв',
  'Avis suivant': 'Следующий отзыв',
  Retour: 'Назад',
  '{label} : {date} — changer de date': '{label}: {date} — изменить дату',
  Choisir: 'Выбрать',
  'Choisir une date': 'Выберите дату',
  'Mois précédent': 'Предыдущий месяц',
  'Mois suivant': 'Следующий месяц',
  ' (aujourd’hui)': ' (сегодня)',
  'Note {rating} sur 5 — {n} avis vérifiés sur Planity (nouvelle fenêtre)':
    'Оценка {rating} из 5 — {n} проверенных отзывов на Planity (новое окно)',
  '{n} avis vérifié|{n} avis vérifiés': {
    one: '{n} проверенный отзыв',
    few: '{n} проверенных отзыва',
    many: '{n} проверенных отзывов',
    other: '{n} проверенных отзывов',
  },
  'Note parfaite : {rating} / 5': 'Идеальная оценка: {rating} / 5',
  '6 séances · demi-corps': '6 сеансов · половина тела',
  '12 séances · demi-corps': '12 сеансов · половина тела',
  '18 séances · demi-corps': '18 сеансов · половина тела',
  '24 séances · demi-corps': '24 сеанса · половина тела',
  '12 séances · corps complet': '12 сеансов · всё тело',
  'Massages chinois': 'Китайские массажи',
  'Massages relaxants': 'Расслабляющие массажи',
  'Massages spécifiques': 'Специальные массажи',
  'Soins express 30 min': 'Экспресс-процедуры 30 мин',
  Endosphères: 'Endospheres',
  Madérothérapie: 'Мадеротерапия',
  'Lettres, espaces, apostrophes, points et tirets uniquement.':
    'Только буквы, пробелы, апострофы, точки и дефисы.',
  'Format international avec indicatif, par exemple +33 6 12 34 56 78.':
    'Международный формат с кодом страны, например +33 6 12 34 56 78.',
  'Ce nom n’est pas accepté.': 'Такое имя не принимается.',
  'Numéro invalide : utilisez le format international, par exemple +33 6 12 34 56 78.':
    'Неверный номер: используйте международный формат, например +33 6 12 34 56 78.',
  'Adresse e-mail ou mot de passe incorrect.':
    'Неверный адрес e-mail или пароль.',
  'Mot de passe trop court : 6 caractères minimum.':
    'Пароль слишком короткий: не менее 6 символов.',
  'Ce mot de passe ne respecte pas les règles de sécurité.':
    'Пароль не соответствует требованиям безопасности.',
  'Un compte existe déjà avec cette adresse. Connectez-vous à ce compte.':
    'Учётная запись с этим адресом уже существует. Войдите в неё.',
  'Ces identifiants sont déjà utilisés par un autre compte. Connectez-vous à ce compte.':
    'Эти данные для входа уже использует другая учётная запись. Войдите в неё.',
  'Un compte existe déjà avec cette adresse. Connectez-vous avec votre e-mail et votre mot de passe.':
    'Учётная запись с этим адресом уже существует. Войдите с помощью e-mail и пароля.',
  'Ce compte est désactivé.': 'Эта учётная запись отключена.',
  'Trop de tentatives. Patientez quelques minutes avant de réessayer.':
    'Слишком много попыток. Подождите несколько минут и попробуйте снова.',
  'Connexion impossible. Vérifiez votre accès à Internet et réessayez.':
    'Не удаётся войти. Проверьте подключение к интернету и попробуйте ещё раз.',
  'La fenêtre Google a été bloquée par le navigateur. Autorisez les fenêtres pop-up pour ce site et réessayez.':
    'Браузер заблокировал окно Google. Разрешите всплывающие окна для этого сайта и попробуйте ещё раз.',
  'La connexion n’est pas autorisée sur ce domaine pour le moment.':
    'Вход на этом домене пока не разрешён.',
  'Ce mode de connexion n’est pas disponible pour le moment.':
    'Этот способ входа пока недоступен.',
  'Pour des raisons de sécurité, reconnectez-vous puis réessayez.':
    'В целях безопасности войдите снова и повторите попытку.',
  'Le service de compte est momentanément indisponible.':
    'Сервис учётных записей временно недоступен.',
  'Impossible de joindre le service de compte. Vérifiez votre connexion.':
    'Не удаётся связаться с сервисом учётных записей. Проверьте подключение.',
  'Le service de compte met trop de temps à répondre.':
    'Сервис учётных записей отвечает слишком долго.',
  'Le service de compte a envoyé une réponse incomplète.':
    'Сервис учётных записей прислал неполный ответ.',
  'Le service de compte n’est pas encore configuré.':
    'Сервис учётных записей ещё не настроен.',
  'Règlement sur place, au cabinet.': 'Оплата на месте, в кабинете.',
  '30 min': '30 мин',
  '1 h': '1 ч',
  '1 h 30': '1 ч 30 мин',
  '2 h': '2 ч',
  'Jusqu’à 60 €': 'До 60 €',
  '60 – 100 €': '60 – 100 €',
  '100 € et plus': 'От 100 €',
  'À venir': 'Запланирована',
  Terminé: 'Завершена',
  Annulé: 'Отменена',
  'Statut inconnu': 'Неизвестный статус',
  'par vous': 'вами',
  'Un compte administrateur ne peut pas réserver pour lui-même.':
    'Учётная запись администратора не может записываться сама.',
  'Connectez-vous ou créez un compte.': 'Войдите или создайте учётную запись.',
  'Confirmez votre adresse e-mail.': 'Подтвердите адрес e-mail.',
  'Confirmer mon e-mail': 'Подтвердить e-mail',
  'Indiquez votre nom.': 'Укажите своё имя.',
  'Compléter mon profil': 'Заполнить профиль',
  'Indiquez votre numéro de téléphone.': 'Укажите номер телефона.',
  'Ce créneau commence dans moins de 12 heures.':
    'Это время начинается менее чем через 12 часов.',
  'Ce créneau est trop éloigné dans le temps.':
    'Это время слишком далеко в будущем.',
  'Ce créneau ne correspond plus aux horaires du cabinet.':
    'Это время больше не соответствует графику кабинета.',
  'Ce créneau vient d’être réservé.': 'Это время только что забронировали.',
  'Ce créneau n’est plus disponible.': 'Это время уже недоступно.',
  'Choisissez un autre horaire.': 'Выберите другое время.',
  'Cette prestation n’est plus proposée à la réservation.':
    'Эта услуга больше не доступна для записи.',
  'Votre profil doit être complété avant de réserver.':
    'Перед записью нужно заполнить профиль.',
  'Le rendez-vous ne peut plus être déplacé à moins de 12 heures. Vous pouvez encore l’annuler.':
    'Запись уже нельзя перенести менее чем за 12 часов. Отменить её ещё можно.',
  'Le rendez-vous a déjà commencé ou est terminé : il ne peut plus être annulé.':
    'Запись уже началась или завершилась: отменить её невозможно.',
  'Ce rendez-vous est annulé.': 'Эта запись отменена.',
  'Le calendrier est momentanément occupé. Réessayez dans quelques secondes.':
    'Календарь временно занят. Попробуйте ещё раз через несколько секунд.',
  'Des rendez-vous confirmés se trouvent en dehors des nouveaux horaires. Annulez-les d’abord, puis enregistrez à nouveau.':
    'Есть подтверждённые записи вне нового графика. Сначала отмените их, затем сохраните ещё раз.',
  'Certaines informations sont invalides. Vérifiez le formulaire.':
    'Некоторые данные неверны. Проверьте форму.',
  'Vous n’avez pas accès à cette page.': 'У вас нет доступа к этой странице.',
  'Votre session a expiré. Veuillez vous reconnecter.':
    'Сеанс истёк. Войдите снова.',
  'Le service de compte est momentanément indisponible. Réessayez dans quelques instants.':
    'Сервис учётных записей временно недоступен. Попробуйте ещё раз через минуту.',
  'Impossible de joindre le service. Vérifiez votre connexion et réessayez.':
    'Не удаётся связаться с сервисом. Проверьте подключение и попробуйте ещё раз.',
  'Le service met trop de temps à répondre. Réessayez dans quelques instants.':
    'Сервис отвечает слишком долго. Попробуйте ещё раз через минуту.',
  'La réponse du service est incomplète. Réessayez dans quelques instants.':
    'Ответ сервиса неполный. Попробуйте ещё раз через минуту.',
  'Le service de réservation n’est pas encore configuré.':
    'Сервис записи ещё не настроен.',
  'Le rendez-vous est bien enregistré': 'Запись сохранена',
  'Le nouvel horaire est bien enregistré': 'Новое время сохранено',
  'L’annulation est bien enregistrée': 'Отмена сохранена',
  'Un e-mail confirmant l’annulation est en cours d’envoi.':
    'Письмо с подтверждением отмены отправляется.',
  'Un e-mail avec les détails est en cours d’envoi.':
    'Письмо с подробностями отправляется.',
  'Un e-mail confirmant l’annulation vous a été envoyé.':
    'Вам отправлено письмо с подтверждением отмены.',
  'Un e-mail avec les détails vous a été envoyé.':
    'Вам отправлено письмо с подробностями.',
  '{done}, mais l’e-mail n’a pas pu être envoyé. Les détails restent disponibles ici.':
    '{done}, но письмо не удалось отправить. Подробности доступны здесь.',
  'L’e-mail est retardé. Les détails restent disponibles ici.':
    'Письмо задерживается. Подробности доступны здесь.',
  Réservation: 'Запись',
  Déplacement: 'Перенос',
  'En attente': 'Ожидает',
  'Envoi en cours': 'Отправляется',
  'Accepté par le service d’envoi': 'Принято почтовым сервисом',
  Échec: 'Ошибка',
  'Non envoyé': 'Не отправлено',
  Interrompu: 'Прервано',
  'envoi prévu 30 min après la dernière modification':
    'отправка запланирована через 30 мин после последнего изменения',
  'horaire revenu à celui du dernier e-mail':
    'время возвращено к указанному в последнем письме',
  'nouvel essai prévu': 'запланирована новая попытка',
  'remplacé par un e-mail plus récent': 'заменено более новым письмом',
  'séance déjà commencée': 'сеанс уже начался',
  'environnement de test': 'тестовая среда',
  'adresse invalide': 'неверный адрес',
  'erreurs temporaires': 'временные ошибки',
  'délai du service d’envoi trop long':
    'слишком долгая задержка почтового сервиса',
  'refusé par le service d’envoi': 'отклонено почтовым сервисом',
  'configuration du service d’envoi': 'настройка почтового сервиса',
  'événement invalide': 'неверное событие',
  'traitement interrompu': 'обработка прервана',
  'traitement retardé': 'обработка отложена',
  autre: 'другое',
  Inconnu: 'Неизвестно',
  'E-mail et mot de passe': 'E-mail и пароль',
  Lundi: 'Понедельник',
  Mardi: 'Вторник',
  Mercredi: 'Среда',
  Jeudi: 'Четверг',
  Vendredi: 'Пятница',
  Samedi: 'Суббота',
  Dimanche: 'Воскресенье',
  'Heure invalide : indiquez par exemple 9, 930 ou 09:30 (de 00:00 à 24:00).':
    'Неверное время: введите, например, 9, 930 или 09:30 (от 00:00 до 24:00).',
  'L’heure de fin doit être après l’heure de début.':
    'Время окончания должно быть позже времени начала.',
  '{n} plages au maximum par jour.': 'Не более {n} промежутков в день.',
  'Cette plage chevauche une autre plage du même jour.':
    'Этот промежуток пересекается с другим в тот же день.',
  Matin: 'Утро',
  'Après-midi': 'День',
  Soir: 'Вечер',
  'Montant invalide : indiquez un nombre en euros, par exemple 80 ou 80,50.':
    'Неверная сумма: введите число в евро, например 80 или 80,50.',
  'Ce montant est trop élevé.': 'Сумма слишком большая.',
  'Le montant doit être supérieur à 0 €.': 'Сумма должна быть больше 0 €.',
  'Ce message contient des caractères non autorisés.':
    'Сообщение содержит недопустимые символы.',
  'Un montant': 'Сумма',
  'Un soin': 'Процедура',
  Nouvelle: 'Новый',
  Traitée: 'Обработан',
  Clôturée: 'Закрыт',
  'Prendre en charge': 'Взять в работу',
  Rouvrir: 'Открыть снова',
  'Marquer comme traitée': 'Отметить как обработанный',
  Clôturer: 'Закрыть',
  'Demande reçue': 'Запрос получен',
  'Rouverte ({from} → en cours)': 'Открыт снова ({from} → в работе)',
  'Un compte administrateur ne peut pas demander de carte cadeau.':
    'Учётная запись администратора не может заказать подарочный сертификат.',
  'Connectez-vous ou créez un compte client.':
    'Войдите или создайте учётную запись клиента.',
  'Le numéro de téléphone de votre profil n’est pas valide.':
    'Номер телефона в вашем профиле неверный.',
  'Modifier mon numéro': 'Изменить номер',
  'Connectez-vous ou créez un compte pour demander une carte cadeau.':
    'Войдите или создайте учётную запись, чтобы заказать подарочный сертификат.',
  'Pour envoyer votre demande, confirmez d’abord votre adresse e-mail.':
    'Чтобы отправить запрос, сначала подтвердите адрес e-mail.',
  'Pour envoyer votre demande, ajoutez votre prénom et votre numéro de téléphone à votre profil.':
    'Чтобы отправить запрос, добавьте в профиль своё имя и номер телефона.',
  'Pour envoyer votre demande, corrigez le numéro de téléphone de votre profil.':
    'Чтобы отправить запрос, исправьте номер телефона в профиле.',
  'Pour envoyer votre demande, complétez d’abord votre compte.':
    'Чтобы отправить запрос, сначала заполните учётную запись.',
  'plus tard': 'позже',
  'dans quelques instants': 'через минуту',
  'dans {n} minute|dans {n} minutes': {
    one: 'через {n} минуту',
    few: 'через {n} минуты',
    many: 'через {n} минут',
    other: 'через {n} минут',
  },
  'dans {n} heure|dans {n} heures': {
    one: 'через {n} час',
    few: 'через {n} часа',
    many: 'через {n} часов',
    other: 'через {n} часов',
  },
  'Votre compte doit être complété avant d’envoyer la demande.':
    'Перед отправкой запроса нужно заполнить учётную запись.',
  'Vous avez envoyé plusieurs demandes aujourd’hui. Réessayez {wait}.':
    'Сегодня вы уже отправили несколько запросов. Попробуйте ещё раз {wait}.',
  'Le service est momentanément occupé. Réessayez dans quelques secondes.':
    'Сервис временно занят. Попробуйте ещё раз через несколько секунд.',
  'La demande a changé pendant l’envoi. Vérifiez-la puis renvoyez-la.':
    'Запрос изменился во время отправки. Проверьте его и отправьте снова.',
  'Demande introuvable.': 'Запрос не найден.',
  'Ce changement de statut n’est plus possible : la demande vient d’être mise à jour.':
    'Это изменение статуса уже невозможно: запрос только что обновлён.',
  'Vous êtes inscrit·e à la newsletter. Un e-mail de bienvenue vous a été envoyé.':
    'Вы подписаны на рассылку. Вам отправлено приветственное письмо.',
  'Vous êtes déjà inscrit·e à la newsletter.': 'Вы уже подписаны на рассылку.',
  'Un lien de confirmation vous a été envoyé par e-mail : ouvrez-le pour activer l’inscription.':
    'Вам отправлена ссылка для подтверждения: откройте её, чтобы активировать подписку.',
  'Un e-mail de confirmation a déjà été envoyé récemment. Vous pourrez en demander un nouveau {wait}.':
    'Письмо подтверждения уже недавно отправлено. Новое можно будет запросить {wait}.',
  'Votre demande est déjà enregistrée. Aucun nouvel e-mail n’est nécessaire pour le moment.':
    'Ваш запрос уже сохранён. Новое письмо пока не нужно.',
  'Votre demande a été prise en compte.': 'Ваш запрос учтён.',
  'Newsletter : un lien de confirmation vous a été envoyé par e-mail.':
    'Рассылка: вам отправлена ссылка для подтверждения.',
  'Newsletter : l’e-mail de confirmation n’a pas pu être envoyé. Vous pourrez vous inscrire depuis votre compte.':
    'Рассылка: письмо подтверждения не удалось отправить. Подписаться можно в своём кабинете.',
  'Newsletter : adresse non autorisée sur l’environnement de test.':
    'Рассылка: адрес не разрешён в тестовой среде.',
  'Newsletter : l’inscription n’a pas pu être enregistrée. Vous pourrez vous inscrire depuis votre compte.':
    'Рассылка: подписку не удалось сохранить. Подписаться можно в своём кабинете.',
  'dans {n} seconde|dans {n} secondes': {
    one: 'через {n} секунду',
    few: 'через {n} секунды',
    many: 'через {n} секунд',
    other: 'через {n} секунд',
  },
  'Adresse non autorisée sur l’environnement de test.':
    'Адрес не разрешён в тестовой среде.',
  'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez {wait}.':
    'Письмо подтверждения не удалось отправить. Попробуйте ещё раз {wait}.',
  'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez dans quelques minutes.':
    'Письмо подтверждения не удалось отправить. Попробуйте ещё раз через несколько минут.',
  'Le texte de consentement a changé. Rechargez la page puis réessayez.':
    'Текст согласия изменился. Обновите страницу и попробуйте ещё раз.',
  'Connectez-vous à votre compte pour gérer la newsletter.':
    'Войдите в свой кабинет, чтобы управлять рассылкой.',
  'Confirmez d’abord votre adresse e-mail.':
    'Сначала подтвердите адрес e-mail.',
  'Trop de demandes. Réessayez {wait}.':
    'Слишком много запросов. Попробуйте ещё раз {wait}.',
  'Trop de demandes. Réessayez dans quelques minutes.':
    'Слишком много запросов. Попробуйте ещё раз через несколько минут.',
  'Massages et soins': 'Массажи и процедуры',
  'Cabinet de massage à Bordeaux : massages thérapeutiques et bien-être dans un cadre calme et confidentiel. Réservation en ligne.':
    'Массажный кабинет в Бордо: лечебные и оздоровительные массажи в спокойной, конфиденциальной обстановке. Онлайн-запись.',
  'Mar – Dim, 10h – 19h': 'Вт – Вс, 10:00 – 19:00',
  'En vous inscrivant, vous acceptez de recevoir par e-mail les offres et actualités du cabinet. Un lien de confirmation vous sera envoyé ; désinscription possible à tout moment.':
    'Подписываясь, вы соглашаетесь получать предложения и новости кабинета по электронной почте. Вам отправят ссылку для подтверждения; отписаться можно в любой момент.',
  'Choisir un horaire': 'Выбор времени',
  'E-mail': 'E-mail',
  'Indiquez le montant de la carte cadeau.': 'Укажите сумму сертификата.',
};

export default messages;
