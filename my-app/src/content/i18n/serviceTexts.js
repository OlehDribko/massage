/*
 * Description and features of each API service (one text per duration) in
 * the other languages, keyed by the service id. `fr` is the French text of
 * the API the translation was made from: when the backend text changes,
 * the French text is shown for that service until the translation here is
 * updated (npm run i18n:catalog lists the differences; see README).
 * `group` and `durationMinutes` only help to find a service in this file.
 */
export const SERVICE_TEXTS = {
  '8768f0f0-3e76-4ed6-a273-5dd431a305e5': {
    group: 'tuina-huiles-chaudes',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage inspiré des techniques du Tuina, associant pressions, pétrissages et mouvements glissés grâce à l’utilisation d’une huile tiédie. Un format d’une heure pour une pause corporelle personnalisée.',
      features: [
        'Travail manuel avec huile chaude.',
        'Pression ajustée selon les zones et les sensations.',
        'Signalez toute allergie ou sensibilité : la température et l’huile sont adaptées en conséquence.',
      ],
    },
    en: {
      description:
        'A massage inspired by Tuina techniques, combining pressure, kneading and gliding strokes with warmed oil. A one-hour format for a personalised moment for your body.',
      features: [
        'Manual work with warm oil.',
        'Pressure adjusted to each area and to how it feels.',
        'Let us know about any allergy or sensitivity: the temperature and the oil are adapted accordingly.',
      ],
    },
    uk: {
      description:
        'Масаж, натхненний техніками Туйна, що поєднує натискання, розминання та ковзні рухи з використанням підігрітої олії. Одногодинний формат для персоналізованої паузи для тіла.',
      features: [
        'Ручна робота з теплою олією.',
        'Тиск налаштовується залежно від зон і відчуттів.',
        'Повідомте про будь-яку алергію чи чутливість: температуру й олію буде підібрано відповідно.',
      ],
    },
    ru: {
      description:
        'Массаж, вдохновлённый техниками Туйна, сочетающий надавливания, разминания и скользящие движения с использованием подогретого масла. Часовой формат для персональной паузы для тела.',
      features: [
        'Ручная работа с тёплым маслом.',
        'Давление настраивается в зависимости от зон и ощущений.',
        'Сообщите о любой аллергии или чувствительности: температура и масло будут подобраны соответственно.',
      ],
    },
  },
  '039b509e-baff-4748-bb5e-094ed66a2198': {
    group: 'tuina-huiles-chaudes',
    durationMinutes: 90,
    fr: {
      description:
        'Une version plus longue du massage Tuina aux huiles chaudes, qui laisse davantage de place à l’alternance entre gestes enveloppants et travail ciblé. Le rythme du soin s’adapte à vos préférences.',
      features: [
        'Davantage de temps pour les zones prioritaires.',
        'Association de chaleur, de glissés et de pressions.',
        'Intensité modulable pendant la séance.',
      ],
    },
    en: {
      description:
        'A longer version of the Tuina massage with warm oils, leaving more room to alternate between enveloping strokes and targeted work. The pace of the treatment adapts to your preferences.',
      features: [
        'More time for priority areas.',
        'A combination of warmth, gliding strokes and pressure.',
        'Intensity can be adjusted during the session.',
      ],
    },
    uk: {
      description:
        'Довша версія масажу Туйна з теплими оліями, у якій більше місця для чергування обволікальних рухів і цілеспрямованої роботи. Ритм процедури підлаштовується під ваші побажання.',
      features: [
        'Більше часу для пріоритетних зон.',
        'Поєднання тепла, ковзних рухів і натискань.',
        'Інтенсивність можна змінювати під час сеансу.',
      ],
    },
    ru: {
      description:
        'Более длинная версия массажа Туйна с тёплыми маслами, в которой больше места для чередования обволакивающих движений и целенаправленной работы. Ритм процедуры подстраивается под ваши пожелания.',
      features: [
        'Больше времени для приоритетных зон.',
        'Сочетание тепла, скользящих движений и надавливаний.',
        'Интенсивность можно менять во время сеанса.',
      ],
    },
  },
  'a0f4141c-2f1a-49b4-9ee6-09d15b0853af': {
    group: 'tuina-huiles-chaudes',
    durationMinutes: 120,
    fr: {
      description:
        'Une séance de deux heures pour découvrir le Tuina aux huiles chaudes à un rythme plus posé. Ce format permet de répartir le massage entre différentes zones et de prolonger les séquences selon vos besoins.',
      features: [
        'Format long avec une progression plus étendue.',
        'Temps disponible pour un travail global et ciblé.',
        'Possibilité d’ajuster la pression et le rythme au fil du soin.',
      ],
    },
    en: {
      description:
        'A two-hour session to experience Tuina with warm oils at a more unhurried pace. This format makes it possible to spread the massage over different areas and extend the sequences as you need.',
      features: [
        'A long format with a more gradual progression.',
        'Time for both overall and targeted work.',
        'Pressure and pace can be adjusted throughout the treatment.',
      ],
    },
    uk: {
      description:
        'Двогодинний сеанс, щоб відкрити для себе Туйну з теплими оліями в спокійнішому ритмі. Такий формат дає змогу розподілити масаж між різними зонами й подовжити окремі етапи за потреби.',
      features: [
        'Довгий формат із поступовішим розгортанням.',
        'Час і для загальної, і для цілеспрямованої роботи.',
        'Тиск і ритм можна змінювати впродовж процедури.',
      ],
    },
    ru: {
      description:
        'Двухчасовой сеанс, чтобы открыть для себя Туйну с тёплыми маслами в более спокойном ритме. Такой формат позволяет распределить массаж между разными зонами и продлить отдельные этапы по необходимости.',
      features: [
        'Длинный формат с более постепенным развитием.',
        'Время и для общей, и для целенаправленной работы.',
        'Давление и ритм можно менять на протяжении процедуры.',
      ],
    },
  },
  '69465693-b812-4dab-a100-f1f880b7c1b7': {
    group: 'tuina-sans-huile',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage issu de la tradition chinoise, pratiqué sans huile et fondé sur des pressions, des pétrissages et des gestes rythmés. La séance privilégie le contact manuel et un travail adapté à votre ressenti.',
      features: [
        'Sans huile ni longs mouvements glissés.',
        'Gestes pouvant être toniques.',
        'La tenue conseillée vous est indiquée lors de la prise de rendez-vous.',
      ],
    },
    en: {
      description:
        'A massage from the Chinese tradition, performed without oil and based on pressure, kneading and rhythmic movements. The session focuses on manual contact and work adapted to how you feel.',
      features: [
        'No oil and no long gliding strokes.',
        'Movements can be invigorating.',
        'The recommended clothing is indicated when you book.',
      ],
    },
    uk: {
      description:
        'Масаж китайської традиції, що виконується без олії та ґрунтується на натисканнях, розминаннях і ритмічних рухах. Сеанс зосереджений на ручному контакті та роботі відповідно до ваших відчуттів.',
      features: [
        'Без олії та без довгих ковзних рухів.',
        'Рухи можуть бути тонізувальними.',
        'Рекомендований одяг вам повідомлять під час запису.',
      ],
    },
    ru: {
      description:
        'Массаж китайской традиции, который выполняется без масла и основан на надавливаниях, разминаниях и ритмичных движениях. Сеанс сосредоточен на ручном контакте и работе с учётом ваших ощущений.',
      features: [
        'Без масла и без длинных скользящих движений.',
        'Движения могут быть тонизирующими.',
        'Рекомендуемую одежду вам сообщат при записи.',
      ],
    },
  },
  'fe0523ef-4b29-4c4e-96fa-e8bdbd3f899e': {
    group: 'tuina-sans-huile',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance prolongée de Tuina sans huile pour explorer plusieurs zones du corps et accorder davantage de temps aux endroits que vous souhaitez privilégier. Les gestes et leur intensité sont ajustés tout au long du massage.',
      features: [
        'Travail manuel par pressions et pétrissages.',
        'Plus de temps pour personnaliser la répartition du soin.',
        'Pression adaptée, sans recherche systématique d’intensité.',
      ],
    },
    en: {
      description:
        'An extended oil-free Tuina session to work on several areas of the body and give more time to the places you want to focus on. The movements and their intensity are adjusted throughout the massage.',
      features: [
        'Manual work with pressure and kneading.',
        'More time to personalise how the treatment is shared out.',
        'Adapted pressure, without systematically seeking intensity.',
      ],
    },
    uk: {
      description:
        'Подовжений сеанс Туйни без олії, щоб пропрацювати кілька зон тіла й приділити більше часу місцям, на яких ви хочете зосередитися. Рухи та їхня інтенсивність коригуються впродовж усього масажу.',
      features: [
        'Ручна робота натисканнями та розминаннями.',
        'Більше часу, щоб розподілити процедуру на ваш смак.',
        'Тиск за відчуттями, без постійного прагнення до інтенсивності.',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс Туйны без масла, чтобы проработать несколько зон тела и уделить больше времени местам, на которых вы хотите сосредоточиться. Движения и их интенсивность корректируются на протяжении всего массажа.',
      features: [
        'Ручная работа надавливаниями и разминаниями.',
        'Больше времени, чтобы распределить процедуру на ваш вкус.',
        'Давление по ощущениям, без постоянного стремления к интенсивности.',
      ],
    },
  },
  '81f49f12-7b74-43b2-9dc5-ad1e18c92b59': {
    group: 'tuina-sans-huile',
    durationMinutes: 120,
    fr: {
      description:
        'Un format de deux heures consacré au Tuina traditionnel sans huile. La durée permet une approche progressive, avec une attention particulière au rythme du massage et à vos sensations.',
      features: [
        'Séance longue, organisée autour de vos priorités.',
        'Technique sans huile.',
        'Temps supplémentaire pour les transitions et le travail ciblé.',
      ],
    },
    en: {
      description:
        'A two-hour format dedicated to traditional Tuina without oil. The length allows a gradual approach, with particular attention to the pace of the massage and to your sensations.',
      features: [
        'A long session, built around your priorities.',
        'An oil-free technique.',
        'Extra time for transitions and targeted work.',
      ],
    },
    uk: {
      description:
        'Двогодинний формат традиційної Туйни без олії. Тривалість дає змогу працювати поступово, з особливою увагою до ритму масажу та ваших відчуттів.',
      features: [
        'Довгий сеанс, побудований навколо ваших пріоритетів.',
        'Техніка без олії.',
        'Додатковий час для переходів і цілеспрямованої роботи.',
      ],
    },
    ru: {
      description:
        'Двухчасовой формат традиционной Туйны без масла. Продолжительность позволяет работать постепенно, с особым вниманием к ритму массажа и вашим ощущениям.',
      features: [
        'Длинный сеанс, построенный вокруг ваших приоритетов.',
        'Техника без масла.',
        'Дополнительное время для переходов и целенаправленной работы.',
      ],
    },
  },
  '0a879540-15e2-4e5a-8b8a-ab3ce30cc25e': {
    group: 'premium-femmes',
    durationMinutes: 60,
    fr: {
      description:
        'Une séance de massage destinée aux femmes, pensée comme un moment de bien-être personnalisé. Le contenu du soin est défini avec la praticienne selon vos attentes.',
      features: [
        'Prestation réservée aux femmes.',
        'Zones et pression à convenir avant le massage.',
      ],
    },
    en: {
      description:
        'A massage session for women, designed as a personalised moment of well-being. The content of the treatment is decided with the practitioner according to your expectations.',
      features: [
        'For women only.',
        'Areas and pressure agreed before the massage.',
      ],
    },
    uk: {
      description:
        'Сеанс масажу для жінок, задуманий як персоналізований момент турботи про себе. Зміст процедури визначається разом із майстринею відповідно до ваших очікувань.',
      features: [
        'Послуга лише для жінок.',
        'Зони й тиск узгоджуються перед масажем.',
      ],
    },
    ru: {
      description:
        'Сеанс массажа для женщин, задуманный как персональный момент заботы о себе. Содержание процедуры определяется вместе с мастером в соответствии с вашими ожиданиями.',
      features: [
        'Услуга только для женщин.',
        'Зоны и давление согласовываются до массажа.',
      ],
    },
  },
  '3d21cb0f-5905-4b76-af1c-a0268602ad88': {
    group: 'pierres-chaudes',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage associant le contact des mains à la chaleur de pierres lisses. La chaleur apporte une dimension enveloppante à la séance, avec une température adaptée à votre sensibilité.',
      features: [
        'Utilisation de pierres chauffées.',
        'Température vérifiée et ajustée pendant le soin.',
        'Pose des pierres et utilisation en mouvement selon le protocole pratiqué.',
      ],
    },
    en: {
      description:
        'A massage combining the touch of the hands with the warmth of smooth stones. The heat brings an enveloping quality to the session, at a temperature adapted to your sensitivity.',
      features: [
        'Heated stones.',
        'Temperature checked and adjusted during the treatment.',
        'Stones placed on the body and used in movement, according to the protocol.',
      ],
    },
    uk: {
      description:
        'Масаж, що поєднує дотик рук із теплом гладкого каміння. Тепло надає сеансу обволікального характеру, а температура підбирається відповідно до вашої чутливості.',
      features: [
        'Використання нагрітого каміння.',
        'Температуру перевіряють і коригують під час процедури.',
        'Каміння розкладають на тілі й використовують у русі відповідно до протоколу.',
      ],
    },
    ru: {
      description:
        'Массаж, сочетающий прикосновение рук с теплом гладких камней. Тепло придаёт сеансу обволакивающий характер, а температура подбирается с учётом вашей чувствительности.',
      features: [
        'Использование нагретых камней.',
        'Температуру проверяют и корректируют во время процедуры.',
        'Камни раскладывают на теле и используют в движении в соответствии с протоколом.',
      ],
    },
  },
  '7cbaae05-e433-4087-b64e-fed91195ad2e': {
    group: 'pierres-chaudes',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance prolongée pour profiter de l’alternance entre massage manuel et chaleur des pierres. Le temps supplémentaire permet un déroulement plus ample et une attention accrue aux zones choisies.',
      features: [
        'Association du toucher et de la chaleur.',
        'Format plus long pour un rythme posé.',
        'Possibilité de réduire la chaleur ou de poursuivre sans pierres selon votre confort.',
      ],
    },
    en: {
      description:
        'An extended session to enjoy the alternation between manual massage and the warmth of the stones. The extra time allows a broader flow and closer attention to the chosen areas.',
      features: [
        'Touch and warmth combined.',
        'A longer format for an unhurried pace.',
        'The heat can be reduced, or the massage continued without stones, as you prefer.',
      ],
    },
    uk: {
      description:
        'Подовжений сеанс, щоб насолодитися чергуванням ручного масажу й тепла каміння. Додатковий час дає змогу провести процедуру неквапливіше й приділити більше уваги обраним зонам.',
      features: [
        'Поєднання дотику й тепла.',
        'Довший формат для спокійного ритму.',
        'Тепло можна зменшити або продовжити без каміння — як вам комфортніше.',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс, чтобы насладиться чередованием ручного массажа и тепла камней. Дополнительное время позволяет провести процедуру неспешнее и уделить больше внимания выбранным зонам.',
      features: [
        'Сочетание прикосновения и тепла.',
        'Более длинный формат для спокойного ритма.',
        'Тепло можно уменьшить или продолжить без камней — как вам комфортнее.',
      ],
    },
  },
  '1abe839a-35e1-4322-aec3-c03b3fcd6864': {
    group: 'pierres-chaudes',
    durationMinutes: 120,
    fr: {
      description:
        'Deux heures consacrées à un massage aux pierres chaudes, pour une pause prolongée. La séance alterne les séquences selon le protocole, avec une surveillance régulière de votre confort thermique.',
      features: [
        'Durée étendue avec une progression personnalisée.',
        'Chaleur ajustée tout au long de la séance.',
        'Une durée plus longue ne signifie pas une exposition continue aux pierres.',
      ],
    },
    en: {
      description:
        'Two hours devoted to a hot stone massage, for an extended break. The session alternates sequences according to the protocol, with regular checks on your comfort with the heat.',
      features: [
        'Extended length with a personalised progression.',
        'Heat adjusted throughout the session.',
        'A longer session does not mean continuous contact with the stones.',
      ],
    },
    uk: {
      description:
        'Дві години масажу гарячим камінням — для тривалої паузи. Етапи сеансу чергуються відповідно до протоколу, а ваш тепловий комфорт регулярно перевіряють.',
      features: [
        'Збільшена тривалість з індивідуальним перебігом.',
        'Тепло регулюється впродовж усього сеансу.',
        'Довша тривалість не означає безперервного контакту з камінням.',
      ],
    },
    ru: {
      description:
        'Два часа массажа горячими камнями — для продолжительной паузы. Этапы сеанса чередуются в соответствии с протоколом, а ваш тепловой комфорт регулярно проверяют.',
      features: [
        'Увеличенная продолжительность с индивидуальным ходом сеанса.',
        'Тепло регулируется на протяжении всего сеанса.',
        'Большая продолжительность не означает непрерывного контакта с камнями.',
      ],
    },
  },
  'cf4fb0b1-7b35-455b-8367-e4b422639610': {
    group: 'ayurvedique',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage inspiré de la tradition ayurvédique indienne, pensé comme un moment de détente corporelle. Son déroulement, son rythme et les produits éventuellement utilisés dépendent du protocole proposé par la praticienne.',
      features: [
        'Inspiration ayurvédique.',
        'Approche rythmée et enveloppante selon le protocole.',
        'L’huile utilisée et les zones massées sont précisées avec la praticienne.',
      ],
    },
    en: {
      description:
        'A massage inspired by the Indian Ayurvedic tradition, designed as a moment of physical relaxation. Its course, its pace and any products used depend on the protocol offered by the practitioner.',
      features: [
        'Ayurvedic inspiration.',
        'A rhythmic, enveloping approach, depending on the protocol.',
        'The oil used and the areas massaged are discussed with the practitioner.',
      ],
    },
    uk: {
      description:
        'Масаж, натхненний індійською аюрведичною традицією, задуманий як момент тілесного розслаблення. Його перебіг, ритм і засоби, які можуть використовуватися, залежать від протоколу, запропонованого майстринею.',
      features: [
        'Натхнення аюрведою.',
        'Ритмічний, обволікальний підхід залежно від протоколу.',
        'Олію та зони масажу уточнюють із майстринею.',
      ],
    },
    ru: {
      description:
        'Массаж, вдохновлённый индийской аюрведической традицией и задуманный как момент телесного расслабления. Его ход, ритм и средства, которые могут использоваться, зависят от протокола, предложенного мастером.',
      features: [
        'Вдохновение аюрведой.',
        'Ритмичный, обволакивающий подход в зависимости от протокола.',
        'Масло и зоны массажа уточняются с мастером.',
      ],
    },
  },
  '40c8f682-6222-4cd0-b6aa-d3bcfb2a80d3': {
    group: 'ayurvedique',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance prolongée de massage d’inspiration ayurvédique pour profiter d’un rythme plus ample et d’un temps de détente plus long. Le soin est organisé selon le protocole pratiqué et vos préférences.',
      features: [
        'Davantage de temps pour dérouler le massage.',
        'Rythme et pression personnalisables.',
      ],
    },
    en: {
      description:
        'An extended Ayurvedic-inspired massage session, with a broader rhythm and a longer time to relax. The treatment follows the protocol used and your preferences.',
      features: [
        'More time for the massage to unfold.',
        'Pace and pressure can be personalised.',
      ],
    },
    uk: {
      description:
        'Подовжений сеанс масажу в аюрведичному стилі — із ширшим ритмом і довшим часом для розслаблення. Процедура будується відповідно до протоколу та ваших побажань.',
      features: [
        'Більше часу, щоб масаж розгорнувся повністю.',
        'Ритм і тиск можна налаштувати під вас.',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс массажа в аюрведическом стиле — с более широким ритмом и более долгим временем для расслабления. Процедура строится в соответствии с протоколом и вашими пожеланиями.',
      features: [
        'Больше времени, чтобы массаж раскрылся полностью.',
        'Ритм и давление можно настроить под вас.',
      ],
    },
  },
  '2703c0d8-c30a-49d7-bd41-bc51179dd22f': {
    group: 'tete-aux-pieds',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage global pour s’accorder une pause et porter attention à l’ensemble du corps. La séance répartit le temps entre différentes régions, de la tête jusqu’aux pieds, selon le déroulement convenu.',
      features: [
        'Approche globale plutôt que centrée sur une seule zone.',
        'Répartition du temps adaptée à vos préférences.',
        'Zones incluses et zones que vous souhaitez éviter convenues avant le soin.',
      ],
    },
    en: {
      description:
        'A full-body massage to take a break and pay attention to the whole body. The session shares its time between different regions, from head to toe, as agreed.',
      features: [
        'An overall approach rather than one focused on a single area.',
        'Time shared out according to your preferences.',
        'Areas included and areas you wish to avoid are agreed before the treatment.',
      ],
    },
    uk: {
      description:
        'Загальний масаж, щоб зробити паузу й приділити увагу всьому тілу. Час сеансу розподіляється між різними частинами тіла — від голови до ніг — відповідно до домовленого перебігу.',
      features: [
        'Цілісний підхід, а не зосередження на одній зоні.',
        'Розподіл часу відповідно до ваших побажань.',
        'Зони, які включаються, і ті, яких ви хочете уникнути, узгоджуються перед процедурою.',
      ],
    },
    ru: {
      description:
        'Общий массаж, чтобы сделать паузу и уделить внимание всему телу. Время сеанса распределяется между разными частями тела — с головы до ног — в соответствии с оговорённым ходом.',
      features: [
        'Целостный подход, а не сосредоточение на одной зоне.',
        'Распределение времени в соответствии с вашими пожеланиями.',
        'Зоны, которые включаются, и те, которых вы хотите избежать, согласовываются до процедуры.',
      ],
    },
  },
  'c438d102-95ae-4c7d-9dda-87cf966d3efd': {
    group: 'tete-aux-pieds',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance globale plus longue pour prendre le temps de passer d’une région du corps à l’autre. Ce format permet de conserver une approche d’ensemble tout en accordant davantage d’attention à certaines zones.',
      features: [
        'Plus de temps pour les transitions et les séquences de massage.',
        'Possibilité de privilégier une région sans limiter toute la séance à celle-ci.',
        'Rythme et pression ajustables.',
      ],
    },
    en: {
      description:
        'A longer full-body session that takes time to move from one region of the body to another. This format keeps an overall approach while giving more attention to certain areas.',
      features: [
        'More time for transitions and massage sequences.',
        'You can favour one region without limiting the whole session to it.',
        'Adjustable pace and pressure.',
      ],
    },
    uk: {
      description:
        'Довший загальний сеанс, щоб неквапливо переходити від однієї частини тіла до іншої. Такий формат зберігає цілісний підхід і водночас дає змогу приділити більше уваги окремим зонам.',
      features: [
        'Більше часу для переходів і етапів масажу.',
        'Можна зосередитися на одній зоні, не обмежуючи нею весь сеанс.',
        'Ритм і тиск можна регулювати.',
      ],
    },
    ru: {
      description:
        'Более длинный общий сеанс, чтобы неспешно переходить от одной части тела к другой. Такой формат сохраняет целостный подход и в то же время позволяет уделить больше внимания отдельным зонам.',
      features: [
        'Больше времени для переходов и этапов массажа.',
        'Можно сосредоточиться на одной зоне, не ограничивая ею весь сеанс.',
        'Ритм и давление можно регулировать.',
      ],
    },
  },
  'b84f23ba-773d-4ff2-b128-10a1ee22a4cf': {
    group: 'tete-aux-pieds',
    durationMinutes: 120,
    fr: {
      description:
        'Deux heures consacrées à un massage global, pour une expérience plus longue et progressive. La séance laisse de la place à vos priorités, tout en conservant un parcours corporel d’ensemble.',
      features: [
        'Format long pour une pause prolongée.',
        'Répartition personnalisée entre les différentes zones.',
        'Intensité définie selon votre confort, indépendamment de la durée.',
      ],
    },
    en: {
      description:
        'Two hours devoted to a full-body massage, for a longer, more gradual experience. The session leaves room for your priorities while keeping an overall journey through the body.',
      features: [
        'A long format for an extended break.',
        'A personalised split between the different areas.',
        'Intensity set according to your comfort, regardless of the length.',
      ],
    },
    uk: {
      description:
        'Дві години загального масажу — для довшого й поступовішого досвіду. Сеанс залишає місце для ваших пріоритетів, зберігаючи при цьому цілісну роботу з усім тілом.',
      features: [
        'Довгий формат для тривалої паузи.',
        'Індивідуальний розподіл між різними зонами.',
        'Інтенсивність визначається вашим комфортом, незалежно від тривалості.',
      ],
    },
    ru: {
      description:
        'Два часа общего массажа — для более долгого и постепенного опыта. Сеанс оставляет место для ваших приоритетов, сохраняя при этом целостную работу со всем телом.',
      features: [
        'Длинный формат для продолжительной паузы.',
        'Индивидуальное распределение между разными зонами.',
        'Интенсивность определяется вашим комфортом, независимо от продолжительности.',
      ],
    },
  },
  '11a5f7a9-4e3a-4fe1-bfcb-ad85073b7ec4': {
    group: 'sportif',
    durationMinutes: 55,
    fr: {
      description:
        'Un massage orienté vers les zones sollicitées par votre activité physique. La séance est adaptée à votre pratique, au moment choisi par rapport à l’effort et aux sensations que vous souhaitez prendre en compte.',
      features: [
        'Travail ciblé selon l’activité pratiquée.',
        'Pression et rythme ajustés au contexte.',
        'Ne remplace pas l’évaluation ou la rééducation d’une blessure.',
      ],
    },
    en: {
      description:
        'A massage focused on the areas worked by your physical activity. The session is adapted to your sport, to its timing relative to exercise and to the sensations you want taken into account.',
      features: [
        'Targeted work depending on your activity.',
        'Pressure and pace adjusted to the context.',
        'Does not replace the assessment or rehabilitation of an injury.',
      ],
    },
    uk: {
      description:
        'Масаж, спрямований на зони, які навантажує ваша фізична активність. Сеанс адаптується до вашого виду спорту, до того, коли він відбувається відносно тренування, і до відчуттів, які ви хочете врахувати.',
      features: [
        'Цілеспрямована робота залежно від виду активності.',
        'Тиск і ритм відповідно до ситуації.',
        'Не замінює діагностики чи реабілітації після травми.',
      ],
    },
    ru: {
      description:
        'Массаж, направленный на зоны, которые нагружает ваша физическая активность. Сеанс адаптируется к вашему виду спорта, к тому, когда он проходит относительно тренировки, и к ощущениям, которые вы хотите учесть.',
      features: [
        'Целенаправленная работа в зависимости от вида активности.',
        'Давление и ритм в соответствии с ситуацией.',
        'Не заменяет диагностики или реабилитации после травмы.',
      ],
    },
  },
  'dea5ef63-6ab1-4338-aa05-2fab089ee070': {
    group: 'sportif',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance prolongée pour travailler plusieurs groupes musculaires ou accorder davantage de temps aux zones prioritaires. Le contenu est défini selon votre activité et votre état de fatigue du jour.',
      features: [
        'Temps disponible pour plusieurs régions du corps.',
        'Approche ciblée plutôt qu’une pression forte systématique.',
        'Séance à adapter si une douleur inhabituelle ou une blessure est présente.',
      ],
    },
    en: {
      description:
        'An extended session to work on several muscle groups or give more time to priority areas. The content depends on your activity and on how tired you are that day.',
      features: [
        'Time for several regions of the body.',
        'A targeted approach rather than systematically strong pressure.',
        'The session is adapted if unusual pain or an injury is present.',
      ],
    },
    uk: {
      description:
        "Подовжений сеанс, щоб пропрацювати кілька груп м'язів або приділити більше часу пріоритетним зонам. Зміст визначається вашою активністю та рівнем утоми цього дня.",
      features: [
        'Час для кількох ділянок тіла.',
        'Цілеспрямований підхід замість постійного сильного тиску.',
        'Сеанс адаптується, якщо є незвичний біль або травма.',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс, чтобы проработать несколько групп мышц или уделить больше времени приоритетным зонам. Содержание определяется вашей активностью и уровнем усталости в этот день.',
      features: [
        'Время для нескольких участков тела.',
        'Целенаправленный подход вместо постоянного сильного давления.',
        'Сеанс адаптируется, если есть необычная боль или травма.',
      ],
    },
  },
  'e416e435-88a8-458c-8737-3f9b5b9b5e6f': {
    group: 'sportif',
    durationMinutes: 120,
    fr: {
      description:
        'Un format de deux heures pour un massage sportif plus étendu, combinant une attention globale et des séquences ciblées. La séance progresse selon vos priorités, sans chercher à multiplier les gestes intenses.',
      features: [
        'Répartition du travail entre plusieurs groupes musculaires.',
        'Ajustement de l’intensité au fil de la séance.',
        'Aucun engagement de performance ou de récupération accélérée.',
      ],
    },
    en: {
      description:
        'A two-hour format for a more extensive sports massage, combining overall attention with targeted sequences. The session progresses according to your priorities, without piling up intense movements.',
      features: [
        'Work shared between several muscle groups.',
        'Intensity adjusted as the session goes on.',
        'No promise of performance or faster recovery.',
      ],
    },
    uk: {
      description:
        'Двогодинний формат для ширшого спортивного масажу, що поєднує загальну увагу до тіла й цілеспрямовані етапи. Сеанс розгортається відповідно до ваших пріоритетів, без нагромадження інтенсивних рухів.',
      features: [
        "Розподіл роботи між кількома групами м'язів.",
        'Інтенсивність коригується впродовж сеансу.',
        'Без обіцянок щодо результатів чи пришвидшеного відновлення.',
      ],
    },
    ru: {
      description:
        'Двухчасовой формат для более обширного спортивного массажа, сочетающего общее внимание к телу и целенаправленные этапы. Сеанс развивается в соответствии с вашими приоритетами, без нагромождения интенсивных движений.',
      features: [
        'Распределение работы между несколькими группами мышц.',
        'Интенсивность корректируется по ходу сеанса.',
        'Без обещаний по результатам или ускоренному восстановлению.',
      ],
    },
  },
  '570a1b88-f7e4-43e7-9e25-23455764aa74': {
    group: 'enfant',
    durationMinutes: 30,
    fr: {
      description:
        'Un temps de massage adapté à l’âge, à la sensibilité et au rythme de l’enfant. La séance privilégie des gestes doux et une communication simple, en respectant son envie de poursuivre ou de s’arrêter.',
      features: [
        'À partir de 6 ans.',
        'Accord du représentant légal et assentiment de l’enfant.',
        'Présence d’un adulte accompagnant et déroulement convenus avant le rendez-vous.',
      ],
    },
    en: {
      description:
        "A massage adapted to the child's age, sensitivity and pace. The session favours gentle movements and simple communication, respecting whether the child wants to continue or stop.",
      features: [
        'From age 6.',
        'Consent of the legal guardian and agreement of the child.',
        'An accompanying adult and how the session runs are agreed before the appointment.',
      ],
    },
    uk: {
      description:
        "Масаж, адаптований до віку, чутливості та ритму дитини. Сеанс надає перевагу м'яким рухам і простому спілкуванню, з повагою до бажання дитини продовжити чи зупинитися.",
      features: [
        'Від 6 років.',
        'Згода законного представника та згода самої дитини.',
        'Присутність дорослого супровідника й перебіг сеансу узгоджуються до візиту.',
      ],
    },
    ru: {
      description:
        'Массаж, адаптированный к возрасту, чувствительности и ритму ребёнка. Сеанс отдаёт предпочтение мягким движениям и простому общению, с уважением к желанию ребёнка продолжить или остановиться.',
      features: [
        'С 6 лет.',
        'Согласие законного представителя и согласие самого ребёнка.',
        'Присутствие сопровождающего взрослого и ход сеанса согласовываются до визита.',
      ],
    },
  },
  'e0a4be32-524f-49e3-b525-1051092007d3': {
    group: 'reflexologie-plantaire',
    durationMinutes: 30,
    fr: {
      description:
        'Une séance centrée sur les pieds, avec des pressions sur différentes zones de la plante et des mouvements de massage. Un format court pour apprécier un travail localisé et s’accorder un moment de détente.',
      features: [
        'Travail principalement réalisé sur les pieds.',
        'Pressions adaptées à leur sensibilité.',
        'Ne constitue ni un diagnostic ni un traitement médical.',
      ],
    },
    en: {
      description:
        'A session focused on the feet, with pressure on different areas of the sole and massage movements. A short format to enjoy localised work and take a moment to relax.',
      features: [
        'Work mainly on the feet.',
        'Pressure adapted to their sensitivity.',
        'Is neither a diagnosis nor a medical treatment.',
      ],
    },
    uk: {
      description:
        'Сеанс для стоп із натисканням на різні зони підошви та масажними рухами. Короткий формат, щоб насолодитися локальною роботою та подарувати собі момент розслаблення.',
      features: [
        'Робота переважно зі стопами.',
        'Тиск, адаптований до їхньої чутливості.',
        'Не є ні діагностикою, ні медичним лікуванням.',
      ],
    },
    ru: {
      description:
        'Сеанс для стоп с надавливанием на разные зоны подошвы и массажными движениями. Короткий формат, чтобы насладиться локальной работой и подарить себе момент расслабления.',
      features: [
        'Работа преимущественно со стопами.',
        'Давление, адаптированное к их чувствительности.',
        'Не является ни диагностикой, ни медицинским лечением.',
      ],
    },
  },
  '696afe81-79e4-4114-961c-af875229a2b1': {
    group: 'dos',
    durationMinutes: 30,
    fr: {
      description:
        'Une demi-heure consacrée au dos, du haut des épaules à la région lombaire. Le massage est organisé selon vos préférences, avec davantage de temps sur les zones que vous souhaitez privilégier.',
      features: [
        'Format ciblé, sans massage complet du corps.',
        'Alternance de gestes larges et de travail localisé selon la pratique.',
        'Intensité adaptée à votre ressenti.',
      ],
    },
    en: {
      description:
        'Half an hour devoted to the back, from the tops of the shoulders to the lower back. The massage is organised according to your preferences, with more time on the areas you want to focus on.',
      features: [
        'A targeted format, without a full-body massage.',
        'Broad strokes alternating with localised work, depending on the practice.',
        'Intensity adapted to how you feel.',
      ],
    },
    uk: {
      description:
        'Пів години для спини — від верхньої частини плечей до попереку. Масаж будується відповідно до ваших побажань, з більшою увагою до зон, яким ви хочете приділити час.',
      features: [
        'Цілеспрямований формат, без масажу всього тіла.',
        'Чергування широких рухів і локальної роботи залежно від техніки.',
        'Інтенсивність відповідно до ваших відчуттів.',
      ],
    },
    ru: {
      description:
        'Полчаса для спины — от верхней части плеч до поясницы. Массаж строится в соответствии с вашими пожеланиями, с большим вниманием к зонам, которым вы хотите уделить время.',
      features: [
        'Целенаправленный формат, без массажа всего тела.',
        'Чередование широких движений и локальной работы в зависимости от техники.',
        'Интенсивность в соответствии с вашими ощущениями.',
      ],
    },
  },
  '353c5f3d-62d3-43e1-a9f4-65181e356e6b': {
    group: 'tete-cou-trapezes',
    durationMinutes: 30,
    fr: {
      description:
        'Un massage ciblé sur la tête, la nuque et le haut des épaules. Une courte pause pour porter attention à ces zones souvent sollicitées dans les activités quotidiennes.',
      features: [
        'Séance localisée sur le haut du corps.',
        'Pression adaptée aux zones sensibles.',
        'Massage du cuir chevelu et utilisation d’huile convenus avant la séance.',
      ],
    },
    en: {
      description:
        'A massage focused on the head, the back of the neck and the tops of the shoulders. A short break to care for areas that are often under strain in everyday life.',
      features: [
        'A session focused on the upper body.',
        'Pressure adapted to sensitive areas.',
        'Scalp massage and the use of oil are agreed before the session.',
      ],
    },
    uk: {
      description:
        'Масаж, зосереджений на голові, потилиці та верхній частині плечей. Коротка пауза, щоб приділити увагу зонам, які часто напружуються в повсякденному житті.',
      features: [
        'Локальний сеанс для верхньої частини тіла.',
        'Тиск, адаптований до чутливих зон.',
        'Масаж шкіри голови та використання олії узгоджуються перед сеансом.',
      ],
    },
    ru: {
      description:
        'Массаж, сосредоточенный на голове, затылке и верхней части плеч. Короткая пауза, чтобы уделить внимание зонам, которые часто напрягаются в повседневной жизни.',
      features: [
        'Локальный сеанс для верхней части тела.',
        'Давление, адаптированное к чувствительным зонам.',
        'Массаж кожи головы и использование масла согласовываются до сеанса.',
      ],
    },
  },
  '57f78078-f65b-4723-b20b-aad89495c898': {
    group: 'endospheres',
    durationMinutes: 45,
    fr: {
      description:
        'Une séance de massage mécanique Endosphères consacrée à une partie du corps. L’appareil associe compression et microvibrations pour un travail esthétique ciblé, dont les réglages et les zones sont définis avec la praticienne.',
      features: [
        'Technique réalisée avec un appareil, différente d’un massage manuel.',
        'Format demi-corps : les zones traitées sont convenues avec la praticienne avant la séance.',
        'Une séance individuelle, sans engagement dans une cure ni résultat garanti.',
      ],
    },
    en: {
      description:
        'A mechanical Endospheres massage session focused on one part of the body. The device combines compression and micro-vibrations for targeted aesthetic work; the settings and areas are agreed with the practitioner.',
      features: [
        'A device-based technique, different from a manual massage.',
        'Half-body format: the areas treated are agreed with the practitioner before the session.',
        'A single session, with no commitment to a course and no guaranteed result.',
      ],
    },
    uk: {
      description:
        'Сеанс механічного масажу Endospheres для однієї частини тіла. Апарат поєднує компресію та мікровібрацію для цілеспрямованої естетичної роботи; налаштування й зони узгоджуються з майстринею.',
      features: [
        'Техніка з використанням апарата, відмінна від ручного масажу.',
        'Формат «половина тіла»: зони обробки узгоджуються з майстринею перед сеансом.',
        "Один окремий сеанс, без зобов'язання проходити курс і без гарантованого результату.",
      ],
    },
    ru: {
      description:
        'Сеанс механического массажа Endospheres для одной части тела. Аппарат сочетает компрессию и микровибрацию для целенаправленной эстетической работы; настройки и зоны согласовываются с мастером.',
      features: [
        'Аппаратная техника, отличающаяся от ручного массажа.',
        'Формат «половина тела»: обрабатываемые зоны согласовываются с мастером до сеанса.',
        'Один отдельный сеанс, без обязательства проходить курс и без гарантированного результата.',
      ],
    },
  },
  '97b3295d-8d7e-4c7f-a8a8-bbe1df1af633': {
    group: 'maderotherapie',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage réalisé à l’aide d’accessoires en bois, utilisés pour effectuer des mouvements de roulement, de pression et de modelage. Cette séance propose un travail corporel rythmé, ajusté aux zones choisies et à votre sensibilité.',
      features: [
        'Utilisation d’outils en bois de différentes formes.',
        'Sensations plus toniques qu’un massage de relaxation.',
        'Zones et intensité à convenir avec la praticienne.',
      ],
    },
    en: {
      description:
        'A massage performed with wooden tools, used for rolling, pressing and shaping movements. This session offers rhythmic bodywork, adjusted to the chosen areas and to your sensitivity.',
      features: [
        'Wooden tools of different shapes.',
        'A more invigorating feel than a relaxation massage.',
        'Areas and intensity agreed with the practitioner.',
      ],
    },
    uk: {
      description:
        "Масаж за допомогою дерев'яних інструментів, якими виконують прокатування, натискання й моделювання. Сеанс пропонує ритмічну роботу з тілом, налаштовану під обрані зони та вашу чутливість.",
      features: [
        "Дерев'яні інструменти різної форми.",
        'Відчуття більш тонізувальні, ніж під час розслаблювального масажу.',
        'Зони та інтенсивність узгоджуються з майстринею.',
      ],
    },
    ru: {
      description:
        'Массаж с помощью деревянных инструментов, которыми выполняют прокатывание, надавливание и моделирование. Сеанс предлагает ритмичную работу с телом, настроенную под выбранные зоны и вашу чувствительность.',
      features: [
        'Деревянные инструменты разной формы.',
        'Ощущения более тонизирующие, чем при расслабляющем массаже.',
        'Зоны и интенсивность согласовываются с мастером.',
      ],
    },
  },
  '0eb52a15-863f-4981-8354-e1a4ab84c088': {
    group: 'maderotherapie',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance prolongée de madérothérapie pour consacrer davantage de temps aux zones sélectionnées. Les accessoires en bois permettent de varier les gestes, avec une progression adaptée à votre confort.',
      features: [
        'Plus de temps pour répartir le travail entre plusieurs zones.',
        'Alternance de mouvements et de rythmes.',
        'Une durée plus longue n’implique pas une pression plus forte.',
      ],
    },
    en: {
      description:
        'An extended maderotherapy session that gives more time to the chosen areas. The wooden tools allow a variety of movements, with a progression adjusted to your comfort.',
      features: [
        'More time to share the work between several areas.',
        'Alternating movements and rhythms.',
        'A longer session does not mean stronger pressure.',
      ],
    },
    uk: {
      description:
        "Подовжений сеанс мадеротерапії, щоб приділити більше часу обраним зонам. Дерев'яні інструменти дають змогу урізноманітнити рухи, а інтенсивність зростає поступово й відповідно до вашого комфорту.",
      features: [
        'Більше часу, щоб розподілити роботу між кількома зонами.',
        'Чергування рухів і ритмів.',
        'Довша тривалість не означає сильнішого тиску.',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс мадеротерапии, чтобы уделить больше времени выбранным зонам. Деревянные инструменты позволяют разнообразить движения, а интенсивность нарастает постепенно и с учётом вашего комфорта.',
      features: [
        'Больше времени, чтобы распределить работу между несколькими зонами.',
        'Чередование движений и ритмов.',
        'Большая продолжительность не означает более сильного давления.',
      ],
    },
  },
  'ca2c3570-e81f-4410-b447-7fc90618da8f': {
    group: 'drainage-lymphatique',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage aux gestes légers et rythmés, avec une attention portée au travail superficiel de la peau. Cette séance privilégie une approche douce, différente des massages musculaires profonds.',
      features: [
        'Pressions légères et mouvements répétitifs.',
        'Absence de pétrissage musculaire intense.',
        'En cas de lymphœdème ou de problème de santé, demandez l’avis de votre médecin avant la séance.',
      ],
    },
    en: {
      description:
        'A massage with light, rhythmic movements, focusing on superficial work on the skin. This session favours a gentle approach, different from deep muscle massages.',
      features: [
        'Light pressure and repetitive movements.',
        'No intense muscle kneading.',
        "If you have lymphoedema or a health problem, ask your doctor's advice before the session.",
      ],
    },
    uk: {
      description:
        "Масаж легкими ритмічними рухами з увагою до поверхневої роботи зі шкірою. Сеанс надає перевагу м'якому підходу, відмінному від глибоких м'язових масажів.",
      features: [
        'Легкі натискання та повторювані рухи.',
        "Без інтенсивного розминання м'язів.",
        "У разі лімфедеми чи проблем зі здоров'ям перед сеансом порадьтеся з лікарем.",
      ],
    },
    ru: {
      description:
        'Массаж лёгкими ритмичными движениями с вниманием к поверхностной работе с кожей. Сеанс отдаёт предпочтение мягкому подходу, отличному от глубоких мышечных массажей.',
      features: [
        'Лёгкие надавливания и повторяющиеся движения.',
        'Без интенсивного разминания мышц.',
        'При лимфедеме или проблемах со здоровьем перед сеансом посоветуйтесь с врачом.',
      ],
    },
  },
  '713d9d2a-c90e-42e3-a224-99390862f856': {
    group: 'drainage-lymphatique',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance de drainage lymphatique prolongée pour consacrer davantage de temps aux zones prévues dans le protocole. Les mouvements restent légers et réguliers, sans rechercher une pression profonde.',
      features: [
        'Format plus long avec une gestuelle douce.',
        'Temps supplémentaire pour suivre le protocole.',
        'Ce soin ne vise ni la perte de poids ni une « détox ».',
      ],
    },
    en: {
      description:
        'An extended lymphatic drainage session that gives more time to the areas covered by the protocol. The movements stay light and regular, without seeking deep pressure.',
      features: [
        'A longer format with gentle movements.',
        'Extra time to follow the protocol.',
        'This treatment is not aimed at weight loss or a « detox ».',
      ],
    },
    uk: {
      description:
        'Подовжений сеанс лімфодренажу, щоб приділити більше часу зонам, передбаченим протоколом. Рухи залишаються легкими й рівномірними, без глибокого тиску.',
      features: [
        "Довший формат із м'якими рухами.",
        'Додатковий час, щоб дотримуватися протоколу.',
        'Ця процедура не спрямована ні на схуднення, ні на «детокс».',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс лимфодренажа, чтобы уделить больше времени зонам, предусмотренным протоколом. Движения остаются лёгкими и равномерными, без глубокого давления.',
      features: [
        'Более длинный формат с мягкими движениями.',
        'Дополнительное время, чтобы следовать протоколу.',
        'Эта процедура не направлена ни на похудение, ни на «детокс».',
      ],
    },
  },
  'c513a89e-712f-4462-83d0-3b1a08df1f92': {
    group: 'drainage-lymphatique',
    durationMinutes: 120,
    fr: {
      description:
        'Un format de deux heures permettant de dérouler le protocole de drainage à un rythme posé. La répartition du soin est définie avec la praticienne selon les zones concernées et l’adéquation de la prestation à votre situation.',
      features: [
        'Durée étendue, sans augmentation nécessaire de la pression.',
        'Gestes superficiels et rythmés.',
        'Ne remplace pas un suivi médical lorsqu’un gonflement nécessite une évaluation.',
      ],
    },
    en: {
      description:
        'A two-hour format that allows the drainage protocol to unfold at an unhurried pace. How the treatment is shared out is decided with the practitioner, according to the areas concerned and whether the service suits your situation.',
      features: [
        'Extended length, with no need for stronger pressure.',
        'Superficial, rhythmic movements.',
        'Does not replace medical follow-up when swelling needs to be assessed.',
      ],
    },
    uk: {
      description:
        'Двогодинний формат, що дає змогу виконати протокол дренажу в спокійному ритмі. Розподіл процедури визначається разом із майстринею — залежно від зон і того, чи підходить ця послуга у вашій ситуації.',
      features: [
        'Збільшена тривалість без потреби посилювати тиск.',
        'Поверхневі, ритмічні рухи.',
        'Не замінює медичного нагляду, якщо набряк потребує оцінки лікаря.',
      ],
    },
    ru: {
      description:
        'Двухчасовой формат, позволяющий выполнить протокол дренажа в спокойном ритме. Распределение процедуры определяется вместе с мастером — в зависимости от зон и того, подходит ли эта услуга в вашей ситуации.',
      features: [
        'Увеличенная продолжительность без необходимости усиливать давление.',
        'Поверхностные, ритмичные движения.',
        'Не заменяет медицинского наблюдения, если отёк требует оценки врача.',
      ],
    },
  },
  '9b081644-29e6-496a-9303-6e07a12966d4': {
    group: 'prenatal',
    durationMinutes: 60,
    fr: {
      description:
        'Un massage de bien-être adapté à la grossesse, avec une installation choisie pour votre confort. Le déroulement tient compte du stade de la grossesse, de votre sensibilité et des éventuelles recommandations de votre suivi médical.',
      features: [
        'Positions adaptées, sans pression sur l’abdomen.',
        'Gestes et intensité spécifiques à la situation.',
        'Stade de grossesse accepté à vérifier auprès du cabinet avant la réservation.',
      ],
    },
    en: {
      description:
        'A well-being massage adapted to pregnancy, with a position chosen for your comfort. The session takes into account the stage of pregnancy, your sensitivity and any recommendations from your medical follow-up.',
      features: [
        'Adapted positions, with no pressure on the abdomen.',
        'Movements and intensity specific to your situation.',
        'Please check with the practice which stages of pregnancy are accepted before booking.',
      ],
    },
    uk: {
      description:
        'Масаж для гарного самопочуття, адаптований до вагітності, у положенні, вибраному для вашого комфорту. Перебіг сеансу враховує термін вагітності, вашу чутливість і можливі рекомендації лікаря, який вас спостерігає.',
      features: [
        'Адаптовані положення, без тиску на живіт.',
        'Рухи й інтенсивність відповідно до вашої ситуації.',
        'Перед записом уточніть у кабінеті, на якому терміні вагітності можна прийти.',
      ],
    },
    ru: {
      description:
        'Массаж для хорошего самочувствия, адаптированный к беременности, в положении, выбранном для вашего комфорта. Ход сеанса учитывает срок беременности, вашу чувствительность и возможные рекомендации наблюдающего врача.',
      features: [
        'Адаптированные положения, без давления на живот.',
        'Движения и интенсивность в соответствии с вашей ситуацией.',
        'Перед записью уточните в кабинете, на каком сроке беременности можно прийти.',
      ],
    },
  },
  '3dd3ebdd-da7b-4ca2-9f13-3a46d96be6f4': {
    group: 'postnatal',
    durationMinutes: 60,
    fr: {
      description:
        'Une parenthèse de bien-être après la naissance, adaptée à votre confort et à votre récupération du moment. Les positions, les zones massées et la pression sont convenues avant la séance.',
      features: [
        'Installation adaptée à la période postnatale.',
        'Prise en compte des zones sensibles et des préférences personnelles.',
        'Le moment de la première séance dépend des suites de l’accouchement et de l’avis de votre soignant.',
      ],
    },
    en: {
      description:
        'A moment of well-being after giving birth, adapted to your comfort and to your recovery at this stage. Positions, the areas massaged and the pressure are agreed before the session.',
      features: [
        'A set-up adapted to the postnatal period.',
        'Sensitive areas and personal preferences are taken into account.',
        "When the first session can take place depends on how the birth went and on your healthcare provider's advice.",
      ],
    },
    uk: {
      description:
        'Момент турботи про себе після пологів, адаптований до вашого комфорту й відновлення на цьому етапі. Положення, зони масажу й тиск узгоджуються перед сеансом.',
      features: [
        'Положення, адаптоване до післяпологового періоду.',
        'Врахування чутливих зон і особистих побажань.',
        'Час першого сеансу залежить від перебігу післяпологового періоду та поради вашого лікаря.',
      ],
    },
    ru: {
      description:
        'Момент заботы о себе после родов, адаптированный к вашему комфорту и восстановлению на этом этапе. Положение, зоны массажа и давление согласовываются до сеанса.',
      features: [
        'Положение, адаптированное к послеродовому периоду.',
        'Учёт чувствительных зон и личных пожеланий.',
        'Время первого сеанса зависит от течения послеродового периода и совета вашего врача.',
      ],
    },
  },
  '2bdfa0e1-5556-46a7-869a-ef48114dc07c': {
    group: 'postnatal',
    durationMinutes: 90,
    fr: {
      description:
        'Une séance postnatale plus longue pour prendre le temps de s’installer et de recevoir un massage à un rythme confortable. Le déroulement reste flexible, selon votre fatigue et vos besoins du jour.',
      features: [
        'Davantage de temps pour l’installation et le massage.',
        'Possibilité d’adapter les positions et de prévoir des pauses.',
        'Venue avec bébé : renseignez-vous auprès du cabinet avant la réservation.',
      ],
    },
    en: {
      description:
        'A longer postnatal session to take time to settle in and receive a massage at a comfortable pace. The session stays flexible, depending on how tired you are and what you need that day.',
      features: [
        'More time to settle in and for the massage.',
        'Positions can be adapted and breaks planned.',
        'Coming with your baby: please ask the practice before booking.',
      ],
    },
    uk: {
      description:
        'Довший післяпологовий сеанс, щоб без поспіху влаштуватися й отримати масаж у комфортному ритмі. Перебіг залишається гнучким — залежно від вашої втоми та потреб цього дня.',
      features: [
        'Більше часу, щоб влаштуватися, і на сам масаж.',
        'Можна змінювати положення й робити перерви.',
        'Якщо хочете прийти з малюком, уточніть це в кабінеті перед записом.',
      ],
    },
    ru: {
      description:
        'Более длинный послеродовой сеанс, чтобы без спешки устроиться и получить массаж в комфортном ритме. Ход сеанса остаётся гибким — в зависимости от вашей усталости и потребностей в этот день.',
      features: [
        'Больше времени, чтобы устроиться, и на сам массаж.',
        'Можно менять положение и делать перерывы.',
        'Если хотите прийти с малышом, уточните это в кабинете перед записью.',
      ],
    },
  },
  'e8714bef-1897-4dd9-9ee9-c0c31d58f293': {
    group: 'myofascial',
    durationMinutes: 55,
    fr: {
      description:
        'Une approche manuelle lente, avec des pressions maintenues et des mouvements progressifs sur les tissus. La séance se concentre sur les régions choisies et sur les sensations rencontrées pendant le travail.',
      features: [
        'Rythme lent, différent d’un massage fluide et continu.',
        'Pressions maintenues plutôt qu’une succession rapide de gestes.',
        'Ne suppose pas nécessairement une pression forte.',
      ],
    },
    en: {
      description:
        'A slow manual approach, with sustained pressure and gradual movements on the tissues. The session concentrates on the chosen regions and on the sensations that come up during the work.',
      features: [
        'A slow pace, different from a fluid, continuous massage.',
        'Sustained pressure rather than a rapid succession of movements.',
        'Does not necessarily involve strong pressure.',
      ],
    },
    uk: {
      description:
        'Повільна мануальна техніка з утримуваним тиском і поступовими рухами по тканинах. Сеанс зосереджується на обраних ділянках і на відчуттях, що виникають під час роботи.',
      features: [
        'Повільний ритм, відмінний від плавного безперервного масажу.',
        'Утримуваний тиск замість швидкої послідовності рухів.',
        "Не обов'язково передбачає сильний тиск.",
      ],
    },
    ru: {
      description:
        'Медленная мануальная техника с удерживаемым давлением и постепенными движениями по тканям. Сеанс сосредоточен на выбранных участках и на ощущениях, возникающих во время работы.',
      features: [
        'Медленный ритм, отличный от плавного непрерывного массажа.',
        'Удерживаемое давление вместо быстрой последовательности движений.',
        'Не обязательно предполагает сильное давление.',
      ],
    },
  },
  'f85a106b-7f20-4ef1-88f7-670cacee7747': {
    group: 'myofascial',
    durationMinutes: 85,
    fr: {
      description:
        'Un format prolongé de massage myofascial pour laisser davantage de temps au travail manuel et aux transitions entre les zones. La progression est guidée par votre confort et les priorités convenues.',
      features: [
        'Temps plus long pour les séquences de travail lent.',
        'Possibilité d’aborder plusieurs régions.',
        'Pression et durée des gestes adaptées au ressenti.',
      ],
    },
    en: {
      description:
        'An extended myofascial massage that leaves more time for the manual work and the transitions between areas. The progression is guided by your comfort and the priorities agreed.',
      features: [
        'More time for sequences of slow work.',
        'Several regions can be addressed.',
        'Pressure and length of each movement adapted to how you feel.',
      ],
    },
    uk: {
      description:
        'Подовжений формат міофасціального масажу, що залишає більше часу для мануальної роботи й переходів між зонами. Перебіг визначається вашим комфортом і домовленими пріоритетами.',
      features: [
        'Більше часу для етапів повільної роботи.',
        'Можна пропрацювати кілька ділянок.',
        'Тиск і тривалість рухів відповідно до ваших відчуттів.',
      ],
    },
    ru: {
      description:
        'Продлённый формат миофасциального массажа, оставляющий больше времени для мануальной работы и переходов между зонами. Ход сеанса определяется вашим комфортом и оговорёнными приоритетами.',
      features: [
        'Больше времени для этапов медленной работы.',
        'Можно проработать несколько участков.',
        'Давление и продолжительность движений в соответствии с вашими ощущениями.',
      ],
    },
  },
  'a587db53-7b29-4b32-adc3-15d68289cfa8': {
    group: 'tissus-profonds',
    durationMinutes: 55,
    fr: {
      description:
        'Un massage au rythme lent, utilisant des pressions progressives pour un travail musculaire ciblé. La séance se concentre sur les zones choisies, dans une recherche de confort plutôt que de pression maximale.',
      features: [
        'Gestes lents et travail localisé.',
        'Pression plus soutenue qu’un massage léger, selon votre tolérance.',
        'La douleur n’est pas un objectif du soin.',
      ],
    },
    en: {
      description:
        'A slow-paced massage using gradual pressure for targeted muscle work. The session concentrates on the chosen areas, seeking comfort rather than maximum pressure.',
      features: [
        'Slow movements and localised work.',
        'Firmer pressure than a light massage, within your tolerance.',
        'Pain is not a goal of the treatment.',
      ],
    },
    uk: {
      description:
        "Масаж у повільному ритмі з поступовим тиском для цілеспрямованої роботи з м'язами. Сеанс зосереджується на обраних зонах, і мета — комфорт, а не максимальний тиск.",
      features: [
        'Повільні рухи та локальна робота.',
        'Тиск сильніший, ніж під час легкого масажу, — у межах вашої чутливості.',
        'Біль не є метою процедури.',
      ],
    },
    ru: {
      description:
        'Массаж в медленном ритме с постепенным давлением для целенаправленной работы с мышцами. Сеанс сосредоточен на выбранных зонах, и цель — комфорт, а не максимальное давление.',
      features: [
        'Медленные движения и локальная работа.',
        'Давление сильнее, чем при лёгком массаже, — в пределах вашей чувствительности.',
        'Боль не является целью процедуры.',
      ],
    },
  },
  '018a645a-7ff7-48fd-a730-894ef3b62aa5': {
    group: 'tissus-profonds',
    durationMinutes: 85,
    fr: {
      description:
        'Une séance prolongée de massage des tissus profonds pour répartir le travail entre plusieurs régions ou accorder plus de temps à une zone prioritaire. Les pressions sont introduites progressivement.',
      features: [
        'Temps supplémentaire pour un travail ciblé et progressif.',
        'Intensité ajustée pendant toute la séance.',
        'Possibilité de diminuer la pression ou d’interrompre un geste à tout moment.',
      ],
    },
    en: {
      description:
        'An extended deep tissue session to share the work between several regions or give more time to a priority area. Pressure is introduced gradually.',
      features: [
        'Extra time for targeted, gradual work.',
        'Intensity adjusted throughout the session.',
        'You can ask for less pressure or stop a movement at any time.',
      ],
    },
    uk: {
      description:
        'Подовжений сеанс масажу глибоких тканин, щоб розподілити роботу між кількома ділянками або приділити більше часу пріоритетній зоні. Тиск посилюється поступово.',
      features: [
        'Додатковий час для цілеспрямованої, поступової роботи.',
        'Інтенсивність коригується впродовж усього сеансу.',
        'Будь-коли можна попросити зменшити тиск або зупинити рух.',
      ],
    },
    ru: {
      description:
        'Продлённый сеанс массажа глубоких тканей, чтобы распределить работу между несколькими участками или уделить больше времени приоритетной зоне. Давление усиливается постепенно.',
      features: [
        'Дополнительное время для целенаправленной, постепенной работы.',
        'Интенсивность корректируется на протяжении всего сеанса.',
        'В любой момент можно попросить уменьшить давление или остановить движение.',
      ],
    },
  },
};
