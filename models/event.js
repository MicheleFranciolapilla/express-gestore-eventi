// Importazione librerie
const   fileSystem  =   require("fs");
const   path        =   require("path");

// Definizione del database (.json)
const   eventsDB    =   "eventsDB.json";

// Implementazione classe Event
class   Event
{
    // Proprietà private

    #id;
    #title;
    #titleSlug;
    #description;
    #date;
    #maxSeats;

    // Proprietà statiche

    static  someError   =   0;
    static  errors      =   ["Nessun errore", "File inesistente", "Formato file errato"];

    // Costruttore e metodi

    // Per il momento stabiliamo che gli unici attributi indispensabili per la creazione di un nuovo evento siano il titolo, la data ed il numero di posti a sedere
    // L'id lo genereremo automaticamente di modo che sia univoco, mentre la descrizione dell'evento verrà settata in seguito (opzionale)
    constructor(_title, _date, _maxSeats)
    {
        this.title      =   _title;
        this.date       =   _date;
        this.maxSeats   =   _maxSeats;
    }

    // Metodi statici
    static  getAllEvents()
            {
                if (!fileSystem.existsSync(path.resolve("public", eventsDB)))
                {
                    Event.someError = 1;
                    console.log("Errore: ", Event.errors[Event.someError]);
                    return null;
                }
                else
                {
                    const fileContent = fileSystem.readFileSync(path.resolve("public", eventsDB), "utf-8");
                    if (fileContent == "")
                    {
                        Event.someError = 0;
                        console.log("Errore: ", Event.errors[Event.someError]);
                        return [];
                    }
                    else
                    {
                        let jsonFileData = null;
                        try
                        {
                            jsonFileData = JSON.parse(fileContent);
                        }
                        catch(error)
                        {
                            Event.someError = 2;
                            console.log("Errore: ", Event.errors[Event.someError]);
                            return null;
                        }
                        Event.someError = 0;
                        console.log("Errore: ", Event.errors[Event.someError]);
                        return jsonFileData;
                    }
                }
            } 
}

module.exports = Event;