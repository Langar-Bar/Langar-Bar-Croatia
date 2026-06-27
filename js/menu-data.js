const LANGAR_DEFAULT_MENU = [
  {
    "id": "breakfast",
    "title": {
      "en": "Breakfast",
      "hr": "Doručak"
    },
    "description": {
      "en": "Egg breakfast, omelettes and breakfast combos. Served 07:00–10:30.",
      "hr": "Doručak s jajima, omleti i doručak combo. Poslužuje se 07:00–10:30."
    },
    "icon": "🍳",
    "homeExplore": true,
    "active": true,
    "sort": 1,
    "items": [
      {
        "id": "BRK-001",
        "name": {
          "en": "Three Fried Eggs + Drink",
          "hr": "Tri jaja na oko + piće"
        },
        "desc": {
          "en": "Three fried eggs with salt, black pepper and parsley. Includes one drink choice: orange juice 200ml, espresso, Americano or classic tea. Breakfast served 07:00–10:30.",
          "hr": "Tri jaja na oko sa soli, crnim paprom i peršinom. Uključuje izbor jednog pića: sok od naranče 200 ml, espresso, Americano ili klasični čaj. Doručak se poslužuje 07:00–10:30."
        },
        "ingredients": {
          "en": "Eggs, oil or butter, salt, black pepper, parsley. Drink choice included.",
          "hr": "Jaja, ulje ili maslac, sol, crni papar, peršin. Uključeno piće po izboru."
        },
        "price": "€5.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, milk possible"
      },
      {
        "id": "BRK-002",
        "name": {
          "en": "Classic Skillet Omelette + Drink",
          "hr": "Klasični skillet omlet + piće"
        },
        "desc": {
          "en": "Three-egg classic skillet omelette prepared in a cast-iron pan under the salamander. Includes one drink choice.",
          "hr": "Klasični omlet od tri jaja pripremljen u maloj lijevanoj tavi ispod salamandera. Uključuje jedno piće po izboru."
        },
        "ingredients": {
          "en": "Eggs, oil or butter, salt, black pepper, parsley. Drink choice included.",
          "hr": "Jaja, ulje ili maslac, sol, crni papar, peršin. Uključeno piće po izboru."
        },
        "price": "€5.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, milk possible"
      },
      {
        "id": "BRK-003",
        "name": {
          "en": "Tomato Garlic Omelette + Drink",
          "hr": "Omlet s rajčicom i češnjakom + piće"
        },
        "desc": {
          "en": "Three-egg skillet omelette with tomato garlic breakfast base and parsley. Includes one drink choice.",
          "hr": "Omlet od tri jaja s bazom od rajčice i češnjaka te peršinom. Uključuje jedno piće po izboru."
        },
        "ingredients": {
          "en": "Eggs, tomato garlic base, oil or butter, salt, black pepper, parsley. Drink choice included.",
          "hr": "Jaja, baza od rajčice i češnjaka, ulje ili maslac, sol, crni papar, peršin. Uključeno piće po izboru."
        },
        "price": "€6.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, milk possible"
      },
      {
        "id": "BRK-004",
        "name": {
          "en": "Mushroom Paprika Cheese Omelette + Drink",
          "hr": "Omlet s gljivama, paprikom i sirom + piće"
        },
        "desc": {
          "en": "Three-egg skillet omelette with mushroom, paprika and melted cheese. Includes one drink choice.",
          "hr": "Omlet od tri jaja s gljivama, paprikom i topljenim sirom. Uključuje jedno piće po izboru."
        },
        "ingredients": {
          "en": "Eggs, mushroom, paprika, cheese, oil or butter, salt, black pepper, parsley. Drink choice included.",
          "hr": "Jaja, gljive, paprika, sir, ulje ili maslac, sol, crni papar, peršin. Uključeno piće po izboru."
        },
        "price": "€7.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, milk"
      },
      {
        "id": "BRK-C01",
        "name": {
          "en": "Egg & Tapas Breakfast Plate + Drink",
          "hr": "Doručak jaja i tapas + piće"
        },
        "desc": {
          "en": "Two fried eggs, one tapas scoop, toasted focaccia or bread, tomato/cucumber garnish and one drink choice.",
          "hr": "Dva jaja na oko, jedna tapas kuglica, tostirana focaccia ili kruh, dodatak rajčice/krastavca i jedno piće po izboru."
        },
        "ingredients": {
          "en": "Eggs, tapas scoop, focaccia or bread, tomato/cucumber garnish, drink choice.",
          "hr": "Jaja, tapas kuglica, focaccia ili kruh, dodatak rajčice/krastavca, piće po izboru."
        },
        "price": "€7.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, gluten, sesame possible, milk/nuts possible"
      },
      {
        "id": "BRK-C02",
        "name": {
          "en": "Omelette & Tapas Combo + Drink",
          "hr": "Omlet i tapas combo + piće"
        },
        "desc": {
          "en": "Classic three-egg skillet omelette, one tapas scoop, toasted focaccia, butter and one drink choice.",
          "hr": "Klasični skillet omlet od tri jaja, jedna tapas kuglica, tostirana focaccia, maslac i jedno piće po izboru."
        },
        "ingredients": {
          "en": "Eggs, tapas scoop, focaccia, butter, drink choice.",
          "hr": "Jaja, tapas kuglica, focaccia, maslac, piće po izboru."
        },
        "price": "€8.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, gluten, milk, sesame possible, nuts possible"
      },
      {
        "id": "BRK-C03",
        "name": {
          "en": "Langar Supreme Breakfast with Baked Beans + Drink",
          "hr": "Langar Supreme doručak s grahom + piće"
        },
        "desc": {
          "en": "Two fried eggs or classic omelette, baked beans, feta/white cheese, mortadella or turkey ham, toasted focaccia, butter, jam or honey, olives/tomato/cucumber garnish and one drink choice.",
          "hr": "Dva jaja na oko ili klasični omlet, zapečeni grah, feta/bijeli sir, mortadela ili pureća šunka, tostirana focaccia, maslac, džem ili med, masline/rajčica/krastavac i jedno piće po izboru."
        },
        "ingredients": {
          "en": "Eggs or omelette, baked beans, white cheese, mortadella or turkey ham, focaccia, butter, jam or honey, olives, tomato, cucumber, drink choice.",
          "hr": "Jaja ili omlet, zapečeni grah, bijeli sir, mortadela ili pureća šunka, focaccia, maslac, džem ili med, masline, rajčica, krastavac, piće po izboru."
        },
        "price": "€9.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, gluten, milk, mustard possible"
      }
    ]
  },
  {
    "id": "breakfast_addons",
    "title": {
      "en": "Breakfast Add-ons & Upgrades",
      "hr": "Doručak dodaci i nadoplate"
    },
    "description": {
      "en": "Add bread, baked beans, tapas scoop or drink upgrades to breakfast.",
      "hr": "Dodajte kruh, zapečeni grah, tapas kuglicu ili nadoplatu pića uz doručak."
    },
    "icon": "➕🍳",
    "homeExplore": false,
    "active": true,
    "sort": 2,
    "items": [
      {
        "id": "ADD-BRK-001",
        "name": {
          "en": "Toasted Bread",
          "hr": "Tostirani kruh"
        },
        "desc": {
          "en": "2 slices of toasted bread.",
          "hr": "2 kriške tostiranog kruha."
        },
        "ingredients": {
          "en": "Bread.",
          "hr": "Kruh."
        },
        "price": "€1.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten"
      },
      {
        "id": "ADD-BRK-002",
        "name": {
          "en": "Toasted Focaccia",
          "hr": "Tostirana focaccia"
        },
        "desc": {
          "en": "2 slices of toasted focaccia.",
          "hr": "2 kriške tostirane focaccie."
        },
        "ingredients": {
          "en": "Focaccia bread.",
          "hr": "Focaccia kruh."
        },
        "price": "€1.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten"
      },
      {
        "id": "ADD-BRK-003",
        "name": {
          "en": "Tapas Scoop",
          "hr": "Tapas kuglica"
        },
        "desc": {
          "en": "One 75g tapas scoop. Customer chooses available tapas flavor.",
          "hr": "Jedna tapas kuglica od 75 g. Gost bira dostupni okus tapasa."
        },
        "ingredients": {
          "en": "Tapas scoop, flavor by choice.",
          "hr": "Tapas kuglica, okus po izboru."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "ADD-BRK-004",
        "name": {
          "en": "Feta / White Cheese",
          "hr": "Feta / bijeli sir"
        },
        "desc": {
          "en": "50g feta or white cheese portion.",
          "hr": "50 g fete ili bijelog sira."
        },
        "ingredients": {
          "en": "Feta / white cheese.",
          "hr": "Feta / bijeli sir."
        },
        "price": "€1.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      },
      {
        "id": "ADD-BRK-005",
        "name": {
          "en": "Mortadella",
          "hr": "Mortadela"
        },
        "desc": {
          "en": "50g mortadella portion.",
          "hr": "50 g mortadele."
        },
        "ingredients": {
          "en": "Mortadella.",
          "hr": "Mortadela."
        },
        "price": "€1.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "ADD-BRK-006",
        "name": {
          "en": "Turkey Ham",
          "hr": "Pureća šunka"
        },
        "desc": {
          "en": "50g turkey ham portion.",
          "hr": "50 g pureće šunke."
        },
        "ingredients": {
          "en": "Turkey ham.",
          "hr": "Pureća šunka."
        },
        "price": "€1.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "ADD-BRK-007",
        "name": {
          "en": "Baked Beans Side",
          "hr": "Prilog zapečeni grah"
        },
        "desc": {
          "en": "120g warm baked beans side.",
          "hr": "120 g toplog priloga od zapečenog graha."
        },
        "ingredients": {
          "en": "Baked beans, tomato sauce, smoked paprika, black pepper.",
          "hr": "Zapečeni grah, umak od rajčice, dimljena paprika, crni papar."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "ADD-BRK-008",
        "name": {
          "en": "Butter Portion",
          "hr": "Porcija maslaca"
        },
        "desc": {
          "en": "10g butter portion.",
          "hr": "10 g maslaca."
        },
        "ingredients": {
          "en": "Butter.",
          "hr": "Maslac."
        },
        "price": "€0.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      },
      {
        "id": "ADD-BRK-009",
        "name": {
          "en": "Jam or Honey",
          "hr": "Džem ili med"
        },
        "desc": {
          "en": "25g jam or honey portion.",
          "hr": "25 g džema ili meda."
        },
        "ingredients": {
          "en": "Jam or honey.",
          "hr": "Džem ili med."
        },
        "price": "€0.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "ADD-BRK-010",
        "name": {
          "en": "Extra Egg",
          "hr": "Dodatno jaje"
        },
        "desc": {
          "en": "One extra egg.",
          "hr": "Jedno dodatno jaje."
        },
        "ingredients": {
          "en": "Egg.",
          "hr": "Jaje."
        },
        "price": "€0.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg"
      },
      {
        "id": "BRK-UPG-001",
        "name": {
          "en": "Upgrade to Cappuccino",
          "hr": "Nadoplata za cappuccino"
        },
        "desc": {
          "en": "Upgrade the included breakfast drink to cappuccino.",
          "hr": "Nadoplata za uključeno piće u cappuccino."
        },
        "ingredients": {
          "en": "Espresso, milk.",
          "hr": "Espresso, mlijeko."
        },
        "price": "€0.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      },
      {
        "id": "BRK-UPG-002",
        "name": {
          "en": "Upgrade to Latte",
          "hr": "Nadoplata za latte"
        },
        "desc": {
          "en": "Upgrade the included breakfast drink to latte.",
          "hr": "Nadoplata za uključeno piće u latte."
        },
        "ingredients": {
          "en": "Espresso, milk.",
          "hr": "Espresso, mlijeko."
        },
        "price": "€1.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      }
    ]
  },
  {
    "id": "classic_coffee",
    "title": {
      "en": "Classic Coffee",
      "hr": "Klasična kava"
    },
    "description": {
      "en": "Espresso, cappuccino, latte and classic coffee drinks",
      "hr": "Espresso, cappuccino, latte i klasični napitci od kave"
    },
    "icon": "☕",
    "homeExplore": false,
    "active": true,
    "sort": 3,
    "items": [
      {
        "id": "classic_coffee_001",
        "name": {
          "en": "Ristretto",
          "hr": "Ristretto"
        },
        "desc": {
          "en": "Short intense espresso shot.",
          "hr": "Kratki intenzivni espresso."
        },
        "ingredients": {
          "en": "Espresso coffee, water.",
          "hr": "Espresso kava, voda."
        },
        "price": "€1.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_002",
        "name": {
          "en": "Espresso",
          "hr": "Espresso"
        },
        "desc": {
          "en": "Classic Italian espresso.",
          "hr": "Klasični talijanski espresso."
        },
        "ingredients": {
          "en": "Espresso coffee, water.",
          "hr": "Espresso kava, voda."
        },
        "price": "€1.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_003",
        "name": {
          "en": "Double Espresso",
          "hr": "Double Espresso"
        },
        "desc": {
          "en": "Double espresso shot.",
          "hr": "Dvostruki espresso."
        },
        "ingredients": {
          "en": "Double espresso coffee, water.",
          "hr": "Dvostruki espresso kava, voda."
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_004",
        "name": {
          "en": "Decaf Espresso",
          "hr": "Decaf Espresso"
        },
        "desc": {
          "en": "Decaffeinated espresso.",
          "hr": "Espresso bez kofeina."
        },
        "ingredients": {
          "en": "Decaf espresso coffee, water.",
          "hr": "Decaf espresso kava, voda."
        },
        "price": "€1.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_005",
        "name": {
          "en": "Americano",
          "hr": "Americano"
        },
        "desc": {
          "en": "Hot or iced espresso with water.",
          "hr": "Vrući ili ledeni espresso s vodom."
        },
        "ingredients": {
          "en": "Espresso, hot or cold water.",
          "hr": "Espresso, topla ili hladna voda."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_006",
        "name": {
          "en": "Decaf Americano",
          "hr": "Decaf Americano"
        },
        "desc": {
          "en": "Hot or iced decaf americano.",
          "hr": "Vrući ili ledeni americano bez kofeina."
        },
        "ingredients": {
          "en": "Decaf espresso, hot or cold water.",
          "hr": "Decaf espresso, topla ili hladna voda."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_007",
        "name": {
          "en": "Macchiato",
          "hr": "Macchiato"
        },
        "desc": {
          "en": "Espresso with a small touch of milk foam.",
          "hr": "Espresso s malo mliječne pjene."
        },
        "ingredients": {
          "en": "Espresso, milk foam.",
          "hr": "Espresso, mliječna pjena."
        },
        "price": "€2.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_008",
        "name": {
          "en": "Cappuccino",
          "hr": "Cappuccino"
        },
        "desc": {
          "en": "Espresso with milk and milk foam.",
          "hr": "Espresso s mlijekom i mliječnom pjenom."
        },
        "ingredients": {
          "en": "Espresso, steamed milk, milk foam.",
          "hr": "Espresso, toplo mlijeko, mliječna pjena."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_009",
        "name": {
          "en": "Flat White",
          "hr": "Flat White"
        },
        "desc": {
          "en": "Espresso with silky steamed milk.",
          "hr": "Espresso s finom mliječnom kremom."
        },
        "ingredients": {
          "en": "Espresso, steamed milk.",
          "hr": "Espresso, toplo mlijeko."
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_010",
        "name": {
          "en": "Latte Macchiato",
          "hr": "Latte Macchiato"
        },
        "desc": {
          "en": "Steamed milk with espresso.",
          "hr": "Toplo mlijeko s espressom."
        },
        "ingredients": {
          "en": "Steamed milk, espresso.",
          "hr": "Toplo mlijeko, espresso."
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "classic_coffee_011",
        "name": {
          "en": "Latte",
          "hr": "Latte"
        },
        "desc": {
          "en": "Espresso with steamed milk.",
          "hr": "Espresso s toplim mlijekom."
        },
        "ingredients": {
          "en": "Espresso, milk.",
          "hr": "Espresso, mlijeko."
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      }
    ]
  },
  {
    "id": "signature_coffee",
    "title": {
      "en": "Signature Coffee",
      "hr": "Signature kava"
    },
    "description": {
      "en": "Flavored and Langar signature coffee drinks",
      "hr": "Aromatizirane i Langar signature kave"
    },
    "icon": "✨☕",
    "homeExplore": true,
    "active": true,
    "sort": 4,
    "items": [
      {
        "id": "signature_coffee_001",
        "name": {
          "en": "Flavored Latte",
          "hr": "Flavored Latte"
        },
        "desc": {
          "en": "Hot or iced latte with your choice of flavor.",
          "hr": "Vrući ili ledeni latte s okusom po izboru."
        },
        "ingredients": {
          "en": "Espresso, milk, chosen syrup: vanilla, caramel, hazelnut, pistachio, coconut, cinnamon honey or strawberry.",
          "hr": "Espresso, mlijeko, odabrani sirup: vanilija, karamela, lješnjak, pistacija, kokos, cimet med ili jagoda."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_002",
        "name": {
          "en": "Mocha Dark Chocolate",
          "hr": "Mocha tamna čokolada"
        },
        "desc": {
          "en": "Coffee with dark chocolate and milk.",
          "hr": "Kava s tamnom čokoladom i mlijekom."
        },
        "ingredients": {
          "en": "Espresso, milk, dark chocolate sauce.",
          "hr": "Espresso, mlijeko, umak od tamne čokolade."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_003",
        "name": {
          "en": "White Chocolate Mocha",
          "hr": "Mocha bijela čokolada"
        },
        "desc": {
          "en": "Espresso, milk and white chocolate.",
          "hr": "Espresso, mlijeko i bijela čokolada."
        },
        "ingredients": {
          "en": "Espresso, milk, white chocolate sauce.",
          "hr": "Espresso, mlijeko, umak od bijele čokolade."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_004",
        "name": {
          "en": "Spanish Latte",
          "hr": "Spanish Latte"
        },
        "desc": {
          "en": "Hot or iced latte with a creamy sweet note.",
          "hr": "Vrući ili ledeni latte s kremastom slatkom notom."
        },
        "ingredients": {
          "en": "Espresso, milk, sweet creamy base.",
          "hr": "Espresso, mlijeko, slatka kremasta baza."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_005",
        "name": {
          "en": "Iced Caramel Macchiato",
          "hr": "Ledeni caramel macchiato"
        },
        "desc": {
          "en": "Iced espresso drink with caramel and milk.",
          "hr": "Ledeni espresso napitak s karamelom i mlijekom."
        },
        "ingredients": {
          "en": "Ice, espresso, milk, caramel syrup.",
          "hr": "Led, espresso, mlijeko, karamel sirup."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_006",
        "name": {
          "en": "Iced Pistachio Latte",
          "hr": "Ledeni pistachio latte"
        },
        "desc": {
          "en": "Ice, espresso, milk and pistachio syrup.",
          "hr": "Led, espresso, mlijeko i pistacija sirup."
        },
        "ingredients": {
          "en": "Ice, espresso, milk, pistachio syrup.",
          "hr": "Led, espresso, mlijeko, pistacija sirup."
        },
        "price": "€3.90",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_007",
        "name": {
          "en": "Iced Coconut Vanilla Latte",
          "hr": "Ledeni kokos vanilija latte"
        },
        "desc": {
          "en": "Ice, espresso, milk, coconut and vanilla.",
          "hr": "Led, espresso, mlijeko, kokos i vanilija."
        },
        "ingredients": {
          "en": "Ice, espresso, milk, coconut syrup, vanilla syrup.",
          "hr": "Led, espresso, mlijeko, kokos sirup, vanilija sirup."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_008",
        "name": {
          "en": "Dubai Pistachio Latte",
          "hr": "Dubai pistachio latte"
        },
        "desc": {
          "en": "Espresso, steamed milk, premium pistachio cream and white chocolate.",
          "hr": "Espresso, mlijeko, premium pistacija krema i bijela čokolada."
        },
        "ingredients": {
          "en": "Espresso, steamed milk, pistachio cream, white chocolate sauce.",
          "hr": "Espresso, toplo mlijeko, pistacija krema, umak od bijele čokolade."
        },
        "price": "€4.50",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_009",
        "name": {
          "en": "Tiramisu Iced Latte",
          "hr": "Tiramisu ledeni latte"
        },
        "desc": {
          "en": "Iced latte with tiramisu flavor.",
          "hr": "Ledeni latte s okusom tiramisua."
        },
        "ingredients": {
          "en": "Ice, espresso, milk, tiramisu flavor.",
          "hr": "Led, espresso, mlijeko, aroma tiramisua."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_010",
        "name": {
          "en": "Langar Mango Velvet",
          "hr": "Langar Mango Velvet"
        },
        "desc": {
          "en": "Mango puree, vanilla hint, milk and espresso.",
          "hr": "Mango pire, nota vanilije, mlijeko i espresso."
        },
        "ingredients": {
          "en": "Mango puree, vanilla syrup, milk, espresso.",
          "hr": "Mango pire, vanilija sirup, mlijeko, espresso."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_011",
        "name": {
          "en": "Orange Ocean",
          "hr": "Orange Ocean"
        },
        "desc": {
          "en": "Refreshing orange and coffee combination.",
          "hr": "Osvježavajuća kombinacija naranče i kave."
        },
        "ingredients": {
          "en": "Espresso, orange base, ice.",
          "hr": "Espresso, baza od naranče, led."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_012",
        "name": {
          "en": "Mango Espresso",
          "hr": "Mango Espresso"
        },
        "desc": {
          "en": "Espresso with mango fruit note.",
          "hr": "Espresso s voćnom notom manga."
        },
        "ingredients": {
          "en": "Espresso, mango puree, ice.",
          "hr": "Espresso, mango pire, led."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "signature_coffee_013",
        "name": {
          "en": "Espresso Tonic",
          "hr": "Espresso Tonic"
        },
        "desc": {
          "en": "Espresso with tonic water.",
          "hr": "Espresso s tonic vodom."
        },
        "ingredients": {
          "en": "Espresso, tonic water, ice.",
          "hr": "Espresso, tonic voda, led."
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "affogato",
    "title": {
      "en": "Affogato",
      "hr": "Affogato"
    },
    "description": {
      "en": "Coffee dessert drinks with ice cream",
      "hr": "Desertni napitci s kavom i sladoledom"
    },
    "icon": "🍨☕",
    "homeExplore": true,
    "active": true,
    "sort": 5,
    "items": [
      {
        "id": "affogato_001",
        "name": {
          "en": "Classic Affogato",
          "hr": "Classic Affogato"
        },
        "desc": {
          "en": "Vanilla ice cream with espresso.",
          "hr": "Sladoled od vanilije s espressom."
        },
        "ingredients": {
          "en": "Vanilla ice cream, espresso.",
          "hr": "Sladoled od vanilije, espresso."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "affogato_002",
        "name": {
          "en": "Caramel Lotus Affogato",
          "hr": "Caramel Lotus Affogato"
        },
        "desc": {
          "en": "Affogato with caramel and Lotus biscuit.",
          "hr": "Affogato s karamelom i Lotus keksom."
        },
        "ingredients": {
          "en": "Vanilla ice cream, espresso, caramel sauce, Lotus crumbs.",
          "hr": "Sladoled od vanilije, espresso, karamel umak, Lotus komadići."
        },
        "price": "€4.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "affogato_003",
        "name": {
          "en": "Pistachio Affogato",
          "hr": "Pistachio Affogato"
        },
        "desc": {
          "en": "Vanilla ice cream, espresso and pistachio cream.",
          "hr": "Sladoled od vanilije, espresso i pistacija krema."
        },
        "ingredients": {
          "en": "Vanilla ice cream, espresso, pistachio cream.",
          "hr": "Sladoled od vanilije, espresso, pistacija krema."
        },
        "price": "€4.50",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "affogato_004",
        "name": {
          "en": "Tiramisu Affogato",
          "hr": "Tiramisu Affogato"
        },
        "desc": {
          "en": "Affogato with tiramisu flavor.",
          "hr": "Affogato s okusom tiramisua."
        },
        "ingredients": {
          "en": "Vanilla ice cream, espresso, tiramisu flavor.",
          "hr": "Sladoled od vanilije, espresso, aroma tiramisua."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "affogato_005",
        "name": {
          "en": "Oreo Affogato",
          "hr": "Oreo Affogato"
        },
        "desc": {
          "en": "Vanilla ice cream, espresso and Oreo crumbs.",
          "hr": "Sladoled od vanilije, espresso i Oreo komadići."
        },
        "ingredients": {
          "en": "Vanilla ice cream, espresso, Oreo crumbs.",
          "hr": "Sladoled od vanilije, espresso, Oreo komadići."
        },
        "price": "€4.20",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "affogato_006",
        "name": {
          "en": "Kinder Affogato",
          "hr": "Kinder Affogato"
        },
        "desc": {
          "en": "Vanilla ice cream, espresso and Kinder topping.",
          "hr": "Sladoled od vanilije, espresso i Kinder preljev."
        },
        "ingredients": {
          "en": "Vanilla ice cream, espresso, Kinder topping.",
          "hr": "Sladoled od vanilije, espresso, Kinder preljev."
        },
        "price": "€4.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "espresso_bull",
    "title": {
      "en": "Espresso Bull",
      "hr": "Espresso Bull"
    },
    "description": {
      "en": "Espresso with energy drink and flavors",
      "hr": "Espresso s energetskim pićem i okusima"
    },
    "icon": "⚡☕",
    "homeExplore": false,
    "active": true,
    "sort": 6,
    "items": [
      {
        "id": "espresso_bull_001",
        "name": {
          "en": "Classic Espresso Bull",
          "hr": "Classic Espresso Bull"
        },
        "desc": {
          "en": "Espresso with energy drink.",
          "hr": "Espresso s energetskim pićem."
        },
        "ingredients": {
          "en": "Espresso, energy drink, ice.",
          "hr": "Espresso, energetsko piće, led."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "espresso_bull_002",
        "name": {
          "en": "Tropical Espresso Bull",
          "hr": "Tropical Espresso Bull"
        },
        "desc": {
          "en": "Espresso Bull with tropical flavor.",
          "hr": "Espresso Bull s tropskim okusom."
        },
        "ingredients": {
          "en": "Espresso, energy drink, tropical syrup, ice.",
          "hr": "Espresso, energetsko piće, tropski sirup, led."
        },
        "price": "€4.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "espresso_bull_003",
        "name": {
          "en": "Berry Espresso Bull",
          "hr": "Berry Espresso Bull"
        },
        "desc": {
          "en": "Espresso Bull with berry flavor.",
          "hr": "Espresso Bull s bobičastim voćem."
        },
        "ingredients": {
          "en": "Espresso, energy drink, berry syrup, ice.",
          "hr": "Espresso, energetsko piće, berry sirup, led."
        },
        "price": "€4.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "espresso_bull_004",
        "name": {
          "en": "Coconut Espresso Bull",
          "hr": "Coconut Espresso Bull"
        },
        "desc": {
          "en": "Espresso Bull with coconut flavor.",
          "hr": "Espresso Bull s okusom kokosa."
        },
        "ingredients": {
          "en": "Espresso, energy drink, coconut syrup, ice.",
          "hr": "Espresso, energetsko piće, kokos sirup, led."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "espresso_bull_005",
        "name": {
          "en": "Mango Espresso Bull",
          "hr": "Mango Espresso Bull"
        },
        "desc": {
          "en": "Espresso Bull with mango flavor.",
          "hr": "Espresso Bull s mangom."
        },
        "ingredients": {
          "en": "Espresso, energy drink, mango puree, ice.",
          "hr": "Espresso, energetsko piće, mango pire, led."
        },
        "price": "€4.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "coffee_cocktails",
    "title": {
      "en": "Coffee Cocktails",
      "hr": "Kokteli s kavom"
    },
    "description": {
      "en": "Alcoholic coffee cocktails",
      "hr": "Kokteli s kavom"
    },
    "icon": "🍸☕",
    "homeExplore": false,
    "active": true,
    "sort": 7,
    "items": [
      {
        "id": "coffee_cocktails_001",
        "name": {
          "en": "Baileys Latte",
          "hr": "Baileys Latte"
        },
        "desc": {
          "en": "Coffee latte with Baileys.",
          "hr": "Latte s Baileysom."
        },
        "ingredients": {
          "en": "Espresso, milk, Baileys.",
          "hr": "Espresso, mlijeko, Baileys."
        },
        "price": "€5.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_cocktails_002",
        "name": {
          "en": "Kahlua Iced Coffee",
          "hr": "Kahlua Iced Coffee"
        },
        "desc": {
          "en": "Iced coffee with Kahlua.",
          "hr": "Ledena kava s Kahlúom."
        },
        "ingredients": {
          "en": "Espresso, ice, milk, Kahlua.",
          "hr": "Espresso, led, mlijeko, Kahlua."
        },
        "price": "€5.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_cocktails_003",
        "name": {
          "en": "Irish Coffee",
          "hr": "Irish Coffee"
        },
        "desc": {
          "en": "Irish-style coffee.",
          "hr": "Kava u irskom stilu."
        },
        "ingredients": {
          "en": "Coffee, whiskey, cream.",
          "hr": "Kava, whiskey, krema."
        },
        "price": "€4.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_cocktails_004",
        "name": {
          "en": "Amaretto Cappuccino",
          "hr": "Amaretto Cappuccino"
        },
        "desc": {
          "en": "Cappuccino with amaretto.",
          "hr": "Cappuccino s amarettom."
        },
        "ingredients": {
          "en": "Espresso, milk foam, amaretto.",
          "hr": "Espresso, mliječna pjena, amaretto."
        },
        "price": "€4.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_cocktails_005",
        "name": {
          "en": "Rum Espresso Tonic",
          "hr": "Rum Espresso Tonic"
        },
        "desc": {
          "en": "Espresso tonic with rum.",
          "hr": "Espresso tonic s rumom."
        },
        "ingredients": {
          "en": "Espresso, tonic water, rum, ice.",
          "hr": "Espresso, tonic voda, rum, led."
        },
        "price": "€5.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_cocktails_006",
        "name": {
          "en": "Mango Coffee Mojito",
          "hr": "Mango Coffee Mojito"
        },
        "desc": {
          "en": "Coffee cocktail with mango and mojito note.",
          "hr": "Koktel kave s mangom i mojito notom."
        },
        "ingredients": {
          "en": "Espresso, mango puree, mint, lime, mojito base.",
          "hr": "Espresso, mango pire, menta, limeta, mojito baza."
        },
        "price": "€5.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_cocktails_007",
        "name": {
          "en": "Espresso Martini",
          "hr": "Espresso Martini"
        },
        "desc": {
          "en": "Cocktail with espresso.",
          "hr": "Koktel s espressom."
        },
        "ingredients": {
          "en": "Espresso, vodka, coffee liqueur.",
          "hr": "Espresso, vodka, liker od kave."
        },
        "price": "€5.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "tea",
    "title": {
      "en": "Tea & Wellness Tea",
      "hr": "Čaj i wellness čajevi"
    },
    "description": {
      "en": "Classic, fruit, herbal and wellness teas",
      "hr": "Klasični, voćni, biljni i wellness čajevi"
    },
    "icon": "🍵",
    "homeExplore": false,
    "active": true,
    "sort": 8,
    "items": [
      {
        "id": "tea_001",
        "name": {
          "en": "Black Tea",
          "hr": "Crni čaj"
        },
        "desc": {
          "en": "Classic black tea.",
          "hr": "Klasični crni čaj."
        },
        "ingredients": {
          "en": "Tea bag, hot water.",
          "hr": "Vrećica čaja, vruća voda."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_002",
        "name": {
          "en": "Green Tea",
          "hr": "Zeleni čaj"
        },
        "desc": {
          "en": "Classic green tea.",
          "hr": "Klasični zeleni čaj."
        },
        "ingredients": {
          "en": "Tea bag, hot water.",
          "hr": "Vrećica čaja, vruća voda."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_003",
        "name": {
          "en": "Mint Tea",
          "hr": "Čaj od mente"
        },
        "desc": {
          "en": "Classic mint tea.",
          "hr": "Klasični čaj od mente."
        },
        "ingredients": {
          "en": "Mint tea, hot water.",
          "hr": "Čaj od mente, vruća voda."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_004",
        "name": {
          "en": "Chamomile Tea",
          "hr": "Čaj od kamilice"
        },
        "desc": {
          "en": "Classic chamomile tea.",
          "hr": "Klasični čaj od kamilice."
        },
        "ingredients": {
          "en": "Chamomile tea, hot water.",
          "hr": "Čaj od kamilice, vruća voda."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_005",
        "name": {
          "en": "Sour Cherry Tea",
          "hr": "Čaj od višnje"
        },
        "desc": {
          "en": "Fruit tea with sour cherry flavor.",
          "hr": "Voćni čaj s okusom višnje."
        },
        "ingredients": {
          "en": "Fruit tea, hot water.",
          "hr": "Voćni čaj, vruća voda."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_006",
        "name": {
          "en": "Mixed Berry Tea",
          "hr": "Čaj šumsko voće"
        },
        "desc": {
          "en": "Fruit tea with mixed berry flavor.",
          "hr": "Voćni čaj s okusom šumskog voća."
        },
        "ingredients": {
          "en": "Fruit tea, hot water.",
          "hr": "Voćni čaj, vruća voda."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_007",
        "name": {
          "en": "Citrus Fruit Tea",
          "hr": "Citrus voćni čaj"
        },
        "desc": {
          "en": "Fruit tea with citrus notes.",
          "hr": "Voćni čaj s citrusnim notama."
        },
        "ingredients": {
          "en": "Fruit tea, hot water.",
          "hr": "Voćni čaj, vruća voda."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_008",
        "name": {
          "en": "Ginger Lemon Tea",
          "hr": "Čaj đumbir limun"
        },
        "desc": {
          "en": "Wellness tea with ginger and lemon.",
          "hr": "Wellness čaj s đumbirom i limunom."
        },
        "ingredients": {
          "en": "Tea, ginger/lemon flavor, hot water.",
          "hr": "Čaj, okus đumbira/limuna, vruća voda."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_009",
        "name": {
          "en": "Fresh Mint & Lemon",
          "hr": "Svježa menta i limun"
        },
        "desc": {
          "en": "Fresh mint and lemon tea.",
          "hr": "Čaj od svježe mente i limuna."
        },
        "ingredients": {
          "en": "Fresh mint, lemon, hot water.",
          "hr": "Svježa menta, limun, vruća voda."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_010",
        "name": {
          "en": "Honey Cinnamon Tea",
          "hr": "Čaj med cimet"
        },
        "desc": {
          "en": "Warm tea with honey and cinnamon.",
          "hr": "Topli čaj s medom i cimetom."
        },
        "ingredients": {
          "en": "Tea, honey, cinnamon.",
          "hr": "Čaj, med, cimet."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_011",
        "name": {
          "en": "Cold Relief Tea",
          "hr": "Cold Relief čaj"
        },
        "desc": {
          "en": "Warm wellness tea for cold days.",
          "hr": "Topli wellness čaj za hladne dane."
        },
        "ingredients": {
          "en": "Tea, lemon/ginger/honey style ingredients.",
          "hr": "Čaj, sastojci u stilu limun/đumbir/med."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_012",
        "name": {
          "en": "Relax Tea",
          "hr": "Relax čaj"
        },
        "desc": {
          "en": "Relaxing herbal tea.",
          "hr": "Opuštajući biljni čaj."
        },
        "ingredients": {
          "en": "Herbal tea, hot water.",
          "hr": "Biljni čaj, vruća voda."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "tea_013",
        "name": {
          "en": "Immunity Boost Tea",
          "hr": "Immunity Boost čaj"
        },
        "desc": {
          "en": "Warm wellness tea with citrus notes.",
          "hr": "Topli wellness čaj s citrusnim notama."
        },
        "ingredients": {
          "en": "Tea, citrus/ginger style ingredients.",
          "hr": "Čaj, sastojci u stilu citrus/đumbir."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "tea_latte",
    "title": {
      "en": "Tea Latte",
      "hr": "Čaj latte"
    },
    "description": {
      "en": "Tea with milk and warm flavor notes",
      "hr": "Čaj s mlijekom i toplim notama okusa"
    },
    "icon": "🫖",
    "homeExplore": false,
    "active": true,
    "sort": 9,
    "items": [
      {
        "id": "tea_latte_001",
        "name": {
          "en": "Chai Latte",
          "hr": "Chai latte"
        },
        "desc": {
          "en": "Chai tea with milk.",
          "hr": "Chai čaj s mlijekom."
        },
        "ingredients": {
          "en": "Chai, milk.",
          "hr": "Chai, mlijeko."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      },
      {
        "id": "tea_latte_002",
        "name": {
          "en": "Vanilla Tea Latte",
          "hr": "Vanilla tea latte"
        },
        "desc": {
          "en": "Tea latte with vanilla flavor.",
          "hr": "Čaj latte s okusom vanilije."
        },
        "ingredients": {
          "en": "Tea, milk, vanilla flavor.",
          "hr": "Čaj, mlijeko, aroma vanilije."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk"
      }
    ]
  },
  {
    "id": "iced_refreshers",
    "title": {
      "en": "Iced Tea & Refreshers",
      "hr": "Ledeni čaj i refresheri"
    },
    "description": {
      "en": "Cold tea and sparkling fruit refreshers",
      "hr": "Ledeni čajevi i voćni refresheri"
    },
    "icon": "🧊🍹",
    "homeExplore": true,
    "active": true,
    "sort": 10,
    "items": [
      {
        "id": "iced_refreshers_001",
        "name": {
          "en": "Iced Lemon Tea",
          "hr": "Ledeni čaj limun"
        },
        "desc": {
          "en": "Iced tea with lemon.",
          "hr": "Ledeni čaj s limunom."
        },
        "ingredients": {
          "en": "Tea base, lemon, ice.",
          "hr": "Čaj baza, limun, led."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_002",
        "name": {
          "en": "Iced Peach Tea",
          "hr": "Ledeni čaj breskva"
        },
        "desc": {
          "en": "Iced tea with peach.",
          "hr": "Ledeni čaj s breskvom."
        },
        "ingredients": {
          "en": "Tea base, peach flavor, ice.",
          "hr": "Čaj baza, breskva aroma, led."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_003",
        "name": {
          "en": "Iced Berry Tea",
          "hr": "Ledeni čaj bobičasto voće"
        },
        "desc": {
          "en": "Iced tea with berries.",
          "hr": "Ledeni čaj s bobičastim voćem."
        },
        "ingredients": {
          "en": "Tea base, berries, ice.",
          "hr": "Čaj baza, bobičasto voće, led."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_004",
        "name": {
          "en": "Iced Green Tea",
          "hr": "Ledeni zeleni čaj"
        },
        "desc": {
          "en": "Bottled or soft drink option.",
          "hr": "Opcija u boci / bezalkoholno piće."
        },
        "ingredients": {
          "en": "Green tea soft drink.",
          "hr": "Zeleni čaj bezalkoholno piće."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_005",
        "name": {
          "en": "Mango Refresher",
          "hr": "Mango Refresher"
        },
        "desc": {
          "en": "Mango puree, lime, ice and sparkling water.",
          "hr": "Mango pire, limeta, led i gazirana voda."
        },
        "ingredients": {
          "en": "Mango puree, lime, ice, sparkling water.",
          "hr": "Mango pire, limeta, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_006",
        "name": {
          "en": "Strawberry Refresher",
          "hr": "Strawberry Refresher"
        },
        "desc": {
          "en": "Strawberry, lime, ice and sparkling water.",
          "hr": "Jagoda, limeta, led i gazirana voda."
        },
        "ingredients": {
          "en": "Strawberry puree, lime, ice, sparkling water.",
          "hr": "Jagoda pire, limeta, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_007",
        "name": {
          "en": "Berry Refresher",
          "hr": "Berry Refresher"
        },
        "desc": {
          "en": "Mixed berries, lime and sparkling water.",
          "hr": "Miješano bobičasto voće, limeta i gazirana voda."
        },
        "ingredients": {
          "en": "Mixed berries, lime, ice, sparkling water.",
          "hr": "Miješano bobičasto voće, limeta, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_008",
        "name": {
          "en": "Citrus Mint Refresher",
          "hr": "Citrus Mint Refresher"
        },
        "desc": {
          "en": "Lemon, orange, fresh mint and sparkling water.",
          "hr": "Limun, naranča, svježa menta i gazirana voda."
        },
        "ingredients": {
          "en": "Lemon, orange, fresh mint, ice, sparkling water.",
          "hr": "Limun, naranča, svježa menta, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "iced_refreshers_009",
        "name": {
          "en": "Tropical Refresher",
          "hr": "Tropical Refresher"
        },
        "desc": {
          "en": "Tropical fruit, lime, ice and sparkling water.",
          "hr": "Tropsko voće, limeta, led i gazirana voda."
        },
        "ingredients": {
          "en": "Tropical fruit base, lime, ice, sparkling water.",
          "hr": "Tropska voćna baza, limeta, led, gazirana voda."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "lemonade",
    "title": {
      "en": "Lemonades",
      "hr": "Limunade"
    },
    "description": {
      "en": "Fresh sparkling lemonades",
      "hr": "Svježe pjenušave limunade"
    },
    "icon": "🍋",
    "homeExplore": true,
    "active": true,
    "sort": 11,
    "items": [
      {
        "id": "lemonade_001",
        "name": {
          "en": "Classic Lemonade",
          "hr": "Classic Lemonade"
        },
        "desc": {
          "en": "Fresh lemon, ice and sparkling water.",
          "hr": "Svježi limun, led i gazirana voda."
        },
        "ingredients": {
          "en": "Fresh lemon, ice, sparkling water.",
          "hr": "Svježi limun, led, gazirana voda."
        },
        "price": "€3.00",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "lemonade_002",
        "name": {
          "en": "Mint Lemonade",
          "hr": "Mint Lemonade"
        },
        "desc": {
          "en": "Fresh lemon, mint, ice and sparkling water.",
          "hr": "Svježi limun, menta, led i gazirana voda."
        },
        "ingredients": {
          "en": "Fresh lemon, fresh mint, ice, sparkling water.",
          "hr": "Svježi limun, svježa menta, led, gazirana voda."
        },
        "price": "€3.30",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "lemonade_003",
        "name": {
          "en": "Strawberry Lemonade",
          "hr": "Strawberry Lemonade"
        },
        "desc": {
          "en": "Strawberry, lemon, ice and sparkling water.",
          "hr": "Jagoda, limun, led i gazirana voda."
        },
        "ingredients": {
          "en": "Strawberry puree, lemon, ice, sparkling water.",
          "hr": "Jagoda pire, limun, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "lemonade_004",
        "name": {
          "en": "Mango Lemonade",
          "hr": "Mango Lemonade"
        },
        "desc": {
          "en": "Mango puree, lemon, ice and sparkling water.",
          "hr": "Mango pire, limun, led i gazirana voda."
        },
        "ingredients": {
          "en": "Mango puree, lemon, ice, sparkling water.",
          "hr": "Mango pire, limun, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "lemonade_005",
        "name": {
          "en": "Berry Lemonade",
          "hr": "Berry Lemonade"
        },
        "desc": {
          "en": "Berries, lemon, ice and sparkling water.",
          "hr": "Bobičasto voće, limun, led i gazirana voda."
        },
        "ingredients": {
          "en": "Mixed berries, lemon, ice, sparkling water.",
          "hr": "Miješano bobičasto voće, limun, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "lemonade_006",
        "name": {
          "en": "Coconut Lemonade",
          "hr": "Coconut Lemonade"
        },
        "desc": {
          "en": "Coconut, lemon, ice and sparkling water.",
          "hr": "Kokos, limun, led i gazirana voda."
        },
        "ingredients": {
          "en": "Coconut syrup, lemon, ice, sparkling water.",
          "hr": "Kokos sirup, limun, led, gazirana voda."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "matcha",
    "title": {
      "en": "Matcha Selection",
      "hr": "Matcha izbor"
    },
    "description": {
      "en": "Premium matcha drinks",
      "hr": "Premium matcha napitci"
    },
    "icon": "🍵✨",
    "homeExplore": true,
    "active": true,
    "sort": 12,
    "items": [
      {
        "id": "matcha_001",
        "name": {
          "en": "Matcha Latte",
          "hr": "Matcha Latte"
        },
        "desc": {
          "en": "Premium matcha with milk. Hot or iced.",
          "hr": "Premium matcha s mlijekom. Vrući ili ledeni."
        },
        "ingredients": {
          "en": "Premium matcha, milk.",
          "hr": "Premium matcha, mlijeko."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "matcha_002",
        "name": {
          "en": "Flavored Matcha Latte",
          "hr": "Flavored Matcha Latte"
        },
        "desc": {
          "en": "Hot or iced matcha with vanilla, pistachio, coconut, white chocolate or strawberry.",
          "hr": "Vrući ili ledeni matcha s vanilijom, pistacijom, kokosom, bijelom čokoladom ili jagodom."
        },
        "ingredients": {
          "en": "Premium matcha, milk, chosen syrup.",
          "hr": "Premium matcha, mlijeko, odabrani sirup."
        },
        "price": "€3.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "matcha_003",
        "name": {
          "en": "Strawberry Matcha",
          "hr": "Strawberry Matcha"
        },
        "desc": {
          "en": "Premium matcha, milk and strawberry puree.",
          "hr": "Premium matcha, mlijeko i pire od jagode."
        },
        "ingredients": {
          "en": "Premium matcha, milk, strawberry puree.",
          "hr": "Premium matcha, mlijeko, jagoda pire."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "matcha_004",
        "name": {
          "en": "Mango Matcha Fusion",
          "hr": "Mango Matcha Fusion"
        },
        "desc": {
          "en": "Premium matcha with mango.",
          "hr": "Premium matcha s mangom."
        },
        "ingredients": {
          "en": "Premium matcha, milk, mango puree.",
          "hr": "Premium matcha, mlijeko, mango pire."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "matcha_005",
        "name": {
          "en": "Coconut Mango Matcha",
          "hr": "Coconut Mango Matcha"
        },
        "desc": {
          "en": "Premium matcha, mango puree, coconut and milk.",
          "hr": "Premium matcha, mango pire, kokos i mlijeko."
        },
        "ingredients": {
          "en": "Premium matcha, mango puree, coconut syrup, milk.",
          "hr": "Premium matcha, mango pire, kokos sirup, mlijeko."
        },
        "price": "€4.00",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "matcha_006",
        "name": {
          "en": "Matcha Espresso Fusion",
          "hr": "Matcha Espresso Fusion"
        },
        "desc": {
          "en": "Matcha latte with a shot of espresso.",
          "hr": "Matcha latte s dozom espressa."
        },
        "ingredients": {
          "en": "Premium matcha, milk, espresso.",
          "hr": "Premium matcha, mlijeko, espresso."
        },
        "price": "€4.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "matcha_007",
        "name": {
          "en": "Pistachio Matcha",
          "hr": "Pistachio Matcha"
        },
        "desc": {
          "en": "Premium matcha, milk and pistachio cream.",
          "hr": "Premium matcha, mlijeko i pistacija krema."
        },
        "ingredients": {
          "en": "Premium matcha, milk, pistachio cream.",
          "hr": "Premium matcha, mlijeko, pistacija krema."
        },
        "price": "€4.00",
        "isNew": true,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "smoothies",
    "title": {
      "en": "Smoothies",
      "hr": "Smoothieji"
    },
    "description": {
      "en": "Fruit smoothies and creamy blends",
      "hr": "Voćni smoothieji i kremaste mješavine"
    },
    "icon": "🥭",
    "homeExplore": false,
    "active": true,
    "sort": 13,
    "items": [
      {
        "id": "smoothies_001",
        "name": {
          "en": "Tropical Smoothie",
          "hr": "Tropical Smoothie"
        },
        "desc": {
          "en": "Tropical fruit in a refreshing smoothie.",
          "hr": "Tropsko voće u osvježavajućem smoothieju."
        },
        "ingredients": {
          "en": "Tropical fruit, ice, milk or juice.",
          "hr": "Tropsko voće, led, mlijeko ili sok."
        },
        "price": "€4.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_002",
        "name": {
          "en": "Berry Smoothie",
          "hr": "Berry Smoothie"
        },
        "desc": {
          "en": "Berry fruit smoothie.",
          "hr": "Bobičasto voće u smoothieju."
        },
        "ingredients": {
          "en": "Mixed berries, ice, milk or juice.",
          "hr": "Bobičasto voće, led, mlijeko ili sok."
        },
        "price": "€4.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_003",
        "name": {
          "en": "Banana Ice Cream Smoothie",
          "hr": "Banana Ice Cream Smoothie"
        },
        "desc": {
          "en": "Banana and ice cream in a creamy smoothie.",
          "hr": "Banana i sladoled u kremastom smoothieju."
        },
        "ingredients": {
          "en": "Banana, ice cream, milk, ice.",
          "hr": "Banana, sladoled, mlijeko, led."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_004",
        "name": {
          "en": "Berry Chocolate Dream",
          "hr": "Berry Chocolate Dream"
        },
        "desc": {
          "en": "Berries and chocolate.",
          "hr": "Bobičasto voće i čokolada."
        },
        "ingredients": {
          "en": "Berries, chocolate sauce, milk, ice.",
          "hr": "Bobičasto voće, čokoladni umak, mlijeko, led."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_005",
        "name": {
          "en": "Banana Nutella Smoothie",
          "hr": "Banana Nutella Smoothie"
        },
        "desc": {
          "en": "Banana and Nutella.",
          "hr": "Banana i Nutella."
        },
        "ingredients": {
          "en": "Banana, Nutella, milk, ice.",
          "hr": "Banana, Nutella, mlijeko, led."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_006",
        "name": {
          "en": "Oreo Ice Smoothie",
          "hr": "Oreo Ice Smoothie"
        },
        "desc": {
          "en": "Oreo smoothie with ice.",
          "hr": "Oreo smoothie s ledom."
        },
        "ingredients": {
          "en": "Oreo, milk, ice.",
          "hr": "Oreo, mlijeko, led."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_007",
        "name": {
          "en": "Mango Coconut Smoothie",
          "hr": "Mango Coconut Smoothie"
        },
        "desc": {
          "en": "Mango, coconut, ice and milk.",
          "hr": "Mango, kokos, led i mlijeko."
        },
        "ingredients": {
          "en": "Mango puree, coconut syrup, milk, ice.",
          "hr": "Mango pire, kokos sirup, mlijeko, led."
        },
        "price": "€4.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "smoothies_008",
        "name": {
          "en": "Strawberry Vanilla Smoothie",
          "hr": "Strawberry Vanilla Smoothie"
        },
        "desc": {
          "en": "Strawberry, vanilla, ice and milk.",
          "hr": "Jagoda, vanilija, led i mlijeko."
        },
        "ingredients": {
          "en": "Strawberry puree, vanilla syrup, milk, ice.",
          "hr": "Jagoda pire, vanilija sirup, mlijeko, led."
        },
        "price": "€4.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "coffee_milkshakes",
    "title": {
      "en": "Coffee Milkshakes",
      "hr": "Milkshake s kavom"
    },
    "description": {
      "en": "Coffee milkshakes with dessert flavors",
      "hr": "Milkshakeovi s kavom i desertnim okusima"
    },
    "icon": "🥤☕",
    "homeExplore": false,
    "active": true,
    "sort": 14,
    "items": [
      {
        "id": "coffee_milkshakes_001",
        "name": {
          "en": "Oreo Coffee Milkshake",
          "hr": "Oreo Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with Oreo.",
          "hr": "Milkshake s kavom i Oreom."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, Oreo.",
          "hr": "Espresso, mlijeko, sladoled, Oreo."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_milkshakes_002",
        "name": {
          "en": "Lotus Coffee Milkshake",
          "hr": "Lotus Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with Lotus biscuit.",
          "hr": "Milkshake s kavom i Lotus keksom."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, Lotus biscuit.",
          "hr": "Espresso, mlijeko, sladoled, Lotus keks."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_milkshakes_003",
        "name": {
          "en": "Kinder Coffee Milkshake",
          "hr": "Kinder Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with Kinder flavor.",
          "hr": "Milkshake s kavom i Kinder okusom."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, Kinder flavor.",
          "hr": "Espresso, mlijeko, sladoled, Kinder okus."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_milkshakes_004",
        "name": {
          "en": "Peanut Butter Coffee Milkshake",
          "hr": "Peanut Butter Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with peanut butter.",
          "hr": "Milkshake s kavom i maslacem od kikirikija."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, peanut butter.",
          "hr": "Espresso, mlijeko, sladoled, maslac od kikirikija."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_milkshakes_005",
        "name": {
          "en": "Kit Kat Coffee Milkshake",
          "hr": "Kit Kat Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with Kit Kat flavor.",
          "hr": "Milkshake s kavom i Kit Kat okusom."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, Kit Kat.",
          "hr": "Espresso, mlijeko, sladoled, Kit Kat."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_milkshakes_006",
        "name": {
          "en": "Caramel Almond Coffee Milkshake",
          "hr": "Caramel Almond Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with caramel and almond.",
          "hr": "Milkshake s kavom, karamelom i bademom."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, caramel, almond.",
          "hr": "Espresso, mlijeko, sladoled, karamela, badem."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "coffee_milkshakes_007",
        "name": {
          "en": "Tiramisu Coffee Milkshake",
          "hr": "Tiramisu Coffee Milkshake"
        },
        "desc": {
          "en": "Coffee milkshake with tiramisu flavor.",
          "hr": "Milkshake s kavom i tiramisu okusom."
        },
        "ingredients": {
          "en": "Espresso, milk, ice cream, tiramisu flavor.",
          "hr": "Espresso, mlijeko, sladoled, aroma tiramisua."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "protein",
    "title": {
      "en": "Protein Drinks",
      "hr": "Proteinski napitci"
    },
    "description": {
      "en": "Low sugar protein shakes",
      "hr": "Proteinski napitci s malo šećera"
    },
    "icon": "💪🥤",
    "homeExplore": false,
    "active": true,
    "sort": 15,
    "items": [
      {
        "id": "protein_001",
        "name": {
          "en": "Protein Espresso Shake",
          "hr": "Protein Espresso Shake"
        },
        "desc": {
          "en": "300 ml. Whey protein, milk and espresso. No added sugar.",
          "hr": "300 ml. Whey protein, mlijeko, espresso. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk, espresso.",
          "hr": "Whey protein, mlijeko, espresso."
        },
        "price": "€5.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "protein_002",
        "name": {
          "en": "Protein Vanilla Shake",
          "hr": "Protein Vanilla Shake"
        },
        "desc": {
          "en": "300 ml. Whey protein, milk and vanilla aroma. No added sugar.",
          "hr": "300 ml. Whey protein, mlijeko, aroma vanilije. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk, vanilla aroma.",
          "hr": "Whey protein, mlijeko, aroma vanilije."
        },
        "price": "€5.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "protein_003",
        "name": {
          "en": "Protein Cocoa Shake",
          "hr": "Protein Cocoa Shake"
        },
        "desc": {
          "en": "300 ml. Whey protein, milk and unsweetened cocoa. No added sugar.",
          "hr": "300 ml. Whey protein, mlijeko, nezaslađeni kakao. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk, unsweetened cocoa.",
          "hr": "Whey protein, mlijeko, nezaslađeni kakao."
        },
        "price": "€6.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "protein_004",
        "name": {
          "en": "Protein Cinnamon Coffee Shake",
          "hr": "Protein Cinnamon Coffee Shake"
        },
        "desc": {
          "en": "300 ml. Whey protein, milk, espresso and cinnamon. No added sugar.",
          "hr": "300 ml. Whey protein, mlijeko, espresso, cimet. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk, espresso, cinnamon.",
          "hr": "Whey protein, mlijeko, espresso, cimet."
        },
        "price": "€6.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "protein_005",
        "name": {
          "en": "Protein Berry Smoothie",
          "hr": "Protein Berry Smoothie"
        },
        "desc": {
          "en": "300 ml. Whey protein, milk or plant-based milk and mixed berries. No added sugar.",
          "hr": "300 ml. Whey protein, mlijeko ili biljno mlijeko, bobičasto voće. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk or plant-based milk, mixed berries.",
          "hr": "Whey protein, mlijeko ili biljno mlijeko, bobičasto voće."
        },
        "price": "€6.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "protein_006",
        "name": {
          "en": "Protein Matcha Shake",
          "hr": "Protein Matcha Shake"
        },
        "desc": {
          "en": "300 ml. Whey protein, milk and premium matcha. No added sugar.",
          "hr": "300 ml. Whey protein, mlijeko, premium matcha. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk, premium matcha.",
          "hr": "Whey protein, mlijeko, premium matcha."
        },
        "price": "€6.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "protein_007",
        "name": {
          "en": "Protein Pistachio Shake",
          "hr": "Protein Pistachio Shake"
        },
        "desc": {
          "en": "Whey protein, milk and pistachio cream. No added sugar.",
          "hr": "Whey protein, mlijeko, pistacija krema. Bez dodanog šećera."
        },
        "ingredients": {
          "en": "Whey protein, milk, pistachio cream.",
          "hr": "Whey protein, mlijeko, pistacija krema."
        },
        "price": "€6.70",
        "isNew": true,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "kids_milk",
    "title": {
      "en": "Kids & Milk Drinks",
      "hr": "Dječji i mliječni napitci"
    },
    "description": {
      "en": "Milk drinks and child-friendly options",
      "hr": "Mliječni napitci i opcije za djecu"
    },
    "icon": "🧸🥛",
    "homeExplore": false,
    "active": true,
    "sort": 16,
    "items": [
      {
        "id": "kids_milk_001",
        "name": {
          "en": "Chocolate Milk",
          "hr": "Čokoladno mlijeko"
        },
        "desc": {
          "en": "Hot or cold milk with chocolate.",
          "hr": "Toplo ili hladno mlijeko s čokoladom."
        },
        "ingredients": {
          "en": "Milk, chocolate sauce.",
          "hr": "Mlijeko, čokoladni umak."
        },
        "price": "€3.20",
        "isNew": true,
        "isFeatured": false,
        "isKids": true,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "kids_milk_002",
        "name": {
          "en": "White Chocolate Milk",
          "hr": "Bijela čokolada mlijeko"
        },
        "desc": {
          "en": "Hot or cold milk with white chocolate.",
          "hr": "Toplo ili hladno mlijeko s bijelom čokoladom."
        },
        "ingredients": {
          "en": "Milk, white chocolate sauce.",
          "hr": "Mlijeko, umak od bijele čokolade."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": true,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "kids_milk_003",
        "name": {
          "en": "Strawberry Milk",
          "hr": "Mlijeko jagoda"
        },
        "desc": {
          "en": "Milk and strawberry puree.",
          "hr": "Mlijeko i pire od jagode."
        },
        "ingredients": {
          "en": "Milk, strawberry puree.",
          "hr": "Mlijeko, jagoda pire."
        },
        "price": "€3.50",
        "isNew": true,
        "isFeatured": false,
        "isKids": true,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "kids_milk_004",
        "name": {
          "en": "Vanilla Milk",
          "hr": "Mlijeko vanilija"
        },
        "desc": {
          "en": "Milk with vanilla flavor.",
          "hr": "Mlijeko s okusom vanilije."
        },
        "ingredients": {
          "en": "Milk, vanilla syrup.",
          "hr": "Mlijeko, vanilija sirup."
        },
        "price": "€3.20",
        "isNew": true,
        "isFeatured": false,
        "isKids": true,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "kids_milk_005",
        "name": {
          "en": "Pistachio Milk",
          "hr": "Mlijeko pistacija"
        },
        "desc": {
          "en": "Milk and premium pistachio cream.",
          "hr": "Mlijeko i premium pistacija krema."
        },
        "ingredients": {
          "en": "Milk, pistachio cream.",
          "hr": "Mlijeko, pistacija krema."
        },
        "price": "€3.80",
        "isNew": true,
        "isFeatured": false,
        "isKids": true,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "kids_milk_006",
        "name": {
          "en": "Babyccino",
          "hr": "Babyccino"
        },
        "desc": {
          "en": "Warm milk foam with chocolate topping.",
          "hr": "Topla mliječna pjena s čokoladnim posipom."
        },
        "ingredients": {
          "en": "Warm milk foam, chocolate topping.",
          "hr": "Topla mliječna pjena, čokoladni posip."
        },
        "price": "€1.80",
        "isNew": true,
        "isFeatured": false,
        "isKids": true,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "soft_drinks",
    "title": {
      "en": "Soft Drinks",
      "hr": "Bezalkoholna pića"
    },
    "description": {
      "en": "Bottled and canned soft drinks",
      "hr": "Bezalkoholna pića u boci ili limenci"
    },
    "icon": "🧃",
    "homeExplore": false,
    "active": true,
    "sort": 17,
    "items": [
      {
        "id": "soft_drinks_001",
        "name": {
          "en": "Coca-Cola Can",
          "hr": "Coca-Cola limenka"
        },
        "desc": {
          "en": "Coca-Cola can.",
          "hr": "Coca-Cola can."
        },
        "ingredients": {
          "en": "Coca-Cola Can",
          "hr": "Coca-Cola limenka"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_002",
        "name": {
          "en": "Coca-Cola Zero",
          "hr": "Coca-Cola Zero"
        },
        "desc": {
          "en": "Sugar-free Coca-Cola.",
          "hr": "Sugar-free Coca-Cola."
        },
        "ingredients": {
          "en": "Coca-Cola Zero",
          "hr": "Coca-Cola Zero"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_003",
        "name": {
          "en": "Fanta",
          "hr": "Fanta"
        },
        "desc": {
          "en": "Orange soft drink.",
          "hr": "Orange soft drink."
        },
        "ingredients": {
          "en": "Fanta",
          "hr": "Fanta"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_004",
        "name": {
          "en": "Fanta Zero",
          "hr": "Fanta Zero"
        },
        "desc": {
          "en": "Sugar-free Fanta.",
          "hr": "Sugar-free Fanta."
        },
        "ingredients": {
          "en": "Fanta Zero",
          "hr": "Fanta Zero"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_005",
        "name": {
          "en": "Orangina Orange",
          "hr": "Orangina Orange"
        },
        "desc": {
          "en": "Sparkling orange drink.",
          "hr": "Sparkling orange drink."
        },
        "ingredients": {
          "en": "Orangina Orange",
          "hr": "Orangina Orange"
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_006",
        "name": {
          "en": "Orangina Blood Orange",
          "hr": "Orangina Blood Orange"
        },
        "desc": {
          "en": "Sparkling blood orange drink.",
          "hr": "Sparkling blood orange drink."
        },
        "ingredients": {
          "en": "Orangina Blood Orange",
          "hr": "Orangina Blood Orange"
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_007",
        "name": {
          "en": "Orangina Citrus Mix",
          "hr": "Orangina Citrus Mix"
        },
        "desc": {
          "en": "Sparkling citrus mix drink.",
          "hr": "Sparkling citrus mix drink."
        },
        "ingredients": {
          "en": "Orangina Citrus Mix",
          "hr": "Orangina Citrus Mix"
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_008",
        "name": {
          "en": "Cedevita Orange 0.25L",
          "hr": "Cedevita naranča 0.25L"
        },
        "desc": {
          "en": "Cedevita orange.",
          "hr": "Cedevita orange."
        },
        "ingredients": {
          "en": "Cedevita Orange 0.25L",
          "hr": "Cedevita naranča 0.25L"
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_009",
        "name": {
          "en": "Cedevita Lemon 0.25L",
          "hr": "Cedevita limun 0.25L"
        },
        "desc": {
          "en": "Cedevita lemon.",
          "hr": "Cedevita lemon."
        },
        "ingredients": {
          "en": "Cedevita Lemon 0.25L",
          "hr": "Cedevita limun 0.25L"
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_010",
        "name": {
          "en": "Cedevita Red Orange 0.25L",
          "hr": "Cedevita crvena naranča 0.25L"
        },
        "desc": {
          "en": "Cedevita red orange.",
          "hr": "Cedevita red orange."
        },
        "ingredients": {
          "en": "Cedevita Red Orange 0.25L",
          "hr": "Cedevita crvena naranča 0.25L"
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_011",
        "name": {
          "en": "Cedevita Multivitamin 0.25L",
          "hr": "Cedevita multivitamin 0.25L"
        },
        "desc": {
          "en": "Cedevita multivitamin.",
          "hr": "Cedevita multivitamin."
        },
        "ingredients": {
          "en": "Cedevita Multivitamin 0.25L",
          "hr": "Cedevita multivitamin 0.25L"
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_012",
        "name": {
          "en": "Still Water",
          "hr": "Negazirana voda"
        },
        "desc": {
          "en": "Still water.",
          "hr": "Still water."
        },
        "ingredients": {
          "en": "Still Water",
          "hr": "Negazirana voda"
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "soft_drinks_013",
        "name": {
          "en": "Sparkling Water",
          "hr": "Gazirana voda"
        },
        "desc": {
          "en": "Sparkling water.",
          "hr": "Sparkling water."
        },
        "ingredients": {
          "en": "Sparkling Water",
          "hr": "Gazirana voda"
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "beer",
    "title": {
      "en": "Beer",
      "hr": "Pivo"
    },
    "description": {
      "en": "Beer and non-alcoholic beer",
      "hr": "Pivo i bezalkoholno pivo"
    },
    "icon": "🍺",
    "homeExplore": false,
    "active": true,
    "sort": 18,
    "items": [
      {
        "id": "beer_001",
        "name": {
          "en": "Karlovačko 0.5L",
          "hr": "Karlovačko 0.5L"
        },
        "desc": {
          "en": "Alcoholic beer.",
          "hr": "Alcoholic beer."
        },
        "ingredients": {
          "en": "Karlovačko 0.5L",
          "hr": "Karlovačko 0.5L"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "beer_002",
        "name": {
          "en": "Heineken 0.33L",
          "hr": "Heineken 0.33L"
        },
        "desc": {
          "en": "Alcoholic beer.",
          "hr": "Alcoholic beer."
        },
        "ingredients": {
          "en": "Heineken 0.33L",
          "hr": "Heineken 0.33L"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "beer_003",
        "name": {
          "en": "Desperados",
          "hr": "Desperados"
        },
        "desc": {
          "en": "Alcoholic beer.",
          "hr": "Alcoholic beer."
        },
        "ingredients": {
          "en": "Desperados",
          "hr": "Desperados"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "beer_004",
        "name": {
          "en": "Heineken 0.0",
          "hr": "Heineken 0.0"
        },
        "desc": {
          "en": "Non-alcoholic beer.",
          "hr": "Non-alcoholic beer."
        },
        "ingredients": {
          "en": "Heineken 0.0",
          "hr": "Heineken 0.0"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "beer_005",
        "name": {
          "en": "Radler 0.0",
          "hr": "Radler 0.0"
        },
        "desc": {
          "en": "Non-alcoholic radler.",
          "hr": "Non-alcoholic radler."
        },
        "ingredients": {
          "en": "Radler 0.0",
          "hr": "Radler 0.0"
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "wine",
    "title": {
      "en": "Wine",
      "hr": "Vinska karta"
    },
    "description": {
      "en": "Wine by glass and bottle",
      "hr": "Vino na čašu i bocu"
    },
    "icon": "🍷",
    "homeExplore": true,
    "active": true,
    "sort": 19,
    "items": [
      {
        "id": "wine_001",
        "name": {
          "en": "Krauthaker Graševina",
          "hr": "Krauthaker Graševina"
        },
        "desc": {
          "en": "White wine. Fresh, elegant and balanced Croatian wine from Krauthaker Winery, Kutjevo.",
          "hr": "Bijelo vino. Svježe, elegantno i uravnoteženo hrvatsko vino iz vinarije Krauthaker, Kutjevo."
        },
        "ingredients": {
          "en": "White wine.",
          "hr": "Bijelo vino."
        },
        "price": "€2.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_002",
        "name": {
          "en": "Krauthaker Sauvignon Vidim",
          "hr": "Krauthaker Sauvignon Vidim"
        },
        "desc": {
          "en": "White wine. Aromatic, fresh and fruity.",
          "hr": "Bijelo vino. Aromatično, svježe i voćno."
        },
        "ingredients": {
          "en": "White wine.",
          "hr": "Bijelo vino."
        },
        "price": "€3.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_003",
        "name": {
          "en": "Krauthaker Pinot Crni",
          "hr": "Krauthaker Pinot Crni"
        },
        "desc": {
          "en": "Red wine. Smooth and elegant with fine fruit notes.",
          "hr": "Crno vino. Nježno i elegantno s finim voćnim notama."
        },
        "ingredients": {
          "en": "Red wine.",
          "hr": "Crno vino."
        },
        "price": "€3.60",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_004",
        "name": {
          "en": "Krauthaker Merlot",
          "hr": "Krauthaker Merlot"
        },
        "desc": {
          "en": "Red wine. Soft, rounded and full-bodied.",
          "hr": "Crno vino. Mekano, zaokruženo i puno."
        },
        "ingredients": {
          "en": "Red wine.",
          "hr": "Crno vino."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_005",
        "name": {
          "en": "Gemišt 2 dcl",
          "hr": "Gemišt 2 dcl"
        },
        "desc": {
          "en": "1 dcl Krauthaker Graševina + 1 dcl sparkling water.",
          "hr": "1 dcl Krauthaker Graševina + 1 dcl mineralna voda."
        },
        "ingredients": {
          "en": "Krauthaker Graševina, sparkling water.",
          "hr": "Krauthaker Graševina, mineralna voda."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "wine_pairing",
    "title": {
      "en": "Wine Pairing & Plates",
      "hr": "Plata uz vino"
    },
    "description": {
      "en": "Wine plates and pairing combos",
      "hr": "Plate i kombinacije uz vino"
    },
    "icon": "🧀🍷",
    "homeExplore": true,
    "active": true,
    "sort": 20,
    "items": [
      {
        "id": "wine_pairing_001",
        "name": {
          "en": "Wine Pairing Plate for One",
          "hr": "Plata uz vino za jednu osobu"
        },
        "desc": {
          "en": "One cheese selection, kulen sausage, prosciutto, seasonal fruit and crispy bites.",
          "hr": "Jedna vrsta sira, kulen kobasica, pršut, sezonsko voće i hrskavi zalogaji."
        },
        "ingredients": {
          "en": "Cheese, kulen, prosciutto, seasonal fruit, crispy bites.",
          "hr": "Sir, kulen, pršut, sezonsko voće, hrskavi zalogaji."
        },
        "price": "€8.50",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_pairing_002",
        "name": {
          "en": "1 dcl Wine + Wine Pairing Plate for One",
          "hr": "1 dcl vino + plata za jednu osobu"
        },
        "desc": {
          "en": "Choose one wine by 1 dcl with pairing plate.",
          "hr": "Odabir vina 1 dcl uz platu."
        },
        "ingredients": {
          "en": "1 dcl wine, cheese, kulen, prosciutto, fruit, crispy bites.",
          "hr": "1 dcl vino, sir, kulen, pršut, voće, hrskavi zalogaji."
        },
        "price": "€11.50",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_pairing_003",
        "name": {
          "en": "Bottle of White Wine + Wine Pairing Plate for 2",
          "hr": "Boca bijelog vina + plata za 2"
        },
        "desc": {
          "en": "Available with Graševina or Sauvignon Vidim.",
          "hr": "Dostupno uz Graševinu ili Sauvignon Vidim."
        },
        "ingredients": {
          "en": "Bottle of white wine, pairing plate for 2.",
          "hr": "Boca bijelog vina, plata za 2."
        },
        "price": "€34.00",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      },
      {
        "id": "wine_pairing_004",
        "name": {
          "en": "Bottle of Red Wine + Wine Pairing Plate for 2",
          "hr": "Boca crnog vina + plata za 2"
        },
        "desc": {
          "en": "Available with Pinot Crni or Merlot.",
          "hr": "Dostupno uz Pinot Crni ili Merlot."
        },
        "ingredients": {
          "en": "Bottle of red wine, pairing plate for 2.",
          "hr": "Boca crnog vina, plata za 2."
        },
        "price": "€39.00",
        "isNew": false,
        "isFeatured": true,
        "isKids": false,
        "isAlcoholic": true,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "ask staff"
      }
    ]
  },
  {
    "id": "premium_ciabatta",
    "title": {
      "en": "Premium Ciabatta Sandwiches",
      "hr": "Premium ciabatta sendviči"
    },
    "description": {
      "en": "Grilled ciabatta sandwiches. Prices currently kept from previous app until final sandwich prices are approved.",
      "hr": "Grilani ciabatta sendviči. Cijene su privremeno zadržane iz prethodne aplikacije do konačne potvrde."
    },
    "icon": "🥪",
    "homeExplore": true,
    "active": true,
    "sort": 21,
    "items": [
      {
        "id": "SAN-001",
        "name": {
          "en": "Chicken Pesto & Mozzarella Ciabatta",
          "hr": "Ciabatta s piletinom, pestom i mozzarellom"
        },
        "desc": {
          "en": "Ciabatta with prepared chicken, mozzarella and pesto sauce. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s pripremljenom piletinom, mozzarellom i pesto umakom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, chicken, mozzarella, pesto.",
          "hr": "Ciabatta, piletina, mozzarella, pesto."
        },
        "price": "€3.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, nuts possible"
      },
      {
        "id": "SAN-002",
        "name": {
          "en": "Tuna Melt Ciabatta",
          "hr": "Tuna melt ciabatta"
        },
        "desc": {
          "en": "Ciabatta with tuna filling, mozzarella and crispy onion. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s nadjevom od tune, mozzarellom i hrskavim lukom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, tuna filling, mozzarella, crispy onion.",
          "hr": "Ciabatta, nadjev od tune, mozzarella, hrskavi luk."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, fish, milk, egg, mustard"
      },
      {
        "id": "SAN-003",
        "name": {
          "en": "Garlic Margherita Ciabatta",
          "hr": "Garlic Margherita ciabatta"
        },
        "desc": {
          "en": "Ciabatta with tomato sauce, garlic olive sauce and mozzarella. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s umakom od rajčice, umakom od češnjaka i maslinovog ulja te mozzarellom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, tomato sauce, garlic olive sauce, mozzarella.",
          "hr": "Ciabatta, umak od rajčice, umak češnjak-maslina, mozzarella."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "SAN-004",
        "name": {
          "en": "Cheesy Mortadella Ciabatta",
          "hr": "Ciabatta s mortadelom i sirom"
        },
        "desc": {
          "en": "Ciabatta with mortadella and mozzarella. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s mortadelom i mozzarellom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, mortadella, mozzarella.",
          "hr": "Ciabatta, mortadela, mozzarella."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "SAN-005",
        "name": {
          "en": "Avocado Chicken Ciabatta",
          "hr": "Ciabatta s piletinom i avokadom"
        },
        "desc": {
          "en": "Ciabatta with chicken, guacamole and mozzarella. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s piletinom, guacamoleom i mozzarellom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, chicken, guacamole, mozzarella.",
          "hr": "Ciabatta, piletina, guacamole, mozzarella."
        },
        "price": "€4.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "SAN-006",
        "name": {
          "en": "Turkey Ham & Mozzarella Ciabatta",
          "hr": "Ciabatta s purećom šunkom i mozzarellom"
        },
        "desc": {
          "en": "Ciabatta with turkey ham, mozzarella, honey mustard and crispy onion. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s purećom šunkom, mozzarellom, honey mustard umakom i hrskavim lukom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, turkey ham, mozzarella, honey mustard, crispy onion.",
          "hr": "Ciabatta, pureća šunka, mozzarella, honey mustard, hrskavi luk."
        },
        "price": "€4.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, egg, mustard"
      },
      {
        "id": "SAN-007",
        "name": {
          "en": "Egg & Gouda Crunch Ciabatta",
          "hr": "Ciabatta s jajem i goudom"
        },
        "desc": {
          "en": "Ciabatta with boiled egg, Gouda, egg sandwich sauce, pickles and crispy onion. Price currently kept from app until final sandwich prices are approved.",
          "hr": "Ciabatta s kuhanim jajem, goudom, umakom za sendvič s jajem, kiselim krastavcima i hrskavim lukom. Cijena je privremeno zadržana iz aplikacije do konačne potvrde cijena sendviča."
        },
        "ingredients": {
          "en": "Ciabatta, egg, Gouda, egg sauce, pickles, crispy onion.",
          "hr": "Ciabatta, jaje, Gouda, umak od jaja, kiseli krastavci, hrskavi luk."
        },
        "price": "€3.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, egg, milk, mustard"
      }
    ]
  },
  {
    "id": "tacos",
    "title": {
      "en": "Premium Tacos",
      "hr": "Premium tacos"
    },
    "description": {
      "en": "Premium tacos. Each taco portion includes one 90ml side sauce.",
      "hr": "Premium tacos. Svaka porcija uključuje jedan 90 ml umak sa strane."
    },
    "icon": "🌮",
    "homeExplore": true,
    "active": true,
    "sort": 22,
    "items": [
      {
        "id": "TAC-001",
        "name": {
          "en": "Golden Chicken Taco",
          "hr": "Golden Chicken Taco"
        },
        "desc": {
          "en": "Three tacos with crispy golden chicken, coleslaw, arugula, teriyaki, sesame and one included 90ml side sauce.",
          "hr": "Tri tacosa s hrskavom golden piletinom, coleslaw salatom, rikolom, teriyaki umakom, sezamom i jednim uključenim 90 ml umakom sa strane."
        },
        "ingredients": {
          "en": "Tortilla, crispy chicken, coleslaw, arugula, teriyaki sauce, sesame, side sauce.",
          "hr": "Tortilla, hrskava piletina, coleslaw, rikola, teriyaki umak, sezam, umak sa strane."
        },
        "price": "€7.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, egg, milk, soy, sesame"
      },
      {
        "id": "TAC-002",
        "name": {
          "en": "Crunchy Prawn Taco",
          "hr": "Crunchy Prawn Taco"
        },
        "desc": {
          "en": "Three tacos with crispy prawns, coleslaw, arugula, teriyaki, sesame and one included 90ml side sauce.",
          "hr": "Tri tacosa s hrskavim kozicama, coleslaw salatom, rikolom, teriyaki umakom, sezamom i jednim uključenim 90 ml umakom sa strane."
        },
        "ingredients": {
          "en": "Tortilla, prawns, coleslaw, arugula, teriyaki sauce, sesame, side sauce.",
          "hr": "Tortilla, kozice, coleslaw, rikola, teriyaki umak, sezam, umak sa strane."
        },
        "price": "€7.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, egg, milk, crustaceans, soy, sesame"
      },
      {
        "id": "TAC-003",
        "name": {
          "en": "Tuna Taco",
          "hr": "Tuna Taco"
        },
        "desc": {
          "en": "Three tacos with tuna, sweet corn, pickles, pico de gallo, arugula, mayo wasabi and crispy onion. Includes one 90ml side sauce.",
          "hr": "Tri tacosa s tunom, kukuruzom, kiselim krastavcima, pico de gallo, rikolom, mayo wasabi umakom i hrskavim lukom. Uključuje jedan 90 ml umak sa strane."
        },
        "ingredients": {
          "en": "Tortilla, tuna, corn, pickles, pico de gallo, arugula, mayo wasabi, crispy onion, side sauce.",
          "hr": "Tortilla, tuna, kukuruz, kiseli krastavci, pico de gallo, rikola, mayo wasabi, hrskavi luk, umak sa strane."
        },
        "price": "€7.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, fish, egg, mustard, soy"
      },
      {
        "id": "TAC-004",
        "name": {
          "en": "Chicken Curry Taco",
          "hr": "Chicken Curry Taco"
        },
        "desc": {
          "en": "Three tacos with chicken thigh, basmati rice, curry mayo and herbs. Includes one 90ml side sauce.",
          "hr": "Tri tacosa s pilećim zabatkom, basmati rižom, curry mayo umakom i začinskim biljem. Uključuje jedan 90 ml umak sa strane."
        },
        "ingredients": {
          "en": "Tortilla, chicken thigh, basmati rice, curry mayo, herbs, side sauce.",
          "hr": "Tortilla, pileći zabatak, basmati riža, curry mayo, začinsko bilje, umak sa strane."
        },
        "price": "€7.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, egg, mustard"
      },
      {
        "id": "TAC-005",
        "name": {
          "en": "Picante Chicken Taco",
          "hr": "Picante Chicken Taco"
        },
        "desc": {
          "en": "Three tacos with pulled/chopped chicken, mozzarella, sriracha mayo and crispy onion. Includes one 90ml side sauce.",
          "hr": "Tri tacosa s piletinom, mozzarellom, sriracha mayo umakom i hrskavim lukom. Uključuje jedan 90 ml umak sa strane."
        },
        "ingredients": {
          "en": "Tortilla, chicken, mozzarella, sriracha mayo, crispy onion, side sauce.",
          "hr": "Tortilla, piletina, mozzarella, sriracha mayo, hrskavi luk, umak sa strane."
        },
        "price": "€7.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, egg"
      },
      {
        "id": "TAC-006",
        "name": {
          "en": "Mango Chicken Taco",
          "hr": "Mango Chicken Taco"
        },
        "desc": {
          "en": "Three tacos with crispy chicken, coleslaw, mango sauce, arugula and sesame. Includes one 90ml side sauce.",
          "hr": "Tri tacosa s hrskavom piletinom, coleslaw salatom, mango umakom, rikolom i sezamom. Uključuje jedan 90 ml umak sa strane."
        },
        "ingredients": {
          "en": "Tortilla, crispy chicken, coleslaw, mango sauce, arugula, sesame, side sauce.",
          "hr": "Tortilla, hrskava piletina, coleslaw, mango umak, rikola, sezam, umak sa strane."
        },
        "price": "€8.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, egg, milk possible, sesame"
      },
      {
        "id": "TAC-007",
        "name": {
          "en": "Teriyaki Chicken Taco",
          "hr": "Teriyaki Chicken Taco"
        },
        "desc": {
          "en": "Three tacos with chicken thigh, basmati rice, teriyaki sauce, sesame and herbs. Includes one 90ml side sauce.",
          "hr": "Tri tacosa s pilećim zabatkom, basmati rižom, teriyaki umakom, sezamom i začinskim biljem. Uključuje jedan 90 ml umak sa strane."
        },
        "ingredients": {
          "en": "Tortilla, chicken thigh, basmati rice, teriyaki sauce, sesame, herbs, side sauce.",
          "hr": "Tortilla, pileći zabatak, basmati riža, teriyaki umak, sezam, začinsko bilje, umak sa strane."
        },
        "price": "€8.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, soy, sesame"
      }
    ]
  },
  {
    "id": "tapas",
    "title": {
      "en": "Tapas",
      "hr": "Tapas"
    },
    "description": {
      "en": "Choose tapas flavors. Served with tortilla chips or focaccia upgrade.",
      "hr": "Odaberite okuse tapasa. Poslužuje se s tortilla čipsom ili nadoplatom za focacciu."
    },
    "icon": "<img src=\"assets/tapas_icon_clean.png\" alt=\"Tapas\">",
    "homeExplore": true,
    "active": true,
    "sort": 23,
    "items": [
      {
        "id": "TAP-002",
        "name": {
          "en": "Tapas Duo",
          "hr": "Tapas Duo"
        },
        "desc": {
          "en": "Choose 2 tapas flavors. Served as 4 mini scoops with tortilla chips.",
          "hr": "Odaberite 2 okusa tapasa. Poslužuje se kao 4 mini kuglice s tortilla čipsom."
        },
        "ingredients": {
          "en": "Two tapas flavors, tortilla chips.",
          "hr": "Dva okusa tapasa, tortilla čips."
        },
        "price": "€5.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "TAP-003",
        "name": {
          "en": "Tapas Trio",
          "hr": "Tapas Trio"
        },
        "desc": {
          "en": "Choose 3 tapas flavors. Served as 6 mini scoops with tortilla chips.",
          "hr": "Odaberite 3 okusa tapasa. Poslužuje se kao 6 mini kuglica s tortilla čipsom."
        },
        "ingredients": {
          "en": "Three tapas flavors, tortilla chips.",
          "hr": "Tri okusa tapasa, tortilla čips."
        },
        "price": "€8.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "TAP-004",
        "name": {
          "en": "Tapas Quartet",
          "hr": "Tapas Quartet"
        },
        "desc": {
          "en": "Choose 4 tapas flavors. Served as 8 mini scoops with tortilla chips.",
          "hr": "Odaberite 4 okusa tapasa. Poslužuje se kao 8 mini kuglica s tortilla čipsom."
        },
        "ingredients": {
          "en": "Four tapas flavors, tortilla chips.",
          "hr": "Četiri okusa tapasa, tortilla čips."
        },
        "price": "€10.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Ask staff"
      },
      {
        "id": "MOD-FOC",
        "name": {
          "en": "Focaccia Upgrade",
          "hr": "Focaccia nadoplata"
        },
        "desc": {
          "en": "Upgrade tapas side from tortilla chips to toasted focaccia.",
          "hr": "Nadoplata za zamjenu tortilla čipsa tostiranom focacciom."
        },
        "ingredients": {
          "en": "Toasted focaccia.",
          "hr": "Tostirana focaccia."
        },
        "price": "€1.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten"
      },
      {
        "id": "SCO-001",
        "name": {
          "en": "House Hummus",
          "hr": "House hummus"
        },
        "desc": {
          "en": "Tapas flavor choice: house hummus.",
          "hr": "Izbor okusa tapasa: house hummus."
        },
        "ingredients": {
          "en": "Chickpeas, tahini, lemon, olive oil, garlic, cumin.",
          "hr": "Slanutak, tahini, limun, maslinovo ulje, češnjak, kumin."
        },
        "price": "€0.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "Sesame"
      },
      {
        "id": "SCO-002",
        "name": {
          "en": "Eggplant Hummus",
          "hr": "Hummus od patlidžana"
        },
        "desc": {
          "en": "Tapas flavor choice: eggplant hummus.",
          "hr": "Izbor okusa tapasa: hummus od patlidžana."
        },
        "ingredients": {
          "en": "Eggplant, chickpeas, tahini, lemon, olive oil, garlic.",
          "hr": "Patlidžan, slanutak, tahini, limun, maslinovo ulje, češnjak."
        },
        "price": "€0.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "Sesame"
      },
      {
        "id": "SCO-003",
        "name": {
          "en": "Tuna Wasabi Cream",
          "hr": "Tuna wasabi krema"
        },
        "desc": {
          "en": "Tapas flavor choice: tuna wasabi cream.",
          "hr": "Izbor okusa tapasa: tuna wasabi krema."
        },
        "ingredients": {
          "en": "Tuna, mayo wasabi sauce, corn, pickles, lemon, herbs.",
          "hr": "Tuna, mayo wasabi umak, kukuruz, kiseli krastavci, limun, začinsko bilje."
        },
        "price": "€0.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "Fish, egg, mustard, soy"
      },
      {
        "id": "SCO-004",
        "name": {
          "en": "Guacamole",
          "hr": "Guacamole"
        },
        "desc": {
          "en": "Tapas flavor choice: guacamole.",
          "hr": "Izbor okusa tapasa: guacamole."
        },
        "ingredients": {
          "en": "Avocado, lemon/lime, olive oil, honey, herbs.",
          "hr": "Avokado, limun/limeta, maslinovo ulje, med, začinsko bilje."
        },
        "price": "€0.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "Ask staff"
      },
      {
        "id": "SCO-005",
        "name": {
          "en": "Creamy Chicken Tapas",
          "hr": "Kremasti pileći tapas"
        },
        "desc": {
          "en": "Tapas flavor choice: creamy chicken tapas.",
          "hr": "Izbor okusa tapasa: kremasti pileći tapas."
        },
        "ingredients": {
          "en": "Chicken, mayonnaise, corn, pickles, sweet mustard, honey, lemon.",
          "hr": "Piletina, majoneza, kukuruz, kiseli krastavci, slatki senf, med, limun."
        },
        "price": "€0.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "Egg, mustard"
      },
      {
        "id": "SCO-006",
        "name": {
          "en": "Smoky Red Bean Cream",
          "hr": "Dimljena krema od crvenog graha"
        },
        "desc": {
          "en": "Tapas flavor choice: smoky red bean cream.",
          "hr": "Izbor okusa tapasa: dimljena krema od crvenog graha."
        },
        "ingredients": {
          "en": "Red kidney beans, tomato sauce, olive oil, garlic, smoked paprika, cumin.",
          "hr": "Crveni grah, umak od rajčice, maslinovo ulje, češnjak, dimljena paprika, kumin."
        },
        "price": "€0.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": false,
        "rewardEligible": false,
        "allergens": "Ask staff"
      }
    ]
  },
  {
    "id": "focaccia_pizza",
    "title": {
      "en": "Focaccia Pizza",
      "hr": "Focaccia pizza"
    },
    "description": {
      "en": "Focaccia pizzas with premium toppings.",
      "hr": "Focaccia pizze s premium dodacima."
    },
    "icon": "🍕",
    "homeExplore": true,
    "active": true,
    "sort": 24,
    "items": [
      {
        "id": "FOC-001",
        "name": {
          "en": "Margherita Focaccia Pizza",
          "hr": "Margherita focaccia pizza"
        },
        "desc": {
          "en": "Focaccia pizza with tomato sauce, mozzarella, olive oil and herbs.",
          "hr": "Focaccia pizza s umakom od rajčice, mozzarellom, maslinovim uljem i začinskim biljem."
        },
        "ingredients": {
          "en": "Focaccia, tomato sauce, mozzarella, olive oil, oregano/basil.",
          "hr": "Focaccia, umak od rajčice, mozzarella, maslinovo ulje, origano/bosiljak."
        },
        "price": "€8.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "FOC-002",
        "name": {
          "en": "Bacon Focaccia Pizza",
          "hr": "Bacon focaccia pizza"
        },
        "desc": {
          "en": "Focaccia pizza with tomato sauce, cheese, bacon and sweet pesto sauce.",
          "hr": "Focaccia pizza s umakom od rajčice, sirom, bacon i slatkim pesto umakom."
        },
        "ingredients": {
          "en": "Focaccia, tomato sauce, cheese, bacon, sweet pesto sauce.",
          "hr": "Focaccia, umak od rajčice, sir, bacon, slatki pesto umak."
        },
        "price": "€9.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, nuts possible"
      },
      {
        "id": "FOC-003",
        "name": {
          "en": "Mortadella Focaccia Pizza",
          "hr": "Mortadella focaccia pizza"
        },
        "desc": {
          "en": "Focaccia pizza with tomato sauce, cheese, mortadella, sweet pesto and arugula.",
          "hr": "Focaccia pizza s umakom od rajčice, sirom, mortadelom, slatkim pestom i rikolom."
        },
        "ingredients": {
          "en": "Focaccia, tomato sauce, cheese, mortadella, sweet pesto, arugula.",
          "hr": "Focaccia, umak od rajčice, sir, mortadela, slatki pesto, rikola."
        },
        "price": "€9.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, nuts possible"
      },
      {
        "id": "FOC-004",
        "name": {
          "en": "Prosciutto Focaccia Pizza",
          "hr": "Prosciutto focaccia pizza"
        },
        "desc": {
          "en": "Focaccia pizza with tomato sauce, cheese, prosciutto, sweet pesto and arugula.",
          "hr": "Focaccia pizza s umakom od rajčice, sirom, pršutom, slatkim pestom i rikolom."
        },
        "ingredients": {
          "en": "Focaccia, tomato sauce, cheese, prosciutto, sweet pesto, arugula.",
          "hr": "Focaccia, umak od rajčice, sir, pršut, slatki pesto, rikola."
        },
        "price": "€9.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, nuts possible"
      },
      {
        "id": "FOC-005",
        "name": {
          "en": "Pesto Chicken Focaccia Pizza",
          "hr": "Pesto chicken focaccia pizza"
        },
        "desc": {
          "en": "Focaccia pizza with sweet pesto sauce, cheese, prepared chicken and arugula.",
          "hr": "Focaccia pizza sa slatkim pesto umakom, sirom, pripremljenom piletinom i rikolom."
        },
        "ingredients": {
          "en": "Focaccia, sweet pesto sauce, cheese, chicken, arugula.",
          "hr": "Focaccia, slatki pesto umak, sir, piletina, rikola."
        },
        "price": "€9.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, nuts possible"
      },
      {
        "id": "FOC-006",
        "name": {
          "en": "Tuna Focaccia Pizza",
          "hr": "Tuna focaccia pizza"
        },
        "desc": {
          "en": "Focaccia pizza with tomato sauce, cheese, tuna, corn, olives and oregano.",
          "hr": "Focaccia pizza s umakom od rajčice, sirom, tunom, kukuruzom, maslinama i origanom."
        },
        "ingredients": {
          "en": "Focaccia, tomato sauce, cheese, tuna, corn, olives, oregano.",
          "hr": "Focaccia, umak od rajčice, sir, tuna, kukuruz, masline, origano."
        },
        "price": "€9.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, fish"
      }
    ]
  },
  {
    "id": "desserts",
    "title": {
      "en": "Desserts",
      "hr": "Deserti"
    },
    "description": {
      "en": "Tiramisu, apple pie, mug cake, soft serve and pastries.",
      "hr": "Tiramisu, pita od jabuka, mug cake, soft serve i peciva."
    },
    "icon": "🧁",
    "homeExplore": true,
    "active": true,
    "sort": 25,
    "items": [
      {
        "id": "DES-001",
        "name": {
          "en": "Classic Tiramisu Cup",
          "hr": "Classic tiramisu cup"
        },
        "desc": {
          "en": "House-made tiramisu cup.",
          "hr": "Domaći tiramisu u čaši."
        },
        "ingredients": {
          "en": "Mascarpone, cream, ladyfingers, coffee, cocoa.",
          "hr": "Mascarpone, vrhnje, piškote, kava, kakao."
        },
        "price": "€3.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk, egg/gluten possible"
      },
      {
        "id": "DES-002",
        "name": {
          "en": "Pistachio Tiramisu Cup",
          "hr": "Pistachio tiramisu cup"
        },
        "desc": {
          "en": "House-made pistachio tiramisu cup.",
          "hr": "Domaći pistachio tiramisu u čaši."
        },
        "ingredients": {
          "en": "Mascarpone, cream, pistachio cream, ladyfingers, pistachio.",
          "hr": "Mascarpone, vrhnje, krema od pistacije, piškote, pistacija."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk, nuts/pistachio, gluten possible"
      },
      {
        "id": "DES-003",
        "name": {
          "en": "Apple Pie",
          "hr": "Pita od jabuka"
        },
        "desc": {
          "en": "House-made apple pie with cinnamon and sour cherry jam.",
          "hr": "Domaća pita od jabuka s cimetom i džemom od višnje."
        },
        "ingredients": {
          "en": "Flour, butter, milk, apple, sugar, cinnamon, sour cherry jam, egg wash.",
          "hr": "Brašno, maslac, mlijeko, jabuka, šećer, cimet, džem od višnje, premaz jajem."
        },
        "price": "€3.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, egg"
      },
      {
        "id": "DES-004",
        "name": {
          "en": "Napoleon Cream Dessert",
          "hr": "Napoleon krem desert"
        },
        "desc": {
          "en": "Puff pastry and whipped cream dessert.",
          "hr": "Desert od lisnatog tijesta i šlaga."
        },
        "ingredients": {
          "en": "Puff pastry, cream, sugar, vanilla, cinnamon.",
          "hr": "Lisnato tijesto, vrhnje, šećer, vanilija, cimet."
        },
        "price": "€4.20",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "DES-005",
        "name": {
          "en": "Langar Warm Mug Cake",
          "hr": "Langar topli mug cake"
        },
        "desc": {
          "en": "Warm microwave mug cake served with vanilla soft serve and sauce choice.",
          "hr": "Topli mug cake iz mikrovalne poslužen s vanilla soft serve sladoledom i umakom po izboru."
        },
        "ingredients": {
          "en": "Mug cake batter, vanilla soft serve, sauce choice.",
          "hr": "Smjesa za mug cake, vanilla soft serve, umak po izboru."
        },
        "price": "€4.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "DES-006A",
        "name": {
          "en": "Plain Vanilla Soft Serve",
          "hr": "Vanilla soft serve"
        },
        "desc": {
          "en": "Plain vanilla soft serve in 250ml cup.",
          "hr": "Vanilla soft serve u čaši 250 ml."
        },
        "ingredients": {
          "en": "Vanilla soft serve base.",
          "hr": "Vanilla soft serve baza."
        },
        "price": "€2.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk, egg possible"
      },
      {
        "id": "DES-006B",
        "name": {
          "en": "Soft Serve with Sauce",
          "hr": "Soft serve s umakom"
        },
        "desc": {
          "en": "Vanilla soft serve with one sauce choice.",
          "hr": "Vanilla soft serve s jednim umakom po izboru."
        },
        "ingredients": {
          "en": "Vanilla soft serve, sauce choice.",
          "hr": "Vanilla soft serve, umak po izboru."
        },
        "price": "€2.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk, egg possible"
      },
      {
        "id": "DES-006C",
        "name": {
          "en": "Soft Serve with Sauce + Nuts",
          "hr": "Soft serve s umakom i orašastim plodovima"
        },
        "desc": {
          "en": "Vanilla soft serve with sauce and nuts.",
          "hr": "Vanilla soft serve s umakom i orašastim plodovima."
        },
        "ingredients": {
          "en": "Vanilla soft serve, sauce, nuts.",
          "hr": "Vanilla soft serve, umak, orašasti plodovi."
        },
        "price": "€3.00",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk, nuts, egg possible"
      },
      {
        "id": "DES-006D",
        "name": {
          "en": "Soft Serve with Pistachio Cream",
          "hr": "Soft serve s kremom od pistacije"
        },
        "desc": {
          "en": "Vanilla soft serve with pistachio cream.",
          "hr": "Vanilla soft serve s kremom od pistacije."
        },
        "ingredients": {
          "en": "Vanilla soft serve, pistachio cream.",
          "hr": "Vanilla soft serve, krema od pistacije."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Milk, nuts/pistachio"
      },
      {
        "id": "DES-007",
        "name": {
          "en": "Chocolate Croissant",
          "hr": "Čokoladni kroasan"
        },
        "desc": {
          "en": "Ready-bought chocolate croissant.",
          "hr": "Gotovi čokoladni kroasan."
        },
        "ingredients": {
          "en": "Chocolate croissant.",
          "hr": "Čokoladni kroasan."
        },
        "price": "€2.70",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      },
      {
        "id": "DES-008",
        "name": {
          "en": "Pistachio Croissant",
          "hr": "Pistachio kroasan"
        },
        "desc": {
          "en": "Ready-bought pistachio croissant.",
          "hr": "Gotovi pistachio kroasan."
        },
        "ingredients": {
          "en": "Pistachio croissant.",
          "hr": "Pistachio kroasan."
        },
        "price": "€3.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk, nuts/pistachio"
      },
      {
        "id": "DES-009",
        "name": {
          "en": "Cruffin",
          "hr": "Cruffin"
        },
        "desc": {
          "en": "Ready-bought cruffin.",
          "hr": "Gotovi cruffin."
        },
        "ingredients": {
          "en": "Cruffin.",
          "hr": "Cruffin."
        },
        "price": "€3.90",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Gluten, milk"
      }
    ]
  },
  {
    "id": "extra_sauces",
    "title": {
      "en": "Extra Sauces",
      "hr": "Dodatni umaci"
    },
    "description": {
      "en": "Extra 90ml sauce cups.",
      "hr": "Dodatne čašice umaka 90 ml."
    },
    "icon": "🥫",
    "homeExplore": false,
    "active": true,
    "sort": 26,
    "items": [
      {
        "id": "ESC-001",
        "name": {
          "en": "Extra Ketchup 90g",
          "hr": "Dodatni ketchup 90g"
        },
        "desc": {
          "en": "Extra 90ml ketchup sauce cup.",
          "hr": "Dodatna čašica ketchup umaka 90 ml."
        },
        "ingredients": {
          "en": "Ketchup.",
          "hr": "Ketchup."
        },
        "price": "€1.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "ESC-002",
        "name": {
          "en": "Extra Mayonnaise 90g",
          "hr": "Dodatna majoneza 90g"
        },
        "desc": {
          "en": "Extra 90ml mayonnaise sauce cup.",
          "hr": "Dodatna čašica majoneze 90 ml."
        },
        "ingredients": {
          "en": "Mayonnaise.",
          "hr": "Majoneza."
        },
        "price": "€1.50",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg"
      },
      {
        "id": "ESC-003",
        "name": {
          "en": "Extra Teriyaki Sauce 90g",
          "hr": "Dodatni teriyaki umak 90g"
        },
        "desc": {
          "en": "Extra 90ml teriyaki sauce cup.",
          "hr": "Dodatna čašica teriyaki umaka 90 ml."
        },
        "ingredients": {
          "en": "Teriyaki sauce.",
          "hr": "Teriyaki umak."
        },
        "price": "€1.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Soy"
      },
      {
        "id": "ESC-004",
        "name": {
          "en": "Extra Sweet Chili Sauce 90g",
          "hr": "Dodatni sweet chili umak 90g"
        },
        "desc": {
          "en": "Extra 90ml sweet chili sauce cup.",
          "hr": "Dodatna čašica sweet chili umaka 90 ml."
        },
        "ingredients": {
          "en": "Sweet chili sauce.",
          "hr": "Sweet chili umak."
        },
        "price": "€1.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "ask staff"
      },
      {
        "id": "ESC-005",
        "name": {
          "en": "Extra Mayo Wasabi Sauce 90g",
          "hr": "Dodatni mayo wasabi umak 90g"
        },
        "desc": {
          "en": "Extra 90ml mayo wasabi sauce cup.",
          "hr": "Dodatna čašica mayo wasabi umaka 90 ml."
        },
        "ingredients": {
          "en": "Mayo wasabi sauce.",
          "hr": "Mayo wasabi umak."
        },
        "price": "€1.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, mustard, soy"
      },
      {
        "id": "ESC-006",
        "name": {
          "en": "Extra Sriracha Mayo Sauce 90g",
          "hr": "Dodatni sriracha mayo umak 90g"
        },
        "desc": {
          "en": "Extra 90ml sriracha mayo sauce cup.",
          "hr": "Dodatna čašica sriracha mayo umaka 90 ml."
        },
        "ingredients": {
          "en": "Sriracha mayo sauce.",
          "hr": "Sriracha mayo umak."
        },
        "price": "€1.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg"
      },
      {
        "id": "ESC-007",
        "name": {
          "en": "Extra Curry Mayo Sauce 90g",
          "hr": "Dodatni curry mayo umak 90g"
        },
        "desc": {
          "en": "Extra 90ml curry mayo sauce cup.",
          "hr": "Dodatna čašica curry mayo umaka 90 ml."
        },
        "ingredients": {
          "en": "Curry mayo sauce.",
          "hr": "Curry mayo umak."
        },
        "price": "€1.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Egg, mustard"
      },
      {
        "id": "ESC-008",
        "name": {
          "en": "Extra Mango Sauce 90g",
          "hr": "Dodatni mango umak 90g"
        },
        "desc": {
          "en": "Extra 90ml mango sauce cup.",
          "hr": "Dodatna čašica mango umaka 90 ml."
        },
        "ingredients": {
          "en": "Mango sauce.",
          "hr": "Mango umak."
        },
        "price": "€1.80",
        "isNew": false,
        "isFeatured": false,
        "isKids": false,
        "isAlcoholic": false,
        "tags": [],
        "available": true,
        "orderable": true,
        "rewardEligible": true,
        "allergens": "Mustard/soy possible"
      }
    ]
  }
];
