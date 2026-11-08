# BrusselsExplorer

Dynamic Web - Project 

BrusselsExplorer is een website voor het vinden, sorteren, opslaan,... van openbare drinkwaterfonteinen in Brussel.

## Gebruike datasets en bronnen

1. Brussels-API link: https://bruxellesdata.opendatasoft.com/explore/assets/fontaines-d-eau-potable-gerees-par-la-ville-de-bruxelles/

2. API-endpoint: https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/fontaines-d-eau-potable-gerees-par-la-ville-de-bruxelles/records/?lang=nl&limit=100

3. Google Maps om route naar een drinkwaterfontein te tonen (Geen Google Maps API gebruikt)


## Technische Vereisten

> DOM Manipulatie
>
> - Elementen selecterenz
>> **Voorbeeld**: document.querySelector() selecteert HTML-elementen en bewaart ze
>
> - Elementen manipuleren
>> **Voorbeeld**: innerHTML maakt resultaat en favorieten rij dynamisch aan, classList.toggle() opent en sluit het favorieten paneel
>
> - Events aan elementen koppelen
>> **Voorbeeld**: bindEvents() gebruikt addEventListener() voor zaken als het typen in het zoekveld of veranderen van de filter
>
>---
>Modern Javascript
>
> - Gebruik van constanten
>> **Voorbeeld**: const API_URL, FAVORITES_KEY, elements
>
> - Template literals
>> **Voorbeeld**: createResultsRow() en renderFavorites() om de API-data dynamisch in HTML te plaatsen
>
> - Iteratie over arrays
>> **Voorbeeld**: Het filteren van resultaten, sorteren van fonteinen, zoeken fonteinen,...
>
> - Array methodes
>> **Voorbeeld**: renderResults() gebruikt filter() en sort() om de array te tonen
>
>> - Functions
>> **Voorbeeld**: renderResults() toont resultaten
>
> - Conditional (ternary) operator (moderne if..else)
>> **Voorbeeld**: renderResults() als er resultaten zijn worden ze getoond, anders is er een melding
>
> - Callback functions
>> **Voorbeeld**: in addEventListener wordt renderResults als callback functie gebruikt wanneer je in het zoekveld typt
>
> - Promises
>> **Voorbeeld**: bij loadFountains() geeft fetch() een promise terug bij het ophalen van de data
>
>---
> Data & API
>
> - Fetch om data op te halen
>> **Voorbeeld**: Brussel API
>
> - JSON manipuleren en weergeven
>> **Voorbeeld**: response.json() zet API-data om naar Javascript
>
>---
> Opslag & Validatie
>
> - Formulier validatie
>> **Voorbeeld**: spaties worden verwijderd met trim(), API-fouten worden gecontroleerd en tonen foutmelding
>
> - Gebruik van LocalStorage 
>> **Voorbeeld**: readFavorites() toont favorieten met FAVORITES_KEY en toggleFavorites() slaat je favoriete plaatsen met localstorage


## Installatie handleiding

1. Download de ZIP van deze github repository
2. Extract de ZIP file in een folder en open deze via VSC (Visual Studio Code)
3. Installeer de 'Live Server' plugin in VSC
4. Start de live-server onderaan in de Code Venster (Go Live)


## Bronnen

Cursus Dynamic Web

https://www.w3schools.com/

https://opendata.brussels.be/pages/home/

CSS Styling en fonts werd uitgewerkt met behulp van van AI tools (Copilot en Claude)

Prompts: Kan je mij helpen met het maken van de styling van mijn website in een eenvoudige zwart-wit en grijze stijl. Wijzig niet de huidige functionaliteit en HTML layout van mijn site

Gebruik een zwart-grijze kleurencombinatie:

achtergrond: lichtgrijs

tekst: zwart

knoppen: donkergrijs

randen: lichtgrijs

lettertype: Zelf te kiezen (bv Arial)
